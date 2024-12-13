export type ValidationStage = 'logic' | 'environment' | 'simulation';

export interface ValidationProgress {
  stage: ValidationStage;
  progress: number;
  currentItem?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  details?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    stage: ValidationStage;
    nodeId?: string;
    message: string;
    details?: any;
  }>;
  warnings: Array<{
    stage: ValidationStage;
    nodeId?: string;
    message: string;
    details?: any;
  }>;
  summary?: {
    logic: boolean;
    environment: boolean;
    simulation?: boolean;
  };
}

export class WorkflowValidator {
  private updateProgress: (progress: ValidationProgress) => void;

  constructor(updateProgress: (progress: ValidationProgress) => void) {
    this.updateProgress = updateProgress;
  }

  async validateWorkflow(workflow: WorkflowData): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {
        logic: false,
        environment: false,
        simulation: false
      }
    };

    // 1. Logic Validation
    this.updateProgress({
      stage: 'logic',
      progress: 0,
      status: 'running',
      message: 'Starting logic validation...',
      details: ['Checking UO connections', 'Validating type signatures']
    });

    try {
      await this.validateLogic(workflow, result);
      result.summary.logic = true;
    } catch (error) {
      result.errors.push({
        stage: 'logic',
        message: 'Logic validation failed',
        details: error
      });
      return result; // 如果逻辑验证失败，直接返回
    }

    // 2. Environment Validation
    this.updateProgress({
      stage: 'environment',
      progress: 0,
      status: 'running',
      message: 'Starting environment validation...',
      details: ['Checking resource availability', 'Validating laboratory conditions']
    });

    try {
      await this.validateEnvironment(workflow, result);
      result.summary.environment = true;
    } catch (error) {
      result.errors.push({
        stage: 'environment',
        message: 'Environment validation failed',
        details: error
      });
      return result; // 如果环境验证失败，直接返回
    }

    // 3. Simulation (Optional)
    if (this.canSimulate(workflow)) {
      this.updateProgress({
        stage: 'simulation',
        progress: 0,
        status: 'running',
        message: 'Starting simulation...',
        details: ['Initializing digital twins', 'Running workflow simulation']
      });

      try {
        await this.runSimulation(workflow, result);
        result.summary.simulation = true;
      } catch (error) {
        result.warnings.push({
          stage: 'simulation',
          message: 'Simulation failed but not critical',
          details: error
        });
      }
    }

    return result;
  }

  private async validateLogic(workflow: WorkflowData, result: ValidationResult) {
    const nodes = workflow.nodes;
    
    // 1. 验证参数类型和范围
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      this.updateProgress({
        stage: 'logic',
        progress: (i / nodes.length) * 33, // 逻辑验证分三部分，每部分占33%
        currentItem: node.data.label,
        status: 'running',
        message: 'Validating parameter types and ranges',
        details: [
          'Checking parameter types',
          'Validating value ranges',
          'Verifying required fields'
        ]
      });

      await this.validateParameterTypes(node, result);
    }

    // 2. 验证连接类型
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      this.updateProgress({
        stage: 'logic',
        progress: 33 + (i / nodes.length) * 33,
        currentItem: node.data.label,
        status: 'running',
        message: 'Validating connections',
        details: [
          'Checking input/output compatibility',
          'Verifying required connections',
          'Validating data flow'
        ]
      });

      await this.validateConnectionTypes(node, workflow.edges, result);
    }

    // 3. 验证工作流逻辑
    this.updateProgress({
      stage: 'logic',
      progress: 66,
      status: 'running',
      message: 'Validating workflow logic',
      details: ['Checking for cycles', 'Validating execution order']
    });

    await this.validateWorkflowLogic(workflow, result);
  }

  private async validateParameterTypes(node: any, result: ValidationResult) {
    const { parameters, primitives } = node.data;

    // 验证参数类型
    for (const param of parameters || []) {
      const { type, value, required, range, label } = param;
      
      // 检查必填参数
      if (required && (value === undefined || value === null || value === '')) {
        result.errors.push({
          stage: 'logic',
          nodeId: node.id,
          message: `Required parameter "${label}" is not set`,
          details: { parameter: param }
        });
        continue;
      }

      // 检查类型匹配
      if (value !== undefined && value !== null) {
        const actualType = typeof value;
        if (!this.isTypeCompatible(actualType, type)) {
          result.errors.push({
            stage: 'logic',
            nodeId: node.id,
            message: `Parameter "${label}" type mismatch: expected ${type}, got ${actualType}`,
            details: { parameter: param, value }
          });
        }
      }

      // 检查范围
      if (range && value !== undefined && value !== null) {
        const [min, max] = range;
        if (value < min || value > max) {
          result.errors.push({
            stage: 'logic',
            nodeId: node.id,
            message: `Parameter "${label}" value ${value} is out of range [${min}, ${max}]`,
            details: { parameter: param, value }
          });
        }
      }
    }

    // 验证原语配置
    for (const primitive of primitives || []) {
      const { type, config } = primitive;
      
      // 根据原语类型验证配置
      const validationResult = await this.validatePrimitiveConfig(type, config);
      if (!validationResult.isValid) {
        result.errors.push({
          stage: 'logic',
          nodeId: node.id,
          message: `Invalid primitive configuration for "${type}"`,
          details: { primitive, errors: validationResult.errors }
        });
      }
    }
  }

  private async validateConnectionTypes(node: any, edges: any[], result: ValidationResult) {
    const { inputs, outputs } = node.data;

    // 验证输入连接
    for (const input of inputs || []) {
      const incomingEdges = edges.filter(e => e.target === node.id && e.targetHandle === input.id);
      
      // 检查必需输入
      if (input.required && incomingEdges.length === 0) {
        result.errors.push({
          stage: 'logic',
          nodeId: node.id,
          message: `Required input "${input.label}" is not connected`,
          details: { input }
        });
        continue;
      }

      // 检查输入类型兼容性
      for (const edge of incomingEdges) {
        const sourceNode = node.data.nodes.find((n: any) => n.id === edge.source);
        if (sourceNode) {
          const sourceOutput = sourceNode.data.outputs.find((o: any) => o.id === edge.sourceHandle);
          if (sourceOutput && !this.areTypesCompatible(sourceOutput.type, input.type)) {
            result.errors.push({
              stage: 'logic',
              nodeId: node.id,
              message: `Type mismatch: cannot connect ${sourceOutput.type} to ${input.type}`,
              details: { edge, sourceOutput, input }
            });
          }
        }
      }
    }
  }

  private async validateWorkflowLogic(workflow: WorkflowData, result: ValidationResult) {
    // 检查循环依赖
    const hasCycles = this.detectCycles(workflow.nodes, workflow.edges);
    if (hasCycles) {
      result.errors.push({
        stage: 'logic',
        message: 'Workflow contains circular dependencies',
        details: { cycles: hasCycles }
      });
    }

    // 验证执行顺序
    const executionOrder = this.getExecutionOrder(workflow.nodes, workflow.edges);
    if (!executionOrder) {
      result.errors.push({
        stage: 'logic',
        message: 'Cannot determine valid execution order',
        details: { nodes: workflow.nodes, edges: workflow.edges }
      });
    }
  }

  // 辅助方法
  private isTypeCompatible(actualType: string, expectedType: string): boolean {
    // 实现类型兼容性检查逻辑
    const typeMap: { [key: string]: string[] } = {
      'number': ['float', 'integer', 'numeric'],
      'string': ['text', 'string', 'csv'],
      'boolean': ['bool', 'boolean'],
      'object': ['json', 'object', 'map']
    };

    return typeMap[actualType]?.includes(expectedType) || actualType === expectedType;
  }

  private areTypesCompatible(sourceType: string, targetType: string): boolean {
    // 实现输入输出类型兼容性检查
    return this.isTypeCompatible(sourceType, targetType);
  }

  private detectCycles(nodes: any[], edges: any[]): boolean {
    // 实现循环依赖检测算法
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (hasCycle(node.id)) return true;
    }

    return false;
  }

  private getExecutionOrder(nodes: any[], edges: any[]): string[] | null {
    // 实现拓扑排序
    const graph = new Map();
    const inDegree = new Map();
    
    // 初始化图和入度
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // 构建图
    edges.forEach(edge => {
      graph.get(edge.source).push(edge.target);
      inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    });

    // 拓扑排序
    const queue = nodes.filter(node => inDegree.get(node.id) === 0).map(node => node.id);
    const order = [];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      order.push(nodeId);

      for (const neighbor of graph.get(nodeId)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    return order.length === nodes.length ? order : null;
  }

  private async validateEnvironment(workflow: WorkflowData, result: ValidationResult) {
    // 检查资源可用性
    const resources = await this.getRequiredResources(workflow);
    const availableResources = await this.getAvailableResources();

    for (const [resource, required] of Object.entries(resources)) {
      this.updateProgress({
        stage: 'environment',
        progress: 0,
        currentItem: resource,
        status: 'running',
        message: `Checking resource: ${resource}`,
        details: [`Required: ${required}`, `Checking availability...`]
      });

      const available = availableResources[resource] || 0;
      if (available < required) {
        result.errors.push({
          stage: 'environment',
          message: `Insufficient ${resource}`,
          details: { required, available }
        });
      }
    }
  }

  // ... 其他辅助方法 ...
} 