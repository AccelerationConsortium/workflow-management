import React, { createContext, useContext, useState, useCallback } from 'react';

type WorkflowMode = 'edit' | 'test' | 'simulation';

interface WorkflowContextType {
  workflowMode: WorkflowMode;
  isSimulating: boolean;
  startSimulation: () => Promise<void>;
  stopSimulation: () => void;
  validateWorkflow: () => Promise<boolean>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('edit');
  const [isSimulating, setIsSimulating] = useState(false);

  const validateWorkflow = useCallback(async () => {
    try {
      // TODO: Implement workflow validation logic
      // - Check all required parameters are set
      // - Validate node connections
      // - Verify device availability
      return true;
    } catch (error) {
      console.error('Workflow validation failed:', error);
      return false;
    }
  }, []);

  const startSimulation = useCallback(async () => {
    try {
      const isValid = await validateWorkflow();
      if (!isValid) {
        throw new Error('Workflow validation failed');
      }

      setWorkflowMode('simulation');
      setIsSimulating(true);

      // TODO: Initialize simulation services
      // - Start LCP service
      // - Connect to MQTT broker
      // - Start device simulators

    } catch (error) {
      console.error('Failed to start simulation:', error);
      setWorkflowMode('edit');
      setIsSimulating(false);
      throw error;
    }
  }, [validateWorkflow]);

  const stopSimulation = useCallback(() => {
    setWorkflowMode('edit');
    setIsSimulating(false);
    
    // TODO: Cleanup simulation services
    // - Stop device simulators
    // - Disconnect from MQTT
    // - Stop LCP service
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        workflowMode,
        isSimulating,
        startSimulation,
        stopSimulation,
        validateWorkflow
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflowContext = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
}; 
