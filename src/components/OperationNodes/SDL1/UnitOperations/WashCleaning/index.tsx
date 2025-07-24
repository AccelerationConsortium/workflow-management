import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { WashCleaningParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'sdl1WashCleaning';
const NODE_LABEL = 'Wash/Cleaning';
const NODE_DESCRIPTION = 'Electrode and reactor cleaning operations';
const NODE_CATEGORY = 'cleaning';

export interface WashCleaningData {
  label: string;
  parameters: WashCleaningParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: WashCleaningParams): PrimitiveOperation[] => {
  const operations: PrimitiveOperation[] = [];
  
  // Wait before operation
  if (parameters.wait_before && parameters.wait_before > 0) {
    operations.push({
      operation: 'wait',
      parameters: {
        duration: parameters.wait_before,
        unit: 'seconds',
      },
    });
  }
  
  // Pick cleaning tool
  operations.push({
    operation: 'pick_cleaning_tool',
    parameters: {
      position: parameters.cleaning_tool_position,
    },
  });
  
  // Perform cleaning cycles
  for (let cycle = 1; cycle <= parameters.cleaning_cycles; cycle++) {
    // Move to well
    operations.push({
      operation: 'move_to_well',
      parameters: {
        target_well: parameters.target_well,
        cycle: cycle,
      },
    });
    
    // Insert cleaning tool
    operations.push({
      operation: 'insert_tool',
      parameters: {
        depth: parameters.insertion_depth,
        well: parameters.target_well,
      },
    });
    
    // Dispense cleaning solutions
    if (parameters.pump1_volume > 0) {
      operations.push({
        operation: 'dispense_cleaning_solution',
        parameters: {
          pump: 1,
          volume: parameters.pump1_volume,
          unit: 'mL',
        },
      });
    }
    
    if (parameters.pump2_volume > 0) {
      operations.push({
        operation: 'dispense_cleaning_solution',
        parameters: {
          pump: 2,
          volume: parameters.pump2_volume,
          unit: 'mL',
        },
      });
    }
    
    // Activate ultrasonic cleaning
    if (parameters.ultrasonic_time > 0) {
      operations.push({
        operation: 'activate_ultrasonic',
        parameters: {
          duration: parameters.ultrasonic_time,
          unit: 'ms',
        },
      });
    }
    
    // Aspirate waste
    operations.push({
      operation: 'aspirate_waste',
      parameters: {
        volume: parameters.pump1_volume + parameters.pump2_volume,
        unit: 'mL',
      },
    });
    
    // Retract tool
    operations.push({
      operation: 'retract_tool',
      parameters: {
        well: parameters.target_well,
      },
    });
  }
  
  // Return cleaning tool
  operations.push({
    operation: 'return_tool',
    parameters: {
      position: parameters.cleaning_tool_position,
    },
  });
  
  // Wait after operation
  if (parameters.wait_after && parameters.wait_after > 0) {
    operations.push({
      operation: 'wait',
      parameters: {
        duration: parameters.wait_after,
        unit: 'seconds',
      },
    });
  }
  
  return operations;
};

const EXECUTION_STEPS = [
  { operation: 'wait', condition: 'wait_before > 0', description: 'Wait before starting' },
  { operation: 'pick_cleaning_tool', description: 'Pick cleaning tool from storage' },
  { operation: 'move_to_well', description: 'Move to target well' },
  { operation: 'insert_tool', description: 'Insert cleaning tool' },
  { operation: 'dispense_cleaning_solution', description: 'Dispense cleaning solutions' },
  { operation: 'activate_ultrasonic', condition: 'ultrasonic_time > 0', description: 'Activate ultrasonic cleaning' },
  { operation: 'aspirate_waste', description: 'Remove waste solution' },
  { operation: 'retract_tool', description: 'Retract cleaning tool' },
  { operation: 'return_tool', description: 'Return tool to storage' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const WashCleaningNode: React.FC<NodeProps> = (props) => {
  const enhancedData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    nodeType: NODE_TYPE,
    category: NODE_CATEGORY,
    description: NODE_DESCRIPTION,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    executionSteps: EXECUTION_STEPS,
    parameters: { ...DEFAULT_VALUES, ...props.data.parameters },
  };
  
  const currentPrimitiveOps = generatePrimitiveOperations(enhancedData.parameters);

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

export const WashCleaningForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as WashCleaningData['parameters']);
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

export const washCleaningNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: WashCleaningNode,
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