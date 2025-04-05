import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Node, Edge } from 'reactflow';
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

type WorkflowActionType = 
  | 'SET_WORKFLOWS'
  | 'SET_CURRENT_WORKFLOW'
  | 'ADD_STEP'
  | 'UPDATE_STEP'
  | 'DELETE_STEP'
  | 'SET_SELECTED_STEP'
  | 'SET_SELECTED_NODES'
  | 'SET_WORKFLOW_CREATING'
  | 'ADD_NODES_TO_STEP'
  | 'SET_NODES'
  | 'SET_EDGES'
  | 'REMOVE_NODE'
  | 'REMOVE_EDGES';

type WorkflowAction =
  | { type: 'SET_WORKFLOWS'; payload: Workflow[] }
  | { type: 'SET_CURRENT_WORKFLOW'; payload: Workflow | null }
  | { type: 'ADD_STEP'; payload: WorkflowStep }
  | { type: 'UPDATE_STEP'; payload: { stepId: string; step: Partial<WorkflowStep> } }
  | { type: 'DELETE_STEP'; payload: string }
  | { type: 'SET_SELECTED_STEP'; payload: string | null }
  | { type: 'SET_SELECTED_NODES'; payload: string[] }
  | { type: 'SET_WORKFLOW_CREATING'; payload: boolean }
  | { type: 'ADD_NODES_TO_STEP'; payload: { stepId: string; nodeIds: string[] } }
  | { type: 'SET_NODES'; payload: Node[] }
  | { type: 'SET_EDGES'; payload: Edge[] }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'REMOVE_EDGES'; payload: string };

const workflowReducer = (state: WorkflowState, action: WorkflowAction): WorkflowState => {
  console.log('WorkflowContext reducer:', action.type, action.payload);
  console.log('Current state:', state);

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
              ? { ...step, ...action.payload.step }
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
    
    case 'SET_NODES': {
      console.log('处理 SET_NODES action');
      console.log('新的节点列表:', action.payload);
      return { ...state, nodes: action.payload };
    }
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    
    case 'REMOVE_NODE': {
      console.log('处理 REMOVE_NODE action');
      console.log('要删除的节点 ID:', action.payload);
      
      // 1. 从节点列表中移除节点
      const updatedNodes = state.nodes.filter(node => node.id !== action.payload);
      
      // 2. 从边列表中移除相关边
      const updatedEdges = state.edges.filter(
        edge => edge.source !== action.payload && edge.target !== action.payload
      );
      
      // 3. 从选中节点列表中移除
      const updatedSelectedNodeIds = state.selectedNodeIds.filter(id => id !== action.payload);
      
      // 4. 如果当前工作流存在，更新工作流中的节点
      const updatedWorkflow = state.currentWorkflow
        ? {
            ...state.currentWorkflow,
            steps: state.currentWorkflow.steps.map(step => ({
              ...step,
              nodeIds: step.nodeIds.filter(id => id !== action.payload)
            }))
          }
        : null;
      
      console.log('删除后的状态:', {
        nodes: updatedNodes,
        edges: updatedEdges,
        selectedNodeIds: updatedSelectedNodeIds
      });
      
      return {
        ...state,
        nodes: updatedNodes,
        edges: updatedEdges,
        selectedNodeIds: updatedSelectedNodeIds,
        currentWorkflow: updatedWorkflow
      };
    }
    
    case 'REMOVE_EDGES': {
      console.log('处理 REMOVE_EDGES action');
      console.log('要删除相关边的节点 ID:', action.payload);
      
      // 删除与指定节点相关的所有边
      const updatedEdges = state.edges.filter(
        edge => edge.source !== action.payload && edge.target !== action.payload
      );
      
      console.log('更新后的边列表:', updatedEdges);
      
      return {
        ...state,
        edges: updatedEdges
      };
    }
    
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
