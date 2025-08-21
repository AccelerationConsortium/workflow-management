import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { ParameterGroup } from '../types';

const parameterGroups: Record<string, ParameterGroup> = {
  frequency_parameters: {
    label: 'Frequency Parameters',
    parameters: {
      start_frequency: {
        type: 'number',
        label: 'Start Frequency',
        unit: 'Hz',
        description: 'Starting frequency for EIS sweep',
        min: 0.01,
        max: 1000000,
        defaultValue: 100000,
        required: true,
      },
      end_frequency: {
        type: 'number',
        label: 'End Frequency',
        unit: 'Hz',
        description: 'Ending frequency for EIS sweep',
        min: 0.01,
        max: 1000000,
        defaultValue: 0.2,
        required: true,
      },
      steps_per_decade: {
        type: 'number',
        label: 'Steps per Decade',
        description: 'Number of frequency points per decade',
        min: 1,
        max: 20,
        defaultValue: 8,
        required: true,
      },
      frequency_sweep_type: {
        type: 'select',
        label: 'Frequency Sweep Type',
        description: 'Type of frequency progression',
        defaultValue: 'logarithmic',
        options: [
          { value: 'logarithmic', label: 'Logarithmic' },
          { value: 'linear', label: 'Linear' },
        ],
        required: false,
      },
    }
  },
  voltage_parameters: {
    label: 'Voltage Parameters',
    parameters: {
      voltage_bias: {
        type: 'number',
        label: 'DC Bias Voltage',
        unit: 'V',
        description: 'DC voltage bias for EIS measurement',
        min: -2,
        max: 2,
        step: 0.001,
        defaultValue: 0.731,
        required: true,
      },
      voltage_amplitude: {
        type: 'number',
        label: 'AC Voltage Amplitude',
        unit: 'V',
        description: 'AC voltage amplitude for impedance measurement',
        min: 0.001,
        max: 0.1,
        step: 0.001,
        defaultValue: 0.01,
        required: true,
      },
      bias_vs_ocp: {
        type: 'boolean',
        label: 'Bias vs OCP',
        description: 'Apply bias relative to open circuit potential',
        defaultValue: false,
        required: false,
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
        description: 'Stabilization time before EIS measurement',
        min: 0,
        max: 300,
        defaultValue: 10.0,
        required: false,
      },
      minimum_cycles: {
        type: 'number',
        label: 'Minimum Cycles',
        description: 'Minimum number of AC cycles to measure',
        min: 1,
        max: 10,
        defaultValue: 3,
        required: false,
      },
      integration_time: {
        type: 'number',
        label: 'Integration Time',
        unit: 's',
        description: 'Time to integrate each frequency point',
        min: 0.1,
        max: 60,
        step: 0.1,
        defaultValue: 2.0,
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
        description: 'Enable/disable impedance data recording',
        defaultValue: true,
        required: false,
      },
      data_tag: {
        type: 'string',
        label: 'Data Tag',
        description: 'Tag for data identification',
        defaultValue: 'peis_measurement',
        required: false,
      },
      save_complex_impedance: {
        type: 'boolean',
        label: 'Save Complex Impedance',
        description: 'Save real and imaginary impedance components',
        defaultValue: true,
        required: false,
      },
      save_bode_plot_data: {
        type: 'boolean',
        label: 'Save Bode Plot Data',
        description: 'Save magnitude and phase data for Bode plots',
        defaultValue: true,
        required: false,
      },
    }
  },
};

const primitiveOperations = [
  'initialize_potentiostat',
  'configure_frequency_range',
  'configure_voltage_parameters',
  'apply_quiet_time',
  'perform_impedance_sweep',
  'collect_impedance_data',
  'calculate_impedance_parameters',
  'analyze_eis_results',
  'save_results',
];

export const PEISNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'Potentiostatic EIS (PEIS)',
        nodeType: 'peis_measurement',
        category: 'peis',
        description: 'Performs potentiostatic electrochemical impedance spectroscopy',
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
