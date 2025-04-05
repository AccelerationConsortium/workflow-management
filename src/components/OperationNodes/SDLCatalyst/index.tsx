import { NodeProps } from 'reactflow';
import { OperationNode } from '../../../data/operationNodes';
import { OCVNode } from './OCV/OCVNode';
import { CPNode } from './CP/CPNode';
import { CVANode } from './CVA/CVANode';
import { BatchCVANode } from './CVA/BatchCVANode';
import { PEISNode } from './PEIS/PEISNode';
import { LSVNode } from './LSV/LSVNode';

// Map of node types to their components
export const SDL_CATALYST_NODES = {
  sdl_catalyst_ocv: OCVNode,
  sdl_catalyst_cp: CPNode,
  sdl_catalyst_cva: CVANode,
  sdl_catalyst_batch_cva: BatchCVANode,
  sdl_catalyst_peis: PEISNode,
  sdl_catalyst_lsv: LSVNode,
};

// Node types for the sidebar
export const SDL_CATALYST_NODE_TYPES: Pick<OperationNode, 'type' | 'label' | 'description' | 'category'>[] = [
  {
    type: 'sdl_catalyst_ocv',
    label: 'OCV',
    category: 'SDL Catalyst',
    description: 'Open Circuit Voltage measurement',
  },
  {
    type: 'sdl_catalyst_cp',
    label: 'CP',
    category: 'SDL Catalyst',
    description: 'Chronopotentiometry measurement',
  },
  {
    type: 'sdl_catalyst_cva',
    label: 'CVA',
    category: 'SDL Catalyst',
    description: 'Cyclic Voltammetry measurement',
  },
  {
    type: 'sdl_catalyst_batch_cva',
    label: 'Batch CVA',
    category: 'SDL Catalyst',
    description: 'Batch Cyclic Voltammetry measurement with multiple iterations',
  },
  {
    type: 'sdl_catalyst_peis',
    label: 'PEIS',
    category: 'SDL Catalyst',
    description: 'Potentiostatic Electrochemical Impedance Spectroscopy',
  },
  {
    type: 'sdl_catalyst_lsv',
    label: 'LSV',
    category: 'SDL Catalyst',
    description: 'Linear Sweep Voltammetry measurement',
  },
]; 
