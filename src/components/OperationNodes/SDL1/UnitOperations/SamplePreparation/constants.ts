import { ParameterGroup } from '../../types';
import { LABWARE_OPTIONS, PIPETTE_OPTIONS, VIAL_POSITIONS } from '../../shared/labwareConstants';
import { getDynamicHardwareParameters, HARDWARE_DEFAULTS } from '../../shared/hardwareConstants';

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
  
  // Volume configuration
  total_volume: 3000,  // Total volume in μL
  
  // Pure Zn solution (always from A1)
  pure_zn_volume: 2800,  // μL of pure Zn solution from A1

  // Additive configurations (enable/disable and specify position/volume)
  additive_A_enabled: false,
  additive_A_position: 'A2',
  additive_A_volume: 100,

  additive_B_enabled: false,
  additive_B_position: 'A3',
  additive_B_volume: 100,

  additive_C_enabled: false,
  additive_C_position: 'A4',
  additive_C_volume: 100,

  additive_D_enabled: false,
  additive_D_position: 'B1',
  additive_D_volume: 100,

  additive_E_enabled: false,
  additive_E_position: 'B2',
  additive_E_volume: 100,

  additive_F_enabled: false,
  additive_F_position: 'B3',
  additive_F_volume: 100,

  additive_G_enabled: false,
  additive_G_position: 'B4',
  additive_G_volume: 100,
  
  // Pipetting parameters
  pipette_type: 'p1000_single_gen1',  // Updated default to Gen 1
  move_speed: 100,
  
  // Hardware connection configuration
  connection_type: HARDWARE_DEFAULTS.connection_type,
  arduino_com_port: HARDWARE_DEFAULTS.arduino_com_port,
  plc_ip_address: HARDWARE_DEFAULTS.plc_ip_address,
  plc_port_number: HARDWARE_DEFAULTS.plc_port_number,
  ot2_ip_address: HARDWARE_DEFAULTS.ot2_ip_address,
  ot2_port_number: HARDWARE_DEFAULTS.ot2_port_number,
  
  // Offsets for dispensing (fixed values - rarely changed)
  // dispense_offset_x: -1, dispense_offset_y: 0.5, dispense_offset_z: 0
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
    label: 'Volume Configuration',
    parameters: {
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
  pure_zn: {
    label: 'Pure Zn Solution (A1)',
    parameters: {
      pure_zn_volume: {
        type: 'number',
        label: 'Pure Zn Volume',
        description: 'Volume of pure Zn solution from vial A1',
        defaultValue: DEFAULT_VALUES.pure_zn_volume,
        min: 100,
        max: 3000,
        step: 50,
        unit: 'μL',
        required: true,
      },
    },
  },
  additives: {
    label: 'Additive Configuration',
    parameters: {
      additive_A_enabled: {
        type: 'boolean',
        label: 'Enable Additive A',
        description: 'Include additive A in the sample',
        defaultValue: DEFAULT_VALUES.additive_A_enabled,
      },
      additive_A_position: {
        type: 'select',
        label: 'Additive A Position',
        description: 'Vial position for additive A',
        options: VIAL_POSITIONS.vial_rack_2.map(pos => ({ value: pos, label: `Slot 2, ${pos}` })),
        defaultValue: DEFAULT_VALUES.additive_A_position,
        dependsOn: {
          parameter: 'additive_A_enabled',
          value: true,
        },
      },
      additive_A_volume: {
        type: 'number',
        label: 'Additive A Volume',
        description: 'Volume of additive A to add',
        defaultValue: DEFAULT_VALUES.additive_A_volume,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'additive_A_enabled',
          value: true,
        },
      },
      additive_B_enabled: {
        type: 'boolean',
        label: 'Enable Additive B',
        description: 'Include additive B in the sample',
        defaultValue: DEFAULT_VALUES.additive_B_enabled,
      },
      additive_B_position: {
        type: 'select',
        label: 'Additive B Position',
        description: 'Vial position for additive B',
        options: VIAL_POSITIONS.vial_rack_2.map(pos => ({ value: pos, label: `Slot 2, ${pos}` })),
        defaultValue: DEFAULT_VALUES.additive_B_position,
        dependsOn: {
          parameter: 'additive_B_enabled',
          value: true,
        },
      },
      additive_B_volume: {
        type: 'number',
        label: 'Additive B Volume',
        description: 'Volume of additive B to add',
        defaultValue: DEFAULT_VALUES.additive_B_volume,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'additive_B_enabled',
          value: true,
        },
      },
      additive_C_enabled: {
        type: 'boolean',
        label: 'Enable Additive C',
        description: 'Include additive C in the sample',
        defaultValue: DEFAULT_VALUES.additive_C_enabled,
      },
      additive_C_position: {
        type: 'select',
        label: 'Additive C Position',
        description: 'Vial position for additive C',
        options: VIAL_POSITIONS.vial_rack_2.map(pos => ({ value: pos, label: `Slot 2, ${pos}` })),
        defaultValue: DEFAULT_VALUES.additive_C_position,
        dependsOn: {
          parameter: 'additive_C_enabled',
          value: true,
        },
      },
      additive_C_volume: {
        type: 'number',
        label: 'Additive C Volume',
        description: 'Volume of additive C to add',
        defaultValue: DEFAULT_VALUES.additive_C_volume,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'additive_C_enabled',
          value: true,
        },
      },
      additive_D_enabled: {
        type: 'boolean',
        label: 'Enable Additive D',
        description: 'Include additive D in the sample',
        defaultValue: DEFAULT_VALUES.additive_D_enabled,
      },
      additive_D_position: {
        type: 'select',
        label: 'Additive D Position',
        description: 'Vial position for additive D',
        options: VIAL_POSITIONS.vial_rack_2.map(pos => ({ value: pos, label: `Slot 2, ${pos}` })),
        defaultValue: DEFAULT_VALUES.additive_D_position,
        dependsOn: {
          parameter: 'additive_D_enabled',
          value: true,
        },
      },
      additive_D_volume: {
        type: 'number',
        label: 'Additive D Volume',
        description: 'Volume of additive D to add',
        defaultValue: DEFAULT_VALUES.additive_D_volume,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'additive_D_enabled',
          value: true,
        },
      },
      additive_E_enabled: {
        type: 'boolean',
        label: 'Enable Additive E',
        description: 'Include additive E in the sample',
        defaultValue: DEFAULT_VALUES.additive_E_enabled,
      },
      additive_E_position: {
        type: 'select',
        label: 'Additive E Position',
        description: 'Vial position for additive E',
        options: VIAL_POSITIONS.vial_rack_2.map(pos => ({ value: pos, label: `Slot 2, ${pos}` })),
        defaultValue: DEFAULT_VALUES.additive_E_position,
        dependsOn: {
          parameter: 'additive_E_enabled',
          value: true,
        },
      },
      additive_E_volume: {
        type: 'number',
        label: 'Additive E Volume',
        description: 'Volume of additive E to add',
        defaultValue: DEFAULT_VALUES.additive_E_volume,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'additive_E_enabled',
          value: true,
        },
      },
      additive_F_enabled: {
        type: 'boolean',
        label: 'Enable Additive F',
        description: 'Include additive F in the sample',
        defaultValue: DEFAULT_VALUES.additive_F_enabled,
      },
      additive_F_position: {
        type: 'select',
        label: 'Additive F Position',
        description: 'Vial position for additive F',
        options: VIAL_POSITIONS.vial_rack_2.map(pos => ({ value: pos, label: `Slot 2, ${pos}` })),
        defaultValue: DEFAULT_VALUES.additive_F_position,
        dependsOn: {
          parameter: 'additive_F_enabled',
          value: true,
        },
      },
      additive_F_volume: {
        type: 'number',
        label: 'Additive F Volume',
        description: 'Volume of additive F to add',
        defaultValue: DEFAULT_VALUES.additive_F_volume,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'additive_F_enabled',
          value: true,
        },
      },
      additive_G_enabled: {
        type: 'boolean',
        label: 'Enable Additive G',
        description: 'Include additive G in the sample',
        defaultValue: DEFAULT_VALUES.additive_G_enabled,
      },
      additive_G_position: {
        type: 'select',
        label: 'Additive G Position',
        description: 'Vial position for additive G',
        options: VIAL_POSITIONS.vial_rack_2.map(pos => ({ value: pos, label: `Slot 2, ${pos}` })),
        defaultValue: DEFAULT_VALUES.additive_G_position,
        dependsOn: {
          parameter: 'additive_G_enabled',
          value: true,
        },
      },
      additive_G_volume: {
        type: 'number',
        label: 'Additive G Volume',
        description: 'Volume of additive G to add',
        defaultValue: DEFAULT_VALUES.additive_G_volume,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'additive_G_enabled',
          value: true,
        },
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
  hardware: {
    label: 'Hardware Configuration',
    parameters: getDynamicHardwareParameters(),
  },
  // Offset configuration removed - these values are rarely changed and are now fixed in the backend
};

export const PRIMITIVE_OPERATIONS = [
  'calculate_volumes',
  'pickup_tip',
  'transfer_additive',
  'transfer_base_solution',
  'mix_solution',
  'drop_tip',
];