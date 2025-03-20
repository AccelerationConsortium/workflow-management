export const DEFAULT_VALUES = {
  temperature: 25,
  stirringSpeed: 0,
  heatingOn: false,
  stirringOn: false,
  targetTemp: 25,
  rampRate: 5,  // °C per minute
};

export const HOTPLATE_SPECS = {
  model: 'Heidolph MR Hei-Standard',
  manufacturer: 'Heidolph',
  type: 'Magnetic Hotplate Stirrer',
  temperatureRange: '20-300°C',
  stirringRange: '0-1400 rpm',
  heatingPower: '800W',
  plateSize: '145mm diameter'
};

export const TEMPERATURE_LIMITS = {
  min: 20,
  max: 300
};

export const STIRRING_LIMITS = {
  min: 0,
  max: 1400
};

export const HOTPLATE_CONSTANTS = {
  // Temperature limits (in Celsius)
  TEMPERATURE: {
    MIN: 0,
    MAX: 400,
    DEFAULT: 25,
    STEP: 1
  },

  // Stirring speed limits (in RPM)
  STIRRING_SPEED: {
    MIN: 0,
    MAX: 1500,
    DEFAULT: 0,
    STEP: 10
  },

  // Update intervals (in milliseconds)
  UPDATE_INTERVAL: 2000,

  // Device ID prefix
  DEVICE_ID_PREFIX: 'hotplate',

  // Status messages
  STATUS_MESSAGES: {
    CONNECTING: 'Connecting to hotplate...',
    CONNECTED: 'Connected',
    DISCONNECTED: 'Disconnected',
    ERROR: 'Error connecting to hotplate'
  },

  // Parameter validation
  VALIDATION: {
    TEMPERATURE_ERROR: 'Temperature must be between 0°C and 400°C',
    SPEED_ERROR: 'Stirring speed must be between 0 and 1500 RPM'
  }
};
