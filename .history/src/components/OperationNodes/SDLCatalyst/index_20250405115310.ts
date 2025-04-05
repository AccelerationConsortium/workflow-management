import CVANode from './CVA/CVANode';
import { BatchCVANode } from './CVA/BatchCVANode';
import OT2Node from './OT2/OT2Node';
import { OperationNode } from '../../../types/workflow';

// Node type definitions
export const SDL_CATALYST_NODE_TYPES: OperationNode[] = [
  {
    type: 'CVA',
    label: 'Cyclic Voltammetry Analysis',
    description: 'Perform cyclic voltammetry analysis',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'BatchCVA',
    label: 'Batch CVA',
    description: 'Perform batch cyclic voltammetry analysis',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'OT2',
    label: 'OT-2 Liquid Handler',
    description: 'Control Opentrons OT-2 automated liquid handling robot',
    category: 'SDL Catalyst',
    expanded: false
  }
];

// Node components
export const SDLCatalystNodes = {
  CVA: CVANode,
  BatchCVA: BatchCVANode,
  OT2: OT2Node
}; 
