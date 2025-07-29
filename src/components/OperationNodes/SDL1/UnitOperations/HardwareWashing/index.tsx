import React from 'react';
import { BaseUONode } from '../../BaseUONode';
import { NodeProps } from 'reactflow';
import { DEFAULT_VALUES, PARAMETER_GROUPS, PRIMITIVE_OPERATIONS } from './constants';

export const HardwareWashingNode: React.FC<NodeProps> = (props) => {
  const enhancedData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    nodeType: 'sdl1HardwareWashing',
    category: 'SDL1',
    description: 'Automated washing of reactor cells using flush tool and Arduino-controlled pumps',
    parameters: { ...DEFAULT_VALUES, ...props.data?.parameters },
  };

  return <BaseUONode {...props} data={enhancedData} />;
};

export const hardwareWashingNodeConfig = {
  type: 'sdl1HardwareWashing',
  label: 'Hardware Washing',
  description: 'Automated washing of reactor cells using flush tool and Arduino-controlled pumps',
  icon: '🚿',
  color: '#388E3C',
  category: 'cleaning' as const,
  defaultData: {
    label: 'Hardware Washing',
    description: 'Automated washing of reactor cells using flush tool and Arduino-controlled pumps',
    nodeType: 'sdl1HardwareWashing',
    category: 'SDL1',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
  },
};

export default HardwareWashingNode;