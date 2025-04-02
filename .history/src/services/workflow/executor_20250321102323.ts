import { 
  Workflow, 
  WorkflowNode, 
  ValidationResult 
} from '../../types/workflow';
import { WorkflowValidator } from './validator';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';

export interface NodeExecutionState {
  status: ExecutionStatus;
  error?: string;
  startTime?: number;
  endTime?: number;
  progress?: number;
}

export interface WorkflowExecutionState {
  status: ExecutionStatus;
  nodeStates: Map<string, NodeExecutionState>;
  startTime?: number;
  endTime?: number;
}

export interface ExecutionOptions {
  mode: 'simulation' | 'production';
  timeout?: number;
  retryAttempts?: number;
}

export class WorkflowExecutor {
  private workflow: Workflow;
  private validator: WorkflowValidator;
  private executionState: WorkflowExecutionState;
  private options: ExecutionOptions;
  private nodeHandlers: Map<string, (node: WorkflowNode) => Promise<void>>;

  constructor(
    workflow: Workflow, 
    validator: WorkflowValidator,
    options: ExecutionOptions,
    nodeHandlers: Map<string, (node: WorkflowNode) => Promise<void>>
  ) {
    this.workflow = workflow;
    this.validator = validator;
    this.options = options;
    this.nodeHandlers = nodeHandlers;
    this.executionState = {
      status: 'pending',
      nodeStates: new Map()
    };
  }

  public async execute(): Promise<void> {
    try {
      // Validate workflow before execution
      const validationResult = this.validator.validateWorkflow(this.workflow);
      if (!validationResult.isValid) {
        throw new Error(`Workflow validation failed: ${validationResult.messages[0].message}`);
      }

      // Initialize execution state
      this.initializeExecutionState();

      // Get execution order
      const executionOrder = this.determineExecutionOrder();

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        await this.executeNode(nodeId);
      }

      this.executionState.status = 'completed';
      this.executionState.endTime = Date.now();

    } catch (error) {
      this.executionState.status = 'failed';
      this.executionState.endTime = Date.now();
      throw error;
    }
  }

  public pause(): void {
    if (this.executionState.status === 'running') {
      this.executionState.status = 'paused';
    }
  }

  public resume(): void {
    if (this.executionState.status === 'paused') {
      this.executionState.status = 'running';
    }
  }

  public getExecutionState(): WorkflowExecutionState {
    return this.executionState;
  }

  private initializeExecutionState(): void {
    this.executionState = {
      status: 'running',
      nodeStates: new Map(),
      startTime: Date.now()
    };

    this.workflow.nodes.forEach(node => {
      this.executionState.nodeStates.set(node.id, {
        status: 'pending',
        progress: 0
      });
    });
  }

  private determineExecutionOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const inDegree = new Map<string, number>();

    // Calculate in-degree for each node
    this.workflow.nodes.forEach(node => inDegree.set(node.id, 0));
    this.workflow.connections.forEach(conn => {
      const count = inDegree.get(conn.target) || 0;
      inDegree.set(conn.target, count + 1);
    });

    // Find nodes with no dependencies
    const queue = this.workflow.nodes
      .filter(node => (inDegree.get(node.id) || 0) === 0)
      .map(node => node.id);

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        order.push(nodeId);

        // Update in-degree for connected nodes
        const outgoing = this.workflow.connections
          .filter(conn => conn.source === nodeId)
          .map(conn => conn.target);

        outgoing.forEach(targetId => {
          const newCount = (inDegree.get(targetId) || 0) - 1;
          inDegree.set(targetId, newCount);
          if (newCount === 0) {
            queue.push(targetId);
          }
        });
      }
    }

    return order;
  }

  private async executeNode(nodeId: string): Promise<void> {
    const node = this.workflow.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const nodeState = this.executionState.nodeStates.get(nodeId)!;
    nodeState.status = 'running';
    nodeState.startTime = Date.now();

    try {
      const handler = this.nodeHandlers.get(node.type);
      if (!handler) {
        throw new Error(`No handler found for node type: ${node.type}`);
      }

      await handler(node);

      nodeState.status = 'completed';
      nodeState.progress = 100;
      nodeState.endTime = Date.now();

    } catch (error) {
      nodeState.status = 'failed';
      nodeState.error = error instanceof Error ? error.message : 'Unknown error';
      nodeState.endTime = Date.now();
      throw error;
    }
  }
} 
