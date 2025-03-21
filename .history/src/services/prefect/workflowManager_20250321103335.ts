import { Workflow } from '../../types/workflow';
import { PrefectFlowConverter } from './flowConverter';
import { PrefectServerService, FlowRunStatus } from './server';
import { RetryHandler, RetryConfig } from './errorHandler';
import { ParameterHandler } from './parameterHandler';
import { TypedEmitter } from 'tiny-typed-emitter';

export interface WorkflowExecutionEvents {
  status: (status: FlowRunStatus) => void;
  error: (error: Error) => void;
  completed: (result: any) => void;
  log: (taskId: string, message: string) => void;
  retry: (taskId: string, attempt: number, error: Error) => void;
}

export class WorkflowManager extends TypedEmitter<WorkflowExecutionEvents> {
  private flowConverter: PrefectFlowConverter;
  private serverService: PrefectServerService;
  private retryHandler: RetryHandler;
  private parameterHandler: ParameterHandler;
  private activeRuns: Map<string, ReturnType<typeof setInterval>>;
  private statusPollingInterval: number;
  private executionResults: Record<string, any> = {};

  constructor(
    flowConverter: PrefectFlowConverter,
    serverService: PrefectServerService,
    retryConfig: Partial<RetryConfig> = {},
    fileUploadPath: string,
    statusPollingInterval = 5000
  ) {
    super();
    this.flowConverter = flowConverter;
    this.serverService = serverService;
    this.retryHandler = new RetryHandler(retryConfig);
    this.parameterHandler = new ParameterHandler(fileUploadPath);
    this.activeRuns = new Map();
    this.statusPollingInterval = statusPollingInterval;

    // 设置重试事件处理
    this.retryHandler.on('retry', (attempt, error, delay) => {
      this.emit('retry', 'workflow', attempt, error);
    });
  }

  /**
   * 部署并执行工作流
   */
  public async executeWorkflow(workflow: Workflow): Promise<string> {
    try {
      // 1. 转换工作流为 Prefect Flow
      const flow = this.flowConverter.convertToPrefectFlow(workflow);
      const pythonCode = this.flowConverter.generatePrefectCode(flow);

      // 2. 部署到 Prefect Server（使用重试机制）
      const deploymentId = await this.retryHandler.withRetry(
        async () => this.serverService.deployFlow(flow, pythonCode),
        'flow deployment'
      );

      // 3. 启动工作流执行
      const runId = await this.retryHandler.withRetry(
        async () => {
          // 解析所有节点的参数
          const parameters: Record<string, any> = {};
          for (const node of workflow.nodes) {
            parameters[node.id] = await this.parameterHandler.resolveNodeParameters(
              node.id,
              this.executionResults
            );
          }
          return this.serverService.startFlowRun(deploymentId, parameters);
        },
        'flow execution'
      );

      // 4. 开始状态监控
      this.startStatusPolling(runId);

      return runId;

    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 注册节点参数
   */
  public registerNodeParameters(
    nodeId: string,
    parameters: Record<string, any>
  ): void {
    this.parameterHandler.registerNodeParameters(
      { id: nodeId } as any,
      parameters
    );
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
    this.parameterHandler.setParameterDependency(
      targetNodeId,
      targetParam,
      sourceNodeId,
      sourceOutput
    );
  }

  private async startStatusPolling(runId: string) {
    const poll = async () => {
      try {
        const status = await this.retryHandler.withRetry(
          async () => this.serverService.getFlowRunStatus(runId),
          'status polling'
        );
        
        this.emit('status', status);

        // 更新执行结果
        status.tasks.forEach(task => {
          if (task.status === 'completed') {
            this.executionResults[task.id] = task;
          }
        });

        // 检查日志更新
        const logs = await this.retryHandler.withRetry(
          async () => this.serverService.getFlowRunLogs(runId),
          'log fetching'
        );
        
        Object.entries(logs).forEach(([taskId, messages]) => {
          messages.forEach(message => {
            this.emit('log', taskId, message);
          });
        });

        // 检查是否完成
        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          this.stopStatusPolling(runId);
          if (status.status === 'completed') {
            this.emit('completed', this.executionResults);
          } else {
            this.emit('error', new Error(`Workflow ${status.status}`));
          }
        }

      } catch (error) {
        this.emit('error', error as Error);
      }
    };

    const intervalId = setInterval(poll, this.statusPollingInterval);
    this.activeRuns.set(runId, intervalId);
  }

  private stopStatusPolling(runId: string) {
    const intervalId = this.activeRuns.get(runId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeRuns.delete(runId);
    }
  }

  /**
   * 清理资源
   */
  public dispose() {
    this.activeRuns.forEach((intervalId) => clearInterval(intervalId));
    this.activeRuns.clear();
    this.removeAllListeners();
  }
} 
