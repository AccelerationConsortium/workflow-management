/**
 * NLP Workflow Service
 *
 * Handles integration between AI-generated workflows and the Canvas system
 * Now uses real LLM integration with fallback strategies
 */

import { mockNLPServer } from './mockNLPServer';
import { LLMService, WorkflowGenerationRequest as LLMWorkflowRequest } from './llm/LLMService';
import { getLLMServiceConfig, validateLLMConfig } from '../config/llm';

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
  private llmService: LLMService | null = null;
  private llmEnabled: boolean = false;

  constructor() {
    // Default to local AI agent server
    this.apiBaseUrl = 'http://localhost:8001';
    // Initialize LLM service asynchronously
    this.initializeLLMService().catch(error => {
      console.error('LLM service initialization failed:', error);
    });
  }

  /**
   * Initialize LLM service with configuration validation
   */
  private async initializeLLMService(): Promise<void> {
    try {
      const config = getLLMServiceConfig();
      const validation = validateLLMConfig(config);

      if (!validation.valid) {
        console.warn('LLM configuration invalid:', validation.errors);
        this.llmEnabled = false;
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('LLM configuration warnings:', validation.warnings);
      }

      this.llmService = new LLMService(config);

      // Test connection
      const connectionTest = await this.llmService.testConnection();
      this.llmEnabled = connectionTest.overall;

      if (this.llmEnabled) {
        console.log('✅ LLM service initialized successfully');
        console.log('Primary provider:', connectionTest.primary ? 'Connected' : 'Failed');
        console.log('Fallback providers:', connectionTest.fallbacks.map((f, i) => `${i}: ${f ? 'Connected' : 'Failed'}`));
      } else {
        console.warn('⚠️ LLM service initialization failed, will use mock fallback');
      }

    } catch (error) {
      console.error('Failed to initialize LLM service:', error);
      this.llmEnabled = false;
    }
  }

  /**
   * Generate workflow from natural language description
   * Now uses LLM service with multiple fallback strategies
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    const startTime = Date.now();

    // Strategy 1: Try LLM service (Qwen/OpenAI/Claude)
    if (this.llmEnabled && this.llmService) {
      try {
        console.log('🧠 Using LLM service for workflow generation...');

        const llmRequest: LLMWorkflowRequest = {
          userInput: request.text,
          context: {
            availableOperations: this.getAvailableOperationTypes(),
            currentWorkflow: null,
            userPreferences: {
              language: request.language || 'en',
              includeSuggestions: request.include_suggestions ?? true,
              optimizeLayout: request.optimize_layout ?? true
            }
          },
          options: {
            includeExplanation: true,
            validateParameters: true,
            optimizeForSafety: true
          }
        };

        const llmResponse = await this.llmService.generateWorkflow(llmRequest);

        // Convert LLM response to our format
        const workflowResponse = this.convertLLMResponseToWorkflow(llmResponse, request);

        console.log('✅ LLM workflow generation successful');
        return {
          ...workflowResponse,
          processing_time: Date.now() - startTime
        };

      } catch (error) {
        console.warn('LLM service failed, trying backend server:', error);
      }
    }

    // Strategy 2: Try backend AI agent server
    try {
      console.log('🔄 Attempting to connect to AI agent server...');

      const response = await fetch(`${this.apiBaseUrl}/generate-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          language: request.language || 'en',
          model_type: request.model_type || 'qwen',
          include_suggestions: request.include_suggestions ?? true,
          optimize_layout: request.optimize_layout ?? true,
          register_custom_uos: request.register_custom_uos ?? false
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Successfully connected to AI agent server');
      return {
        ...result,
        processing_time: Date.now() - startTime
      };

    } catch (error) {
      console.warn('AI agent server not available, using mock fallback:', error);
    }

    // Strategy 3: Fallback to mock server
    if (this.useMockFallback) {
      return this.generateMockWorkflow(request, startTime);
    }

    return {
      success: false,
      error: 'All workflow generation methods failed',
      processing_time: Date.now() - startTime
    };
  }

  /**
   * Convert LLM response to workflow format
   */
  private convertLLMResponseToWorkflow(llmResponse: any, originalRequest: WorkflowGenerationRequest): WorkflowGenerationResponse {
    try {
      // Extract workflow from LLM response
      let workflowData = llmResponse.workflow;

      // If workflow is not in expected format, try to parse it
      if (!workflowData || !workflowData.nodes) {
        // Try to extract from explanation or create basic structure
        workflowData = this.createBasicWorkflowFromText(originalRequest.text);
      }

      // Ensure proper structure
      const workflow = {
        nodes: workflowData.nodes || [],
        edges: workflowData.edges || [],
        viewport: { x: 0, y: 0, zoom: 1 }
      };

      return {
        success: true,
        workflow_json: {
          metadata: {
            generated_by: 'llm_service',
            confidence: llmResponse.confidence || 0.8,
            explanation: llmResponse.explanation,
            warnings: llmResponse.warnings || [],
            suggestions: llmResponse.suggestions || [],
            timestamp: new Date().toISOString(),
            user_input: originalRequest.text
          },
          workflow: workflow,
          execution: {
            total_steps: workflow.nodes.length,
            estimated_duration: this.estimateWorkflowDuration(workflow.nodes),
            required_devices: this.extractRequiredDevices(workflow.nodes),
            safety_level: 'standard'
          }
        },
        suggestions: llmResponse.suggestions || [],
        metadata: {
          llm_provider: 'qwen',
          confidence: llmResponse.confidence || 0.8,
          processing_time: llmResponse.processingTime || 0
        }
      };

    } catch (error) {
      console.error('Error converting LLM response:', error);
      return {
        success: false,
        error: `Failed to convert LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get available operation types for LLM context
   */
  private getAvailableOperationTypes(): string[] {
    return [
      'add_liquid', 'heat', 'stir', 'wait', 'measure_temperature',
      'cv_test', 'lsv', 'ca_test', 'eis', 'prepare_solution',
      'robot_move_to', 'robot_pick', 'robot_place', 'robot_home',
      'user_confirmation', 'data_analysis', 'safety_check'
    ];
  }

  /**
   * Create basic workflow structure from text
   */
  private createBasicWorkflowFromText(text: string): any {
    const lowerText = text.toLowerCase();
    const nodes = [];
    const edges = [];

    let nodeId = 1;
    let yPosition = 100;

    // Simple keyword-based node generation
    if (lowerText.includes('add') || lowerText.includes('liquid')) {
      nodes.push({
        id: `node_${nodeId++}`,
        type: 'operationNode',
        position: { x: 100, y: yPosition },
        data: { nodeType: 'add_liquid', label: 'Add Liquid' }
      });
      yPosition += 150;
    }

    if (lowerText.includes('heat') || lowerText.includes('temperature')) {
      nodes.push({
        id: `node_${nodeId++}`,
        type: 'operationNode',
        position: { x: 100, y: yPosition },
        data: { nodeType: 'heat', label: 'Heat Sample' }
      });
      yPosition += 150;
    }

    if (lowerText.includes('stir') || lowerText.includes('mix')) {
      nodes.push({
        id: `node_${nodeId++}`,
        type: 'operationNode',
        position: { x: 100, y: yPosition },
        data: { nodeType: 'stir', label: 'Stir Solution' }
      });
      yPosition += 150;
    }

    if (lowerText.includes('measure') || lowerText.includes('cv') || lowerText.includes('voltammetry')) {
      nodes.push({
        id: `node_${nodeId++}`,
        type: 'operationNode',
        position: { x: 100, y: yPosition },
        data: { nodeType: 'cv_test', label: 'CV Measurement' }
      });
      yPosition += 150;
    }

    // Create edges between consecutive nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge_${i + 1}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'smoothstep'
      });
    }

    return { nodes, edges };
  }

  /**
   * Estimate workflow duration based on operations
   */
  private estimateWorkflowDuration(nodes: any[]): number {
    const durations: { [key: string]: number } = {
      'add_liquid': 30,
      'heat': 300,
      'stir': 120,
      'cv_test': 180,
      'lsv': 120,
      'wait': 60,
      'robot_move_to': 10,
      'robot_pick': 15,
      'robot_place': 15
    };

    return nodes.reduce((total, node) => {
      const nodeType = node.data?.nodeType || 'unknown';
      return total + (durations[nodeType] || 60);
    }, 0);
  }

  /**
   * Extract required devices from workflow nodes
   */
  private extractRequiredDevices(nodes: any[]): string[] {
    const deviceMap: { [key: string]: string } = {
      'add_liquid': 'Liquid Handler',
      'heat': 'Heating Block',
      'stir': 'Magnetic Stirrer',
      'cv_test': 'Potentiostat',
      'lsv': 'Potentiostat',
      'ca_test': 'Potentiostat',
      'eis': 'Potentiostat',
      'robot_move_to': 'Robotic Arm',
      'robot_pick': 'Robotic Arm',
      'robot_place': 'Robotic Arm'
    };

    const devices = new Set<string>();
    nodes.forEach(node => {
      const nodeType = node.data?.nodeType;
      if (nodeType && deviceMap[nodeType]) {
        devices.add(deviceMap[nodeType]);
      }
    });

    return Array.from(devices);
  }

  /**
   * Generate workflow using local mock server
   */
  private async generateMockWorkflow(request: WorkflowGenerationRequest, startTime?: number): Promise<WorkflowGenerationResponse> {
    try {
      console.log('📝 Using mock NLP server for workflow generation');

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const result = mockNLPServer.generateWorkflow(request.text);

      console.log('✅ Mock workflow generated successfully');
      return {
        ...result,
        processing_time: startTime ? Date.now() - startTime : undefined
      };

    } catch (error) {
      console.error('Mock workflow generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock generation failed',
        processing_time: startTime ? Date.now() - startTime : undefined
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
   * Check comprehensive service health
   */
  async checkServiceHealth(): Promise<{
    llmService: boolean;
    backendService: boolean;
    mockFallback: boolean;
    overall: boolean;
    details: any;
  }> {
    const results = {
      llmService: false,
      backendService: false,
      mockFallback: true, // Mock is always available
      overall: false,
      details: {}
    };

    // Check LLM service
    if (this.llmService) {
      try {
        const llmHealth = await this.llmService.testConnection();
        results.llmService = llmHealth.overall;
        results.details.llm = llmHealth;
      } catch (error) {
        results.details.llmError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Check backend AI agent service
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      results.backendService = response.ok;
      if (response.ok) {
        results.details.backend = await response.json().catch(() => ({ status: 'ok' }));
      }
    } catch (error) {
      results.details.backendError = error instanceof Error ? error.message : 'Connection failed';
    }

    results.overall = results.llmService || results.backendService || results.mockFallback;
    return results;
  }

  /**
   * Get LLM service status
   */
  getLLMStatus(): {
    enabled: boolean;
    service: any;
    configuration: any;
  } {
    return {
      enabled: this.llmEnabled,
      service: this.llmService ? this.llmService.getStatus() : null,
      configuration: this.llmService ? this.llmService.getStatus().configuration : null
    };
  }

  /**
   * Reinitialize LLM service (useful for configuration updates)
   */
  async reinitializeLLM(): Promise<boolean> {
    try {
      await this.initializeLLMService();
      return this.llmEnabled;
    } catch (error) {
      console.error('Failed to reinitialize LLM service:', error);
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
  getConfig(): {
    apiBaseUrl: string;
    useMockFallback: boolean;
    llmEnabled: boolean;
    llmStatus: any;
  } {
    return {
      apiBaseUrl: this.apiBaseUrl,
      useMockFallback: this.useMockFallback,
      llmEnabled: this.llmEnabled,
      llmStatus: this.getLLMStatus()
    };
  }
}

// Export singleton instance
export const nlpWorkflowService = new NLPWorkflowService();