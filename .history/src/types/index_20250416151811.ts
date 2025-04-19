export * from './workflow';
export * from './api';
export * from './validation';
export * from './nodeConfig';

import { Node, Edge } from 'reactflow';

export interface UnitOperation {
  id: string;
  name: string;
  type: string;
  description: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

export interface PortDefinition {
  id: string;
  name: string;
  required: boolean;
  type: string;
}

export interface CustomNode extends Node {
  data: UnitOperation;
}

export type WorkflowData = {
  nodes: CustomNode[];
  edges: Edge[];
}; 
