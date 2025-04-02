import axios, { AxiosInstance, AxiosError } from 'axios';
import { EventEmitter } from 'events';
import { WorkflowData } from '../../types/workflow';
import { PrefectFlow } from './flowConverter';

export interface PrefectServerConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export type FlowRunStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TaskStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'skipped';

export interface TaskRunStatus {
  id: string;
  name: string;
  status: TaskStatusType;
  start_time?: string;
  end_time?: string;
  error?: string;
  retries?: number;
}

export interface FlowRunStatus {
  id: string;
  status: FlowRunStatusType;
  start_time?: string;
  end_time?: string;
  tasks: TaskRunStatus[];
  error?: string;
}

export interface WorkerResources {
  cpu: number;
  memory: number;
  gpu?: number;
  disk?: number;
}

export interface WorkerInfo {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastHeartbeat: string;
  resources: WorkerResources;
  version?: string;
  labels?: string[];
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  task_run_id?: string;
  flow_run_id: string;
}

export class PrefectServerService extends EventEmitter {
  private config: Required<PrefectServerConfig>;
  private axios: AxiosInstance;

  constructor(config: PrefectServerConfig) {
    super();
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey ?? '',
      timeout: config.timeout ?? 10000
    };

    this.axios = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: this.config.timeout,
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        this.handleAxiosError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleAxiosError(error: AxiosError): void {
    if (error.response) {
      throw new Error(`Server responded with error ${error.response.status}: ${error.response.data}`);
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }

  /**
   * 部署工作流到 Prefect Server
   */
  public async deployFlow(flow: PrefectFlow, pythonCode: string): Promise<string> {
    try {
      // 1. 创建部署包
      const deploymentPayload = {
        name: flow.name,
        flow_name: flow.name,
        tags: flow.tags,
        parameters: flow.parameters,
        python_code: pythonCode
      };

      // 2. 发送部署请求
      const response = await this.axios.post('/deployments', deploymentPayload);
      return response.data.id;

    } catch (error) {
      console.error('Failed to deploy flow:', error);
      throw new Error(`Failed to deploy flow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 启动工作流执行
   */
  public async startFlowRun(deploymentId: string, parameters: Record<string, any>): Promise<string> {
    try {
      const response = await this.axios.post('/flow-runs', {
        deployment_id: deploymentId,
        parameters
      });

      return response.data.id;

    } catch (error) {
      console.error('Failed to start flow run:', error);
      throw new Error(`Failed to start flow run: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取工作流运行状态
   */
  public async getFlowRunStatus(flowRunId: string): Promise<FlowRunStatus> {
    try {
      const statusResponse = await this.axios.get(`/flow-runs/${flowRunId}`);
      const taskResponse = await this.axios.get(`/flow-runs/${flowRunId}/tasks`);

      return {
        id: statusResponse.data.id,
        status: statusResponse.data.status,
        start_time: statusResponse.data.start_time,
        end_time: statusResponse.data.end_time,
        tasks: taskResponse.data.map((task: any) => ({
          id: task.id,
          name: task.name,
          status: task.status,
          start_time: task.start_time,
          end_time: task.end_time,
        })),
      };

    } catch (error) {
      console.error('Failed to get flow run status:', error);
      throw new Error(`Failed to get flow run status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 停止工作流执行
   */
  public async stopFlowRun(flowRunId: string): Promise<void> {
    try {
      await this.axios.post(`/flow-runs/${flowRunId}/stop`);
    } catch (error) {
      console.error('Failed to stop flow run:', error);
      throw new Error(`Failed to stop flow run: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取工作流执行日志
   */
  public async getFlowRunLogs(flowRunId: string): Promise<LogEntry[]> {
    try {
      const response = await this.axios.get<LogEntry[]>(`/flow-runs/${flowRunId}/logs`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.handleAxiosError(error);
      }
      throw new Error(`Failed to get flow run logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取可用的 Worker/Agent
   */
  public async getAvailableWorkers(): Promise<WorkerInfo[]> {
    try {
      const response = await this.axios.get<WorkerInfo[]>('/workers');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.handleAxiosError(error);
      }
      throw new Error(`Failed to get available workers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 检查 Prefect Server 健康状态
   */
  public async checkServerHealth(): Promise<boolean> {
    try {
      const response = await this.axios.get('/health');
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Failed to check server health:', error);
      return false;
    }
  }
} 
