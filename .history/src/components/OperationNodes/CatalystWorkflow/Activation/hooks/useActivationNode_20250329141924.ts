import { useReducer, useCallback, useEffect } from 'react';
import {
  ActivationNodeData,
  ParameterValue,
  ValidationError,
  PrimitiveConfig,
  ExecutionStatus,
} from '../types';
import { createParameterSchema } from '../parameterSchemas';

// Action types
type Action =
  | { type: 'LOAD_DATA'; payload: ActivationNodeData }
  | { type: 'TOGGLE_PRIMITIVE'; payload: { primitiveId: string; enabled: boolean } }
  | {
      type: 'UPDATE_PARAMETER';
      payload: {
        primitiveId: string;
        parameterId: string;
        value: ParameterValue;
      };
    }
  | { type: 'RESET_PRIMITIVE'; payload: { primitiveId: string } }
  | { type: 'RESET_ALL' }
  | { type: 'SET_EXECUTION_STATUS'; payload: ExecutionStatus }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] };

interface State {
  data: ActivationNodeData;
  validationErrors: ValidationError[];
  executionStatus: ExecutionStatus;
  isDirty: boolean;
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
      const { primitiveId, parameterId, value } = action.payload;
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
      return {
        ...state,
        data: newData,
        validationErrors: validateNodeData(newData),
        isDirty: true,
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
  };

  return {
    state,
    actions,
  };
}; 
