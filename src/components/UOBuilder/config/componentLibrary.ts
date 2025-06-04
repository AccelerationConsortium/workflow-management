/**
 * Standardized UO Parameter Module Library Configuration
 */

import { ComponentLibraryItem, ComponentType } from '../types';

export const COMPONENT_LIBRARY: ComponentLibraryItem[] = [
  // 基础参数类型 - Basic Parameter Types
  {
    type: 'VOLUME_INPUT',
    label: 'Volume Parameter',
    description: 'Volume input with unit selection (mL, μL, L)',
    icon: '🧪',
    category: 'basic',
    useCase: 'Set reaction volume, transfer volume',
    defaultProps: {
      type: 'VOLUME_INPUT',
      label: 'Volume',
      required: true,
      defaultValue: 1.0,
      min: 0,
      max: 100,
      step: 0.1,
      unit: 'mL',
      tooltip: 'Enter volume value'
    }
  },
  {
    type: 'CONCENTRATION_INPUT',
    label: 'Concentration Parameter',
    description: 'Concentration input with unit selection (mM, μM, M, mg/mL)',
    icon: '⚗️',
    category: 'basic',
    useCase: 'Set solution concentration, buffer concentration',
    defaultProps: {
      type: 'CONCENTRATION_INPUT',
      label: 'Concentration',
      required: true,
      defaultValue: 10.0,
      min: 0,
      max: 1000,
      step: 0.1,
      unit: 'mM',
      tooltip: 'Enter concentration value'
    }
  },
  {
    type: 'TIME_INPUT',
    label: 'Time Parameter',
    description: 'Time input with unit selection (s, min, h)',
    icon: '⏱️',
    category: 'basic',
    useCase: 'Set reaction time, mixing time, delay time',
    defaultProps: {
      type: 'TIME_INPUT',
      label: 'Time',
      required: true,
      defaultValue: 30,
      min: 0,
      max: 3600,
      step: 1,
      unit: 's',
      tooltip: 'Enter time value'
    }
  },
  {
    type: 'TEMPERATURE_INPUT',
    label: 'Temperature Parameter',
    description: 'Temperature input with unit selection (°C, K, °F)',
    icon: '🌡️',
    category: 'basic',
    useCase: 'Set reaction temperature, heating temperature',
    defaultProps: {
      type: 'TEMPERATURE_INPUT',
      label: 'Temperature',
      required: true,
      defaultValue: 25,
      min: -50,
      max: 200,
      step: 0.1,
      unit: '°C',
      tooltip: 'Enter temperature value'
    }
  },
  {
    type: 'MATERIAL_SELECT',
    label: 'Material Selection',
    description: 'Select from predefined material options',
    icon: '🔬',
    category: 'basic',
    useCase: 'Select metal salt, ligand, catalyst',
    defaultProps: {
      type: 'MATERIAL_SELECT',
      label: 'Material',
      required: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
      defaultValue: 'Option 1',
      tooltip: 'Select material type'
    }
  },
  {
    type: 'CONTAINER_SELECT',
    label: 'Container Selection',
    description: 'Select from available containers',
    icon: '🥤',
    category: 'basic',
    useCase: 'Select reaction vessel, storage container',
    defaultProps: {
      type: 'CONTAINER_SELECT',
      label: 'Container',
      required: true,
      options: ['Container 1', 'Container 2', 'Container 3'],
      defaultValue: 'Container 1',
      tooltip: 'Select container type'
    }
  },
  {
    type: 'BUFFER_SELECT',
    label: 'Buffer Selection',
    description: 'Select from available buffer solutions',
    icon: '🧴',
    category: 'basic',
    useCase: 'Select buffer type for reaction',
    defaultProps: {
      type: 'BUFFER_SELECT',
      label: 'Buffer',
      required: true,
      options: ['Buffer 1', 'Buffer 2', 'PBS', 'HEPES'],
      defaultValue: 'Buffer 1',
      tooltip: 'Select buffer type'
    }
  },
  {
    type: 'ENABLE_TOGGLE',
    label: 'Enable/Disable Toggle',
    description: 'Boolean toggle for enable/disable options',
    icon: '🔘',
    category: 'basic',
    useCase: 'Enable mixing, enable heating, enable monitoring',
    defaultProps: {
      type: 'ENABLE_TOGGLE',
      label: 'Enable Feature',
      required: false,
      defaultValue: false,
      tooltip: 'Enable or disable this feature'
    }
  },
  {
    type: 'TEXT_NOTE',
    label: 'Text Note',
    description: 'Text input for notes and descriptions',
    icon: '📝',
    category: 'basic',
    useCase: 'Add experiment notes, procedure description',
    defaultProps: {
      type: 'TEXT_NOTE',
      label: 'Note',
      required: false,
      defaultValue: '',
      maxLength: 255,
      tooltip: 'Enter text note'
    }
  },

  // 核心功能模块 - Core Functional Modules
  {
    type: 'DEVICE_INITIALIZATION',
    label: 'Device Initialization',
    description: 'Initialize one or multiple lab instruments before workflow begins',
    icon: '🧪',
    category: 'control',
    useCase: 'Initialize photoreactor, robot arm, cytation reader',
    defaultProps: {
      type: 'DEVICE_INITIALIZATION',
      label: 'Device Initialization',
      required: true,
      device_id: 'cytation5',
      device_type: 'cytation',
      init_mode: 'soft',
      timeout_s: 30,
      retry_count: 2,
      tooltip: 'Initialize lab instruments before workflow begins'
    }
  },
  {
    type: 'USER_CONFIRMATION',
    label: 'User Confirmation Prompt',
    description: 'Ask user to confirm a physical setup step before proceeding',
    icon: '✅',
    category: 'control',
    useCase: 'Have you placed the vials on the rack?',
    defaultProps: {
      type: 'USER_CONFIRMATION',
      label: 'User Confirmation',
      required: true,
      prompt_text: 'Confirm vial placement',
      expected_response: 'yes',
      timeout_s: 120,
      abort_on_timeout: true,
      tooltip: 'Ask user to confirm a physical setup step'
    }
  },
  {
    type: 'LIQUID_TRANSFER',
    label: 'Liquid Transfer',
    description: 'Transfer a specified volume from a source to a target container',
    icon: '🔁',
    category: 'equipment',
    useCase: 'Transfer 0.5 mL from stock A to reactor tube',
    defaultProps: {
      type: 'LIQUID_TRANSFER',
      label: 'Liquid Transfer',
      required: true,
      source_container: 'stock_A',
      target_container: 'reactor_tube',
      volume_ml: 0.5,
      speed_ul_per_s: 300,
      pipette_type: 'single',
      mix_after: true,
      tooltip: 'Transfer liquid between containers'
    }
  },
  {
    type: 'START_REACTION',
    label: 'Start Reaction',
    description: 'Activate a device to start a chemical or biological reaction',
    icon: '🔆',
    category: 'equipment',
    useCase: 'Start photoreactor after transfer',
    defaultProps: {
      type: 'START_REACTION',
      label: 'Start Reaction',
      required: true,
      device_id: 'photoreactor_1',
      mode: 'UV-A 365nm',
      duration_s: 300,
      intensity_pct: 80,
      tooltip: 'Activate device to start reaction'
    }
  },
  {
    type: 'TRIGGER_MEASUREMENT',
    label: 'Trigger Measurement',
    description: 'Trigger a device to measure sample or system status',
    icon: '📏',
    category: 'equipment',
    useCase: 'Trigger a read on the Cytation5',
    defaultProps: {
      type: 'TRIGGER_MEASUREMENT',
      label: 'Trigger Measurement',
      required: true,
      device_id: 'cytation5',
      measurement_type: 'OD600',
      wavelength_nm: 600,
      integration_time_ms: 500,
      export_format: 'csv',
      save_to: 'results/exp001_cytation.csv',
      tooltip: 'Trigger device to measure sample'
    }
  },
  {
    type: 'PAUSE_DELAY',
    label: 'Pause / Delay Step',
    description: 'Pause the workflow execution for a fixed duration',
    icon: '⏸️',
    category: 'control',
    useCase: 'Wait 5 minutes after mixing before measurement',
    defaultProps: {
      type: 'PAUSE_DELAY',
      label: 'Pause / Delay',
      required: true,
      duration_s: 300,
      reason: 'Allow reaction to settle',
      skippable: true,
      tooltip: 'Pause workflow for fixed duration'
    }
  },

  // 新增的4个组件 - Additional 4 Components for Flexibility
  {
    type: 'DEVICE_SELECTOR',
    label: 'Device Selector',
    description: 'Select specific device for operation',
    icon: '🔧',
    category: 'equipment',
    useCase: 'Select photoreactor_1 for UV reaction',
    defaultProps: {
      type: 'DEVICE_SELECTOR',
      label: 'Device Selection',
      required: true,
      device_id: 'photoreactor_1',
      device_type: 'photoreactor',
      tooltip: 'Select device for this operation'
    }
  },
  {
    type: 'BOOLEAN_INPUT',
    label: 'Boolean Input',
    description: 'Boolean parameter for yes/no, enable/disable options',
    icon: '✓',
    category: 'basic',
    useCase: 'Enable mixing after transfer',
    defaultProps: {
      type: 'BOOLEAN_INPUT',
      label: 'Enable Feature',
      required: false,
      default: false,
      tooltip: 'Boolean parameter for enable/disable'
    }
  },
  {
    type: 'ENUM_SELECTOR',
    label: 'Enum Selector',
    description: 'Select from predefined options (modes, methods, types)',
    icon: '📋',
    category: 'basic',
    useCase: 'Select heating mode or light wavelength',
    defaultProps: {
      type: 'ENUM_SELECTOR',
      label: 'Selection',
      required: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
      default: 'Option 1',
      tooltip: 'Select from available options'
    }
  },
  {
    type: 'REPEAT_CONTROL',
    label: 'Repeat/Loop Control',
    description: 'Control repetition of operations with delay',
    icon: '🔄',
    category: 'control',
    useCase: 'Mix 10 times with 2 second delay between',
    defaultProps: {
      type: 'REPEAT_CONTROL',
      label: 'Repeat Control',
      required: true,
      repeat_times: 10,
      delay_between: 2,
      tooltip: 'Control operation repetition'
    }
  },

  // 工作流模块 - Workflow Components for Lab Automation
  {
    type: 'DEVICE_INITIALIZATION',
    label: 'Device Initialization',
    description: 'Initialize one or multiple lab instruments before workflow begins',
    icon: '🧪',
    category: 'workflow',
    defaultProps: {
      type: 'DEVICE_INITIALIZATION',
      label: 'Device Initialization',
      required: false,
      deviceId: 'cytation5',
      deviceType: 'cytation',
      initMode: 'soft',
      timeoutS: 30,
      retryCount: 2,
      tooltip: 'Initialize lab equipment'
    }
  },
  {
    type: 'USER_CONFIRMATION',
    label: 'User Confirmation',
    description: 'Ask user to confirm a physical setup step before proceeding',
    icon: '✅',
    category: 'workflow',
    defaultProps: {
      type: 'USER_CONFIRMATION',
      label: 'User Confirmation',
      required: false,
      promptText: 'Confirm vial placement',
      expectedResponse: 'yes',
      timeoutS: 120,
      abortOnTimeout: true,
      tooltip: 'User confirmation prompt'
    }
  },
  {
    type: 'LIQUID_TRANSFER',
    label: 'Liquid Transfer',
    description: 'Transfer a specified volume from a source to a target container',
    icon: '🔁',
    category: 'workflow',
    defaultProps: {
      type: 'LIQUID_TRANSFER',
      label: 'Liquid Transfer',
      required: false,
      sourceContainer: 'stock_A',
      targetContainer: 'reactor_tube',
      volumeMl: 0.5,
      speedUlPerS: 300,
      pipetteType: 'single',
      mixAfter: true,
      tooltip: 'Transfer liquid between containers'
    }
  },
  {
    type: 'START_REACTION',
    label: 'Start Reaction',
    description: 'Activate a device to start a chemical or biological reaction',
    icon: '🔆',
    category: 'workflow',
    defaultProps: {
      type: 'START_REACTION',
      label: 'Start Reaction',
      required: false,
      deviceId: 'photoreactor_1',
      mode: 'UV-A 365nm',
      durationS: 300,
      intensityPct: 80,
      tooltip: 'Start chemical reaction'
    }
  },
  {
    type: 'TRIGGER_MEASUREMENT',
    label: 'Trigger Measurement',
    description: 'Trigger a device to measure sample or system status',
    icon: '📏',
    category: 'workflow',
    defaultProps: {
      type: 'TRIGGER_MEASUREMENT',
      label: 'Trigger Measurement',
      required: false,
      deviceId: 'cytation5',
      measurementType: 'OD600',
      wavelengthNm: 600,
      integrationTimeMs: 500,
      exportFormat: 'csv',
      saveTo: 'results/exp001_cytation.csv',
      tooltip: 'Trigger device measurement'
    }
  },
  {
    type: 'PAUSE_DELAY',
    label: 'Pause / Delay Step',
    description: 'Pause the workflow execution for a fixed duration',
    icon: '⏸️',
    category: 'workflow',
    defaultProps: {
      type: 'PAUSE_DELAY',
      label: 'Pause / Delay Step',
      required: false,
      durationS: 300,
      reason: 'Allow reaction to settle',
      skippable: true,
      tooltip: 'Pause workflow execution'
    }
  }
];

// Component categories for organization
export const COMPONENT_CATEGORIES = {
  basic: {
    label: 'Basic Parameters',
    description: 'Boolean inputs, enum selectors, and basic parameter types',
    icon: '🧪',
    color: '#2196F3'
  },
  equipment: {
    label: 'Equipment Operations',
    description: 'Device selection, liquid transfer, reaction control, and measurement operations',
    icon: '🔬',
    color: '#FF9800'
  },
  control: {
    label: 'Control Operations',
    description: 'Device initialization, user confirmation, workflow control, and repeat operations',
    icon: '⚙️',
    color: '#4CAF50'
  },
  workflow: {
    label: 'Workflow Components',
    description: 'Lab automation and workflow control components',
    icon: '🔄',
    color: '#9C27B0'
  }
};

// Default UO categories
export const DEFAULT_UO_CATEGORIES = [
  {
    id: 'separation',
    name: 'Separation',
    description: 'Separation and purification operations',
    color: '#FF6B6B',
    icon: '🔬'
  },
  {
    id: 'reaction',
    name: 'Chemical Reaction',
    description: 'Chemical reaction and synthesis operations',
    color: '#4ECDC4',
    icon: '⚗️'
  },
  {
    id: 'mixing',
    name: 'Mixing',
    description: 'Mixing and blending operations',
    color: '#45B7D1',
    icon: '🌀'
  },
  {
    id: 'heating',
    name: 'Heat Transfer',
    description: 'Heating, cooling, and heat exchange operations',
    color: '#F9CA24',
    icon: '🔥'
  },
  {
    id: 'measurement',
    name: 'Measurement',
    description: 'Analysis and measurement operations',
    color: '#6C5CE7',
    icon: '📊'
  },
  {
    id: 'transport',
    name: 'Material Transport',
    description: 'Material handling and transport operations',
    color: '#A0E7E5',
    icon: '🚚'
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Custom user-defined operations',
    color: '#8F7FE8',
    icon: '🛠️'
  }
];

// Grid settings for the builder canvas
export const BUILDER_GRID = {
  size: 20,
  snapToGrid: true,
  showGrid: true,
  gridColor: '#e0e0e0'
};

// Canvas settings
export const CANVAS_SETTINGS = {
  width: 800,
  height: 600,
  backgroundColor: '#fafafa',
  padding: 20
};
