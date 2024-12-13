import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Workflow, WorkflowStep } from '../types/workflow';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  selectedStepId: string | null;
  selectedNodeIds: string[];
  isCreatingWorkflow: boolean;
  selectedEdgeIds: string[];
  contextMenuPosition: { x: number; y: number } | null;
  nodes: Node[];
  edges: Edge[];
}

type WorkflowAction =
  | { type: 'SET_WORKFLOWS'; payload: Workflow[] }
  | { type: 'SET_CURRENT_WORKFLOW'; payload: Workflow | null }
  | { type: 'ADD_STEP'; payload: WorkflowStep }
  | { type: 'UPDATE_STEP'; payload: { stepId: string; updates: Partial<WorkflowStep> } }
  | { type: 'DELETE_STEP'; payload: string }
  | { type: 'SET_SELECTED_STEP'; payload: string | null }
  | { type: 'SET_SELECTED_NODES'; payload: string[] }
  | { type: 'SET_WORKFLOW_CREATING'; payload: boolean }
  | { type: 'ADD_NODES_TO_STEP'; payload: { stepId: string; nodeIds: string[] } }
  | { type: 'SET_SELECTED_ELEMENTS'; payload: { nodeIds: string[]; edgeIds: string[] } }
  | { type: 'SET_CONTEXT_MENU_POSITION'; payload: { x: number; y: number } | null }
  | { type: 'SET_NODES'; payload: Node[] }
  | { type: 'SET_EDGES'; payload: Edge[] };

const workflowReducer = (state: WorkflowState, action: WorkflowAction): WorkflowState => {
  switch (action.type) {
    case 'SET_WORKFLOWS':
      return { ...state, workflows: action.payload };
    
    case 'SET_CURRENT_WORKFLOW':
      return { ...state, currentWorkflow: action.payload };
    
    case 'ADD_STEP':
      if (!state.currentWorkflow) return state;
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          steps: [...state.currentWorkflow.steps, action.payload]
        }
      };
    
    case 'UPDATE_STEP':
      if (!state.currentWorkflow) return state;
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          steps: state.currentWorkflow.steps.map(step =>
            step.id === action.payload.stepId
              ? { ...step, ...action.payload.updates }
              : step
          )
        }
      };
    
    case 'DELETE_STEP':
      if (!state.currentWorkflow) return state;
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          steps: state.currentWorkflow.steps.filter(
            step => step.id !== action.payload
          )
        }
      };
    
    case 'SET_SELECTED_STEP':
      return { ...state, selectedStepId: action.payload };
    
    case 'SET_SELECTED_NODES':
      return { ...state, selectedNodeIds: action.payload };
    
    case 'SET_WORKFLOW_CREATING':
      return { ...state, isCreatingWorkflow: action.payload };
    
    case 'ADD_NODES_TO_STEP':
      if (!state.currentWorkflow) return state;
      return {
        ...state,
        currentWorkflow: {
          ...state.currentWorkflow,
          steps: state.currentWorkflow.steps.map(step =>
            step.id === action.payload.stepId
              ? { ...step, nodeIds: [...step.nodeIds, ...action.payload.nodeIds] }
              : step
          )
        }
      };
    
    case 'SET_SELECTED_ELEMENTS':
      return {
        ...state,
        selectedNodeIds: action.payload.nodeIds,
        selectedEdgeIds: action.payload.edgeIds
      };
    
    case 'SET_CONTEXT_MENU_POSITION':
      return { ...state, contextMenuPosition: action.payload };
    
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    
    default:
      return state;
  }
};

const WorkflowContext = createContext<{
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
} | null>(null);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, {
    workflows: [],
    currentWorkflow: null,
    selectedStepId: null,
    selectedNodeIds: [],
    isCreatingWorkflow: false,
    selectedEdgeIds: [],
    contextMenuPosition: null,
    nodes: [],
    edges: []
  });

  return (
    <WorkflowContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}; 