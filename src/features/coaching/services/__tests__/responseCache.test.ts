/**
 * Response Cache Tests
 */

import { ResponseCache, type CacheEntry, type CacheMetadata, type StreamingResponse } from '../responseCache';
import type { AIResponse } from '../../types/conversationTypes';

describe('ResponseCache', () => {
  let cache: ResponseCache;

  beforeEach(() => {
    cache = ResponseCache.getInstance();
    cache.clear(); // Start with clean cache
  });

  afterEach(() => {
    cache.clear();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ResponseCache.getInstance();
      const instance2 = ResponseCache.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('cache operations', () => {
    const mockResponse: AIResponse = {
      content: 'This is a test response about fitness',
      confidence: 0.8,
      suggestions: [],
      followUpQuestions: ['How often do you exercise?'],
      flags: ['actionable'],
      processingTime: 150
    };

    const mockMetadata: CacheMetadata = {
      userId: 'user-123',
      sessionId: 'session-456',
      category: 'fitness',
      confidence: 0.8,
      tokensUsed: 50,
      processingTime: 150
    };

    it('should store and retrieve cached responses', () => {
      const promptHash = 'test-hash-123';
      
      cache.set(promptHash, mockResponse, mockMetadata);
      const retrieved = cache.get(promptHash);

      expect(retrieved).toBeDefined();
      expect(retrieved!.response.content).toBe(mockResponse.content);
      expect(retrieved!.response.confidence).toBe(mockResponse.confidence);
      expect(retrieved!.metadata.userId).toBe(mockMetadata.userId);
    });

    it('should return null for non-existent cache entries', () => {
      const retrieved = cache.get('non-existent-hash');
      expect(retrieved).toBeNull();
    });

    it('should not cache low-confidence responses', () => {
      const lowConfidenceResponse: AIResponse = {
        ...mockResponse,
        confidence: 0.5 // Below default threshold of 0.7
      };

      cache.set('test-hash', lowConfidenceResponse, mockMetadata);
      const retrieved = cache.get('test-hash');

      expect(retrieved).toBeNull();
    });

    it('should update access statistics when retrieving entries', () => {
      const promptHash = 'test-hash-123';
      
      cache.set(promptHash, mockResponse, mockMetadata);
      
      // First access
      const retrieved1 = cache.get(promptHash);
      expect(retrieved1!.accessCount).toBe(1);
      
      // Second access
      const retrieved2 = cache.get(promptHash);
      expect(retrieved2!.accessCount).toBe(2);
      expect(retrieved2!.lastAccessed.getTime()).toBeGreaterThan(retrieved1!.lastAccessed.getTime());
    });

    it('should handle cache expiry', (done) => {
      cache.updateConfig({ defaultTtlMinutes: 0.001 }); // ~0.06 seconds
      
      const promptHash = 'test-hash-123';
      cache.set(promptHash, mockResponse, mockMetadata);
      
      // Should be available immediately
      expect(cache.get(promptHash)).toBeDefined();
      
      // Should be expired after timeout
      setTimeout(() => {
        expect(cache.get(promptHash)).toBeNull();
        done();
      }, 100);
    });

    it('should respect custom TTL', () => {
      const promptHash = 'test-hash-123';
      const customTtlMinutes = 120; // 2 hours
      
      cache.set(promptHash, mockResponse, mockMetadata, customTtlMinutes);
      const retrieved = cache.get(promptHash);
      
      expect(retrieved).toBeDefined();
      
      // Check that expiry time is set correctly (approximately)
      const expectedExpiry = new Date(Date.now() + customTtlMinutes * 60 * 1000);
      const actualExpiry = retrieved!.expiresAt;
      const timeDiff = Math.abs(expectedExpiry.getTime() - actualExpiry.getTime());
      
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should limit cache size and evict LRU entries', () => {
      cache.updateConfig({ maxEntries: 3 });
      
      // Add 4 entries
      for (let i = 0; i < 4; i++) {
        cache.set(`hash-${i}`, mockResponse, { ...mockMetadata, category: `cat-${i}` });
      }
      
      const stats = cache.getStats();
      expect(stats.totalEntries).toBe(3);
      
      // First entry should be evicted (LRU)
      expect(cache.get('hash-0')).toBeNull();
      expect(cache.get('hash-1')).toBeDefined();
      expect(cache.get('hash-2')).toBeDefined();
      expect(cache.get('hash-3')).toBeDefined();
    });
  });

  describe('prompt hash generation', () => {
    it('should generate consistent hashes for identical inputs', () => {
      const messages = [
        { role: 'system', content: 'You are a health coach' },
        { role: 'user', content: 'How can I improve my fitness?' }
      ];
      
      const hash1 = cache.generatePromptHash(messages, 'user-123', ['weather', 'stress']);
      const hash2 = cache.generatePromptHash(messages, 'user-123', ['weather', 'stress']);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const messages1 = [{ role: 'user', content: 'Message 1' }];
      const messages2 = [{ role: 'user', content: 'Message 2' }];
      
      const hash1 = cache.generatePromptHash(messages1);
      const hash2 = cache.generatePromptHash(messages2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different users', () => {
      const messages = [{ role: 'user', content: 'Same message' }];
      
      const hash1 = cache.generatePromptHash(messages, 'user-1');
      const hash2 = cache.generatePromptHash(messages, 'user-2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different context factors', () => {
      const messages = [{ role: 'user', content: 'Same message' }];
      
      const hash1 = cache.generatePromptHash(messages, 'user-123', ['weather']);
      const hash2 = cache.generatePromptHash(messages, 'user-123', ['stress']);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle context factors order independence', () => {
      const messages = [{ role: 'user', content: 'Same message' }];
      
      const hash1 = cache.generatePromptHash(messages, 'user-123', ['weather', 'stress']);
      const hash2 = cache.generatePromptHash(messages, 'user-123', ['stress', 'weather']);
      
      expect(hash1).toBe(hash2); // Order shouldn't matter
    });
  });

  describe('streaming responses', () => {
    it('should create and manage streaming responses', () => {
      const responseId = 'stream-123';
      
      const streamingResponse = cache.startStreaming(responseId);
      
      expect(streamingResponse.id).toBe(responseId);
      expect(streamingResponse.content).toBe('');
      expect(streamingResponse.isComplete).toBe(false);
      expect(streamingResponse.chunks).toEqual([]);
    });

    it('should add chunks to streaming response', () => {
      const responseId = 'stream-123';
      
      cache.startStreaming(responseId);
      
      const updated1 = cache.addStreamChunk(responseId, 'Hello ');
      expect(updated1!.content).toBe('Hello ');
      expect(updated1!.chunks).toHaveLength(1);
      expect(updated1!.chunks[0].content).toBe('Hello ');
      expect(updated1!.chunks[0].index).toBe(0);
      
      const updated2 = cache.addStreamChunk(responseId, 'world!');
      expect(updated2!.content).toBe('Hello world!');
      expect(updated2!.chunks).toHaveLength(2);
      expect(updated2!.chunks[1].content).toBe('world!');
      expect(updated2!.chunks[1].index).toBe(1);
    });

    it('should complete streaming response', () => {
      const responseId = 'stream-123';
      
      cache.startStreaming(responseId);
      cache.addStreamChunk(responseId, 'Complete response');
      
      const completed = cache.completeStreaming(responseId);
      
      expect(completed!.isComplete).toBe(true);
      expect(completed!.content).toBe('Complete response');
    });

    it('should return null for non-existent streaming response', () => {
      const result = cache.addStreamChunk('non-existent', 'chunk');
      expect(result).toBeNull();
      
      const completed = cache.completeStreaming('non-existent');
      expect(completed).toBeNull();
    });

    it('should get streaming response by ID', () => {
      const responseId = 'stream-123';
      
      const original = cache.startStreaming(responseId);
      const retrieved = cache.getStreamingResponse(responseId);
      
      expect(retrieved).toBe(original);
    });

    it('should cancel streaming response', () => {
      const responseId = 'stream-123';
      
      cache.startStreaming(responseId);
      expect(cache.getStreamingResponse(responseId)).toBeDefined();
      
      cache.cancelStreaming(responseId);
      expect(cache.getStreamingResponse(responseId)).toBeNull();
    });

    it('should cache completed streaming responses', () => {
      const responseId = 'stream-123';
      const longContent = 'This is a long streaming response that should be cached automatically when completed.';
      
      cache.startStreaming(responseId);
      cache.addStreamChunk(responseId, longContent);
      cache.completeStreaming(responseId);
      
      // The completed response should be automatically cached
      const stats = cache.getStats();
      expect(stats.totalEntries).toBeGreaterThan(0);
    });
  });

  describe('cache statistics', () => {
    it('should provide accurate cache statistics', () => {
      const mockResponse: AIResponse = {
        content: 'Test response',
        confidence: 0.8,
        suggestions: [],
        followUpQuestions: [],
        flags: [],
        processingTime: 100,
        tokensUsed: 25
      };

      const mockMetadata: CacheMetadata = {
        category: 'fitness',
        confidence: 0.8,
        tokensUsed: 25,
        processingTime: 100
      };

      // Add some cache entries
      cache.set('hash-1', mockResponse, mockMetadata);
      cache.set('hash-2', { ...mockResponse, confidence: 0.9 }, { ...mockMetadata, tokensUsed: 30 });
      
      // Access one entry to increase hit count
      cache.get('hash-1');
      cache.get('hash-1');
      
      // Start a streaming response
      cache.startStreaming('stream-1');
      
      const stats = cache.getStats();
      
      expect(stats.totalEntries).toBe(2);
      expect(stats.averageConfidence).toBe(0.85); // (0.8 + 0.9) / 2
      expect(stats.totalTokensCached).toBe(55); // 25 + 30
      expect(stats.activeStreams).toBe(1);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.cacheSize).toContain('KB');
    });

    it('should handle empty cache statistics', () => {
      const stats = cache.getStats();
      
      expect(stats.totalEntries).toBe(0);
      expect(stats.averageConfidence).toBe(0);
      expect(stats.totalTokensCached).toBe(0);
      expect(stats.activeStreams).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('cache cleanup', () => {
    it('should clean up expired entries', () => {
      cache.updateConfig({ defaultTtlMinutes: 0.001 }); // Very short TTL
      
      const mockResponse: AIResponse = {
        content: 'Test response',
        confidence: 0.8,
        suggestions: [],
        followUpQuestions: [],
        flags: [],
        processingTime: 100
      };

      const mockMetadata: CacheMetadata = {
        category: 'fitness',
        confidence: 0.8,
        tokensUsed: 25,
        processingTime: 100
      };

      cache.set('hash-1', mockResponse, mockMetadata);
      cache.set('hash-2', mockResponse, mockMetadata);
      
      expect(cache.getStats().totalEntries).toBe(2);
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          cache.cleanup();
          expect(cache.getStats().totalEntries).toBe(0);
          resolve();
        }, 100);
      });
    });

    it('should clean up old streaming responses', () => {
      cache.startStreaming('stream-1');
      cache.startStreaming('stream-2');
      
      expect(cache.getStats().activeStreams).toBe(2);
      
      // Manually trigger cleanup (in real scenario, this happens automatically)
      cache.cleanup();
      
      // Since streams are recent, they shouldn't be cleaned up yet
      expect(cache.getStats().activeStreams).toBe(2);
    });
  });

  describe('configuration', () => {
    it('should update cache configuration', () => {
      const newConfig = {
        maxEntries: 500,
        defaultTtlMinutes: 120,
        minConfidenceForCache: 0.8
      };
      
      cache.updateConfig(newConfig);
      const config = cache.getConfig();
      
      expect(config.maxEntries).toBe(500);
      expect(config.defaultTtlMinutes).toBe(120);
      expect(config.minConfidenceForCache).toBe(0.8);
    });

    it('should respect updated confidence threshold', () => {
      cache.updateConfig({ minConfidenceForCache: 0.9 });
      
      const mockResponse: AIResponse = {
        content: 'Test response',
        confidence: 0.8, // Below new threshold
        suggestions: [],
        followUpQuestions: [],
        flags: [],
        processingTime: 100
      };

      const mockMetadata: CacheMetadata = {
        category: 'fitness',
        confidence: 0.8,
        tokensUsed: 25,
        processingTime: 100
      };

      cache.set('hash-1', mockResponse, mockMetadata);
      
      // Should not be cached due to low confidence
      expect(cache.get('hash-1')).toBeNull();
    });
  });

  describe('clear cache', () => {
    it('should clear all cache entries and streaming responses', () => {
      const mockResponse: AIResponse = {
        content: 'Test response',
        confidence: 0.8,
        suggestions: [],
        followUpQuestions: [],
        flags: [],
        processingTime: 100
      };

      const mockMetadata: CacheMetadata = {
        category: 'fitness',
        confidence: 0.8,
        tokensUsed: 25,
        processingTime: 100
      };

      // Add cache entries and streaming responses
      cache.set('hash-1', mockResponse, mockMetadata);
      cache.set('hash-2', mockResponse, mockMetadata);
      cache.startStreaming('stream-1');
      cache.startStreaming('stream-2');
      
      expect(cache.getStats().totalEntries).toBe(2);
      expect(cache.getStats().activeStreams).toBe(2);
      
      cache.clear();
      
      expect(cache.getStats().totalEntries).toBe(0);
      expect(cache.getStats().activeStreams).toBe(0);
    });
  });
});