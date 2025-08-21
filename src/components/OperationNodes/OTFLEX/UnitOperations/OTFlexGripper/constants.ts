import { ParameterGroup } from '../../types';

export const GRIPPER_ACTION_OPTIONS = [
  { value: 'move', label: 'Move to Position' },
  { value: 'pick', label: 'Pick Up Labware' },
  { value: 'place', label: 'Place Labware' },
  { value: 'open', label: 'Open Gripper' },
  { value: 'close', label: 'Close Gripper' },
  { value: 'home', label: 'Home Gripper' },
];

export const LABWARE_TYPE_OPTIONS = [
  { value: 'plate_96', label: '96-Well Plate' },
  { value: 'plate_384', label: '384-Well Plate' },
  { value: 'tip_rack', label: 'Tip Rack' },
  { value: 'reservoir', label: 'Reservoir' },
  { value: 'custom', label: 'Custom Labware' },
];

export const GRIP_FORCE_OPTIONS = [
  { value: 'light', label: 'Light (10N)' },
  { value: 'medium', label: 'Medium (20N)' },
  { value: 'firm', label: 'Firm (30N)' },
  { value: 'custom', label: 'Custom Force' },
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
  uo_name: 'OTFlex_Gripper_Control',
  description: 'Control Opentrons Flex gripper for plate handling',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Gripper parameters
  gripper_action: 'pick',
  x_position: 0,
  y_position: 0,
  z_position: 100,
  labware_type: 'plate_96',
  target_labware: '',
  
  // Force parameters
  grip_force_mode: 'medium',
  custom_force: 20,
  force_threshold: 25,
  
  // Movement parameters
  movement_speed: 100,
  approach_height: 20,
  
  // Safety parameters
  enable_collision_detection: true,
  enable_force_monitoring: true,
  max_grip_force: 40,
  
  // Timing parameters
  operation_timeout: 60,
  wait_for_completion: true,
  completion_timeout: 120,
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
  gripper_settings: {
    label: 'Gripper Settings',
    parameters: {
      gripper_action: {
        type: 'select',
        label: 'Gripper Action',
        description: 'Action to perform with gripper',
        options: GRIPPER_ACTION_OPTIONS,
        defaultValue: DEFAULT_VALUES.gripper_action,
        required: true,
      },
      x_position: {
        type: 'number',
        label: 'X Position',
        description: 'X coordinate for gripper movement',
        defaultValue: DEFAULT_VALUES.x_position,
        min: -200,
        max: 200,
        step: 1,
        unit: 'mm',
        dependsOn: {
          parameter: 'gripper_action',
          value: 'move',
        },
      },
      y_position: {
        type: 'number',
        label: 'Y Position',
        description: 'Y coordinate for gripper movement',
        defaultValue: DEFAULT_VALUES.y_position,
        min: -200,
        max: 200,
        step: 1,
        unit: 'mm',
        dependsOn: {
          parameter: 'gripper_action',
          value: 'move',
        },
      },
      z_position: {
        type: 'number',
        label: 'Z Position',
        description: 'Z coordinate for gripper movement',
        defaultValue: DEFAULT_VALUES.z_position,
        min: 0,
        max: 300,
        step: 1,
        unit: 'mm',
        dependsOn: {
          parameter: 'gripper_action',
          value: 'move',
        },
      },
      labware_type: {
        type: 'select',
        label: 'Labware Type',
        description: 'Type of labware to handle',
        options: LABWARE_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.labware_type,
        required: true,
      },
      target_labware: {
        type: 'string',
        label: 'Target Labware',
        description: 'Name of target labware',
        defaultValue: DEFAULT_VALUES.target_labware,
        required: false,
      },
    },
  },
  force_settings: {
    label: 'Force Settings',
    parameters: {
      grip_force_mode: {
        type: 'select',
        label: 'Grip Force Mode',
        description: 'Predefined grip force setting',
        options: GRIP_FORCE_OPTIONS,
        defaultValue: DEFAULT_VALUES.grip_force_mode,
        required: true,
      },
      custom_force: {
        type: 'number',
        label: 'Custom Force',
        description: 'Custom grip force value',
        defaultValue: DEFAULT_VALUES.custom_force,
        min: 5,
        max: 50,
        step: 1,
        unit: 'N',
        dependsOn: {
          parameter: 'grip_force_mode',
          value: 'custom',
        },
      },
      force_threshold: {
        type: 'number',
        label: 'Force Threshold',
        description: 'Force threshold for grip detection',
        defaultValue: DEFAULT_VALUES.force_threshold,
        min: 5,
        max: 60,
        step: 1,
        unit: 'N',
      },
    },
  },
  movement_settings: {
    label: 'Movement Settings',
    parameters: {
      movement_speed: {
        type: 'number',
        label: 'Movement Speed',
        description: 'Speed of gripper movement',
        defaultValue: DEFAULT_VALUES.movement_speed,
        min: 10,
        max: 200,
        step: 10,
        unit: 'mm/s',
      },
      approach_height: {
        type: 'number',
        label: 'Approach Height',
        description: 'Height above labware for approach',
        defaultValue: DEFAULT_VALUES.approach_height,
        min: 5,
        max: 100,
        step: 1,
        unit: 'mm',
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      enable_collision_detection: {
        type: 'boolean',
        label: 'Collision Detection',
        description: 'Enable collision detection',
        defaultValue: DEFAULT_VALUES.enable_collision_detection,
      },
      enable_force_monitoring: {
        type: 'boolean',
        label: 'Force Monitoring',
        description: 'Monitor grip force continuously',
        defaultValue: DEFAULT_VALUES.enable_force_monitoring,
      },
      max_grip_force: {
        type: 'number',
        label: 'Max Grip Force',
        description: 'Maximum allowable grip force',
        defaultValue: DEFAULT_VALUES.max_grip_force,
        min: 10,
        max: 100,
        step: 5,
        unit: 'N',
        dependsOn: {
          parameter: 'enable_force_monitoring',
          value: true,
        },
      },
    },
  },
  timing_settings: {
    label: 'Timing Settings',
    parameters: {
      operation_timeout: {
        type: 'number',
        label: 'Operation Timeout',
        description: 'Maximum time for operation',
        defaultValue: DEFAULT_VALUES.operation_timeout,
        min: 10,
        max: 300,
        step: 10,
        unit: 's',
      },
      wait_for_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for operation to complete',
        defaultValue: DEFAULT_VALUES.wait_for_completion,
      },
      completion_timeout: {
        type: 'number',
        label: 'Completion Timeout',
        description: 'Maximum wait time for completion',
        defaultValue: DEFAULT_VALUES.completion_timeout,
        min: 30,
        max: 600,
        step: 30,
        unit: 's',
        dependsOn: {
          parameter: 'wait_for_completion',
          value: true,
        },
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'initialize_otflex',
  'check_gripper_connection',
  'home_gripper',
  'move_to_position',
  'open_gripper',
  'close_gripper',
  'pick_up_labware',
  'place_labware',
  'monitor_force',
  'detect_collision',
  'verify_grip',
  'log_gripper_operation',
];
