import { NodeType } from '../../types/workflow';

export interface TaskParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array';
  required: boolean;
  default?: any;
  description?: string;
}

export interface TaskDefinition {
  name: string;
  description: string;
  parameters: Record<string, TaskParameter>;
  outputs: string[];
  pythonModule: string;  // Python模块路径
  flowFunction: string;  // Prefect flow函数名
  retries?: number;     // 重试次数
  retry_delay_seconds?: number;
}

// 节点类型到Prefect任务的映射
const NODE_MAPPINGS: Record<NodeType, TaskDefinition> = {
  hotplateControl: {
    name: 'Hotplate Control',
    description: 'Control temperature and stirring of a hotplate',
    parameters: {
      targetTemperature: {
        name: 'target_temperature',
        type: 'number',
        required: true,
        description: 'Target temperature in Celsius'
      },
      stirringSpeed: {
        name: 'stirring_speed',
        type: 'number',
        required: true,
        description: 'Stirring speed in RPM'
      },
      rampRate: {
        name: 'ramp_rate',
        type: 'number',
        required: false,
        default: 10,
        description: 'Temperature ramp rate in °C/min'
      }
    },
    outputs: ['current_temperature', 'current_speed', 'status'],
    pythonModule: 'lcp.devices.hotplate',
    flowFunction: 'hotplate_control_flow',
    retries: 3,
    retry_delay_seconds: 5
  },
  // 其他节点类型的映射将在这里添加
} as const;

// 用于注册新的节点类型映射
export function registerNodeMapping(
  nodeType: NodeType,
  definition: TaskDefinition
): void {
  if (NODE_MAPPINGS[nodeType]) {
    console.warn(`Overwriting existing mapping for node type: ${nodeType}`);
  }
  NODE_MAPPINGS[nodeType] = definition;
}

// 获取节点类型的任务定义
export function getTaskDefinition(nodeType: NodeType): TaskDefinition {
  const definition = NODE_MAPPINGS[nodeType];
  if (!definition) {
    throw new Error(`No task definition found for node type: ${nodeType}`);
  }
  return definition;
}

// 生成节点的Prefect任务代码
export function generateTaskCode(
  nodeType: NodeType,
  nodeId: string,
  parameters: Record<string, any>
): string {
  const definition = getTaskDefinition(nodeType);
  
  // 生成参数验证代码
  const paramValidations = Object.entries(definition.parameters)
    .map(([key, param]) => {
      if (param.required && !parameters[key]) {
        throw new Error(`Missing required parameter: ${key}`);
      }
      return `    ${param.name} = parameters.get("${key}", ${JSON.stringify(param.default)})`;
    })
    .join('\n');

  return `
@task(
    name="${definition.name}",
    retries=${definition.retries || 0},
    retry_delay_seconds=${definition.retry_delay_seconds || 0}
)
async def ${nodeId}_task(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    ${definition.description}
    """
${paramValidations}
    
    # Initialize device
    device = await initialize_device("${nodeId}")
    
    # Set parameters
    await device.set_parameters({
        ${Object.entries(definition.parameters)
          .map(([key, param]) => `"${param.name}": ${param.name}`)
          .join(',\n        ')}
    })
    
    # Monitor status
    status = await device.get_status()
    
    return {
        ${definition.outputs.map(output => `"${output}": status.${output}`).join(',\n        ')}
    }
`;
}

export default {
  registerNodeMapping,
  getTaskDefinition,
  generateTaskCode
}; 
