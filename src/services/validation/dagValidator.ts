import {
  ValidationRule,
  ValidationContext,
  ValidationResult,
  ValidationError,
  ValidationErrorType,
  ValidationErrorSeverity,
} from './types';

/**
 * DAG Structure Validator
 * Validates the following aspects of a workflow:
 * 1. No cycles in the graph
 * 2. No isolated nodes
 * 3. Has valid start and end nodes
 */
export class DAGValidator implements ValidationRule {
  name = 'DAG Structure Validator';
  description = 'Validates the DAG structure of the workflow';

  validate(context: ValidationContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check for cycles
    const cycleErrors = this.detectCycles(context);
    result.errors.push(...cycleErrors);

    // Check for isolated nodes
    const isolatedErrors = this.detectIsolatedNodes(context);
    result.errors.push(...isolatedErrors);

    // Check start/end nodes
    const startEndErrors = this.validateStartEndNodes(context);
    result.errors.push(...startEndErrors);

    result.isValid = result.errors.length === 0;
    return result;
  }

  private detectCycles(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    // Helper function for DFS cycle detection
    const hasCycle = (nodeId: string, path: string[] = []): boolean => {
      if (recursionStack.has(nodeId)) {
        errors.push({
          type: ValidationErrorType.CYCLE_DETECTED,
          severity: ValidationErrorSeverity.ERROR,
          message: `Cycle detected in workflow: ${path.join(' -> ')} -> ${nodeId}`,
          details: { cycle: [...path, nodeId] },
        });
        return true;
      }

      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const node = context.nodes.get(nodeId);
      if (!node) return false;

      // Get all outgoing connections
      const outgoingConnections = Array.from(context.connections.values())
        .filter(conn => conn.sourceNodeId === nodeId);

      for (const conn of outgoingConnections) {
        if (hasCycle(conn.targetNodeId, [...path])) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };

    // Check each unvisited node
    for (const nodeId of context.nodes.keys()) {
      if (!visited.has(nodeId)) {
        hasCycle(nodeId);
      }
    }

    return errors;
  }

  private detectIsolatedNodes(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const connectedNodes = new Set<string>();

    // Collect all connected nodes
    for (const connection of context.connections.values()) {
      connectedNodes.add(connection.sourceNodeId);
      connectedNodes.add(connection.targetNodeId);
    }

    // Find isolated nodes
    for (const [nodeId, node] of context.nodes.entries()) {
      if (!connectedNodes.has(nodeId)) {
        errors.push({
          type: ValidationErrorType.ISOLATED_NODE,
          severity: ValidationErrorSeverity.ERROR,
          message: `Isolated node detected: ${node.label || nodeId}`,
          nodeId,
        });
      }
    }

    return errors;
  }

  private validateStartEndNodes(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    let hasStart = false;
    let hasEnd = false;

    // Find nodes with no incoming connections (start nodes)
    // and nodes with no outgoing connections (end nodes)
    for (const nodeId of context.nodes.keys()) {
      const incomingConnections = Array.from(context.connections.values())
        .filter(conn => conn.targetNodeId === nodeId);
      const outgoingConnections = Array.from(context.connections.values())
        .filter(conn => conn.sourceNodeId === nodeId);

      if (incomingConnections.length === 0) hasStart = true;
      if (outgoingConnections.length === 0) hasEnd = true;
    }

    if (!hasStart) {
      errors.push({
        type: ValidationErrorType.MISSING_START_END,
        severity: ValidationErrorSeverity.ERROR,
        message: 'Workflow must have at least one start node (node with no incoming connections)',
      });
    }

    if (!hasEnd) {
      errors.push({
        type: ValidationErrorType.MISSING_START_END,
        severity: ValidationErrorSeverity.ERROR,
        message: 'Workflow must have at least one end node (node with no outgoing connections)',
      });
    }

    return errors;
  }
} 
