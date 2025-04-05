import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { WorkflowData } from '../../types/workflow';
import { PrefectFlow } from './flowConverter';

export interface PrefectServerConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface FlowRunStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  start_time?: string;
  end_time?: string;
  tasks: Array<{
    id: string;
    name: string;
    status: string;
    start_time?: string;
    end_time?: string;
  }>;
}

export interface WorkerInfo {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastHeartbeat: string;
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
}

export class PrefectServerService {
  private config: PrefectServerConfig;
  private axios: AxiosInstance;

  constructor(config: PrefectServerConfig) {
    this.config = config;
    this.axios = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
    });
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
      throw new Error(`Failed to deploy flow: ${error.message}`);
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
      throw new Error(`Failed to start flow run: ${error.message}`);
    }
  }

  /**
   * 获取工作流运行状态
   */
  public async getFlowRunStatus(flowRunId: string): Promise<FlowRunStatus> {
    try {
      const [flowResponse, tasksResponse] = await Promise.all([
        this.axios.get(`/flow-runs/${flowRunId}`),
        this.axios.get(`/flow-runs/${flowRunId}/task-runs`)
      ]);

      return {
        id: flowResponse.data.id,
        name: flowResponse.data.name,
        status: flowResponse.data.state.type,
        state_timestamp: flowResponse.data.state.timestamp,
        tasks: tasksResponse.data.map(task => ({
          id: task.id,
          name: task.name,
          status: task.state.type,
          state_timestamp: task.state.timestamp,
          logs: task.logs
        }))
      };

    } catch (error) {
      console.error('Failed to get flow run status:', error);
      throw new Error(`Failed to get flow run status: ${error.message}`);
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
      throw new Error(`Failed to stop flow run: ${error.message}`);
    }
  }

  /**
   * 获取工作流执行日志
   */
  public async getFlowRunLogs(flowRunId: string): Promise<Record<string, string[]>> {
    try {
      const response = await this.axios.get(`/flow-runs/${flowRunId}/logs`);
      
      // 按任务组织日志
      const logsByTask: Record<string, string[]> = {};
      response.data.forEach(log => {
        if (!logsByTask[log.task_run_id]) {
          logsByTask[log.task_run_id] = [];
        }
        logsByTask[log.task_run_id].push(log.message);
      });

      return logsByTask;

    } catch (error) {
      console.error('Failed to get flow run logs:', error);
      throw new Error(`Failed to get flow run logs: ${error.message}`);
    }
  }

  /**
   * 获取可用的 Worker/Agent
   */
  public async getAvailableWorkers(): Promise<Array<{id: string, name: string, tags: string[]}>> {
    try {
      const response = await this.axios.get('/workers');
      return response.data.map(worker => ({
        id: worker.id,
        name: worker.name,
        tags: worker.tags
      }));

    } catch (error) {
      console.error('Failed to get available workers:', error);
      throw new Error(`Failed to get available workers: ${error.message}`);
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
