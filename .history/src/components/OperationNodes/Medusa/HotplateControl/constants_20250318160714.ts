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
