import { WorkflowNode } from '../../types/workflow';
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

export type NodeMapping = {
  type: NodeType;
  label: string;
  description: string;
  parameters: Array<{
    name: string;
    label: string;
    type: 'number' | 'string' | 'boolean' | 'select';
    default?: any;
    options?: string[];
    unit?: string;
  }>;
  validation?: {
    required?: string[];
    dependencies?: Record<string, string[]>;
    rules?: Record<string, Array<{
      type: 'range' | 'pattern' | 'custom';
      value: any;
      message: string;
    }>>;
  };
};

export const nodeTypeMapping: Record<NodeType, NodeMapping> = {
  pump: {
    type: 'pump',
    label: 'Pump Control',
    description: 'Control liquid flow rate and volume',
    parameters: [
      {
        name: 'flowRate',
        label: 'Flow Rate',
        type: 'number',
        default: 1.0,
        unit: 'mL/min'
      },
      {
        name: 'volume',
        label: 'Volume',
        type: 'number',
        default: 10.0,
        unit: 'mL'
      }
    ],
    validation: {
      required: ['flowRate', 'volume'],
      rules: {
        flowRate: [
          {
            type: 'range',
            value: [0.1, 10.0],
            message: 'Flow rate must be between 0.1 and 10.0 mL/min'
          }
        ],
        volume: [
          {
            type: 'range',
            value: [0.1, 100.0],
            message: 'Volume must be between 0.1 and 100.0 mL'
          }
        ]
      }
    }
  },
  valve: {
    type: 'valve',
    label: 'Valve Control',
    description: 'Control valve position',
    parameters: [
      {
        name: 'position',
        label: 'Position',
        type: 'select',
        default: 'closed',
        options: ['open', 'closed']
      }
    ]
  },
  hotplate: {
    type: 'hotplate',
    label: 'Hotplate Control',
    description: 'Control temperature and stirring',
    parameters: [
      {
        name: 'temperature',
        label: 'Temperature',
        type: 'number',
        default: 25.0,
        unit: '°C'
      },
      {
        name: 'stirringSpeed',
        label: 'Stirring Speed',
        type: 'number',
        default: 0,
        unit: 'rpm'
      }
    ]
  },
  sensor: {
    type: 'sensor',
    label: 'Sensor Control',
    description: 'Read sensor data',
    parameters: [
      {
        name: 'sensorType',
        label: 'Sensor Type',
        type: 'select',
        default: 'temperature',
        options: ['temperature', 'pH', 'pressure']
      },
      {
        name: 'interval',
        label: 'Reading Interval',
        type: 'number',
        default: 1.0,
        unit: 's'
      }
    ]
  },
  balance: {
    type: 'balance',
    label: 'Balance Control',
    description: 'Measure mass',
    parameters: [
      {
        name: 'mode',
        label: 'Measurement Mode',
        type: 'select',
        default: 'single',
        options: ['single', 'continuous']
      }
    ]
  },
  robot: {
    type: 'robot',
    label: 'Robot Control',
    description: 'Control robotic arm',
    parameters: [
      {
        name: 'position',
        label: 'Target Position',
        type: 'string',
        default: 'home'
      },
      {
        name: 'speed',
        label: 'Movement Speed',
        type: 'number',
        default: 50,
        unit: '%'
      }
    ]
  }
};

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

export function mapNodeToType(node: WorkflowNode): NodeMapping {
  const mapping = nodeTypeMapping[node.type as NodeType];
  if (!mapping) {
    throw new Error(`Unknown node type: ${node.type}`);
  }
  return mapping;
}

export default {
  registerNodeMapping,
  getTaskDefinition,
  generateTaskCode,
  mapNodeToType
}; 
