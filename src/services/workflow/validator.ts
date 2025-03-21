import {
  ValidationResult,
  ValidationMessage,
  WorkflowNode,
  WorkflowConnection,
  Workflow,
  NodeDefinition
} from '../../types/workflow';

export class WorkflowValidator {
  private nodeDefinitions: Map<string, NodeDefinition>;

  constructor(nodeDefinitions: Record<string, NodeDefinition>) {
    this.nodeDefinitions = new Map(Object.entries(nodeDefinitions));
  }

  public validateNode(node: WorkflowNode): ValidationResult {
    const messages: ValidationMessage[] = [];
    const definition = this.nodeDefinitions.get(node.type);

    if (!definition) {
      return {
        isValid: false,
        messages: [{
          severity: 'error',
          message: `Unknown node type: ${node.type}`,
          nodeId: node.id
        }]
      };
    }

    // Validate required parameters
    Object.entries(definition.parameters).forEach(([key, param]) => {
      if (param.required && !node.data[key]) {
        messages.push({
          severity: 'error',
          message: `Missing required parameter: ${param.name}`,
          nodeId: node.id,
          field: key
        });
      }

      if (node.data[key] !== undefined) {
        // Type validation
        if (typeof node.data[key] !== param.type && param.type !== 'file') {
          messages.push({
            severity: 'error',
            message: `Invalid type for parameter ${param.name}. Expected ${param.type}`,
            nodeId: node.id,
            field: key
          });
        }

        // Range validation for numbers
        if (param.type === 'number' && param.validation) {
          const value = node.data[key];
          if (param.validation.min !== undefined && value < param.validation.min) {
            messages.push({
              severity: 'error',
              message: `${param.name} must be at least ${param.validation.min}`,
              nodeId: node.id,
              field: key
            });
          }
          if (param.validation.max !== undefined && value > param.validation.max) {
            messages.push({
              severity: 'error',
              message: `${param.name} must be at most ${param.validation.max}`,
              nodeId: node.id,
              field: key
            });
          }
        }

        // File type validation
        if (param.type === 'file' && param.validation?.fileTypes) {
          const fileName = node.data[key];
          const fileExtension = fileName.split('.').pop()?.toLowerCase();
          if (!param.validation.fileTypes.includes(fileExtension)) {
            messages.push({
              severity: 'error',
              message: `Invalid file type for ${param.name}. Expected: ${param.validation.fileTypes.join(', ')}`,
              nodeId: node.id,
              field: key
            });
          }
        }
      }
    });

    return {
      isValid: messages.length === 0,
      messages
    };
  }

  public validateConnection(
    connection: WorkflowConnection,
    sourceNode: WorkflowNode,
    targetNode: WorkflowNode
  ): ValidationResult {
    const messages: ValidationMessage[] = [];
    const sourceDefinition = this.nodeDefinitions.get(sourceNode.type);
    const targetDefinition = this.nodeDefinitions.get(targetNode.type);

    if (!sourceDefinition || !targetDefinition) {
      return {
        isValid: false,
        messages: [{
          severity: 'error',
          message: 'Invalid node type in connection',
          nodeId: connection.id
        }]
      };
    }

    // Validate output-input compatibility
    if (connection.sourceHandle && connection.targetHandle) {
      const output = sourceDefinition.outputs.find(o => o.name === connection.sourceHandle);
      const input = targetDefinition.inputs.find(i => i.name === connection.targetHandle);

      if (!output || !input) {
        messages.push({
          severity: 'error',
          message: 'Invalid connection ports',
          nodeId: connection.id
        });
      } else if (output.type !== input.type) {
        messages.push({
          severity: 'error',
          message: `Type mismatch: ${output.type} cannot connect to ${input.type}`,
          nodeId: connection.id
        });
      }
    }

    return {
      isValid: messages.length === 0,
      messages
    };
  }

  public validateWorkflow(workflow: Workflow): ValidationResult {
    const messages: ValidationMessage[] = [];

    // Validate each node
    workflow.nodes.forEach(node => {
      const nodeValidation = this.validateNode(node);
      messages.push(...nodeValidation.messages);
    });

    // Validate connections
    workflow.connections.forEach(connection => {
      const sourceNode = workflow.nodes.find(n => n.id === connection.source);
      const targetNode = workflow.nodes.find(n => n.id === connection.target);

      if (!sourceNode || !targetNode) {
        messages.push({
          severity: 'error',
          message: 'Connection references non-existent node',
          nodeId: connection.id
        });
      } else {
        const connectionValidation = this.validateConnection(connection, sourceNode, targetNode);
        messages.push(...connectionValidation.messages);
      }
    });

    // Validate workflow-level requirements
    if (workflow.nodes.length === 0) {
      messages.push({
        severity: 'error',
        message: 'Workflow must contain at least one node'
      });
    }

    // Check for cycles
    if (this.hasCycle(workflow)) {
      messages.push({
        severity: 'error',
        message: 'Workflow contains cycles'
      });
    }

    return {
      isValid: messages.length === 0,
      messages
    };
  }

  private hasCycle(workflow: Workflow): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = workflow.connections.filter(c => c.source === nodeId);
      for (const connection of outgoingConnections) {
        if (!visited.has(connection.target)) {
          if (dfs(connection.target)) return true;
        } else if (recursionStack.has(connection.target)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }
} 
