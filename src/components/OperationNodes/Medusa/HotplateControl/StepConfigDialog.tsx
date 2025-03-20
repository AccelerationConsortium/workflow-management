import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Typography
} from '@mui/material';

interface StepConfig {
  type: 'setTemperature' | 'setStirring' | 'waitTemperature';
  parameters: {
    temperature?: number;
    stirringSpeed?: number;
    targetTemp?: number;
    tolerance?: number;
    timeout?: number;
  };
}

interface StepConfigDialogProps {
  open: boolean;
  stepType: StepConfig['type'];
  currentConfig: StepConfig['parameters'];
  onClose: () => void;
  onSave: (config: StepConfig['parameters']) => void;
}

export const StepConfigDialog: React.FC<StepConfigDialogProps> = ({
  open,
  stepType,
  currentConfig,
  onClose,
  onSave
}) => {
  const [config, setConfig] = React.useState(currentConfig);

  React.useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTitle = () => {
    switch (stepType) {
      case 'setTemperature':
        return 'Set Temperature Parameters';
      case 'setStirring':
        return 'Set Stirring Parameters';
      case 'waitTemperature':
        return 'Wait Temperature Parameters';
      default:
        return 'Configure Step';
    }
  };

  const renderContent = () => {
    switch (stepType) {
      case 'setTemperature':
        return (
          <>
            <TextField
              label="Target Temperature (°C)"
              type="number"
              value={config.temperature || ''}
              onChange={(e) => handleChange('temperature', Number(e.target.value))}
              fullWidth
              margin="normal"
            />
          </>
        );
      case 'setStirring':
        return (
          <>
            <TextField
              label="Stirring Speed (rpm)"
              type="number"
              value={config.stirringSpeed || ''}
              onChange={(e) => handleChange('stirringSpeed', Number(e.target.value))}
              fullWidth
              margin="normal"
            />
          </>
        );
      case 'waitTemperature':
        return (
          <>
            <TextField
              label="Target Temperature (°C)"
              type="number"
              value={config.targetTemp || ''}
              onChange={(e) => handleChange('targetTemp', Number(e.target.value))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Temperature Tolerance (±°C)"
              type="number"
              value={config.tolerance || ''}
              onChange={(e) => handleChange('tolerance', Number(e.target.value))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Timeout (seconds)"
              type="number"
              value={config.timeout || ''}
              onChange={(e) => handleChange('timeout', Number(e.target.value))}
              fullWidth
              margin="normal"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Configure the parameters for this step. These settings will be saved to the workflow but not executed immediately.
        </Typography>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(config)} color="primary">
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 
