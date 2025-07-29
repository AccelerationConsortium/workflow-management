import { ParameterGroup } from '../../types';
import { VIAL_POSITIONS } from '../../shared/labwareConstants';

export const WELL_ADDRESS_OPTIONS = [
  { value: 'A1', label: 'A1' }, { value: 'A2', label: 'A2' }, { value: 'A3', label: 'A3' }, { value: 'A4', label: 'A4' }, { value: 'A5', label: 'A5' },
  { value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'B3', label: 'B3' }, { value: 'B4', label: 'B4' }, { value: 'B5', label: 'B5' },
  { value: 'C1', label: 'C1' }, { value: 'C2', label: 'C2' }, { value: 'C3', label: 'C3' }, { value: 'C4', label: 'C4' }, { value: 'C5', label: 'C5' },
];

export const NIMO_METHOD_OPTIONS = [
  { value: 'RE', label: 'Random Exploration (RE)' },
  { value: 'PHYSBO', label: 'Bayesian Optimization (PHYSBO)' },
  { value: 'GRID', label: 'Grid Search' },
  { value: 'MANUAL', label: 'Manual Selection' },
];

export const CSV_MODE_OPTIONS = [
  { value: 'nimo_driven', label: 'NIMO-Driven (proposal_example.csv)' },
  { value: 'user_provided', label: 'User-Provided CSV' },
  { value: 'manual_parameters', label: 'Manual Parameter Entry' },
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
  uo_name: 'Enhanced_Experiment_Setup',
  description: 'Initialize experiment with NIMO integration and CSV-driven parameters',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // NIMO Configuration (from script lines 693-718)
  nimo_enabled: true,
  nimo_method: 'RE',                    // Start with Random Exploration
  nimo_input_file: 'combinations_7C1_to_7C4.csv',  // Main combinations file
  nimo_output_file: 'proposal_example.csv',        // Proposal file  
  nimo_num_objectives: 1,               // Single objective optimization
  nimo_num_proposals: 1,                // One proposal per iteration
  
  // CSV Parameter Management
  csv_mode: 'nimo_driven',              // Default to NIMO-driven mode
  csv_file_path: 'proposal_example.csv', // Path to parameter CSV
  manual_additives: {                   // Manual fallback values
    A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0
  },
  
  // Experiment Metadata (from script lines 96-126)
  experiment_base_name: 'ZnDeposition',
  auto_increment_run: true,             // Auto-increment run numbers
  data_directory: 'data',               // Base data directory
  metadata_generation: true,            // Generate metadata.json
  experiment_status: 'running',         // Initial status
  
  // Hardware configuration (from script lines 32, 204)
  robot_ip: '169.254.69.185',          // From script line 32
  robot_port: 80,
  squidstat_port: 'COM4',              // From script line 204
  squidstat_channel: 0,                // From script line 201
  arduino_port: 'COM3',                // Arduino port for pumps
  
  // Target configuration
  target_cell: 'A1',                   // NIS reactor well (auto-assigned)
  test_well_address: 'A1',             // Test well address for experiment
  pipette_tip_start_id: 17,            // From script line 33
  
  // Safety and validation
  validate_hardware_connection: true,
  check_csv_file_exists: true,
  verify_nimo_files: true,
  create_data_directories: true,
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
  experiment_config: {
    label: 'Experiment Configuration',
    parameters: {
      experiment_id: {
        type: 'string',
        label: 'Experiment ID',
        description: 'Unique identifier for this experiment',
        defaultValue: DEFAULT_VALUES.experiment_id,
        required: true,
      },
      test_well_address: {
        type: 'select',
        label: 'Test Well Address',
        description: 'Well plate location (A1-D6)',
        options: WELL_ADDRESS_OPTIONS,
        defaultValue: DEFAULT_VALUES.test_well_address,
        required: true,
      },
      pipette_tip_start_id: {
        type: 'number',
        label: 'Pipette Tip Start ID',
        description: 'Starting tip position (1-96)',
        defaultValue: DEFAULT_VALUES.pipette_tip_start_id,
        min: 1,
        max: 96,
        step: 1,
        required: true,
      },
      run_number: {
        type: 'number',
        label: 'Run Number',
        description: 'Experiment run number (auto-incremented)',
        defaultValue: DEFAULT_VALUES.run_number,
        min: 1,
        max: 9999,
        step: 1,
      },
      experiment_notes: {
        type: 'string',
        label: 'Experiment Notes',
        description: 'Additional notes or comments',
        defaultValue: DEFAULT_VALUES.experiment_notes,
        required: false,
      },
    },
  },
  hardware_config: {
    label: 'Hardware Configuration',
    parameters: {
      robot_ip: {
        type: 'string',
        label: 'Robot IP Address',
        description: 'Opentrons robot IP address',
        defaultValue: DEFAULT_VALUES.robot_ip,
        required: true,
      },
      robot_port: {
        type: 'number',
        label: 'Robot Port',
        description: 'Opentrons API port',
        defaultValue: DEFAULT_VALUES.robot_port,
        min: 1,
        max: 65535,
        step: 1,
        required: true,
      },
      squidstat_port: {
        type: 'string',
        label: 'Squidstat COM Port',
        description: 'Serial port for potentiostat',
        defaultValue: DEFAULT_VALUES.squidstat_port,
        required: true,
      },
      squidstat_channel: {
        type: 'number',
        label: 'Squidstat Channel',
        description: 'Potentiostat channel number',
        defaultValue: DEFAULT_VALUES.squidstat_channel,
        min: 0,
        max: 3,
        step: 1,
        required: true,
      },
    },
  },
  safety_checks: {
    label: 'Safety Checks',
    parameters: {
      validate_hardware_connection: {
        type: 'boolean',
        label: 'Validate Hardware Connection',
        description: 'Check robot and potentiostat connectivity',
        defaultValue: DEFAULT_VALUES.validate_hardware_connection,
      },
      check_pipette_tips: {
        type: 'boolean',
        label: 'Check Pipette Tips',
        description: 'Verify sufficient tips available',
        defaultValue: DEFAULT_VALUES.check_pipette_tips,
      },
      verify_well_availability: {
        type: 'boolean',
        label: 'Verify Well Availability',
        description: 'Ensure selected well is not in use',
        defaultValue: DEFAULT_VALUES.verify_well_availability,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'validate_experiment_id',
  'connect_to_robot',
  'connect_to_potentiostat',
  'check_hardware_status',
  'verify_well_address',
  'check_pipette_tips_available',
  'initialize_experiment_metadata',
  'create_experiment_directory',
  'log_experiment_start',
];