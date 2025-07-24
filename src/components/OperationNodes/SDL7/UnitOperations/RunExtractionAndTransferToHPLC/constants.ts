import { ParameterGroup } from '../../types';

export const TIME_UNIT_OPTIONS = [
  { value: 'min', label: 'Minutes' },
  { value: 'sec', label: 'Seconds' },
  { value: 'hr', label: 'Hours' },
];

export const REACTOR_OPTIONS = [
  { value: 1, label: 'Reactor 1' },
  { value: 2, label: 'Reactor 2' },
  { value: 3, label: 'Reactor 3' },
  { value: 4, label: 'Reactor 4' },
];

export const VIAL_OPTIONS = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'A3', label: 'A3' },
  { value: 'A4', label: 'A4' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'B3', label: 'B3' },
  { value: 'B4', label: 'B4' },
];

export const HPLC_METHOD_OPTIONS = [
  { value: 'standard_curve_01', label: 'Standard Curve 01' },
  { value: 'gradient_method_A', label: 'Gradient Method A' },
  { value: 'isocratic_method_B', label: 'Isocratic Method B' },
  { value: 'extraction_analysis', label: 'Extraction Analysis' },
];

export const DEFAULT_VALUES = {
  // Extraction parameters
  stir_time: 5,
  settle_time: 2,
  rate: 1000,
  reactor: 1,
  time_units: 'min',
  
  // Transfer parameters
  extraction_vial: 'A1',
  perform_aliquot: true,
  aliquot_volume_ul: 100,
  
  // HPLC parameters
  hplc_method: 'extraction_analysis',
  injection_volume: 10,
  sample_name: 'Extraction_Sample',
};

export const PARAMETER_GROUPS: Record<string, ParameterGroup> = {
  extraction: {
    label: 'Extraction Parameters',
    parameters: {
      reactor: {
        type: 'select',
        label: 'Reactor',
        description: 'Select reactor for extraction',
        options: REACTOR_OPTIONS,
        defaultValue: DEFAULT_VALUES.reactor,
        required: true,
      },
      stir_time: {
        type: 'number',
        label: 'Stir Time',
        description: 'Duration of stirring phase',
        defaultValue: DEFAULT_VALUES.stir_time,
        min: 0.1,
        max: 60,
        step: 0.1,
        required: true,
      },
      settle_time: {
        type: 'number',
        label: 'Settle Time',
        description: 'Duration to allow phases to separate',
        defaultValue: DEFAULT_VALUES.settle_time,
        min: 0.1,
        max: 60,
        step: 0.1,
        required: true,
      },
      time_units: {
        type: 'select',
        label: 'Time Units',
        description: 'Units for time parameters',
        options: TIME_UNIT_OPTIONS,
        defaultValue: DEFAULT_VALUES.time_units,
        required: true,
      },
      rate: {
        type: 'number',
        label: 'Stir Rate',
        description: 'Stirring speed',
        defaultValue: DEFAULT_VALUES.rate,
        min: 100,
        max: 2000,
        step: 50,
        unit: 'RPM',
        required: true,
      },
    },
  },
  transfer: {
    label: 'Transfer Configuration',
    parameters: {
      extraction_vial: {
        type: 'select',
        label: 'Extraction Vial',
        description: 'Vial position for extracted sample',
        options: VIAL_OPTIONS,
        defaultValue: DEFAULT_VALUES.extraction_vial,
        required: true,
      },
      perform_aliquot: {
        type: 'boolean',
        label: 'Perform Aliquot',
        description: 'Take aliquot for HPLC analysis',
        defaultValue: DEFAULT_VALUES.perform_aliquot,
      },
      aliquot_volume_ul: {
        type: 'number',
        label: 'Aliquot Volume',
        description: 'Volume to transfer for HPLC',
        defaultValue: DEFAULT_VALUES.aliquot_volume_ul,
        min: 1,
        max: 1000,
        step: 1,
        unit: 'μL',
        required: false,
        dependsOn: {
          parameter: 'perform_aliquot',
          value: true,
        },
      },
    },
  },
  hplc: {
    label: 'HPLC Analysis',
    parameters: {
      hplc_method: {
        type: 'select',
        label: 'HPLC Method',
        description: 'Analytical method for extraction analysis',
        options: HPLC_METHOD_OPTIONS,
        defaultValue: DEFAULT_VALUES.hplc_method,
        required: true,
      },
      injection_volume: {
        type: 'number',
        label: 'Injection Volume',
        description: 'Volume to inject into HPLC',
        defaultValue: DEFAULT_VALUES.injection_volume,
        min: 1,
        max: 100,
        step: 1,
        unit: 'μL',
        required: true,
      },
      sample_name: {
        type: 'string',
        label: 'Sample Name',
        description: 'Name for sample identification',
        defaultValue: DEFAULT_VALUES.sample_name,
        required: true,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'run_extraction',
  'extraction_vial_from_reactor',
  'sample_aliquot',
  'run_hplc',
];