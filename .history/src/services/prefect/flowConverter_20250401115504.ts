import { WorkflowData, WorkflowNode, Connection } from '../../types/workflow';
import { PrefectTaskDefinition, PrefectTaskConverter } from './taskConverter';

export interface PrefectFlowConfig {
  retries?: number;
  retry_delay_seconds?: number;
  timeout_seconds?: number;
  max_concurrency?: number;
  version?: string;
}

export interface PrefectFlowDependency {
  upstream_task: string;
  downstream_task: string;
  condition?: string;
}

export interface PrefectFlow {
  name: string;
  tasks: PrefectTaskDefinition[];
  dependencies: Record<string, string[]>;
  tags: string[];
  parameters: Record<string, unknown>;
  config?: PrefectFlowConfig;
  metadata?: {
    description?: string;
    version?: string;
    created_at: string;
    updated_at: string;
  };
}

export class PrefectFlowConverter {
  private taskConverter: PrefectTaskConverter;
  private readonly defaultConfig: PrefectFlowConfig = {
    retries: 3,
    retry_delay_seconds: 30,
    timeout_seconds: 3600,
    max_concurrency: 10,
    version: '1.0.0'
  };

  constructor(taskConverter: PrefectTaskConverter, config?: Partial<PrefectFlowConfig>) {
    this.taskConverter = taskConverter;
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  public convertToPrefectFlow(workflow: WorkflowData): PrefectFlow {
    const tasks = this.convertNodes(workflow.nodes);
    const dependencies = this.buildDependencyMap(workflow.connections, tasks);
    
    return {
      name: this.sanitizeFlowName(workflow.name),
      tasks,
      dependencies,
      tags: this.generateFlowTags(workflow),
      parameters: this.extractWorkflowParameters(workflow),
      config: this.defaultConfig,
      metadata: {
        description: workflow.description,
        version: workflow.version || '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  private convertNodes(nodes: WorkflowNode[]): PrefectTaskDefinition[] {
    return nodes.map(node => this.taskConverter.convertNodeToTask(node));
  }

  private buildDependencyMap(
    connections: Connection[],
    tasks: PrefectTaskDefinition[]
  ): Record<string, string[]> {
    const dependencies: Record<string, string[]> = {};

    for (const connection of connections) {
      const sourceTask = this.findTaskByNodeId(tasks, connection.source);
      const targetTask = this.findTaskByNodeId(tasks, connection.target);

      if (sourceTask && targetTask) {
        if (!dependencies[targetTask.name]) {
          dependencies[targetTask.name] = [];
        }
        dependencies[targetTask.name].push(sourceTask.name);
      }
    }

    return dependencies;
  }

  private findTaskByNodeId(tasks: PrefectTaskDefinition[], nodeId: string): PrefectTaskDefinition | undefined {
    return tasks.find(task => task.name.endsWith(nodeId));
  }

  private sanitizeFlowName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }

  private generateFlowTags(workflow: WorkflowData): string[] {
    const tags = ['workflow'];
    if (workflow.id) {
      tags.push(`workflow_${workflow.id}`);
    }
    if (workflow.tags) {
      tags.push(...workflow.tags);
    }
    return tags;
  }

  private extractWorkflowParameters(workflow: WorkflowData): Record<string, unknown> {
    const parameters: Record<string, unknown> = {};
    workflow.nodes.forEach(node => {
      if (node.parameters) {
        parameters[node.id] = node.parameters;
      }
    });
    return parameters;
  }

  public generatePrefectCode(flow: PrefectFlow): string {
    const imports = this.generateImports();
    const taskDefinitions = this.generateTaskDefinitions(flow.tasks);
    const flowDefinition = this.generateFlowDefinition(flow);
    const mainBlock = this.generateMainBlock();

    return [imports, taskDefinitions, flowDefinition, mainBlock].join('\n\n');
  }

  private generateImports(): string {
    return `
from prefect import flow, task, get_run_logger
from typing import Dict, Any, Optional
import json
import os
import asyncio
from datetime import datetime, timedelta`;
  }

  private generateTaskDefinitions(tasks: PrefectTaskDefinition[]): string {
    return tasks.map(task => `
${task.script}

@task(
    name="${task.name}",
    tags=${JSON.stringify(task.tags)},
    retries=${task.retries},
    retry_delay_seconds=${task.retry_delay_seconds},
    timeout_seconds=${task.timeout_seconds}
)
async def ${task.fn_name}(params: Dict[str, Any]) -> Dict[str, Any]:
    logger = get_run_logger()
    logger.info(f"Starting {task.name} with parameters: {params}")
    try:
        result = await run_${task.fn_name.split('run_')[1]}(**params)
        logger.info(f"Completed {task.name}")
        return result
    except Exception as e:
        logger.error(f"Error in {task.name}: {str(e)}")
        raise
`).join('\n\n');
  }

  private generateFlowDefinition(flow: PrefectFlow): string {
    const config = flow.config || this.defaultConfig;
    return `
@flow(
    name="${flow.name}",
    tags=${JSON.stringify(flow.tags)},
    retries=${config.retries},
    retry_delay_seconds=${config.retry_delay_seconds},
    timeout_seconds=${config.timeout_seconds},
    version="${config.version}"
)
async def workflow_flow(parameters: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    logger = get_run_logger()
    tasks: Dict[str, Any] = {}
    results: Dict[str, Any] = {}

    ${Object.entries(flow.dependencies)
      .map(([taskName, deps]) => `
    # Execute ${taskName}
    ${deps.length > 0 ? `# Dependencies: ${deps.join(', ')}` : ''}
    tasks["${taskName}"] = ${taskName.split('_')[0].toLowerCase()}_task(
        parameters.get("${taskName}", {})
    )${deps.length > 0 ? '.submit()' : ''}`)
      .join('\n')}

    # Wait for all tasks to complete and collect results
    for task_name, task in tasks.items():
        try:
            if hasattr(task, 'wait'):
                results[task_name] = await task.wait()
            else:
                results[task_name] = await task
        except Exception as e:
            logger.error(f"Task {task_name} failed: {str(e)}")
            raise

    return results`;
  }

  private generateMainBlock(): string {
    return `
if __name__ == "__main__":
    # Load parameters from environment or configuration
    parameters = json.loads(os.getenv("WORKFLOW_PARAMETERS", "{}"))
    asyncio.run(workflow_flow(parameters))`;
  }
} 
