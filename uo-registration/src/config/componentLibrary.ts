/**
 * Component Library Configuration for UO Builder
 */

import { ComponentLibraryItem, ComponentType } from '../types/UOBuilder';

export const COMPONENT_LIBRARY: ComponentLibraryItem[] = [
  {
    type: ComponentType.SELECT,
    label: 'Dropdown Select',
    description: 'Single or multiple selection from predefined options',
    icon: '📋',
    defaultProps: {
      type: ComponentType.SELECT,
      label: 'Select Option',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      multiple: false,
      position: { x: 0, y: 0 }
    }
  },
  {
    type: ComponentType.INPUT,
    label: 'Text Input',
    description: 'Single line text input field',
    icon: '📝',
    defaultProps: {
      type: ComponentType.INPUT,
      label: 'Text Input',
      required: false,
      placeholder: 'Enter text...',
      maxLength: 255,
      position: { x: 0, y: 0 }
    }
  },
  {
    type: ComponentType.NUMBER_INPUT,
    label: 'Number Input',
    description: 'Numeric input with optional unit and range validation',
    icon: '🔢',
    defaultProps: {
      type: ComponentType.NUMBER_INPUT,
      label: 'Number Input',
      required: false,
      min: 0,
      max: 100,
      step: 1,
      unit: '',
      position: { x: 0, y: 0 }
    }
  },
  {
    type: ComponentType.BOOLEAN,
    label: 'Boolean Toggle',
    description: 'True/false toggle switch or checkbox',
    icon: '🔘',
    defaultProps: {
      type: ComponentType.BOOLEAN,
      label: 'Boolean Toggle',
      required: false,
      defaultValue: false,
      position: { x: 0, y: 0 }
    }
  },
  {
    type: ComponentType.DATE_PICKER,
    label: 'Date Picker',
    description: 'Date and time selection component',
    icon: '📅',
    defaultProps: {
      type: ComponentType.DATE_PICKER,
      label: 'Date Picker',
      required: false,
      position: { x: 0, y: 0 }
    }
  },
  {
    type: ComponentType.UNIT_LABEL,
    label: 'Unit Label',
    description: 'Display unit of measurement (mL, mM, °C, etc.)',
    icon: '📏',
    defaultProps: {
      type: ComponentType.UNIT_LABEL,
      label: 'Unit',
      required: false,
      unit: 'mL',
      position: { x: 0, y: 0 }
    }
  },
  {
    type: ComponentType.PARAMETER_NAME,
    label: 'Parameter Name',
    description: 'Editable parameter name label',
    icon: '🏷️',
    defaultProps: {
      type: ComponentType.PARAMETER_NAME,
      label: 'Parameter Name',
      required: false,
      parameterName: 'Parameter',
      editable: true,
      position: { x: 0, y: 0 }
    }
  },
  {
    type: ComponentType.RANGE_SLIDER,
    label: 'Range Slider',
    description: 'Dual-handle slider for min/max range selection',
    icon: '🎚️',
    defaultProps: {
      type: ComponentType.RANGE_SLIDER,
      label: 'Range Slider',
      required: false,
      min: 0,
      max: 100,
      step: 1,
      defaultValue: [20, 80],
      position: { x: 0, y: 0 }
    }
  },
  {
    type: ComponentType.TEXT_AREA,
    label: 'Text Area',
    description: 'Multi-line text input for descriptions and notes',
    icon: '📄',
    defaultProps: {
      type: ComponentType.TEXT_AREA,
      label: 'Text Area',
      required: false,
      placeholder: 'Enter description...',
      rows: 3,
      maxLength: 1000,
      position: { x: 0, y: 0 }
    }
  }
];

// Component categories for organization
export const COMPONENT_CATEGORIES = {
  INPUT: {
    name: 'Input Components',
    description: 'Components for data input',
    components: [
      ComponentType.INPUT,
      ComponentType.NUMBER_INPUT,
      ComponentType.TEXT_AREA,
      ComponentType.DATE_PICKER
    ]
  },
  SELECTION: {
    name: 'Selection Components',
    description: 'Components for option selection',
    components: [
      ComponentType.SELECT,
      ComponentType.BOOLEAN,
      ComponentType.RANGE_SLIDER
    ]
  },
  DISPLAY: {
    name: 'Display Components',
    description: 'Components for information display',
    components: [
      ComponentType.UNIT_LABEL,
      ComponentType.PARAMETER_NAME
    ]
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
    color: '#FD79A8',
    icon: '🛠️'
  }
];

// Validation rules for components
export const VALIDATION_RULES = {
  [ComponentType.SELECT]: {
    required: ['label', 'options'],
    optional: ['defaultValue', 'multiple', 'description']
  },
  [ComponentType.INPUT]: {
    required: ['label'],
    optional: ['placeholder', 'defaultValue', 'maxLength', 'description']
  },
  [ComponentType.NUMBER_INPUT]: {
    required: ['label'],
    optional: ['min', 'max', 'step', 'unit', 'defaultValue', 'description']
  },
  [ComponentType.BOOLEAN]: {
    required: ['label'],
    optional: ['defaultValue', 'description']
  },
  [ComponentType.DATE_PICKER]: {
    required: ['label'],
    optional: ['defaultValue', 'minDate', 'maxDate', 'description']
  },
  [ComponentType.UNIT_LABEL]: {
    required: ['label', 'unit'],
    optional: ['linkedParameterId', 'description']
  },
  [ComponentType.PARAMETER_NAME]: {
    required: ['label', 'parameterName'],
    optional: ['editable', 'description']
  },
  [ComponentType.RANGE_SLIDER]: {
    required: ['label', 'min', 'max'],
    optional: ['step', 'unit', 'defaultValue', 'description']
  },
  [ComponentType.TEXT_AREA]: {
    required: ['label'],
    optional: ['placeholder', 'defaultValue', 'rows', 'maxLength', 'description']
  }
};

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
