import React, { useState } from 'react';
import './styles.css';

interface EdgeConfigProps {
  edge: any;
  onClose: () => void;
  onUpdate: (edge: any) => void;
}

export const EdgeConfig: React.FC<EdgeConfigProps> = ({ edge, onClose, onUpdate }) => {
  const [config, setConfig] = useState({
    delay: edge.data?.delay || 0,
    condition: edge.data?.condition || '',
    description: edge.data?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...edge,
      data: {
        ...edge.data,
        ...config
      }
    });
    onClose();
  };

  return (
    <div className="edge-config-popup">
      <div className="popup-header">
        <h3>Configure {edge.label} Connection</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <form onSubmit={handleSubmit} className="popup-content">
        {edge.type === 'sequential' && (
          <div className="config-field">
            <label>Delay (seconds)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={config.delay}
              onChange={(e) => setConfig({ ...config, delay: parseFloat(e.target.value) })}
            />
          </div>
        )}

        {edge.type === 'conditional' && (
          <div className="config-field">
            <label>Condition</label>
            <input
              type="text"
              value={config.condition}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              placeholder="e.g. temperature > 25"
            />
          </div>
        )}

        <div className="config-field">
          <label>Description</label>
          <textarea
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            placeholder="Add a description for this connection..."
          />
        </div>

        <div className="button-group">
          <button type="submit" className="save-button">Save</button>
          <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  );
}; 