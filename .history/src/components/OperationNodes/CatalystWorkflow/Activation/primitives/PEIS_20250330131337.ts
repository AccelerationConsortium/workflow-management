import { PrimitiveConfig } from '../types';

export const PEIS: PrimitiveConfig = {
  name: 'PEIS',
  type: 'measurement',
  description: 'Potentiostatic Electrochemical Impedance Spectroscopy',
  inputs: {
    electrode_activated: true,
  },
  outputs: {
    impedance_spectrum: true,
    rs_value: true,
    rct_value: true,
  },
  parameters: {
    dc_potential: {
      name: 'DC Potential',
      value: 0.2,
      unit: 'V',
      description: 'DC bias potential',
    },
    ac_amplitude: {
      name: 'AC Amplitude',
      value: 0.01,
      unit: 'V',
      description: 'AC perturbation amplitude',
    },
    frequency_range: {
      name: 'Frequency Range',
      value: [1e5, 0.1],
      unit: 'Hz',
      description: 'Frequency range for EIS measurement',
    },
  },
  monitoring_metrics: [
    {
      name: 'nyquist_curve',
      description: 'Real-time Nyquist plot',
    },
    {
      name: 'fitted_parameters',
      description: 'Fitted equivalent circuit parameters',
    },
  ],
  side_effects: {
    modifies_material: false,
  },
  enabled: true,
}; 
