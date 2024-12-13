import { DevicePrimitive, ControlDetail } from '../types/primitive';
import { Device, OperationNode } from '../types/workflow';

export const primitiveService = {
  // 根据 UO 和设备查找兼容的原语
  findCompatiblePrimitives: async (
    unitOperation: OperationNode,
    device: Device
  ): Promise<DevicePrimitive[]> => {
    try {
      // 实际项目中这里会调用后端 API
      const response = await fetch(`/api/primitives/compatible`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operationType: unitOperation.type,
          deviceManufacturer: device.manufacturer,
          deviceModel: device.model,
          constraints: {
            ...unitOperation.validation,
            ...device.constraints,
          }
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch compatible primitives:', error);
      return [];
    }
  },

  // 获取原语的控制细节
  getControlDetails: async (primitiveId: string): Promise<ControlDetail> => {
    try {
      const response = await fetch(`/api/primitives/${primitiveId}/control-details`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch control details:', error);
      throw error;
    }
  },

  // 验证约束条件
  validateConstraints: (
    primitive: DevicePrimitive,
    parameters: Record<string, any>
  ): { isValid: boolean; violations: string[] } => {
    const violations: string[] = [];

    primitive.constraints.forEach(constraint => {
      const value = parameters[constraint.parameter];
      
      if (constraint.type === 'range') {
        const [min, max] = constraint.values as number[];
        if (value < min || value > max) {
          violations.push(
            `${constraint.parameter} must be between ${min} and ${max} ${constraint.unit || ''}`
          );
        }
      } else if (constraint.type === 'enum') {
        if (!constraint.values.includes(value)) {
          violations.push(
            `${constraint.parameter} must be one of: ${constraint.values.join(', ')}`
          );
        }
      }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  }
}; 