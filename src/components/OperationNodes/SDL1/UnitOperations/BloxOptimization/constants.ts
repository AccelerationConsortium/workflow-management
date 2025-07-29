import { ParameterGroup } from '../../types';

export const OPTIMIZATION_METHOD_OPTIONS = [
  { value: 'EHVI', label: 'Expected Hypervolume Improvement (EHVI)' },
  { value: 'PAREGO', label: 'ParEGO' },
  { value: 'NSGA2', label: 'NSGA-II' },
  { value: 'MOEAD', label: 'MOEA/D' },
];

export const ACQUISITION_FUNCTION_OPTIONS = [
  { value: 'qEHVI', label: 'Multi-objective qEHVI' },
  { value: 'qNEHVI', label: 'Noisy qEHVI' },
  { value: 'qParEGO', label: 'q-ParEGO' },
  { value: 'qEI', label: 'Expected Improvement' },
];

export const SURROGATE_MODEL_OPTIONS = [
  { value: 'MultiTaskGP', label: 'Multi-Task Gaussian Process' },
  { value: 'SingleTaskGP', label: 'Single-Task Gaussian Process' },
  { value: 'FixedNoiseGP', label: 'Fixed Noise GP' },
  { value: 'HeteroskedasticSingleTaskGP', label: 'Heteroskedastic GP' },
];

export const INITIAL_STRATEGY_OPTIONS = [
  { value: 'random_sampling', label: 'Random Sampling' },
  { value: 'latin_hypercube', label: 'Latin Hypercube Sampling' },
  { value: 'sobol_sequence', label: 'Sobol Sequence' },
  { value: 'grid_search', label: 'Grid Search' },
];

export const OBJECTIVE_TYPE_OPTIONS = [
  { value: 'maximize', label: 'Maximize' },
  { value: 'minimize', label: 'Minimize' },
];

export const EXTRACTION_METHOD_OPTIONS = [
  { value: 'integrate_current_curve', label: 'Integrate Current Curve' },
  { value: 'coulombic_efficiency', label: 'Coulombic Efficiency' },
  { value: 'voltage_stability', label: 'Voltage Stability' },
  { value: 'peak_current', label: 'Peak Current' },
  { value: 'average_voltage', label: 'Average Voltage' },
  { value: 'energy_density', label: 'Energy Density' },
  { value: 'power_density', label: 'Power Density' },
];

export const DATA_SOURCE_OPTIONS = [
  { value: 'dc_data', label: 'DC Data' },
  { value: 'ac_data', label: 'AC Data' },
  { value: 'combined_data', label: 'Combined Data' },
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
  uo_name: 'BloxOptimizer',
  description: 'Multi-objective Bayesian optimization using Blox framework for autonomous experimental design',
  wait_before: 0,
  wait_after: 1,
  error_handling: 'continue',
  log_level: 'INFO',
  
  // Blox core configuration
  optimization_method: 'EHVI',
  acquisition_function: 'qEHVI',
  surrogate_model: 'MultiTaskGP',
  
  // Parameter space definition (7 additives as categorical variables)
  parameter_space_enabled: true,
  additive_A_enabled: true,
  additive_B_enabled: true,
  additive_C_enabled: true,
  additive_D_enabled: true,
  additive_E_enabled: true,
  additive_F_enabled: true,
  additive_G_enabled: true,
  
  // Objective functions definition
  objectives_enabled: true,
  capacity_objective_enabled: true,
  capacity_objective_type: 'maximize',
  capacity_objective_weight: 0.4,
  capacity_extraction_method: 'integrate_current_curve',
  capacity_data_source: 'dc_data',
  capacity_data_column: 'current_A',
  
  efficiency_objective_enabled: true,
  efficiency_objective_type: 'maximize',
  efficiency_objective_weight: 0.3,
  efficiency_extraction_method: 'coulombic_efficiency',
  efficiency_data_source: 'dc_data',
  
  stability_objective_enabled: true,
  stability_objective_type: 'maximize',
  stability_objective_weight: 0.3,
  stability_extraction_method: 'voltage_stability',
  stability_data_source: 'dc_data',
  stability_data_column: 'we_voltage_V',
  
  // Optimization strategy
  initial_strategy: 'random_sampling',
  initial_samples: 3,
  max_iterations: 20,
  batch_size: 1,
  convergence_threshold: 0.01,
  exploration_weight: 0.1,
  
  // Data management
  experiment_history_file: 'blox_experiment_history.json',
  parameter_proposals_file: 'blox_proposals.csv',
  results_update_file: 'blox_results.json',
  backup_frequency: 5,
  
  // Advanced features
  constraint_handling: true,
  max_additives_constraint: 4,
  min_additives_constraint: 1,
  multi_fidelity: false,
  uncertainty_quantification: true,
  expected_improvement_threshold: 0.001,
  
  // Workflow integration
  trigger_experiment_on_proposal: true,
  wait_for_experiment_completion: true,
  auto_extract_objectives: true,
  real_time_model_update: true,
  
  // Data collection settings
  data_collection_enabled: true,
  cycle_dependent_collection: false,
  data_tag: 'BloxOptimization',
};

export const PARAMETER_GROUPS: Record<string, ParameterGroup> = {
  common: {
    label: 'Common Parameters',
    parameters: {
      uo_name: {
        type: 'string',
        label: 'UO Name',
        description: 'Custom name for this optimization operation',
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
        description: 'How to handle errors during execution',
        options: ERROR_HANDLING_OPTIONS,
        defaultValue: DEFAULT_VALUES.error_handling,
        required: true,
      },
      log_level: {
        type: 'select',
        label: 'Log Level',
        description: 'Logging verbosity level',
        options: LOG_LEVEL_OPTIONS,
        defaultValue: DEFAULT_VALUES.log_level,
        required: true,
      },
    },
  },
  blox_core: {
    label: 'Blox Core Configuration',
    parameters: {
      optimization_method: {
        type: 'select',
        label: 'Optimization Method',
        description: 'Multi-objective optimization algorithm',
        options: OPTIMIZATION_METHOD_OPTIONS,
        defaultValue: DEFAULT_VALUES.optimization_method,
        required: true,
      },
      acquisition_function: {
        type: 'select',
        label: 'Acquisition Function',
        description: 'Function for selecting next experiments',
        options: ACQUISITION_FUNCTION_OPTIONS,
        defaultValue: DEFAULT_VALUES.acquisition_function,
        required: true,
      },
      surrogate_model: {
        type: 'select',
        label: 'Surrogate Model',
        description: 'Machine learning model for optimization',
        options: SURROGATE_MODEL_OPTIONS,
        defaultValue: DEFAULT_VALUES.surrogate_model,
        required: true,
      },
    },
  },
  parameter_space: {
    label: 'Parameter Space Definition',
    parameters: {
      parameter_space_enabled: {
        type: 'boolean',
        label: 'Enable Parameter Space',
        description: 'Define experimental parameter space for optimization',
        defaultValue: DEFAULT_VALUES.parameter_space_enabled,
      },
      additive_A_enabled: {
        type: 'boolean',
        label: 'Additive A',
        description: 'Include additive A in optimization (0 or 1)',
        defaultValue: DEFAULT_VALUES.additive_A_enabled,
        dependsOn: {
          parameter: 'parameter_space_enabled',
          value: true,
        },
      },
      additive_B_enabled: {
        type: 'boolean',
        label: 'Additive B',
        description: 'Include additive B in optimization (0 or 1)',
        defaultValue: DEFAULT_VALUES.additive_B_enabled,
        dependsOn: {
          parameter: 'parameter_space_enabled',
          value: true,
        },
      },
      additive_C_enabled: {
        type: 'boolean',
        label: 'Additive C',
        description: 'Include additive C in optimization (0 or 1)',
        defaultValue: DEFAULT_VALUES.additive_C_enabled,
        dependsOn: {
          parameter: 'parameter_space_enabled',
          value: true,
        },
      },
      additive_D_enabled: {
        type: 'boolean',
        label: 'Additive D',
        description: 'Include additive D in optimization (0 or 1)',
        defaultValue: DEFAULT_VALUES.additive_D_enabled,
        dependsOn: {
          parameter: 'parameter_space_enabled',
          value: true,
        },
      },
      additive_E_enabled: {
        type: 'boolean',
        label: 'Additive E',
        description: 'Include additive E in optimization (0 or 1)',
        defaultValue: DEFAULT_VALUES.additive_E_enabled,
        dependsOn: {
          parameter: 'parameter_space_enabled',
          value: true,
        },
      },
      additive_F_enabled: {
        type: 'boolean',
        label: 'Additive F',
        description: 'Include additive F in optimization (0 or 1)',
        defaultValue: DEFAULT_VALUES.additive_F_enabled,
        dependsOn: {
          parameter: 'parameter_space_enabled',
          value: true,
        },
      },
      additive_G_enabled: {
        type: 'boolean',
        label: 'Additive G',
        description: 'Include additive G in optimization (0 or 1)',
        defaultValue: DEFAULT_VALUES.additive_G_enabled,
        dependsOn: {
          parameter: 'parameter_space_enabled',
          value: true,
        },
      },
    },
  },
  objectives: {
    label: 'Objective Functions',
    parameters: {
      objectives_enabled: {
        type: 'boolean',
        label: 'Enable Objectives',
        description: 'Define optimization objectives',
        defaultValue: DEFAULT_VALUES.objectives_enabled,
      },
      capacity_objective_enabled: {
        type: 'boolean',
        label: 'Capacity Objective',
        description: 'Optimize for battery capacity',
        defaultValue: DEFAULT_VALUES.capacity_objective_enabled,
        dependsOn: {
          parameter: 'objectives_enabled',
          value: true,
        },
      },
      capacity_objective_type: {
        type: 'select',
        label: 'Capacity Type',
        description: 'Maximize or minimize capacity',
        options: OBJECTIVE_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.capacity_objective_type,
        dependsOn: {
          parameter: 'capacity_objective_enabled',
          value: true,
        },
      },
      capacity_objective_weight: {
        type: 'number',
        label: 'Capacity Weight',
        description: 'Relative importance of capacity objective',
        defaultValue: DEFAULT_VALUES.capacity_objective_weight,
        min: 0.0,
        max: 1.0,
        step: 0.1,
        dependsOn: {
          parameter: 'capacity_objective_enabled',
          value: true,
        },
      },
      capacity_extraction_method: {
        type: 'select',
        label: 'Capacity Extraction',
        description: 'Method to extract capacity from data',
        options: EXTRACTION_METHOD_OPTIONS,
        defaultValue: DEFAULT_VALUES.capacity_extraction_method,
        dependsOn: {
          parameter: 'capacity_objective_enabled',
          value: true,
        },
      },
      capacity_data_source: {
        type: 'select',
        label: 'Capacity Data Source',
        description: 'Data source for capacity calculation',
        options: DATA_SOURCE_OPTIONS,
        defaultValue: DEFAULT_VALUES.capacity_data_source,
        dependsOn: {
          parameter: 'capacity_objective_enabled',
          value: true,
        },
      },
      capacity_data_column: {
        type: 'string',
        label: 'Capacity Data Column',
        description: 'Column name for capacity calculation',
        defaultValue: DEFAULT_VALUES.capacity_data_column,
        dependsOn: {
          parameter: 'capacity_objective_enabled',
          value: true,
        },
      },
    },
  },
  efficiency_objective: {
    label: 'Efficiency Objective',
    parameters: {
      efficiency_objective_enabled: {
        type: 'boolean',
        label: 'Efficiency Objective',
        description: 'Optimize for coulombic efficiency',
        defaultValue: DEFAULT_VALUES.efficiency_objective_enabled,
        dependsOn: {
          parameter: 'objectives_enabled',
          value: true,
        },
      },
      efficiency_objective_type: {
        type: 'select',
        label: 'Efficiency Type',
        description: 'Maximize or minimize efficiency',
        options: OBJECTIVE_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.efficiency_objective_type,
        dependsOn: {
          parameter: 'efficiency_objective_enabled',
          value: true,
        },
      },
      efficiency_objective_weight: {
        type: 'number',
        label: 'Efficiency Weight',
        description: 'Relative importance of efficiency objective',
        defaultValue: DEFAULT_VALUES.efficiency_objective_weight,
        min: 0.0,
        max: 1.0,
        step: 0.1,
        dependsOn: {
          parameter: 'efficiency_objective_enabled',
          value: true,
        },
      },
      efficiency_extraction_method: {
        type: 'select',
        label: 'Efficiency Extraction',
        description: 'Method to extract efficiency from data',
        options: EXTRACTION_METHOD_OPTIONS,
        defaultValue: DEFAULT_VALUES.efficiency_extraction_method,
        dependsOn: {
          parameter: 'efficiency_objective_enabled',
          value: true,
        },
      },
      efficiency_data_source: {
        type: 'select',
        label: 'Efficiency Data Source',
        description: 'Data source for efficiency calculation',
        options: DATA_SOURCE_OPTIONS,
        defaultValue: DEFAULT_VALUES.efficiency_data_source,
        dependsOn: {
          parameter: 'efficiency_objective_enabled',
          value: true,
        },
      },
    },
  },
  stability_objective: {
    label: 'Stability Objective',
    parameters: {
      stability_objective_enabled: {
        type: 'boolean',
        label: 'Stability Objective',
        description: 'Optimize for voltage stability',
        defaultValue: DEFAULT_VALUES.stability_objective_enabled,
        dependsOn: {
          parameter: 'objectives_enabled',
          value: true,
        },
      },
      stability_objective_type: {
        type: 'select',
        label: 'Stability Type',
        description: 'Maximize or minimize stability',
        options: OBJECTIVE_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.stability_objective_type,
        dependsOn: {
          parameter: 'stability_objective_enabled',
          value: true,
        },
      },
      stability_objective_weight: {
        type: 'number',
        label: 'Stability Weight',
        description: 'Relative importance of stability objective',
        defaultValue: DEFAULT_VALUES.stability_objective_weight,
        min: 0.0,
        max: 1.0,
        step: 0.1,
        dependsOn: {
          parameter: 'stability_objective_enabled',
          value: true,
        },
      },
      stability_extraction_method: {
        type: 'select',
        label: 'Stability Extraction',
        description: 'Method to extract stability from data',
        options: EXTRACTION_METHOD_OPTIONS,
        defaultValue: DEFAULT_VALUES.stability_extraction_method,
        dependsOn: {
          parameter: 'stability_objective_enabled',
          value: true,
        },
      },
      stability_data_source: {
        type: 'select',
        label: 'Stability Data Source',
        description: 'Data source for stability calculation',
        options: DATA_SOURCE_OPTIONS,
        defaultValue: DEFAULT_VALUES.stability_data_source,
        dependsOn: {
          parameter: 'stability_objective_enabled',
          value: true,
        },
      },
      stability_data_column: {
        type: 'string',
        label: 'Stability Data Column',
        description: 'Column name for stability calculation',
        defaultValue: DEFAULT_VALUES.stability_data_column,
        dependsOn: {
          parameter: 'stability_objective_enabled',
          value: true,
        },
      },
    },
  },
  optimization_strategy: {
    label: 'Optimization Strategy',
    parameters: {
      initial_strategy: {
        type: 'select',
        label: 'Initial Strategy',
        description: 'Strategy for initial experiment selection',
        options: INITIAL_STRATEGY_OPTIONS,
        defaultValue: DEFAULT_VALUES.initial_strategy,
        required: true,
      },
      initial_samples: {
        type: 'number',
        label: 'Initial Samples',
        description: 'Number of initial experiments before optimization',
        defaultValue: DEFAULT_VALUES.initial_samples,
        min: 1,
        max: 50,
        step: 1,
        required: true,
      },
      max_iterations: {
        type: 'number',
        label: 'Max Iterations',
        description: 'Maximum number of optimization iterations',
        defaultValue: DEFAULT_VALUES.max_iterations,
        min: 1,
        max: 1000,
        step: 1,
        required: true,
      },
      batch_size: {
        type: 'number',
        label: 'Batch Size',
        description: 'Number of experiments to propose per iteration',
        defaultValue: DEFAULT_VALUES.batch_size,
        min: 1,
        max: 10,
        step: 1,
        required: true,
      },
      convergence_threshold: {
        type: 'number',
        label: 'Convergence Threshold',
        description: 'Threshold for optimization convergence',
        defaultValue: DEFAULT_VALUES.convergence_threshold,
        min: 0.001,
        max: 0.1,
        step: 0.001,
        required: true,
      },
      exploration_weight: {
        type: 'number',
        label: 'Exploration Weight',
        description: 'Balance between exploration and exploitation',
        defaultValue: DEFAULT_VALUES.exploration_weight,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        required: true,
      },
    },
  },
  data_management: {
    label: 'Data Management',
    parameters: {
      experiment_history_file: {
        type: 'string',
        label: 'Experiment History File',
        description: 'File to store experiment history',
        defaultValue: DEFAULT_VALUES.experiment_history_file,
        required: true,
      },
      parameter_proposals_file: {
        type: 'string',
        label: 'Parameter Proposals File',
        description: 'File to store parameter proposals',
        defaultValue: DEFAULT_VALUES.parameter_proposals_file,
        required: true,
      },
      results_update_file: {
        type: 'string',
        label: 'Results Update File',
        description: 'File to store optimization results',
        defaultValue: DEFAULT_VALUES.results_update_file,
        required: true,
      },
      backup_frequency: {
        type: 'number',
        label: 'Backup Frequency',
        description: 'Backup optimization state every N iterations',
        defaultValue: DEFAULT_VALUES.backup_frequency,
        min: 1,
        max: 100,
        step: 1,
        required: true,
      },
    },
  },
  advanced_features: {
    label: 'Advanced Features',
    parameters: {
      constraint_handling: {
        type: 'boolean',
        label: 'Constraint Handling',
        description: 'Enable constraint handling for optimization',
        defaultValue: DEFAULT_VALUES.constraint_handling,
      },
      max_additives_constraint: {
        type: 'number',
        label: 'Max Additives',
        description: 'Maximum number of additives allowed',
        defaultValue: DEFAULT_VALUES.max_additives_constraint,
        min: 1,
        max: 7,
        step: 1,
        dependsOn: {
          parameter: 'constraint_handling',
          value: true,
        },
      },
      min_additives_constraint: {
        type: 'number',
        label: 'Min Additives',
        description: 'Minimum number of additives required',
        defaultValue: DEFAULT_VALUES.min_additives_constraint,
        min: 0,
        max: 7,
        step: 1,
        dependsOn: {
          parameter: 'constraint_handling',
          value: true,
        },
      },
      multi_fidelity: {
        type: 'boolean',
        label: 'Multi-Fidelity',
        description: 'Enable multi-fidelity optimization',
        defaultValue: DEFAULT_VALUES.multi_fidelity,
      },
      uncertainty_quantification: {
        type: 'boolean',
        label: 'Uncertainty Quantification',
        description: 'Enable uncertainty quantification',
        defaultValue: DEFAULT_VALUES.uncertainty_quantification,
      },
      expected_improvement_threshold: {
        type: 'number',
        label: 'EI Threshold',
        description: 'Expected improvement threshold for convergence',
        defaultValue: DEFAULT_VALUES.expected_improvement_threshold,
        min: 0.0001,
        max: 0.01,
        step: 0.0001,
        dependsOn: {
          parameter: 'uncertainty_quantification',
          value: true,
        },
      },
    },
  },
  workflow_integration: {
    label: 'Workflow Integration',
    parameters: {
      trigger_experiment_on_proposal: {
        type: 'boolean',
        label: 'Trigger Experiments',
        description: 'Automatically trigger experiments when proposals are ready',
        defaultValue: DEFAULT_VALUES.trigger_experiment_on_proposal,
      },
      wait_for_experiment_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for experiment completion before next iteration',
        defaultValue: DEFAULT_VALUES.wait_for_experiment_completion,
        dependsOn: {
          parameter: 'trigger_experiment_on_proposal',
          value: true,
        },
      },
      auto_extract_objectives: {
        type: 'boolean',
        label: 'Auto Extract Objectives',
        description: 'Automatically extract objectives from experiment data',
        defaultValue: DEFAULT_VALUES.auto_extract_objectives,
      },
      real_time_model_update: {
        type: 'boolean',
        label: 'Real-time Model Update',
        description: 'Update optimization model in real-time as data arrives',
        defaultValue: DEFAULT_VALUES.real_time_model_update,
      },
    },
  },
  data_collection: {
    label: 'Data Collection Settings',
    parameters: {
      data_collection_enabled: {
        type: 'boolean',
        label: 'Data Collection Enabled',
        description: 'Enable data collection for this operation',
        defaultValue: DEFAULT_VALUES.data_collection_enabled,
      },
      cycle_dependent_collection: {
        type: 'boolean',
        label: 'Cycle Dependent Collection',
        description: 'Data collection depends on current cycle number',
        defaultValue: DEFAULT_VALUES.cycle_dependent_collection,
      },
      data_tag: {
        type: 'string',
        label: 'Data Tag/Label',
        description: 'Tag for identifying this data in analysis',
        defaultValue: DEFAULT_VALUES.data_tag,
        required: true,
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'initialize_blox_optimizer',
  'load_experiment_history',
  'generate_parameter_proposals',
  'update_surrogate_model',
  'extract_objectives_from_data',
  'check_convergence_criteria',
  'save_optimization_state',
  'export_pareto_front',
];
