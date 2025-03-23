import { z } from 'zod';

// Common parameter types that can be reused across devices
export const CommonParameters = {
  duration: z.number().min(0).describe('Operation duration in seconds'),
  temperature: z.number().min(0).max(400).describe('Temperature in Celsius'),
  speed: z.number().min(0).max(3000).describe('Speed in RPM'),
  volume: z.number().min(0).describe('Volume in milliliters'),
  flowRate: z.number().min(0).describe('Flow rate in ml/min'),
  position: z.enum(['open', 'closed']).describe('Valve position'),
  sensorType: z.enum(['temperature', 'pressure', 'pH', 'flow']).describe('Type of sensor'),
  samplingRate: z.number().min(100).max(10000).describe('Sampling rate in ms'),
};

// Device-specific parameter schemas
export const DeviceSchemas = {
  Hotplate: z.object({
    temperature: CommonParameters.temperature,
    stirringSpeed: CommonParameters.speed,
    duration: CommonParameters.duration,
    rampRate: z.number().min(0).max(20).describe('Temperature ramp rate in °C/min'),
  }),

  Pump: z.object({
    flowRate: CommonParameters.flowRate,
    volume: CommonParameters.volume,
    direction: z.enum(['forward', 'reverse']).describe('Pump direction'),
    acceleration: z.number().min(0).max(100).describe('Acceleration rate'),
  }),

  Valve: z.object({
    position: CommonParameters.position,
    switchTime: z.number().min(0).max(10).describe('Time to switch position in seconds'),
  }),

  Sensor: z.object({
    type: CommonParameters.sensorType,
    samplingRate: CommonParameters.samplingRate,
    alarmThreshold: z.number().optional().describe('Threshold for alarm triggering'),
  }),

  Balance: z.object({
    targetWeight: z.number().min(0).describe('Target weight in grams'),
    tolerance: z.number().min(0).describe('Acceptable weight deviation'),
    stabilizationTime: z.number().min(0).describe('Time to wait for stable reading'),
  }),
};

// Default values for each device type
export const DeviceDefaults = {
  Hotplate: {
    temperature: 25,
    stirringSpeed: 0,
    duration: 300,
    rampRate: 5,
  },

  Pump: {
    flowRate: 1.0,
    volume: 10,
    direction: 'forward' as const,
    acceleration: 50,
  },

  Valve: {
    position: 'closed' as const,
    switchTime: 1,
  },

  Sensor: {
    type: 'temperature' as const,
    samplingRate: 1000,
    alarmThreshold: null,
  },

  Balance: {
    targetWeight: 0,
    tolerance: 0.1,
    stabilizationTime: 3,
  },
};

// Validation functions
export const validateDeviceParameters = <T extends keyof typeof DeviceSchemas>(
  deviceType: T,
  parameters: unknown
) => {
  const schema = DeviceSchemas[deviceType];
  return schema.safeParse(parameters);
};

// Type inference helpers
export type DeviceParameters = {
  [K in keyof typeof DeviceSchemas]: z.infer<typeof DeviceSchemas[K]>;
};

export type DeviceType = keyof typeof DeviceSchemas; 
