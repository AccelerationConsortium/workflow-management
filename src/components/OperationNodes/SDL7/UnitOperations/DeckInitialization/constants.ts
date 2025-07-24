import { ParameterGroup } from '../../types';

export const METHOD_OPTIONS = [
  { value: 'standard_curve_01', label: 'Standard Curve 01' },
  { value: 'gradient_method_A', label: 'Gradient Method A' },
  { value: 'isocratic_method_B', label: 'Isocratic Method B' },
  { value: 'quick_scan', label: 'Quick Scan' },
  { value: 'custom_method', label: 'Custom Method' },
];

export const DEFAULT_VALUES = {
  // Initialize deck parameters
  experiment_name: 'SDL7_Experiment',
  solvent_file: 'solvents_default.csv',
  
  // HPLC setup parameters
  method_name: 'standard_curve_01',
  injection_volume: 5,
  sequence: '',
};

export const PARAMETER_GROUPS: Record<string, ParameterGroup> = {
  deck: {
    label: 'Deck Initialization',
    parameters: {
      experiment_name: {
        type: 'string',
        label: 'Experiment Name',
        description: 'Name for this experimental run',
        defaultValue: DEFAULT_VALUES.experiment_name,
        required: true,
      },
      solvent_file: {
        type: 'string',
        label: 'Solvent Configuration File',
        description: 'CSV file containing solvent definitions',
        defaultValue: DEFAULT_VALUES.solvent_file,
        required: true,
      },
    },
  },
  hplc: {
    label: 'HPLC Instrument Setup',
    parameters: {
      method_name: {
        type: 'select',
        label: 'HPLC Method',
        description: 'Default method for HPLC runs',
        options: METHOD_OPTIONS,
        defaultValue: DEFAULT_VALUES.method_name,
        required: true,
      },
      injection_volume: {
        type: 'number',
        label: 'Default Injection Volume',
        description: 'Default volume for HPLC injections',
        defaultValue: DEFAULT_VALUES.injection_volume,
        min: 1,
        max: 100,
        step: 1,
        unit: 'μL',
        required: true,
      },
      sequence: {
        type: 'string',
        label: 'Sequence Name',
        description: 'Optional sequence identifier',
        defaultValue: DEFAULT_VALUES.sequence,
        required: false,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'initialize_deck',
  'hplc_instrument_setup',
];