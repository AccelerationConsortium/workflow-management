import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeDialog } from '../NodeDialog';
import './styles.css';

export const BaseNode = ({ data }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleNodeClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleParameterUpdate = (nodeId: string, values: any) => {
    if (data.onParameterUpdate) {
      data.onParameterUpdate(nodeId, values);
    }
  };

  return (
    <>
      <div className="node-container" onClick={handleNodeClick}>
        <div className="node-inner">
          <div className="node-header">
            <span>{data.label}</span>
            <div className="node-status">
              <span className={`status-indicator ${data.status || 'idle'}`} />
            </div>
          </div>
          <div className="node-content">
            {/* 节点的主要内容 */}
          </div>
        </div>
        
        {/* 连接点 */}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>

      <NodeDialog
        open={isDialogOpen}
        node={{ id: data.id, data }}
        onClose={handleDialogClose}
        onParameterUpdate={handleParameterUpdate}
      />
    </>
  );
}; 