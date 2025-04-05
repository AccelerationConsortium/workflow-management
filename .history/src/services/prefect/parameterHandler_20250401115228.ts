import { promises as fs } from 'fs';
import path from 'path';
import { WorkflowNode } from '../../types/workflow';

export interface FileParameter {
  type: 'file';
  path: string;
  content?: string | Buffer;
  metadata?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

export interface NodeParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file';
  value: string | number | boolean | FileParameter;
  metadata?: Record<string, any>;
}

export interface ParameterValue {
  value: any;
  type: 'number' | 'string' | 'boolean' | 'file' | 'object';
  source?: {
    nodeId: string;
    outputKey: string;
  };
}

export interface ParameterMapping {
  [nodeId: string]: {
    [paramName: string]: ParameterValue;
  };
}

export class ParameterHandler {
  private parameterMapping: ParameterMapping = {};
  private uploadPath: string;

  constructor(uploadPath: string) {
    this.uploadPath = uploadPath;
  }

  /**
   * 注册节点参数
   */
  public registerNodeParameters(
    node: WorkflowNode,
    parameters: Record<string, ParameterValue>
  ): void {
    this.parameterMapping[node.id] = parameters;
  }

  /**
   * 设置参数依赖关系
   */
  public setParameterDependency(
    targetNodeId: string,
    targetParam: string,
    sourceNodeId: string,
    sourceOutput: string
  ): void {
    if (!this.parameterMapping[targetNodeId]) {
      this.parameterMapping[targetNodeId] = {};
    }

    this.parameterMapping[targetNodeId][targetParam] = {
      value: null,
      type: 'object',
      source: {
        nodeId: sourceNodeId,
        outputKey: sourceOutput
      }
    };
  }

  /**
   * 解析节点参数
   */
  public async resolveNodeParameters(
    nodeId: string,
    executionResults: Map<string, any>
  ): Promise<Record<string, any>> {
    const nodeResults = executionResults.get(nodeId);
    if (!nodeResults) {
      return {};
    }

    const resolvedParams: Record<string, any> = {};

    for (const [key, value] of Object.entries(nodeResults.parameters || {})) {
      if (this.isFileParameter(value)) {
        resolvedParams[key] = await this.handleFileParameter(value as FileParameter);
      } else {
        resolvedParams[key] = value;
      }
    }

    return resolvedParams;
  }

  private isFileParameter(value: any): boolean {
    return value && typeof value === 'object' && value.type === 'file';
  }

  private async handleFileParameter(fileParam: FileParameter): Promise<string> {
    // Generate a unique filename
    const filename = path.basename(fileParam.path);
    const targetPath = path.join(this.uploadPath, filename);

    // Write file content if provided
    if (fileParam.content) {
      await fs.writeFile(targetPath, fileParam.content);
    }
    // Otherwise, assume the file already exists at the specified path
    else if (!await this.fileExists(targetPath)) {
      throw new Error(`File not found: ${targetPath}`);
    }

    return targetPath;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证参数值
   */
  public validateParameterValue(
    value: any,
    type: string,
    validation?: Record<string, any>
  ): boolean {
    switch (type) {
      case 'number':
        if (typeof value !== 'number') return false;
        if (validation) {
          if (validation.min !== undefined && value < validation.min) return false;
          if (validation.max !== undefined && value > validation.max) return false;
        }
        break;

      case 'string':
        if (typeof value !== 'string') return false;
        if (validation?.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) return false;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') return false;
        break;

      case 'file':
        if (typeof value !== 'string') return false;
        if (validation?.fileTypes) {
          const ext = value.split('.').pop()?.toLowerCase();
          if (!validation.fileTypes.includes(ext)) return false;
        }
        break;
    }

    return true;
  }

  /**
   * 清理节点参数
   */
  public clearNodeParameters(nodeId: string): void {
    delete this.parameterMapping[nodeId];
  }

  async validateParameters(
    node: WorkflowNode,
    parameters: Record<string, any>
  ): Promise<boolean> {
    if (!node.data?.parameters) {
      return true;
    }

    for (const param of node.data.parameters) {
      const value = parameters[param.name];

      // Check required parameters
      if (param.constraints?.required && value === undefined) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }

      // Skip validation for optional parameters that are not provided
      if (value === undefined) {
        continue;
      }

      // Validate parameter type
      if (!this.validateParameterType(param.type, value)) {
        throw new Error(
          `Invalid type for parameter ${param.name}: expected ${param.type}`
        );
      }

      // Validate constraints
      if (param.constraints) {
        await this.validateConstraints(param.name, value, param.constraints);
      }
    }

    return true;
  }

  private validateParameterType(
    type: string,
    value: any
  ): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'file':
        return this.isFileParameter(value);
      default:
        return true;
    }
  }

  private async validateConstraints(
    paramName: string,
    value: any,
    constraints: Record<string, any>
  ): Promise<void> {
    // Numeric constraints
    if (typeof value === 'number') {
      if (constraints.min !== undefined && value < constraints.min) {
        throw new Error(
          `Parameter ${paramName} must be greater than or equal to ${constraints.min}`
        );
      }
      if (constraints.max !== undefined && value > constraints.max) {
        throw new Error(
          `Parameter ${paramName} must be less than or equal to ${constraints.max}`
        );
      }
    }

    // String pattern
    if (typeof value === 'string' && constraints.pattern) {
      const regex = new RegExp(constraints.pattern);
      if (!regex.test(value)) {
        throw new Error(
          `Parameter ${paramName} does not match required pattern: ${constraints.pattern}`
        );
      }
    }

    // File type validation
    if (this.isFileParameter(value) && constraints.fileTypes) {
      const fileType = path.extname(value.path).toLowerCase();
      if (!constraints.fileTypes.includes(fileType)) {
        throw new Error(
          `Invalid file type for parameter ${paramName}. Expected one of: ${constraints.fileTypes.join(', ')}`
        );
      }
    }
  }
} 
