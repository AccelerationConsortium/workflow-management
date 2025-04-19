import React, { useState } from 'react';
import { WorkflowValidator, ValidationProgress, ValidationResult } from '../services/workflowValidator';
import { ValidationProgressBar } from './ValidationProgress';
import { ErrorDialog } from './ErrorDialog';
import './WorkflowSimulator.css';

interface WorkflowSimulatorProps {
  workflow: WorkflowData;
}

export const WorkflowSimulator: React.FC<WorkflowSimulatorProps> = ({ workflow }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [validationProgress, setValidationProgress] = useState<ValidationProgress | null>(null);
  const [validationError, setValidationError] = useState<ValidationResult | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleSimulation = async () => {
    setIsSimulating(true);
    setValidationProgress(null);
    setValidationError(null);
    setShowErrorDialog(false);
    
    const validator = new WorkflowValidator(setValidationProgress);
    
    try {
      const result = await validator.validateWorkflow(workflow);
      
      if (result.isValid) {
        console.log('Validation successful!');
        // TODO: Continue with workflow execution
      } else {
        console.error('Validation failed:', result.errors);
        setValidationError(result);
        setShowErrorDialog(true);
      }
    } catch (error: unknown) {
      console.error('Simulation error:', error);
      setValidationError({
        isValid: false,
        errors: [String(error)]
      });
      setShowErrorDialog(true);
    } finally {
      setIsSimulating(false);
      // Keep progress bar visible for a while after completion
      setTimeout(() => {
        if (!validationError) {  // Only clear if no errors
          setValidationProgress(null);
        }
      }, 2000);
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

      {/* Always show progress bar during validation */}
      {validationProgress && (
        <ValidationProgressBar progress={validationProgress} />
      )}

      {/* Show error dialog when validation fails */}
      {validationError && (
        <ErrorDialog
          open={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          validationResult={validationError}
        />
      )}
    </div>
  );
}; 
