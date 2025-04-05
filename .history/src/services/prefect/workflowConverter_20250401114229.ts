import { Workflow, WorkflowNode, WorkflowConnection, WorkflowData } from '../../types/workflow';
import { PrefectTaskConverter, PrefectTaskDefinition } from './taskConverter';
import { DeviceDefinition } from '../../types/device';

export interface PrefectFlowDefinition {
  name: string;
  description?: string;
  tasks: PrefectTaskDefinition[];
  dependencies: Array<{
    upstream_task: string;
    downstream_task: string;
  }>;
}

export class WorkflowConverter {
  private taskConverter: PrefectTaskConverter;

  constructor(deviceDefinitions: DeviceDefinition[]) {
    this.taskConverter = new PrefectTaskConverter(deviceDefinitions);
  }

  /**
   * Convert a workflow to a Prefect flow definition
   */
  public convertToPrefectFlow(workflow: WorkflowData): PrefectFlowDefinition {
    // Convert nodes to tasks
    const tasks = workflow.nodes.map(node => 
      this.taskConverter.convertNodeToTask(node)
    );

    // Convert connections to dependencies
    const dependencies = workflow.connections.map(conn => ({
      upstream_task: conn.source,
      downstream_task: conn.target
    }));

    return {
      name: workflow.metadata?.name || 'Untitled Flow',
      description: workflow.metadata?.description || '',
      tasks,
      dependencies
    };
  }

  /**
   * Generate Prefect flow Python script
   */
  public generateFlowScript(flowDef: PrefectFlowDefinition): string {
    return `
from prefect import flow, task, get_run_logger
from typing import Dict, Any
import json

${flowDef.tasks.map(task => task.script).join('\n\n')}

@flow(name="${flowDef.name}", description="${flowDef.description || ''}")
def ${this.sanitizeFlowName(flowDef.name)}(**flow_params):
    logger = get_run_logger()
    logger.info(f"Starting flow: {flow_params}")
    
    # Create tasks
    ${this.generateTaskCreation(flowDef)}
    
    # Execute flow with dependencies
    ${this.generateFlowExecution(flowDef)}

if __name__ == "__main__":
    ${this.sanitizeFlowName(flowDef.name)}()
`;
  }

  /**
   * Generate task creation code
   */
  private generateTaskCreation(flowDef: PrefectFlowDefinition): string {
    return flowDef.tasks.map(task => `
    # Create task: ${task.name}
    ${task.name}_future = ${task.fn_name}.submit(
        **flow_params.get("${task.name}", {}),
        retries=${task.retries},
        retry_delay_seconds=${task.retry_delay_seconds},
        timeout_seconds=${task.timeout_seconds},
        tags=${JSON.stringify(task.tags)}
    )`).join('\n');
  }

  /**
   * Generate flow execution code with dependencies
   */
  private generateFlowExecution(flowDef: PrefectFlowDefinition): string {
    // Group dependencies by downstream task
    const dependencyGroups = new Map<string, string[]>();
    
    flowDef.dependencies.forEach(dep => {
      const existing = dependencyGroups.get(dep.downstream_task) || [];
      existing.push(dep.upstream_task);
      dependencyGroups.set(dep.downstream_task, existing);
    });

    // Generate execution code with .wait_for()
    return Array.from(dependencyGroups.entries()).map(([downstream, upstreams]) => `
    # Wait for upstream tasks
    ${upstreams.map(up => `${up}_result = ${up}_future.wait()`).join('\n    ')}
    
    # Execute downstream task with dependencies
    ${downstream}_future = ${downstream}_future.wait()`).join('\n');
  }

  /**
   * Sanitize flow name for Python function name
   */
  private sanitizeFlowName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[^a-z]/, 'flow_$&');
  }

  /**
   * Validate workflow before conversion
   */
  private validateWorkflow(workflow: WorkflowData): void {
    // Check for cycles
    if (this.hasCycles(workflow)) {
      throw new Error('Workflow contains cycles');
    }

    // Check for disconnected nodes
    if (this.hasDisconnectedNodes(workflow)) {
      throw new Error('Workflow contains disconnected nodes');
    }

    // Validate node references in connections
    workflow.connections.forEach(conn => {
      const sourceExists = workflow.nodes.some(n => n.id === conn.source);
      const targetExists = workflow.nodes.some(n => n.id === conn.target);

      if (!sourceExists || !targetExists) {
        throw new Error('Connection references non-existent node');
      }
    });
  }

  /**
   * Check for cycles in the workflow
   */
  private hasCycles(workflow: WorkflowData): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = workflow.connections.filter(
        conn => conn.source === nodeId
      );

      for (const conn of outgoingConnections) {
        const targetId = conn.target;
        
        if (!visited.has(targetId)) {
          if (dfs(targetId)) return true;
        } else if (recursionStack.has(targetId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  /**
   * Check for disconnected nodes
   */
  private hasDisconnectedNodes(workflow: WorkflowData): boolean {
    const connectedNodes = new Set<string>();
    
    workflow.connections.forEach(conn => {
      connectedNodes.add(conn.source);
      connectedNodes.add(conn.target);
    });

    return workflow.nodes.some(node => !connectedNodes.has(node.id));
  }
} 
