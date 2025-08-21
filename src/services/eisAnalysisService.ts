/**
 * EIS Analysis Service
 * 处理与EIS分析API的通信和数据管理
 */

import { EventEmitter } from 'events';

// 分析任务接口
export interface AnalysisTask {
  id: string;
  nodeId: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

// EIS数据文件接口
export interface EISDataFiles {
  acFile?: File | string;
  dcFile?: File | string;
  metadata?: {
    experimentId: string;
    timestamp: Date;
    parameters?: any;
  };
}

// 分析参数接口
export interface AnalysisParameters {
  circuitModel?: 'auto' | 'randles' | 'modified-randles' | 'custom';
  fittingAlgorithm?: 'levenberg-marquardt' | 'trust-region' | 'differential-evolution';
  maxIterations?: number;
  tolerance?: number;
  frequencyRange?: [number, number];
  customCircuit?: string;
}

// API响应接口
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// EIS分析服务类
export class EISAnalysisService extends EventEmitter {
  private static instance: EISAnalysisService;
  private apiEndpoint: string;
  private apiKey: string;
  private tasks: Map<string, AnalysisTask>;
  private retryConfig: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };

  private constructor() {
    super();
    this.apiEndpoint = process.env.REACT_APP_EIS_API_ENDPOINT || 'https://huggingface.co/spaces/YOUR_SPACE/eis-analyzer/api';
    this.apiKey = process.env.REACT_APP_EIS_API_KEY || '';
    this.tasks = new Map();
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    };
  }

  // 获取服务实例（单例模式）
  public static getInstance(): EISAnalysisService {
    if (!EISAnalysisService.instance) {
      EISAnalysisService.instance = new EISAnalysisService();
    }
    return EISAnalysisService.instance;
  }

  // 配置API设置
  public configure(endpoint: string, apiKey: string): void {
    this.apiEndpoint = endpoint;
    this.apiKey = apiKey;
  }

  // 提交分析任务
  public async submitAnalysis(
    nodeId: string,
    workflowId: string,
    dataFiles: EISDataFiles,
    parameters?: AnalysisParameters
  ): Promise<AnalysisTask> {
    const taskId = this.generateTaskId();
    const task: AnalysisTask = {
      id: taskId,
      nodeId,
      workflowId,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };

    this.tasks.set(taskId, task);
    this.emit('taskCreated', task);

    try {
      // 准备表单数据
      const formData = new FormData();
      
      // 添加数据文件
      if (dataFiles.acFile) {
        if (dataFiles.acFile instanceof File) {
          formData.append('ac_file', dataFiles.acFile);
        } else {
          const acBlob = await this.fetchFileAsBlob(dataFiles.acFile);
          formData.append('ac_file', acBlob, 'ac_data.csv');
        }
      }

      if (dataFiles.dcFile) {
        if (dataFiles.dcFile instanceof File) {
          formData.append('dc_file', dataFiles.dcFile);
        } else {
          const dcBlob = await this.fetchFileAsBlob(dataFiles.dcFile);
          formData.append('dc_file', dcBlob, 'dc_data.csv');
        }
      }

      // 添加参数
      formData.append('parameters', JSON.stringify({
        ...parameters,
        taskId,
        nodeId,
        workflowId,
        metadata: dataFiles.metadata
      }));

      // 提交到API
      const response = await this.postWithRetry(`${this.apiEndpoint}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // 更新任务状态
      task.status = 'running';
      this.emit('taskUpdated', task);

      // 开始轮询任务状态
      this.pollTaskStatus(taskId, result.taskId || taskId);

      return task;

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.endTime = new Date();
      this.emit('taskFailed', task);
      throw error;
    }
  }

  // 获取任务状态
  public getTask(taskId: string): AnalysisTask | undefined {
    return this.tasks.get(taskId);
  }

  // 获取所有任务
  public getAllTasks(): AnalysisTask[] {
    return Array.from(this.tasks.values());
  }

  // 取消任务
  public async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'completed' || task.status === 'failed') {
      return;
    }

    try {
      await fetch(`${this.apiEndpoint}/cancel/${taskId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      task.status = 'failed';
      task.error = 'Cancelled by user';
      task.endTime = new Date();
      this.emit('taskCancelled', task);
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  }

  // 获取分析结果可视化URL
  public getVisualizationUrl(taskId: string): string {
    return `${this.apiEndpoint.replace('/api', '')}/visualize/${taskId}`;
  }

  // 下载分析结果
  public async downloadResults(taskId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.apiEndpoint}/download/${taskId}?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download results');
    }

    return response.blob();
  }

  // 批量分析
  public async batchAnalysis(
    tasks: Array<{
      nodeId: string;
      dataFiles: EISDataFiles;
      parameters?: AnalysisParameters;
    }>,
    workflowId: string
  ): Promise<AnalysisTask[]> {
    const promises = tasks.map(task => 
      this.submitAnalysis(task.nodeId, workflowId, task.dataFiles, task.parameters)
    );

    return Promise.all(promises);
  }

  // 私有方法

  // 生成任务ID
  private generateTaskId(): string {
    return `eis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取文件内容
  private async fetchFileAsBlob(filePath: string): Promise<Blob> {
    // 实际实现中，这里需要从工作流文件系统获取文件
    const response = await fetch(`/api/workflow/files/${encodeURIComponent(filePath)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${filePath}`);
    }
    return response.blob();
  }

  // 带重试的POST请求
  private async postWithRetry(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.retryDelay;

    for (let i = 0; i <= this.retryConfig.maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        lastError = error as Error;
        if (i < this.retryConfig.maxRetries) {
          await this.sleep(delay);
          delay *= this.retryConfig.backoffMultiplier;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  // 轮询任务状态
  private async pollTaskStatus(taskId: string, apiTaskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const maxPolls = 120; // 最多轮询2分钟
    let polls = 0;

    while (polls < maxPolls && task.status === 'running') {
      try {
        const response = await fetch(`${this.apiEndpoint}/status/${apiTaskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to get task status');
        }

        const status = await response.json();

        // 更新进度
        if (status.progress !== undefined) {
          task.progress = status.progress;
          this.emit('taskProgress', task);
        }

        // 检查完成状态
        if (status.status === 'completed') {
          task.status = 'completed';
          task.progress = 100;
          task.result = status.result;
          task.endTime = new Date();
          
          // 添加可视化URL
          if (task.result) {
            task.result.visualizationUrl = this.getVisualizationUrl(apiTaskId);
          }
          
          this.emit('taskCompleted', task);
          break;
        } else if (status.status === 'failed') {
          task.status = 'failed';
          task.error = status.error || 'Analysis failed';
          task.endTime = new Date();
          this.emit('taskFailed', task);
          break;
        }

        // 等待后继续轮询
        await this.sleep(1000);
        polls++;

      } catch (error) {
        console.error('Polling error:', error);
        if (polls >= maxPolls - 1) {
          task.status = 'failed';
          task.error = 'Polling timeout';
          task.endTime = new Date();
          this.emit('taskFailed', task);
        }
      }
    }

    if (polls >= maxPolls && task.status === 'running') {
      task.status = 'failed';
      task.error = 'Analysis timeout';
      task.endTime = new Date();
      this.emit('taskFailed', task);
    }
  }

  // 延时函数
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 清理过期任务
  public cleanupOldTasks(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const tasksToRemove: string[] = [];

    this.tasks.forEach((task, id) => {
      if (task.endTime && now - task.endTime.getTime() > maxAge) {
        tasksToRemove.push(id);
      }
    });

    tasksToRemove.forEach(id => this.tasks.delete(id));
  }
}

// 导出单例实例
export const eisAnalysisService = EISAnalysisService.getInstance();