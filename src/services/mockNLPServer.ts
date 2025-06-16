/**
 * Mock NLP Server
 * 
 * Provides a local mock implementation of the AI workflow generation
 * when the backend server is not available
 */

export interface MockWorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    nodeType: string;
    category: string;
    parameters: any[];
    step_number: number;
  };
  style: {
    backgroundColor: string;
    color: string;
    border: string;
  };
}

export interface MockWorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
  };
  label?: string;
}

class MockNLPServer {
  private operationKeywords = {
    add_liquid: ['add', 'pour', 'pipette', 'dispense', 'ml', 'μl', 'ul', 'liter'],
    heat: ['heat', 'warm', 'temperature', '°c', 'celsius', 'degrees'],
    stir: ['stir', 'mix', 'agitate', 'rpm', 'rotate'],
    wait: ['wait', 'pause', 'hold', 'maintain', 'incubate'],
    cv: ['cv', 'cyclic voltammetry', 'voltammetry', 'electrochemical'],
    lsv: ['lsv', 'linear sweep', 'sweep'],
    ocv: ['ocv', 'open circuit', 'potential'],
    transfer: ['transfer', 'move', 'transport'],
    wash: ['wash', 'clean', 'rinse']
  };

  private categoryStyles = {
    liquid_handling: { backgroundColor: '#2196F3', color: 'white', border: '2px solid #1976D2' },
    temperature_control: { backgroundColor: '#FF9800', color: 'white', border: '2px solid #F57C00' },
    electrochemical: { backgroundColor: '#9C27B0', color: 'white', border: '2px solid #7B1FA2' },
    mixing: { backgroundColor: '#00BCD4', color: 'white', border: '2px solid #0097A7' },
    timing: { backgroundColor: '#607D8B', color: 'white', border: '2px solid #455A64' },
    cleaning: { backgroundColor: '#4CAF50', color: 'white', border: '2px solid #388E3C' }
  };

  /**
   * Parse natural language input to extract operations
   */
  parseNaturalLanguage(text: string): Array<{
    type: string;
    name: string;
    category: string;
    params: any;
    description: string;
  }> {
    const operations = [];
    const lowercaseText = text.toLowerCase();
    let stepNumber = 1;

    // Extract numbers with units for parameters
    const extractNumber = (pattern: string, defaultValue: number = 0): number => {
      const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${pattern}`, 'i');
      const match = lowercaseText.match(regex);
      return match ? parseFloat(match[1]) : defaultValue;
    };

    // Check for liquid addition
    if (this.operationKeywords.add_liquid.some(keyword => lowercaseText.includes(keyword))) {
      const volume = extractNumber('(?:ml|μl|ul|liter)', 10);
      const chemical = this.extractChemical(text);
      
      operations.push({
        type: 'add_liquid',
        name: 'Add Liquid',
        category: 'liquid_handling',
        params: {
          volume: volume,
          chemical: chemical,
          speed: 5,
          container: 'reaction_vessel'
        },
        description: `Add ${volume}ml of ${chemical} to container`
      });
    }

    // Check for heating
    if (this.operationKeywords.heat.some(keyword => lowercaseText.includes(keyword))) {
      const temperature = extractNumber('(?:°c|celsius|degrees?)', 60);
      const duration = extractNumber('(?:min|minutes?|sec|seconds?)', 300);
      
      operations.push({
        type: 'heat',
        name: 'Heat Sample',
        category: 'temperature_control',
        params: {
          temperature: temperature,
          duration: duration,
          ramp_rate: 5
        },
        description: `Heat to ${temperature}°C for ${duration} seconds`
      });
    }

    // Check for stirring
    if (this.operationKeywords.stir.some(keyword => lowercaseText.includes(keyword))) {
      const speed = extractNumber('(?:rpm)', 300);
      const duration = extractNumber('(?:min|minutes?|sec|seconds?)', 120);
      
      operations.push({
        type: 'stir',
        name: 'Stir Solution',
        category: 'mixing',
        params: {
          speed: speed,
          duration: duration
        },
        description: `Stir at ${speed} rpm for ${duration} seconds`
      });
    }

    // Check for waiting
    if (this.operationKeywords.wait.some(keyword => lowercaseText.includes(keyword))) {
      const duration = extractNumber('(?:min|minutes?|sec|seconds?)', 60);
      
      operations.push({
        type: 'wait',
        name: 'Wait',
        category: 'timing',
        params: {
          duration: duration,
          message: 'Waiting for completion'
        },
        description: `Wait for ${duration} seconds`
      });
    }

    // Check for cyclic voltammetry
    if (this.operationKeywords.cv.some(keyword => lowercaseText.includes(keyword))) {
      const scanRate = extractNumber('(?:mv/s|millivolts?/s)', 50);
      const cycles = extractNumber('(?:cycle|cycles?)', 3);
      
      operations.push({
        type: 'cv',
        name: 'Cyclic Voltammetry',
        category: 'electrochemical',
        params: {
          start_voltage: -1.0,
          end_voltage: 1.0,
          scan_rate: scanRate,
          cycles: cycles
        },
        description: `Perform CV test at ${scanRate} mV/s for ${cycles} cycles`
      });
    }

    // Check for LSV
    if (this.operationKeywords.lsv.some(keyword => lowercaseText.includes(keyword))) {
      const scanRate = extractNumber('(?:mv/s|millivolts?/s)', 50);
      
      operations.push({
        type: 'lsv',
        name: 'Linear Sweep Voltammetry',
        category: 'electrochemical',
        params: {
          start_voltage: -1.0,
          end_voltage: 1.0,
          scan_rate: scanRate
        },
        description: `Perform LSV test at ${scanRate} mV/s`
      });
    }

    // If no operations found, create a generic one
    if (operations.length === 0) {
      operations.push({
        type: 'wait',
        name: 'Process Input',
        category: 'timing',
        params: {
          duration: 60,
          message: `Processing: ${text}`
        },
        description: `Process user input: ${text}`
      });
    }

    return operations;
  }

  /**
   * Extract chemical names from text
   */
  private extractChemical(text: string): string {
    const chemicals = ['NaOH', 'HCl', 'H2SO4', 'NaCl', 'KOH', 'H2O', 'water', 'solution'];
    
    for (const chemical of chemicals) {
      if (text.toLowerCase().includes(chemical.toLowerCase())) {
        return chemical;
      }
    }
    
    return 'solution';
  }

  /**
   * Generate mock workflow JSON
   */
  generateWorkflow(text: string): any {
    // Add delay to simulate processing
    const operations = this.parseNaturalLanguage(text);
    
    // Build nodes
    const nodes: MockWorkflowNode[] = [];
    const edges: MockWorkflowEdge[] = [];

    // Start node
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: 100, y: 100 },
      data: {
        label: 'Start',
        description: 'Workflow start',
        nodeType: 'start',
        category: 'control',
        parameters: [],
        step_number: 0
      },
      style: { backgroundColor: '#4CAF50', color: 'white', border: '2px solid #2E7D32' }
    });

    let previousNodeId = 'start';
    let yPosition = 100;

    // Operation nodes
    operations.forEach((operation, index) => {
      yPosition += 150;
      const nodeId = `operation_${index + 1}`;
      
      const node: MockWorkflowNode = {
        id: nodeId,
        type: 'operationNode',
        position: { x: 100, y: yPosition },
        data: {
          label: operation.name,
          description: operation.description,
          nodeType: operation.type,
          category: operation.category,
          parameters: Object.entries(operation.params).map(([key, value]) => ({
            id: `${operation.type}_${key}`,
            name: key,
            label: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
            value: value,
            required: true
          })),
          step_number: index + 1
        },
        style: this.categoryStyles[operation.category as keyof typeof this.categoryStyles] || 
               { backgroundColor: '#666', color: 'white', border: '2px solid #333' }
      };

      nodes.push(node);

      // Create edge
      edges.push({
        id: `edge_${previousNodeId}_to_${nodeId}`,
        source: previousNodeId,
        target: nodeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#666', strokeWidth: 2 },
        label: `Step ${index + 1}`
      });

      previousNodeId = nodeId;
    });

    // End node
    yPosition += 150;
    nodes.push({
      id: 'end',
      type: 'end',
      position: { x: 100, y: yPosition },
      data: {
        label: 'End',
        description: 'Workflow end',
        nodeType: 'end',
        category: 'control',
        parameters: [],
        step_number: operations.length + 1
      },
      style: { backgroundColor: '#F44336', color: 'white', border: '2px solid #C62828' }
    });

    // Final edge
    edges.push({
      id: `edge_${previousNodeId}_to_end`,
      source: previousNodeId,
      target: 'end',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#666', strokeWidth: 2 }
    });

    // Calculate estimated duration
    const estimatedDuration = operations.reduce((total, op) => {
      return total + (op.params.duration || 60);
    }, 0);

    // Get required devices
    const deviceMapping: { [key: string]: string[] } = {
      add_liquid: ['pump', 'liquid_handler'],
      heat: ['heater', 'temperature_controller'],
      cv: ['potentiostat', 'electrodes'],
      lsv: ['potentiostat', 'electrodes'],
      ocv: ['potentiostat', 'electrodes'],
      stir: ['magnetic_stirrer'],
      wait: []
    };

    const requiredDevices = [...new Set(
      operations.flatMap(op => deviceMapping[op.type] || [])
    )];

    return {
      success: true,
      workflow_json: {
        metadata: {
          id: `mock_workflow_${Date.now()}`,
          name: 'AI Generated Workflow',
          description: `Generated from: ${text}`,
          created_at: new Date().toISOString(),
          created_by: 'AI Agent (Mock)',
          version: '1.0.0',
          tags: ['AI Generated', 'Mock']
        },
        workflow: {
          nodes: nodes,
          edges: edges,
          viewport: { x: 0, y: 0, zoom: 1 }
        },
        execution: {
          status: 'draft',
          total_steps: operations.length,
          estimated_duration: estimatedDuration,
          required_devices: requiredDevices
        },
        validation: {
          is_valid: true,
          errors: [],
          warnings: [],
          last_validated: new Date().toISOString()
        }
      },
      suggestions: [],
      metadata: {
        total_operations: operations.length,
        estimated_duration: estimatedDuration,
        required_devices: requiredDevices
      },
      processing_time: Math.random() * 2 + 0.5 // Mock processing time
    };
  }
}

export const mockNLPServer = new MockNLPServer();