import { WorkflowData, WorkflowNode } from '../../types/workflow';
import { PrefectServerService } from './server';
import { WorkflowConverter } from './workflowConverter';
import { RetryHandler, RetryConfig } from './errorHandler';
import { ParameterHandler } from './parameterHandler';
import { TypedEmitter } from 'tiny-typed-emitter';

interface WorkflowExecutionEvents {
  'status': (status: string) => void;
  'progress': (progress: number) => void;
  'error': (error: Error) => void;
  'complete': () => void;
}

export class WorkflowManager extends TypedEmitter<WorkflowExecutionEvents> {
  private serverService: PrefectServerService;
  private workflowConverter: WorkflowConverter;
  private retryHandler: RetryHandler;
  private parameterHandler: ParameterHandler;
  private statusPollingInterval: number;
  private executionResults: Map<string, any>;
  private pollingTimer?: NodeJS.Timeout;

  constructor(
    serverService: PrefectServerService,
    workflowConverter: WorkflowConverter,
    retryConfig: RetryConfig = {},
    fileUploadPath: string,
    statusPollingInterval = 5000
  ) {
    super();
    this.serverService = serverService;
    this.workflowConverter = workflowConverter;
    this.retryHandler = new RetryHandler(retryConfig);
    this.parameterHandler = new ParameterHandler(fileUploadPath);
    this.statusPollingInterval = statusPollingInterval;
    this.executionResults = new Map();
  }

  async executeWorkflow(workflow: WorkflowData): Promise<string> {
    try {
      // Convert workflow to Prefect flow
      const flowDef = this.workflowConverter.convertToPrefectFlow(workflow);
      const flowScript = this.workflowConverter.generateFlowScript(flowDef);

      // Deploy flow to Prefect server
      const deploymentId = await this.retryHandler.withRetry(
        async () => this.serverService.deployFlow(flowScript, workflow.name),
        'flow deployment'
      );

      // Start workflow execution
      const runId = await this.retryHandler.withRetry(
        async () => {
          // Resolve parameters for all nodes
          const parameters: Record<string, any> = {};
          for (const node of workflow.nodes) {
            parameters[node.id] = await this.parameterHandler.resolveNodeParameters(
              node.id,
              this.executionResults
            );
          }
          return this.serverService.startFlowRun(workflow.name, parameters);
        },
        'flow execution'
      );

      // Start status polling
      this.startStatusPolling(runId);

      return runId;
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private startStatusPolling(runId: string): void {
    this.pollingTimer = setInterval(async () => {
      try {
        const status = await this.serverService.getFlowRunStatus(runId);
        this.emit('status', status.status);

        if (status.status === 'completed') {
          this.stopStatusPolling();
          this.emit('complete');
        } else if (status.status === 'failed') {
          this.stopStatusPolling();
          this.emit('error', new Error('Workflow execution failed'));
        }

        // Calculate and emit progress
        const completedTasks = status.tasks.filter(t => 
          t.status === 'completed' || t.status === 'failed'
        ).length;
        const totalTasks = status.tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        this.emit('progress', progress);

      } catch (error) {
        this.emit('error', error instanceof Error ? error : new Error(String(error)));
      }
    }, this.statusPollingInterval);
  }

  private stopStatusPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = undefined;
    }
  }

  async stopWorkflow(runId: string): Promise<void> {
    try {
      await this.serverService.stopFlowRun(runId);
      this.stopStatusPolling();
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async getWorkflowLogs(runId: string): Promise<string[]> {
    try {
      return await this.serverService.getFlowRunLogs(runId);
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
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

  /**
   * 清理资源
   */
  public dispose() {
    this.stopStatusPolling();
    this.removeAllListeners();
  }
} 
