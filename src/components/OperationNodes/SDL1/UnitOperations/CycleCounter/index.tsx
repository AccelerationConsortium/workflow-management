import React from 'react';
import { BaseUONode } from '../../BaseUONode';
import { PARAMETER_GROUPS, PRIMITIVE_OPERATIONS, DEFAULT_VALUES } from './constants';

const NODE_TYPE = 'sdl1CycleCounter';
const NODE_LABEL = 'Cycle Counter';
const NODE_DESCRIPTION = 'Monitor and display current cycle status, progress, and statistics';
const NODE_CATEGORY = 'monitoring';

export const CycleCounterNode: React.FC<any> = (props) => {
  const nodeData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    nodeType: NODE_TYPE,
    category: 'SDL1',
    description: NODE_DESCRIPTION,
    parameters: { ...DEFAULT_VALUES, ...props.data.parameters },
  };

  return (
    <BaseUONode 
      {...props} 
      data={nodeData}
    />
  );
};

export const cycleCounterNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: CycleCounterNode,
  defaultData: {
    label: NODE_LABEL,
    description: NODE_DESCRIPTION,
    nodeType: NODE_TYPE,
    category: 'SDL1',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
  },
};