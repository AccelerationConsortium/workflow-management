/**
 * LLM Client Abstraction Layer
 * 
 * Provides a unified interface for different LLM providers (Qwen, OpenAI, Claude)
 * with retry logic, timeout handling, and fallback strategies
 */

export interface LLMConfig {
  provider: 'qwen' | 'openai' | 'claude' | 'mock';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
  processingTime?: number;
}

export interface LLMError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

export abstract class BaseLLMClient {
  protected config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.3,
      maxTokens: 2000,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  abstract chat(messages: LLMMessage[]): Promise<LLMResponse>;
  
  /**
   * Simple text completion interface
   */
  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: LLMMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });
    
    const response = await this.chat(messages);
    return response.content;
  }

  /**
   * Retry logic wrapper
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    attempts: number = this.config.retryAttempts || 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on non-retryable errors
        if (error instanceof LLMError && !error.retryable) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (i === attempts - 1) {
          break;
        }
        
        // Wait before retrying
        await this.delay(this.config.retryDelay! * (i + 1));
      }
    }
    
    throw lastError!;
  }

  /**
   * Timeout wrapper
   */
  protected async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number = this.config.timeout || 30000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new LLMError({
          code: 'TIMEOUT',
          message: `Operation timed out after ${timeoutMs}ms`,
          retryable: true
        }));
      }, timeoutMs);
    });

    return Promise.race([operation, timeoutPromise]);
  }

  /**
   * Delay utility
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate response format
   */
  protected validateResponse(response: any): void {
    if (!response || typeof response.content !== 'string') {
      throw new LLMError({
        code: 'INVALID_RESPONSE',
        message: 'Invalid response format from LLM provider',
        details: response,
        retryable: false
      });
    }
  }

  /**
   * Get configuration
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

/**
 * Custom LLM Error class
 */
export class LLMError extends Error {
  public code: string;
  public details?: any;
  public retryable: boolean;

  constructor(error: { code: string; message: string; details?: any; retryable: boolean }) {
    super(error.message);
    this.name = 'LLMError';
    this.code = error.code;
    this.details = error.details;
    this.retryable = error.retryable;
  }
}

/**
 * Factory function to create LLM clients
 * Note: Imports are done dynamically to avoid circular dependencies
 */
export async function createLLMClient(config: LLMConfig): Promise<BaseLLMClient> {
  switch (config.provider) {
    case 'qwen': {
      const { QwenClient } = await import('./QwenClient');
      return new QwenClient(config);
    }
    case 'openai': {
      const { OpenAIClient } = await import('./OpenAIClient');
      return new OpenAIClient(config);
    }
    case 'claude': {
      const { ClaudeClient } = await import('./ClaudeClient');
      return new ClaudeClient(config);
    }
    case 'mock': {
      const { MockLLMClient } = await import('./MockLLMClient');
      return new MockLLMClient(config);
    }
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
