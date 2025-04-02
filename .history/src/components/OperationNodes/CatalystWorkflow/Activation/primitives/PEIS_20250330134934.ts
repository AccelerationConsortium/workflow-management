import { PrimitiveConfig, PrimitiveCategory } from '../types';

export const PEIS: PrimitiveConfig = {
  name: 'PEIS',
  type: 'measurement',
  category: PrimitiveCategory.Optional,
  description: 'Potentiostatic Electrochemical Impedance Spectroscopy',
  inputs: {
    electrode_activated: true,
  },
  outputs: {
    impedance_measured: true,
  },
  parameters: {
    frequency_range: {
      name: 'Frequency Range',
      value: [0.1, 100000],
      unit: 'Hz',
      description: 'Frequency range for EIS measurement',
    },
    amplitude: {
      name: 'Amplitude',
      value: 10,
      unit: 'mV',
      description: 'AC amplitude',
    },
    points_per_decade: {
      name: 'Points per Decade',
      value: 10,
      unit: 'points',
      description: 'Number of measurement points per frequency decade',
    },
  },
  monitoring_metrics: [
    {
      name: 'impedance',
      unit: 'Ω',
      description: 'Complex impedance',
    },
    {
      name: 'phase',
      unit: 'degree',
      description: 'Phase angle',
    },
  ],
  side_effects: {
    modifies_material: false,
  },
  enabled: false,
}; 
