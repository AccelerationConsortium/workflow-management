import { ValidationResult, ValidationError, ValidationWarning } from '../types/validation';

export class WorkflowValidator {
  validateWorkflow(nodes: any[], edges: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. 验证连接的完整性
    this.validateConnections(nodes, edges, errors);

    // 2. 验证每个节点的参数
    nodes.forEach(node => {
      this.validateNodeParameters(node, errors);
    });

    // 3. 验证数据流
    this.validateDataFlow(nodes, edges, errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateConnections(nodes: any[], edges: any[], errors: ValidationError[]) {
    nodes.forEach(node => {
      // 检查必需的输入是否都连接
      node.data.inputs?.forEach((input: any) => {
        if (input.required) {
          const hasConnection = edges.some(edge => 
            edge.target === node.id && edge.targetHandle === input.id
          );
          if (!hasConnection) {
            errors.push({
              nodeId: node.id,
              field: input.id,
              message: `Required input "${input.label}" is not connected`,
              type: 'connection'
            });
          }
        }
      });
    });
  }

  private validateNodeParameters(node: any, errors: ValidationError[]) {
    node.data.parameters?.forEach((param: any) => {
      if (param.required && !param.value) {
        errors.push({
          nodeId: node.id,
          field: param.name,
          message: `Required parameter "${param.label}" is not set`,
          type: 'parameter'
        });
      }

      if (param.range && param.value) {
        const [min, max] = param.range;
        if (param.value < min || param.value > max) {
          errors.push({
            nodeId: node.id,
            field: param.name,
            message: `Parameter "${param.label}" value is out of range (${min}-${max})`,
            type: 'parameter'
          });
        }
      }
    });
  }

  private validateDataFlow(nodes: any[], edges: any[], errors: ValidationError[]) {
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        const outputType = this.getOutputType(sourceNode, edge.sourceHandle);
        const inputType = this.getInputType(targetNode, edge.targetHandle);

        if (!this.areTypesCompatible(outputType, inputType)) {
          errors.push({
            nodeId: targetNode.id,
            field: edge.targetHandle,
            message: `Data type mismatch: ${outputType} cannot connect to ${inputType}`,
            type: 'data'
          });
        }
      }
    });
  }

  private getOutputType(node: any, handleId: string): string {
    const output = node.data.outputs?.find((o: any) => o.id === handleId);
    return output?.type || 'unknown';
  }

  private getInputType(node: any, handleId: string): string {
    const input = node.data.inputs?.find((i: any) => i.id === handleId);
    return input?.type || 'unknown';
  }

  private areTypesCompatible(sourceType: string, targetType: string): boolean {
    // 实现类型兼容性检查逻辑
    return true; // 简化版本
  }
} 