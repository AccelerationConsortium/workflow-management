import { ParameterGroup } from '../../types';

export const CLEANING_TOOL_POSITION_OPTIONS = [
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
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
  uo_name: 'Electrode_Cleaning_Sequence',
  description: 'Multi-stage electrode and reactor cleaning with ultrasonic treatment',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  // Specific parameters from Python script (lines 722-730)
  cleaning_tool_position: 'B1',  // From line 688 (flush tool position)
  target_well: 'A1',  // User selectable
  pump1_volume: 10.0,  // From line 724 (ac.dispense_ml(2, 10.0))
  pump2_volume: 4.0,   // From line 725 (ac.dispense_ml(1, 4.0))
  ultrasonic_time: 5000,  // From line 726 (5000ms = 5 seconds)
  final_wash_volume: 10.0,  // From line 727 (final wash)
  insertion_depth: 57,  // From line 719 (fltOffsetZ=-57, absolute value)
  cleaning_cycles: 2,
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
  cleaning_setup: {
    label: 'Cleaning Setup',
    parameters: {
      cleaning_tool_position: {
        type: 'select',
        label: 'Cleaning Tool Position',
        description: 'Position of the cleaning tool',
        options: CLEANING_TOOL_POSITION_OPTIONS,
        defaultValue: DEFAULT_VALUES.cleaning_tool_position,
        required: true,
      },
      target_well: {
        type: 'string',
        label: 'Target Well',
        description: 'Well to be cleaned',
        defaultValue: DEFAULT_VALUES.target_well,
        required: true,
      },
      insertion_depth: {
        type: 'number',
        label: 'Insertion Depth',
        description: 'How deep to insert cleaning tool',
        defaultValue: DEFAULT_VALUES.insertion_depth,
        min: 0,
        max: 60,
        step: 1,
        unit: 'mm',
        required: true,
      },
    },
  },
  cleaning_parameters: {
    label: 'Cleaning Parameters',
    parameters: {
      pump1_volume: {
        type: 'number',
        label: 'Pump 1 Volume',
        description: 'Volume of cleaning solution from pump 1',
        defaultValue: DEFAULT_VALUES.pump1_volume,
        min: 0,
        max: 20,
        step: 0.5,
        unit: 'mL',
        required: true,
      },
      pump2_volume: {
        type: 'number',
        label: 'Pump 2 Volume',
        description: 'Volume of cleaning solution from pump 2',
        defaultValue: DEFAULT_VALUES.pump2_volume,
        min: 0,
        max: 20,
        step: 0.5,
        unit: 'mL',
        required: true,
      },
      ultrasonic_time: {
        type: 'number',
        label: 'Ultrasonic Time',
        description: 'Duration of ultrasonic cleaning',
        defaultValue: DEFAULT_VALUES.ultrasonic_time,
        min: 0,
        max: 10000,
        step: 100,
        unit: 'ms',
        required: true,
      },
      cleaning_cycles: {
        type: 'number',
        label: 'Cleaning Cycles',
        description: 'Number of cleaning cycles to perform',
        defaultValue: DEFAULT_VALUES.cleaning_cycles,
        min: 1,
        max: 5,
        step: 1,
        unit: '',
        required: true,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'pick_cleaning_tool',
  'move_to_well',
  'insert_tool',
  'dispense_cleaning_solution',
  'activate_ultrasonic',
  'aspirate_waste',
  'retract_tool',
  'return_tool',
];