import axios, { AxiosInstance, AxiosError } from 'axios';
import { PrefectFlow } from './flowConverter';
import { WorkflowExecutionState, ExecutionStatus } from '../workflow/executor';

export interface PrefectServerConfig {
  apiUrl: string;
  apiKey?: string;
}

export interface FlowRunStatus {
  id: string;
  status: string;
  start_time?: string;
  end_time?: string;
  tasks: {
    id: string;
    name: string;
    status: string;
    start_time?: string;
    end_time?: string;
    logs?: string[];
  }[];
}

export class PrefectService {
  private config: PrefectServerConfig;
  private axios: AxiosInstance;

  constructor(config: PrefectServerConfig) {
    this.config = config;
    this.axios = axios.create({
      baseURL: config.apiUrl,
      headers: config.apiKey ? {
        'Authorization': `Bearer ${config.apiKey}`
      } : {}
    });
  }

  // 部署工作流
  public async deployFlow(flow: PrefectFlow, pythonCode: string): Promise<string> {
    try {
      // 创建部署
      const deploymentResponse = await this.axios.post('/deployments', {
        name: `${flow.name}_deployment`,
        flow_name: flow.name,
        tags: flow.tags,
        parameters: flow.parameters,
        python_code: pythonCode
      });

      return deploymentResponse.data.id;
    } catch (error) {
      throw new Error(`Failed to deploy flow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 运行工作流
  public async runFlow(deploymentId: string, parameters: Record<string, any>): Promise<string> {
    try {
      const runResponse = await this.axios.post('/flow-runs', {
        deployment_id: deploymentId,
        parameters
      });

      return runResponse.data.id;
    } catch (error) {
      throw new Error(`Failed to start flow run: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 获取运行状态
  public async getFlowRunStatus(runId: string): Promise<FlowRunStatus> {
    try {
      const statusResponse = await this.axios.get(`/flow-runs/${runId}`);
      const taskResponse = await this.axios.get(`/flow-runs/${runId}/tasks`);

      return {
        id: statusResponse.data.id,
        status: statusResponse.data.status,
        start_time: statusResponse.data.start_time,
        end_time: statusResponse.data.end_time,
        tasks: taskResponse.data.map(task => ({
          id: task.id,
          name: task.name,
          status: task.status,
          start_time: task.start_time,
          end_time: task.end_time,
          logs: task.logs
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get flow run status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 转换 Prefect 状态到工作流执行状态
  public convertToWorkflowState(flowStatus: FlowRunStatus): WorkflowExecutionState {
    const status = this.mapPrefectStatus(flowStatus.status);
    const nodeStates = new Map();

    flowStatus.tasks.forEach(task => {
      const nodeId = task.name.split('_').pop()!; // 从任务名称中提取节点ID
      nodeStates.set(nodeId, {
        status: this.mapPrefectStatus(task.status),
        startTime: task.start_time ? new Date(task.start_time).getTime() : undefined,
        endTime: task.end_time ? new Date(task.end_time).getTime() : undefined,
        error: task.status === 'failed' ? task.logs?.join('\n') : undefined
      });
    });

    return {
      status,
      nodeStates,
      startTime: flowStatus.start_time ? new Date(flowStatus.start_time).getTime() : undefined,
      endTime: flowStatus.end_time ? new Date(flowStatus.end_time).getTime() : undefined
    };
  }

  // 取消工作流运行
  public async cancelFlowRun(runId: string): Promise<void> {
    try {
      await this.axios.post(`/flow-runs/${runId}/cancel`);
    } catch (error) {
      throw new Error(`Failed to cancel flow run: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 获取工作流日志
  public async getFlowLogs(runId: string): Promise<string[]> {
    try {
      const logsResponse = await this.axios.get(`/flow-runs/${runId}/logs`);
      return logsResponse.data.map(log => log.message);
    } catch (error) {
      throw new Error(`Failed to get flow logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private mapPrefectStatus(prefectStatus: string): ExecutionStatus {
    const statusMap: Record<string, ExecutionStatus> = {
      'scheduled': 'pending',
      'pending': 'pending',
      'running': 'running',
      'completed': 'completed',
      'failed': 'failed',
      'cancelled': 'failed',
      'paused': 'paused'
    };
    return statusMap[prefectStatus] || 'failed';
  }
} 
