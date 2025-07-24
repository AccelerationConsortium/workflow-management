import { ParameterGroup } from '../../types';

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

export const DISPLAY_MODE_OPTIONS = [
  { value: 'basic', label: 'Basic Display' },
  { value: 'detailed', label: 'Detailed Progress' },
  { value: 'statistics', label: 'Performance Statistics' },
];

export const TIME_FORMAT_OPTIONS = [
  { value: 'hms', label: 'HH:MM:SS' },
  { value: 'seconds', label: 'Total Seconds' },
  { value: 'minutes', label: 'Total Minutes' },
];

export const DEFAULT_VALUES = {
  // Common parameters
  uo_name: 'Cycle_Counter',
  description: 'Monitor and display current cycle status, progress, and statistics',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'continue',
  log_level: 'INFO',
  
  // Display configuration
  display_mode: 'detailed',
  time_format: 'hms',
  show_progress_bar: true,
  show_eta: true,
  
  // Counter parameters (read-only displays)
  current_cycle: 1,           // Current cycle number (read from sequence control)
  total_cycles: 5,            // Total cycles (from sequence control)
  cycle_start_time: 0,        // Start time of current cycle (timestamp)
  elapsed_time_current: 0,    // Elapsed time for current cycle (seconds)
  elapsed_time_total: 0,      // Total elapsed time for all cycles (seconds)
  estimated_completion: 0,    // Estimated completion time (timestamp)
  
  // Performance tracking
  average_cycle_time: 0,      // Average time per cycle (seconds)
  fastest_cycle_time: 0,      // Fastest cycle completion time
  slowest_cycle_time: 0,      // Slowest cycle completion time
  
  // Data collection parameters
  data_collection_enabled: true,
  cycle_dependent_collection: false,
  data_tag: 'Cycle_Monitor',
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
  display_configuration: {
    label: 'Display Configuration',
    parameters: {
      display_mode: {
        type: 'select',
        label: 'Display Mode',
        description: 'Level of detail in cycle display',
        options: DISPLAY_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.display_mode,
        required: true,
      },
      time_format: {
        type: 'select',
        label: 'Time Format',
        description: 'Format for displaying time values',
        options: TIME_FORMAT_OPTIONS,
        defaultValue: DEFAULT_VALUES.time_format,
        required: true,
      },
      show_progress_bar: {
        type: 'boolean',
        label: 'Show Progress Bar',
        description: 'Display visual progress bar for cycle completion',
        defaultValue: DEFAULT_VALUES.show_progress_bar,
      },
      show_eta: {
        type: 'boolean',
        label: 'Show ETA',
        description: 'Display estimated time of completion',
        defaultValue: DEFAULT_VALUES.show_eta,
      },
    },
  },
  cycle_status: {
    label: 'Cycle Status (Read-Only)',
    parameters: {
      current_cycle: {
        type: 'number',
        label: 'Current Cycle',
        description: 'Current cycle number (read from sequence control)',
        defaultValue: DEFAULT_VALUES.current_cycle,
        min: 1,
        max: 1000,
        step: 1,
        unit: '',
        readOnly: true,
      },
      total_cycles: {
        type: 'number',
        label: 'Total Cycles',
        description: 'Total number of cycles (from sequence control)',
        defaultValue: DEFAULT_VALUES.total_cycles,
        min: 1,
        max: 1000,
        step: 1,
        unit: '',
        readOnly: true,
      },
      cycle_start_time: {
        type: 'number',
        label: 'Cycle Start Time',
        description: 'Start time of current cycle (timestamp)',
        defaultValue: DEFAULT_VALUES.cycle_start_time,
        unit: 'timestamp',
        readOnly: true,
      },
      elapsed_time_current: {
        type: 'number',
        label: 'Current Cycle Elapsed',
        description: 'Elapsed time for current cycle',
        defaultValue: DEFAULT_VALUES.elapsed_time_current,
        min: 0,
        step: 1,
        unit: 's',
        readOnly: true,
      },
      elapsed_time_total: {
        type: 'number',
        label: 'Total Elapsed Time',
        description: 'Total elapsed time for all cycles',
        defaultValue: DEFAULT_VALUES.elapsed_time_total,
        min: 0,
        step: 1,
        unit: 's',
        readOnly: true,
      },
      estimated_completion: {
        type: 'number',
        label: 'Estimated Completion',
        description: 'Estimated completion time (timestamp)',
        defaultValue: DEFAULT_VALUES.estimated_completion,
        unit: 'timestamp',
        readOnly: true,
      },
    },
  },
  performance_tracking: {
    label: 'Performance Statistics',
    parameters: {
      average_cycle_time: {
        type: 'number',
        label: 'Average Cycle Time',
        description: 'Average time per cycle',
        defaultValue: DEFAULT_VALUES.average_cycle_time,
        min: 0,
        step: 1,
        unit: 's',
        readOnly: true,
      },
      fastest_cycle_time: {
        type: 'number',
        label: 'Fastest Cycle',
        description: 'Fastest cycle completion time',
        defaultValue: DEFAULT_VALUES.fastest_cycle_time,
        min: 0,
        step: 1,
        unit: 's',
        readOnly: true,
      },
      slowest_cycle_time: {
        type: 'number',
        label: 'Slowest Cycle',
        description: 'Slowest cycle completion time',
        defaultValue: DEFAULT_VALUES.slowest_cycle_time,
        min: 0,
        step: 1,
        unit: 's',
        readOnly: true,
      },
    },
  },
  data_collection: {
    label: 'Data Collection Settings',
    parameters: {
      data_collection_enabled: {
        type: 'boolean',
        label: 'Data Collection Enabled',
        description: 'Whether to collect data from this monitoring step',
        defaultValue: DEFAULT_VALUES.data_collection_enabled,
      },
      cycle_dependent_collection: {
        type: 'boolean',
        label: 'Cycle Dependent Collection',
        description: 'Data collection depends on current cycle number (controlled by Sequence Control)',
        defaultValue: DEFAULT_VALUES.cycle_dependent_collection,
      },
      data_tag: {
        type: 'string',
        label: 'Data Tag/Label',
        description: 'Tag for identifying this data in analysis (e.g., "Cycle_Monitor", "Progress_Tracking")',
        defaultValue: DEFAULT_VALUES.data_tag,
        required: true,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'initialize_counter',
  'read_sequence_control',
  'update_current_cycle',
  'calculate_elapsed_time',
  'update_performance_stats',
  'estimate_completion_time',
  'display_progress',
  'log_cycle_statistics',
];