/**
 * Response Cache System
 * Handles caching and streaming of AI responses for improved performance
 */

import type { AIResponse, ChatMessage } from '../types/conversationTypes';
import type { GroqChatResponse } from './groqApiClient';

export interface CacheEntry {
  id: string;
  promptHash: string;
  response: AIResponse;
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
  expiresAt: Date;
  metadata: CacheMetadata;
}

export interface CacheMetadata {
  userId?: string;
  sessionId?: string;
  category: string;
  confidence: number;
  tokensUsed: number;
  processingTime: number;
}

export interface CacheConfig {
  maxEntries: number;
  defaultTtlMinutes: number;
  maxTtlMinutes: number;
  minConfidenceForCache: number;
  enablePersistence: boolean;
  compressionEnabled: boolean;
}

export interface StreamingResponse {
  id: string;
  content: string;
  isComplete: boolean;
  chunks: StreamChunk[];
  startTime: Date;
  lastUpdate: Date;
}

export interface StreamChunk {
  content: string;
  timestamp: Date;
  index: number;
}

export class ResponseCache {
  private static instance: ResponseCache;
  private cache: Map<string, CacheEntry> = new Map();
  private streamingResponses: Map<string, StreamingResponse> = new Map();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    this.config = {
      maxEntries: 1000,
      defaultTtlMinutes: 60, // 1 hour
      maxTtlMinutes: 24 * 60, // 24 hours
      minConfidenceForCache: 0.7,
      enablePersistence: true,
      compressionEnabled: true
    };

    // Clean up expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  public static getInstance(): ResponseCache {
    if (!ResponseCache.instance) {
      ResponseCache.instance = new ResponseCache();
    }
    return ResponseCache.instance;
  }

  /**
   * Get cached response if available
   */
  public get(promptHash: string): CacheEntry | null {
    const entry = this.cache.get(promptHash);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(promptHash);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = new Date();

    return entry;
  }

  /**
   * Store response in cache
   */
  public set(
    promptHash: string,
    response: AIResponse,
    metadata: CacheMetadata,
    customTtlMinutes?: number
  ): void {
    // Don't cache low-confidence responses
    if (response.confidence < this.config.minConfidenceForCache) {
      return;
    }

    const ttlMinutes = Math.min(
      customTtlMinutes || this.config.defaultTtlMinutes,
      this.config.maxTtlMinutes
    );

    const entry: CacheEntry = {
      id: this.generateId(),
      promptHash,
      response,
      timestamp: new Date(),
      accessCount: 0,
      lastAccessed: new Date(),
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      metadata
    };

    // Ensure cache doesn't exceed max size
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(promptHash, entry);
  }

  /**
   * Generate hash for prompt caching
   */
  public generatePromptHash(
    messages: any[],
    userId?: string,
    contextFactors?: string[]
  ): string {
    const content = {
      messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
      userId: userId || 'anonymous',
      factors: contextFactors?.sort() || []
    };

    return this.hashString(JSON.stringify(content));
  }

  /**
   * Start streaming response
   */
  public startStreaming(responseId: string): StreamingResponse {
    const streamingResponse: StreamingResponse = {
      id: responseId,
      content: '',
      isComplete: false,
      chunks: [],
      startTime: new Date(),
      lastUpdate: new Date()
    };

    this.streamingResponses.set(responseId, streamingResponse);
    return streamingResponse;
  }

  /**
   * Add chunk to streaming response
   */
  public addStreamChunk(responseId: string, content: string): StreamingResponse | null {
    const response = this.streamingResponses.get(responseId);
    if (!response) {
      return null;
    }

    const chunk: StreamChunk = {
      content,
      timestamp: new Date(),
      index: response.chunks.length
    };

    response.chunks.push(chunk);
    response.content += content;
    response.lastUpdate = new Date();

    return response;
  }

  /**
   * Complete streaming response
   */
  public completeStreaming(responseId: string): StreamingResponse | null {
    const response = this.streamingResponses.get(responseId);
    if (!response) {
      return null;
    }

    response.isComplete = true;
    response.lastUpdate = new Date();

    // Cache the completed response if it meets criteria
    if (response.content.length > 50) {
      const aiResponse: AIResponse = {
        content: response.content,
        confidence: 0.8, // Default confidence for streaming responses
        suggestions: [],
        followUpQuestions: [],
        flags: [],
        processingTime: response.lastUpdate.getTime() - response.startTime.getTime()
      };

      const metadata: CacheMetadata = {
        category: 'streaming',
        confidence: 0.8,
        tokensUsed: Math.ceil(response.content.length / 4), // Rough estimate
        processingTime: aiResponse.processingTime
      };

      // Generate a hash for the streaming response
      const hash = this.hashString(response.content);
      this.set(hash, aiResponse, metadata);
    }

    return response;
  }

  /**
   * Get streaming response
   */
  public getStreamingResponse(responseId: string): StreamingResponse | null {
    return this.streamingResponses.get(responseId) || null;
  }

  /**
   * Cancel streaming response
   */
  public cancelStreaming(responseId: string): void {
    this.streamingResponses.delete(responseId);
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    totalEntries: number;
    hitRate: number;
    averageConfidence: number;
    totalTokensCached: number;
    activeStreams: number;
    cacheSize: string;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalRequests = totalHits + entries.length; // Rough estimate
    
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    const averageConfidence = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.response.confidence, 0) / entries.length 
      : 0;
    
    const totalTokens = entries.reduce((sum, entry) => sum + (entry.metadata.tokensUsed || 0), 0);
    
    // Estimate cache size in KB
    const estimatedSize = entries.reduce((sum, entry) => {
      return sum + JSON.stringify(entry).length;
    }, 0) / 1024;

    return {
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      totalTokensCached: totalTokens,
      activeStreams: this.streamingResponses.size,
      cacheSize: `${Math.round(estimatedSize * 100) / 100} KB`
    };
  }

  /**
   * Clear cache
   */
  public clear(): void {
    this.cache.clear();
    this.streamingResponses.clear();
  }

  /**
   * Clear expired entries
   */
  public cleanup(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    // Clean up old streaming responses (older than 1 hour)
    const streamingExpiry = new Date(now.getTime() - 60 * 60 * 1000);
    const expiredStreams: string[] = [];

    for (const [id, response] of this.streamingResponses.entries()) {
      if (response.lastUpdate < streamingExpiry) {
        expiredStreams.push(id);
      }
    }

    for (const id of expiredStreams) {
      this.streamingResponses.delete(id);
    }

    if (expiredKeys.length > 0 || expiredStreams.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries and ${expiredStreams.length} old streams`);
    }
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
    
    // Remove oldest 10% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get configuration
   */
  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Destroy instance (cleanup)
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

/**
 * Response streaming utilities
 */
export class StreamingUtils {
  /**
   * Create a readable stream from streaming response
   */
  public static createReadableStream(
    cache: ResponseCache,
    responseId: string
  ): ReadableStream<string> {
    return new ReadableStream({
      start(controller) {
        const response = cache.getStreamingResponse(responseId);
        if (!response) {
          controller.error(new Error('Streaming response not found'));
          return;
        }

        // Send existing chunks
        for (const chunk of response.chunks) {
          controller.enqueue(chunk.content);
        }

        // If complete, close the stream
        if (response.isComplete) {
          controller.close();
        }
      },

      pull(controller) {
        const response = cache.getStreamingResponse(responseId);
        if (!response) {
          controller.close();
          return;
        }

        if (response.isComplete) {
          controller.close();
        }
      },

      cancel() {
        cache.cancelStreaming(responseId);
      }
    });
  }

  /**
   * Convert streaming response to promise
   */
  public static async streamToPromise(
    cache: ResponseCache,
    responseId: string,
    timeoutMs: number = 30000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Streaming timeout'));
      }, timeoutMs);

      const checkCompletion = () => {
        const response = cache.getStreamingResponse(responseId);
        
        if (!response) {
          clearTimeout(timeout);
          reject(new Error('Streaming response not found'));
          return;
        }

        if (response.isComplete) {
          clearTimeout(timeout);
          resolve(response.content);
          return;
        }

        // Check again in 100ms
        setTimeout(checkCompletion, 100);
      };

      checkCompletion();
    });
  }
}