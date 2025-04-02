import { DeviceDefinition, DeviceExecutionMode } from '../../types/device';
import { WorkflowNode } from '../../types/workflow';
import { NodeMapping, mapNodeToType } from './nodeMapping';

export interface PrefectTaskDefinition {
  name: string;
  fn_name: string;
  tags: string[];
  retries: number;
  retry_delay_seconds: number;
  timeout_seconds: number;
  script: string;
  parameters: Record<string, any>;
}

export class PrefectTaskConverter {
  private deviceDefinitions: Map<string, DeviceDefinition>;
  private nodeMapping: Record<string, NodeMapping>;

  constructor(deviceDefinitions: DeviceDefinition[], nodeMapping: Record<string, NodeMapping>) {
    this.deviceDefinitions = new Map(
      deviceDefinitions.map(def => [def.type, def])
    );
    this.nodeMapping = nodeMapping;
  }

  public convertNodeToTask(node: WorkflowNode): PrefectTaskDefinition {
    const mapping = mapNodeToType(node);

    // Generate Python function name
    const fnName = `run_${node.type.toLowerCase()}`;

    // Generate Python script
    const script = this.generateTaskScript(node, mapping);

    return {
      name: `${node.type}_${node.id}`,
      fn_name: fnName,
      tags: [`node_${node.type}`, `id_${node.id}`],
      retries: 3,
      retry_delay_seconds: 30,
      timeout_seconds: 3600,
      script,
      parameters: node.data?.parameters || {}
    };
  }

  private generateTaskScript(node: WorkflowNode, mapping: NodeMapping): string {
    const paramDefs = mapping.parameters.map(param => {
      const defaultValue = JSON.stringify(param.default);
      return `${param.name}: ${this.getPythonType(param.type)} = ${defaultValue}`;
    }).join(', ');

    return `
async def ${node.type.toLowerCase()}_task(${paramDefs}) -> dict:
    """
    ${mapping.description}
    
    Parameters:
    ${mapping.parameters.map(param => 
      `    ${param.name} (${param.type}): ${param.label}${param.unit ? ` (${param.unit})` : ''}`
    ).join('\n')}
    
    Returns:
        dict: Task execution results
    """
    try:
        # Parameter validation
        ${this.generateValidation(mapping)}
        
        # Task implementation
        ${this.generateImplementation(node, mapping)}
        
        return {
            "status": "success",
            "data": result
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
`;
  }

  private getPythonType(type: string): string {
    switch (type) {
      case 'number':
        return 'float';
      case 'boolean':
        return 'bool';
      case 'select':
      case 'string':
        return 'str';
      default:
        return 'Any';
    }
  }

  private generateValidation(mapping: NodeMapping): string {
    if (!mapping.validation) {
      return '# No validation rules defined';
    }

    const validations: string[] = [];

    // Required parameters
    if (mapping.validation.required) {
      mapping.validation.required.forEach(param => {
        validations.push(`
        if ${param} is None:
            raise ValueError("${param} is required")`);
      });
    }

    // Range validations
    if (mapping.validation.rules) {
      Object.entries(mapping.validation.rules).forEach(([param, rules]) => {
        rules.forEach(rule => {
          if (rule.type === 'range') {
            const [min, max] = rule.value;
            validations.push(`
        if not (${min} <= ${param} <= ${max}):
            raise ValueError("${rule.message}")`);
          }
        });
      });
    }

    return validations.join('\n') || '# No validation rules to apply';
  }

  private generateImplementation(node: WorkflowNode, mapping: NodeMapping): string {
    // This is a placeholder. In a real implementation, you would generate
    // the actual device control code based on the node type and parameters.
    return `
        # TODO: Implement actual device control logic
        result = {
            "parameters": {
                ${mapping.parameters.map(param => 
                  `"${param.name}": ${param.name}`
                ).join(',\n                ')}
            }
        }`;
  }
} 
