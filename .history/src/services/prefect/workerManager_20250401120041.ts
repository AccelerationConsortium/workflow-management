import { TypedEmitter } from 'tiny-typed-emitter';
import { PrefectServerService, WorkerInfo as ServerWorkerInfo } from './server';
import { RetryHandler } from './errorHandler';

export interface WorkerInfo extends ServerWorkerInfo {
  currentLoad: number;  // 0-100
  runningTasks: number;
  maxConcurrentTasks: number;
}

export interface WorkerEvents {
  'healthChange': (workerId: string, status: WorkerInfo['status']) => void;
  'overload': (workerId: string, load: number) => void;
  'offline': (workerId: string) => void;
  'error': (workerId: string, error: Error) => void;
}

export interface WorkerManagerConfig {
  healthCheckInterval?: number;
  loadThreshold?: number;
  heartbeatTimeout?: number;
  maxConcurrentTasks?: number;
}

export class WorkerManager extends TypedEmitter<WorkerEvents> {
  private workers: Map<string, WorkerInfo>;
  private readonly serverService: PrefectServerService;
  private readonly retryHandler: RetryHandler;
  private healthCheckInterval: NodeJS.Timeout | null;
  private readonly config: Required<WorkerManagerConfig>;

  private static readonly DEFAULT_CONFIG: Required<WorkerManagerConfig> = {
    healthCheckInterval: 30000, // 30 seconds
    loadThreshold: 80,         // 80% load threshold
    heartbeatTimeout: 60000,   // 60 seconds
    maxConcurrentTasks: 5
  };

  constructor(
    serverService: PrefectServerService,
    retryHandler: RetryHandler,
    config: WorkerManagerConfig = {}
  ) {
    super();
    this.serverService = serverService;
    this.retryHandler = retryHandler;
    this.workers = new Map();
    this.healthCheckInterval = null;
    this.config = { ...WorkerManager.DEFAULT_CONFIG, ...config };
  }

  /**
   * 启动 Worker 管理
   */
  public async start(): Promise<void> {
    try {
      await this.refreshWorkers();
      this.startHealthCheck();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Failed to start worker manager: ${err.message}`);
    }
  }

  /**
   * 停止 Worker 管理
   */
  public stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * 刷新 Worker 列表
   */
  private async refreshWorkers(): Promise<void> {
    try {
      const workers = await this.retryHandler.withRetry(
        () => this.serverService.getAvailableWorkers(),
        'refresh workers'
      );

      // 更新 worker 信息
      const currentWorkerIds = new Set<string>();
      
      for (const worker of workers) {
        currentWorkerIds.add(worker.id);
        const existingWorker = this.workers.get(worker.id);
        
        this.workers.set(worker.id, {
          ...worker,
          status: existingWorker?.status ?? 'healthy',
          lastHeartbeat: new Date(),
          currentLoad: existingWorker?.currentLoad ?? 0,
          runningTasks: existingWorker?.runningTasks ?? 0,
          maxConcurrentTasks: existingWorker?.maxConcurrentTasks ?? this.config.maxConcurrentTasks,
          deviceCapabilities: worker.labels?.filter(tag => tag.startsWith('device_')) ?? []
        });
      }

      // 移除不存在的 workers
      for (const [workerId] of this.workers) {
        if (!currentWorkerIds.has(workerId)) {
          this.workers.delete(workerId);
          this.emit('offline', workerId);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Failed to refresh workers: ${err.message}`);
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const [workerId, worker] of this.workers.entries()) {
        try {
          // 检查心跳超时
          const heartbeatAge = Date.now() - worker.lastHeartbeat.getTime();
          if (heartbeatAge > this.config.heartbeatTimeout) {
            this.updateWorkerStatus(workerId, 'offline');
            continue;
          }

          // 检查负载
          if (worker.currentLoad > this.config.loadThreshold) {
            this.emit('overload', workerId, worker.currentLoad);
          }

          // 更新健康状态
          const isHealthy = await this.checkWorkerHealth(workerId);
          this.updateWorkerStatus(workerId, isHealthy ? 'healthy' : 'unhealthy');

        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.emit('error', workerId, err);
          this.updateWorkerStatus(workerId, 'unhealthy');
        }
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * 检查单个 Worker 的健康状态
   */
  private async checkWorkerHealth(workerId: string): Promise<boolean> {
    const worker = this.workers.get(workerId);
    if (!worker) return false;

    try {
      const [processStatus, resourceStatus] = await Promise.all([
        this.retryHandler.withRetry(
          () => this.serverService.checkWorkerProcess(workerId),
          'check worker process'
        ),
        this.retryHandler.withRetry(
          () => this.serverService.checkWorkerResources(workerId),
          'check worker resources'
        )
      ]);

      return processStatus && resourceStatus;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', workerId, err);
      return false;
    }
  }

  /**
   * 更新 Worker 状态
   */
  private updateWorkerStatus(workerId: string, status: WorkerInfo['status']): void {
    const worker = this.workers.get(workerId);
    if (worker && worker.status !== status) {
      worker.status = status;
      this.emit('healthChange', workerId, status);
    }
  }

  /**
   * 获取最佳 Worker 用于任务执行
   */
  public getBestWorkerForTask(deviceType: string): WorkerInfo | null {
    const eligibleWorkers = Array.from(this.workers.values()).filter(worker => 
      worker.status === 'healthy' &&
      worker.deviceCapabilities.includes(`device_${deviceType}`) &&
      worker.runningTasks < worker.maxConcurrentTasks
    );

    if (eligibleWorkers.length === 0) {
      return null;
    }

    // 使用加权负载均衡算法
    return eligibleWorkers.reduce((best, current) => {
      const bestScore = this.calculateWorkerScore(best);
      const currentScore = this.calculateWorkerScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * 计算 Worker 得分（用于负载均衡）
   */
  private calculateWorkerScore(worker: WorkerInfo): number {
    const loadFactor = 1 - (worker.currentLoad / 100);
    const taskFactor = 1 - (worker.runningTasks / worker.maxConcurrentTasks);
    const healthFactor = worker.status === 'healthy' ? 1 : 0;

    return (loadFactor * 0.4 + taskFactor * 0.4 + healthFactor * 0.2);
  }

  /**
   * 更新 Worker 负载信息
   */
  public updateWorkerLoad(workerId: string, taskChange: number): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.runningTasks = Math.max(0, worker.runningTasks + taskChange);
      worker.currentLoad = (worker.runningTasks / worker.maxConcurrentTasks) * 100;

      if (worker.currentLoad > this.config.loadThreshold) {
        this.emit('overload', workerId, worker.currentLoad);
      }
    }
  }

  /**
   * 获取所有 Worker 信息
   */
  public getWorkersInfo(): ReadonlyMap<string, Readonly<WorkerInfo>> {
    return this.workers;
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.stop();
    this.removeAllListeners();
    this.workers.clear();
  }
} 
