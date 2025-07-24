import { ParameterGroup } from '../../types';

export const LABWARE_OPTIONS = [
  { value: 'vial_rack_2', label: 'Vial Rack 2' },
  { value: 'vial_rack_7', label: 'Vial Rack 7' },
  { value: 'vial_rack_11', label: 'Vial Rack 11' },
  { value: 'nis_reactor', label: 'NIS Reactor' },
];

export const WELL_OPTIONS = [
  { value: 'A1', label: 'A1' }, { value: 'A2', label: 'A2' }, { value: 'A3', label: 'A3' }, { value: 'A4', label: 'A4' }, { value: 'A5', label: 'A5' }, { value: 'A6', label: 'A6' },
  { value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'B3', label: 'B3' }, { value: 'B4', label: 'B4' }, { value: 'B5', label: 'B5' }, { value: 'B6', label: 'B6' },
  { value: 'C1', label: 'C1' }, { value: 'C2', label: 'C2' }, { value: 'C3', label: 'C3' }, { value: 'C4', label: 'C4' }, { value: 'C5', label: 'C5' }, { value: 'C6', label: 'C6' },
  { value: 'D1', label: 'D1' }, { value: 'D2', label: 'D2' }, { value: 'D3', label: 'D3' }, { value: 'D4', label: 'D4' }, { value: 'D5', label: 'D5' }, { value: 'D6', label: 'D6' },
];

export const PIPETTE_OPTIONS = [
  { value: 'p1000_single_gen2', label: 'P1000 Single Gen2' },
  { value: 'p300_single_gen2', label: 'P300 Single Gen2' },
  { value: 'p20_single_gen2', label: 'P20 Single Gen2' },
];

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
  uo_name: 'ZnSO4_Solution_Prep',
  description: 'Prepare 5mL ZnSO4 solution for electrodeposition',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  // Specific parameters from Python script (lines 414-432)
  source_labware: 'vial_rack_2',
  source_well: 'A1',
  target_labware: 'nis_reactor',
  target_well: 'A1',  // User will select actual test well
  volume: 5000,  // 5mL as per line 424
  pipette_type: 'p1000_single_gen2',
  aspiration_offset_z: 8,  // From line 427 (fltOffsetZ_from=8)
  dispense_offset_x: -1,   // From line 428 (fltOffsetX_to=-1)
  dispense_offset_y: 0.5,  // From line 429 (fltOffsetY_to=0.5)
  dispense_offset_z: 0,    // From line 430 (fltOffsetZ_to=0)
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
  source: {
    label: 'Source Configuration',
    parameters: {
      source_labware: {
        type: 'select',
        label: 'Source Labware',
        description: 'Labware containing the source solution',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.source_labware,
        required: true,
      },
      source_well: {
        type: 'string',
        label: 'Source Well',
        description: 'Well position in source labware (e.g., A1, B2)',
        defaultValue: DEFAULT_VALUES.source_well,
        required: true,
      },
    },
  },
  target: {
    label: 'Target Configuration',
    parameters: {
      target_labware: {
        type: 'select',
        label: 'Target Labware',
        description: 'Labware to dispense solution into',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.target_labware,
        required: true,
      },
      target_well: {
        type: 'string',
        label: 'Target Well',
        description: 'Well position in target labware (e.g., A1-D6)',
        defaultValue: DEFAULT_VALUES.target_well,
        required: true,
      },
    },
  },
  liquid_handling: {
    label: 'Liquid Handling Parameters',
    parameters: {
      volume: {
        type: 'number',
        label: 'Volume',
        description: 'Volume to transfer',
        defaultValue: DEFAULT_VALUES.volume,
        min: 1,
        max: 10000,
        step: 1,
        unit: 'μL',
        required: true,
      },
      pipette_type: {
        type: 'select',
        label: 'Pipette Type',
        description: 'Type of pipette to use',
        options: PIPETTE_OPTIONS,
        defaultValue: DEFAULT_VALUES.pipette_type,
        required: true,
      },
      aspiration_offset_z: {
        type: 'number',
        label: 'Aspiration Offset Z',
        description: 'Z-axis offset for aspiration',
        defaultValue: DEFAULT_VALUES.aspiration_offset_z,
        min: 0,
        max: 20,
        step: 0.1,
        unit: 'mm',
      },
    },
  },
  dispense_offsets: {
    label: 'Dispense Offset Configuration',
    parameters: {
      dispense_offset_x: {
        type: 'number',
        label: 'Dispense Offset X',
        description: 'X-axis offset for dispensing',
        defaultValue: DEFAULT_VALUES.dispense_offset_x,
        min: -5,
        max: 5,
        step: 0.1,
        unit: 'mm',
      },
      dispense_offset_y: {
        type: 'number',
        label: 'Dispense Offset Y',
        description: 'Y-axis offset for dispensing',
        defaultValue: DEFAULT_VALUES.dispense_offset_y,
        min: -5,
        max: 5,
        step: 0.1,
        unit: 'mm',
      },
      dispense_offset_z: {
        type: 'number',
        label: 'Dispense Offset Z',
        description: 'Z-axis offset for dispensing',
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
  'select_pipette',
  'aspirate_solution',
  'move_to_target',
  'dispense_solution',
  'drop_tip',
];