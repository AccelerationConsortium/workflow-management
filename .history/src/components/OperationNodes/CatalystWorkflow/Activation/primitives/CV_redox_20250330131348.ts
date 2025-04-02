import { PrimitiveConfig } from '../types';

export const CV_redox: PrimitiveConfig = {
  name: 'CV_redox',
  type: 'measurement',
  description: 'Cyclic voltammetry for redox feature detection',
  inputs: {
    electrode_activated: true,
  },
  outputs: {
    redox_features_detected: true,
  },
  parameters: {
    voltage_range: {
      name: 'Voltage Range',
      value: [-0.1, 0.5],
      unit: 'V',
      description: 'Voltage range for redox peak detection',
    },
    scan_rate: {
      name: 'Scan Rate',
      value: 20,
      unit: 'mV/s',
      description: 'CV scan rate',
    },
    cycles: {
      name: 'Cycles',
      value: 1,
      unit: 'cycles',
      description: 'Number of CV cycles',
    },
  },
  monitoring_metrics: [
    {
      name: 'redox_peak_position',
      unit: 'V',
      description: 'Position of detected redox peaks',
    },
    {
      name: 'redox_peak_current',
      unit: 'mA',
      description: 'Current magnitude of redox peaks',
    },
  ],
  side_effects: {
    modifies_material: 'maybe',
  },
  enabled: true,
}; 
