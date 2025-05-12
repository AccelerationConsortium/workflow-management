import CompoundPreparationNode from './CompoundPreparation';
import ElectrochemicalMeasurementNode from './ElectrochemicalMeasurement';
import CleaningNode from './Cleaning';
import DataAnalysisNode from './DataAnalysis';
import { BaseUONode } from './BaseUONode';
import { BaseUO } from './BaseUO';
import { SDL2Node } from './types';

// Export base components
export { BaseUONode, BaseUO };
export * from './types';

// Node type definitions (for sidebar display)
export const SDL2_NODE_TYPES: SDL2Node[] = [
  {
    type: 'sdl2_compound_preparation',
    label: 'Compound Preparation',
    description: 'Prepare compounds by mixing metal salts, ligands, and buffers',
    category: 'SDL2',
    expanded: false
  },
  {
    type: 'sdl2_electrochemical_measurement',
    label: 'Electrochemical Measurement',
    description: 'Perform electrochemical measurements on prepared compounds',
    category: 'SDL2',
    expanded: false
  },
  {
    type: 'sdl2_cleaning',
    label: 'Cleaning',
    description: 'Clean the system after experiments',
    category: 'SDL2',
    expanded: false
  },
  {
    type: 'sdl2_data_analysis',
    label: 'Data Analysis',
    description: 'Analyze experimental data and generate reports',
    category: 'SDL2',
    expanded: false
  }
];

// Export components with consistent naming
export const SDL2Nodes = {
  sdl2_compound_preparation: CompoundPreparationNode,
  sdl2_electrochemical_measurement: ElectrochemicalMeasurementNode,
  sdl2_cleaning: CleaningNode,
  sdl2_data_analysis: DataAnalysisNode
};

// Alternative naming style export
export const SDL2_NODES = SDL2Nodes;
