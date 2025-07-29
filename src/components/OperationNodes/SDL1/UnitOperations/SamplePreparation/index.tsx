import React from 'react';
import { BaseUONode } from '../../BaseUONode';
import { NodeProps } from 'reactflow';
import { DEFAULT_VALUES, PARAMETER_GROUPS, PRIMITIVE_OPERATIONS } from './constants';

export const SamplePreparationNode: React.FC<NodeProps> = (props) => {
  const enhancedData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    nodeType: 'sdl1SamplePreparation',
    category: 'SDL1',
    description: 'Sample preparation with conditional additives based on experimental design',
    parameters: { ...DEFAULT_VALUES, ...props.data?.parameters },
  };

  return <BaseUONode {...props} data={enhancedData} />;
};

export const samplePreparationNodeConfig = {
  type: 'sdl1SamplePreparation',
  label: 'Sample Preparation',
  description: 'Sample preparation with conditional additives based on experimental design',
  icon: '🧪',
  color: '#1976D2',
  category: 'preparation' as const,
  defaultData: {
    label: 'Sample Preparation',
    description: 'Sample preparation with conditional additives based on experimental design',
    nodeType: 'sdl1SamplePreparation',
    category: 'SDL1',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
  },
};

export default SamplePreparationNode;