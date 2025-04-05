import { z } from 'zod';
import { ParameterType, ParameterDefinition } from './types';

// UI Widget types
export const WidgetType = {
  SLIDER: 'slider',
  SELECT: 'select',
  INPUT: 'input',
  FILE_UPLOAD: 'file-upload',
  SWITCH: 'switch',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
} as const;

export type WidgetType = typeof WidgetType[keyof typeof WidgetType];

// Parameter UI metadata
export interface ParameterUIMetadata {
  widget?: WidgetType;
  group?: string;
  step?: number;
  order?: number;
  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  help?: string;
  llmDescription?: string;
}

// Unit conversion interface
export interface UnitDefinition {
  unit: string;
  displayUnit?: string;
  conversionFactor?: number;
  format?: string; // e.g., "0.00"
  prefix?: string; // e.g., "~" for approximate values
  suffix?: string;
}

// Enhanced parameter definition
export interface EnhancedParameterDefinition extends ParameterDefinition {
  ui?: ParameterUIMetadata;
  units?: UnitDefinition;
  constraints?: Array<{
    condition: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

// Base parameter value schema creator
export const createParameterValueSchema = <T>(schema: z.ZodType<T>) =>
  z.object({
    value: schema,
    source: z.enum(['default', 'user', 'inferred', 'template']),
    timestamp: z.date().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  });

// Export the ParameterValue type for external use
export type ParameterValue<T> = z.infer<ReturnType<typeof createParameterValueSchema<T>>>;

// Basic type schemas with better error handling
export const baseSchemas = {
  [ParameterType.NUMBER]: z.number(),
  [ParameterType.STRING]: z.string(),
  [ParameterType.BOOLEAN]: z.boolean(),
  [ParameterType.ENUM]: z.string(),
  [ParameterType.ARRAY]: z.array(z.unknown()),
  [ParameterType.OBJECT]: z.record(z.string(), z.unknown()),
} as const;

// Create schema based on parameter definition with proper type inference
export function createParameterSchema<T extends number | string | boolean | unknown[] | Record<string, unknown>>(
  paramDef: EnhancedParameterDefinition
): z.ZodType<ParameterValue<T>> {
  let baseSchema: z.ZodType<T>;

  // Create base schema based on parameter type
  switch (paramDef.type) {
    case ParameterType.NUMBER: {
      const numSchema = z.number();
      if (paramDef.validation) {
        if (typeof paramDef.validation.min === 'number') {
          numSchema.min(paramDef.validation.min);
        }
        if (typeof paramDef.validation.max === 'number') {
          numSchema.max(paramDef.validation.max);
        }
      }
      baseSchema = numSchema as unknown as z.ZodType<T>;
      break;
    }

    case ParameterType.STRING: {
      const strSchema = z.string();
      if (paramDef.validation?.pattern) {
        strSchema.regex(new RegExp(paramDef.validation.pattern));
      }
      baseSchema = strSchema as unknown as z.ZodType<T>;
      break;
    }

    case ParameterType.ENUM: {
      if (paramDef.validation?.enum && paramDef.validation.enum.length > 0) {
        baseSchema = z.enum(paramDef.validation.enum as [string, ...string[]]) as unknown as z.ZodType<T>;
      } else {
        const fallbackSchema = z.string().refine(() => false, {
          message: 'ENUM parameter must define at least one enum value.',
        });
        baseSchema = fallbackSchema as unknown as z.ZodType<T>;
      }
      break;
    }

    case ParameterType.BOOLEAN:
      baseSchema = z.boolean() as unknown as z.ZodType<T>;
      break;

    case ParameterType.ARRAY:
      baseSchema = z.array(z.unknown()) as unknown as z.ZodType<T>;
      break;

    case ParameterType.OBJECT:
      baseSchema = z.record(z.string(), z.unknown()) as unknown as z.ZodType<T>;
      break;

    default:
      throw new Error(`Unsupported parameter type: ${paramDef.type}`);
  }

  // Apply custom constraints if defined
  if (paramDef.constraints) {
    for (const constraint of paramDef.constraints) {
      baseSchema = baseSchema.refine(
        (value: T) => {
          try {
            return new Function('value', `return ${constraint.condition}`)(value);
          } catch {
            return false;
          }
        },
        {
          message: constraint.message,
          path: [constraint.severity],
        }
      );
    }
  }

  // Handle required/optional
  if (!paramDef.required) {
    baseSchema = baseSchema.optional() as z.ZodType<T>;
  }

  return createParameterValueSchema(baseSchema);
}

// Common parameter schemas for electrochemistry with enhanced metadata
export const electrochemistrySchemas = {
  voltage: createParameterSchema<number>({
    id: 'voltage',
    name: 'Voltage',
    type: ParameterType.NUMBER,
    required: true,
    validation: {
      min: -10,
      max: 10,
    },
    units: {
      unit: 'mV',
      displayUnit: 'V',
      conversionFactor: 0.001,
      format: '0.000',
    },
    ui: {
      widget: WidgetType.SLIDER,
      group: 'Electrical Parameters',
      step: 0.1,
      help: 'Applied voltage across the electrodes',
      llmDescription: 'The voltage applied between working and reference electrodes, typically in range -10V to +10V',
    },
    description: 'Applied voltage',
    category: 'electrical',
  }),

  current: createParameterSchema<number>({
    id: 'current',
    name: 'Current',
    type: ParameterType.NUMBER,
    required: true,
    validation: {
      min: -2000,
      max: 2000,
    },
    units: {
      unit: 'mA',
    },
    ui: {
      widget: WidgetType.INPUT,
    },
    description: 'Measured current',
    category: 'electrical',
  }),

  scanRate: createParameterSchema<number>({
    id: 'scanRate',
    name: 'Scan Rate',
    type: ParameterType.NUMBER,
    required: true,
    validation: {
      min: 0.1,
      max: 1000,
    },
    units: {
      unit: 'mV/s',
      displayUnit: 'V/s',
      conversionFactor: 0.001,
    },
    ui: {
      widget: WidgetType.SLIDER,
      group: 'Experimental Parameters',
      step: 0.1,
    },
    constraints: [
      {
        condition: 'value <= 500 || cycles <= 10',
        message: 'For high scan rates (>500 mV/s), limit cycles to 10 or fewer',
        severity: 'warning',
      },
    ],
    description: 'Voltage scan rate',
    category: 'experimental',
  }),

  cycles: createParameterSchema<number>({
    id: 'cycles',
    name: 'Number of Cycles',
    type: ParameterType.NUMBER,
    required: true,
    validation: {
      min: 1,
      max: 1000,
    },
    ui: {
      widget: WidgetType.INPUT,
      group: 'Experimental Parameters',
    },
    constraints: [
      {
        condition: 'value <= 10 || scanRate <= 500',
        message: 'For many cycles (>10), limit scan rate to 500 mV/s or less',
        severity: 'warning',
      },
    ],
    description: 'Number of CV cycles',
    category: 'experimental',
  }),
};

// Define the voltage range schema first to break circular dependency
const voltageRangeSchema = z.object({
  start: z.lazy(() => electrochemistrySchemas.voltage),
  end: z.lazy(() => electrochemistrySchemas.voltage),
  steps: z.number().int().min(2).max(1000).optional(),
});

type VoltageRangeType = z.infer<typeof voltageRangeSchema>;

// Define activation parameters schema
const activationParametersSchema = z.object({
  cycles: z.lazy(() => electrochemistrySchemas.cycles),
  scanRate: z.lazy(() => electrochemistrySchemas.scanRate),
  voltageRange: voltageRangeSchema,
});

type ActivationParametersType = z.infer<typeof activationParametersSchema>;

// Define CVA results schema
const cvaResultsSchema = z.object({
  ecsa: createParameterSchema<number>({
    id: 'ecsa',
    name: 'Electrochemically Active Surface Area',
    type: ParameterType.NUMBER,
    required: true,
    validation: { min: 0 },
    units: {
      unit: 'cm²',
      format: '0.00',
    },
  }),
  roughnessFactor: createParameterSchema<number>({
    id: 'roughnessFactor',
    name: 'Roughness Factor',
    type: ParameterType.NUMBER,
    required: true,
    validation: { min: 0 },
    units: {
      unit: '',
      prefix: '~',
    },
  }),
  chargeTransfer: createParameterSchema<number>({
    id: 'chargeTransfer',
    name: 'Charge Transfer',
    type: ParameterType.NUMBER,
    required: true,
    validation: { min: 0 },
    units: {
      unit: 'C',
    },
  }),
});

type CVAResultsType = z.infer<typeof cvaResultsSchema>;

// Export the complete CV activation schemas
export const cvActivationSchemas = {
  voltageRange: voltageRangeSchema,
  activationParameters: activationParametersSchema,
  cvaResults: cvaResultsSchema,
} as const;

// Export types for external use
export type CVActivationSchemas = {
  voltageRange: typeof voltageRangeSchema;
  activationParameters: typeof activationParametersSchema;
  cvaResults: typeof cvaResultsSchema;
};

// Helper function to validate parameter values with type inference
export function validateParameterValue<T extends number | string | boolean | unknown[] | Record<string, unknown>>(
  value: unknown,
  paramDef: EnhancedParameterDefinition
): z.SafeParseReturnType<ParameterValue<T>, ParameterValue<T>> {
  const schema = createParameterSchema<T>(paramDef);
  return schema.safeParse(value);
}

// Helper function to create empty parameter value with type inference
export function createEmptyParameterValue<T extends number | string | boolean | unknown[] | Record<string, unknown>>(
  paramDef: EnhancedParameterDefinition
): z.infer<ReturnType<typeof createParameterSchema<T>>> {
  const emptyValue = {
    value: (paramDef.default ?? null) as T,
    source: 'default' as const,
    timestamp: new Date(),
    metadata: {},
  };

  const schema = createParameterSchema<T>(paramDef);
  const result = schema.safeParse(emptyValue);
  
  if (!result.success) {
    throw new Error(`Invalid empty value: ${result.error.message}`);
  }
  
  return result.data;
} 
