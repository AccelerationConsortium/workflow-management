import { ParameterDefinition } from '../types';

export const MEASUREMENT_TYPES = ['Potential Step', 'Cyclic Voltammetry', 'Chronoamperometry'];
export const ELECTRODE_TYPES = ['Glassy Carbon', 'Platinum', 'Gold', 'Silver/Silver Chloride'];
export const REFERENCE_ELECTRODES = ['Ag/AgCl', 'SCE', 'Hg/HgO', 'Hg/Hg2SO4'];

export const DEFAULT_VALUES = {
  measurementType: 'Potential Step',
  startPotential: 0.0,
  endPotential: 1.0,
  scanRate: 100,
  sampleInterval: 0.1,
  duration: 60,
  electrodeType: 'Glassy Carbon',
  referenceElectrode: 'Ag/AgCl',
  saveDataPath: './data/measurements/'
};

export const PARAMETERS: Record<string, ParameterDefinition> = {
  measurementType: {
    type: 'select',
    label: 'Measurement Type',
    description: 'Type of electrochemical measurement',
    required: true,
    options: MEASUREMENT_TYPES,
    defaultValue: DEFAULT_VALUES.measurementType
  },
  startPotential: {
    type: 'number',
    label: 'Start Potential',
    unit: 'V',
    description: 'Starting potential for measurement',
    min: -2.0,
    max: 2.0,
    defaultValue: DEFAULT_VALUES.startPotential,
    required: true
  },
  endPotential: {
    type: 'number',
    label: 'End Potential',
    unit: 'V',
    description: 'Ending potential for measurement',
    min: -2.0,
    max: 2.0,
    defaultValue: DEFAULT_VALUES.endPotential,
    required: true
  },
  scanRate: {
    type: 'number',
    label: 'Scan Rate',
    unit: 'mV/s',
    description: 'Rate of potential scanning',
    min: 1,
    max: 1000,
    defaultValue: DEFAULT_VALUES.scanRate,
    required: true
  },
  sampleInterval: {
    type: 'number',
    label: 'Sample Interval',
    unit: 's',
    description: 'Time interval for data sampling',
    min: 0.01,
    max: 10.0,
    defaultValue: DEFAULT_VALUES.sampleInterval,
    required: true
  },
  duration: {
    type: 'number',
    label: 'Measurement Duration',
    unit: 's',
    description: 'Total duration of measurement',
    min: 1,
    max: 3600,
    defaultValue: DEFAULT_VALUES.duration,
    required: true
  },
  electrodeType: {
    type: 'select',
    label: 'Electrode Type',
    description: 'Type of electrode used',
    required: true,
    options: ELECTRODE_TYPES,
    defaultValue: DEFAULT_VALUES.electrodeType
  },
  referenceElectrode: {
    type: 'select',
    label: 'Reference Electrode',
    description: 'Reference electrode used',
    required: true,
    options: REFERENCE_ELECTRODES,
    defaultValue: DEFAULT_VALUES.referenceElectrode
  },
  saveDataPath: {
    type: 'string',
    label: 'Data Save Path',
    description: 'Path to save measurement data',
    required: true,
    defaultValue: DEFAULT_VALUES.saveDataPath
  }
};
