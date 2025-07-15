import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { PrepareAndInjectHPLCSampleParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'sdl7PrepareAndInjectHPLCSample';
const NODE_LABEL = 'Prepare & Inject HPLC Sample';
const NODE_DESCRIPTION = 'Prepare sample aliquot, optionally weigh, and inject into HPLC for analysis';
const NODE_CATEGORY = 'hplc-sample';

export interface PrepareAndInjectHPLCSampleData {
  label: string;
  parameters: PrepareAndInjectHPLCSampleParams;
  primitiveOperations?: PrimitiveOperation[];
}
const generatePrimitiveOperations = (parameters: PrepareAndInjectHPLCSampleParams): PrimitiveOperation[] => {
  const operations: PrimitiveOperation[] = [];
  
  operations.push({
    operation: 'sample_aliquot',
    parameters: {
      source_tray: parameters.source_tray,
      source_vial: parameters.source_vial,
      dest_tray: parameters.dest_tray,
      dest_vial: parameters.dest_vial,
      aliquot_volume_ul: parameters.aliquot_volume_ul,
    },
  });
  
  if (parameters.perform_weighing) {
    operations.push({
      operation: 'weigh_container',
      condition: "perform_weighing == true",
      parameters: {
        vial: parameters.dest_vial,
        tray: parameters.dest_tray,
        sample_name: parameters.sample_name || `Sample_${parameters.dest_vial}`,
        to_hplc_inst: true,
      },
    });
  }
  
  operations.push({
    operation: 'run_hplc',
    parameters: {
      method: parameters.hplc_method,
      sample_name: parameters.sample_name || `Sample_${parameters.dest_vial}`,
      stall: parameters.stall,
      vial: parameters.dest_vial,
      vial_hplc_location: `P2-${parameters.dest_vial}`,
      inj_vol: parameters.injection_volume,
    },
  });
  
  return operations;
};

const EXECUTION_STEPS = [
  { operation: 'sample_aliquot', description: 'Transfer sample from source to destination vial' },
  { operation: 'weigh_container', condition: 'perform_weighing == true', description: 'Weigh sample for tracking' },
  { operation: 'run_hplc', description: 'Inject sample and run HPLC analysis' },
];

export const PrepareAndInjectHPLCSampleNode: React.FC<NodeProps> = (props) => {
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

export const PrepareAndInjectHPLCSampleForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as PrepareAndInjectHPLCSampleData['parameters']);
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

export const prepareAndInjectHPLCSampleNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: PrepareAndInjectHPLCSampleNode,
  defaultData: {
    label: NODE_LABEL,
    parameters: DEFAULT_VALUES,
  },
};