import React, { useState } from 'react';
import './styles.css';
import { UnitOperation } from '../../types/unitOperation';
import { Tab, Tabs, TextField, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { StepConfigDialog } from '../OperationNodes/Medusa/HotplateControl/StepConfigDialog';

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
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<{
    type: 'setTemperature' | 'setStirring' | 'waitTemperature' | 'activate' | 'deactivate' | 'setMode';
    index: number;
  } | null>(null);

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

  const handleStepClick = (type: 'setTemperature' | 'setStirring' | 'waitTemperature' | 'activate' | 'deactivate' | 'setMode', index: number) => {
    setSelectedStep({ type, index });
    setConfigDialogOpen(true);
  };

  const handleStepConfigSave = (config: any) => {
    if (!selectedStep) return;

    const steps = [...(node.data.steps || [])];
    steps[selectedStep.index] = {
      ...steps[selectedStep.index],
      parameters: config
    };

    onUpdate(node.id, { steps });
    setConfigDialogOpen(false);
    setSelectedStep(null);
  };

  const renderPrimitives = () => {
    if (node.type !== 'HotplateControl' && node.type !== 'Activation') return null;

    const steps = node.type === 'Activation' ? [
      { type: 'activate', label: 'Activate Device' },
      { type: 'deactivate', label: 'Deactivate Device' },
      { type: 'setMode', label: 'Set Operation Mode' }
    ] : [
      { type: 'setTemperature', label: 'Set Temperature' },
      { type: 'setStirring', label: 'Set Stirring' },
      { type: 'waitTemperature', label: 'Wait for Temperature' }
    ];

    return (
      <List>
        {steps.map((step, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={() => handleStepClick(step.type as any, index)}
              >
                <SettingsIcon />
              </IconButton>
            }
          >
            <ListItemText 
              primary={step.label}
              secondary={
                node.data.steps?.[index]?.parameters 
                  ? JSON.stringify(node.data.steps[index].parameters)
                  : 'Not configured'
              }
            />
          </ListItem>
        ))}
      </List>
    );
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
        {(node.type === 'HotplateControl' || node.type === 'Activation') && <Tab label="Primitives" />}
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

        {activeTab === 2 && (node.type === 'HotplateControl' || node.type === 'Activation') && (
          <div className="section">
            <h4>Operation Steps</h4>
            {renderPrimitives()}
          </div>
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

      {selectedStep && (
        <StepConfigDialog
          open={configDialogOpen}
          stepType={selectedStep.type}
          currentConfig={node.data.steps?.[selectedStep.index]?.parameters || {}}
          onClose={() => {
            setConfigDialogOpen(false);
            setSelectedStep(null);
          }}
          onSave={handleStepConfigSave}
        />
      )}
    </div>
  );
}; 
