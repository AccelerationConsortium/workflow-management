/**
 * Claude LLM Client Implementation
 * 
 * Integrates with Anthropic Claude API
 * Provides additional fallback option
 */

import { BaseLLMClient, LLMMessage, LLMResponse, LLMError, LLMConfig } from './LLMClient';

export class ClaudeClient extends BaseLLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: LLMConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('Claude API key is required');
    }
    
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
    this.model = config.model || 'claude-3-sonnet-20240229';
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();
    
    return this.withRetry(async () => {
      // Convert messages to Claude format
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');
      
      const requestBody: any = {
        model: this.model,
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature,
        messages: conversationMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      };

      if (systemMessage) {
        requestBody.system = systemMessage.content;
      }

      const response = await this.withTimeout(
        fetch(`${this.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(requestBody)
        })
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        throw new LLMError({
          code: `HTTP_${response.status}`,
          message: `Claude API error: ${response.status} ${response.statusText}`,
          details: errorData,
          retryable: response.status >= 500 || response.status === 429
        });
      }

      const data = await response.json();
      
      if (data.error) {
        throw new LLMError({
          code: data.error.type || 'CLAUDE_ERROR',
          message: data.error.message || 'Claude API error',
          details: data.error,
          retryable: this.isRetryableError(data.error.type)
        });
      }

      if (!data.content || data.content.length === 0) {
        throw new LLMError({
          code: 'NO_CONTENT',
          message: 'No content returned from Claude API',
          details: data,
          retryable: false
        });
      }

      const content = data.content[0]?.text || '';
      
      if (!content) {
        throw new LLMError({
          code: 'EMPTY_CONTENT',
          message: 'Empty content returned from Claude API',
          details: data,
          retryable: false
        });
      }

      const processingTime = Date.now() - startTime;

      return {
        content,
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens || 0,
          completionTokens: data.usage.output_tokens || 0,
          totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
        } : undefined,
        model: data.model,
        finishReason: data.stop_reason,
        processingTime
      };
    });
  }

  private isRetryableError(type: string): boolean {
    const retryableTypes = [
      'rate_limit_error',
      'api_error',
      'overloaded_error'
    ];
    
    return retryableTypes.includes(type);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.complete('Hello', 'You are a helpful assistant. Respond with just "OK".');
      return response.trim().toLowerCase().includes('ok');
    } catch (error) {
      console.error('Claude connection test failed:', error);
      return false;
    }
  }

  async getModelInfo(): Promise<any> {
    // Claude doesn't have a models endpoint, return static info
    return {
      model: this.model,
      provider: 'anthropic',
      capabilities: ['text-generation', 'analysis', 'reasoning'],
      maxTokens: 200000, // Claude 3 context window
      languages: ['en', 'zh', 'es', 'fr', 'de', 'ja'],
      version: '3.0'
    };
  }
}
