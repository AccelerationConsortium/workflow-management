import React from 'react';
import { BaseUONode } from '../../BaseUONode';
import { NodeProps } from 'reactflow';
import { DEFAULT_VALUES, PARAMETER_GROUPS, PRIMITIVE_OPERATIONS } from './constants';

export const ElectrodeManipulationNode: React.FC<NodeProps> = (props) => {
  const enhancedData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    nodeType: 'sdl1ElectrodeManipulation',
    category: 'SDL1',
    description: 'Handle electrode pickup, insertion, removal, and return operations',
    parameters: { ...DEFAULT_VALUES, ...props.data?.parameters },
  };

  return <BaseUONode {...props} data={enhancedData} />;
};

export const electrodeManipulationNodeConfig = {
  type: 'sdl1ElectrodeManipulation',
  label: 'Electrode Manipulation',
  description: 'Handle electrode pickup, insertion, removal, and return operations',
  icon: '⚡',
  color: '#7B1FA2',
  category: 'manipulation' as const,
  defaultData: {
    label: 'Electrode Manipulation',
    description: 'Handle electrode pickup, insertion, removal, and return operations',
    nodeType: 'sdl1ElectrodeManipulation',
    category: 'SDL1',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
  },
};

export default ElectrodeManipulationNode;