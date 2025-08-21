import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { ParameterGroup } from '../types';

const parameterGroups: Record<string, ParameterGroup> = {
  sweep_parameters: {
    label: 'Sweep Parameters',
    parameters: {
      start_potential: {
        type: 'number',
        label: 'Start Potential',
        unit: 'V',
        description: 'Initial voltage for the sweep',
        min: -2,
        max: 2,
        step: 0.001,
        defaultValue: 0.742,
        required: true,
      },
      end_potential: {
        type: 'number',
        label: 'End Potential',
        unit: 'V',
        description: 'Final voltage for the sweep',
        min: -2,
        max: 2,
        step: 0.001,
        defaultValue: 1.642,
        required: true,
      },
      scan_rate: {
        type: 'number',
        label: 'Scan Rate',
        unit: 'V/s',
        description: 'Rate of voltage change',
        min: 0.001,
        max: 1.0,
        step: 0.001,
        defaultValue: 0.01,
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
        defaultValue: 0.05,
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
        defaultValue: 30.0,
        required: false,
      },
      max_current: {
        type: 'number',
        label: 'Maximum Current',
        unit: 'A',
        description: 'Current limit for safety',
        min: 0.001,
        max: 10,
        step: 0.001,
        defaultValue: 1.62,
        required: false,
      },
      number_of_sweeps: {
        type: 'number',
        label: 'Number of Sweeps',
        description: 'Number of LSV sweeps to perform',
        min: 1,
        max: 10,
        defaultValue: 1,
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
        defaultValue: 'lsv_measurement',
        required: false,
      },
      save_raw_data: {
        type: 'boolean',
        label: 'Save Raw Data',
        description: 'Save unprocessed measurement data',
        defaultValue: true,
        required: false,
      },
    }
  },
};

const primitiveOperations = [
  'initialize_potentiostat',
  'configure_sweep_parameters',
  'apply_quiet_time',
  'perform_lsv',
  'collect_data',
  'analyze_results',
  'save_results',
];

export const LSVNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Linear Sweep Voltammetry (LSV)',
        nodeType: 'lsv_measurement',
        category: 'lsv',
        description: 'Performs linear sweep voltammetry for electrochemical analysis',
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
