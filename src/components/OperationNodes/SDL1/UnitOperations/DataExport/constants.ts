import { ParameterGroup } from '../../types';

export const EXPORT_FORMAT_OPTIONS = [
  { value: 'CSV', label: 'CSV' },
  { value: 'Excel', label: 'Excel (.xlsx)' },
  { value: 'JSON', label: 'JSON' },
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

export const LOG_LEVEL_FILTER_OPTIONS = [
  { value: 'DEBUG', label: 'DEBUG' },
  { value: 'INFO', label: 'INFO' },
  { value: 'WARNING', label: 'WARNING' },
  { value: 'ERROR', label: 'ERROR' },
];

export const FILE_NAMING_OPTIONS = [
  { value: '{experiment_id}_cycles{cycle_range}_{data_type}', label: 'Standard: exp_cycles1-5_dc' },
  { value: '{experiment_id}_{timestamp}_cycles{cycle_range}_{data_type}', label: 'With Timestamp: exp_20240723_cycles1-5_dc' },
  { value: '{experiment_id}_c{cycle_start}-{cycle_end}_{data_type}', label: 'Explicit Range: exp_c1-5_dc' },
  { value: '{data_type}_{experiment_id}_cycles{cycle_range}', label: 'Type First: dc_exp_cycles1-5' },
  { value: 'custom', label: 'Custom Pattern' },
];

export const CYCLE_RANGE_FORMAT_OPTIONS = [
  { value: '{start}-{end}', label: 'Range: 1-5' },
  { value: '{start}to{end}', label: 'Range: 1to5' },
  { value: '{start}_{end}', label: 'Underscore: 1_5' },
  { value: '{total}cycles', label: 'Total: 5cycles' },
];

export const DEFAULT_VALUES = {
  // Common parameters
  uo_name: 'Experiment_Data_Export',
  description: 'Export DC/AC electrochemical data, metadata, and logs with enhanced cycle range file naming',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Data path
  data_path: './data',
  
  // Enhanced file naming with cycle range
  file_naming_template: '{experiment_id}_cycles{cycle_range}_{data_type}',
  custom_file_naming: '',
  cycle_range_format: '{start}-{end}',
  include_timestamp_in_filename: false,
  timestamp_format: 'YYYYMMDD_HHMMSS',
  
  // Cycle range parameters
  cycle_start: 1,  // From Sequence Control
  cycle_end: 5,    // From Sequence Control
  total_cycles: 5, // From Sequence Control
  
  // DC Data Export settings
  dc_data_export: true,
  dc_file_name: 'electrochemical_dc',
  
  // AC Data Export settings
  ac_data_export: true,
  ac_file_name: 'electrochemical_ac',
  
  // Metadata Export settings
  metadata_export: true,
  include_parameters: true,
  include_timestamps: true,
  
  // Log Export settings
  log_export: true,
  log_level_filter: 'INFO',
  include_system_logs: false,
  
  // Legacy parameters for compatibility
  export_format: 'CSV',
  file_naming: '{experiment_id}_cycles{cycle_range}_{data_type}',
  dc_columns: ['timestamp_s', 'current_A', 'we_voltage_V'],
  ac_columns: ['timestamp', 'frequency', 'absoluteImpedance', 'realImpedance', 'imagImpedance', 'phaseAngle', 'numberOfCycles'],
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
  general_settings: {
    label: 'General Export Settings',
    parameters: {
      data_path: {
        type: 'string',
        label: 'Data Path',
        description: 'Directory path for exported files',
        defaultValue: DEFAULT_VALUES.data_path,
        required: true,
      },
    },
  },
  file_naming: {
    label: 'Enhanced File Naming',
    parameters: {
      file_naming_template: {
        type: 'select',
        label: 'File Naming Template',
        description: 'Select predefined naming pattern or choose custom',
        options: FILE_NAMING_OPTIONS,
        defaultValue: DEFAULT_VALUES.file_naming_template,
        required: true,
      },
      custom_file_naming: {
        type: 'string',
        label: 'Custom Pattern',
        description: 'Custom naming pattern. Available placeholders: {experiment_id}, {cycle_range}, {cycle_start}, {cycle_end}, {total_cycles}, {data_type}, {timestamp}',
        defaultValue: DEFAULT_VALUES.custom_file_naming,
        dependsOn: {
          parameter: 'file_naming_template',
          value: 'custom',
        },
      },
      cycle_range_format: {
        type: 'select',
        label: 'Cycle Range Format',
        description: 'Format for displaying cycle ranges in filenames',
        options: CYCLE_RANGE_FORMAT_OPTIONS,
        defaultValue: DEFAULT_VALUES.cycle_range_format,
      },
      include_timestamp_in_filename: {
        type: 'boolean',
        label: 'Include Timestamp',
        description: 'Add timestamp to filename for uniqueness',
        defaultValue: DEFAULT_VALUES.include_timestamp_in_filename,
      },
      timestamp_format: {
        type: 'string',
        label: 'Timestamp Format',
        description: 'Format for timestamp in filename (YYYYMMDD_HHMMSS)',
        defaultValue: DEFAULT_VALUES.timestamp_format,
        dependsOn: {
          parameter: 'include_timestamp_in_filename',
          value: true,
        },
      },
    },
  },
  cycle_range_info: {
    label: 'Cycle Range Information (Read-Only)',
    parameters: {
      cycle_start: {
        type: 'number',
        label: 'Start Cycle',
        description: 'First cycle in the range (from Sequence Control)',
        defaultValue: DEFAULT_VALUES.cycle_start,
        min: 1,
        max: 1000,
        step: 1,
        unit: 'cycle',
        readOnly: true,
      },
      cycle_end: {
        type: 'number',
        label: 'End Cycle',
        description: 'Last cycle in the range (from Sequence Control)',
        defaultValue: DEFAULT_VALUES.cycle_end,
        min: 1,
        max: 1000,
        step: 1,
        unit: 'cycle',
        readOnly: true,
      },
      total_cycles: {
        type: 'number',
        label: 'Total Cycles',
        description: 'Total number of cycles (from Sequence Control)',
        defaultValue: DEFAULT_VALUES.total_cycles,
        min: 1,
        max: 1000,
        step: 1,
        unit: 'cycles',
        readOnly: true,
      },
    },
  },
  dc_data_export: {
    label: 'DC Data Export',
    parameters: {
      dc_data_export: {
        type: 'boolean',
        label: 'DC Data Export',
        description: 'Export direct current electrochemical data',
        defaultValue: DEFAULT_VALUES.dc_data_export,
      },
      dc_file_name: {
        type: 'string',
        label: 'DC File Name Prefix',
        description: 'Custom prefix for DC data files',
        defaultValue: DEFAULT_VALUES.dc_file_name,
        dependsOn: {
          parameter: 'dc_data_export',
          value: true,
        },
      },
    },
  },
  ac_data_export: {
    label: 'AC Data Export',
    parameters: {
      ac_data_export: {
        type: 'boolean',
        label: 'AC Data Export',
        description: 'Export alternating current impedance data',
        defaultValue: DEFAULT_VALUES.ac_data_export,
      },
      ac_file_name: {
        type: 'string',
        label: 'AC File Name Prefix',
        description: 'Custom prefix for AC impedance files',
        defaultValue: DEFAULT_VALUES.ac_file_name,
        dependsOn: {
          parameter: 'ac_data_export',
          value: true,
        },
      },
    },
  },
  metadata_export: {
    label: 'Metadata Export',
    parameters: {
      metadata_export: {
        type: 'boolean',
        label: 'Metadata Export',
        description: 'Export experiment metadata as JSON file',
        defaultValue: DEFAULT_VALUES.metadata_export,
      },
      include_parameters: {
        type: 'boolean',
        label: 'Include Parameters',
        description: 'Include all UO parameters in metadata',
        defaultValue: DEFAULT_VALUES.include_parameters,
        dependsOn: {
          parameter: 'metadata_export',
          value: true,
        },
      },
      include_timestamps: {
        type: 'boolean',
        label: 'Include Timestamps',
        description: 'Include detailed timestamps for each operation',
        defaultValue: DEFAULT_VALUES.include_timestamps,
        dependsOn: {
          parameter: 'metadata_export',
          value: true,
        },
      },
    },
  },
  log_export: {
    label: 'Log Export',
    parameters: {
      log_export: {
        type: 'boolean',
        label: 'Log Export',
        description: 'Export experiment log file',
        defaultValue: DEFAULT_VALUES.log_export,
      },
      log_level_filter: {
        type: 'select',
        label: 'Log Level Filter',
        description: 'Minimum log level to include in export',
        options: LOG_LEVEL_FILTER_OPTIONS,
        defaultValue: DEFAULT_VALUES.log_level_filter,
        dependsOn: {
          parameter: 'log_export',
          value: true,
        },
      },
      include_system_logs: {
        type: 'boolean',
        label: 'Include System Logs',
        description: 'Include system-level logging information',
        defaultValue: DEFAULT_VALUES.include_system_logs,
        dependsOn: {
          parameter: 'log_export',
          value: true,
        },
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'collect_data',
  'read_cycle_info_from_sequence_control',
  'generate_cycle_range_string',
  'format_filename_with_cycle_range',
  'format_data',
  'create_dc_file',
  'create_ac_file', 
  'create_metadata_file',
  'create_log_file',
  'write_data',
  'save_file',
  'verify_export',
];