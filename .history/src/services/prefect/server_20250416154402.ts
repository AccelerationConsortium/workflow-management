import axios, { AxiosInstance, AxiosError } from 'axios';
import { EventEmitter } from 'events';
import { WorkflowData } from '../../types/workflow';
import { PrefectFlow } from './flowConverter';
import { Logger } from '../../utils/logger';

export interface PrefectServerConfig {
  apiUrl: string;
  apiKey?: string;
}

export type FlowRunStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TaskStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'skipped';

export interface FlowRunStatus {
  id: string;
  name: string;
  state: {
    type: string;
    name: string;
  };
  created: string;
  start_time: string | null;
  end_time: string | null;
}

export interface TaskRunStatus {
  id: string;
  name: string;
  flow_run_id: string;
  state: {
    type: string;
    name: string;
  };
  created: string;
  start_time: string | null;
  end_time: string | null;
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
  last_heartbeat_time: string;
  status: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  task_run_id?: string;
  flow_run_id: string;
}

export class PrefectServerService extends EventEmitter {
  private config: PrefectServerConfig;
  private logger: Logger;
  private axios: AxiosInstance;

  constructor(config: PrefectServerConfig, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
    
    this.axios = axios.create({
      baseURL: config.apiUrl,
      headers: config.apiKey ? {
        'Authorization': `Bearer ${config.apiKey}`
      } : {}
    });

    // 添加响应拦截器用于记录错误
    this.axios.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response) {
          this.logger.error(`Prefect Server API error: ${error.response.status} ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          this.logger.error(`Prefect Server API error: No response received: ${error.message}`);
        } else {
          this.logger.error(`Prefect Server API error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 部署流程
   */
  public async deployFlow(flowName: string, entrypointPath: string, parameters?: Record<string, any>): Promise<string> {
    try {
      const response = await this.axios.post('/api/deployments', {
        name: flowName,
        entrypoint: entrypointPath,
        parameters: parameters || {}
      });
      return response.data.id;
    } catch (error: unknown) {
      throw new Error(`Failed to deploy flow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 启动流程运行
   */
  public async startFlowRun(deploymentId: string, parameters?: Record<string, any>): Promise<string> {
    try {
      const response = await this.axios.post('/api/flow_runs', {
        deployment_id: deploymentId,
        parameters: parameters || {}
      });
      return response.data.id;
    } catch (error: unknown) {
      throw new Error(`Failed to start flow run: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取流程运行状态
   */
  public async getFlowRunStatus(flowRunId: string): Promise<FlowRunStatus> {
    try {
      const response = await this.axios.get(`/api/flow_runs/${flowRunId}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to get flow run status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 获取任务运行状态
   */
  public async getTaskRunStatuses(flowRunId: string): Promise<TaskRunStatus[]> {
    try {
      const response = await this.axios.get(`/api/task_runs`, {
        params: {
          flow_run_id: flowRunId
        }
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to get task run statuses: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 停止流程运行
   */
  public async stopFlowRun(flowRunId: string): Promise<void> {
    try {
      await this.axios.post(`/api/flow_runs/${flowRunId}/cancel`);
    } catch (error: unknown) {
      throw new Error(`Failed to stop flow run: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 获取流程日志
   */
  public async getFlowLogs(flowRunId: string): Promise<string[]> {
    try {
      const response = await this.axios.get(`/api/flow_runs/${flowRunId}/logs`);
      return response.data.map((log: any) => log.message);
    } catch (error: unknown) {
      throw new Error(`Failed to get flow logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 获取工作节点信息
   */
  public async getWorkerInfo(): Promise<WorkerInfo[]> {
    try {
      const response = await this.axios.get('/api/workers');
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to get worker info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 检查服务器健康状态
   */
  public async checkServerHealth(): Promise<boolean> {
    try {
      const response = await this.axios.get('/health');
      return response.status === 200;
    } catch (error: unknown) {
      this.logger.error(`Prefect server health check failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
} 
