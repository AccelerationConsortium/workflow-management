import { TypedEmitter } from 'tiny-typed-emitter';

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;  // milliseconds
  maxDelay: number;      // milliseconds
  backoffFactor: number; // exponential backoff multiplier
  retryableErrors: string[];  // error types that should be retried
}

interface RetryEvents {
  'retry': (attempt: number, error: Error, delay: number) => void;
  'maxRetriesExceeded': (error: Error, attempts: number) => void;
  'success': (attempt: number) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'NETWORK_ERROR',
    'FLOW_DEPLOYMENT_ERROR'
  ]
};

export class RetryHandler extends TypedEmitter<RetryEvents> {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
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
        
        if (!this.shouldRetry(error, attempt)) {
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

  private shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.config.maxAttempts) {
      return false;
    }

    if (error instanceof Error) {
      return this.config.retryableErrors.some(errorType =>
        error.message.includes(errorType)
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
