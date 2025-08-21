import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { ParameterGroup } from '../types';

const parameterGroups: Record<string, ParameterGroup> = {
  measurement: {
    label: 'Measurement Settings',
    parameters: {
      duration: {
        type: 'number',
        label: 'Duration',
        unit: 's',
        description: 'Duration of OCV measurement',
        min: 1,
        max: 3600,
        defaultValue: 180,
        required: true,
      },
      sample_interval: {
        type: 'number',
        label: 'Sample Interval',
        unit: 's',
        description: 'Time between measurements',
        min: 0.1,
        max: 10,
        step: 0.1,
        defaultValue: 1.0,
        required: true,
      },
      settle_time: {
        type: 'number',
        label: 'Settle Time',
        unit: 's',
        description: 'Stabilization time before measurement',
        min: 0,
        max: 60,
        defaultValue: 10,
        required: false,
      },
      stability_threshold: {
        type: 'number',
        label: 'Stability Threshold',
        unit: 'mV',
        description: 'Maximum voltage change for stability',
        min: 0.1,
        max: 10,
        step: 0.1,
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
        defaultValue: 'ocv_measurement',
        required: false,
      },
    }
  },
  safety: {
    label: 'Safety & Limits',
    parameters: {
      voltage_limit_min: {
        type: 'number',
        label: 'Min Voltage Limit',
        unit: 'V',
        description: 'Minimum voltage safety limit',
        min: -2,
        max: 0,
        step: 0.1,
        defaultValue: -1.5,
        required: false,
      },
      voltage_limit_max: {
        type: 'number',
        label: 'Max Voltage Limit',
        unit: 'V',
        description: 'Maximum voltage safety limit',
        min: 0,
        max: 2,
        step: 0.1,
        defaultValue: 1.5,
        required: false,
      },
    }
  },
};

const primitiveOperations = [
  'initialize_potentiostat',
  'configure_safety_limits',
  'apply_settle_time',
  'measure_ocv',
  'collect_data',
  'save_results',
];

export const OCVNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Open Circuit Voltage (OCV)',
        nodeType: 'ocv_measurement',
        category: 'ocv',
        description: 'Measures open circuit voltage over time with stability monitoring',
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
