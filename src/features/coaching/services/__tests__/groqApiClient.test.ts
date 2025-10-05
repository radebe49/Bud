/**
 * GROQ API Client Tests
 */

import { GroqApiClient, GroqApiError, type GroqMessage } from '../groqApiClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('GroqApiClient', () => {
  let client: GroqApiClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = GroqApiClient.getInstance();
    mockFetch.mockClear();
    client.clearRequestQueue();
    
    // Mock environment variable
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = GroqApiClient.getInstance();
      const instance2 = GroqApiClient.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('chatCompletion', () => {
    const mockMessages: GroqMessage[] = [
      { role: 'system', content: 'You are a health coach' },
      { role: 'user', content: 'How can I improve my fitness?' }
    ];

    it('should make successful API request', async () => {
      const mockResponse = {
        id: 'test-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'llama-3.1-70b-versatile',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Here are some fitness tips...'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 20,
          completion_tokens: 50,
          total_tokens: 70
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await client.chatCompletion(mockMessages);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat/completions'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('llama-3.1-70b-versatile')
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid request' })
      } as Response);

      await expect(client.chatCompletion(mockMessages)).rejects.toThrow(GroqApiError);
    });

    it('should retry on transient errors', async () => {
      // First call fails with 500
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' })
      } as Response);

      // Second call succeeds
      const mockResponse = {
        id: 'test-id',
        choices: [{ index: 0, message: { role: 'assistant', content: 'Success' }, finish_reason: 'stop' }],
        usage: { total_tokens: 10 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await client.chatCompletion(mockMessages);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it('should not retry on authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid API key' })
      } as Response);

      await expect(client.chatCompletion(mockMessages)).rejects.toThrow(GroqApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ choices: [] })
          } as Response), 15000); // Longer than timeout
        })
      );

      await expect(client.chatCompletion(mockMessages, { timeout: 1000 })).rejects.toThrow();
    });

    it('should deduplicate identical requests', async () => {
      const mockResponse = {
        id: 'test-id',
        choices: [{ index: 0, message: { role: 'assistant', content: 'Response' }, finish_reason: 'stop' }],
        usage: { total_tokens: 10 }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // Make two identical requests simultaneously
      const [result1, result2] = await Promise.all([
        client.chatCompletion(mockMessages),
        client.chatCompletion(mockMessages)
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(1); // Only one actual API call
      expect(result1).toEqual(result2);
    });
  });

  describe('chatCompletionStream', () => {
    const mockMessages: GroqMessage[] = [
      { role: 'user', content: 'Tell me about fitness' }
    ];

    it('should handle streaming response', async () => {
      const mockStreamData = [
        'data: {"id":"test","choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"id":"test","choices":[{"delta":{"content":" world"}}]}\n\n',
        'data: [DONE]\n\n'
      ];

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockStreamData[0]) })
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockStreamData[1]) })
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockStreamData[2]) })
          .mockResolvedValueOnce({ done: true, value: undefined })
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader }
      } as any);

      const chunks: any[] = [];
      const onChunk = jest.fn((chunk) => chunks.push(chunk));

      await client.chatCompletionStream(mockMessages, onChunk);

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(chunks[0].choices[0].delta.content).toBe('Hello');
      expect(chunks[1].choices[0].delta.content).toBe(' world');
    });

    it('should handle streaming errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' })
      } as Response);

      const onChunk = jest.fn();
      await expect(client.chatCompletionStream(mockMessages, onChunk)).rejects.toThrow(GroqApiError);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = { maxTokens: 2000, temperature: 0.5 };
      client.updateConfig(newConfig);
      
      const config = client.getConfig();
      expect(config.maxTokens).toBe(2000);
      expect(config.temperature).toBe(0.5);
    });

    it('should check if configured', () => {
      expect(client.isConfigured()).toBe(true);
      
      // Test without API key
      process.env.EXPO_PUBLIC_GROQ_API_KEY = '';
      const newClient = new (GroqApiClient as any)();
      expect(newClient.isConfigured()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should create GroqApiError with status and data', () => {
      const error = new GroqApiError('Test error', 400, { details: 'Bad request' });
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.data).toEqual({ details: 'Bad request' });
      expect(error.name).toBe('GroqApiError');
    });
  });
});