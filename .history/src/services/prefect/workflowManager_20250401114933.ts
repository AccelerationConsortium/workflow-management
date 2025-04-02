import { WorkflowData, WorkflowNode } from '../../types/workflow';
import { PrefectServerService } from './server';
import { WorkflowConverter } from './workflowConverter';
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
  private serverService: PrefectServerService;
  private workflowConverter: WorkflowConverter;
  private retryHandler: RetryHandler;
  private parameterHandler: ParameterHandler;
  private activeRuns: Map<string, ReturnType<typeof setInterval>>;
  private statusPollingInterval: number;
  private executionResults: Record<string, any> = {};

  constructor(
    serverService: PrefectServerService,
    workflowConverter: WorkflowConverter,
    retryConfig: Partial<RetryConfig> = {},
    fileUploadPath: string,
    statusPollingInterval = 5000
  ) {
    super();
    this.serverService = serverService;
    this.workflowConverter = workflowConverter;
    this.retryHandler = new RetryHandler(retryConfig);
    this.parameterHandler = new ParameterHandler(fileUploadPath);
    this.activeRuns = new Map();
    this.statusPollingInterval = statusPollingInterval;

    // 设置重试事件处理
    this.retryHandler.on('retry', (attempt, error, delay) => {
      this.emit('retry', 'workflow', attempt, error);
    });
  }

  async deployWorkflow(workflow: WorkflowData): Promise<string> {
    try {
      // Convert workflow to Prefect flow
      const flowDef = this.workflowConverter.convertToPrefectFlow(workflow);
      const flowScript = this.workflowConverter.generateFlowScript(flowDef);

      // Deploy flow to Prefect server
      const deploymentId = await this.serverService.deployFlow(flowScript, workflow.name);

      return deploymentId;
    } catch (error) {
      throw new Error(`Failed to deploy workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async startWorkflow(workflow: WorkflowData, parameters: Record<string, any> = {}): Promise<string> {
    try {
      // Prepare parameters for each node
      const nodeParameters: Record<string, any> = {};
      for (const node of workflow.nodes) {
        nodeParameters[node.id] = this.prepareNodeParameters(node, parameters);
      }

      // Start flow run
      const runId = await this.serverService.startFlowRun(workflow.name, nodeParameters);

      return runId;
    } catch (error) {
      throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private prepareNodeParameters(node: WorkflowNode, globalParams: Record<string, any>): Record<string, any> {
    const nodeParams: Record<string, any> = {};

    // Apply node-specific parameters
    if (node.data?.parameters) {
      for (const param of node.data.parameters) {
        nodeParams[param.name] = param.default;
      }
    }

    // Override with global parameters if provided
    if (globalParams[node.id]) {
      Object.assign(nodeParams, globalParams[node.id]);
    }

    return nodeParams;
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
