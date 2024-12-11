type NodeStatus = 'idle' | 'running' | 'completed' | 'error';

interface NodeState {
  status: NodeStatus;
  message?: string;
  progress?: number;
  startTime?: Date;
  endTime?: Date;
} 