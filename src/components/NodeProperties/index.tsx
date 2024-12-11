import React from 'react';
import './styles.css';

interface NodePropertiesProps {
  node: {
    id: string;
    type: string;
    data: any;
  } | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export const NodeProperties: React.FC<NodePropertiesProps> = ({ node, position, onClose }) => {
  if (!node || !position) return null;

  return (
    <div 
      className="properties-popup"
      style={{
        left: position.x + 'px',
        top: position.y + 'px'
      }}
    >
      <div className="popup-header">
        <h3>{node.data.label}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="popup-content">
        <div className="section">
          <p className="description">{node.data.description}</p>
        </div>

        {node.data.parameters?.length > 0 && (
          <div className="section">
            <h4>Parameters</h4>
            {node.data.parameters.map((param, index) => (
              <div key={index} className="parameter-row">
                <label>{param.label}</label>
                <div className="input-group">
                  <input
                    type={param.type === 'number' ? 'number' : 'text'}
                    defaultValue={param.value || ''}
                    placeholder={`Enter ${param.label.toLowerCase()}`}
                  />
                  {param.unit && <span className="unit">{param.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {node.data.specs && (
          <div className="section">
            <h4>Specifications</h4>
            {Object.entries(node.data.specs).map(([key, value]) => (
              <div key={key} className="spec-row">
                <span className="spec-key">{key}:</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 