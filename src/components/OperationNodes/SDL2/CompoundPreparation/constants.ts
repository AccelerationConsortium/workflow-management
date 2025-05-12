import { ParameterDefinition } from '../types';

export const METAL_OPTIONS = ['Cu', 'Fe', 'Ni', 'Co', 'Zn'];
export const LIGAND_OPTIONS = ['EDTA', 'Bipyridine', 'Phenanthroline', 'Porphyrin'];
export const BUFFER_OPTIONS = ['buffer1', 'buffer2'];
export const DESTINATION_OPTIONS = ['Mixing Container', 'Electrochemical Cell', 'Waste'];

export const DEFAULT_VALUES = {
  metal: 'Cu',
  metalVolume: 1.0,
  metalConcentration: 10.0,
  ligand: 'EDTA',
  ligandVolume: 1.0,
  ligandConcentration: 10.0,
  bufferType: 'buffer1',
  bufferVolume: 5.0,
  mixingTime: 30,
  outputDestination: 'Mixing Container'
};

export const PARAMETERS: Record<string, ParameterDefinition> = {
  metal: {
    type: 'select',
    label: 'Metal Salt Type',
    description: 'Select the metal salt to use',
    required: true,
    options: METAL_OPTIONS,
    defaultValue: DEFAULT_VALUES.metal
  },
  metalVolume: {
    type: 'number',
    label: 'Metal Salt Volume',
    unit: 'mL',
    description: 'Volume of metal salt solution',
    min: 0.1,
    max: 10.0,
    defaultValue: DEFAULT_VALUES.metalVolume,
    required: true
  },
  metalConcentration: {
    type: 'number',
    label: 'Metal Salt Concentration',
    unit: 'mM',
    description: 'Concentration of metal salt solution',
    min: 0.1,
    max: 100.0,
    defaultValue: DEFAULT_VALUES.metalConcentration,
    required: true
  },
  ligand: {
    type: 'select',
    label: 'Ligand Type',
    description: 'Select the ligand to use',
    required: true,
    options: LIGAND_OPTIONS,
    defaultValue: DEFAULT_VALUES.ligand
  },
  ligandVolume: {
    type: 'number',
    label: 'Ligand Volume',
    unit: 'mL',
    description: 'Volume of ligand solution',
    min: 0.1,
    max: 10.0,
    defaultValue: DEFAULT_VALUES.ligandVolume,
    required: true
  },
  ligandConcentration: {
    type: 'number',
    label: 'Ligand Concentration',
    unit: 'mM',
    description: 'Concentration of ligand solution',
    min: 0.1,
    max: 100.0,
    defaultValue: DEFAULT_VALUES.ligandConcentration,
    required: true
  },
  bufferType: {
    type: 'select',
    label: 'Buffer Type',
    description: 'Select the buffer to use',
    required: true,
    options: BUFFER_OPTIONS,
    defaultValue: DEFAULT_VALUES.bufferType
  },
  bufferVolume: {
    type: 'number',
    label: 'Buffer Volume',
    unit: 'mL',
    description: 'Volume of buffer',
    min: 0.1,
    max: 20.0,
    defaultValue: DEFAULT_VALUES.bufferVolume,
    required: true
  },
  mixingTime: {
    type: 'number',
    label: 'Mixing Time',
    unit: 's',
    description: 'Time to mix the solution',
    min: 5,
    max: 300,
    defaultValue: DEFAULT_VALUES.mixingTime,
    required: true
  },
  outputDestination: {
    type: 'select',
    label: 'Output Destination',
    description: 'Destination for the mixed solution',
    required: true,
    options: DESTINATION_OPTIONS,
    defaultValue: DEFAULT_VALUES.outputDestination
  }
};
