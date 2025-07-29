import { ParameterGroup } from '../../types';

export const MEASUREMENT_TYPE_OPTIONS = [
  { value: 'OCV', label: 'Open Circuit Voltage (OCV)' },
  { value: 'CP', label: 'Chronopotentiometry (CP)' },
  { value: 'CVA', label: 'Cyclic Voltammetry (CVA)' },
  { value: 'PEIS', label: 'Potentiostatic EIS (PEIS)' },
  { value: 'LSV', label: 'Linear Sweep Voltammetry (LSV)' },
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
  uo_name: 'Enhanced_Electrochemical_Measurement',
  description: 'Enhanced electrochemical measurement with real-time data collection and element sequencing',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Hardware configuration
  com_port: 'COM4',
  channel: 0,
  
  // Measurement sequence (based on zinc deposition script)
  sequence_enabled: true,       // Enable multi-element sequence
  sequence_cycles: 1,           // Number of full sequence cycles
  
  // Element 1: Deposition (CP)
  cp_deposition_enabled: true,
  cp_deposition_current: -0.004,    // -4mA deposition current (line 512)
  cp_deposition_duration: 3,        // 3s as specified in script (line 512)
  cp_deposition_voltage_limit: 1.0, // 1.0V limit (line 512)
  
  // Element 2: Rest after deposition (OCV) 
  ocv_post_deposition_enabled: true,
  ocv_post_deposition_duration: 3,  // 3s rest (line 516)
  ocv_post_deposition_sample_interval: 1.0, // 1s sampling (line 516)
  
  // Element 3: PEIS after deposition
  peis_post_deposition_enabled: true,
  peis_post_deposition_start_freq: 10000,  // 10kHz (line 520)
  peis_post_deposition_end_freq: 1000,     // 1kHz (line 520) 
  peis_post_deposition_points_per_decade: 5.0, // 5 steps (line 520)
  peis_post_deposition_dc_bias: 0.0,       // 0V bias (line 520)
  peis_post_deposition_ac_amplitude: 0.01, // 10mV (line 520)
  peis_post_deposition_bias_vs_ocp: true,  // vs OCP (line 521)
  peis_post_deposition_min_cycles: 1,      // 1 cycle (line 522)
  
  // Element 4: Dissolution (CP)
  cp_dissolution_enabled: true,
  cp_dissolution_current: 0.004,     // +4mA dissolution current (line 526)
  cp_dissolution_duration: 3,        // 3s (line 526)
  cp_dissolution_voltage_limit: 1.0, // 1.0V limit (line 526)
  cp_dissolution_max_voltage: -0.5,  // Max voltage -0.5V (line 527)
  
  // Element 5: Rest after dissolution (OCV)
  ocv_post_dissolution_enabled: true,
  ocv_post_dissolution_duration: 3,  // 3s rest (line 531)
  ocv_post_dissolution_sample_interval: 1.0, // 1s sampling (line 531)
  
  // Element 6: PEIS after dissolution  
  peis_post_dissolution_enabled: true,
  peis_post_dissolution_start_freq: 10000,  // 10kHz (line 535)
  peis_post_dissolution_end_freq: 1000,     // 1kHz (line 535)
  peis_post_dissolution_points_per_decade: 5.0, // 5 steps (line 535)
  peis_post_dissolution_dc_bias: 0.0,       // 0V bias (line 535)
  peis_post_dissolution_ac_amplitude: 0.01, // 10mV (line 535)
  peis_post_dissolution_bias_vs_ocp: true,  // vs OCP (line 536)
  peis_post_dissolution_min_cycles: 1,      // 1 cycle (line 537)
  
  // Data collection and callbacks
  real_time_data_collection: true,   // Enable real-time DC/AC data callbacks
  data_save_enabled: true,           // Save data to CSV files
  experiment_name_template: 'Zinc_Deposition_{timestamp}', // Naming template
  dc_data_columns: ['timestamp_s', 'current_A', 'we_voltage_V'], // DC data format
  ac_data_columns: ['timestamp', 'frequency', 'absoluteImpedance', 'realImpedance', 'imagImpedance', 'phaseAngle', 'numberOfCycles'], // AC data format
  
  // Element status tracking
  element_logging_enabled: true,     // Log element start/stop events
  element_status_callback: true,     // Enable element status callbacks
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
  hardware: {
    label: 'Hardware Configuration',
    parameters: {
      com_port: {
        type: 'string',
        label: 'COM Port',
        description: 'Serial port for potentiostat connection',
        defaultValue: DEFAULT_VALUES.com_port,
        required: true,
      },
      channel: {
        type: 'number',
        label: 'Channel',
        description: 'Potentiostat channel number',
        defaultValue: DEFAULT_VALUES.channel,
        min: 0,
        max: 3,
        step: 1,
        required: true,
      },
    },
  },
  measurement: {
    label: 'Measurement Configuration',
    parameters: {
      measurement_type: {
        type: 'select',
        label: 'Measurement Type',
        description: 'Type of electrochemical measurement',
        options: MEASUREMENT_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.measurement_type,
        required: true,
      },
    },
  },
  ocv: {
    label: 'OCV Parameters',
    parameters: {
      ocv_duration: {
        type: 'number',
        label: 'Duration',
        description: 'OCV measurement duration',
        defaultValue: DEFAULT_VALUES.ocv_duration,
        min: 1,
        max: 3600,
        step: 1,
        unit: 's',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'OCV',
        },
      },
      ocv_sample_interval: {
        type: 'number',
        label: 'Sample Interval',
        description: 'Time between measurements',
        defaultValue: DEFAULT_VALUES.ocv_sample_interval,
        min: 0.1,
        max: 60,
        step: 0.1,
        unit: 's',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'OCV',
        },
      },
      ocv_settle_time: {
        type: 'number',
        label: 'Settle Time',
        description: 'Initial settling time before measurement',
        defaultValue: DEFAULT_VALUES.ocv_settle_time,
        min: 0,
        max: 60,
        step: 1,
        unit: 's',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'OCV',
        },
      },
      ocv_stability_threshold: {
        type: 'number',
        label: 'Stability Threshold',
        description: 'Voltage stability requirement for OCV',
        defaultValue: DEFAULT_VALUES.ocv_stability_threshold,
        min: 0.0001,
        max: 0.1,
        step: 0.0001,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'OCV',
        },
      },
    },
  },
  cp: {
    label: 'CP Parameters',
    parameters: {
      cp_current: {
        type: 'number',
        label: 'Current',
        description: 'Applied current',
        defaultValue: DEFAULT_VALUES.cp_current,
        min: -0.1,
        max: 0.1,
        step: 0.0001,
        unit: 'A',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CP',
        },
      },
      cp_duration: {
        type: 'number',
        label: 'Duration',
        description: 'CP measurement duration',
        defaultValue: DEFAULT_VALUES.cp_duration,
        min: 1,
        max: 7200,
        step: 1,
        unit: 's',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CP',
        },
      },
      cp_sample_interval: {
        type: 'number',
        label: 'Sample Interval',
        description: 'Time between measurements',
        defaultValue: DEFAULT_VALUES.cp_sample_interval,
        min: 0.1,
        max: 60,
        step: 0.1,
        unit: 's',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CP',
        },
      },
      cp_voltage_limit_min: {
        type: 'number',
        label: 'Min Voltage Limit',
        description: 'Minimum voltage limit',
        defaultValue: DEFAULT_VALUES.cp_voltage_limit_min,
        min: -2,
        max: 0,
        step: 0.01,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CP',
        },
      },
      cp_voltage_limit_max: {
        type: 'number',
        label: 'Max Voltage Limit',
        description: 'Maximum voltage limit',
        defaultValue: DEFAULT_VALUES.cp_voltage_limit_max,
        min: 0,
        max: 2,
        step: 0.01,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CP',
        },
      },
    },
  },
  cva: {
    label: 'CVA Parameters',
    parameters: {
      cva_start_voltage: {
        type: 'number',
        label: 'Start Voltage',
        description: 'Starting voltage for cyclic voltammetry',
        defaultValue: DEFAULT_VALUES.cva_start_voltage,
        min: -2,
        max: 2,
        step: 0.01,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CVA',
        },
      },
      cva_end_voltage: {
        type: 'number',
        label: 'End Voltage',
        description: 'Ending voltage for cyclic voltammetry',
        defaultValue: DEFAULT_VALUES.cva_end_voltage,
        min: -2,
        max: 2,
        step: 0.01,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CVA',
        },
      },
      cva_scan_rate: {
        type: 'number',
        label: 'Scan Rate',
        description: 'Voltage scan rate',
        defaultValue: DEFAULT_VALUES.cva_scan_rate,
        min: 0.001,
        max: 1,
        step: 0.001,
        unit: 'V/s',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CVA',
        },
      },
      cva_cycles: {
        type: 'number',
        label: 'Number of Cycles',
        description: 'Number of CV cycles to perform',
        defaultValue: DEFAULT_VALUES.cva_cycles,
        min: 1,
        max: 100,
        step: 1,
        unit: 'cycles',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CVA',
        },
      },
      cva_sample_interval: {
        type: 'number',
        label: 'Sample Interval',
        description: 'Time between measurements',
        defaultValue: DEFAULT_VALUES.cva_sample_interval,
        min: 0.001,
        max: 1,
        step: 0.001,
        unit: 's',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'CVA',
        },
      },
    },
  },
  peis: {
    label: 'PEIS Parameters',
    parameters: {
      peis_start_frequency: {
        type: 'number',
        label: 'Start Frequency',
        description: 'Starting frequency for impedance sweep (10kHz from script)',
        defaultValue: DEFAULT_VALUES.peis_start_frequency,
        min: 0.1,
        max: 100000,
        step: 1,
        unit: 'Hz',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'PEIS',
        },
      },
      peis_end_frequency: {
        type: 'number',
        label: 'End Frequency',
        description: 'Ending frequency for impedance sweep (0.1Hz from script)',
        defaultValue: DEFAULT_VALUES.peis_end_frequency,
        min: 0.1,
        max: 1000,
        step: 0.1,
        unit: 'Hz',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'PEIS',
        },
      },
      peis_points_per_decade: {
        type: 'number',
        label: 'Steps per Decade',
        description: 'Number of measurement steps per frequency decade (5 from script)',
        defaultValue: DEFAULT_VALUES.peis_points_per_decade,
        min: 1,
        max: 20,
        step: 0.5,
        unit: '',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'PEIS',
        },
      },
      peis_minimum_cycles: {
        type: 'number',
        label: 'Minimum Cycles',
        description: 'Minimum number of cycles per frequency point',
        defaultValue: DEFAULT_VALUES.peis_minimum_cycles,
        min: 1,
        max: 10,
        step: 1,
        unit: 'cycles',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'PEIS',
        },
      },
      peis_ac_amplitude: {
        type: 'number',
        label: 'AC Amplitude',
        description: 'AC signal amplitude',
        defaultValue: DEFAULT_VALUES.peis_ac_amplitude,
        min: 0.001,
        max: 0.1,
        step: 0.001,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'PEIS',
        },
      },
      peis_dc_bias: {
        type: 'number',
        label: 'DC Bias',
        description: 'DC bias voltage',
        defaultValue: DEFAULT_VALUES.peis_dc_bias,
        min: -2,
        max: 2,
        step: 0.01,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'PEIS',
        },
      },
      peis_bias_vs_ocp: {
        type: 'boolean',
        label: 'Bias vs OCP',
        description: 'Apply DC bias relative to OCP',
        defaultValue: DEFAULT_VALUES.peis_bias_vs_ocp,
        dependsOn: {
          parameter: 'measurement_type',
          value: 'PEIS',
        },
      },
    },
  },
  lsv: {
    label: 'LSV Parameters',
    parameters: {
      lsv_start_voltage: {
        type: 'number',
        label: 'Start Voltage',
        description: 'Starting voltage for linear sweep voltammetry',
        defaultValue: DEFAULT_VALUES.lsv_start_voltage,
        min: -2,
        max: 2,
        step: 0.01,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'LSV',
        },
      },
      lsv_end_voltage: {
        type: 'number',
        label: 'End Voltage',
        description: 'Ending voltage for linear sweep voltammetry',
        defaultValue: DEFAULT_VALUES.lsv_end_voltage,
        min: -2,
        max: 2,
        step: 0.01,
        unit: 'V',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'LSV',
        },
      },
      lsv_scan_rate: {
        type: 'number',
        label: 'Scan Rate',
        description: 'Voltage scan rate',
        defaultValue: DEFAULT_VALUES.lsv_scan_rate,
        min: 0.001,
        max: 1,
        step: 0.001,
        unit: 'V/s',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'LSV',
        },
      },
      lsv_sample_interval: {
        type: 'number',
        label: 'Sample Interval',
        description: 'Time between measurements',
        defaultValue: DEFAULT_VALUES.lsv_sample_interval,
        min: 0.001,
        max: 1,
        step: 0.001,
        unit: 's',
        dependsOn: {
          parameter: 'measurement_type',
          value: 'LSV',
        },
      },
    },
  },
  data_collection: {
    label: 'Data Collection Settings',
    parameters: {
      data_collection_enabled: {
        type: 'boolean',
        label: 'Data Collection Enabled',
        description: 'Whether to collect data from this measurement step',
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
        description: 'Tag for identifying this data in analysis (e.g., "Deposition", "Dissolution", "Rest")',
        defaultValue: DEFAULT_VALUES.data_tag,
        required: true,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'connect_electrodes',
  'initialize_potentiostat',
  'measure_ocv',
  'apply_current',
  'apply_voltage',
  'measure_impedance',
  'record_data',
  'disconnect_electrodes',
];