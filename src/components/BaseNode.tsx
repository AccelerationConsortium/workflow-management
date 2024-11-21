import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { OperationNode } from '../types/workflow';
import { nodeColors } from '../styles/nodeTheme';
import './BaseNode.css';

export const BaseNode: React.FC<{ data: OperationNode }> = ({ data }) => {
  const [selectedTab, setSelectedTab] = useState<'parameters' | 'io' | 'specs'>('parameters');
  const colors = nodeColors[data.category];

  const renderParameters = () => {
    if (!data.parameters?.length) return null;
    return (
      <div className="parameters-section">
        <h4>Parameters</h4>
        {data.parameters.map(param => (
          <div key={param.name} className="parameter-item">
            <div className="param-header">
              <span>{param.label}</span>
              {param.unit && <span className="unit">({param.unit})</span>}
            </div>
            {param.range && (
              <div className="param-range">
                Range: {param.range[0]} - {param.range[1]}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderIO = () => {
    return (
      <div className="io-section">
        {data.inputs && (
          <div className="io-group">
            <h4>Inputs</h4>
            {data.inputs.map(input => (
              <div key={input.id} className="io-item">
                <span className="io-label">{input.label}</span>
                {input.required && <span className="required">*</span>}
                {input.description && (
                  <div className="io-desc">{input.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {data.outputs && (
          <div className="io-group">
            <h4>Outputs</h4>
            {data.outputs.map(output => (
              <div key={output.id} className="io-item">
                <span className="io-label">{output.label}</span>
                {output.description && (
                  <div className="io-desc">{output.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSpecs = () => {
    if (!data.specs) return null;
    return (
      <div className="specs-section">
        <h4>Specifications</h4>
        <div className="spec-item">
          <span>Model:</span> {data.specs.model}
        </div>
        <div className="spec-item">
          <span>Manufacturer:</span> {data.specs.manufacturer}
        </div>
        <div className="spec-item">
          <span>Range:</span> {data.specs.range}
        </div>
        <div className="spec-item">
          <span>Precision:</span> {data.specs.precision}
        </div>
      </div>
    );
  };

  return (
    <div className="node-container">
      {/* 基本的输入/输出连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -5,
          width: 10,
          height: 10,
          background: colors.handle,
          border: '2px solid white',
          zIndex: 1
        }}
      />
      
      <div className="node-inner" style={{ background: colors.background }}>
        <div 
          className="node-header"
          style={{
            borderBottom: `1px solid ${colors.border}`,
            color: colors.border
          }}
        >
          <h3>{data.label}</h3>
          <div className="node-description">{data.description}</div>
        </div>

        <div className="node-tabs">
          <button 
            className={selectedTab === 'parameters' ? 'active' : ''}
            onClick={() => setSelectedTab('parameters')}
            style={{ color: selectedTab === 'parameters' ? colors.border : undefined }}
          >
            Parameters
          </button>
          <button 
            className={selectedTab === 'io' ? 'active' : ''}
            onClick={() => setSelectedTab('io')}
            style={{ color: selectedTab === 'io' ? colors.border : undefined }}
          >
            I/O
          </button>
          {data.specs && (
            <button 
              className={selectedTab === 'specs' ? 'active' : ''}
              onClick={() => setSelectedTab('specs')}
              style={{ color: selectedTab === 'specs' ? colors.border : undefined }}
            >
              Specs
            </button>
          )}
        </div>

        <div className="tab-content">
          {selectedTab === 'parameters' && renderParameters()}
          {selectedTab === 'io' && renderIO()}
          {selectedTab === 'specs' && renderSpecs()}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          right: -5,
          width: 10,
          height: 10,
          background: colors.handle,
          border: '2px solid white',
          zIndex: 1
        }}
      />
    </div>
  );
}; 