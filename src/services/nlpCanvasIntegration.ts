/**
 * NLP Canvas Integration Service
 * 
 * Handles loading NLP-generated workflows into the Canvas
 * Compatible with existing JSON import functionality
 */

import { operationNodes } from '../data/operationNodes';

export interface CanvasIntegrationProps {
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
  operationNodes?: any[];
}

class NLPCanvasIntegration {
  /**
   * Load NLP-generated workflow into Canvas
   * Uses the same logic as handleLoadWorkflow in App.tsx
   */
  loadWorkflowToCanvas(
    workflowJson: any, 
    setNodes: (nodes: any) => void,
    setEdges: (edges: any) => void,
    availableOperationNodes: any[] = operationNodes
  ): boolean {
    try {
      console.log('Loading NLP-generated workflow to Canvas:', workflowJson);
      
      if (!workflowJson || !workflowJson.workflow) {
        throw new Error('Invalid workflow format: missing workflow property');
      }

      const { workflow, metadata } = workflowJson;

      if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
        throw new Error('Invalid workflow format: missing or invalid nodes array');
      }

      if (!workflow.edges || !Array.isArray(workflow.edges)) {
        throw new Error('Invalid workflow format: missing or invalid edges array');
      }

      // Extract and transform nodes for ReactFlow
      const loadedNodes = workflow.nodes.map((node: any) => {
        // Handle different node formats (NLP vs existing)
        const nodeData = node.data || {};
        
        // For NLP-generated nodes, the actual operation type might be in data.nodeType
        const actualNodeType = nodeData.nodeType || node.type;
        
        // Find the node definition from operationNodes using the actual node type
        const nodeDefinition = availableOperationNodes.find(n => n.type === actualNodeType);
        
        // Log warning if node definition not found
        if (!nodeDefinition) {
          console.warn(`No node definition found for type: ${actualNodeType}. Creating minimal node structure.`);
        }
        
        // Use provided position or create one if missing
        const position = node.position || {
          x: Math.random() * 500,
          y: Math.random() * 300
        };

        const nodeLabel = nodeData.label || node.label || node.name || actualNodeType;
        const nodeParams = nodeData.parameters || node.params || {};

        return {
          id: node.id,
          type: this.mapNodeType(actualNodeType, nodeDefinition),
          position,
          data: {
            // Spread nodeDefinition only if it exists
            ...(nodeDefinition || {
              label: nodeLabel,
              category: 'general',
              parameters: [],
              inputs: [],
              outputs: []
            }),
            id: node.id,
            label: nodeLabel,
            params: this.transformParameters(nodeParams),
            workflowId: metadata?.id,
            // Preserve NLP-specific data
            nodeType: actualNodeType,
            category: nodeData.category || nodeDefinition?.category || 'general',
            description: nodeData.description || node.description || `${actualNodeType} operation`,
            // Ensure parameters array exists for BaseNode compatibility
            parameters: nodeDefinition?.parameters || []
          },
          // Preserve styling if provided
          style: node.style || nodeDefinition?.style || {}
        };
      });

      // Extract and transform edges for ReactFlow
      const loadedEdges = workflow.edges.map((edge: any) => {
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || 'output',
          targetHandle: edge.targetHandle || 'input',
          type: edge.type || 'smoothstep',
          data: edge.data || {},
          label: edge.label || '',
          animated: edge.animated || false,
          style: edge.style || { stroke: '#666', strokeWidth: 2 }
        };
      });

      console.log('Transformed nodes for Canvas:', loadedNodes);
      console.log('Transformed edges for Canvas:', loadedEdges);

      // Update the canvas with the loaded nodes and edges
      setNodes(loadedNodes);
      setEdges(loadedEdges);

      console.log('NLP workflow loaded successfully to Canvas');
      return true;

    } catch (error) {
      console.error('Failed to load NLP workflow to Canvas:', error);
      throw error;
    }
  }

  /**
   * Map NLP node types to Canvas node types
   */
  private mapNodeType(nlpType: string, nodeDefinition: any): string {
    // Direct mapping for real system UO types - no translation needed
    // These types should match exactly with the operationNodes types
    const realSystemTypes = [
      // SDL Catalyst types
      'sdl_catalyst_cva', 'sdl_catalyst_lsv', 'sdl_catalyst_ocv', 
      'sdl_catalyst_cp', 'sdl_catalyst_peis', 'sdl_catalyst_ot2',
      // Processing equipment
      'PumpControl', 'ValveControl', 'HotplateControl', 'BalanceControl',
      'homogenizer', 'autoSampler', 'powderDispenser',
      // Analysis equipment
      'massSpectrometer', 'hrMassSpectrometer', 'nmr', 'ftir', 'raman', 'fluorometer',
      'hplc', 'columnChromatography', 'crystallizer',
      // Environment control
      'temperatureController', 'glovebox', 'co2Incubator', 'cleanBench',
      'ultraLowFreezer',
      // Data acquisition
      'dataLogger', 'microscope', 'thermalImager', 'multiChannelAnalyzer',
      // Test operations
      'PrepareElectrolyte', 'MixSolution', 'HeatTreatment', 'Characterization',
      // Others
      'balancer', 'filterSystem', 'gelElectrophoresis', 'flowReactor',
      'photoreactor', 'thermocycler', 'bioreactor', 'sampleLibrary',
      'sampleSplitter', 'Activation'
    ];

    // If it's a real system type, use it directly
    if (realSystemTypes.includes(nlpType)) {
      return nlpType;
    }

    // Legacy mappings for backward compatibility
    const legacyMapping: { [key: string]: string } = {
      'start': 'dataLogger',  // Map to a real type instead of 'input'
      'end': 'dataLogger',    // Map to a real type instead of 'output'
      'operationNode': 'dataLogger',
      // Old generic types -> real system types
      'add_liquid': 'PumpControl',
      'heat': 'HotplateControl', 
      'stir': 'homogenizer',
      'wait': 'dataLogger',
      'transfer': 'PumpControl',
      'cv': 'sdl_catalyst_cva',
      'lsv': 'sdl_catalyst_lsv',
      'ocv': 'sdl_catalyst_ocv'
    };

    // Use legacy mapping if exists
    if (legacyMapping[nlpType]) {
      return legacyMapping[nlpType];
    }
    
    // If nodeDefinition exists and has a type, use that
    if (nodeDefinition && nodeDefinition.type) {
      return nodeDefinition.type;
    }
    
    // Fallback to a generic but real operation type
    return 'dataLogger';
  }

  /**
   * Transform NLP parameters to Canvas parameter format
   */
  private transformParameters(params: any): any {
    if (!params || typeof params !== 'object') {
      return {};
    }

    // If params is already in Canvas format (array), convert to object
    if (Array.isArray(params)) {
      const paramObj: any = {};
      params.forEach((param: any) => {
        if (param.name && param.value !== undefined) {
          paramObj[param.name] = param.value;
        }
      });
      return paramObj;
    }

    // If params is object, return as-is
    return params;
  }

  /**
   * Create a workflow JSON from Canvas state
   * (Reverse operation - for saving workflows)
   */
  exportCanvasToWorkflow(
    nodes: any[],
    edges: any[],
    metadata: any = {}
  ): any {
    const workflowNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      label: node.data?.label || node.id,
      params: node.data?.params || {},
      data: {
        label: node.data?.label,
        nodeType: node.data?.nodeType || node.type,
        category: node.data?.category,
        description: node.data?.description,
        parameters: this.objectToParameterArray(node.data?.params || {})
      },
      style: node.style || {}
    }));

    const workflowEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      data: edge.data,
      label: edge.label,
      animated: edge.animated,
      style: edge.style
    }));

    return {
      metadata: {
        id: metadata.id || `workflow_${Date.now()}`,
        name: metadata.name || 'Canvas Workflow',
        description: metadata.description || 'Exported from Canvas',
        created_at: new Date().toISOString(),
        ...metadata
      },
      workflow: {
        nodes: workflowNodes,
        edges: workflowEdges,
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      execution: {
        status: 'draft',
        total_steps: workflowNodes.filter(n => n.type !== 'input' && n.type !== 'output').length,
        estimated_duration: this.calculateDuration(workflowNodes),
        required_devices: this.extractRequiredDevices(workflowNodes)
      }
    };
  }

  /**
   * Convert parameter object to parameter array format
   */
  private objectToParameterArray(paramsObj: any): any[] {
    return Object.entries(paramsObj).map(([key, value]) => ({
      id: `param_${key}`,
      name: key,
      type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
      value: value,
      required: true
    }));
  }

  /**
   * Calculate estimated workflow duration
   */
  private calculateDuration(nodes: any[]): number {
    return nodes.reduce((total, node) => {
      const params = node.params || {};
      const duration = params.duration || 60; // Default 1 minute per operation
      return total + (typeof duration === 'number' ? duration : 60);
    }, 0);
  }

  /**
   * Extract required devices from workflow nodes
   */
  private extractRequiredDevices(nodes: any[]): string[] {
    const deviceMapping: { [key: string]: string[] } = {
      add_liquid: ['pump', 'liquid_handler'],
      heat: ['heater', 'temperature_controller'],
      cv: ['potentiostat', 'electrodes'],
      lsv: ['potentiostat', 'electrodes'],
      ocv: ['potentiostat', 'electrodes'],
      stir: ['magnetic_stirrer'],
      transfer: ['pipette', 'liquid_handler'],
      wash: ['pump', 'liquid_handler'],
      wait: []
    };

    const devices = new Set<string>();
    nodes.forEach(node => {
      const nodeType = node.data?.nodeType || node.type;
      const nodeDevices = deviceMapping[nodeType] || [];
      nodeDevices.forEach(device => devices.add(device));
    });

    return Array.from(devices);
  }

  /**
   * Validate workflow format before loading
   */
  validateWorkflowFormat(workflowJson: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workflowJson) {
      errors.push('Workflow JSON is null or undefined');
      return { valid: false, errors };
    }

    if (!workflowJson.workflow) {
      errors.push('Missing workflow property');
    }

    if (workflowJson.workflow) {
      if (!workflowJson.workflow.nodes || !Array.isArray(workflowJson.workflow.nodes)) {
        errors.push('Missing or invalid nodes array');
      }

      if (!workflowJson.workflow.edges || !Array.isArray(workflowJson.workflow.edges)) {
        errors.push('Missing or invalid edges array');
      }

      // Validate nodes
      if (workflowJson.workflow.nodes) {
        workflowJson.workflow.nodes.forEach((node: any, index: number) => {
          if (!node.id) {
            errors.push(`Node ${index} missing id`);
          }
          if (!node.type && !node.data?.nodeType) {
            errors.push(`Node ${index} missing type`);
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
}

export const nlpCanvasIntegration = new NLPCanvasIntegration();