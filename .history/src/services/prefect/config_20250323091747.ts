/**
 * Prefect Server Configuration
 */
export interface PrefectConfig {
  apiUrl: string;
  apiKey?: string;
  workspaceId?: string;
  defaultTags?: string[];
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
  };
}

/**
 * Default Prefect configuration
 * Update these values based on your Prefect server setup
 */
export const DEFAULT_PREFECT_CONFIG: PrefectConfig = {
  apiUrl: process.env.PREFECT_API_URL || 'http://localhost:4200/api',
  apiKey: process.env.PREFECT_API_KEY,
  workspaceId: process.env.PREFECT_WORKSPACE_ID || 'default',
  defaultTags: ['workflow-management'],
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
  },
};

/**
 * Get Prefect configuration
 * @param overrides Optional configuration overrides
 * @returns Merged configuration
 */
export function getPrefectConfig(overrides?: Partial<PrefectConfig>): PrefectConfig {
  return {
    ...DEFAULT_PREFECT_CONFIG,
    ...overrides,
  };
} 
