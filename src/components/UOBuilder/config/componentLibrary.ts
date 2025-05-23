/**
 * Standardized UO Parameter Module Library Configuration
 */

import { ComponentLibraryItem, ComponentType } from '../types';

export const COMPONENT_LIBRARY: ComponentLibraryItem[] = [
  // 基础参数类型 - Basic Parameter Types
  {
    type: 'VOLUME_INPUT',
    label: 'Volume Parameter',
    description: 'Volume input with mL/μL units (e.g., Metal Salt Volume)',
    icon: '🧪',
    category: 'basic',
    defaultProps: {
      type: 'VOLUME_INPUT',
      label: 'Volume',
      required: true,
      min: 0,
      max: 1000,
      step: 0.1,
      defaultValue: 1,
      unit: 'mL',
      unitOptions: ['mL', 'μL', 'L'],
      tooltip: 'Volume of solution'
    }
  },
  {
    type: 'CONCENTRATION_INPUT',
    label: 'Concentration Parameter',
    description: 'Concentration input with mM/μM units (e.g., Metal Salt Concentration)',
    icon: '⚗️',
    category: 'basic',
    defaultProps: {
      type: 'CONCENTRATION_INPUT',
      label: 'Concentration',
      required: true,
      min: 0,
      max: 1000,
      step: 0.01,
      defaultValue: 10,
      unit: 'mM',
      unitOptions: ['mM', 'μM', 'nM', 'M', 'mg/mL', '%'],
      tooltip: 'Concentration of solution'
    }
  },
  {
    type: 'MATERIAL_SELECT',
    label: 'Material Selection',
    description: 'Select material type (e.g., Metal Salt Type, Ligand Type)',
    icon: '🔬',
    category: 'basic',
    defaultProps: {
      type: 'MATERIAL_SELECT',
      label: 'Material Type',
      required: true,
      options: ['Cu', 'Fe', 'Zn', 'Ni'],
      defaultValue: 'Cu',
      allowCustomInput: true,
      tooltip: 'Select the material type'
    }
  },
  {
    type: 'TIME_INPUT',
    label: 'Time Parameter',
    description: 'Time input with s/min/h units (e.g., Mixing Time)',
    icon: '⏱️',
    category: 'basic',
    defaultProps: {
      type: 'TIME_INPUT',
      label: 'Time',
      required: true,
      min: 0,
      max: 3600,
      step: 1,
      defaultValue: 30,
      unit: 's',
      unitOptions: ['s', 'min', 'h'],
      tooltip: 'Duration in time units'
    }
  },
  {
    type: 'TEMPERATURE_INPUT',
    label: 'Temperature Parameter',
    description: 'Temperature input with °C/K units (e.g., Reaction Temperature)',
    icon: '🌡️',
    category: 'basic',
    defaultProps: {
      type: 'TEMPERATURE_INPUT',
      label: 'Temperature',
      required: true,
      min: -273,
      max: 1000,
      step: 0.1,
      defaultValue: 25,
      unit: '°C',
      unitOptions: ['°C', 'K', '°F'],
      tooltip: 'Temperature value'
    }
  },

  // 设备参数类型 - Equipment Parameter Types
  {
    type: 'CONTAINER_SELECT',
    label: 'Container Selection',
    description: 'Select container type (e.g., Output Destination)',
    icon: '🥤',
    category: 'equipment',
    defaultProps: {
      type: 'CONTAINER_SELECT',
      label: 'Container',
      required: true,
      options: ['Mixing Container', 'Storage Vial', 'Reaction Tube', 'Collection Plate'],
      defaultValue: 'Mixing Container',
      allowCustomInput: false,
      tooltip: 'Select destination container'
    }
  },
  {
    type: 'BUFFER_SELECT',
    label: 'Buffer Selection',
    description: 'Select buffer type (e.g., Buffer Type)',
    icon: '🧴',
    category: 'equipment',
    defaultProps: {
      type: 'BUFFER_SELECT',
      label: 'Buffer Type',
      required: true,
      options: ['Buffer1', 'Buffer2', 'PBS', 'HEPES', 'Tris'],
      defaultValue: 'Buffer1',
      allowCustomInput: true,
      tooltip: 'Select buffer solution'
    }
  },

  // 控制参数类型 - Control Parameter Types
  {
    type: 'ENABLE_TOGGLE',
    label: 'Enable/Disable Toggle',
    description: 'Enable or disable a feature (e.g., Enable Heating)',
    icon: '🔘',
    category: 'control',
    defaultProps: {
      type: 'ENABLE_TOGGLE',
      label: 'Enable Feature',
      required: false,
      defaultValue: false,
      tooltip: 'Enable or disable this feature'
    }
  },
  {
    type: 'FILE_OPERATIONS',
    label: 'Import/Export Files',
    description: 'Import or export configuration files',
    icon: '📁',
    category: 'control',
    defaultProps: {
      type: 'FILE_OPERATIONS',
      label: 'Configuration',
      required: false,
      allowImport: true,
      allowExport: true,
      fileTypes: ['.json', '.csv'],
      tooltip: 'Import or export configuration'
    }
  },
  {
    type: 'TEXT_NOTE',
    label: 'Text Note',
    description: 'Add notes or comments (e.g., Procedure Notes)',
    icon: '📝',
    category: 'control',
    defaultProps: {
      type: 'TEXT_NOTE',
      label: 'Notes',
      required: false,
      placeholder: 'Enter notes or comments...',
      maxLength: 500,
      rows: 3,
      tooltip: 'Additional notes or comments'
    }
  }
];

// Component categories for organization
export const COMPONENT_CATEGORIES = {
  basic: {
    label: 'Basic Parameters',
    description: 'Essential experimental parameters (volume, concentration, material, time, temperature)',
    icon: '🧪',
    color: '#2196F3'
  },
  equipment: {
    label: 'Equipment Parameters',
    description: 'Equipment and container selection parameters',
    icon: '🔬',
    color: '#FF9800'
  },
  control: {
    label: 'Control Parameters',
    description: 'Control switches, file operations, and notes',
    icon: '⚙️',
    color: '#4CAF50'
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
