import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import { useWorkflow } from '../context/WorkflowContext';
import './Canvas.css';
import { WorkflowStepPanel } from './WorkflowStepPanel';

export const Canvas: React.FC = () => {
  const { state } = useWorkflow();

  return (
    <div className="canvas-container">
      <ReactFlow
        nodes={state.nodes}
        edges={state.edges}
        nodesDraggable={true}
      >
        <Background />
        <Controls />
      </ReactFlow>
      {state.isCreatingWorkflow && <WorkflowStepPanel />}
    </div>
  );
}; 