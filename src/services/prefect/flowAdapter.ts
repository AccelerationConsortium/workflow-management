import { ValidationContext } from '../validation/types';
import { TaskExecutorFactory } from './taskExecutors';
import { IWorkflowService } from '../workflow/interfaces/IWorkflowService';
import { getPrefectConfig, PrefectConfig } from './config';

interface PrefectTaskConfig {
  name: string;
  parameters: Record<string, any>;
  retries?: number;
  retry_delay_seconds?: number;
  cache_key?: string;
  tags?: string[];
  upstream_tasks?: string[];
}

interface PrefectFlowConfig {
  name: string;
  description?: string;
  version?: string;
  tasks: Map<string, PrefectTaskConfig>;
  schedule?: any;
  parameters?: Record<string, any>;
  tags?: string[];
}

/**
 * Prefect Flow Adapter
 * Converts our workflow definition to Prefect flow format
 */
export class PrefectFlowAdapter {
  private taskExecutorFactory: TaskExecutorFactory;
  private prefectConfig: PrefectConfig;

  constructor(workflowService: IWorkflowService) {
    this.taskExecutorFactory = new TaskExecutorFactory(workflowService);
    this.prefectConfig = getPrefectConfig();
  }

  /**
   * Convert workflow to Prefect flow definition
   */
  convertToPrefectFlow(context: ValidationContext): PrefectFlowConfig {
    const { workflow, nodes, connections } = context;
    
    // 1. Create flow configuration
    const flowConfig: PrefectFlowConfig = {
      name: workflow.name,
      description: workflow.description,
      version: workflow.version,
      tasks: new Map(),
      tags: [...(this.prefectConfig.defaultTags || []), ...(workflow.tags || [])],
      parameters: workflow.parameters
    };

    // 2. Convert nodes to Prefect tasks
    this.convertNodesToPrefectTasks(nodes, flowConfig);

    // 3. Set up task dependencies based on connections
    this.setupTaskDependencies(connections, flowConfig);

    return flowConfig;
  }

  private convertNodesToPrefectTasks(
    nodes: Map<string, any>,
    flowConfig: PrefectFlowConfig
  ): void {
    for (const [nodeId, node] of nodes) {
      const taskConfig: PrefectTaskConfig = {
        name: `${node.type}_${nodeId}`,
        parameters: {
          ...node.parameters,
          nodeId,
          nodeType: node.type
        },
        retries: this.prefectConfig.retryConfig?.maxRetries,
        retry_delay_seconds: this.prefectConfig.retryConfig?.retryDelay,
        tags: node.tags || [],
        upstream_tasks: []
      };

      // Add caching for data processing and file input tasks
      if (['DataProcessing', 'FileInput'].includes(node.type)) {
        taskConfig.cache_key = this.generateCacheKey(nodeId, node);
      }

      flowConfig.tasks.set(nodeId, taskConfig);
    }
  }

  private setupTaskDependencies(
    connections: Map<string, any>,
    flowConfig: PrefectFlowConfig
  ): void {
    for (const connection of connections.values()) {
      const downstreamTask = flowConfig.tasks.get(connection.targetNodeId);
      if (downstreamTask) {
        downstreamTask.upstream_tasks = downstreamTask.upstream_tasks || [];
        downstreamTask.upstream_tasks.push(connection.sourceNodeId);
      }
    }
  }

  private generateCacheKey(nodeId: string, node: any): string {
    const params = JSON.stringify(node.parameters);
    return `${node.type}_${nodeId}_${params}`;
  }
}

/**
 * Task Executor Interface
 */
export interface TaskExecutor {
  execute(parameters: any): Promise<any>;
  handleError(error: Error): Promise<void>;
  cleanup(): Promise<void>;
}

/**
 * Base Task Executor
 */
export abstract class BaseTaskExecutor implements TaskExecutor {
  protected nodeId: string;
  protected nodeType: string;

  constructor(nodeId: string, nodeType: string) {
    this.nodeId = nodeId;
    this.nodeType = nodeType;
  }

  abstract execute(parameters: any): Promise<any>;

  async handleError(error: Error): Promise<void> {
    console.error(`Error executing ${this.nodeType} task for node ${this.nodeId}:`, error);
  }

  async cleanup(): Promise<void> {
    // Implement cleanup logic if needed
  }
}

/**
 * Prefect Flow Runner
 * Handles the execution of converted flows
 */
export class PrefectFlowRunner {
  constructor(private flowAdapter: PrefectFlowAdapter) {}

  async executeFlow(context: ValidationContext): Promise<Map<string, any>> {
    const flowConfig = this.flowAdapter.convertToPrefectFlow(context);
    const results = new Map<string, any>();
    
    // Execute tasks in topological order
    const executionOrder = this.getExecutionOrder(flowConfig);
    
    for (const nodeId of executionOrder) {
      const taskConfig = flowConfig.tasks.get(nodeId)!;
      
      // Wait for upstream tasks to complete
      if (taskConfig.upstream_tasks) {
        for (const upstreamId of taskConfig.upstream_tasks) {
          if (!results.has(upstreamId)) {
            throw new Error(`Upstream task ${upstreamId} not completed`);
          }
        }
      }
      
      try {
        const result = await this.executeTask(nodeId, taskConfig);
        results.set(nodeId, result);
      } catch (error) {
        console.error(`Failed to execute task ${nodeId}:`, error);
        throw error;
      }
    }
    
    return results;
  }

  private getExecutionOrder(flowConfig: PrefectFlowConfig): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      
      const taskConfig = flowConfig.tasks.get(nodeId)!;
      if (taskConfig.upstream_tasks) {
        for (const upstreamId of taskConfig.upstream_tasks) {
          visit(upstreamId);
        }
      }
      
      visited.add(nodeId);
      order.push(nodeId);
    };
    
    for (const nodeId of flowConfig.tasks.keys()) {
      visit(nodeId);
    }
    
    return order;
  }

  private async executeTask(nodeId: string, taskConfig: PrefectTaskConfig): Promise<any> {
    // Implementation will be added when integrating with actual Prefect server
    throw new Error('Task execution not implemented');
  }
}

// Example task executor for HotplateControl
export class HotplateControlExecutor extends BaseTaskExecutor {
  async execute(parameters: any): Promise<any> {
    const { temperature, duration, stirringSpeed } = parameters;
    
    try {
      // TODO: Implement actual device control logic
      console.log(`Setting hotplate temperature to ${temperature}°C`);
      console.log(`Setting duration to ${duration}s`);
      if (stirringSpeed) {
        console.log(`Setting stirring speed to ${stirringSpeed} RPM`);
      }
      
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, duration * 1000));
      
      return {
        success: true,
        actualTemperature: temperature,
        executionTime: duration,
      };
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }
}

// Add more task executors for other node types... 
