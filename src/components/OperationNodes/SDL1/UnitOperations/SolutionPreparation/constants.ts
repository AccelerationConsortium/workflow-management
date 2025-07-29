import { ParameterGroup } from '../../types';
import { LABWARE_OPTIONS, PIPETTE_OPTIONS, VIAL_POSITIONS } from '../../shared/labwareConstants';

export const TRANSFER_MODE_OPTIONS = [
  { value: 'single', label: 'Single Transfer' },
  { value: 'multi_cycle', label: 'Multi-Cycle Transfer (>1000μL)' },
  { value: 'precise', label: 'Precise Volume Transfer' },
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
  uo_name: 'Enhanced_Solution_Prep',
  description: 'Enhanced solution preparation with multi-cycle transfer support',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Transfer configuration
  transfer_mode: 'multi_cycle',
  source_labware: 'vial_rack_2',
  source_well: 'A1',
  target_labware: 'nis_reactor',
  target_well: 'A1',
  
  // Volume handling
  total_volume: 3000,    // Total volume to transfer (μL)
  max_volume_per_cycle: 1000,  // Max volume per aspirate/dispense cycle
  pipette_type: 'p1000_single_gen2',
  
  // Movement parameters
  move_speed: 100,       // Movement speed (mm/s)
  
  // Aspiration parameters
  aspiration_offset_z: 8,     // Z offset from bottom for aspiration
  aspiration_flow_rate: 274.7, // Flow rate for aspiration (μL/s)
  
  // Dispense parameters  
  dispense_offset_x: -1,      // X offset for dispensing
  dispense_offset_y: 0.5,     // Y offset for dispensing
  dispense_offset_z: 0,       // Z offset for dispensing
  dispense_flow_rate: 274.7,  // Flow rate for dispensing (μL/s)
  
  // Safety parameters
  blowout_enabled: true,      // Enable blowout after dispensing
  mix_after_dispense: false,  // Mix solution after dispensing
  mix_cycles: 3,              // Number of mixing cycles
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
  transfer: {
    label: 'Transfer Configuration',
    parameters: {
      transfer_mode: {
        type: 'select',
        label: 'Transfer Mode',
        description: 'Method for handling volume transfers',
        options: TRANSFER_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.transfer_mode,
        required: true,
      },
      source_labware: {
        type: 'select',
        label: 'Source Labware',
        description: 'Labware containing the source solution',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.source_labware,
        required: true,
      },
      source_well: {
        type: 'select',
        label: 'Source Well',
        description: 'Well position in source labware',
        options: VIAL_POSITIONS.vial_rack_2.map(pos => ({ value: pos, label: pos })),
        defaultValue: DEFAULT_VALUES.source_well,
        required: true,
      },
      target_labware: {
        type: 'select',
        label: 'Target Labware',
        description: 'Labware to dispense solution into',
        options: LABWARE_OPTIONS,
        defaultValue: DEFAULT_VALUES.target_labware,
        required: true,
      },
      target_well: {
        type: 'select',
        label: 'Target Well',
        description: 'Well position in target labware',
        options: VIAL_POSITIONS.nis_reactor.map(pos => ({ value: pos, label: pos })),
        defaultValue: DEFAULT_VALUES.target_well,
        required: true,
      },
    },
  },
  volume_handling: {
    label: 'Volume Handling Parameters',
    parameters: {
      total_volume: {
        type: 'number',
        label: 'Total Volume',
        description: 'Total volume to transfer',
        defaultValue: DEFAULT_VALUES.total_volume,
        min: 10,
        max: 10000,
        step: 10,
        unit: 'μL',
        required: true,
      },
      max_volume_per_cycle: {
        type: 'number',
        label: 'Max Volume per Cycle',
        description: 'Maximum volume per aspirate/dispense cycle',
        defaultValue: DEFAULT_VALUES.max_volume_per_cycle,
        min: 10,
        max: 1000,
        step: 10,
        unit: 'μL',
        dependsOn: {
          parameter: 'transfer_mode',
          value: 'multi_cycle',
        },
      },
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
  aspiration: {
    label: 'Aspiration Parameters',
    parameters: {
      aspiration_offset_z: {
        type: 'number',
        label: 'Aspiration Offset Z',
        description: 'Z-axis offset from bottom for aspiration',
        defaultValue: DEFAULT_VALUES.aspiration_offset_z,
        min: 0,
        max: 20,
        step: 0.1,
        unit: 'mm',
      },
      aspiration_flow_rate: {
        type: 'number',
        label: 'Aspiration Flow Rate',
        description: 'Flow rate for aspiration',
        defaultValue: DEFAULT_VALUES.aspiration_flow_rate,
        min: 10,
        max: 1000,
        step: 0.1,
        unit: 'μL/s',
      },
    },
  },
  dispense: {
    label: 'Dispense Parameters',
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
      dispense_flow_rate: {
        type: 'number',
        label: 'Dispense Flow Rate',
        description: 'Flow rate for dispensing',
        defaultValue: DEFAULT_VALUES.dispense_flow_rate,
        min: 10,
        max: 1000,
        step: 0.1,
        unit: 'μL/s',
      },
    },
  },
  safety: {
    label: 'Safety & Mixing Parameters',
    parameters: {
      blowout_enabled: {
        type: 'boolean',
        label: 'Enable Blowout',
        description: 'Perform blowout after dispensing to ensure complete transfer',
        defaultValue: DEFAULT_VALUES.blowout_enabled,
      },
      mix_after_dispense: {
        type: 'boolean',
        label: 'Mix After Dispense',
        description: 'Mix solution after dispensing',
        defaultValue: DEFAULT_VALUES.mix_after_dispense,
      },
      mix_cycles: {
        type: 'number',
        label: 'Mixing Cycles',
        description: 'Number of mixing cycles to perform',
        defaultValue: DEFAULT_VALUES.mix_cycles,
        min: 1,
        max: 10,
        step: 1,
        unit: 'cycles',
        dependsOn: {
          parameter: 'mix_after_dispense',
          value: true,
        },
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'calculate_transfer_cycles',
  'pickup_tip',
  'aspirate_solution',
  'move_to_target',
  'dispense_solution',
  'blowout_tip',
  'mix_solution',
  'drop_tip',
];