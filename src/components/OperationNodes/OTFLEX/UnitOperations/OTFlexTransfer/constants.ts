import { ParameterGroup } from '../../types';

export const PIPETTE_OPTIONS = [
  { value: 'p1000_single_flex', label: 'P1000 Single Flex' },
  { value: 'p50_single_flex', label: 'P50 Single Flex' },
  { value: 'p1000_multi_flex', label: 'P1000 Multi Flex' },
  { value: 'p50_multi_flex', label: 'P50 Multi Flex' },
];

export const LABWARE_OPTIONS = [
  { value: 'opentrons_96_tiprack_1000ul', label: '96 Tip Rack 1000μL' },
  { value: 'opentrons_96_tiprack_300ul', label: '96 Tip Rack 300μL' },
  { value: 'opentrons_96_wellplate_200ul_pcr_full_skirt', label: '96 Well Plate 200μL' },
  { value: 'nest_12_reservoir_15ml', label: '12 Reservoir 15mL' },
  { value: 'custom', label: 'Custom Labware' },
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
  uo_name: 'OTFlex_Liquid_Transfer',
  description: 'Transfer liquids using Opentrons Flex',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Transfer parameters
  source_labware: 'nest_12_reservoir_15ml',
  source_well: 'A1',
  dest_labware: 'opentrons_96_wellplate_200ul_pcr_full_skirt',
  dest_well: 'A1',
  volume: 100,
  pipette: 'p1000_single_flex',
  
  // Liquid handling parameters
  aspirate_speed: 150,
  dispense_speed: 300,
  air_gap: 10,
  
  // Advanced parameters
  mix_before: false,
  mix_after: false,
  mix_volume: 50,
  mix_repetitions: 3,
  
  // Safety parameters
  tip_tracking: true,
  liquid_detection: true,
  blow_out: false,
  
  // Precision parameters
  volume_tolerance: 1.0,
  wait_for_completion: true,
  completion_timeout: 30,
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
  transfer_settings: {
    label: 'Transfer Settings',
    parameters: {
      source_labware: {
        type: 'select',
        label: 'Source Labware',
        description: 'Source labware type',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.source_labware,
        required: true,
      },
      source_well: {
        type: 'string',
        label: 'Source Well',
        description: 'Source well location (e.g., A1, B2)',
        defaultValue: DEFAULT_VALUES.source_well,
        required: true,
      },
      dest_labware: {
        type: 'select',
        label: 'Destination Labware',
        description: 'Destination labware type',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.dest_labware,
        required: true,
      },
      dest_well: {
        type: 'string',
        label: 'Destination Well',
        description: 'Destination well location (e.g., A1, B2)',
        defaultValue: DEFAULT_VALUES.dest_well,
        required: true,
      },
      volume: {
        type: 'number',
        label: 'Volume',
        description: 'Volume to transfer',
        defaultValue: DEFAULT_VALUES.volume,
        min: 1,
        max: 1000,
        step: 0.1,
        unit: 'μL',
        required: true,
      },
      pipette: {
        type: 'select',
        label: 'Pipette',
        description: 'Pipette to use for transfer',
        options: PIPETTE_OPTIONS,
        defaultValue: DEFAULT_VALUES.pipette,
        required: true,
      },
    },
  },
  liquid_handling: {
    label: 'Liquid Handling',
    parameters: {
      aspirate_speed: {
        type: 'number',
        label: 'Aspirate Speed',
        description: 'Speed for aspirating liquid',
        defaultValue: DEFAULT_VALUES.aspirate_speed,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL/s',
      },
      dispense_speed: {
        type: 'number',
        label: 'Dispense Speed',
        description: 'Speed for dispensing liquid',
        defaultValue: DEFAULT_VALUES.dispense_speed,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL/s',
      },
      air_gap: {
        type: 'number',
        label: 'Air Gap',
        description: 'Air gap volume to prevent cross-contamination',
        defaultValue: DEFAULT_VALUES.air_gap,
        min: 0,
        max: 50,
        step: 1,
        unit: 'μL',
      },
    },
  },
  advanced_settings: {
    label: 'Advanced Settings',
    parameters: {
      mix_before: {
        type: 'boolean',
        label: 'Mix Before',
        description: 'Mix liquid before aspirating',
        defaultValue: DEFAULT_VALUES.mix_before,
      },
      mix_after: {
        type: 'boolean',
        label: 'Mix After',
        description: 'Mix liquid after dispensing',
        defaultValue: DEFAULT_VALUES.mix_after,
      },
      mix_volume: {
        type: 'number',
        label: 'Mix Volume',
        description: 'Volume for mixing',
        defaultValue: DEFAULT_VALUES.mix_volume,
        min: 10,
        max: 500,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'mix_before',
          value: true,
        },
      },
      mix_repetitions: {
        type: 'number',
        label: 'Mix Repetitions',
        description: 'Number of mixing cycles',
        defaultValue: DEFAULT_VALUES.mix_repetitions,
        min: 1,
        max: 10,
        step: 1,
        dependsOn: {
          parameter: 'mix_before',
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
        description: 'Track tip usage and replacement',
        defaultValue: DEFAULT_VALUES.tip_tracking,
      },
      liquid_detection: {
        type: 'boolean',
        label: 'Liquid Detection',
        description: 'Detect liquid presence during transfer',
        defaultValue: DEFAULT_VALUES.liquid_detection,
      },
      blow_out: {
        type: 'boolean',
        label: 'Blow Out',
        description: 'Blow out remaining liquid from tip',
        defaultValue: DEFAULT_VALUES.blow_out,
      },
    },
  },
  precision_settings: {
    label: 'Precision Settings',
    parameters: {
      volume_tolerance: {
        type: 'number',
        label: 'Volume Tolerance',
        description: 'Acceptable volume error',
        defaultValue: DEFAULT_VALUES.volume_tolerance,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: 'μL',
      },
      wait_for_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for transfer to complete',
        defaultValue: DEFAULT_VALUES.wait_for_completion,
      },
      completion_timeout: {
        type: 'number',
        label: 'Completion Timeout',
        description: 'Maximum wait time for completion',
        defaultValue: DEFAULT_VALUES.completion_timeout,
        min: 1,
        max: 300,
        step: 1,
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
  'initialize_opentrons',
  'load_labware',
  'load_pipette',
  'pick_up_tip',
  'aspirate_liquid',
  'dispense_liquid',
  'mix_liquid',
  'blow_out_tip',
  'drop_tip',
  'verify_transfer',
  'log_transfer_operation',
];