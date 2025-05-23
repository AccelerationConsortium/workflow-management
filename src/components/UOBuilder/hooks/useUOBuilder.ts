/**
 * Custom hook for managing UO Builder state
 */

import { useReducer, useCallback, useMemo } from 'react';
import { 
  UOBuilderState, 
  UOComponent, 
  BuilderAction, 
  BuilderValidation,
  ValidationError,
  GeneratedUOSchema,
  GeneratedParameter,
  ComponentType
} from '../types';

// Initial state
const initialState: UOBuilderState = {
  name: '',
  description: '',
  category: '',
  components: [],
  previewMode: false
};

// Reducer function
function builderReducer(state: UOBuilderState, action: BuilderAction): UOBuilderState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    
    case 'ADD_COMPONENT':
      return { 
        ...state, 
        components: [...state.components, { ...action.payload, id: generateId() }]
      };
    
    case 'UPDATE_COMPONENT':
      return {
        ...state,
        components: state.components.map(comp =>
          comp.id === action.payload.id 
            ? { ...comp, ...action.payload.updates }
            : comp
        )
      };
    
    case 'REMOVE_COMPONENT':
      return {
        ...state,
        components: state.components.filter(comp => comp.id !== action.payload)
      };
    
    case 'MOVE_COMPONENT':
      return {
        ...state,
        components: state.components.map(comp =>
          comp.id === action.payload.id
            ? { ...comp, position: action.payload.position }
            : comp
        )
      };
    
    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.payload };
    
    case 'RESET_BUILDER':
      return initialState;
    
    case 'LOAD_UO':
      return action.payload;
    
    default:
      return state;
  }
}

// Helper function to generate unique IDs
function generateId(): string {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useUOBuilder() {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  // Actions
  const setName = useCallback((name: string) => {
    dispatch({ type: 'SET_NAME', payload: name });
  }, []);

  const setDescription = useCallback((description: string) => {
    dispatch({ type: 'SET_DESCRIPTION', payload: description });
  }, []);

  const setCategory = useCallback((category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  }, []);

  const addComponent = useCallback((component: Omit<UOComponent, 'id'>) => {
    dispatch({ type: 'ADD_COMPONENT', payload: component as UOComponent });
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<UOComponent>) => {
    dispatch({ type: 'UPDATE_COMPONENT', payload: { id, updates } });
  }, []);

  const removeComponent = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_COMPONENT', payload: id });
  }, []);

  const moveComponent = useCallback((id: string, position: { x: number; y: number }) => {
    dispatch({ type: 'MOVE_COMPONENT', payload: { id, position } });
  }, []);

  const setPreviewMode = useCallback((previewMode: boolean) => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload: previewMode });
  }, []);

  const resetBuilder = useCallback(() => {
    dispatch({ type: 'RESET_BUILDER' });
  }, []);

  const loadUO = useCallback((uoState: UOBuilderState) => {
    dispatch({ type: 'LOAD_UO', payload: uoState });
  }, []);

  // Validation
  const validation = useMemo((): BuilderValidation => {
    const errors: ValidationError[] = [];

    // Validate basic info
    if (!state.name.trim()) {
      errors.push({
        field: 'name',
        message: 'UO name is required',
        severity: 'error'
      });
    }

    if (!state.description.trim()) {
      errors.push({
        field: 'description',
        message: 'UO description is required',
        severity: 'error'
      });
    }

    if (!state.category.trim()) {
      errors.push({
        field: 'category',
        message: 'UO category is required',
        severity: 'error'
      });
    }

    // Validate components
    state.components.forEach(component => {
      if (!component.label.trim()) {
        errors.push({
          componentId: component.id,
          field: 'label',
          message: 'Component label is required',
          severity: 'error'
        });
      }

      // Type-specific validation
      switch (component.type) {
        case ComponentType.SELECT:
          const selectComp = component as any;
          if (!selectComp.options || selectComp.options.length === 0) {
            errors.push({
              componentId: component.id,
              field: 'options',
              message: 'Select component must have at least one option',
              severity: 'error'
            });
          }
          break;

        case ComponentType.NUMBER_INPUT:
          const numberComp = component as any;
          if (numberComp.min !== undefined && numberComp.max !== undefined && numberComp.min >= numberComp.max) {
            errors.push({
              componentId: component.id,
              field: 'range',
              message: 'Minimum value must be less than maximum value',
              severity: 'error'
            });
          }
          break;

        case ComponentType.RANGE_SLIDER:
          const rangeComp = component as any;
          if (rangeComp.min >= rangeComp.max) {
            errors.push({
              componentId: component.id,
              field: 'range',
              message: 'Minimum value must be less than maximum value',
              severity: 'error'
            });
          }
          break;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }, [state]);

  // Generate schema
  const generateSchema = useCallback((): GeneratedUOSchema => {
    const parameters: GeneratedParameter[] = state.components.map(component => {
      const baseParam: GeneratedParameter = {
        id: component.id,
        name: component.label,
        type: getParameterType(component.type),
        required: component.required,
        description: component.description
      };

      // Add type-specific properties
      switch (component.type) {
        case ComponentType.SELECT:
          const selectComp = component as any;
          baseParam.type = 'enum';
          baseParam.validation = { options: selectComp.options };
          baseParam.defaultValue = selectComp.defaultValue;
          break;

        case ComponentType.NUMBER_INPUT:
          const numberComp = component as any;
          baseParam.type = 'number';
          baseParam.validation = { min: numberComp.min, max: numberComp.max };
          baseParam.defaultValue = numberComp.defaultValue;
          baseParam.unit = numberComp.unit;
          break;

        case ComponentType.BOOLEAN:
          const boolComp = component as any;
          baseParam.type = 'boolean';
          baseParam.defaultValue = boolComp.defaultValue;
          break;

        case ComponentType.DATE_PICKER:
          const dateComp = component as any;
          baseParam.type = 'date';
          baseParam.defaultValue = dateComp.defaultValue;
          break;

        case ComponentType.RANGE_SLIDER:
          const rangeComp = component as any;
          baseParam.type = 'range';
          baseParam.validation = { min: rangeComp.min, max: rangeComp.max };
          baseParam.defaultValue = rangeComp.defaultValue;
          baseParam.unit = rangeComp.unit;
          break;

        default:
          baseParam.type = 'string';
          baseParam.defaultValue = (component as any).defaultValue;
      }

      return baseParam;
    });

    return {
      id: generateId(),
      name: state.name,
      description: state.description,
      category: state.category,
      parameters,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }, [state]);

  return {
    state,
    actions: {
      setName,
      setDescription,
      setCategory,
      addComponent,
      updateComponent,
      removeComponent,
      moveComponent,
      setPreviewMode,
      resetBuilder,
      loadUO
    },
    validation,
    generateSchema
  };
}

// Helper function to map component types to parameter types
function getParameterType(componentType: ComponentType): 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'range' {
  switch (componentType) {
    case ComponentType.NUMBER_INPUT:
      return 'number';
    case ComponentType.BOOLEAN:
      return 'boolean';
    case ComponentType.DATE_PICKER:
      return 'date';
    case ComponentType.SELECT:
      return 'enum';
    case ComponentType.RANGE_SLIDER:
      return 'range';
    default:
      return 'string';
  }
}
