import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
  stepType: string;
  nodeType: string;
  onSave: (values: any) => void;
  initialValues?: any;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({
  open,
  onClose,
  stepType,
  nodeType,
  onSave,
  initialValues
}) => {
  const [values, setValues] = useState<any>(initialValues || {});

  const getFields = () => {
    if (nodeType === 'HotplateControl') {
      switch (stepType) {
        case 'setTemperature':
          return [
            { name: 'temperature', label: 'Temperature (°C)', type: 'number' }
          ];
        case 'setStirring':
          return [
            { name: 'speed', label: 'Stirring Speed (rpm)', type: 'number' }
          ];
        case 'waitTemperature':
          return [
            { name: 'targetTemperature', label: 'Target Temperature (°C)', type: 'number' },
            { name: 'tolerance', label: 'Tolerance (°C)', type: 'number' }
          ];
        default:
          return [];
      }
    } else if (nodeType === 'Activation') {
      switch (stepType) {
        case 'activate':
          return [
            { name: 'delay', label: 'Delay (seconds)', type: 'number' }
          ];
        case 'deactivate':
          return [
            { name: 'delay', label: 'Delay (seconds)', type: 'number' }
          ];
        case 'setMode':
          return [
            {
              name: 'mode',
              label: 'Operation Mode',
              type: 'select',
              options: ['manual', 'timed']
            }
          ];
        default:
          return [];
      }
    }
    return [];
  };

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Configure {stepType}</DialogTitle>
      <DialogContent>
        <div className="config-form">
          {getFields().map(field => (
            <div key={field.name} className="form-field">
              <label>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={values[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                >
                  {field.options?.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={values[field.name] || ''}
                  onChange={e => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave}>Save</button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigDialog; 
