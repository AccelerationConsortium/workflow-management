import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { ExperimentSetupParams } from '../../types';
import { PARAMETER_GROUPS, PRIMITIVE_OPERATIONS, DEFAULT_VALUES } from './constants';

export const ExperimentSetupNode: React.FC<NodeProps<ExperimentSetupParams>> = (props) => {
  const enhancedData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    nodeType: 'sdl1ExperimentSetup',
    category: 'SDL1',
    description: 'Initialize experiment with hardware configuration and well selection',
    parameters: { ...DEFAULT_VALUES, ...props.data.parameters },
  };

  return <BaseUONode {...props} data={enhancedData} />;
};

export const experimentSetupNodeConfig = {
  type: 'sdl1ExperimentSetup',
  label: 'Experiment Setup',
  description: 'Initialize experiment with hardware configuration and well selection',
  icon: '🔧',
  color: '#FF6B6B',
  category: 'setup' as const,
  defaultData: {
    label: 'Experiment Setup',
    description: 'Initialize experiment with hardware configuration and well selection',
    nodeType: 'sdl1ExperimentSetup',
    category: 'SDL1',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
  },
};