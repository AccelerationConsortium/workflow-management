import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import {
  PARAMETER_GROUPS,
  DEFAULT_VALUES,
  PRIMITIVE_OPERATIONS,
} from './constants';
import { RunExtractionAndTransferToHPLCData, PrimitiveOperation } from '../../types';

const NODE_TYPE = 'sdl7RunExtractionAndTransferToHPLC';
const NODE_LABEL = 'Run Extraction & Transfer to HPLC';
const NODE_DESCRIPTION = 'Execute extraction process, transfer sample from reactor, and run HPLC analysis';
const NODE_CATEGORY = 'extraction';

// Generate primitive operations based on parameters
const generatePrimitiveOperations = (parameters: RunExtractionAndTransferToHPLCData['parameters']): PrimitiveOperation[] => {
  const operations: PrimitiveOperation[] = [];
  
  // 1. Run extraction operation
  operations.push({
    operation: 'run_extraction',
    parameters: {
      stir_time: parameters.stir_time,
      settle_time: parameters.settle_time,
      rate: parameters.rate,
      reactor: parameters.reactor,
      time_units: parameters.time_units,
      output_file: `extraction_${parameters.sample_name}_${Date.now()}.csv`,
    },
  });
  
  // 2. Transfer vial from reactor
  operations.push({
    operation: 'extraction_vial_from_reactor',
    parameters: {
      vial: parameters.extraction_vial,
    },
  });
  
  // 3. Sample aliquot (if enabled)
  if (parameters.perform_aliquot) {
    operations.push({
      operation: 'sample_aliquot',
      parameters: {
        source_tray: 'extraction_tray',
        source_vial: parameters.extraction_vial,
        dest_tray: 'hplc',
        dest_vial: parameters.extraction_vial,
        aliquot_volume_ul: parameters.aliquot_volume_ul || 100,
      },
    });
  }
  
  // 4. Run HPLC analysis
  operations.push({
    operation: 'run_hplc',
    parameters: {
      method: parameters.hplc_method,
      sample_name: parameters.sample_name,
      stall: false,
      vial: parameters.extraction_vial,
      vial_hplc_location: `P2-${parameters.extraction_vial}`,
      inj_vol: parameters.injection_volume,
    },
  });
  
  return operations;
};

// Canvas node component
export const RunExtractionAndTransferToHPLCNode: React.FC<NodeProps> = (props) => {
  const enhancedData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    nodeType: NODE_TYPE,
    category: NODE_CATEGORY,
    description: NODE_DESCRIPTION,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    parameters: { ...DEFAULT_VALUES, ...props.data.parameters },
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
export const RunExtractionAndTransferToHPLCForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as RunExtractionAndTransferToHPLCData['parameters']);
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
export const runExtractionAndTransferToHPLCNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: RunExtractionAndTransferToHPLCNode,
  defaultData: {
    label: NODE_LABEL,
    parameters: DEFAULT_VALUES,
  },
};