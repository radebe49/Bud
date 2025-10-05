/**
 * GROQ API Client
 * Handles communication with GROQ API for GPT model integration
 */

import { API_CONFIG } from '../../../shared/utils/constants';
import type { ConversationContext, ChatMessage, AIResponse } from '../types/conversationTypes';

export interface GroqApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface GroqChatRequest {
  messages: GroqMessage[];
  model: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  stop?: string[];
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GroqChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface GroqStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
}

export class GroqApiClient {
  private static instance: GroqApiClient;
  private config: GroqApiConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();

  private constructor() {
    this.config = {
      apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
      baseUrl: API_CONFIG.GROQ_API_URL,
      model: 'llama-3.1-70b-versatile', // Default model for health coaching
      maxTokens: 1000,
      temperature: 0.7,
      timeout: API_CONFIG.TIMEOUT,
      retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: 1000
    };

    if (!this.config.apiKey) {
      console.warn('GROQ API key not found. AI features will be limited.');
    }
  }

  public static getInstance(): GroqApiClient {
    if (!GroqApiClient.instance) {
      GroqApiClient.instance = new GroqApiClient();
    }
    return GroqApiClient.instance;
  }

  /**
   * Send a chat completion request to GROQ API
   */
  public async chatCompletion(
    messages: GroqMessage[],
    options: Partial<GroqApiConfig> = {}
  ): Promise<GroqChatResponse> {
    const requestConfig = { ...this.config, ...options };
    
    if (!requestConfig.apiKey) {
      throw new Error('GROQ API key is required');
    }

    const requestBody: GroqChatRequest = {
      messages,
      model: requestConfig.model,
      max_tokens: requestConfig.maxTokens,
      temperature: requestConfig.temperature,
      stream: false
    };

    const requestId = this.generateRequestId(requestBody);
    
    // Check if identical request is already in progress
    if (this.requestQueue.has(requestId)) {
      return this.requestQueue.get(requestId)!;
    }

    const requestPromise = this.executeWithRetry(
      () => this.makeRequest('/chat/completions', requestBody, requestConfig),
      requestConfig.retryAttempts,
      requestConfig.retryDelay
    );

    this.requestQueue.set(requestId, requestPromise);

    try {
      const response = await requestPromise;
      return response;
    } finally {
      this.requestQueue.delete(requestId);
    }
  }

  /**
   * Send a streaming chat completion request
   */
  public async chatCompletionStream(
    messages: GroqMessage[],
    onChunk: (chunk: GroqStreamChunk) => void,
    options: Partial<GroqApiConfig> = {}
  ): Promise<void> {
    const requestConfig = { ...this.config, ...options };
    
    if (!requestConfig.apiKey) {
      throw new Error('GROQ API key is required');
    }

    const requestBody: GroqChatRequest = {
      messages,
      model: requestConfig.model,
      max_tokens: requestConfig.maxTokens,
      temperature: requestConfig.temperature,
      stream: true
    };

    await this.executeWithRetry(
      () => this.makeStreamingRequest('/chat/completions', requestBody, requestConfig, onChunk),
      requestConfig.retryAttempts,
      requestConfig.retryDelay
    );
  }

  /**
   * Make HTTP request to GROQ API
   */
  private async makeRequest(
    endpoint: string,
    body: any,
    config: GroqApiConfig
  ): Promise<any> {
    const url = `${config.baseUrl}${endpoint}`;
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BudHealthCoach/1.0'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GroqApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      // Log performance metrics
      console.log(`GROQ API request completed in ${processingTime}ms`);

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GroqApiError('Request timeout', 408);
      }
      
      throw error;
    }
  }

  /**
   * Make streaming HTTP request to GROQ API
   */
  private async makeStreamingRequest(
    endpoint: string,
    body: any,
    config: GroqApiConfig,
    onChunk: (chunk: GroqStreamChunk) => void
  ): Promise<void> {
    const url = `${config.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'User-Agent': 'BudHealthCoach/1.0'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GroqApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const chunk: GroqStreamChunk = JSON.parse(data);
              onChunk(chunk);
            } catch (error) {
              console.warn('Failed to parse streaming chunk:', error);
            }
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GroqApiError('Request timeout', 408);
      }
      
      throw error;
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number,
    delay: number
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof GroqApiError) {
          if (error.status === 401 || error.status === 403 || error.status === 400) {
            throw error;
          }
        }

        if (attempt === maxAttempts) {
          break;
        }

        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await this.sleep(backoffDelay);
        
        console.log(`GROQ API retry attempt ${attempt}/${maxAttempts} after ${backoffDelay}ms`);
      }
    }

    throw lastError!;
  }

  /**
   * Generate unique request ID for deduplication
   */
  private generateRequestId(request: GroqChatRequest): string {
    const content = JSON.stringify({
      messages: request.messages,
      model: request.model,
      temperature: request.temperature
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString();
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<GroqApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): GroqApiConfig {
    return { ...this.config };
  }

  /**
   * Check if API is configured
   */
  public isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Clear request queue (useful for testing)
   */
  public clearRequestQueue(): void {
    this.requestQueue.clear();
  }
}

/**
 * Custom error class for GROQ API errors
 */
export class GroqApiError extends Error {
  public readonly status?: number;
  public readonly data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'GroqApiError';
    this.status = status;
    this.data = data;
  }
}