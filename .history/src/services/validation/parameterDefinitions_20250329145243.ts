import { ParameterDefinition } from './types';

/**
 * Parameter definitions for different node types
 * Key: Node type
 * Value: Array of parameter definitions
 */
export const NODE_PARAMETER_DEFINITIONS: Record<string, ParameterDefinition[]> = {
  // Hotplate Control Node
  'HotplateControl': [
    {
      name: 'temperature',
      type: 'number',
      required: true,
      validation: {
        min: 0,
        max: 400, // Maximum temperature in Celsius
      },
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      validation: {
        min: 0,
        max: 86400, // Maximum duration in seconds (24 hours)
      },
    },
    {
      name: 'stirringSpeed',
      type: 'number',
      required: false,
      validation: {
        min: 0,
        max: 2000, // Maximum RPM
      },
    },
  ],

  // Pump Control Node
  'PumpControl': [
    {
      name: 'flowRate',
      type: 'number',
      required: true,
      validation: {
        min: 0,
        max: 100, // Maximum flow rate in mL/min
      },
    },
    {
      name: 'volume',
      type: 'number',
      required: true,
      validation: {
        min: 0,
        max: 1000, // Maximum volume in mL
      },
    },
    {
      name: 'direction',
      type: 'string',
      required: true,
      validation: {
        enum: ['forward', 'reverse'],
      },
    },
  ],

  // Valve Control Node
  'ValveControl': [
    {
      name: 'position',
      type: 'string',
      required: true,
      validation: {
        enum: ['A', 'B', 'C', 'D'],
      },
    },
    {
      name: 'switchTime',
      type: 'number',
      required: false,
      validation: {
        min: 0,
        max: 10, // Maximum switch time in seconds
      },
    },
  ],

  // Sensor Node
  'SensorNode': [
    {
      name: 'sensorType',
      type: 'string',
      required: true,
      validation: {
        enum: ['temperature', 'pressure', 'pH', 'flow'],
      },
    },
    {
      name: 'samplingRate',
      type: 'number',
      required: true,
      validation: {
        min: 0.1,
        max: 100, // Samples per second
      },
    },
    {
      name: 'alarmThreshold',
      type: 'number',
      required: false,
    },
  ],

  // Data Processing Node
  'DataProcessing': [
    {
      name: 'operation',
      type: 'string',
      required: true,
      validation: {
        enum: ['average', 'max', 'min', 'filter'],
      },
    },
    {
      name: 'windowSize',
      type: 'integer',
      required: false,
      validation: {
        min: 1,
        max: 1000,
      },
    },
  ],

  // File Input Node
  'FileInput': [
    {
      name: 'filePath',
      type: 'string',
      required: true,
      validation: {
        pattern: '^[\\w\\-./]+$', // Basic file path pattern
      },
    },
    {
      name: 'fileType',
      type: 'string',
      required: true,
      validation: {
        enum: ['csv', 'json', 'txt'],
      },
    },
  ],

  // File Output Node
  'FileOutput': [
    {
      name: 'filePath',
      type: 'string',
      required: true,
      validation: {
        pattern: '^[\\w\\-./]+$',
      },
    },
    {
      name: 'format',
      type: 'string',
      required: true,
      validation: {
        enum: ['csv', 'json', 'txt'],
      },
    },
    {
      name: 'overwrite',
      type: 'boolean',
      required: false,
    },
  ],

  // Activation Node
  'Activation': [
    {
      name: 'mode',
      type: 'string',
      required: true,
      validation: {
        enum: ['manual', 'timed'],
      },
    },
    {
      name: 'activationTime',
      type: 'number',
      required: false,
      validation: {
        min: 0,
        max: 3600, // Maximum time in seconds (1 hour)
      },
    },
    {
      name: 'deactivationTime',
      type: 'number',
      required: false,
      validation: {
        min: 0,
        max: 3600, // Maximum time in seconds (1 hour)
      },
    },
  ],
};

/**
 * Get parameter definitions for a specific node type
 * @param nodeType The type of the node
 * @returns Array of parameter definitions for the node type
 */
export function getParameterDefinitions(nodeType: string): ParameterDefinition[] {
  return NODE_PARAMETER_DEFINITIONS[nodeType] || [];
} 
