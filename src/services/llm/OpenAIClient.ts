/**
 * OpenAI LLM Client Implementation
 * 
 * Integrates with OpenAI API (GPT-3.5, GPT-4)
 * Provides fallback option for Qwen
 */

import { BaseLLMClient, LLMMessage, LLMResponse, LLMError, LLMConfig } from './LLMClient';

export class OpenAIClient extends BaseLLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: LLMConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-3.5-turbo';
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();
    
    return this.withRetry(async () => {
      const requestBody = {
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      };

      const response = await this.withTimeout(
        fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        throw new LLMError({
          code: `HTTP_${response.status}`,
          message: `OpenAI API error: ${response.status} ${response.statusText}`,
          details: errorData,
          retryable: response.status >= 500 || response.status === 429
        });
      }

      const data = await response.json();
      
      if (data.error) {
        throw new LLMError({
          code: data.error.code || 'OPENAI_ERROR',
          message: data.error.message || 'OpenAI API error',
          details: data.error,
          retryable: this.isRetryableError(data.error.code)
        });
      }

      if (!data.choices || data.choices.length === 0) {
        throw new LLMError({
          code: 'NO_CHOICES',
          message: 'No response choices returned from OpenAI API',
          details: data,
          retryable: false
        });
      }

      const choice = data.choices[0];
      const content = choice.message?.content || '';
      
      if (!content) {
        throw new LLMError({
          code: 'EMPTY_CONTENT',
          message: 'Empty content returned from OpenAI API',
          details: data,
          retryable: false
        });
      }

      const processingTime = Date.now() - startTime;

      return {
        content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0
        } : undefined,
        model: data.model,
        finishReason: choice.finish_reason,
        processingTime
      };
    });
  }

  private isRetryableError(code: string): boolean {
    const retryableCodes = [
      'rate_limit_exceeded',
      'server_error',
      'timeout',
      'service_unavailable'
    ];
    
    return retryableCodes.includes(code);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.complete('Hello', 'You are a helpful assistant. Respond with just "OK".');
      return response.trim().toLowerCase().includes('ok');
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get model info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get OpenAI model info:', error);
      return null;
    }
  }
}
