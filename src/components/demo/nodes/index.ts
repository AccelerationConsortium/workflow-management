export * from './LEDControlNode';
export * from './LightSensorNode';
export * from './BayesianOptimizerNode';
export * from './DataLoggerNode';

// src/components/demo/nodes/LEDControlNode.tsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeProps } from '../../../types';

export const LEDControlNode = ({ data, ...props }: NodeProps) => {
  // LED控制节点的具体实现
};

// 其他节点组件类似... 