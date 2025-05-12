import React, { useState } from 'react';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Button, Paper, Divider } from '@mui/material';
import { ParameterDefinition } from './types';
import './styles.css';

interface BaseUOProps {
  title: string;
  description?: string;
  parameters: Record<string, ParameterDefinition>;
  initialValues?: Record<string, any>;
  onSave?: (params: Record<string, any>) => void;
  onExport?: (params: Record<string, any>) => void;
}

export const BaseUO: React.FC<BaseUOProps> = ({
  title,
  description,
  parameters,
  initialValues = {},
  onSave,
  onExport
}) => {
  const [params, setParams] = useState<Record<string, any>>(initialValues);

  const handleChange = (paramName: string, value: any) => {
    setParams((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(params);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(params);
    }
  };

  const renderParameter = (name: string, param: ParameterDefinition) => {
    const value = params[name] !== undefined ? params[name] : param.defaultValue;
    
    switch (param.type) {
      case 'number':
        return (
          <TextField
            label={param.label}
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(name, parseFloat(e.target.value))}
            fullWidth
            margin="normal"
            helperText={param.description}
            InputProps={{
              endAdornment: param.unit ? <span>{param.unit}</span> : null,
            }}
            inputProps={{
              min: param.min,
              max: param.max,
              step: 0.1,
            }}
          />
        );
      
      case 'string':
        return (
          <TextField
            label={param.label}
            value={value || ''}
            onChange={(e) => handleChange(name, e.target.value)}
            fullWidth
            margin="normal"
            helperText={param.description}
          />
        );
      
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value || false}
                onChange={(e) => handleChange(name, e.target.checked)}
              />
            }
            label={param.label}
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleChange(name, e.target.value)}
              label={param.label}
            >
              {param.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="textSecondary">
              {param.description}
            </Typography>
          </FormControl>
        );
      
      default:
        return null;
    }
  };

  return (
    <Paper className="sdl2-base-uo">
      <Box className="uo-header">
        <Typography variant="h5">{title}</Typography>
        {description && (
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      <Box className="uo-parameters">
        {Object.entries(parameters).map(([name, param]) => (
          <Box key={name} className="parameter-field">
            {renderParameter(name, param)}
          </Box>
        ))}
      </Box>
      
      <Box className="uo-actions">
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleExport}>
          Export
        </Button>
      </Box>
    </Paper>
  );
};
