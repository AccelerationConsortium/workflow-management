import React from 'react';
import './styles.css';
import { UnitOperation } from '../../types/unitOperation';
import { Tab, Tabs, TextField, Button } from '@mui/material';
import { useState } from 'react';

interface NodePropertiesProps {
  node: {
    id: string;
    type: string;
    data: UnitOperation;
  } | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<UnitOperation>) => void;
}

export const NodeProperties: React.FC<NodePropertiesProps> = ({
  node,
  position,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [editedValues, setEditedValues] = useState<{[key: string]: any}>({});

  if (!node || !position) return null;

  const handleChange = (key: string, value: any) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    if (Object.keys(editedValues).length > 0) {
      onUpdate(node.id, editedValues);
      setEditedValues({});
    }
  };

  return (
    <div 
      className="node-properties"
      style={{ 
        left: position.x,
        top: position.y
      }}
    >
      <div className="header">
        <h3>{node.data.uo_name}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        className="tabs"
      >
        <Tab label="Basic" />
        <Tab label="Advanced" />
      </Tabs>

      <div className="content">
        {activeTab === 0 && (
          <>
            <div className="section">
              <h4>Description</h4>
              <p>{node.data.description}</p>
            </div>

            <div className="section">
              <h4>Parameters</h4>
              {Object.entries(node.data.parameters || {}).map(([key, param]) => (
                <TextField
                  key={key}
                  label={param.label || key}
                  type="number"
                  value={editedValues[key] ?? param.value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  helperText={`${param.unit || ''}`}
                  fullWidth
                  margin="dense"
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 1 && (
          <>
            <div className="section">
              <h4>Environment Settings</h4>
              {Object.entries(node.data.environment || {}).map(([key, value]) => (
                <TextField
                  key={key}
                  label={key}
                  value={editedValues[`environment.${key}`] ?? value}
                  onChange={(e) => handleChange(`environment.${key}`, e.target.value)}
                  fullWidth
                  margin="dense"
                />
              ))}
            </div>

            <div className="section">
              <h4>Hardware</h4>
              <p>{node.data.hardware}</p>
            </div>

            <div className="section">
              <h4>Software</h4>
              <pre>{JSON.stringify(node.data.software, null, 2)}</pre>
            </div>
          </>
        )}

        {Object.keys(editedValues).length > 0 && (
          <div className="actions">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 