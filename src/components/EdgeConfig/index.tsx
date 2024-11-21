import React, { useState } from 'react';
import { Edge } from 'reactflow';
import { ConnectionType } from '../types/workflow';

interface EdgeConfigProps {
  edge: Edge;
  onClose: () => void;
  onUpdate: (edge: Edge) => void;
}

export const EdgeConfig: React.FC<EdgeConfigProps> = ({
  edge,
  onClose,
  onUpdate,
}) => {
  const [config, setConfig] = useState({
    delay: edge.data?.delay || 0,
    triggerFile: edge.data?.triggerFile || '',
  });

  return (
    <div className="edge-config">
      <h3>Configure Connection</h3>
      
      {edge.type === 'sequential' && (
        <>
          <div className="config-field">
            <label>Delay (seconds)</label>
            <input
              type="number"
              value={config.delay}
              onChange={e => setConfig(prev => ({ ...prev, delay: Number(e.target.value) }))}
              min="0"
            />
          </div>
          <div className="config-field">
            <label>Trigger File (YAML)</label>
            <input
              type="file"
              accept=".yml,.yaml"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setConfig(prev => ({ ...prev, triggerFile: file.name }));
                }
              }}
            />
            <div className="file-status">
              {config.triggerFile ? `Selected: ${config.triggerFile}` : 'No file selected'}
            </div>
          </div>
        </>
      )}

      {edge.type === 'conditional' && (
        <div className="config-field">
          <label>Condition Expression</label>
          <input
            type="text"
            placeholder="e.g., temperature > 37"
            value={config.condition || ''}
            onChange={e => setConfig(prev => ({ ...prev, condition: e.target.value }))}
          />
        </div>
      )}
      
      <div className="button-group">
        <button onClick={() => {
          onUpdate({
            ...edge,
            data: config,
            label: config.delay ? `Delay ${config.delay}s` : 
                   config.triggerFile ? `Trigger: ${config.triggerFile}` : 
                   config.condition ? `If: ${config.condition}` :
                   edge.type
          });
          onClose();
        }}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}; 