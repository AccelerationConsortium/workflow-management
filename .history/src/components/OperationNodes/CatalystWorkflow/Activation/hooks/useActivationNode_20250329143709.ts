import { useReducer, useCallback, useEffect } from 'react';
import {
  ActivationNodeData,
  ParameterValue,
  ValidationError,
  PrimitiveConfig,
  ExecutionStatus,
  PrimitiveExecutionStatus,
  LogAction,
  LogEntry,
  NodeTemplate,
  ParameterDependencyRule,
} from '../types';
import { createParameterSchema } from '../parameterSchemas';
import { v4 as uuidv4 } from 'uuid';

// Extend Action types
type Action =
  | { type: 'LOAD_DATA'; payload: ActivationNodeData }
  | { type: 'TOGGLE_PRIMITIVE'; payload: { primitiveId: string; enabled: boolean } }
  | {
      type: 'UPDATE_PARAMETER';
      payload: {
        primitiveId: string;
        parameterId: string;
        value: ParameterValue;
        source: 'user' | 'template' | 'dependency';
      };
    }
  | { type: 'RESET_PRIMITIVE'; payload: { primitiveId: string } }
  | { type: 'RESET_ALL' }
  | { type: 'START_EXECUTION'; payload: { primitiveId: string } }
  | { type: 'END_EXECUTION'; payload: { primitiveId: string; status: PrimitiveExecutionStatus; error?: string } }
  | { type: 'LOAD_TEMPLATE'; payload: NodeTemplate }
  | { type: 'ADD_LOG'; payload: LogAction }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] };

// Extend State interface
interface State {
  data: ActivationNodeData;
  validationErrors: ValidationError[];
  executionStatus: ExecutionStatus;
  isDirty: boolean;
  logs: LogEntry[];
}

// Helper functions
const validatePrimitive = (primitive: PrimitiveConfig): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  primitive.parameterDefinitions.forEach(paramDef => {
    const value = primitive.parameters[paramDef.id]?.value;
    const schema = createParameterSchema(paramDef);
    const result = schema.safeParse(value);
    
    if (!result.success) {
      errors.push({
        primitiveId: primitive.id,
        parameterId: paramDef.id,
        message: result.error.message,
        type: 'PARAMETER_VALIDATION',
      });
    }
  });
  
  return errors;
};

const validateNodeData = (data: ActivationNodeData): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check required primitives
  data.validationRules?.requiredPrimitives?.forEach(primitiveId => {
    if (!data.primitives[primitiveId]?.enabled) {
      errors.push({
        primitiveId,
        message: 'Required primitive is disabled',
        type: 'REQUIRED_PRIMITIVE',
      });
    }
  });
  
  // Validate parameters of enabled primitives
  Object.values(data.primitives)
    .filter(p => p.enabled)
    .forEach(primitive => {
      errors.push(...validatePrimitive(primitive));
    });
  
  return errors;
};

const cleanupDisabledPrimitives = (data: ActivationNodeData): ActivationNodeData => {
  const newData = { ...data };
  Object.entries(newData.primitives).forEach(([id, primitive]) => {
    if (!primitive.enabled) {
      newData.primitives[id] = {
        ...primitive,
        parameters: {},  // Clear parameters when disabled
      };
    }
  });
  return newData;
};

// Add dependency rule evaluation
const evaluateDependencyRules = (
  rules: ParameterDependencyRule[],
  parameters: Record<string, ParameterValue>
): void => {
  rules.forEach(rule => {
    try {
      // Simple evaluation using Function constructor
      const condition = new Function('params', `return ${rule.if}`)(parameters);
      if (condition) {
        if (rule.then.max !== undefined && parameters[rule.then.param!] > rule.then.max) {
          parameters[rule.then.param!] = rule.then.max;
        }
        if (rule.then.min !== undefined && parameters[rule.then.param!] < rule.then.min) {
          parameters[rule.then.param!] = rule.then.min;
        }
      }
    } catch (error) {
      console.error('Error evaluating dependency rule:', error);
    }
  });
};

// Add logging helper
const createLogEntry = (action: LogAction): LogEntry => ({
  id: uuidv4(),
  timestamp: new Date(),
  action,
  user: 'current-user', // TODO: Get from auth context
});

// Reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        data: action.payload,
        validationErrors: validateNodeData(action.payload),
        isDirty: false,
      };
      
    case 'TOGGLE_PRIMITIVE': {
      const newData = {
        ...state.data,
        primitives: {
          ...state.data.primitives,
          [action.payload.primitiveId]: {
            ...state.data.primitives[action.payload.primitiveId],
            enabled: action.payload.enabled,
          },
        },
      };
      const cleanedData = cleanupDisabledPrimitives(newData);
      return {
        ...state,
        data: cleanedData,
        validationErrors: validateNodeData(cleanedData),
        isDirty: true,
      };
    }
    
    case 'UPDATE_PARAMETER': {
      const { primitiveId, parameterId, value, source } = action.payload;
      const newData = {
        ...state.data,
        primitives: {
          ...state.data.primitives,
          [primitiveId]: {
            ...state.data.primitives[primitiveId],
            parameters: {
              ...state.data.primitives[primitiveId].parameters,
              [parameterId]: value,
            },
          },
        },
      };

      // Evaluate dependency rules
      if (source === 'user') {
        const primitive = newData.primitives[primitiveId];
        const paramConfig = primitive.parameterDefinitions.find(p => p.id === parameterId);
        if (paramConfig?.dependencies) {
          evaluateDependencyRules(
            paramConfig.dependencies,
            primitive.parameters
          );
        }
      }

      return {
        ...state,
        data: newData,
        validationErrors: validateNodeData(newData),
        isDirty: true,
        logs: [
          ...state.logs,
          createLogEntry({
            type: 'PARAMETER_CHANGE',
            primitiveId,
            param: parameterId,
            value,
            source
          })
        ]
      };
    }
    
    case 'RESET_PRIMITIVE': {
      const newData = {
        ...state.data,
        primitives: {
          ...state.data.primitives,
          [action.payload.primitiveId]: {
            ...state.data.primitives[action.payload.primitiveId],
            parameters: {},  // Reset to defaults
          },
        },
      };
      return {
        ...state,
        data: newData,
        validationErrors: validateNodeData(newData),
        isDirty: true,
      };
    }
    
    case 'RESET_ALL': {
      const newData = {
        ...state.data,
        primitives: Object.fromEntries(
          Object.entries(state.data.primitives).map(([id, primitive]) => [
            id,
            { ...primitive, parameters: {} },
          ])
        ),
      };
      return {
        ...state,
        data: newData,
        validationErrors: validateNodeData(newData),
        isDirty: true,
      };
    }
    
    case 'SET_EXECUTION_STATUS':
      return {
        ...state,
        executionStatus: action.payload,
      };
      
    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload,
      };
      
    case 'START_EXECUTION':
      return {
        ...state,
        data: {
          ...state.data,
          execution: {
            ...state.data.execution,
            status: 'running',
            startTime: new Date(),
            currentPrimitiveId: action.payload.primitiveId,
            contexts: {
              ...state.data.execution?.contexts,
              [action.payload.primitiveId]: {
                primitiveId: action.payload.primitiveId,
                status: 'running',
                startTime: new Date()
              }
            }
          }
        }
      };

    case 'END_EXECUTION':
      return {
        ...state,
        data: {
          ...state.data,
          execution: {
            ...state.data.execution,
            status: action.payload.status,
            endTime: new Date(),
            contexts: {
              ...state.data.execution?.contexts,
              [action.payload.primitiveId]: {
                ...state.data.execution?.contexts[action.payload.primitiveId],
                status: action.payload.status,
                endTime: new Date(),
                error: action.payload.error,
                metrics: {
                  duration: new Date().getTime() - 
                    (state.data.execution?.contexts[action.payload.primitiveId]?.startTime?.getTime() || 0)
                }
              }
            }
          }
        }
      };

    case 'LOAD_TEMPLATE':
      const newDataFromTemplate = {
        ...state.data,
        ...action.payload,
        metadata: {
          ...state.data.metadata,
          template: action.payload.id,
          modified: new Date().toISOString()
        }
      };
      return {
        ...state,
        data: newDataFromTemplate,
        validationErrors: validateNodeData(newDataFromTemplate),
        isDirty: true,
        logs: [
          ...state.logs,
          createLogEntry({ type: 'TEMPLATE_LOAD', templateId: action.payload.id })
        ]
      };

    case 'ADD_LOG':
      return {
        ...state,
        logs: [...state.logs, createLogEntry(action.payload)]
      };
      
    default:
      return state;
  }
};

export const useActivationNode = (
  initialData: ActivationNodeData,
  onDataChange?: (data: ActivationNodeData) => void
) => {
  const [state, dispatch] = useReducer(reducer, {
    data: initialData,
    validationErrors: validateNodeData(initialData),
    executionStatus: 'idle',
    isDirty: false,
    logs: []
  });

  // Notify parent component when data changes
  useEffect(() => {
    if (state.isDirty && onDataChange) {
      onDataChange(state.data);
    }
  }, [state.data, state.isDirty, onDataChange]);

  const actions = {
    loadData: useCallback((data: ActivationNodeData) => {
      dispatch({ type: 'LOAD_DATA', payload: data });
    }, []),
    
    togglePrimitive: useCallback((primitiveId: string, enabled: boolean) => {
      dispatch({ type: 'TOGGLE_PRIMITIVE', payload: { primitiveId, enabled } });
    }, []),
    
    updateParameter: useCallback(
      (primitiveId: string, parameterId: string, value: ParameterValue) => {
        dispatch({
          type: 'UPDATE_PARAMETER',
          payload: { primitiveId, parameterId, value },
        });
      },
      []
    ),
    
    resetPrimitive: useCallback((primitiveId: string) => {
      dispatch({ type: 'RESET_PRIMITIVE', payload: { primitiveId } });
    }, []),
    
    resetAll: useCallback(() => {
      dispatch({ type: 'RESET_ALL' });
    }, []),
    
    setExecutionStatus: useCallback((status: ExecutionStatus) => {
      dispatch({ type: 'SET_EXECUTION_STATUS', payload: status });
    }, []),

    startExecution: useCallback((primitiveId: string) => {
      dispatch({ type: 'START_EXECUTION', payload: { primitiveId } });
    }, []),

    endExecution: useCallback((primitiveId: string, status: PrimitiveExecutionStatus, error?: string) => {
      dispatch({
        type: 'END_EXECUTION',
        payload: { primitiveId, status, error }
      });
    }, []),

    loadTemplate: useCallback((template: NodeTemplate) => {
      dispatch({ type: 'LOAD_TEMPLATE', payload: template });
    }, []),

    addLog: useCallback((action: LogAction) => {
      dispatch({ type: 'ADD_LOG', payload: action });
    }, []),

    exportMarkdown: useCallback(() => {
      const content = generateMarkdownSummary(state.data);
      return content;
    }, [state.data]),

    getLogs: useCallback((filters?: Record<string, any>) => {
      // TODO: Implement log filtering
      return state.logs;
    }, [state.logs])
  };

  return {
    state,
    actions,
  };
};

// Helper function for Markdown export
function generateMarkdownSummary(data: ActivationNodeData): string {
  return `
### ${data.label} - Configuration Summary
- Version: ${data.version}
- Created: ${data.metadata.created}
- Primitives Enabled:
${Object.entries(data.primitives)
  .filter(([_, p]) => p.enabled)
  .map(([id, p]) => `
  - ${id} ✅
    ${Object.entries(p.parameters)
      .map(([paramId, value]) => `    - ${paramId}: ${value}`)
      .join('\n')}
`).join('\n')}
- Validation: ${data.validationErrors?.length === 0 ? '✅ All parameters valid' : '❌ Has errors'}
`;
} 
