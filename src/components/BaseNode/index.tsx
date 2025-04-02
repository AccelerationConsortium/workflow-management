import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { IconButton, Tooltip } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import './styles.css';

export const BaseNode = ({ data, selected, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(data.expanded ?? true);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`node-container ${selected ? 'selected' : ''} ${isExpanded ? 'expanded' : 'compact'}`}
      onClick={onClick}
    >
      <div className="node-header">
        <div className="node-title">
          <span>{data.label}</span>
          <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
            <IconButton size="small" onClick={toggleExpand}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </div>
        <div className="node-status">
          <span className={`status-indicator ${data.status || 'idle'}`} />
        </div>
      </div>
      
      {isExpanded && data.content && (
        <div className="node-content">
          {data.content}
        </div>
      )}
      
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
