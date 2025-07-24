import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import {
  PARAMETER_GROUPS,
  DEFAULT_VALUES,
  PRIMITIVE_OPERATIONS,
} from './constants';
import { DeckInitializationData, PrimitiveOperation } from '../../types';

const NODE_TYPE = 'sdl7DeckInitialization';
const NODE_LABEL = 'Deck Initialization';
const NODE_DESCRIPTION = 'Initialize all instruments and prepare the deck for experiments';
const NODE_CATEGORY = 'initialization';

// Generate primitive operations based on parameters
const generatePrimitiveOperations = (parameters: DeckInitializationData['parameters']): PrimitiveOperation[] => {
  const operations: PrimitiveOperation[] = [];
  
  // 1. Initialize deck operation
  operations.push({
    operation: 'initialize_deck',
    parameters: {
      experiment_name: parameters.experiment_name,
      solvent_file: parameters.solvent_file,
      method_name: parameters.method_name,
      inj_vol: parameters.injection_volume,
    },
  });
  
  // 2. HPLC instrument setup
  operations.push({
    operation: 'hplc_instrument_setup',
    parameters: {
      method: parameters.method_name,
      injection_volume: parameters.injection_volume,
      sequence: parameters.sequence || null,
    },
  });
  
  return operations;
};

// Canvas node component
export const DeckInitializationNode: React.FC<NodeProps> = (props) => {
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
export const DeckInitializationForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as DeckInitializationData['parameters']);
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
export const deckInitializationNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: DeckInitializationNode,
  defaultData: {
    label: NODE_LABEL,
    parameters: DEFAULT_VALUES,
  },
};