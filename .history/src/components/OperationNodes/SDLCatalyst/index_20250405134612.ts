import { CVANode } from './CVA/CVANode';
import { BatchCVANode } from './CVA/BatchCVANode';
import { OT2Node } from './OT2/OT2Node';
import { OperationNode } from '../../../types/workflow';

// Node type definitions
export const SDL_CATALYST_NODE_TYPES: OperationNode[] = [
  {
    type: 'OCV',
    label: 'Open Circuit Voltage',
    description: 'Open Circuit Voltage measurement',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'CP',
    label: 'Chronopotentiometry',
    description: 'Chronopotentiometry measurement',
    category: 'SDL Catalyst',
    expanded: false
  },
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
    type: 'PEIS',
    label: 'Potentiostatic Electrochemical Impedance Spectroscopy',
    description: 'Perform PEIS measurement',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'LSV',
    label: 'Linear Sweep Voltammetry',
    description: 'Linear Sweep Voltammetry measurement',
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
  OCV: OCVNode,
  CP: CPNode,
  CVA: CVANode,
  BatchCVA: BatchCVANode,
  PEIS: PEISNode,
  LSV: LSVNode,
  OT2: OT2Node
}; 
