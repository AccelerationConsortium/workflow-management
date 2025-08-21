// DeckPlanner Constants and Configuration
import { ParameterGroup } from '../SDL1/types';

// ============= Node Configuration =============

export const DECK_PLANNER_NODE_TYPE = 'deckPlanner' as const;

export const DECK_PLANNER_DISPLAY_NAME = 'Deck Planner';

export const DECK_PLANNER_DESCRIPTION = 'Intelligent deck layout planning with role-based labware assignment';

export const DECK_PLANNER_CATEGORY = 'Planning';

// ============= Parameter Definitions =============

export const DECK_PLANNER_PARAMETERS: Record<string, ParameterGroup> = {
  protocol: {
    label: 'Protocol Information',
    parameters: {
      protocol_name: {
        type: 'string',
        label: 'Protocol Name',
        description: 'Name of the experimental protocol',
        defaultValue: 'New Protocol',
        required: true
      },
      protocol_description: {
        type: 'string',
        label: 'Description',
        description: 'Brief description of the protocol',
        defaultValue: ''
      },
      template: {
        type: 'select',
        label: 'Template',
        description: 'Pre-configured template for common protocols',
        defaultValue: 'custom',
        options: [
          { value: 'custom', label: 'Custom' },
          { value: 'PCR', label: 'PCR' },
          { value: 'ELISA', label: 'ELISA' },
          { value: 'NGS_prep', label: 'NGS Prep' },
          { value: 'cell_culture', label: 'Cell Culture' },
          { value: 'protein_purification', label: 'Protein Purification' }
        ]
      }
    }
  },
  
  optimization: {
    label: 'Optimization Settings',
    parameters: {
      priority: {
        type: 'select',
        label: 'Optimization Priority',
        description: 'Primary optimization objective',
        defaultValue: 'minimize_moves',
        options: [
          { value: 'minimize_moves', label: 'Minimize Movements' },
          { value: 'maximize_throughput', label: 'Maximize Throughput' },
          { value: 'minimize_tips', label: 'Minimize Tip Usage' },
          { value: 'minimize_time', label: 'Minimize Time' },
          { value: 'minimize_contamination_risk', label: 'Minimize Contamination' }
        ]
      },
      solver_strategy: {
        type: 'select',
        label: 'Solver Strategy',
        description: 'Algorithm for placement optimization',
        defaultValue: 'greedy',
        options: [
          { value: 'greedy', label: 'Greedy (Fast)' },
          { value: 'simulated_annealing', label: 'Simulated Annealing' },
          { value: 'ilp', label: 'ILP (Optimal)' },
          { value: 'genetic_algorithm', label: 'Genetic Algorithm' }
        ]
      },
      enable_validation: {
        type: 'boolean',
        label: 'Enable Validation',
        description: 'Perform comprehensive validation checks',
        defaultValue: true
      },
      enable_visualization: {
        type: 'boolean',
        label: 'Enable Visualization',
        description: 'Generate deck layout visualization',
        defaultValue: true
      }
    }
  },
  
  constraints: {
    label: 'Global Constraints',
    parameters: {
      max_execution_time: {
        type: 'number',
        label: 'Max Execution Time (seconds)',
        description: 'Maximum allowed execution time for the protocol',
        min: 60,
        max: 7200,
        step: 60,
        unit: 's'
      },
      max_tip_usage: {
        type: 'number',
        label: 'Max Tip Usage',
        description: 'Maximum number of tips to be used',
        min: 1,
        max: 1000,
        step: 1,
        unit: 'tips'
      },
      min_separation_distance: {
        type: 'number',
        label: 'Min Separation Distance (mm)',
        description: 'Minimum separation distance between incompatible items',
        min: 0,
        max: 200,
        step: 5,
        unit: 'mm',
        defaultValue: 50
      }
    }
  }
};

// ============= Default Values =============

export const DECK_PLANNER_DEFAULT_VALUES = {
  protocol_name: 'New Protocol',
  protocol_description: '',
  template: 'custom',
  priority: 'minimize_moves',
  solver_strategy: 'greedy',
  enable_validation: true,
  enable_visualization: true,
  min_separation_distance: 50
};

// ============= Capability Options =============

export const CAPABILITY_OPTIONS = [
  { value: 'hold_liquid', label: 'Hold Liquid' },
  { value: 'hold_solid', label: 'Hold Solid' },
  { value: 'temperature_control', label: 'Temperature Control' },
  { value: 'heating', label: 'Heating' },
  { value: 'cooling', label: 'Cooling' },
  { value: 'mixing', label: 'Mixing' },
  { value: 'shaking', label: 'Shaking' },
  { value: 'magnetic', label: 'Magnetic' },
  { value: 'multi_channel_accessible', label: 'Multi-Channel Accessible' },
  { value: 'single_channel_accessible', label: 'Single-Channel Accessible' },
  { value: 'tip_rack', label: 'Tip Rack' },
  { value: 'filter_tips', label: 'Filter Tips' },
  { value: 'waste', label: 'Waste Container' },
  { value: 'reagent_reservoir', label: 'Reagent Reservoir' },
  { value: '96_well_compatible', label: '96-Well Compatible' },
  { value: '384_well_compatible', label: '384-Well Compatible' },
  { value: 'large_volume', label: 'Large Volume' }
];

// ============= Template Definitions =============

export const PROTOCOL_TEMPLATES = {
  PCR: {
    name: 'PCR Protocol',
    description: 'Polymerase Chain Reaction setup with temperature control',
    defaultRoles: {
      'dna_samples': {
        description: 'DNA template samples',
        capabilities: ['hold_liquid', 'temperature_control'],
        constraints: { temperature: { min: -20, max: 4 } }
      },
      'pcr_plate': {
        description: 'PCR reaction plate',
        capabilities: ['hold_liquid', '96_well_compatible', 'temperature_control']
      },
      'master_mix': {
        description: 'PCR master mix',
        capabilities: ['hold_liquid', 'reagent_reservoir'],
        constraints: { temperature: { min: -20, max: 4 } }
      },
      'tips_20ul': {
        description: '20µL tips for precise pipetting',
        capabilities: ['tip_rack']
      }
    }
  },
  
  ELISA: {
    name: 'ELISA Assay',
    description: 'Enzyme-Linked Immunosorbent Assay with washing',
    defaultRoles: {
      'sample_plate': {
        description: 'Sample plate',
        capabilities: ['hold_liquid', '96_well_compatible']
      },
      'reagents': {
        description: 'ELISA reagents',
        capabilities: ['reagent_reservoir', 'multi_channel_accessible']
      },
      'wash_buffer': {
        description: 'Wash buffer',
        capabilities: ['large_volume', 'reagent_reservoir']
      },
      'waste': {
        description: 'Liquid waste',
        capabilities: ['waste', 'large_volume'],
        constraints: { isolated: true }
      },
      'tips_300ul': {
        description: '300µL filter tips',
        capabilities: ['tip_rack', 'filter_tips']
      }
    }
  },
  
  NGS_prep: {
    name: 'NGS Library Preparation',
    description: 'Next-generation sequencing sample preparation',
    defaultRoles: {
      'dna_samples': {
        description: 'DNA samples',
        capabilities: ['hold_liquid'],
        constraints: { temperature: { min: -20, max: 4 } }
      },
      'reagent_plate': {
        description: 'NGS reagents',
        capabilities: ['hold_liquid', '96_well_compatible']
      },
      'mag_beads': {
        description: 'Magnetic beads',
        capabilities: ['hold_liquid', 'magnetic']
      },
      'ethanol': {
        description: 'Ethanol wash',
        capabilities: ['reagent_reservoir', 'large_volume']
      }
    }
  },
  
  cell_culture: {
    name: 'Cell Culture',
    description: 'Cell culture maintenance and assays',
    defaultRoles: {
      'culture_plate': {
        description: 'Cell culture plate',
        capabilities: ['hold_liquid', '96_well_compatible', 'temperature_control'],
        constraints: { temperature: { min: 35, max: 39 } }
      },
      'media': {
        description: 'Culture media',
        capabilities: ['reagent_reservoir', 'large_volume'],
        constraints: { temperature: { min: 35, max: 39 } }
      },
      'compounds': {
        description: 'Test compounds',
        capabilities: ['hold_liquid', '96_well_compatible']
      }
    }
  }
};

// ============= Validation Thresholds =============

export const VALIDATION_THRESHOLDS = {
  COLLISION_CLEARANCE: 5,       // mm
  PIPETTE_CLEARANCE: 20,        // mm
  MAX_HEIGHT: 150,              // mm
  COOLING_AIRFLOW: 30,          // mm around temperature modules
  CONTAMINATION_DISTANCE: 200,  // mm minimum separation
  DECK_UTILIZATION_WARNING: 90, // %
  MOVEMENT_EFFICIENCY_MIN: 0.6  // 0-1 score
};

// ============= Deck Layout Constants =============

export const OT2_DECK_CONFIG = {
  SLOT_COUNT: 11,
  DECK_SIZE: { x: 365, y: 273, z: 150 }, // mm
  SLOT_SIZE: { x: 127.76, y: 85.48 },    // mm
  
  SLOT_POSITIONS: {
    1: { x: 13.3, y: 181.3, z: 0 },
    2: { x: 146.3, y: 181.3, z: 0 },
    3: { x: 279.3, y: 181.3, z: 0 },
    4: { x: 13.3, y: 90.3, z: 0 },
    5: { x: 146.3, y: 90.3, z: 0 },
    6: { x: 279.3, y: 90.3, z: 0 },
    7: { x: 13.3, y: -0.7, z: 0 },
    8: { x: 146.3, y: -0.7, z: 0 },
    9: { x: 279.3, y: -0.7, z: 0 },
    10: { x: 13.3, y: -91.7, z: 0 },
    11: { x: 146.3, y: -91.7, z: 0 }
  },
  
  ADJACENCY_MAP: {
    1: [2, 4],
    2: [1, 3, 5],
    3: [2, 6],
    4: [1, 5, 7],
    5: [2, 4, 6, 8],
    6: [3, 5, 9],
    7: [4, 8, 10],
    8: [5, 7, 9, 11],
    9: [6, 8],
    10: [7, 11],
    11: [8, 10]
  },
  
  PIPETTE_REACH: {
    left: [1, 2, 3, 4, 5, 6],
    right: [5, 6, 7, 8, 9, 10, 11]
  }
};

// ============= Color Themes =============

export const DECK_PLANNER_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  roles: {
    samples: '#4caf50',
    reagents: '#2196f3', 
    waste: '#f44336',
    tips: '#ff9800',
    modules: '#9c27b0'
  },
  
  validation: {
    valid: '#4caf50',
    warning: '#ff9800',
    error: '#f44336'
  }
};

// ============= Performance Limits =============

export const PERFORMANCE_LIMITS = {
  MAX_ROLES: 20,              // Maximum roles per protocol
  MAX_CONSTRAINTS: 50,        // Maximum constraint rules
  MAX_PLANNING_TIME: 30000,   // 30 seconds
  MAX_VALIDATION_TIME: 5000,  // 5 seconds
  CACHE_SIZE: 100,            // Max cached binding maps
  CACHE_TTL: 3600000         // 1 hour in ms
};