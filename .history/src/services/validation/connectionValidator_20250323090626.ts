import {
  ValidationRule,
  ValidationContext,
  ValidationResult,
  ValidationError,
  ValidationErrorType,
  ValidationErrorSeverity,
  PortDefinition
} from './types';

/**
 * Connection Validator
 * Validates the following aspects of workflow connections:
 * 1. Port type compatibility
 * 2. Required port connections
 * 3. Multiple connection rules
 */
export class ConnectionValidator implements ValidationRule {
  name = 'Connection Validator';
  description = 'Validates connections between workflow nodes';

  validate(context: ValidationContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check port type compatibility
    const typeErrors = this.validatePortTypes(context);
    result.errors.push(...typeErrors);

    // Check required connections
    const requiredErrors = this.validateRequiredConnections(context);
    result.errors.push(...requiredErrors);

    // Check multiple connection rules
    const multipleErrors = this.validateMultipleConnections(context);
    result.errors.push(...multipleErrors);

    result.isValid = result.errors.length === 0;
    return result;
  }

  private validatePortTypes(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const connection of context.connections.values()) {
      const sourceNode = context.nodes.get(connection.sourceNodeId);
      const targetNode = context.nodes.get(connection.targetNodeId);

      if (!sourceNode || !targetNode) continue;

      const sourcePort = sourceNode.ports.find(p => p.id === connection.sourcePortId);
      const targetPort = targetNode.ports.find(p => p.id === connection.targetPortId);

      if (!sourcePort || !targetPort) {
        errors.push({
          type: ValidationErrorType.INVALID_CONNECTION,
          severity: ValidationErrorSeverity.ERROR,
          message: `Invalid connection: Port not found`,
          connectionId: connection.id,
          details: {
            sourceNodeId: connection.sourceNodeId,
            targetNodeId: connection.targetNodeId,
            sourcePortId: connection.sourcePortId,
            targetPortId: connection.targetPortId,
          },
        });
        continue;
      }

      if (!this.arePortTypesCompatible(sourcePort, targetPort)) {
        errors.push({
          type: ValidationErrorType.INVALID_CONNECTION,
          severity: ValidationErrorSeverity.ERROR,
          message: `Incompatible port types: ${sourcePort.type} -> ${targetPort.type}`,
          connectionId: connection.id,
          details: {
            sourceType: sourcePort.type,
            targetType: targetPort.type,
          },
        });
      }
    }

    return errors;
  }

  private validateRequiredConnections(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check each node's required ports
    for (const node of context.nodes.values()) {
      const requiredPorts = node.ports.filter(port => port.required);

      for (const port of requiredPorts) {
        const connections = Array.from(context.connections.values())
          .filter(conn => 
            (conn.sourceNodeId === node.id && conn.sourcePortId === port.id) ||
            (conn.targetNodeId === node.id && conn.targetPortId === port.id)
          );

        if (connections.length === 0) {
          errors.push({
            type: ValidationErrorType.MISSING_REQUIRED_CONNECTION,
            severity: ValidationErrorSeverity.ERROR,
            message: `Required port "${port.id}" on node "${node.label || node.id}" is not connected`,
            nodeId: node.id,
            details: { portId: port.id },
          });
        }
      }
    }

    return errors;
  }

  private validateMultipleConnections(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check each node's ports for multiple connection rules
    for (const node of context.nodes.values()) {
      for (const port of node.ports) {
        const connections = Array.from(context.connections.values())
          .filter(conn => 
            (conn.sourceNodeId === node.id && conn.sourcePortId === port.id) ||
            (conn.targetNodeId === node.id && conn.targetPortId === port.id)
          );

        if (!port.allowMultiple && connections.length > 1) {
          errors.push({
            type: ValidationErrorType.INVALID_CONNECTION,
            severity: ValidationErrorSeverity.ERROR,
            message: `Port "${port.id}" on node "${node.label || node.id}" does not allow multiple connections`,
            nodeId: node.id,
            details: { 
              portId: port.id,
              connectionCount: connections.length,
              connections: connections.map(c => c.id),
            },
          });
        }
      }
    }

    return errors;
  }

  private arePortTypesCompatible(sourcePort: PortDefinition, targetPort: PortDefinition): boolean {
    // Basic type compatibility check
    if (sourcePort.type === targetPort.type) return true;

    // Add more complex type compatibility rules here
    // For example:
    // - Numeric types (int -> float)
    // - Array types (array -> single)
    // - Inheritance relationships
    // - Custom type conversion rules

    return false;
  }
} 
