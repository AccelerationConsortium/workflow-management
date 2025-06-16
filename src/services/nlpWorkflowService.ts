/**
 * NLP Workflow Service
 * 
 * Handles integration between AI-generated workflows and the Canvas system
 * Includes fallback to local mock server when backend is unavailable
 */

import { mockNLPServer } from './mockNLPServer';

export interface WorkflowGenerationRequest {
  text: string;
  language?: string;
  model_type?: string;
  include_suggestions?: boolean;
  optimize_layout?: boolean;
  register_custom_uos?: boolean;
}

export interface WorkflowGenerationResponse {
  success: boolean;
  workflow_json?: any;
  suggestions?: any[];
  metadata?: any;
  error?: string;
  processing_time?: number;
}

class NLPWorkflowService {
  private apiBaseUrl: string;
  private useMockFallback: boolean = true;

  constructor() {
    // Default to local AI agent server
    this.apiBaseUrl = 'http://localhost:8001';
  }

  /**
   * Generate workflow from natural language description
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    // First try the real AI agent server
    try {
      console.log('Attempting to connect to AI agent server...');
      
      const response = await fetch(`${this.apiBaseUrl}/generate-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          language: request.language || 'en',
          model_type: request.model_type || 'mock',
          include_suggestions: request.include_suggestions ?? true,
          optimize_layout: request.optimize_layout ?? true,
          register_custom_uos: request.register_custom_uos ?? false
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Successfully connected to AI agent server');
      return result;

    } catch (error) {
      console.warn('AI agent server not available, using mock fallback:', error);
      
      // Fallback to mock server
      if (this.useMockFallback) {
        return this.generateMockWorkflow(request);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate workflow using local mock server
   */
  private async generateMockWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    try {
      console.log('Using mock NLP server for workflow generation');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const result = mockNLPServer.generateWorkflow(request.text);
      
      console.log('Mock workflow generated successfully');
      return result;
      
    } catch (error) {
      console.error('Mock workflow generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock generation failed'
      };
    }
  }

  /**
   * Validate workflow JSON structure
   */
  validateWorkflowStructure(workflowJson: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required top-level properties
    if (!workflowJson.metadata) {
      errors.push('Missing metadata');
    }

    if (!workflowJson.workflow) {
      errors.push('Missing workflow');
    }

    if (workflowJson.workflow) {
      if (!workflowJson.workflow.nodes || !Array.isArray(workflowJson.workflow.nodes)) {
        errors.push('Missing or invalid workflow nodes');
      }

      if (!workflowJson.workflow.edges || !Array.isArray(workflowJson.workflow.edges)) {
        errors.push('Missing or invalid workflow edges');
      }

      // Validate nodes
      if (workflowJson.workflow.nodes) {
        workflowJson.workflow.nodes.forEach((node: any, index: number) => {
          if (!node.id) {
            errors.push(`Node ${index} missing id`);
          }
          if (!node.type) {
            errors.push(`Node ${index} missing type`);
          }
          if (!node.position) {
            errors.push(`Node ${index} missing position`);
          }
          if (!node.data) {
            errors.push(`Node ${index} missing data`);
          }
        });
      }

      // Validate edges
      if (workflowJson.workflow.edges) {
        workflowJson.workflow.edges.forEach((edge: any, index: number) => {
          if (!edge.id) {
            errors.push(`Edge ${index} missing id`);
          }
          if (!edge.source) {
            errors.push(`Edge ${index} missing source`);
          }
          if (!edge.target) {
            errors.push(`Edge ${index} missing target`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Extract custom UOs from workflow for registration
   */
  extractCustomUOs(workflowResponse: WorkflowGenerationResponse): any[] {
    if (!workflowResponse.success || !workflowResponse.metadata?.custom_uo_schemas) {
      return [];
    }

    return workflowResponse.metadata.custom_uo_schemas;
  }

  /**
   * Get execution summary from generated workflow
   */
  getExecutionSummary(workflowJson: any): {
    totalSteps: number;
    estimatedDuration: number;
    requiredDevices: string[];
    operationTypes: string[];
  } {
    const execution = workflowJson.execution || {};
    const nodes = workflowJson.workflow?.nodes || [];
    
    const operationNodes = nodes.filter((node: any) => node.type === 'operationNode');
    const operationTypes = operationNodes.map((node: any) => node.data?.nodeType).filter(Boolean);

    return {
      totalSteps: execution.total_steps || operationNodes.length,
      estimatedDuration: execution.estimated_duration || 0,
      requiredDevices: execution.required_devices || [],
      operationTypes: [...new Set(operationTypes)]
    };
  }

  /**
   * Check if AI agent service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });

      return response.ok;
    } catch (error) {
      console.warn('AI agent service not available:', error);
      return false;
    }
  }

  /**
   * Get available UO templates from AI agent
   */
  async getAvailableTemplates(): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/templates`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      return { templates: {}, categories: {}, total_count: 0 };
    }
  }

  /**
   * Configure the AI agent API endpoint
   */
  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }

  /**
   * Enable or disable mock fallback
   */
  setMockFallback(enabled: boolean): void {
    this.useMockFallback = enabled;
  }

  /**
   * Get current configuration
   */
  getConfig(): { apiBaseUrl: string; useMockFallback: boolean } {
    return {
      apiBaseUrl: this.apiBaseUrl,
      useMockFallback: this.useMockFallback
    };
  }
}

// Export singleton instance
export const nlpWorkflowService = new NLPWorkflowService();