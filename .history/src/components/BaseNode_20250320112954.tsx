import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { OperationNode } from '../types/workflow';
import { nodeColors } from '../styles/nodeTheme';
import { FileUploader } from './FileUploader';
import './BaseNode.css';

export const BaseNode: React.FC<{ data: OperationNode }> = ({ data }) => {
  const [selectedTab, setSelectedTab] = useState<'parameters' | 'io' | 'specs' | 'primitives'>('parameters');

  const handleUploadComplete = (inputId: string) => (result: any) => {
    console.log('File upload complete for input:', inputId, result);
    
    if (data.onDataChange) {
      data.onDataChange({
        ...data,
        inputs: data.inputs?.map(input => 
          input.id === inputId 
            ? { 
                ...input, 
                value: {
                  fileName: result.fileName,
                  fileType: result.fileType,
                  data: result.data
                }
              }
            : input
        )
      });
    }
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
                        <FileUploader
                          inputId={input.id}
                          nodeId={data.id}
                          onUploadComplete={handleUploadComplete(input.id)}
                        />
                      </div>
                      {input.description && (
                        <div className="io-desc">{input.description}</div>
                      )}
                      {input.value?.fileName && (
                        <div className="io-file-info">
                          Uploaded: {input.value.fileName}
                        </div>
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
