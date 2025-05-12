import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { PARAMETERS } from './constants';
import { ElectrochemicalMeasurementData } from '../types';
import '../styles.css';

export const ElectrochemicalMeasurementNode: React.FC<NodeProps> = (props) => {
  const handleParameterChange = (params: Record<string, any>) => {
    console.log('ElectrochemicalMeasurement parameters changed:', params);
    // Here you would handle parameter changes, e.g., update state or dispatch an action
  };

  const handleExport = () => {
    console.log('Exporting ElectrochemicalMeasurement configuration');
    // Here you would handle exporting the configuration
  };

  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Electrochemical Measurement',
        description: 'Perform electrochemical measurements on prepared compounds',
        parameters: PARAMETERS,
        onParameterChange: handleParameterChange,
        onExport: handleExport,
        canImportJSON: true // Enable JSON import/export
      }}
    />
  );
};

export default ElectrochemicalMeasurementNode;
