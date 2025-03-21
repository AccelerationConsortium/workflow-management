import { WorkerInfo, WorkerManager } from './workerManager';
import { DeviceDefinition } from '../../types/device';

export interface DeviceAllocationStrategy {
  name: string;
  priority: number;
  allocate: (
    deviceType: string,
    workers: WorkerInfo[],
    requirements?: Record<string, any>
  ) => WorkerInfo | null;
}

export class DeviceAllocationManager {
  private workerManager: WorkerManager;
  private deviceDefinitions: Map<string, DeviceDefinition>;
  private strategies: DeviceAllocationStrategy[];
  private deviceLocks: Map<string, string> = new Map(); // deviceId -> workerId

  constructor(
    workerManager: WorkerManager,
    deviceDefinitions: DeviceDefinition[],
    customStrategies: DeviceAllocationStrategy[] = []
  ) {
    this.workerManager = workerManager;
    this.deviceDefinitions = new Map(
      deviceDefinitions.map(def => [def.type, def])
    );
    this.strategies = [
      ...this.getDefaultStrategies(),
      ...customStrategies
    ].sort((a, b) => b.priority - a.priority);
  }

  /**
   * 为任务分配设备
   */
  public async allocateDevice(
    deviceType: string,
    requirements?: Record<string, any>
  ): Promise<WorkerInfo | null> {
    const deviceDef = this.deviceDefinitions.get(deviceType);
    if (!deviceDef) {
      throw new Error(`Unknown device type: ${deviceType}`);
    }

    const workers = Array.from(this.workerManager.getWorkersInfo().values());

    // 尝试每个策略
    for (const strategy of this.strategies) {
      const worker = strategy.allocate(deviceType, workers, requirements);
      if (worker) {
        // 检查设备是否已被锁定
        const deviceId = `${deviceType}_${worker.id}`;
        if (!this.deviceLocks.has(deviceId)) {
          this.lockDevice(deviceId, worker.id);
          return worker;
        }
      }
    }

    return null;
  }

  /**
   * 释放设备
   */
  public releaseDevice(deviceType: string, workerId: string): void {
    const deviceId = `${deviceType}_${workerId}`;
    this.deviceLocks.delete(deviceId);
  }

  /**
   * 锁定设备
   */
  private lockDevice(deviceId: string, workerId: string): void {
    this.deviceLocks.set(deviceId, workerId);
  }

  /**
   * 获取默认分配策略
   */
  private getDefaultStrategies(): DeviceAllocationStrategy[] {
    return [
      // 专用设备策略
      {
        name: 'dedicated',
        priority: 100,
        allocate: (deviceType, workers, requirements) => {
          if (requirements?.dedicated) {
            return workers.find(w => 
              w.tags.includes(`dedicated_${deviceType}`) &&
              w.status === 'healthy' &&
              w.currentLoad < 50
            ) || null;
          }
          return null;
        }
      },

      // 负载均衡策略
      {
        name: 'loadBalancing',
        priority: 80,
        allocate: (deviceType, workers) => {
          return this.workerManager.getBestWorkerForTask(deviceType);
        }
      },

      // 就近分配策略
      {
        name: 'proximity',
        priority: 60,
        allocate: (deviceType, workers, requirements) => {
          if (requirements?.location) {
            return workers.find(w =>
              w.tags.includes(`location_${requirements.location}`) &&
              w.deviceCapabilities.includes(`device_${deviceType}`) &&
              w.status === 'healthy'
            ) || null;
          }
          return null;
        }
      },

      // 资源优化策略
      {
        name: 'resourceOptimization',
        priority: 40,
        allocate: (deviceType, workers) => {
          return workers
            .filter(w => 
              w.deviceCapabilities.includes(`device_${deviceType}`) &&
              w.status === 'healthy'
            )
            .sort((a, b) => a.currentLoad - b.currentLoad)[0] || null;
        }
      },

      // 故障转移策略
      {
        name: 'failover',
        priority: 20,
        allocate: (deviceType, workers) => {
          return workers.find(w =>
            w.deviceCapabilities.includes(`device_${deviceType}`) &&
            w.status === 'healthy'
          ) || null;
        }
      }
    ];
  }

  /**
   * 获取设备分配状态
   */
  public getDeviceAllocationStatus(): Record<string, {
    deviceType: string;
    workerId: string;
    allocationTime: Date;
  }> {
    const status: Record<string, any> = {};
    this.deviceLocks.forEach((workerId, deviceId) => {
      const [deviceType] = deviceId.split('_');
      status[deviceId] = {
        deviceType,
        workerId,
        allocationTime: new Date()
      };
    });
    return status;
  }

  /**
   * 检查设备可用性
   */
  public isDeviceAvailable(deviceType: string, workerId: string): boolean {
    const deviceId = `${deviceType}_${workerId}`;
    return !this.deviceLocks.has(deviceId);
  }

  /**
   * 添加自定义分配策略
   */
  public addStrategy(strategy: DeviceAllocationStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
  }
} 
