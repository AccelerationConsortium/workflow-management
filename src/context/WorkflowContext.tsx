import React, { createContext, useContext, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkflowExecutor, ExecutionContext } from '../utils/workflowExecutor';

interface WorkflowContextType {
  executing: boolean;
  executionResults: Map<string, any>;
  executeWorkflow: (nodes: Node[], edges: Edge[], startNodeId: string) => Promise<void>;
  clearExecution: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [executing, setExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Map<string, any>>(new Map());

  const executeWorkflow = async (nodes: Node[], edges: Edge[], startNodeId: string) => {
    setExecuting(true);
    try {
      const executor = new WorkflowExecutor(nodes, edges);
      const results = await executor.execute(startNodeId);
      setExecutionResults(results);
    } catch (error) {
      console.error('Workflow execution failure:', error);
      throw error;
    } finally {
      setExecuting(false);
    }
  };

  const clearExecution = () => {
    setExecutionResults(new Map());
  };

  return (
    <WorkflowContext.Provider
      value={{
        executing,
        executionResults,
        executeWorkflow,
        clearExecution,
      }}
    >
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