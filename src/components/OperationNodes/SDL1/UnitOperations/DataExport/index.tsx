import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { DataExportParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'sdl1DataExport';
const NODE_LABEL = 'Data Export';
const NODE_DESCRIPTION = 'Export experimental data to various file formats';
const NODE_CATEGORY = 'data';

export interface DataExportData {
  label: string;
  parameters: DataExportParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: DataExportParams): PrimitiveOperation[] => {
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
  
  // Collect data from buffer/memory
  operations.push({
    operation: 'collect_data',
    parameters: {
      include_metadata: parameters.include_metadata,
    },
  });
  
  // Format data according to export format
  operations.push({
    operation: 'format_data',
    parameters: {
      format: parameters.export_format,
      separate_ac_dc: parameters.separate_ac_dc_files,
    },
  });
  
  // Create file(s)
  operations.push({
    operation: 'create_file',
    parameters: {
      path: parameters.data_path,
      naming_pattern: parameters.file_naming,
      format: parameters.export_format,
    },
  });
  
  // Write metadata if included
  if (parameters.include_metadata) {
    operations.push({
      operation: 'write_metadata',
      parameters: {
        format: parameters.export_format,
      },
    });
  }
  
  // Write data
  operations.push({
    operation: 'write_data',
    parameters: {
      format: parameters.export_format,
      separate_files: parameters.separate_ac_dc_files,
    },
  });
  
  // Save file(s)
  operations.push({
    operation: 'save_file',
    parameters: {
      path: parameters.data_path,
      format: parameters.export_format,
    },
  });
  
  // Verify export
  operations.push({
    operation: 'verify_export',
    parameters: {
      check_integrity: true,
      check_size: true,
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
  { operation: 'collect_data', description: 'Collect data from memory buffer' },
  { operation: 'format_data', description: 'Format data for export' },
  { operation: 'create_file', description: 'Create export file(s)' },
  { operation: 'write_metadata', condition: 'include_metadata == true', description: 'Write experiment metadata' },
  { operation: 'write_data', description: 'Write experimental data' },
  { operation: 'save_file', description: 'Save file to disk' },
  { operation: 'verify_export', description: 'Verify successful export' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const DataExportNode: React.FC<NodeProps> = (props) => {
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

export const DataExportForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as DataExportData['parameters']);
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

export const dataExportNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: DataExportNode,
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