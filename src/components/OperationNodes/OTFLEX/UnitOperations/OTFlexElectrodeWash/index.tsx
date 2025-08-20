import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { OTFlexElectrodeWashParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexElectrodeWash';
const NODE_LABEL = 'OTFlex Electrode Wash';
const NODE_DESCRIPTION = 'Wash electrodes using Opentrons Flex liquid handling';
const NODE_CATEGORY = 'liquid_handling';

export interface OTFlexElectrodeWashData {
  label: string;
  parameters: OTFlexElectrodeWashParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: OTFlexElectrodeWashParams): PrimitiveOperation[] => {
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
      wash_reservoir: parameters.wash_reservoir,
      rinse_reservoir: parameters.rinse_reservoir,
      waste_container: parameters.waste_container,
    },
  });
  
  // Pick up tips
  operations.push({
    operation: 'pick_up_tip',
    parameters: {
      tip_rack: parameters.tip_rack,
    },
  });
  
  // Perform wash cycles
  for (let cycle = 1; cycle <= parameters.wash_cycles; cycle++) {
    // Aspirate wash solution
    operations.push({
      operation: 'aspirate_wash_solution',
      parameters: {
        volume: parameters.wash_volume,
        source: parameters.wash_reservoir,
        aspirate_speed: parameters.aspirate_speed,
      },
    });
    
    // Dispense wash solution on electrode
    operations.push({
      operation: 'dispense_on_electrode',
      parameters: {
        volume: parameters.wash_volume,
        electrode_position: parameters.electrode_position,
        dispense_speed: parameters.dispense_speed,
        dispense_height: parameters.dispense_height,
      },
    });
    
    // Wait for wash action
    if (parameters.wash_contact_time > 0) {
      operations.push({
        operation: 'wait',
        parameters: {
          duration: parameters.wash_contact_time,
          unit: 'seconds',
        },
      });
    }
    
    // Aspirate waste
    operations.push({
      operation: 'aspirate_waste',
      parameters: {
        volume: parameters.wash_volume,
        aspirate_speed: parameters.aspirate_speed,
      },
    });
    
    // Dispense to waste
    operations.push({
      operation: 'dispense_to_waste',
      parameters: {
        volume: parameters.wash_volume,
        waste_container: parameters.waste_container,
        dispense_speed: parameters.dispense_speed,
      },
    });
  }
  
  // Perform rinse cycles if enabled
  if (parameters.enable_rinse) {
    for (let cycle = 1; cycle <= parameters.rinse_cycles; cycle++) {
      operations.push({
        operation: 'aspirate_rinse_solution',
        parameters: {
          volume: parameters.rinse_volume,
          source: parameters.rinse_reservoir,
          aspirate_speed: parameters.aspirate_speed,
        },
      });
      
      operations.push({
        operation: 'dispense_on_electrode',
        parameters: {
          volume: parameters.rinse_volume,
          electrode_position: parameters.electrode_position,
          dispense_speed: parameters.dispense_speed,
          dispense_height: parameters.dispense_height,
        },
      });
      
      if (parameters.rinse_contact_time > 0) {
        operations.push({
          operation: 'wait',
          parameters: {
            duration: parameters.rinse_contact_time,
            unit: 'seconds',
          },
        });
      }
      
      operations.push({
        operation: 'aspirate_waste',
        parameters: {
          volume: parameters.rinse_volume,
          aspirate_speed: parameters.aspirate_speed,
        },
      });
      
      operations.push({
        operation: 'dispense_to_waste',
        parameters: {
          volume: parameters.rinse_volume,
          waste_container: parameters.waste_container,
          dispense_speed: parameters.dispense_speed,
        },
      });
    }
  }
  
  // Air dry if enabled
  if (parameters.enable_air_dry) {
    operations.push({
      operation: 'air_dry_electrode',
      parameters: {
        dry_time: parameters.air_dry_time,
        air_gap: parameters.air_gap,
      },
    });
  }
  
  // Drop tips
  operations.push({
    operation: 'drop_tip',
    parameters: {
      waste_container: parameters.waste_container,
    },
  });
  
  // Verify wash completion
  if (parameters.verify_cleanliness) {
    operations.push({
      operation: 'verify_electrode_cleanliness',
      parameters: {
        verification_method: parameters.verification_method,
      },
    });
  }
  
  // Log operation details
  operations.push({
    operation: 'log_wash_operation',
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
  { operation: 'load_labware', description: 'Load wash and rinse labware' },
  { operation: 'pick_up_tip', description: 'Pick up pipette tip' },
  { operation: 'aspirate_wash_solution', description: 'Aspirate wash solution' },
  { operation: 'dispense_on_electrode', description: 'Dispense wash solution on electrode' },
  { operation: 'aspirate_waste', description: 'Aspirate waste from electrode' },
  { operation: 'dispense_to_waste', description: 'Dispense waste to container' },
  { operation: 'aspirate_rinse_solution', condition: 'enable_rinse == true', description: 'Aspirate rinse solution' },
  { operation: 'air_dry_electrode', condition: 'enable_air_dry == true', description: 'Air dry electrode' },
  { operation: 'drop_tip', description: 'Drop pipette tip' },
  { operation: 'verify_electrode_cleanliness', condition: 'verify_cleanliness == true', description: 'Verify electrode cleanliness' },
  { operation: 'log_wash_operation', description: 'Log wash operation details' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const OTFlexElectrodeWashNode: React.FC<NodeProps> = (props) => {
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

export const OTFlexElectrodeWashForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as OTFlexElectrodeWashData['parameters']);
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

export const otflexElectrodeWashNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '🧽',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: OTFlexElectrodeWashNode,
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
