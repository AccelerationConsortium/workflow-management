import { Workflow } from '../../types/workflow';
import { PrefectFlowConverter } from './flowConverter';
import { PrefectServerService, FlowRunStatus } from './server';
import { TypedEmitter } from 'tiny-typed-emitter';

export interface WorkflowExecutionEvents {
  status: (status: FlowRunStatus) => void;
  error: (error: Error) => void;
  completed: (result: any) => void;
  log: (taskId: string, message: string) => void;
}

export class WorkflowManager extends TypedEmitter<WorkflowExecutionEvents> {
  private flowConverter: PrefectFlowConverter;
  private serverService: PrefectServerService;
  private activeRuns: Map<string, ReturnType<typeof setInterval>>;
  private statusPollingInterval: number;

  constructor(
    flowConverter: PrefectFlowConverter,
    serverService: PrefectServerService,
    statusPollingInterval = 5000
  ) {
    super();
    this.flowConverter = flowConverter;
    this.serverService = serverService;
    this.activeRuns = new Map();
    this.statusPollingInterval = statusPollingInterval;
  }

  /**
   * 部署并执行工作流
   */
  public async executeWorkflow(workflow: Workflow): Promise<string> {
    try {
      // 1. 转换工作流为 Prefect Flow
      const flow = this.flowConverter.convertToPrefectFlow(workflow);
      const pythonCode = this.flowConverter.generatePrefectCode(flow);

      // 2. 部署到 Prefect Server
      const deploymentId = await this.serverService.deployFlow(flow, pythonCode);

      // 3. 启动工作流执行
      const runId = await this.serverService.startFlowRun(deploymentId, flow.parameters);

      // 4. 开始状态监控
      this.startStatusPolling(runId);

      return runId;

    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 停止工作流执行
   */
  public async stopWorkflow(runId: string): Promise<void> {
    try {
      await this.serverService.stopFlowRun(runId);
      this.stopStatusPolling(runId);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 获取工作流状态
   */
  public async getWorkflowStatus(runId: string): Promise<FlowRunStatus> {
    try {
      return await this.serverService.getFlowRunStatus(runId);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  private startStatusPolling(runId: string) {
    const poll = async () => {
      try {
        const status = await this.serverService.getFlowRunStatus(runId);
        this.emit('status', status);

        // 检查日志更新
        const logs = await this.serverService.getFlowRunLogs(runId);
        Object.entries(logs).forEach(([taskId, messages]) => {
          messages.forEach(message => {
            this.emit('log', taskId, message);
          });
        });

        // 检查是否完成
        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          this.stopStatusPolling(runId);
          if (status.status === 'completed') {
            this.emit('completed', status);
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
