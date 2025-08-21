import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { ParameterGroup } from '../types';

const parameterGroups: Record<string, ParameterGroup> = {
  voltage_parameters: {
    label: 'Voltage Parameters',
    parameters: {
      start_voltage: {
        type: 'number',
        label: 'Start Voltage',
        unit: 'V',
        description: 'Initial voltage for CV scan',
        min: -2,
        max: 2,
        step: 0.001,
        defaultValue: 0.300,
        required: true,
      },
      first_voltage_limit: {
        type: 'number',
        label: 'First Voltage Limit',
        unit: 'V',
        description: 'First turning point voltage',
        min: -2,
        max: 2,
        step: 0.001,
        defaultValue: 0.400,
        required: true,
      },
      second_voltage_limit: {
        type: 'number',
        label: 'Second Voltage Limit',
        unit: 'V',
        description: 'Second turning point voltage',
        min: -2,
        max: 2,
        step: 0.001,
        defaultValue: 0.300,
        required: true,
      },
      end_voltage: {
        type: 'number',
        label: 'End Voltage',
        unit: 'V',
        description: 'Final voltage for CV scan',
        min: -2,
        max: 2,
        step: 0.001,
        defaultValue: 0.300,
        required: true,
      },
    }
  },
  scan_parameters: {
    label: 'Scan Parameters',
    parameters: {
      scan_rate_1: {
        type: 'number',
        label: 'Scan Rate 1',
        unit: 'V/s',
        description: 'First scan rate for multiple rate CV',
        min: 0.001,
        max: 1.0,
        step: 0.001,
        defaultValue: 0.01,
        required: true,
      },
      scan_rate_2: {
        type: 'number',
        label: 'Scan Rate 2',
        unit: 'V/s',
        description: 'Second scan rate',
        min: 0.001,
        max: 1.0,
        step: 0.001,
        defaultValue: 0.05,
        required: false,
      },
      scan_rate_3: {
        type: 'number',
        label: 'Scan Rate 3',
        unit: 'V/s',
        description: 'Third scan rate',
        min: 0.001,
        max: 1.0,
        step: 0.001,
        defaultValue: 0.10,
        required: false,
      },
      cycles: {
        type: 'number',
        label: 'Number of Cycles',
        description: 'Number of CV cycles per scan rate',
        min: 1,
        max: 20,
        defaultValue: 5,
        required: true,
      },
      sample_interval: {
        type: 'number',
        label: 'Sample Interval',
        unit: 's',
        description: 'Time between data points',
        min: 0.001,
        max: 1.0,
        step: 0.001,
        defaultValue: 0.01,
        required: true,
      },
    }
  },
  measurement_settings: {
    label: 'Measurement Settings',
    parameters: {
      quiet_time: {
        type: 'number',
        label: 'Quiet Time',
        unit: 's',
        description: 'Stabilization time before scan',
        min: 0,
        max: 300,
        defaultValue: 10.0,
        required: false,
      },
      enable_multiple_rates: {
        type: 'boolean',
        label: 'Enable Multiple Scan Rates',
        description: 'Perform CV at multiple scan rates',
        defaultValue: true,
        required: false,
      },
      current_limit: {
        type: 'number',
        label: 'Current Limit',
        unit: 'A',
        description: 'Maximum current for safety',
        min: 0.001,
        max: 10,
        step: 0.001,
        defaultValue: 1.0,
        required: false,
      },
    }
  },
  hardware: {
    label: 'Hardware Configuration',
    parameters: {
      com_port: {
        type: 'select',
        label: 'COM Port',
        description: 'Potentiostat communication port',
        defaultValue: 'COM4',
        options: [
          { value: 'COM3', label: 'COM3' },
          { value: 'COM4', label: 'COM4' },
          { value: 'COM5', label: 'COM5' },
          { value: 'COM6', label: 'COM6' },
        ],
        required: true,
      },
      channel: {
        type: 'number',
        label: 'Channel',
        description: 'Potentiostat channel',
        min: 0,
        max: 7,
        defaultValue: 0,
        required: true,
      },
    }
  },
  data_collection: {
    label: 'Data Collection',
    parameters: {
      data_collection_enabled: {
        type: 'boolean',
        label: 'Enable Data Collection',
        description: 'Enable/disable data recording',
        defaultValue: true,
        required: false,
      },
      data_tag: {
        type: 'string',
        label: 'Data Tag',
        description: 'Tag for data identification',
        defaultValue: 'cva_measurement',
        required: false,
      },
      save_individual_cycles: {
        type: 'boolean',
        label: 'Save Individual Cycles',
        description: 'Save data from each CV cycle',
        defaultValue: true,
        required: false,
      },
    }
  },
};

const primitiveOperations = [
  'initialize_potentiostat',
  'configure_cv_parameters',
  'apply_quiet_time',
  'perform_cv_scan_rate_1',
  'perform_cv_scan_rate_2',
  'perform_cv_scan_rate_3',
  'collect_data',
  'analyze_results',
  'save_results',
];

export const CVANode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Cyclic Voltammetry (CVA)',
        nodeType: 'cva_measurement',
        category: 'cva',
        description: 'Performs cyclic voltammetry at multiple scan rates for electrochemical analysis',
        parameterGroups,
        primitiveOperations,
        onDataChange: (data) => {
          if (props.data.onDataChange) {
            props.data.onDataChange(data);
          }
        },
      }}
    />
  );
};
