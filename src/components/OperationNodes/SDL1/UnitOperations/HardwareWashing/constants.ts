import { ParameterGroup } from '../../types';
import { VIAL_POSITIONS, MOVEMENT_SPEEDS, Z_OFFSETS } from '../../shared/labwareConstants';

export const PUMP_OPTIONS = [
  { value: 'pump_1', label: 'Pump 1 (Drain)' },
  { value: 'pump_2', label: 'Pump 2 (Rinse)' },
  { value: 'both', label: 'Both Pumps' },
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
  uo_name: 'Hardware_Washing',
  description: 'Wash reactor cell using flush tool and Arduino-controlled pumps',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Cell configuration
  target_cell: 'A1',
  
  // Washing sequence parameters
  initial_drain_volume: 10.0,    // mL - pump 2
  rinse_volume: 4.0,             // mL - pump 1
  ultrasonic_duration: 5000,     // ms
  final_rinse_volume: 10.0,      // mL - pump 2
  
  // Hardware connection configuration
  connection_type: 'arduino',    // 'arduino' or 'plc'
  arduino_com_port: 'COM3',      // Default Arduino port
  plc_ip_address: '192.168.0.102', // PLC IP address
  plc_port_number: 502,          // PLC port number (Modbus TCP default)
  
  // Movement parameters
  approach_speed: MOVEMENT_SPEEDS.slow,
  insertion_speed: MOVEMENT_SPEEDS.precise,
  
  // Flush tool position offsets
  flush_pickup_offset_x: 0.6,
  flush_pickup_offset_y: 0.5,
  
  // Flush tool insertion offsets
  flush_insert_offset_x: 0.5,
  flush_insert_offset_y: 0.5,
  flush_approach_z: 5,           // Height above cell
  flush_final_z: -57,            // Deep insertion for washing
  
  // Return position offsets
  flush_return_offset_z: 6,      // Height for safe return
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
        description: 'Reactor cell to wash',
        options: VIAL_POSITIONS.nis_reactor.map(pos => ({ value: pos, label: pos })),
        defaultValue: DEFAULT_VALUES.target_cell,
        required: true,
      },
    },
  },
  washing_sequence: {
    label: 'Washing Sequence Parameters',
    parameters: {
      initial_drain_volume: {
        type: 'number',
        label: 'Initial Drain Volume',
        description: 'Volume to drain before washing (Pump 2)',
        defaultValue: DEFAULT_VALUES.initial_drain_volume,
        min: 0,
        max: 50,
        step: 0.5,
        unit: 'mL',
        required: true,
      },
      rinse_volume: {
        type: 'number',
        label: 'Rinse Volume',
        description: 'Volume of rinse solution (Pump 1)',
        defaultValue: DEFAULT_VALUES.rinse_volume,
        min: 0,
        max: 20,
        step: 0.5,
        unit: 'mL',
        required: true,
      },
      ultrasonic_duration: {
        type: 'number',
        label: 'Ultrasonic Duration',
        description: 'Duration of ultrasonic cleaning',
        defaultValue: DEFAULT_VALUES.ultrasonic_duration,
        min: 0,
        max: 30000,
        step: 1000,
        unit: 'ms',
      },
      final_rinse_volume: {
        type: 'number',
        label: 'Final Rinse Volume',
        description: 'Final rinse volume (Pump 2)',
        defaultValue: DEFAULT_VALUES.final_rinse_volume,
        min: 0,
        max: 50,
        step: 0.5,
        unit: 'mL',
        required: true,
      },
    },
  },
  hardware: {
    label: 'Hardware Configuration',
    parameters: {
      connection_type: {
        type: 'select',
        label: 'Connection Type',
        description: 'Type of hardware connection',
        options: [
          { value: 'arduino', label: 'Arduino (COM Port)' },
          { value: 'plc', label: 'PLC (Ethernet)' },
        ],
        defaultValue: DEFAULT_VALUES.connection_type,
        required: true,
      },
      arduino_com_port: {
        type: 'string',
        label: 'Arduino COM Port',
        description: 'Serial port for Arduino connection',
        defaultValue: DEFAULT_VALUES.arduino_com_port,
        required: false,
        condition: (data: any) => data.connection_type === 'arduino',
      },
      plc_ip_address: {
        type: 'string',
        label: 'PLC IP Address',
        description: 'IP address of the PLC controller',
        defaultValue: DEFAULT_VALUES.plc_ip_address,
        required: false,
        condition: (data: any) => data.connection_type === 'plc',
        pattern: '^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$',
      },
      plc_port_number: {
        type: 'number',
        label: 'PLC Port Number',
        description: 'Port number for PLC connection',
        defaultValue: DEFAULT_VALUES.plc_port_number,
        min: 1,
        max: 65535,
        step: 1,
        required: false,
        condition: (data: any) => data.connection_type === 'plc',
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
        description: 'Speed for flush tool insertion',
        defaultValue: DEFAULT_VALUES.insertion_speed,
        min: 10,
        max: 100,
        step: 5,
        unit: 'mm/s',
      },
    },
  },
  flush_tool_offsets: {
    label: 'Flush Tool Position Offsets',
    parameters: {
      flush_pickup_offset_x: {
        type: 'number',
        label: 'Pickup Offset X',
        description: 'X-axis offset for flush tool pickup',
        defaultValue: DEFAULT_VALUES.flush_pickup_offset_x,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
      },
      flush_pickup_offset_y: {
        type: 'number',
        label: 'Pickup Offset Y',
        description: 'Y-axis offset for flush tool pickup',
        defaultValue: DEFAULT_VALUES.flush_pickup_offset_y,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
      },
      flush_insert_offset_x: {
        type: 'number',
        label: 'Insert Offset X',
        description: 'X-axis offset for flush tool insertion',
        defaultValue: DEFAULT_VALUES.flush_insert_offset_x,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
      },
      flush_insert_offset_y: {
        type: 'number',
        label: 'Insert Offset Y',
        description: 'Y-axis offset for flush tool insertion',
        defaultValue: DEFAULT_VALUES.flush_insert_offset_y,
        min: -2,
        max: 2,
        step: 0.1,
        unit: 'mm',
      },
      flush_approach_z: {
        type: 'number',
        label: 'Approach Height',
        description: 'Height above cell before insertion',
        defaultValue: DEFAULT_VALUES.flush_approach_z,
        min: 0,
        max: 20,
        step: 1,
        unit: 'mm',
      },
      flush_final_z: {
        type: 'number',
        label: 'Insertion Depth',
        description: 'Final flush tool insertion depth for washing',
        defaultValue: DEFAULT_VALUES.flush_final_z,
        min: -80,
        max: 0,
        step: 1,
        unit: 'mm',
      },
      flush_return_offset_z: {
        type: 'number',
        label: 'Return Height',
        description: 'Z offset for safe flush tool return',
        defaultValue: DEFAULT_VALUES.flush_return_offset_z,
        min: 0,
        max: 20,
        step: 0.5,
        unit: 'mm',
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'pickup_flush_tool',
  'move_to_cell',
  'insert_flush_tool',
  'activate_pump',
  'activate_ultrasonic',
  'drain_cell',
  'remove_flush_tool',
  'return_flush_tool',
];