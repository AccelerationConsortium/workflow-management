import { z } from 'zod';
import { ParameterType, ParameterDefinition, ParameterValue } from './types';

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
export function createParameterSchema<T>(
  paramDef: EnhancedParameterDefinition
): z.ZodType<ParameterValue<T>> {
  let schema = baseSchemas[paramDef.type] as z.ZodType<T>;

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

    // Enhanced ENUM handling with fallback
    if (paramDef.type === ParameterType.ENUM) {
      const values = paramDef.validation?.enum;
      if (values && values.length > 0) {
        schema = z.enum(values as [string, ...string[]]) as z.ZodType<T>;
      } else {
        schema = z.string()
          .refine(() => false, {
            message: 'ENUM parameter must define at least one enum value.',
          }) as z.ZodType<T>;
      }
    }
  }

  // Apply custom constraints if defined
  if (paramDef.constraints) {
    for (const constraint of paramDef.constraints) {
      schema = schema.refine(
        (value) => {
          try {
            // Simple expression evaluation (can be enhanced with proper expression parser)
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
    schema = schema.optional() as z.ZodType<T>;
  }

  return createParameterValueSchema(schema);
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

// Specific schemas for CV activation primitives with proper typing
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

  // Schema for CVA results with proper typing
  cvaResults: z.object({
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
  }),
} as const;

// Helper function to validate parameter values with type inference
export function validateParameterValue<T>(
  value: ParameterValue<T>,
  paramDef: EnhancedParameterDefinition
): z.SafeParseReturnType<ParameterValue<T>, ParameterValue<T>> {
  const schema = createParameterSchema<T>(paramDef);
  return schema.safeParse(value);
}

// Helper function to create empty parameter value with type inference
export function createEmptyParameterValue<T>(
  paramDef: EnhancedParameterDefinition
): ParameterValue<T> {
  return {
    value: (paramDef.default ?? null) as T,
    source: 'default',
    timestamp: new Date(),
  };
} 
