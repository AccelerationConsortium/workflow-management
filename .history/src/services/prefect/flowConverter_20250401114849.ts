import { WorkflowData, WorkflowNode } from '../../types/workflow';
import { PrefectTaskDefinition, PrefectTaskConverter } from './taskConverter';

export interface PrefectFlow {
  name: string;
  tasks: PrefectTaskDefinition[];
  dependencies: { [key: string]: string[] };
  tags: string[];
  parameters: Record<string, any>;
}

export class PrefectFlowConverter {
  private taskConverter: PrefectTaskConverter;

  constructor(taskConverter: PrefectTaskConverter) {
    this.taskConverter = taskConverter;
  }

  public convertToPrefectFlow(workflow: WorkflowData): PrefectFlow {
    // Convert nodes to tasks
    const tasks = workflow.nodes.map((node: WorkflowNode) => 
      this.taskConverter.convertNodeToTask(node)
    );

    // Build dependencies map
    const dependencies: { [key: string]: string[] } = {};
    workflow.connections.forEach(connection => {
      const sourceTask = tasks.find((t: PrefectTaskDefinition) => t.name.endsWith(connection.source));
      const targetTask = tasks.find((t: PrefectTaskDefinition) => t.name.endsWith(connection.target));

      if (sourceTask && targetTask) {
        if (!dependencies[targetTask.name]) {
          dependencies[targetTask.name] = [];
        }
        dependencies[targetTask.name].push(sourceTask.name);
      }
    });

    // Generate Prefect flow
    return {
      name: workflow.name,
      tasks,
      dependencies,
      tags: ['workflow', `workflow_${workflow.id}`],
      parameters: {}  // Global workflow parameters if needed
    };
  }

  public generatePrefectCode(flow: PrefectFlow): string {
    return `
from prefect import flow, task, get_run_logger
from typing import Dict, Any
import json
import os

${flow.tasks.map(task => task.script).join('\n\n')}

${flow.tasks.map(task => `
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
    return await run_${task.fn_name.split('run_')[1]}(**params)
`).join('\n')}

@flow(
    name="${flow.name}",
    tags=${JSON.stringify(flow.tags)}
)
async def workflow_flow(parameters: Dict[str, Dict[str, Any]]):
    logger = get_run_logger()
    tasks = {}

    ${Object.entries(flow.dependencies).map(([taskName, deps]) => `
    # Execute ${taskName}
    tasks["${taskName}"] = await ${taskName.split('_')[0].toLowerCase()}_task(
        parameters["${taskName}"]
    )${deps.length > 0 ? '.submit()' : ''}
    `).join('\n')}

    # Wait for all tasks to complete
    for task in tasks.values():
        if hasattr(task, 'wait'):
            await task.wait()

if __name__ == "__main__":
    # Load parameters from environment or configuration
    parameters = json.loads(os.getenv("WORKFLOW_PARAMETERS", "{}"))
    workflow_flow(parameters)
`;
  }
} 
