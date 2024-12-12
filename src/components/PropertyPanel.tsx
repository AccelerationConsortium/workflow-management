import React, { useState } from 'react';
import { OperationNode, Primitive } from '../types/workflow';
import { PrimitiveEditor } from './PrimitiveEditor';
import './PropertyPanel.css';

interface PropertyPanelProps {
  node: OperationNode;
  onClose: () => void;
  onSave: (updatedData: Partial<OperationNode>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  node,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'primitives'>('properties');
  const [primitives, setPrimitives] = useState<Primitive[]>(node.primitives || []);

  const handlePrimitiveChange = (updatedPrimitive: Primitive) => {
    const newPrimitives = primitives.map(p => 
      p.id === updatedPrimitive.id ? updatedPrimitive : p
    );
    setPrimitives(newPrimitives);
    onSave({ ...node, primitives: newPrimitives });
  };

  return (
    <div className="property-panel">
      <div className="panel-header">
        <h3>{node.label} Configuration</h3>
        <div className="panel-tabs">
          <button 
            className={activeTab === 'properties' ? 'active' : ''} 
            onClick={() => setActiveTab('properties')}
          >
            Properties
          </button>
          <button 
            className={activeTab === 'primitives' ? 'active' : ''} 
            onClick={() => setActiveTab('primitives')}
          >
            Primitives
          </button>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="panel-content">
        {activeTab === 'properties' ? (
          <>
            <div className="description">{node.description}</div>
            {/* 其他属性编辑字段 */}
          </>
        ) : (
          <div className="primitives-list">
            {primitives.map((primitive) => (
              <PrimitiveEditor
                key={primitive.id}
                primitive={primitive}
                onChange={handlePrimitiveChange}
              />
            ))}
            <button 
              className="add-primitive"
              onClick={() => {
                const newPrimitive: Primitive = {
                  id: `primitive-${Date.now()}`,
                  name: 'New Primitive',
                  pythonCode: '# Add your Python code here\n',
                  order: primitives.length + 1
                };
                setPrimitives([...primitives, newPrimitive]);
              }}
            >
              Add Primitive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 