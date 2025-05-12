import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { PARAMETERS } from './constants';
import { CleaningData } from '../types';
import '../styles.css';

export const CleaningNode: React.FC<NodeProps> = (props) => {
  const handleParameterChange = (params: Record<string, any>) => {
    console.log('Cleaning parameters changed:', params);
    // Here you would handle parameter changes, e.g., update state or dispatch an action
  };

  const handleExport = () => {
    console.log('Exporting Cleaning configuration');
    // Here you would handle exporting the configuration
  };

  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Cleaning',
        description: 'Clean the system after experiments',
        parameters: PARAMETERS,
        onParameterChange: handleParameterChange,
        onExport: handleExport
      }}
    />
  );
};

export default CleaningNode;
