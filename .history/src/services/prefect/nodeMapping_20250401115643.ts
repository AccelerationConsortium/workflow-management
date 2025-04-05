import { WorkflowNode } from '../../types/workflow';
import { NodeType } from '../../types/workflow';

export type ParameterType = 'number' | 'string' | 'boolean' | 'array' | 'select' | 'object';
export type ValidationRuleType = 'range' | 'pattern' | 'custom' | 'required' | 'dependency';

export interface BaseParameter {
  name: string;
  label: string;
  type: ParameterType;
  description?: string;
  required?: boolean;
  default?: unknown;
}

export interface NumericParameter extends BaseParameter {
  type: 'number';
  default?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface StringParameter extends BaseParameter {
  type: 'string';
  default?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface BooleanParameter extends BaseParameter {
  type: 'boolean';
  default?: boolean;
}

export interface SelectParameter extends BaseParameter {
  type: 'select';
  options: Array<{
    value: string;
    label: string;
  }>;
  default?: string;
  multiple?: boolean;
}

export interface ArrayParameter extends BaseParameter {
  type: 'array';
  itemType: Exclude<ParameterType, 'array'>;
  default?: unknown[];
  minItems?: number;
  maxItems?: number;
}

export interface ObjectParameter extends BaseParameter {
  type: 'object';
  properties: Record<string, TaskParameter>;
  default?: Record<string, unknown>;
}

export type TaskParameter = 
  | NumericParameter 
  | StringParameter 
  | BooleanParameter 
  | SelectParameter 
  | ArrayParameter 
  | ObjectParameter;

export interface ValidationRule {
  type: ValidationRuleType;
  value: unknown;
  message: string;
  errorLevel?: 'error' | 'warning' | 'info';
}

export interface ValidationConfig {
  required?: string[];
  dependencies?: Record<string, {
    dependsOn: string;
    value: unknown;
    message: string;
  }>;
  rules?: Record<string, ValidationRule[]>;
}

export interface TaskDefinition {
  name: string;
  description: string;
  parameters: Record<string, TaskParameter>;
  outputs: Array<{
    name: string;
    type: ParameterType;
    description?: string;
  }>;
  pythonModule: string;
  flowFunction: string;
  retries?: number;
  retry_delay_seconds?: number;
  timeout_seconds?: number;
  validation?: ValidationConfig;
  metadata?: {
    category?: string;
    tags?: string[];
    version?: string;
    author?: string;
    created?: string;
    updated?: string;
  };
}

export interface NodeMapping {
  type: NodeType;
  label: string;
  description: string;
  parameters: TaskParameter[];
  validation?: ValidationConfig;
  metadata?: {
    category?: string;
    tags?: string[];
    icon?: string;
    color?: string;
    version?: string;
  };
}

const defaultTaskDefinition: Partial<TaskDefinition> = {
  retries: 3,
  retry_delay_seconds: 30,
  timeout_seconds: 3600
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
        unit: 'mL/min',
        min: 0.1,
        max: 10.0,
        required: true
      },
      {
        name: 'volume',
        label: 'Volume',
        type: 'number',
        default: 10.0,
        unit: 'mL',
        min: 0.1,
        max: 100.0,
        required: true
      }
    ],
    validation: {
      required: ['flowRate', 'volume'],
      rules: {
        flowRate: [
          {
            type: 'range',
            value: [0.1, 10.0],
            message: 'Flow rate must be between 0.1 and 10.0 mL/min',
            errorLevel: 'error'
          }
        ],
        volume: [
          {
            type: 'range',
            value: [0.1, 100.0],
            message: 'Volume must be between 0.1 and 100.0 mL',
            errorLevel: 'error'
          }
        ]
      }
    },
    metadata: {
      category: 'Fluid Control',
      tags: ['pump', 'flow control'],
      icon: 'pump',
      color: '#4CAF50'
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
    throw new Error(`Node type ${nodeType} is already registered`);
  }
  NODE_MAPPINGS[nodeType] = {
    ...defaultTaskDefinition,
    ...definition
  };
}

// 获取节点类型的任务定义
export function getTaskDefinition(nodeType: NodeType): TaskDefinition {
  const definition = NODE_MAPPINGS[nodeType];
  if (!definition) {
    throw new Error(`No task definition found for node type: ${nodeType}`);
  }
  return {
    ...defaultTaskDefinition,
    ...definition
  };
}

// 生成节点的Prefect任务代码
export function generateTaskCode(
  nodeType: NodeType,
  nodeId: string,
  parameters: Record<string, unknown>
): string {
  const definition = getTaskDefinition(nodeType);
  const parameterValidation = generateParameterValidation(definition, parameters);
  const functionName = `run_${nodeType}_${nodeId}`;

  return `
async def ${functionName}(${generateParameterSignature(definition.parameters)}):
    """
    ${definition.description}
    
    Parameters:
    ${generateParameterDocs(definition.parameters)}
    
    Returns:
    ${generateOutputDocs(definition.outputs)}
    """
    ${parameterValidation}
    
    # Import required modules
    import ${definition.pythonModule}
    
    # Execute the flow function
    result = await ${definition.flowFunction}(
        ${generateParameterPassing(parameters)}
    )
    
    return result
`;
}

function generateParameterSignature(
  parameters: Record<string, TaskParameter>
): string {
  return Object.entries(parameters)
    .map(([name, param]) => {
      const defaultValue = param.default !== undefined ? ` = ${JSON.stringify(param.default)}` : '';
      return `${name}${param.required ? '' : '?'}: ${getPythonType(param.type)}${defaultValue}`;
    })
    .join(', ');
}

function generateParameterDocs(
  parameters: Record<string, TaskParameter>
): string {
  return Object.entries(parameters)
    .map(([name, param]) => {
      const type = getPythonType(param.type);
      const defaultValue = param.default !== undefined ? ` (default: ${param.default})` : '';
      return `    ${name}: ${type}${defaultValue}\n        ${param.description || ''}`;
    })
    .join('\n');
}

function generateOutputDocs(
  outputs: Array<{ name: string; type: ParameterType; description?: string; }>
): string {
  return outputs
    .map(output => {
      const type = getPythonType(output.type);
      return `    ${output.name}: ${type}\n        ${output.description || ''}`;
    })
    .join('\n');
}

function generateParameterValidation(
  definition: TaskDefinition,
  parameters: Record<string, unknown>
): string {
  const validations: string[] = [];

  if (definition.validation?.required) {
    for (const param of definition.validation.required) {
      validations.push(`
    if ${param} is None:
        raise ValueError("Parameter '${param}' is required")`);
    }
  }

  if (definition.validation?.rules) {
    for (const [param, rules] of Object.entries(definition.validation.rules)) {
      for (const rule of rules) {
        switch (rule.type) {
          case 'range':
            const [min, max] = rule.value as [number, number];
            validations.push(`
    if not (${min} <= ${param} <= ${max}):
        raise ValueError("${rule.message}")`);
            break;
          case 'pattern':
            validations.push(`
    if not re.match(r'${rule.value}', str(${param})):
        raise ValueError("${rule.message}")`);
            break;
        }
      }
    }
  }

  return validations.join('\n');
}

function generateParameterPassing(parameters: Record<string, unknown>): string {
  return Object.entries(parameters)
    .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
    .join(',\n        ');
}

function getPythonType(type: ParameterType): string {
  switch (type) {
    case 'number': return 'float';
    case 'string': return 'str';
    case 'boolean': return 'bool';
    case 'array': return 'List';
    case 'select': return 'str';
    case 'object': return 'Dict';
    default: return 'Any';
  }
}

export function mapNodeToType(node: WorkflowNode): NodeMapping {
  const mapping = nodeTypeMapping[node.type];
  if (!mapping) {
    throw new Error(`No mapping found for node type: ${node.type}`);
  }
  return mapping;
}

export default {
  registerNodeMapping,
  getTaskDefinition,
  generateTaskCode,
  mapNodeToType
}; 
