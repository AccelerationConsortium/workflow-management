import { PrimitiveConfig } from '../types';

export const CVA: PrimitiveConfig = {
  name: 'CVA',
  type: 'measurement',
  description: 'Electrochemical Surface Area (ECSA) measurement using CV',
  inputs: {
    electrode_activated: true,
  },
  outputs: {
    ecsa_value_computed: true,
  },
  parameters: {
    voltage_range: {
      name: 'Voltage Range',
      value: [0.1, 0.2],
      unit: 'V',
      description: 'Voltage range for ECSA measurement',
    },
    scan_rate: {
      name: 'Scan Rate',
      value: 20,
      unit: 'mV/s',
      description: 'CV scan rate for ECSA measurement',
    },
    cycles: {
      name: 'Cycles',
      value: 3,
      unit: 'cycles',
      description: 'Number of CV cycles',
    },
  },
  monitoring_metrics: [
    {
      name: 'capacitive_current_slope',
      unit: 'mA/V',
      description: 'Capacitive current slope for ECSA calculation',
    },
    {
      name: 'raw_cv_curve',
      unit: 'mA vs V',
      description: 'Raw CV curve data',
    },
  ],
  side_effects: {
    modifies_material: false,
  },
  enabled: true,
}; 
