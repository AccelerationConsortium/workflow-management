import { ParameterGroup } from '../../types';

export const PIPETTE_OPTIONS = [
  { value: 'p1000_single_flex', label: 'P1000 Single Flex' },
  { value: 'p50_single_flex', label: 'P50 Single Flex' },
  { value: 'p1000_multi_flex', label: 'P1000 Multi Flex' },
  { value: 'p50_multi_flex', label: 'P50 Multi Flex' },
];

export const LABWARE_OPTIONS = [
  { value: 'nest_12_reservoir_15ml', label: '12 Reservoir 15mL' },
  { value: 'nest_1_reservoir_195ml', label: '1 Reservoir 195mL' },
  { value: 'opentrons_96_tiprack_1000ul', label: '96 Tip Rack 1000μL' },
  { value: 'opentrons_96_tiprack_300ul', label: '96 Tip Rack 300μL' },
  { value: 'custom', label: 'Custom Labware' },
];

export const VERIFICATION_METHOD_OPTIONS = [
  { value: 'visual', label: 'Visual Inspection' },
  { value: 'conductivity', label: 'Conductivity Test' },
  { value: 'impedance', label: 'Impedance Measurement' },
  { value: 'none', label: 'No Verification' },
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
  uo_name: 'OTFlex_Electrode_Wash',
  description: 'Automated electrode washing using Opentrons Flex',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Hardware parameters
  pipette: 'p1000_single_flex',
  tip_rack: 'opentrons_96_tiprack_1000ul',
  wash_reservoir: 'nest_12_reservoir_15ml',
  rinse_reservoir: 'nest_12_reservoir_15ml',
  waste_container: 'nest_1_reservoir_195ml',
  
  // Electrode parameters
  electrode_position: 'A1',
  dispense_height: 2.0, // mm above electrode
  
  // Wash parameters
  wash_cycles: 3,
  wash_volume: 500, // μL
  wash_contact_time: 5, // seconds
  
  // Rinse parameters
  enable_rinse: true,
  rinse_cycles: 2,
  rinse_volume: 300, // μL
  rinse_contact_time: 2, // seconds
  
  // Liquid handling parameters
  aspirate_speed: 150, // μL/s
  dispense_speed: 300, // μL/s
  air_gap: 10, // μL
  
  // Drying parameters
  enable_air_dry: true,
  air_dry_time: 10, // seconds
  
  // Verification parameters
  verify_cleanliness: false,
  verification_method: 'visual',
  
  // Safety parameters
  tip_tracking: true,
  liquid_detection: true,
  waste_monitoring: true,
  
  // Timing parameters
  wait_for_completion: true,
  completion_timeout: 300, // seconds
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
  hardware_settings: {
    label: 'Hardware Settings',
    parameters: {
      pipette: {
        type: 'select',
        label: 'Pipette',
        description: 'Pipette to use for washing',
        options: PIPETTE_OPTIONS,
        defaultValue: DEFAULT_VALUES.pipette,
        required: true,
      },
      tip_rack: {
        type: 'select',
        label: 'Tip Rack',
        description: 'Tip rack labware',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.tip_rack,
        required: true,
      },
      wash_reservoir: {
        type: 'select',
        label: 'Wash Reservoir',
        description: 'Wash solution reservoir',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.wash_reservoir,
        required: true,
      },
      rinse_reservoir: {
        type: 'select',
        label: 'Rinse Reservoir',
        description: 'Rinse solution reservoir',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.rinse_reservoir,
        dependsOn: {
          parameter: 'enable_rinse',
          value: true,
        },
      },
      waste_container: {
        type: 'select',
        label: 'Waste Container',
        description: 'Waste collection container',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.waste_container,
        required: true,
      },
    },
  },
  electrode_settings: {
    label: 'Electrode Settings',
    parameters: {
      electrode_position: {
        type: 'string',
        label: 'Electrode Position',
        description: 'Position of electrode to wash',
        defaultValue: DEFAULT_VALUES.electrode_position,
        required: true,
      },
      dispense_height: {
        type: 'number',
        label: 'Dispense Height',
        description: 'Height above electrode for dispensing',
        defaultValue: DEFAULT_VALUES.dispense_height,
        min: 0.5,
        max: 10,
        step: 0.1,
        unit: 'mm',
      },
    },
  },
  wash_settings: {
    label: 'Wash Settings',
    parameters: {
      wash_cycles: {
        type: 'number',
        label: 'Wash Cycles',
        description: 'Number of wash cycles',
        defaultValue: DEFAULT_VALUES.wash_cycles,
        min: 1,
        max: 10,
        step: 1,
      },
      wash_volume: {
        type: 'number',
        label: 'Wash Volume',
        description: 'Volume per wash cycle',
        defaultValue: DEFAULT_VALUES.wash_volume,
        min: 50,
        max: 1000,
        step: 10,
        unit: 'μL',
      },
      wash_contact_time: {
        type: 'number',
        label: 'Wash Contact Time',
        description: 'Time to let wash solution contact electrode',
        defaultValue: DEFAULT_VALUES.wash_contact_time,
        min: 0,
        max: 60,
        step: 1,
        unit: 's',
      },
    },
  },
  rinse_settings: {
    label: 'Rinse Settings',
    parameters: {
      enable_rinse: {
        type: 'boolean',
        label: 'Enable Rinse',
        description: 'Enable rinse cycles after washing',
        defaultValue: DEFAULT_VALUES.enable_rinse,
      },
      rinse_cycles: {
        type: 'number',
        label: 'Rinse Cycles',
        description: 'Number of rinse cycles',
        defaultValue: DEFAULT_VALUES.rinse_cycles,
        min: 1,
        max: 5,
        step: 1,
        dependsOn: {
          parameter: 'enable_rinse',
          value: true,
        },
      },
      rinse_volume: {
        type: 'number',
        label: 'Rinse Volume',
        description: 'Volume per rinse cycle',
        defaultValue: DEFAULT_VALUES.rinse_volume,
        min: 50,
        max: 1000,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'enable_rinse',
          value: true,
        },
      },
      rinse_contact_time: {
        type: 'number',
        label: 'Rinse Contact Time',
        description: 'Time to let rinse solution contact electrode',
        defaultValue: DEFAULT_VALUES.rinse_contact_time,
        min: 0,
        max: 30,
        step: 1,
        unit: 's',
        dependsOn: {
          parameter: 'enable_rinse',
          value: true,
        },
      },
    },
  },
  liquid_handling: {
    label: 'Liquid Handling',
    parameters: {
      aspirate_speed: {
        type: 'number',
        label: 'Aspirate Speed',
        description: 'Liquid aspiration speed',
        defaultValue: DEFAULT_VALUES.aspirate_speed,
        min: 50,
        max: 500,
        step: 10,
        unit: 'μL/s',
      },
      dispense_speed: {
        type: 'number',
        label: 'Dispense Speed',
        description: 'Liquid dispensing speed',
        defaultValue: DEFAULT_VALUES.dispense_speed,
        min: 50,
        max: 500,
        step: 10,
        unit: 'μL/s',
      },
      air_gap: {
        type: 'number',
        label: 'Air Gap',
        description: 'Air gap to prevent dripping',
        defaultValue: DEFAULT_VALUES.air_gap,
        min: 0,
        max: 50,
        step: 1,
        unit: 'μL',
      },
    },
  },
  drying_settings: {
    label: 'Drying Settings',
    parameters: {
      enable_air_dry: {
        type: 'boolean',
        label: 'Enable Air Dry',
        description: 'Enable air drying after wash',
        defaultValue: DEFAULT_VALUES.enable_air_dry,
      },
      air_dry_time: {
        type: 'number',
        label: 'Air Dry Time',
        description: 'Time to air dry electrode',
        defaultValue: DEFAULT_VALUES.air_dry_time,
        min: 0,
        max: 60,
        step: 1,
        unit: 's',
        dependsOn: {
          parameter: 'enable_air_dry',
          value: true,
        },
      },
    },
  },
  verification_settings: {
    label: 'Verification Settings',
    parameters: {
      verify_cleanliness: {
        type: 'boolean',
        label: 'Verify Cleanliness',
        description: 'Verify electrode cleanliness after wash',
        defaultValue: DEFAULT_VALUES.verify_cleanliness,
      },
      verification_method: {
        type: 'select',
        label: 'Verification Method',
        description: 'Method to verify cleanliness',
        options: VERIFICATION_METHOD_OPTIONS,
        defaultValue: DEFAULT_VALUES.verification_method,
        dependsOn: {
          parameter: 'verify_cleanliness',
          value: true,
        },
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      tip_tracking: {
        type: 'boolean',
        label: 'Tip Tracking',
        description: 'Enable tip tracking',
        defaultValue: DEFAULT_VALUES.tip_tracking,
      },
      liquid_detection: {
        type: 'boolean',
        label: 'Liquid Detection',
        description: 'Enable liquid level detection',
        defaultValue: DEFAULT_VALUES.liquid_detection,
      },
      waste_monitoring: {
        type: 'boolean',
        label: 'Waste Monitoring',
        description: 'Monitor waste container level',
        defaultValue: DEFAULT_VALUES.waste_monitoring,
      },
    },
  },
  timing_settings: {
    label: 'Timing Settings',
    parameters: {
      wait_for_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for wash operation to complete',
        defaultValue: DEFAULT_VALUES.wait_for_completion,
      },
      completion_timeout: {
        type: 'number',
        label: 'Completion Timeout',
        description: 'Maximum wait time for completion',
        defaultValue: DEFAULT_VALUES.completion_timeout,
        min: 30,
        max: 1800,
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
  'check_pipette_connection',
  'load_labware',
  'pick_up_tip',
  'aspirate_wash_solution',
  'dispense_on_electrode',
  'aspirate_waste',
  'dispense_to_waste',
  'aspirate_rinse_solution',
  'air_dry_electrode',
  'drop_tip',
  'verify_electrode_cleanliness',
  'log_wash_operation',
];
