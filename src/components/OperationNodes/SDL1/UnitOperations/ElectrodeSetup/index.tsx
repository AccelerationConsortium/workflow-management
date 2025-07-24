import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { ElectrodeSetupParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'sdl1ElectrodeSetup';
const NODE_LABEL = 'Electrode Setup';
const NODE_DESCRIPTION = 'Electrode installation and positioning for electrochemical experiments';
const NODE_CATEGORY = 'electrode';

export interface ElectrodeSetupData {
  label: string;
  parameters: ElectrodeSetupParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: ElectrodeSetupParams): PrimitiveOperation[] => {
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
  
  // Pick electrode from storage
  operations.push({
    operation: 'pick_electrode',
    parameters: {
      electrode_type: parameters.electrode_type,
      position: parameters.electrode_position,
    },
  });
  
  // Move to target well
  operations.push({
    operation: 'move_to_well',
    parameters: {
      target_well: parameters.target_well,
      speed: parameters.movement_speed,
    },
  });
  
  // Insert electrode
  operations.push({
    operation: 'insert_electrode',
    parameters: {
      depth: parameters.insertion_depth,
      offset_x: parameters.lateral_offset_x,
      offset_y: parameters.lateral_offset_y,
      speed: parameters.movement_speed,
    },
  });
  
  // Secure electrode
  operations.push({
    operation: 'secure_electrode',
    parameters: {
      electrode_type: parameters.electrode_type,
      well: parameters.target_well,
    },
  });
  
  // Verify position
  operations.push({
    operation: 'verify_position',
    parameters: {
      expected_depth: parameters.insertion_depth,
      tolerance: 1, // 1mm tolerance
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
  { operation: 'pick_electrode', description: 'Pick electrode from storage position' },
  { operation: 'move_to_well', description: 'Move electrode to target well' },
  { operation: 'insert_electrode', description: 'Insert electrode to specified depth' },
  { operation: 'secure_electrode', description: 'Secure electrode in position' },
  { operation: 'verify_position', description: 'Verify electrode position' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const ElectrodeSetupNode: React.FC<NodeProps> = (props) => {
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

export const ElectrodeSetupForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as ElectrodeSetupData['parameters']);
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

export const electrodeSetupNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: ElectrodeSetupNode,
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