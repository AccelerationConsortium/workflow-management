export const DEFAULT_VALUES = {
  flowRate: 1.0,
  targetVolume: 10.0,
  direction: 'forward' as const,
  isRunning: false,
  mode: 'continuous' as const,
  currentVolume: 0
};

export const FLOW_RATE_LIMITS = {
  min: 0.1,
  max: 10.0
};

export const VOLUME_LIMITS = {
  min: 0.1,
  max: 1000.0
};

export const PUMP_COMMANDS = {
  SET_FLOW_RATE: 'set_flow_rate',
  SET_TARGET_VOLUME: 'set_target_volume',
  SET_DIRECTION: 'set_direction',
  START_PUMP: 'start_pump',
  STOP_PUMP: 'stop_pump',
  EMERGENCY_STOP: 'emergency_stop',
  SET_MODE: 'set_mode'
} as const;

export const PUMP_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  ERROR: 'error',
  COMPLETED: 'completed'
} as const;

export const PUMP_MODES = {
  CONTINUOUS: 'continuous',
  VOLUME: 'volume'
} as const;

export const PUMP_DIRECTIONS = {
  FORWARD: 'forward',
  REVERSE: 'reverse'
} as const;

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
