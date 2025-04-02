import { z } from 'zod';
import { ParameterType, ParameterDefinition, ParameterValue } from './types';

// Basic type schemas
export const baseSchemas = {
  [ParameterType.NUMBER]: z.number(),
  [ParameterType.STRING]: z.string(),
  [ParameterType.BOOLEAN]: z.boolean(),
  [ParameterType.ENUM]: z.string(), // Base schema, will be enhanced with enum values
  [ParameterType.ARRAY]: z.array(z.unknown()),
  [ParameterType.OBJECT]: z.record(z.string(), z.unknown()),
} as const;

// Parameter value schema with source tracking
export const parameterValueSchema = <T>(valueSchema: z.ZodType<T>) =>
  z.object({
    value: valueSchema,
    source: z.enum(['default', 'user', 'inferred', 'template']),
    timestamp: z.date().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  });

// Create schema based on parameter definition
export function createParameterSchema(paramDef: ParameterDefinition): z.ZodType<any> {
  let schema = baseSchemas[paramDef.type];

  // Apply parameter-specific validation rules
  if (paramDef.validation) {
    if (paramDef.type === ParameterType.NUMBER) {
      if (typeof paramDef.validation.min === 'number') {
        schema = schema.min(paramDef.validation.min);
      }
      if (typeof paramDef.validation.max === 'number') {
        schema = schema.max(paramDef.validation.max);
      }
    }

    if (paramDef.type === ParameterType.STRING && paramDef.validation.pattern) {
      schema = schema.regex(new RegExp(paramDef.validation.pattern));
    }

    if (paramDef.type === ParameterType.ENUM && paramDef.validation.enum) {
      schema = z.enum(paramDef.validation.enum as [string, ...string[]]);
    }
  }

  // Handle required/optional
  if (!paramDef.required) {
    schema = schema.optional();
  }

  // Wrap in ParameterValue structure
  return parameterValueSchema(schema);
}

// Common parameter schemas for electrochemistry
export const electrochemistrySchemas = {
  voltage: createParameterSchema({
    id: 'voltage',
    name: 'Voltage',
    type: ParameterType.NUMBER,
    required: true,
    validation: {
      min: -10,
      max: 10,
    },
    unit: 'V',
    description: 'Applied voltage',
    category: 'electrical',
  }),

  current: createParameterSchema({
    id: 'current',
    name: 'Current',
    type: ParameterType.NUMBER,
    required: true,
    validation: {
      min: -2000,
      max: 2000,
    },
    unit: 'mA',
    description: 'Measured current',
    category: 'electrical',
  }),

  scanRate: createParameterSchema({
    id: 'scanRate',
    name: 'Scan Rate',
    type: ParameterType.NUMBER,
    required: true,
    validation: {
      min: 0.1,
      max: 1000,
    },
    unit: 'mV/s',
    description: 'Voltage scan rate',
    category: 'experimental',
  }),

  cycles: createParameterSchema({
    id: 'cycles',
    name: 'Number of Cycles',
    type: ParameterType.NUMBER,
    required: true,
    validation: {
      min: 1,
      max: 1000,
    },
    unit: 'cycles',
    description: 'Number of CV cycles',
    category: 'experimental',
  }),
};

// Specific schemas for CV activation primitives
export const cvActivationSchemas = {
  voltageRange: z.object({
    start: electrochemistrySchemas.voltage,
    end: electrochemistrySchemas.voltage,
    steps: z.number().int().min(2).max(1000).optional(),
  }),

  activationParameters: z.object({
    cycles: electrochemistrySchemas.cycles,
    scanRate: electrochemistrySchemas.scanRate,
    voltageRange: cvActivationSchemas.voltageRange,
  }),

  // Schema for CVA results
  cvaResults: z.object({
    ecsa: parameterValueSchema(z.number().min(0)),
    roughnessFactor: parameterValueSchema(z.number().min(0)),
    chargeTransfer: parameterValueSchema(z.number()),
  }),
};

// Helper function to validate parameter values
export function validateParameterValue<T>(
  value: ParameterValue<T>,
  paramDef: ParameterDefinition
): z.SafeParseReturnType<any, any> {
  const schema = createParameterSchema(paramDef);
  return schema.safeParse(value);
}

// Helper function to create empty parameter value
export function createEmptyParameterValue(
  paramDef: ParameterDefinition
): ParameterValue {
  return {
    value: paramDef.default ?? null,
    source: 'default',
    timestamp: new Date(),
  };
} 
