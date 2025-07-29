import { ParameterGroup } from '../../types';
import { VIAL_POSITIONS, MOVEMENT_SPEEDS, Z_OFFSETS } from '../../shared/labwareConstants';

export const OPERATION_TYPE_OPTIONS = [
  { value: 'pickup', label: 'Pick Up Electrode' },
  { value: 'insert', label: 'Insert into Cell' },
  { value: 'remove', label: 'Remove from Cell' },
  { value: 'return', label: 'Return to Rack' },
];

export const ELECTRODE_TYPE_OPTIONS = [
  { value: 'working', label: 'Working Electrode (A1)' },
  { value: 'reference', label: 'Reference/Counter (A2)' },
  { value: 'flush_tool', label: 'Flush Tool (B1)' },
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
  uo_name: 'Electrode_Manipulation',
  description: 'Handle electrode pickup, insertion, and return operations',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Operation configuration
  operation_type: 'pickup',
  electrode_type: 'reference',  // Default to RE/CE (A2)
  target_cell: 'A1',
  
  // Movement parameters
  approach_speed: MOVEMENT_SPEEDS.slow,
  insertion_speed: MOVEMENT_SPEEDS.precise,
  
  // Position offsets for electrode rack
  pickup_offset_x: 0.6,
  pickup_offset_y: 0.5,
  pickup_offset_z: Z_OFFSETS.electrode_pickup,
  
  // Position offsets for reactor
  insert_offset_x: 0.5,
  insert_offset_y: 0.5,
  insert_approach_z: 5,  // Height above cell before insertion
  insert_final_z: -26,   // Final insertion depth
  
  // Return position offsets
  return_offset_z: 6,    // Height for safe electrode return
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
  operation: {
    label: 'Operation Configuration',
    parameters: {
      operation_type: {
        type: 'select',
        label: 'Operation Type',
        description: 'Type of electrode manipulation',
        options: OPERATION_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.operation_type,
        required: true,
      },
      electrode_type: {
        type: 'select',
        label: 'Electrode Type',
        description: 'Which electrode to manipulate',
        options: ELECTRODE_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.electrode_type,
        required: true,
      },
      target_cell: {
        type: 'select',
        label: 'Target Cell',
        description: 'Reactor cell for electrode insertion',
        options: VIAL_POSITIONS.nis_reactor.map(pos => ({ value: pos, label: pos })),
        defaultValue: DEFAULT_VALUES.target_cell,
        required: true,
        dependsOn: {
          parameter: 'operation_type',
          values: ['insert', 'remove'],
        },
      },
    },
  },
  movement: {
    label: 'Movement Parameters',
    parameters: {
      approach_speed: {
        type: 'number',
        label: 'Approach Speed',
        description: 'Speed for approaching positions',
        defaultValue: DEFAULT_VALUES.approach_speed,
        min: 10,
        max: 400,
        step: 10,
        unit: 'mm/s',
      },
      insertion_speed: {
        type: 'number',
        label: 'Insertion Speed',
        description: 'Speed for electrode insertion (slower for safety)',
        defaultValue: DEFAULT_VALUES.insertion_speed,
        min: 10,
        max: 100,
        step: 5,
        unit: 'mm/s',
      },
    },
  },
  pickup_offsets: {
    label: 'Pickup Position Offsets',
    parameters: {
      pickup_offset_x: {
        type: 'number',
        label: 'Pickup Offset X',
        description: 'X-axis offset for electrode pickup',
        defaultValue: DEFAULT_VALUES.pickup_offset_x,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
        dependsOn: {
          parameter: 'operation_type',
          values: ['pickup'],
        },
      },
      pickup_offset_y: {
        type: 'number',
        label: 'Pickup Offset Y',
        description: 'Y-axis offset for electrode pickup',
        defaultValue: DEFAULT_VALUES.pickup_offset_y,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
        dependsOn: {
          parameter: 'operation_type',
          values: ['pickup'],
        },
      },
      pickup_offset_z: {
        type: 'number',
        label: 'Pickup Offset Z',
        description: 'Z-axis offset for electrode pickup',
        defaultValue: DEFAULT_VALUES.pickup_offset_z,
        min: 0,
        max: 10,
        step: 0.5,
        unit: 'mm',
        dependsOn: {
          parameter: 'operation_type',
          values: ['pickup'],
        },
      },
    },
  },
  insertion_offsets: {
    label: 'Insertion Position Offsets',
    parameters: {
      insert_offset_x: {
        type: 'number',
        label: 'Insert Offset X',
        description: 'X-axis offset for electrode insertion',
        defaultValue: DEFAULT_VALUES.insert_offset_x,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
        dependsOn: {
          parameter: 'operation_type',
          values: ['insert'],
        },
      },
      insert_offset_y: {
        type: 'number',
        label: 'Insert Offset Y',
        description: 'Y-axis offset for electrode insertion',
        defaultValue: DEFAULT_VALUES.insert_offset_y,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
        dependsOn: {
          parameter: 'operation_type',
          values: ['insert'],
        },
      },
      insert_approach_z: {
        type: 'number',
        label: 'Approach Height',
        description: 'Height above cell before insertion',
        defaultValue: DEFAULT_VALUES.insert_approach_z,
        min: 0,
        max: 20,
        step: 1,
        unit: 'mm',
        dependsOn: {
          parameter: 'operation_type',
          values: ['insert'],
        },
      },
      insert_final_z: {
        type: 'number',
        label: 'Insertion Depth',
        description: 'Final electrode insertion depth (negative value)',
        defaultValue: DEFAULT_VALUES.insert_final_z,
        min: -60,
        max: 0,
        step: 1,
        unit: 'mm',
        dependsOn: {
          parameter: 'operation_type',
          values: ['insert'],
        },
      },
    },
  },
  return_offsets: {
    label: 'Return Position Offsets',
    parameters: {
      return_offset_z: {
        type: 'number',
        label: 'Return Height',
        description: 'Z offset for safe electrode return',
        defaultValue: DEFAULT_VALUES.return_offset_z,
        min: 0,
        max: 20,
        step: 0.5,
        unit: 'mm',
        dependsOn: {
          parameter: 'operation_type',
          values: ['return'],
        },
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'move_to_electrode',
  'pickup_electrode',
  'move_to_cell',
  'insert_electrode',
  'remove_electrode',
  'return_electrode',
];