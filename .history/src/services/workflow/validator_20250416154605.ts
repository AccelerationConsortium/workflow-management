import {
  WorkflowNode,
  WorkflowConnection,
  WorkflowData,
  NodeDefinition,
  Parameter
} from '../../types/workflow';

export interface ValidationMessage {
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  messages: ValidationMessage[];
}

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
    definition.parameters.forEach((param: Parameter) => {
      const key = param.name;
      if (param.constraints?.required && !node.data[key]) {
        messages.push({
          severity: 'error',
          message: `Missing required parameter: ${param.label}`,
          nodeId: node.id,
          field: key
        });
      }

      if (node.data[key] !== undefined) {
        // Type validation
        if (typeof node.data[key] !== param.type && param.type !== 'file') {
          messages.push({
            severity: 'error',
            message: `Invalid type for parameter ${param.label}. Expected ${param.type}`,
            nodeId: node.id,
            field: key
          });
        }

        // Range validation for numbers
        if (param.type === 'number' && param.constraints) {
          const value = node.data[key];
          if (param.constraints.min !== undefined && value < param.constraints.min) {
            messages.push({
              severity: 'error',
              message: `${param.label} must be at least ${param.constraints.min}`,
              nodeId: node.id,
              field: key
            });
          }
          if (param.constraints.max !== undefined && value > param.constraints.max) {
            messages.push({
              severity: 'error',
              message: `${param.label} must be at most ${param.constraints.max}`,
              nodeId: node.id,
              field: key
            });
          }
        }

        // File type validation
        if (param.type === 'file' && param.constraints?.fileTypes) {
          const fileName = node.data[key];
          const fileExtension = fileName.split('.').pop()?.toLowerCase();
          if (!param.constraints.fileTypes.includes(fileExtension)) {
            messages.push({
              severity: 'error',
              message: `Invalid file type for ${param.label}. Expected: ${param.constraints.fileTypes.join(', ')}`,
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
      const output = sourceDefinition.outputs?.find(o => o.id === connection.sourceHandle);
      const input = targetDefinition.inputs?.find(i => i.id === connection.targetHandle);

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

  public validateWorkflow(workflow: WorkflowData): ValidationResult {
    const messages: ValidationMessage[] = [];

    // Validate each node
    workflow.nodes.forEach(node => {
      const nodeValidation = this.validateNode(node);
      messages.push(...nodeValidation.messages);
    });

    // Validate connections
    workflow.connections.forEach((connection: any) => {
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

  private hasCycle(workflow: WorkflowData): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = workflow.connections.filter((c: any) => c.source === nodeId);
      for (const connection of outgoingConnections) {
        const targetId = connection.target;
        if (!visited.has(targetId)) {
          if (dfs(targetId)) return true;
        } else if (recursionStack.has(targetId)) {
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
