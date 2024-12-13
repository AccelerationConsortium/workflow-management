interface ResourceStatus {
  nodeId: string;
  type: string;
  status: 'idle' | 'busy' | 'queued';
  utilizationRate: number;
  startTime?: number;
  endTime?: number;
}

class ResourceMonitor {
  private resources: Map<string, ResourceStatus> = new Map();

  updateStatus(nodeId: string, status: Partial<ResourceStatus>) {
    const current = this.resources.get(nodeId) || {
      nodeId,
      type: 'unknown',
      status: 'idle',
      utilizationRate: 0
    };
    
    this.resources.set(nodeId, { ...current, ...status });
  }

  getResourceStatus(nodeId: string): ResourceStatus | undefined {
    return this.resources.get(nodeId);
  }

  getAllResources(): ResourceStatus[] {
    return Array.from(this.resources.values());
  }

  calculateUtilization(nodeId: string): number {
    const status = this.resources.get(nodeId);
    if (!status || !status.startTime || !status.endTime) return 0;
    
    const totalTime = status.endTime - status.startTime;
    const busyTime = status.status === 'busy' ? totalTime : 0;
    return (busyTime / totalTime) * 100;
  }
}

export const resourceMonitor = new ResourceMonitor(); 