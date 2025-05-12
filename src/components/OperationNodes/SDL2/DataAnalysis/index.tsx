import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { PARAMETERS } from './constants';
import { DataAnalysisData } from '../types';
import '../styles.css';

export const DataAnalysisNode: React.FC<NodeProps> = (props) => {
  const handleParameterChange = (params: Record<string, any>) => {
    console.log('DataAnalysis parameters changed:', params);
    // Here you would handle parameter changes, e.g., update state or dispatch an action
  };

  const handleExport = () => {
    console.log('Exporting DataAnalysis configuration');
    // Here you would handle exporting the configuration
  };

  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Data Analysis',
        description: 'Analyze experimental data and generate reports',
        parameters: PARAMETERS,
        onParameterChange: handleParameterChange,
        onExport: handleExport
      }}
    />
  );
};

export default DataAnalysisNode;
