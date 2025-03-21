import { WorkflowNode } from '../../types/workflow';

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
  private fileUploadPath: string;

  constructor(fileUploadPath: string) {
    this.fileUploadPath = fileUploadPath;
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
    executionResults: Record<string, any>
  ): Promise<Record<string, any>> {
    const nodeParams = this.parameterMapping[nodeId];
    if (!nodeParams) {
      throw new Error(`No parameters registered for node: ${nodeId}`);
    }

    const resolvedParams: Record<string, any> = {};

    for (const [paramName, paramValue] of Object.entries(nodeParams)) {
      if (paramValue.source) {
        // 处理依赖参数
        const sourceResult = executionResults[paramValue.source.nodeId];
        if (!sourceResult) {
          throw new Error(
            `Source node ${paramValue.source.nodeId} has not been executed yet`
          );
        }
        resolvedParams[paramName] = sourceResult[paramValue.source.outputKey];
      } else {
        // 处理直接参数
        resolvedParams[paramName] = await this.processParameterValue(paramValue);
      }
    }

    return resolvedParams;
  }

  /**
   * 处理参数值
   */
  private async processParameterValue(
    paramValue: ParameterValue
  ): Promise<any> {
    switch (paramValue.type) {
      case 'file':
        return await this.handleFileParameter(paramValue.value);
      case 'number':
        return Number(paramValue.value);
      case 'boolean':
        return Boolean(paramValue.value);
      case 'string':
        return String(paramValue.value);
      case 'object':
        return paramValue.value;
      default:
        throw new Error(`Unsupported parameter type: ${paramValue.type}`);
    }
  }

  /**
   * 处理文件参数
   */
  private async handleFileParameter(filePath: string): Promise<string> {
    // 如果是相对路径，转换为绝对路径
    if (!filePath.startsWith('/')) {
      filePath = `${this.fileUploadPath}/${filePath}`;
    }

    // 这里可以添加文件验证、复制等逻辑
    return filePath;
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
} 
