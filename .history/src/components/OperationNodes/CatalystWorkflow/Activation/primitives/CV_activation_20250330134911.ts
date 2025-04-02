import { PrimitiveConfig, PrimitiveCategory } from '../types';

export const CV_activation: PrimitiveConfig = {
  name: 'CV_activation',
  type: 'operation',
  category: PrimitiveCategory.Core,
  description: 'Cyclic voltammetry activation for catalyst surface',
  inputs: {
    electrodes_connected: true,
    system_stable: true,
  },
  outputs: {
    electrode_activated: true,
    system_stable: false,
  },
  parameters: {
    voltage_range: {
      name: 'Voltage Range',
      value: [-0.2, 0.6],
      unit: 'V',
      description: 'Voltage range for CV scanning',
    },
    scan_rate: {
      name: 'Scan Rate',
      value: 50,
      unit: 'mV/s',
      description: 'CV scan rate',
    },
    cycles: {
      name: 'Cycles',
      value: 10,
      unit: 'cycles',
      description: 'Number of CV cycles',
    },
  },
  monitoring_metrics: [
    {
      name: 'current_response',
      unit: 'mA',
      description: 'Real-time current response',
    },
    {
      name: 'voltage_profile',
      unit: 'V',
      description: 'Applied voltage profile',
    },
  ],
  side_effects: {
    modifies_material: true,
  },
  enabled: true,
}; 
