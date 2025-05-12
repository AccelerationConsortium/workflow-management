import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { PARAMETERS } from './constants';
import { CompoundPreparationData } from '../types';
import '../styles.css';

export const CompoundPreparationNode: React.FC<NodeProps> = (props) => {
  const handleParameterChange = (params: Record<string, any>) => {
    console.log('CompoundPreparation parameters changed:', params);
    // Here you would handle parameter changes, e.g., update state or dispatch an action
  };

  const handleExport = () => {
    console.log('Exporting CompoundPreparation configuration');
    // Here you would handle exporting the configuration
  };

  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Compound Preparation',
        description: 'Prepare compounds by mixing metal salts, ligands, and buffers',
        parameters: PARAMETERS,
        onParameterChange: handleParameterChange,
        onExport: handleExport,
        canImportJSON: true // Enable JSON import/export
      }}
    />
  );
};

export default CompoundPreparationNode;
