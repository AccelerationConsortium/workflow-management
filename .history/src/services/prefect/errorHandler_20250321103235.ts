import { TypedEmitter } from 'tiny-typed-emitter';

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;  // milliseconds
  maxDelay: number;      // milliseconds
  backoffFactor: number; // exponential backoff multiplier
  retryableErrors: string[];  // error types that should be retried
}

export interface RetryEvents {
  'retry': (attempt: number, error: Error, delay: number) => void;
  'maxRetriesExceeded': (error: Error, attempts: number) => void;
  'success': (attempt: number) => void;
}

export class RetryHandler extends TypedEmitter<RetryEvents> {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    super();
    this.config = {
      maxAttempts: config.maxAttempts ?? 3,
      initialDelay: config.initialDelay ?? 1000,
      maxDelay: config.maxDelay ?? 30000,
      backoffFactor: config.backoffFactor ?? 2,
      retryableErrors: config.retryableErrors ?? [
        'NetworkError',
        'TimeoutError',
        'ConnectionError',
        'ServiceUnavailableError'
      ]
    };
  }

  public async withRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let attempt = 1;
    let lastError: Error;

    while (attempt <= this.config.maxAttempts) {
      try {
        const result = await operation();
        this.emit('success', attempt);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (!this.isRetryable(error)) {
          throw new Error(
            `Non-retryable error in ${context}: ${error.message}`
          );
        }

        if (attempt === this.config.maxAttempts) {
          this.emit('maxRetriesExceeded', error as Error, attempt);
          throw new Error(
            `Max retries (${this.config.maxAttempts}) exceeded for ${context}: ${error.message}`
          );
        }

        const delay = this.calculateDelay(attempt);
        this.emit('retry', attempt, error as Error, delay);
        
        await this.sleep(delay);
        attempt++;
      }
    }

    throw lastError!;
  }

  private isRetryable(error: any): boolean {
    if (!error) return false;

    // Check if error type is in retryable list
    const errorType = error.constructor.name;
    if (this.config.retryableErrors.includes(errorType)) {
      return true;
    }

    // Check if error is a network error
    if (error.code && [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND'
    ].includes(error.code)) {
      return true;
    }

    // Check HTTP status codes
    if (error.response && error.response.status) {
      const status = error.response.status;
      return (
        status === 408 || // Request Timeout
        status === 429 || // Too Many Requests
        status >= 500    // Server Errors
      );
    }

    return false;
  }

  private calculateDelay(attempt: number): number {
    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt - 1),
      this.config.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    return delay * (0.75 + Math.random() * 0.5);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 
