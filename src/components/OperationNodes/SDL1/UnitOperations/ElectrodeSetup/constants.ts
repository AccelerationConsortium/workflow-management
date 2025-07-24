import { ParameterGroup } from '../../types';

export const ELECTRODE_TYPE_OPTIONS = [
  { value: 'reference', label: 'Reference Electrode' },
  { value: 'counter', label: 'Counter Electrode' },
  { value: 'working', label: 'Working Electrode' },
];

export const ELECTRODE_POSITION_OPTIONS = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
];

export const TARGET_WELL_OPTIONS = [
  { value: 'A1', label: 'A1' }, { value: 'A2', label: 'A2' }, { value: 'A3', label: 'A3' }, { value: 'A4', label: 'A4' }, { value: 'A5', label: 'A5' }, { value: 'A6', label: 'A6' },
  { value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'B3', label: 'B3' }, { value: 'B4', label: 'B4' }, { value: 'B5', label: 'B5' }, { value: 'B6', label: 'B6' },
  { value: 'C1', label: 'C1' }, { value: 'C2', label: 'C2' }, { value: 'C3', label: 'C3' }, { value: 'C4', label: 'C4' }, { value: 'C5', label: 'C5' }, { value: 'C6', label: 'C6' },
  { value: 'D1', label: 'D1' }, { value: 'D2', label: 'D2' }, { value: 'D3', label: 'D3' }, { value: 'D4', label: 'D4' }, { value: 'D5', label: 'D5' }, { value: 'D6', label: 'D6' },
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
  uo_name: 'Reference_Electrode_Setup',
  description: 'Setup reference electrode for electrochemical measurement',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  // Specific parameters from Python script (lines 447-486)
  electrode_type: 'reference',
  electrode_position: 'A2',  // From line 450 (strWellName='A2')
  target_well: 'A1',  // User will select actual test well
  insertion_depth: 26, // From line 485 (fltOffsetZ=-26, absolute value)
  lateral_offset_x: 0.5,  // From line 473 (fltOffsetX=0.5)
  lateral_offset_y: 0.5,  // From line 474 (fltOffsetY=0.5)
  movement_speed: 50,     // From line 476 (intSpeed=50)
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
  electrode: {
    label: 'Electrode Configuration',
    parameters: {
      electrode_type: {
        type: 'select',
        label: 'Electrode Type',
        description: 'Type of electrode to install',
        options: ELECTRODE_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.electrode_type,
        required: true,
      },
      electrode_position: {
        type: 'select',
        label: 'Electrode Position',
        description: 'Storage position of the electrode',
        options: ELECTRODE_POSITION_OPTIONS,
        defaultValue: DEFAULT_VALUES.electrode_position,
        required: true,
      },
    },
  },
  positioning: {
    label: 'Positioning Parameters',
    parameters: {
      target_well: {
        type: 'string',
        label: 'Target Well',
        description: 'Reaction well address (e.g., A1-D6)',
        defaultValue: DEFAULT_VALUES.target_well,
        required: true,
      },
      insertion_depth: {
        type: 'number',
        label: 'Insertion Depth',
        description: 'How deep to insert the electrode',
        defaultValue: DEFAULT_VALUES.insertion_depth,
        min: 0,
        max: 60,
        step: 1,
        unit: 'mm',
        required: true,
      },
      lateral_offset_x: {
        type: 'number',
        label: 'Lateral Offset X',
        description: 'X-axis offset from well center',
        defaultValue: DEFAULT_VALUES.lateral_offset_x,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
      },
      lateral_offset_y: {
        type: 'number',
        label: 'Lateral Offset Y',
        description: 'Y-axis offset from well center',
        defaultValue: DEFAULT_VALUES.lateral_offset_y,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
      },
    },
  },
  motion: {
    label: 'Motion Parameters',
    parameters: {
      movement_speed: {
        type: 'number',
        label: 'Movement Speed',
        description: 'Speed of electrode movement',
        defaultValue: DEFAULT_VALUES.movement_speed,
        min: 10,
        max: 100,
        step: 5,
        unit: 'mm/s',
        required: true,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'pick_electrode',
  'move_to_well',
  'insert_electrode',
  'secure_electrode',
  'verify_position',
];