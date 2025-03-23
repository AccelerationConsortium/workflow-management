import {
  ValidationRule,
  ValidationContext,
  ValidationResult,
  ValidationError,
  ValidationErrorType,
  ValidationErrorSeverity,
  ParameterDefinition
} from './types';

/**
 * Parameter Validator
 * Validates the basic correctness of workflow node parameters:
 * 1. Required parameters presence
 * 2. Parameter type correctness
 * 3. Basic range/format validation
 * 
 * Note: This validator only handles basic parameter validation
 * for workflow integrity. It does not perform deep data validation
 * which should be handled by separate data validation services.
 */
export class ParameterValidator implements ValidationRule {
  name = 'Parameter Validator';
  description = 'Validates basic parameter requirements and formats';

  validate(context: ValidationContext): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check each node's parameters
    for (const node of context.nodes.values()) {
      // Get parameter definitions for this node type
      const paramDefs = this.getParameterDefinitions(node.type);
      
      // Validate required parameters
      const requiredErrors = this.validateRequiredParams(node.id, node.parameters, paramDefs);
      result.errors.push(...requiredErrors);

      // Validate parameter types
      const typeErrors = this.validateParameterTypes(node.id, node.parameters, paramDefs);
      result.errors.push(...typeErrors);

      // Validate parameter ranges and formats
      const rangeErrors = this.validateParameterRanges(node.id, node.parameters, paramDefs);
      result.errors.push(...rangeErrors);
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  private validateRequiredParams(
    nodeId: string,
    params: Record<string, any>,
    paramDefs: ParameterDefinition[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check each required parameter
    for (const def of paramDefs) {
      if (def.required) {
        const value = params[def.name];
        if (value === undefined || value === null || value === '') {
          errors.push({
            type: ValidationErrorType.MISSING_REQUIRED_PARAMETER,
            severity: ValidationErrorSeverity.ERROR,
            message: `Required parameter "${def.name}" is missing`,
            nodeId,
            parameterName: def.name,
          });
        }
      }
    }

    return errors;
  }

  private validateParameterTypes(
    nodeId: string,
    params: Record<string, any>,
    paramDefs: ParameterDefinition[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check each parameter's type
    for (const [name, value] of Object.entries(params)) {
      const def = paramDefs.find(d => d.name === name);
      if (!def) continue; // Skip undefined parameters

      if (!this.isTypeValid(value, def.type)) {
        errors.push({
          type: ValidationErrorType.INVALID_PARAMETER,
          severity: ValidationErrorSeverity.ERROR,
          message: `Parameter "${name}" has invalid type. Expected ${def.type}, got ${typeof value}`,
          nodeId,
          parameterName: name,
          details: {
            expectedType: def.type,
            actualType: typeof value,
            value,
          },
        });
      }
    }

    return errors;
  }

  private validateParameterRanges(
    nodeId: string,
    params: Record<string, any>,
    paramDefs: ParameterDefinition[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check each parameter's range/format
    for (const [name, value] of Object.entries(params)) {
      const def = paramDefs.find(d => d.name === name);
      if (!def || !def.validation) continue;

      const { validation } = def;

      // Numeric range validation
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          errors.push({
            type: ValidationErrorType.INVALID_PARAMETER,
            severity: ValidationErrorSeverity.ERROR,
            message: `Parameter "${name}" is below minimum value ${validation.min}`,
            nodeId,
            parameterName: name,
            details: { min: validation.min, value },
          });
        }
        if (validation.max !== undefined && value > validation.max) {
          errors.push({
            type: ValidationErrorType.INVALID_PARAMETER,
            severity: ValidationErrorSeverity.ERROR,
            message: `Parameter "${name}" exceeds maximum value ${validation.max}`,
            nodeId,
            parameterName: name,
            details: { max: validation.max, value },
          });
        }
      }

      // String pattern validation
      if (typeof value === 'string' && validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push({
            type: ValidationErrorType.INVALID_PARAMETER,
            severity: ValidationErrorSeverity.ERROR,
            message: `Parameter "${name}" does not match required format`,
            nodeId,
            parameterName: name,
            details: { pattern: validation.pattern, value },
          });
        }
      }

      // Enum validation
      if (validation.enum && !validation.enum.includes(value)) {
        errors.push({
          type: ValidationErrorType.INVALID_PARAMETER,
          severity: ValidationErrorSeverity.ERROR,
          message: `Parameter "${name}" must be one of: ${validation.enum.join(', ')}`,
          nodeId,
          parameterName: name,
          details: { allowedValues: validation.enum, value },
        });
      }
    }

    return errors;
  }

  private isTypeValid(value: any, expectedType: string): boolean {
    switch (expectedType.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
      case 'float':
      case 'integer':
        return typeof value === 'number' && 
          (expectedType !== 'integer' || Number.isInteger(value));
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true; // Custom types are assumed valid
    }
  }

  private getParameterDefinitions(nodeType: string): ParameterDefinition[] {
    // This should be implemented to return parameter definitions
    // based on node type, possibly from a configuration or schema
    // For now, return an empty array as placeholder
    return [];
  }
} 
