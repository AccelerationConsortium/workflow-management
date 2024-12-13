import React, { useState } from 'react';
import { WorkflowValidator, ValidationProgress } from '../services/workflowValidator';
import { ValidationProgressBar } from './ValidationProgress';
import './WorkflowSimulator.css';

interface WorkflowSimulatorProps {
  workflow: WorkflowData;
}

export const WorkflowSimulator: React.FC<WorkflowSimulatorProps> = ({ workflow }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [validationProgress, setValidationProgress] = useState<ValidationProgress | null>(null);

  const handleSimulation = async () => {
    setIsSimulating(true);
    setValidationProgress(null);
    
    const validator = new WorkflowValidator(setValidationProgress);
    
    try {
      const result = await validator.validateWorkflow(workflow);
      
      if (result.isValid) {
        console.log('Validation successful!');
        // TODO: 继续执行工作流
      } else {
        console.error('Validation failed:', result.errors);
        // TODO: 显示错误信息
      }
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
      // 延迟清除进度条
      setTimeout(() => setValidationProgress(null), 2000);
    }
  };

  return (
    <div className="workflow-simulator">
      <button 
        onClick={handleSimulation}
        disabled={isSimulating}
        className="simulate-button"
      >
        {isSimulating ? 'Simulating...' : 'Run Simulation'}
      </button>

      {validationProgress && (
        <ValidationProgressBar progress={validationProgress} />
      )}
    </div>
  );
}; 