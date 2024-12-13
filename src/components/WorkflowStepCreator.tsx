import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import './WorkflowStepCreator.css';

interface WorkflowStepCreatorProps {
  position: { x: number; y: number };
  onClose: () => void;
}

export const WorkflowStepCreator: React.FC<WorkflowStepCreatorProps> = ({
  position,
  onClose
}) => {
  const { state, dispatch } = useWorkflow();
  const [stepName, setStepName] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');

  const handleCreateStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: stepName,
      description,
      objective,
      nodeIds: state.selectedNodeIds,
      order: state.currentWorkflow?.steps.length || 0,
      status: 'pending',
      dependencies: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    dispatch({ type: 'ADD_STEP', payload: newStep });
    dispatch({ type: 'SET_SELECTED_NODES', payload: [] });
    dispatch({ type: 'SET_WORKFLOW_CREATING', payload: false });
    onClose();
  };

  return (
    <div 
      className="workflow-step-creator"
      style={{ left: position.x, top: position.y }}
    >
      <h3>Create Workflow Step</h3>
      <div className="form-group">
        <label>Step Name:</label>
        <input
          type="text"
          value={stepName}
          onChange={e => setStepName(e.target.value)}
          placeholder="Enter step name"
        />
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter step description"
        />
      </div>
      <div className="form-group">
        <label>Objective:</label>
        <textarea
          value={objective}
          onChange={e => setObjective(e.target.value)}
          placeholder="Enter step objective"
        />
      </div>
      <div className="selected-nodes">
        <label>Selected Nodes:</label>
        <div className="node-list">
          {state.selectedNodeIds.map(nodeId => (
            <div key={nodeId} className="node-item">
              {nodeId}
            </div>
          ))}
        </div>
      </div>
      <div className="actions">
        <button onClick={handleCreateStep} disabled={!stepName}>
          Create Step
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}; 