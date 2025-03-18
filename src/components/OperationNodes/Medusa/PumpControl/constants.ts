export const DEFAULT_VALUES = {
  flowRate: 1.0,
  duration: 60,
  direction: 'forward'
};

export const RANGES = {
  flowRate: [0.1, 10],
  duration: [1, 3600]
};

export const UNITS = {
  flowRate: 'mL/min',
  duration: 'seconds'
};

export const PUMP_SPECS = {
  model: 'KEM Pump',
  manufacturer: 'KEM',
  range: '0.1-10 mL/min',
  precision: '±0.1 mL/min'
};
