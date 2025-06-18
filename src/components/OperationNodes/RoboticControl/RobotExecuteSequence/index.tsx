import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseRoboticNode } from '../BaseRoboticNode';
import { PARAMETERS } from './constants';

export const RobotExecuteSequenceNode: React.FC<NodeProps> = (props) => {
  const handleParameterChange = (paramName: string, value: any) => {
    const newData = {
      ...props.data,
      [paramName]: value
    };
    if (props.data.onChange) {
      props.data.onChange(newData);
    }
  };

  const handleExport = () => {
    const config = {
      nodeType: 'robot_execute_sequence',
      parameters: Object.keys(PARAMETERS).reduce((acc, key) => ({
        ...acc,
        [key]: props.data[key] ?? PARAMETERS[key].defaultValue
      }), {})
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `robot_execute_sequence_${Date.now()}.json`;
    link.click();
  };

  return (
    <BaseRoboticNode
      {...props}
      data={{
        ...props.data,
        label: props.data.label || 'Robot Execute Sequence',
        description: 'Execute a predefined motion sequence',
        icon: '🔄',
        nodeType: 'robot_execute_sequence',
        parameters: PARAMETERS,
        values: props.data,
        onParameterChange: handleParameterChange,
        onExport: handleExport
      }}
    />
  );
};