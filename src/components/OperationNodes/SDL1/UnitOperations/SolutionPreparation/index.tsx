import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { SolutionPreparationParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'sdl1SolutionPreparation';
const NODE_LABEL = 'Solution Preparation';
const NODE_DESCRIPTION = 'Automated solution preparation and dispensing';
const NODE_CATEGORY = 'solution-prep';

export interface SolutionPreparationData {
  label: string;
  parameters: SolutionPreparationParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: SolutionPreparationParams): PrimitiveOperation[] => {
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
  
  // Select pipette
  operations.push({
    operation: 'select_pipette',
    parameters: {
      pipette_type: parameters.pipette_type,
    },
  });
  
  // Aspirate solution
  operations.push({
    operation: 'aspirate_solution',
    parameters: {
      labware: parameters.source_labware,
      well: parameters.source_well,
      volume: parameters.volume,
      offset_z: parameters.aspiration_offset_z,
    },
  });
  
  // Move to target
  operations.push({
    operation: 'move_to_target',
    parameters: {
      labware: parameters.target_labware,
      well: parameters.target_well,
    },
  });
  
  // Dispense solution
  operations.push({
    operation: 'dispense_solution',
    parameters: {
      labware: parameters.target_labware,
      well: parameters.target_well,
      volume: parameters.volume,
      offset_x: parameters.dispense_offset_x,
      offset_y: parameters.dispense_offset_y,
      offset_z: parameters.dispense_offset_z,
    },
  });
  
  // Drop tip
  operations.push({
    operation: 'drop_tip',
    parameters: {},
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
  { operation: 'select_pipette', description: 'Select appropriate pipette' },
  { operation: 'aspirate_solution', description: 'Aspirate solution from source' },
  { operation: 'move_to_target', description: 'Move to target location' },
  { operation: 'dispense_solution', description: 'Dispense solution to target' },
  { operation: 'drop_tip', description: 'Drop pipette tip' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const SolutionPreparationNode: React.FC<NodeProps> = (props) => {
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

export const SolutionPreparationForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as SolutionPreparationData['parameters']);
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

export const solutionPreparationNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: SolutionPreparationNode,
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