import React from 'react';
import { Handle, Position } from 'reactflow';
import './styles.css';

export const BaseNode = ({ data, selected, onClick }) => {
  return (
    <div 
      className={`node-container ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="node-header">
        <span>{data.label}</span>
        <div className="node-status">
          <span className={`status-indicator ${data.status || 'idle'}`} />
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left}
        style={{ background: '#555' }}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </div>
  );
}; 