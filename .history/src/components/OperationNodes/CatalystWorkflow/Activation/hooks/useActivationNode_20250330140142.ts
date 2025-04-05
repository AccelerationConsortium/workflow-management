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
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { 
      type: 'UPDATE_UO_CONFIG'; 
      payload: { 
        enabledPrimitives: string[]; 
      }; 
    };

// Extend State interface
interface State {
  data: ActivationNodeData;
  validationErrors: ValidationError[];
  status: PrimitiveExecutionStatus;
  isValid: boolean;
  isDirty: boolean;
  logs: LogEntry[];
}

// Helper functions
const validatePrimitive = (
  primitive: PrimitiveConfig,
  allPrimitives: Record<string, PrimitiveConfig>
): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check execution condition if exists
  if (primitive.executionCondition?.enabled_if) {
    const condition = primitive.executionCondition.enabled_if;
    const dependsOn = primitive.executionCondition.dependsOn || [];
    
    // Check if dependent primitives are enabled
    const missingDependencies = dependsOn.filter(
      depId => !allPrimitives[depId]?.enabled
    );
    
    if (missingDependencies.length > 0) {
      errors.push({
        primitiveId: primitive.name,
        type: 'DEPENDENCY',
        message: `Required primitives not enabled: ${missingDependencies.join(', ')}`,
      });
    } else {
      // Evaluate condition if dependencies are met
      const conditionMet = evaluateCondition(condition, allPrimitives);
      if (!conditionMet) {
        errors.push({
          primitiveId: primitive.name,
          type: 'CONDITION_UNMET',
          message: `Execution condition not met: ${condition}`,
        });
      }
    }
  }
  
  // Validate parameters
  Object.entries(primitive.parameters).forEach(([paramId, param]) => {
    if (Array.isArray(param.value)) {
      if (param.value[0] >= param.value[1]) {
        errors.push({
          primitiveId: primitive.name,
          parameterId: paramId,
          message: `Invalid range: start value must be less than end value`,
          type: 'PARAMETER_VALIDATION',
        });
      }
    }
  });
  
  return errors;
};

// Add UO validation
const validateUOConfig = (data: ActivationNodeData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { config, enabledPrimitives } = data.unitOperation;
  
  // Check minimum primitives
  if (config.validationRules.minPrimitives && enabledPrimitives.length < config.validationRules.minPrimitives) {
    errors.push({
      type: 'UO_VALIDATION',
      message: `At least ${config.validationRules.minPrimitives} primitives must be enabled`,
    });
  }
  
  // Check required primitives
  config.validationRules.requiredPrimitives?.forEach(primitiveId => {
    if (!enabledPrimitives.includes(primitiveId)) {
      errors.push({
        type: 'UO_VALIDATION',
        message: `Required primitive "${primitiveId}" must be enabled`,
      });
    }
  });
  
  // Check incompatible primitives
  config.validationRules.incompatiblePrimitives?.forEach(([p1, p2]) => {
    if (enabledPrimitives.includes(p1) && enabledPrimitives.includes(p2)) {
      errors.push({
        type: 'UO_VALIDATION',
        message: `Primitives "${p1}" and "${p2}" cannot be enabled at the same time`,
      });
    }
  });
  
  return errors;
};

// Add condition evaluation helper
const evaluateCondition = (
  condition: string,
  primitives: Record<string, PrimitiveConfig>
): boolean => {
  try {
    // Create a context object with primitive outputs and parameters
    const context = Object.entries(primitives).reduce((acc, [id, primitive]) => {
      if (!primitive.enabled) return acc;
      
      // Add primitive outputs
      Object.keys(primitive.outputs || {}).forEach(output => {
        acc[`${id}.${output}`] = primitive.executionContext?.results?.[output] || null;
      });
      
      // Add primitive parameters
      Object.entries(primitive.parameters || {}).forEach(([paramId, param]) => {
        acc[`${id}.${paramId}`] = param.value;
      });
      
      return acc;
    }, {} as Record<string, any>);
    
    // Evaluate the condition
    return new Function('ctx', `with(ctx) { return ${condition}; }`)(context);
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
};

// Update validateNodeData to pass all primitives to validatePrimitive
const validateNodeData = (data: ActivationNodeData): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Add UO validation
  errors.push(...validateUOConfig(data));
  
  Object.entries(data.primitives).forEach(([primitiveId, primitive]) => {
    if (!primitive.enabled) return;
    
    // Validate inputs/dependencies
    Object.entries(primitive.inputs).forEach(([input, required]) => {
      if (!required) return;
      
      const isProvided = Object.values(data.primitives).some(
        p => p.enabled && p.outputs && p.outputs[input]
      );
      
      if (!isProvided) {
        errors.push({
          primitiveId: primitive.name,
          type: 'DEPENDENCY',
          message: `Required input "${input}" is not provided by any enabled primitive`,
        });
      }
    });
    
    // Validate parameters and conditions
    errors.push(...validatePrimitive(primitive, data.primitives));
  });
  
  return errors;
};

const cleanupDisabledPrimitives = (data: ActivationNodeData): ActivationNodeData => {
  const newData = { ...data };
  Object.entries(newData.primitives).forEach(([id, primitive]) => {
    if (!primitive.enabled) {
      newData.primitives[id] = {
        ...primitive,
        enabled: false,
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
  console.log('Reducer action:', action);
  console.log('Current state:', state);

  switch (action.type) {
    case 'LOAD_DATA':
      console.log('Loading data:', action.payload);
      return {
        ...state,
        data: action.payload,
        validationErrors: validateNodeData(action.payload),
        isDirty: false,
      };
      
    case 'TOGGLE_PRIMITIVE':
      console.log('Toggling primitive:', action.payload);
      const updatedPrimitives = {
        ...state.data.primitives,
        [action.payload.primitiveId]: {
          ...state.data.primitives[action.payload.primitiveId],
          enabled: action.payload.enabled,
        },
      };

      // Update UO config when primitives are toggled
      const enabledPrimitives = Object.entries(updatedPrimitives)
        .filter(([_, config]) => config.enabled)
        .map(([id]) => id);

      const cleanedData = cleanupDisabledPrimitives({
        ...state.data,
        primitives: updatedPrimitives,
        unitOperation: {
          ...state.data.unitOperation,
          enabledPrimitives,
        },
      });
      return {
        ...state,
        data: cleanedData,
        validationErrors: validateNodeData(cleanedData),
        isDirty: true,
        logs: [
          ...state.logs,
          createLogEntry({
            type: 'PRIMITIVE_TOGGLE',
            primitiveId: action.payload.primitiveId,
            enabled: action.payload.enabled,
          }),
        ],
      };
    }
    
    case 'UPDATE_PARAMETER':
      console.log('Updating parameter:', action.payload);
      const { primitiveId, parameterId, value } = action.payload;
      const newData = {
        ...state.data,
        primitives: {
          ...state.data.primitives,
          [primitiveId]: {
            ...state.data.primitives[primitiveId],
            parameters: {
              ...state.data.primitives[primitiveId].parameters,
              [parameterId]: {
                ...state.data.primitives[primitiveId].parameters[parameterId],
                value,
              },
            },
          },
        },
      };

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
            source: 'user',
          }),
        ],
      };
    }
    
    case 'RESET_PRIMITIVE':
      console.log('Resetting primitive:', action.payload);
      const newDataReset = {
        ...state.data,
        primitives: {
          ...state.data.primitives,
          [action.payload.primitiveId]: {
            ...state.data.primitives[action.payload.primitiveId],
            parameters: Object.entries(
              state.data.primitives[action.payload.primitiveId].parameters
            ).reduce((acc, [key, param]) => {
              acc[key] = {
                ...param,
                value: param.defaultValue,
                source: 'default' as const,
                timestamp: new Date(),
              };
              return acc;
            }, {} as Record<string, any>),
          },
        },
      };
      return {
        ...state,
        data: newDataReset,
        validationErrors: validateNodeData(newDataReset),
        isDirty: true,
      };
    }
    
    case 'RESET_ALL':
      console.log('Resetting all primitives');
      return {
        ...state,
        data: {
          ...state.data,
          primitives: Object.entries(state.data.primitives).reduce(
            (acc, [id, primitive]) => {
              acc[id] = {
                ...primitive,
                enabled: state.data.unitOperation.config.defaultEnabledPrimitives.includes(id),
                parameters: Object.entries(primitive.parameters).reduce(
                  (params, [key, param]) => {
                    params[key] = {
                      ...param,
                      value: param.defaultValue,
                      source: 'default' as const,
                      timestamp: new Date(),
                    };
                    return params;
                  },
                  {} as Record<string, any>
                ),
              };
              return acc;
            },
            {} as Record<string, any>
          ),
        },
        isDirty: false,
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
        isValid: action.payload.length === 0,
      };
      
    case 'START_EXECUTION':
      console.log('Starting execution:', action.payload);
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
      console.log('Ending execution:', action.payload);
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
      console.log('Loading template:', action.payload);
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
        logs: [
          ...state.logs,
          {
            id: uuidv4(),
            timestamp: new Date(),
            action: action.payload,
            user: 'system',
          },
        ],
      };
      
    case 'UPDATE_UO_CONFIG': {
      console.log('Updating UO config:', action.payload);
      const newData = {
        ...state.data,
        unitOperation: {
          ...state.data.unitOperation,
          enabledPrimitives: action.payload.enabledPrimitives
        }
      };
      
      return {
        ...state,
        data: newData,
        validationErrors: validateNodeData(newData),
        isDirty: true,
        logs: [
          ...state.logs,
          createLogEntry({
            type: 'UO_CONFIG_UPDATE',
            enabledPrimitives: action.payload.enabledPrimitives
          })
        ]
      };
    }
      
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
    }, [state.logs]),

    updateUOConfig: useCallback((enabledPrimitives: string[]) => {
      dispatch({
        type: 'UPDATE_UO_CONFIG',
        payload: { enabledPrimitives }
      });
    }, [])
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
