import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import {
  PARAMETER_GROUPS,
  DEFAULT_VALUES,
  PRIMITIVE_OPERATIONS,
} from './constants';
import { AddSolventToSampleVialData, PrimitiveOperation } from '../../types';

const NODE_TYPE = 'sdl7AddSolventToSampleVial';
const NODE_LABEL = 'Add Solvent to Sample Vial';
const NODE_DESCRIPTION = 'Add specified solvent to a vial with optional weighing';
const NODE_CATEGORY = 'solvent';

// Generate primitive operations based on parameters
const generatePrimitiveOperations = (parameters: AddSolventToSampleVialData['parameters']): PrimitiveOperation[] => {
  const operations: PrimitiveOperation[] = [];
  
  // 1. Add solvent operation
  operations.push({
    operation: 'add_solvent',
    parameters: {
      vial: parameters.vial,
      tray: parameters.tray,
      solvent: parameters.solvent,
      solvent_vol: parameters.solvent_vol,
      clean: parameters.clean,
    },
  });
  
  // 2. Weighing operation (if enabled)
  if (parameters.perform_weighing) {
    operations.push({
      operation: 'weigh_container',
      parameters: {
        vial: parameters.vial,
        tray: parameters.tray,
        sample_name: parameters.sample_name || `${parameters.solvent}_${parameters.vial}`,
        to_hplc_inst: false,
      },
    });
  }
  
  return operations;
};

// Canvas node component
export const AddSolventToSampleVialNode: React.FC<NodeProps> = (props) => {
  const enhancedData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    nodeType: NODE_TYPE,
    category: NODE_CATEGORY,
    description: NODE_DESCRIPTION,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    parameters: props.data.parameters || DEFAULT_VALUES,
  };

  // Override the data with primitive operations generator
  if (props.data.onDataChange) {
    const originalOnDataChange = props.data.onDataChange;
    enhancedData.onDataChange = (newData: any) => {
      const primitiveOps = generatePrimitiveOperations(newData.parameters);
      originalOnDataChange({
        ...newData,
        primitiveOperations: primitiveOps,
      });
    };
  }

  return <BaseUONode {...props} data={enhancedData} />;
};

// Standalone form component
export const AddSolventToSampleVialForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as AddSolventToSampleVialData['parameters']);
      onSave({
        nodeType: NODE_TYPE,
        parameters,
        primitiveOperations: primitiveOps,
      });
    }
  };

  return (
    <BaseUO
      title={NODE_LABEL}
      description={NODE_DESCRIPTION}
      parameterGroups={PARAMETER_GROUPS}
      defaultValues={DEFAULT_VALUES}
      onSave={handleSave}
      primitiveOperations={PRIMITIVE_OPERATIONS}
    />
  );
};

// Export node configuration
export const addSolventToSampleVialNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: AddSolventToSampleVialNode,
  defaultData: {
    label: NODE_LABEL,
    parameters: DEFAULT_VALUES,
  },
};