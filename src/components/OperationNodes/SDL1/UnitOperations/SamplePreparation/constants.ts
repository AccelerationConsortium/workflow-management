import { ParameterGroup } from '../../types';
import { LABWARE_OPTIONS, PIPETTE_OPTIONS, VIAL_POSITIONS } from '../../shared/labwareConstants';

export const ERROR_HANDLING_OPTIONS = [
  { value: 'continue', label: 'Continue' },
  { value: 'stop', label: 'Stop' },
  { value: 'retry', label: 'Retry' },
];

export const LOG_LEVEL_OPTIONS = [
  { value: 'DEBUG', label: 'DEBUG' },
  { value: 'INFO', label: 'INFO' },
  { value: 'WARNING', label: 'WARNING' },
  { value: 'ERROR', label: 'ERROR' },
];

export const DEFAULT_VALUES = {
  // Common parameters
  uo_name: 'Sample_Preparation',
  description: 'Prepare sample with conditional additives A-G',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Target configuration
  target_cell: 'A1',
  total_volume: 3000,  // Total volume in μL
  
  // Additive flags (0 or 1)
  additive_A: 0,
  additive_B: 0,
  additive_C: 0,
  additive_D: 0,
  additive_E: 0,
  additive_F: 0,
  additive_G: 0,
  
  // Volume per additive when enabled
  additive_volume: 100,  // μL per additive
  
  // Pipetting parameters
  pipette_type: 'p1000_single_gen2',
  move_speed: 100,
  
  // Offsets for dispensing
  dispense_offset_x: -1,
  dispense_offset_y: 0.5,
  dispense_offset_z: 0,
};

export const PARAMETER_GROUPS: Record<string, ParameterGroup> = {
  common: {
    label: 'Common Parameters',
    parameters: {
      uo_name: {
        type: 'string',
        label: 'UO Name',
        description: 'Custom name for this operation',
        defaultValue: DEFAULT_VALUES.uo_name,
        required: false,
      },
      description: {
        type: 'string',
        label: 'Description',
        description: 'Operation description',
        defaultValue: DEFAULT_VALUES.description,
        required: false,
      },
      wait_before: {
        type: 'number',
        label: 'Wait Before',
        description: 'Wait time before execution',
        defaultValue: DEFAULT_VALUES.wait_before,
        min: 0,
        max: 3600,
        step: 1,
        unit: 's',
      },
      wait_after: {
        type: 'number',
        label: 'Wait After',
        description: 'Wait time after execution',
        defaultValue: DEFAULT_VALUES.wait_after,
        min: 0,
        max: 3600,
        step: 1,
        unit: 's',
      },
      error_handling: {
        type: 'select',
        label: 'Error Handling',
        description: 'How to handle errors',
        options: ERROR_HANDLING_OPTIONS,
        defaultValue: DEFAULT_VALUES.error_handling,
        required: true,
      },
      log_level: {
        type: 'select',
        label: 'Log Level',
        description: 'Logging level',
        options: LOG_LEVEL_OPTIONS,
        defaultValue: DEFAULT_VALUES.log_level,
        required: true,
      },
    },
  },
  target: {
    label: 'Target Configuration',
    parameters: {
      target_cell: {
        type: 'select',
        label: 'Target Cell',
        description: 'NIS reactor cell for sample preparation',
        options: VIAL_POSITIONS.nis_reactor.map(pos => ({ value: pos, label: pos })),
        defaultValue: DEFAULT_VALUES.target_cell,
        required: true,
      },
      total_volume: {
        type: 'number',
        label: 'Total Volume',
        description: 'Total sample volume to prepare',
        defaultValue: DEFAULT_VALUES.total_volume,
        min: 100,
        max: 5000,
        step: 100,
        unit: 'μL',
        required: true,
      },
    },
  },
  additives: {
    label: 'Additive Selection',
    parameters: {
      additive_A: {
        type: 'boolean',
        label: 'Use Additive A',
        description: 'Include additive A from vial A2',
        defaultValue: DEFAULT_VALUES.additive_A,
      },
      additive_B: {
        type: 'boolean',
        label: 'Use Additive B',
        description: 'Include additive B from vial A3',
        defaultValue: DEFAULT_VALUES.additive_B,
      },
      additive_C: {
        type: 'boolean',
        label: 'Use Additive C',
        description: 'Include additive C from vial A4',
        defaultValue: DEFAULT_VALUES.additive_C,
      },
      additive_D: {
        type: 'boolean',
        label: 'Use Additive D',
        description: 'Include additive D from vial B1',
        defaultValue: DEFAULT_VALUES.additive_D,
      },
      additive_E: {
        type: 'boolean',
        label: 'Use Additive E',
        description: 'Include additive E from vial B2',
        defaultValue: DEFAULT_VALUES.additive_E,
      },
      additive_F: {
        type: 'boolean',
        label: 'Use Additive F',
        description: 'Include additive F from vial B3',
        defaultValue: DEFAULT_VALUES.additive_F,
      },
      additive_G: {
        type: 'boolean',
        label: 'Use Additive G',
        description: 'Include additive G from vial B4',
        defaultValue: DEFAULT_VALUES.additive_G,
      },
      additive_volume: {
        type: 'number',
        label: 'Volume per Additive',
        description: 'Volume to add for each selected additive',
        defaultValue: DEFAULT_VALUES.additive_volume,
        min: 10,
        max: 1000,
        step: 10,
        unit: 'μL',
        required: true,
      },
    },
  },
  liquid_handling: {
    label: 'Liquid Handling Parameters',
    parameters: {
      pipette_type: {
        type: 'select',
        label: 'Pipette Type',
        description: 'Type of pipette to use',
        options: PIPETTE_OPTIONS,
        defaultValue: DEFAULT_VALUES.pipette_type,
        required: true,
      },
      move_speed: {
        type: 'number',
        label: 'Movement Speed',
        description: 'Speed for pipette movements',
        defaultValue: DEFAULT_VALUES.move_speed,
        min: 10,
        max: 400,
        step: 10,
        unit: 'mm/s',
      },
    },
  },
  dispense_offsets: {
    label: 'Dispense Offset Configuration',
    parameters: {
      dispense_offset_x: {
        type: 'number',
        label: 'Dispense Offset X',
        description: 'X-axis offset for dispensing into reactor',
        defaultValue: DEFAULT_VALUES.dispense_offset_x,
        min: -5,
        max: 5,
        step: 0.1,
        unit: 'mm',
      },
      dispense_offset_y: {
        type: 'number',
        label: 'Dispense Offset Y',
        description: 'Y-axis offset for dispensing into reactor',
        defaultValue: DEFAULT_VALUES.dispense_offset_y,
        min: -5,
        max: 5,
        step: 0.1,
        unit: 'mm',
      },
      dispense_offset_z: {
        type: 'number',
        label: 'Dispense Offset Z',
        description: 'Z-axis offset for dispensing into reactor',
        defaultValue: DEFAULT_VALUES.dispense_offset_z,
        min: -5,
        max: 5,
        step: 0.1,
        unit: 'mm',
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'calculate_volumes',
  'pickup_tip',
  'transfer_additive',
  'transfer_base_solution',
  'mix_solution',
  'drop_tip',
];