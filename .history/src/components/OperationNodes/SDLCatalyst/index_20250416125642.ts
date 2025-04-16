import { NodeProps } from 'reactflow';
import { OCVNode } from './OCV/OCVNode';
import { CPNode } from './CP/CPNode';
import { CVANode } from './CVA/CVANode';
import { BatchCVANode } from './CVA/BatchCVANode';
import { PEISNode } from './PEIS/PEISNode';
import { LSVNode } from './LSV/LSVNode';
import { OT2Node } from './OT2/OT2Node';
import { BaseUONode } from './BaseUONode';
import { BaseUO } from './BaseUO';

// 导出基础组件
export { BaseUONode, BaseUO };
export * from './types';

// 节点类型定义
export interface SDLCatalystNode {
  type: string;
  label: string;
  description: string;
  category: string;
  expanded?: boolean;
}

// Node type definitions (用于侧边栏显示)
export const SDL_CATALYST_NODE_TYPES: SDLCatalystNode[] = [
  {
    type: 'sdl_catalyst_ocv',
    label: 'OCV',
    description: 'Open Circuit Voltage measurement',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'sdl_catalyst_cp',
    label: 'CP',
    description: 'Chronopotentiometry measurement',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'sdl_catalyst_cva',
    label: 'CVA',
    description: 'Cyclic Voltammetry Analysis',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'sdl_catalyst_batch_cva',
    label: 'Batch CVA',
    description: 'Batch Cyclic Voltammetry Analysis',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'sdl_catalyst_peis',
    label: 'PEIS',
    description: 'Potentiostatic Electrochemical Impedance Spectroscopy',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'sdl_catalyst_lsv',
    label: 'LSV',
    description: 'Linear Sweep Voltammetry',
    category: 'SDL Catalyst',
    expanded: false
  },
  {
    type: 'sdl_catalyst_ot2',
    label: 'OT-2',
    description: 'OT-2 Liquid Handler',
    category: 'SDL Catalyst',
    expanded: false
  }
];

// Node components (用于注册到 ReactFlow)
export const SDL_CATALYST_NODES = {
  sdl_catalyst_ocv: OCVNode,
  sdl_catalyst_cp: CPNode,
  sdl_catalyst_cva: CVANode,
  sdl_catalyst_batch_cva: BatchCVANode,
  sdl_catalyst_peis: PEISNode,
  sdl_catalyst_lsv: LSVNode,
  sdl_catalyst_ot2: OT2Node
}; 
