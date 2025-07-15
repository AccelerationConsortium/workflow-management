import { ParameterGroup } from '../../types';

export const TRAY_OPTIONS = [
  { value: 'reaction_tray', label: 'Reaction Tray' },
  { value: 'hplc', label: 'HPLC Tray' },
  { value: 'sample_tray', label: 'Sample Tray' },
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
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
  { value: 'C3', label: 'C3' },
  { value: 'C4', label: 'C4' },
];

export const HPLC_METHOD_OPTIONS = [
  { value: 'standard_curve_01', label: 'Standard Curve 01' },
  { value: 'gradient_method_A', label: 'Gradient Method A' },
  { value: 'isocratic_method_B', label: 'Isocratic Method B' },
  { value: 'custom_method', label: 'Custom Method' },
];

export const DEFAULT_VALUES = {
  source_tray: 'reaction_tray',
  source_vial: 'A1',
  aliquot_volume_ul: 100,
  dest_tray: 'hplc',
  dest_vial: 'A1',
  perform_weighing: true,
  sample_name: '',
  hplc_method: 'standard_curve_01',
  injection_volume: 5,
  stall: false,
};

export const PARAMETER_GROUPS: Record<string, ParameterGroup> = {
  source: {
    label: 'Source Configuration',
    parameters: {
      source_tray: {
        type: 'select',
        label: 'Source Tray',
        description: 'Tray containing the source sample',
        options: TRAY_OPTIONS,
        defaultValue: DEFAULT_VALUES.source_tray,
        required: true,
      },
      source_vial: {
        type: 'select',
        label: 'Source Vial',
        description: 'Vial position in the source tray',
        options: VIAL_OPTIONS,
        defaultValue: DEFAULT_VALUES.source_vial,
        required: true,
      },
    },
  },
  aliquot: {
    label: 'Aliquot Parameters',
    parameters: {
      aliquot_volume_ul: {
        type: 'number',
        label: 'Aliquot Volume',
        description: 'Volume to transfer for HPLC analysis',
        defaultValue: DEFAULT_VALUES.aliquot_volume_ul,
        min: 1,
        max: 1000,
        step: 1,
        unit: 'μL',
        required: true,
      },
      dest_tray: {
        type: 'select',
        label: 'Destination Tray',
        description: 'HPLC tray for sample injection',
        options: TRAY_OPTIONS.filter(opt => opt.value === 'hplc'),
        defaultValue: DEFAULT_VALUES.dest_tray,
        required: true,
      },
      dest_vial: {
        type: 'select',
        label: 'Destination Vial',
        description: 'Vial position in HPLC tray',
        options: VIAL_OPTIONS,
        defaultValue: DEFAULT_VALUES.dest_vial,
        required: true,
      },
    },
  },
  weighing: {
    label: 'Weighing Options',
    parameters: {
      perform_weighing: {
        type: 'boolean',
        label: 'Perform Weighing',
        description: 'Weigh the sample before HPLC injection',
        defaultValue: DEFAULT_VALUES.perform_weighing,
      },
      sample_name: {
        type: 'string',
        label: 'Sample Name',
        description: 'Name for sample tracking',
        defaultValue: DEFAULT_VALUES.sample_name,
        required: false,
        dependsOn: {
          parameter: 'perform_weighing',
          value: true,
        },
      },
    },
  },
  hplc: {
    label: 'HPLC Configuration',
    parameters: {
      hplc_method: {
        type: 'select',
        label: 'HPLC Method',
        description: 'Analytical method for HPLC run',
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
      stall: {
        type: 'boolean',
        label: 'Stall After Injection',
        description: 'Wait for manual intervention after injection',
        defaultValue: DEFAULT_VALUES.stall,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'sample_aliquot',
  'weigh_container',
  'run_hplc',
];