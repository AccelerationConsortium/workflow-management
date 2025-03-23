import { z } from 'zod';
import { DeviceType, DeviceParameters } from '../schemas/deviceSchema';

// Node connection definition
export interface INodeConnection {
  sourceId: string;
  targetId: string;
  dataType: string;
}

// Template node definition
export interface ITemplateNode {
  id: string;
  type: DeviceType;
  parameters: Partial<DeviceParameters[DeviceType]>;
  position: { x: number; y: number };
  constraints?: {
    min?: number;
    max?: number;
    step?: number;
    dependencies?: Array<{
      nodeId: string;
      condition: string;
    }>;
  };
}

// Template definition schema
export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  author: z.string(),
  created: z.string(),
  updated: z.string(),
  tags: z.array(z.string()),
  nodes: z.array(z.custom<ITemplateNode>()),
  connections: z.array(z.custom<INodeConnection>()),
  metadata: z.record(z.unknown()).optional(),
});

export type MedusaTemplateDefinition = z.infer<typeof templateSchema>;

// Template class
export class MedusaTemplate {
  private definition: MedusaTemplateDefinition;

  constructor(definition: MedusaTemplateDefinition) {
    const result = templateSchema.safeParse(definition);
    if (!result.success) {
      throw new Error(`Invalid template definition: ${result.error}`);
    }
    this.definition = definition;
  }

  // Template operations
  validate(): boolean {
    try {
      // Validate node connections
      this.validateConnections();
      // Validate parameter constraints
      this.validateParameterConstraints();
      // Validate dependencies
      this.validateDependencies();
      return true;
    } catch (error) {
      console.error('Template validation failed:', error);
      return false;
    }
  }

  private validateConnections(): void {
    const nodeIds = new Set(this.definition.nodes.map(node => node.id));
    for (const conn of this.definition.connections) {
      if (!nodeIds.has(conn.sourceId) || !nodeIds.has(conn.targetId)) {
        throw new Error(`Invalid connection: ${conn.sourceId} -> ${conn.targetId}`);
      }
    }
  }

  private validateParameterConstraints(): void {
    for (const node of this.definition.nodes) {
      if (node.constraints) {
        const { min, max } = node.constraints;
        if (min !== undefined && max !== undefined && min > max) {
          throw new Error(`Invalid constraints for node ${node.id}: min > max`);
        }
      }
    }
  }

  private validateDependencies(): void {
    for (const node of this.definition.nodes) {
      if (node.constraints?.dependencies) {
        for (const dep of node.constraints.dependencies) {
          if (!this.definition.nodes.find(n => n.id === dep.nodeId)) {
            throw new Error(`Invalid dependency: ${dep.nodeId} not found`);
          }
        }
      }
    }
  }

  // Template instantiation
  instantiate(parameters: Record<string, any> = {}): any {
    // Create workflow instance from template
    const instance = {
      ...this.definition,
      nodes: this.definition.nodes.map(node => ({
        ...node,
        parameters: {
          ...node.parameters,
          ...(parameters[node.id] || {}),
        },
      })),
    };

    // Validate instance
    if (!this.validate()) {
      throw new Error('Template instantiation validation failed');
    }

    return instance;
  }

  // Utility methods
  static async loadFromFile(path: string): Promise<MedusaTemplate> {
    try {
      const definition = await import(path);
      return new MedusaTemplate(definition);
    } catch (error) {
      throw new Error(`Failed to load template from ${path}: ${error}`);
    }
  }

  toJSON(): MedusaTemplateDefinition {
    return this.definition;
  }
} 
