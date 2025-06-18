/**
 * LLM Configuration
 * 
 * Environment-based configuration for LLM services
 * Supports multiple providers with fallback strategies
 */

import { LLMServiceConfig } from '../services/llm/LLMService';

// Environment variables for LLM configuration
const LLM_CONFIG = {
  // Primary provider (Qwen)
  QWEN_API_KEY: import.meta.env.VITE_QWEN_API_KEY || '',
  QWEN_BASE_URL: import.meta.env.VITE_QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1',
  QWEN_MODEL: import.meta.env.VITE_QWEN_MODEL || 'qwen-72b-chat',
  
  // Fallback providers
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
  
  CLAUDE_API_KEY: import.meta.env.VITE_CLAUDE_API_KEY || '',
  CLAUDE_MODEL: import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-sonnet-20240229',
  
  // Service configuration
  ENABLE_FALLBACK: import.meta.env.VITE_LLM_ENABLE_FALLBACK !== 'false',
  ENABLE_CACHE: import.meta.env.VITE_LLM_ENABLE_CACHE !== 'false',
  ENABLE_LOGGING: import.meta.env.VITE_LLM_ENABLE_LOGGING === 'true',
  
  // Performance settings
  TEMPERATURE: parseFloat(import.meta.env.VITE_LLM_TEMPERATURE || '0.3'),
  MAX_TOKENS: parseInt(import.meta.env.VITE_LLM_MAX_TOKENS || '2000'),
  TIMEOUT: parseInt(import.meta.env.VITE_LLM_TIMEOUT || '30000'),
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_LLM_RETRY_ATTEMPTS || '3'),
};

/**
 * Get LLM service configuration based on environment
 * Priority: OpenAI > Qwen > Claude > Mock
 */
export function getLLMServiceConfig(): LLMServiceConfig {
  const config: LLMServiceConfig = {
    primary: {
      provider: 'mock', // Default fallback
      temperature: LLM_CONFIG.TEMPERATURE,
      maxTokens: LLM_CONFIG.MAX_TOKENS,
      timeout: 5000,
      retryAttempts: 1
    },
    fallbacks: [],
    enableFallback: LLM_CONFIG.ENABLE_FALLBACK,
    logResponses: LLM_CONFIG.ENABLE_LOGGING,
    cacheResponses: LLM_CONFIG.ENABLE_CACHE
  };

  // Priority 1: OpenAI (if API key available)
  if (LLM_CONFIG.OPENAI_API_KEY) {
    config.primary = {
      provider: 'openai',
      apiKey: LLM_CONFIG.OPENAI_API_KEY,
      model: LLM_CONFIG.OPENAI_MODEL,
      temperature: LLM_CONFIG.TEMPERATURE,
      maxTokens: LLM_CONFIG.MAX_TOKENS,
      timeout: LLM_CONFIG.TIMEOUT,
      retryAttempts: LLM_CONFIG.RETRY_ATTEMPTS
    };
    console.log('✅ Using OpenAI as primary LLM provider');
  }
  // Priority 2: Qwen (if OpenAI not available but Qwen is)
  else if (LLM_CONFIG.QWEN_API_KEY) {
    config.primary = {
      provider: 'qwen',
      apiKey: LLM_CONFIG.QWEN_API_KEY,
      baseUrl: LLM_CONFIG.QWEN_BASE_URL,
      model: LLM_CONFIG.QWEN_MODEL,
      temperature: LLM_CONFIG.TEMPERATURE,
      maxTokens: LLM_CONFIG.MAX_TOKENS,
      timeout: LLM_CONFIG.TIMEOUT,
      retryAttempts: LLM_CONFIG.RETRY_ATTEMPTS
    };
    console.log('✅ Using Qwen as primary LLM provider');
  }
  // Priority 3: Claude (if neither OpenAI nor Qwen available)
  else if (LLM_CONFIG.CLAUDE_API_KEY) {
    config.primary = {
      provider: 'claude',
      apiKey: LLM_CONFIG.CLAUDE_API_KEY,
      model: LLM_CONFIG.CLAUDE_MODEL,
      temperature: LLM_CONFIG.TEMPERATURE,
      maxTokens: LLM_CONFIG.MAX_TOKENS,
      timeout: LLM_CONFIG.TIMEOUT,
      retryAttempts: LLM_CONFIG.RETRY_ATTEMPTS
    };
    console.log('✅ Using Claude as primary LLM provider');
  }
  // Fallback: Mock (if no API keys available)
  else {
    console.warn('⚠️ No LLM API keys found, using mock as primary provider');
  }

  // Add fallback providers if enabled
  if (LLM_CONFIG.ENABLE_FALLBACK) {
    // Add other providers as fallbacks (excluding the primary)
    const primaryProvider = config.primary.provider;

    if (primaryProvider !== 'openai' && LLM_CONFIG.OPENAI_API_KEY) {
      config.fallbacks!.push({
        provider: 'openai',
        apiKey: LLM_CONFIG.OPENAI_API_KEY,
        model: LLM_CONFIG.OPENAI_MODEL,
        temperature: LLM_CONFIG.TEMPERATURE,
        maxTokens: LLM_CONFIG.MAX_TOKENS,
        timeout: LLM_CONFIG.TIMEOUT,
        retryAttempts: LLM_CONFIG.RETRY_ATTEMPTS
      });
    }

    if (primaryProvider !== 'qwen' && LLM_CONFIG.QWEN_API_KEY) {
      config.fallbacks!.push({
        provider: 'qwen',
        apiKey: LLM_CONFIG.QWEN_API_KEY,
        baseUrl: LLM_CONFIG.QWEN_BASE_URL,
        model: LLM_CONFIG.QWEN_MODEL,
        temperature: LLM_CONFIG.TEMPERATURE,
        maxTokens: LLM_CONFIG.MAX_TOKENS,
        timeout: LLM_CONFIG.TIMEOUT,
        retryAttempts: LLM_CONFIG.RETRY_ATTEMPTS
      });
    }

    if (primaryProvider !== 'claude' && LLM_CONFIG.CLAUDE_API_KEY) {
      config.fallbacks!.push({
        provider: 'claude',
        apiKey: LLM_CONFIG.CLAUDE_API_KEY,
        model: LLM_CONFIG.CLAUDE_MODEL,
        temperature: LLM_CONFIG.TEMPERATURE,
        maxTokens: LLM_CONFIG.MAX_TOKENS,
        timeout: LLM_CONFIG.TIMEOUT,
        retryAttempts: LLM_CONFIG.RETRY_ATTEMPTS
      });
    }

    // Always include mock as final fallback (if not already primary)
    if (primaryProvider !== 'mock') {
      config.fallbacks!.push({
        provider: 'mock',
        temperature: LLM_CONFIG.TEMPERATURE,
        maxTokens: LLM_CONFIG.MAX_TOKENS,
        timeout: 5000, // Shorter timeout for mock
        retryAttempts: 1
      });
    }
  }

  return config;
}

/**
 * Get development configuration (always uses mock)
 */
export function getDevelopmentLLMConfig(): LLMServiceConfig {
  return {
    primary: {
      provider: 'mock',
      temperature: 0.3,
      maxTokens: 2000,
      timeout: 2000,
      retryAttempts: 1
    },
    fallbacks: [],
    enableFallback: false,
    logResponses: true,
    cacheResponses: false
  };
}

/**
 * Validate LLM configuration
 */
export function validateLLMConfig(config: LLMServiceConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check primary configuration
  if (!config.primary) {
    errors.push('Primary LLM configuration is required');
  } else {
    if (!config.primary.provider) {
      errors.push('Primary LLM provider is required');
    }

    if (config.primary.provider !== 'mock' && !config.primary.apiKey) {
      errors.push(`API key is required for ${config.primary.provider} provider`);
    }

    if (config.primary.temperature && (config.primary.temperature < 0 || config.primary.temperature > 2)) {
      warnings.push('Temperature should be between 0 and 2');
    }

    if (config.primary.maxTokens && config.primary.maxTokens > 4096) {
      warnings.push('Max tokens exceeds recommended limit for most models');
    }
  }

  // Check fallback configurations
  if (config.enableFallback && (!config.fallbacks || config.fallbacks.length === 0)) {
    warnings.push('Fallback is enabled but no fallback providers configured');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get configuration summary for debugging
 */
export function getConfigSummary(): {
  primaryProvider: string;
  fallbackProviders: string[];
  hasApiKeys: {
    qwen: boolean;
    openai: boolean;
    claude: boolean;
  };
  settings: {
    temperature: number;
    maxTokens: number;
    timeout: number;
    enableFallback: boolean;
    enableCache: boolean;
    enableLogging: boolean;
  };
} {
  return {
    primaryProvider: LLM_CONFIG.QWEN_API_KEY ? 'qwen' : 'mock',
    fallbackProviders: [
      ...(LLM_CONFIG.OPENAI_API_KEY ? ['openai'] : []),
      ...(LLM_CONFIG.CLAUDE_API_KEY ? ['claude'] : []),
      'mock'
    ],
    hasApiKeys: {
      qwen: !!LLM_CONFIG.QWEN_API_KEY,
      openai: !!LLM_CONFIG.OPENAI_API_KEY,
      claude: !!LLM_CONFIG.CLAUDE_API_KEY
    },
    settings: {
      temperature: LLM_CONFIG.TEMPERATURE,
      maxTokens: LLM_CONFIG.MAX_TOKENS,
      timeout: LLM_CONFIG.TIMEOUT,
      enableFallback: LLM_CONFIG.ENABLE_FALLBACK,
      enableCache: LLM_CONFIG.ENABLE_CACHE,
      enableLogging: LLM_CONFIG.ENABLE_LOGGING
    }
  };
}

/**
 * Environment configuration template for .env file
 */
export const ENV_TEMPLATE = `# LLM Configuration
# Primary provider (Qwen) - Free tier available
VITE_QWEN_API_KEY=your_qwen_api_key_here
VITE_QWEN_BASE_URL=https://dashscope.aliyuncs.com/api/v1
VITE_QWEN_MODEL=qwen-72b-chat

# Fallback providers (optional)
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-3.5-turbo

VITE_CLAUDE_API_KEY=your_claude_api_key_here
VITE_CLAUDE_MODEL=claude-3-sonnet-20240229

# Service settings
VITE_LLM_ENABLE_FALLBACK=true
VITE_LLM_ENABLE_CACHE=true
VITE_LLM_ENABLE_LOGGING=false

# Performance settings
VITE_LLM_TEMPERATURE=0.3
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TIMEOUT=30000
VITE_LLM_RETRY_ATTEMPTS=3`;

export default {
  getLLMServiceConfig,
  getDevelopmentLLMConfig,
  validateLLMConfig,
  getConfigSummary,
  ENV_TEMPLATE
};
