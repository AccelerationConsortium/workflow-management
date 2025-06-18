/**
 * LLM Service Manager
 * 
 * Central service for managing LLM interactions with fallback strategies,
 * configuration management, and integration with the workflow system
 */

import { BaseLLMClient, LLMConfig, LLMMessage, LLMResponse, LLMError, createLLMClient } from './LLMClient';

export interface LLMServiceConfig {
  primary: LLMConfig;
  fallbacks?: LLMConfig[];
  enableFallback?: boolean;
  logResponses?: boolean;
  cacheResponses?: boolean;
}

export interface WorkflowGenerationRequest {
  userInput: string;
  context?: {
    availableOperations?: string[];
    currentWorkflow?: any;
    userPreferences?: any;
  };
  options?: {
    includeExplanation?: boolean;
    validateParameters?: boolean;
    optimizeForSafety?: boolean;
  };
}

export interface WorkflowGenerationResponse {
  workflow: any;
  explanation?: string;
  confidence: number;
  warnings?: string[];
  suggestions?: string[];
  processingTime: number;
}

export class LLMService {
  private primaryClient: BaseLLMClient | null = null;
  private fallbackClients: BaseLLMClient[] = [];
  private config: LLMServiceConfig;
  private responseCache: Map<string, LLMResponse>;
  private initialized: boolean = false;

  constructor(config: LLMServiceConfig) {
    this.config = {
      enableFallback: true,
      logResponses: false,
      cacheResponses: false,
      ...config
    };

    this.responseCache = new Map();
    this.initialize();
  }

  /**
   * Initialize LLM clients asynchronously
   */
  private async initialize(): Promise<void> {
    try {
      this.primaryClient = await createLLMClient(this.config.primary);

      if (this.config.fallbacks) {
        this.fallbackClients = await Promise.all(
          this.config.fallbacks.map(config => createLLMClient(config))
        );
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize LLM clients:', error);
      // Create mock client as fallback
      const { MockLLMClient } = await import('./MockLLMClient');
      this.primaryClient = new MockLLMClient({ provider: 'mock' });
      this.initialized = true;
    }
  }

  /**
   * Ensure service is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Generate workflow from natural language input
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.buildWorkflowSystemPrompt(request.context);
      const userPrompt = this.buildWorkflowUserPrompt(request);
      
      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const parsed = this.parseWorkflowResponse(response.content);
      const processingTime = Date.now() - startTime;

      return {
        workflow: parsed.workflow,
        explanation: parsed.explanation,
        confidence: this.calculateConfidence(response),
        warnings: parsed.warnings,
        suggestions: parsed.suggestions,
        processingTime
      };

    } catch (error) {
      console.error('Workflow generation failed:', error);
      
      // Return fallback workflow
      return {
        workflow: this.getFallbackWorkflow(request.userInput),
        explanation: 'Generated using fallback template due to LLM service unavailability.',
        confidence: 0.3,
        warnings: ['LLM service unavailable, using basic template'],
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze and optimize workflow parameters
   */
  async analyzeParameters(workflow: any, userFeedback?: string): Promise<{
    optimizedWorkflow: any;
    analysis: string;
    recommendations: string[];
  }> {
    const systemPrompt = `You are an expert in laboratory automation and workflow optimization. 
    Analyze the provided workflow for parameter optimization, safety considerations, and efficiency improvements.
    
    Focus on:
    - Parameter validation and optimization
    - Safety constraints and requirements
    - Resource utilization efficiency
    - Potential error conditions
    
    Provide specific, actionable recommendations.`;

    const userPrompt = `Please analyze this workflow and provide optimization recommendations:

Workflow:
${JSON.stringify(workflow, null, 2)}

${userFeedback ? `User Feedback: ${userFeedback}` : ''}

Please provide:
1. Optimized workflow with improved parameters
2. Analysis of current configuration
3. Specific recommendations for improvement`;

    try {
      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const parsed = this.parseParameterAnalysis(response.content);
      
      return {
        optimizedWorkflow: parsed.optimizedWorkflow || workflow,
        analysis: parsed.analysis,
        recommendations: parsed.recommendations
      };

    } catch (error) {
      console.error('Parameter analysis failed:', error);
      
      return {
        optimizedWorkflow: workflow,
        analysis: 'Parameter analysis unavailable due to service error.',
        recommendations: ['Verify all parameters are within safe operating ranges']
      };
    }
  }

  /**
   * Chat interface with fallback support
   */
  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    await this.ensureInitialized();

    const cacheKey = this.getCacheKey(messages);

    // Check cache first
    if (this.config.cacheResponses && this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey)!;
    }

    let lastError: Error | null = null;

    // Try primary client
    if (this.primaryClient) {
      try {
        const response = await this.primaryClient.chat(messages);

        if (this.config.cacheResponses) {
          this.responseCache.set(cacheKey, response);
        }

        if (this.config.logResponses) {
          console.log('LLM Response:', response);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn('Primary LLM client failed:', error);
      }
    }

    // Try fallback clients if enabled
    if (this.config.enableFallback && this.fallbackClients.length > 0) {
      for (const fallbackClient of this.fallbackClients) {
        try {
          const response = await fallbackClient.chat(messages);

          if (this.config.cacheResponses) {
            this.responseCache.set(cacheKey, response);
          }

          console.log('Used fallback LLM client successfully');
          return response;
        } catch (error) {
          console.warn('Fallback LLM client failed:', error);
          lastError = error as Error;
        }
      }
    }

    throw lastError || new Error('All LLM clients failed');
  }

  /**
   * Test connection to LLM services
   */
  async testConnection(): Promise<{
    primary: boolean;
    fallbacks: boolean[];
    overall: boolean;
  }> {
    await this.ensureInitialized();

    const primaryTest = this.primaryClient
      ? await this.primaryClient.testConnection().catch(() => false)
      : false;

    const fallbackTests = await Promise.all(
      this.fallbackClients.map(client => client.testConnection().catch(() => false))
    );

    return {
      primary: primaryTest,
      fallbacks: fallbackTests,
      overall: primaryTest || fallbackTests.some(test => test)
    };
  }

  /**
   * Get service status and configuration
   */
  getStatus(): {
    primaryProvider: string;
    fallbackProviders: string[];
    cacheSize: number;
    configuration: LLMServiceConfig;
  } {
    return {
      primaryProvider: this.config.primary.provider,
      fallbackProviders: (this.config.fallbacks || []).map(f => f.provider),
      cacheSize: this.responseCache.size,
      configuration: this.config
    };
  }

  /**
   * Clear response cache
   */
  clearCache(): void {
    this.responseCache.clear();
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<LLMServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };

    if (updates.primary) {
      this.primaryClient = await createLLMClient(updates.primary);
    }

    if (updates.fallbacks) {
      this.fallbackClients = await Promise.all(
        updates.fallbacks.map(config => createLLMClient(config))
      );
    }
  }

  // Private helper methods
  private buildWorkflowSystemPrompt(context?: any): string {
    return `You are an expert laboratory automation assistant. Your role is to convert natural language descriptions of experimental procedures into structured, executable workflows.

Key Responsibilities:
- Generate safe, efficient laboratory workflows
- Validate parameter ranges and compatibility
- Ensure proper operation sequencing
- Include safety considerations and error handling

Available Operations: ${context?.availableOperations?.join(', ') || 'Standard laboratory operations'}

Output Format: Provide a JSON workflow structure with clear operation definitions and parameters.

Safety First: Always prioritize safety and include appropriate warnings for hazardous operations.`;
  }

  private buildWorkflowUserPrompt(request: WorkflowGenerationRequest): string {
    let prompt = `Please generate a laboratory workflow for the following request:\n\n${request.userInput}`;
    
    if (request.options?.includeExplanation) {
      prompt += '\n\nPlease include a detailed explanation of the workflow logic.';
    }
    
    if (request.options?.validateParameters) {
      prompt += '\n\nValidate all parameters and suggest optimal values.';
    }
    
    if (request.options?.optimizeForSafety) {
      prompt += '\n\nPrioritize safety and include all necessary precautions.';
    }
    
    return prompt;
  }

  private parseWorkflowResponse(content: string): {
    workflow: any;
    explanation?: string;
    warnings?: string[];
    suggestions?: string[];
  } {
    // Extract JSON workflow from response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    
    let workflow = {};
    if (jsonMatch) {
      try {
        workflow = JSON.parse(jsonMatch[1]);
      } catch (error) {
        console.error('Failed to parse workflow JSON:', error);
      }
    }

    // Extract explanation and other sections
    const explanation = this.extractSection(content, 'explanation') || 
                       this.extractSection(content, 'analysis') ||
                       content.split('```')[0].trim();

    const warnings = this.extractListSection(content, 'warning');
    const suggestions = this.extractListSection(content, 'recommendation') ||
                       this.extractListSection(content, 'suggestion');

    return { workflow, explanation, warnings, suggestions };
  }

  private parseParameterAnalysis(content: string): {
    optimizedWorkflow?: any;
    analysis: string;
    recommendations: string[];
  } {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    let optimizedWorkflow;
    
    if (jsonMatch) {
      try {
        optimizedWorkflow = JSON.parse(jsonMatch[1]);
      } catch (error) {
        console.error('Failed to parse optimized workflow:', error);
      }
    }

    const analysis = this.extractSection(content, 'analysis') || content;
    const recommendations = this.extractListSection(content, 'recommendation') || [];

    return { optimizedWorkflow, analysis, recommendations };
  }

  private extractSection(content: string, sectionName: string): string | null {
    const regex = new RegExp(`\\*\\*${sectionName}[^:]*:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractListSection(content: string, sectionName: string): string[] {
    const section = this.extractSection(content, sectionName);
    if (!section) return [];
    
    return section
      .split('\n')
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  private calculateConfidence(response: LLMResponse): number {
    // Simple confidence calculation based on response characteristics
    let confidence = 0.7; // Base confidence
    
    if (response.content.includes('```json')) confidence += 0.2;
    if (response.content.length > 200) confidence += 0.1;
    if (response.finishReason === 'stop') confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private getFallbackWorkflow(userInput: string): any {
    // Simple fallback workflow template
    return {
      operations: [
        {
          type: 'user_confirmation',
          parameters: {
            message: `Please manually configure workflow for: ${userInput}`,
            required: true
          }
        }
      ],
      metadata: {
        generated: 'fallback',
        userInput: userInput,
        timestamp: new Date().toISOString()
      }
    };
  }

  private getCacheKey(messages: LLMMessage[]): string {
    return btoa(JSON.stringify(messages)).slice(0, 32);
  }
}
