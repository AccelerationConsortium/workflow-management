import React, { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { OperationNode } from '../types/workflow';
import { nodeColors } from '../styles/nodeTheme';
import './BaseNode.css';

export const BaseNode: React.FC<{ data: OperationNode }> = ({ data }) => {
  const [selectedTab, setSelectedTab] = useState<'parameters' | 'io' | 'specs' | 'primitives'>('parameters');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefs = useRef<HTMLInputElement[]>([]);

  const handleFileUpload = (inputId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 处理文件上传
      console.log(`Uploading file for input ${inputId}:`, file);
      // TODO: 添加文件处理逻辑
    }
  };

  const handleUploadClick = (inputId: string) => () => {
    fileInputRefs.current[inputId]?.click();
  };

  const colors = nodeColors[data.category] || {
    handle: '#555',
    border: '#ddd',
    background: 'white',
    text: '#333'
  };

  return (
    <div className="node-container">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: colors.handle }}
      />
      
      <div className="node-inner" style={{ background: colors.background }}>
        <div className="node-header">
          <h3>{data.label}</h3>
          <div className="node-description">{data.description}</div>
        </div>

        <div className="node-tabs">
          <button
            className={selectedTab === 'parameters' ? 'active' : ''}
            onClick={() => setSelectedTab('parameters')}
          >
            Parameters
          </button>
          <button
            className={selectedTab === 'io' ? 'active' : ''}
            onClick={() => setSelectedTab('io')}
          >
            I/O
          </button>
          <button
            className={selectedTab === 'specs' ? 'active' : ''}
            onClick={() => setSelectedTab('specs')}
          >
            Specs
          </button>
          <button
            className={selectedTab === 'primitives' ? 'active' : ''}
            onClick={() => setSelectedTab('primitives')}
          >
            Primitives
          </button>
        </div>

        <div className="node-content">
          {selectedTab === 'parameters' && data.parameters && (
            <div className="parameters-list">
              {data.parameters.map((param, index) => (
                <div key={index} className="parameter-item">
                  <div className="param-header">
                    <span>{param.label}</span>
                    {param.unit && <span className="unit">{param.unit}</span>}
                  </div>
                  <div>{param.default}</div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'io' && (
            <div className="tab-content">
              {data.inputs && (
                <div className="io-group">
                  <h4>Inputs</h4>
                  {data.inputs.map((input) => (
                    <div key={input.id} className="io-item">
                      <div className="io-header">
                        <span>{input.label}</span>
                        {input.required && <span className="required">*</span>}
                        <button 
                          className="io-upload-button"
                          onClick={handleUploadClick(input.id)}
                          title="Upload data file"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
                          </svg>
                        </button>
                        <input
                          type="file"
                          ref={el => fileInputRefs.current[input.id] = el}
                          style={{ display: 'none' }}
                          onChange={handleFileUpload(input.id)}
                          accept=".csv,.xlsx,.json"
                        />
                      </div>
                      {input.description && (
                        <div className="io-desc">{input.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {data.outputs && (
                <div className="io-section">
                  <h4>Outputs</h4>
                  {data.outputs.map((output, index) => (
                    <div key={index} className="io-item">
                      <div>{output.label}</div>
                      <div className="io-desc">{output.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'specs' && data.specs && (
            <div className="specs-list">
              {Object.entries(data.specs).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <div className="spec-label">{key}</div>
                  <div>{value}</div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'primitives' && (
            <div className="node-content">
              {data.primitives && data.primitives.length > 0 ? (
                data.primitives.map((primitive) => (
                  <div key={primitive.id} className="primitive-item">
                    <div className="primitive-header">
                      <span className="order-badge">{primitive.order}</span>
                      <span className="primitive-name">{primitive.name}</span>
                    </div>
                    {primitive.description && (
                      <div className="primitive-description">{primitive.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-primitives">No primitives defined</div>
              )}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: colors.handle }}
      />
    </div>
  );
}; 