import { ParameterDefinition } from '../types';

export const CLEANING_AGENTS = ['Deionized Water', 'Ethanol', 'Acetone', 'Dilute HCl'];
export const CLEANING_TARGETS = ['Electrochemical Cell', 'Mixing Container', 'Entire System'];

export const DEFAULT_VALUES = {
  cleaningAgent: 'Deionized Water',
  cleaningVolume: 10.0,
  cleaningCycles: 3,
  flowRate: 2.0,
  dryingTime: 60,
  cleaningTarget: 'Entire System'
};

export const PARAMETERS: Record<string, ParameterDefinition> = {
  cleaningAgent: {
    type: 'select',
    label: 'Cleaning Agent',
    description: 'Solution used for cleaning',
    required: true,
    options: CLEANING_AGENTS,
    defaultValue: DEFAULT_VALUES.cleaningAgent
  },
  cleaningVolume: {
    type: 'number',
    label: 'Cleaning Volume',
    unit: 'mL',
    description: 'Volume of cleaning solution',
    min: 1.0,
    max: 50.0,
    defaultValue: DEFAULT_VALUES.cleaningVolume,
    required: true
  },
  cleaningCycles: {
    type: 'number',
    label: 'Cleaning Cycles',
    description: 'Number of cleaning repetitions',
    min: 1,
    max: 10,
    defaultValue: DEFAULT_VALUES.cleaningCycles,
    required: true
  },
  flowRate: {
    type: 'number',
    label: 'Flow Rate',
    unit: 'mL/min',
    description: 'Flow rate of cleaning solution',
    min: 0.1,
    max: 10.0,
    defaultValue: DEFAULT_VALUES.flowRate,
    required: true
  },
  dryingTime: {
    type: 'number',
    label: 'Drying Time',
    unit: 's',
    description: 'Time for drying after cleaning',
    min: 0,
    max: 300,
    defaultValue: DEFAULT_VALUES.dryingTime,
    required: false
  },
  cleaningTarget: {
    type: 'select',
    label: 'Cleaning Target',
    description: 'Part of the system to clean',
    required: true,
    options: CLEANING_TARGETS,
    defaultValue: DEFAULT_VALUES.cleaningTarget
  }
};
