import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { ParameterGroup } from '../types';

const parameterGroups: Record<string, ParameterGroup> = {
  current_parameters: {
    label: 'Current Parameters',
    parameters: {
      current: {
        type: 'number',
        label: 'Applied Current',
        unit: 'A',
        description: 'Constant current for chronopotentiometry',
        min: -10,
        max: 10,
        step: 0.000001,
        defaultValue: 0.00112,
        required: true,
      },
      current_density: {
        type: 'number',
        label: 'Current Density',
        unit: 'A/cm²',
        description: 'Current normalized by electrode area',
        min: 0,
        max: 100,
        step: 0.001,
        defaultValue: 0.01,
        required: false,
      },
      electrode_area: {
        type: 'number',
        label: 'Electrode Area',
        unit: 'cm²',
        description: 'Active electrode area for current density calculation',
        min: 0.01,
        max: 10,
        step: 0.01,
        defaultValue: 0.28,
        required: false,
      },
    }
  },
  time_parameters: {
    label: 'Time Parameters',
    parameters: {
      duration: {
        type: 'number',
        label: 'Duration',
        unit: 's',
        description: 'Total measurement duration',
        min: 1,
        max: 7200,
        defaultValue: 300,
        required: true,
      },
      sample_interval: {
        type: 'number',
        label: 'Sample Interval',
        unit: 's',
        description: 'Time between voltage measurements',
        min: 0.1,
        max: 60,
        step: 0.1,
        defaultValue: 1.0,
        required: true,
      },
      stabilization_time: {
        type: 'number',
        label: 'Stabilization Time',
        unit: 's',
        description: 'Initial stabilization before current application',
        min: 0,
        max: 300,
        defaultValue: 10,
        required: false,
      },
    }
  },
  safety_limits: {
    label: 'Safety Limits',
    parameters: {
      voltage_limit_max: {
        type: 'number',
        label: 'Maximum Voltage Limit',
        unit: 'V',
        description: 'Upper voltage safety limit',
        min: 0,
        max: 5,
        step: 0.1,
        defaultValue: 2.0,
        required: false,
      },
      voltage_limit_min: {
        type: 'number',
        label: 'Minimum Voltage Limit',
        unit: 'V',
        description: 'Lower voltage safety limit',
        min: -5,
        max: 0,
        step: 0.1,
        defaultValue: -1.0,
        required: false,
      },
      enable_voltage_limits: {
        type: 'boolean',
        label: 'Enable Voltage Limits',
        description: 'Activate voltage limit monitoring',
        defaultValue: true,
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
        defaultValue: 'cp_measurement',
        required: false,
      },
      save_voltage_profile: {
        type: 'boolean',
        label: 'Save Voltage Profile',
        description: 'Record voltage vs time data',
        defaultValue: true,
        required: false,
      },
    }
  },
};

const primitiveOperations = [
  'initialize_potentiostat',
  'configure_current_parameters',
  'configure_safety_limits',
  'apply_stabilization_time',
  'perform_chronopotentiometry',
  'monitor_voltage_limits',
  'collect_data',
  'analyze_voltage_profile',
  'save_results',
];

export const CPNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Chronopotentiometry (CP)',
        nodeType: 'cp_measurement',
        category: 'cp',
        description: 'Performs constant current chronopotentiometry with voltage monitoring',
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
