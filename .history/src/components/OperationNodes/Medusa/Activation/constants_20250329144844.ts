export const DEFAULT_VALUES = {
  isActive: false,
  activationTime: 10,
  deactivationTime: 10,
  mode: 'manual' as const
};

export const TIME_LIMITS = {
  min: 0,
  max: 3600 // 1 hour in seconds
};

export const ACTIVATION_COMMANDS = {
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  SET_ACTIVATION_TIME: 'set_activation_time',
  SET_DEACTIVATION_TIME: 'set_deactivation_time',
  SET_MODE: 'set_mode'
} as const;

export const ACTIVATION_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  ERROR: 'error'
} as const;

export const ACTIVATION_MODES = {
  MANUAL: 'manual',
  TIMED: 'timed'
} as const;

export const RANGES = {
  activationTime: [0, 3600],
  deactivationTime: [0, 3600]
};

export const UNITS = {
  time: 'seconds'
};

export const ACTIVATION_SPECS = {
  model: 'Generic Activation Device',
  manufacturer: 'Medusa',
  timeRange: '0-3600 seconds',
  precision: '1 second'
}; 
