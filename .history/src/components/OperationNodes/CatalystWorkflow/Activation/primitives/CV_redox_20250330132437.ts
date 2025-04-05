import { PrimitiveConfig } from '../types';

export const CV_redox: PrimitiveConfig = {
  name: 'CV_redox',
  type: 'measurement',
  description: 'Cyclic voltammetry for redox feature detection',
  inputs: {
    'electrode.activated': true,
    'CVA.ecsa': true,  // Required for condition check
  },
  outputs: {
    'redox.features.detected': true,
  },
  parameters: {
    voltage_range: {
      name: 'Voltage Range',
      value: [-0.5, 0.5],
      unit: 'V',
      description: 'Start and end voltage for CV scan',
    },
    scan_rate: {
      name: 'Scan Rate',
      value: 100,
      unit: 'mV/s',
      description: 'Rate of voltage change during CV',
    },
    cycles: {
      name: 'Number of Cycles',
      value: 3,
      unit: 'cycles',
      description: 'Number of CV cycles to perform',
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
      description: 'Current at redox peaks',
    },
  ],
  side_effects: {
    modifies_material: 'maybe',
  },
  enabled: true,
  executionCondition: {
    enabled_if: 'CVA.ecsa > 0.5',
    dependsOn: ['CVA'],
    timeout: 300000,  // 5 minutes
    retryStrategy: {
      maxAttempts: 3,
      backoffMs: 1000,
    },
  },
}; 
