/**
 * Qwen LLM Client Implementation
 * 
 * Integrates with Qwen API for real LLM responses
 * Supports both official Qwen API and compatible endpoints
 */

import { BaseLLMClient, LLMMessage, LLMResponse, LLMError, LLMConfig } from './LLMClient';

export class QwenClient extends BaseLLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: LLMConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new Error('Qwen API key is required');
    }
    
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://dashscope.aliyuncs.com/api/v1';
    this.model = config.model || 'qwen-72b-chat';
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();
    
    return this.withRetry(async () => {
      const requestBody = {
        model: this.model,
        input: {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        },
        parameters: {
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: 0.8,
          repetition_penalty: 1.1,
          result_format: 'message'
        }
      };

      const response = await this.withTimeout(
        fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-SSE': 'disable'
          },
          body: JSON.stringify(requestBody)
        })
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        throw new LLMError({
          code: `HTTP_${response.status}`,
          message: `Qwen API error: ${response.status} ${response.statusText}`,
          details: errorData,
          retryable: response.status >= 500 || response.status === 429
        });
      }

      const data = await response.json();
      
      if (data.code && data.code !== '200') {
        throw new LLMError({
          code: data.code,
          message: data.message || 'Qwen API error',
          details: data,
          retryable: this.isRetryableError(data.code)
        });
      }

      if (!data.output || !data.output.choices || data.output.choices.length === 0) {
        throw new LLMError({
          code: 'NO_CHOICES',
          message: 'No response choices returned from Qwen API',
          details: data,
          retryable: false
        });
      }

      const choice = data.output.choices[0];
      const content = choice.message?.content || '';
      
      if (!content) {
        throw new LLMError({
          code: 'EMPTY_CONTENT',
          message: 'Empty content returned from Qwen API',
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
          totalTokens: data.usage.total_tokens || 0
        } : undefined,
        model: this.model,
        finishReason: choice.finish_reason,
        processingTime
      };
    });
  }

  /**
   * Check if error code is retryable
   */
  private isRetryableError(code: string): boolean {
    const retryableCodes = [
      'Throttling.RateQuota',
      'Throttling.AllocationQuota', 
      'InternalError.Timeout',
      'ServiceUnavailable',
      'InternalError'
    ];
    
    return retryableCodes.includes(code);
  }

  /**
   * Test connection to Qwen API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.complete('Hello', 'You are a helpful assistant. Respond with just "OK".');
      return response.trim().toLowerCase().includes('ok');
    } catch (error) {
      console.error('Qwen connection test failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/models`, {
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
      console.error('Failed to get Qwen model info:', error);
      return null;
    }
  }

  /**
   * Estimate token count (approximate)
   */
  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for Chinese/English mixed text
    // This is an approximation, actual tokenization may differ
    return Math.ceil(text.length / 3.5);
  }

  /**
   * Check if request would exceed token limits
   */
  validateTokenLimits(messages: LLMMessage[]): { valid: boolean; estimatedTokens: number; maxTokens: number } {
    const totalText = messages.map(m => m.content).join(' ');
    const estimatedTokens = this.estimateTokens(totalText);
    const maxInputTokens = 6000; // Conservative limit for Qwen-72B
    
    return {
      valid: estimatedTokens <= maxInputTokens,
      estimatedTokens,
      maxTokens: maxInputTokens
    };
  }

  /**
   * Truncate messages if they exceed token limits
   */
  truncateMessages(messages: LLMMessage[], maxTokens: number = 6000): LLMMessage[] {
    const systemMessages = messages.filter(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role === 'user');
    
    // Always keep system messages
    let result = [...systemMessages];
    let currentTokens = this.estimateTokens(systemMessages.map(m => m.content).join(' '));
    
    // Add user messages from most recent, staying within limits
    for (let i = userMessages.length - 1; i >= 0; i--) {
      const messageTokens = this.estimateTokens(userMessages[i].content);
      
      if (currentTokens + messageTokens <= maxTokens) {
        result.push(userMessages[i]);
        currentTokens += messageTokens;
      } else {
        break;
      }
    }
    
    return result;
  }
}
