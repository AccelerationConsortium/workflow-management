import React, { useState } from 'react';
import { Primitive } from '../types/workflow';
import './PrimitiveEditor.css';

interface PrimitiveEditorProps {
  primitive: Primitive;
  onChange: (primitive: Primitive) => void;
}

export const PrimitiveEditor: React.FC<PrimitiveEditorProps> = ({
  primitive,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="primitive-editor">
      <div className="primitive-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="primitive-title">
          <span className="order-badge">{primitive.order}</span>
          <input
            value={primitive.name}
            onChange={(e) => onChange({
              ...primitive,
              name: e.target.value
            })}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>
      
      {isExpanded && (
        <div className="primitive-content">
          <div className="description-field">
            <label>Description:</label>
            <textarea
              value={primitive.description || ''}
              onChange={(e) => onChange({
                ...primitive,
                description: e.target.value
              })}
              placeholder="Add description..."
            />
          </div>
          
          <div className="code-editor">
            <label>Python Code:</label>
            <textarea
              value={primitive.pythonCode}
              onChange={(e) => onChange({
                ...primitive,
                pythonCode: e.target.value
              })}
              placeholder="# Add your Python code here"
              rows={5}
            />
          </div>

          {primitive.parameters && (
            <div className="parameters-section">
              <label>Parameters:</label>
              {primitive.parameters.map((param, index) => (
                <div key={index} className="parameter-row">
                  <input
                    value={param.name}
                    onChange={(e) => {
                      const newParams = [...primitive.parameters!];
                      newParams[index] = { ...param, name: e.target.value };
                      onChange({
                        ...primitive,
                        parameters: newParams
                      });
                    }}
                    placeholder="Parameter name"
                  />
                  <input
                    value={param.type}
                    onChange={(e) => {
                      const newParams = [...primitive.parameters!];
                      newParams[index] = { ...param, type: e.target.value };
                      onChange({
                        ...primitive,
                        parameters: newParams
                      });
                    }}
                    placeholder="Type"
                  />
                  <button onClick={() => {
                    const newParams = primitive.parameters!.filter((_, i) => i !== index);
                    onChange({
                      ...primitive,
                      parameters: newParams
                    });
                  }}>×</button>
                </div>
              ))}
              <button 
                className="add-parameter"
                onClick={() => {
                  const newParam = { name: '', type: '' };
                  onChange({
                    ...primitive,
                    parameters: [...(primitive.parameters || []), newParam]
                  });
                }}
              >
                Add Parameter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 