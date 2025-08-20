import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { OTFlexTransferParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexTransfer';
const NODE_LABEL = 'OTFlex Transfer';
const NODE_DESCRIPTION = 'Transfer liquids using Opentrons Flex';
const NODE_CATEGORY = 'liquid_handling';

export interface OTFlexTransferData {
  label: string;
  parameters: OTFlexTransferParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: OTFlexTransferParams): PrimitiveOperation[] => {
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
  
  // Initialize OTFlex connection
  operations.push({
    operation: 'initialize_otflex',
    parameters: {
      log_level: parameters.log_level,
    },
  });
  
  operations.push({
    operation: 'check_pipette_connection',
    parameters: {
      pipette: parameters.pipette,
    },
  });
  
  // Load labware
  operations.push({
    operation: 'load_labware',
    parameters: {
      source_labware: parameters.source_labware,
      dest_labware: parameters.dest_labware,
    },
  });
  
  // Pick up tip if tip tracking enabled
  if (parameters.tip_tracking) {
    operations.push({
      operation: 'pick_up_tip',
      parameters: {},
    });
  }
  
  // Aspirate liquid
  operations.push({
    operation: 'aspirate_liquid',
    parameters: {
      volume: parameters.volume,
      source_labware: parameters.source_labware,
      source_well: parameters.source_well,
      aspirate_speed: parameters.aspirate_speed,
      liquid_detection: parameters.liquid_detection,
    },
  });
  
  // Add air gap if specified
  if (parameters.air_gap > 0) {
    operations.push({
      operation: 'aspirate_air_gap',
      parameters: {
        volume: parameters.air_gap,
      },
    });
  }
  
  // Dispense liquid
  operations.push({
    operation: 'dispense_liquid',
    parameters: {
      volume: parameters.volume,
      dest_labware: parameters.dest_labware,
      dest_well: parameters.dest_well,
      dispense_speed: parameters.dispense_speed,
    },
  });
  
  // Drop tip if tip tracking enabled
  if (parameters.tip_tracking) {
    operations.push({
      operation: 'drop_tip',
      parameters: {},
    });
  }
  
  // Verify transfer if required
  if (parameters.wait_for_completion) {
    operations.push({
      operation: 'verify_transfer',
      parameters: {
        volume_tolerance: parameters.volume_tolerance,
        timeout: parameters.completion_timeout,
      },
    });
  }
  
  // Log operation details
  operations.push({
    operation: 'log_transfer_operation',
    parameters: {
      level: parameters.log_level,
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
  { operation: 'initialize_otflex', description: 'Initialize Opentrons Flex connection' },
  { operation: 'check_pipette_connection', description: 'Verify pipette connection' },
  { operation: 'load_labware', description: 'Load source and destination labware' },
  { operation: 'pick_up_tip', condition: 'tip_tracking == true', description: 'Pick up pipette tip' },
  { operation: 'aspirate_liquid', description: 'Aspirate liquid from source' },
  { operation: 'aspirate_air_gap', condition: 'air_gap > 0', description: 'Aspirate air gap' },
  { operation: 'dispense_liquid', description: 'Dispense liquid to destination' },
  { operation: 'drop_tip', condition: 'tip_tracking == true', description: 'Drop pipette tip' },
  { operation: 'verify_transfer', condition: 'wait_for_completion == true', description: 'Verify transfer completion' },
  { operation: 'log_transfer_operation', description: 'Log transfer operation details' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const OTFlexTransferNode: React.FC<NodeProps> = (props) => {
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

export const OTFlexTransferForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as OTFlexTransferData['parameters']);
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

export const otflexTransferNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '💧',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: OTFlexTransferNode,
  defaultData: {
    label: NODE_LABEL,
    description: NODE_DESCRIPTION,
    nodeType: NODE_TYPE,
    category: 'OTFLEX',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
  },
};
