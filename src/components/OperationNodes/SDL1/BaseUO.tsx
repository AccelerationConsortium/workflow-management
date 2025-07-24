import React, { useState } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel, Typography,
  Button, Checkbox, FormControlLabel, Paper, Divider,
} from '@mui/material';
import { Save, FileDownload } from '@mui/icons-material';
import { ParameterDefinition, ParameterGroup } from './types';

interface BaseUOProps {
  title: string;
  description?: string;
  parameterGroups: Record<string, ParameterGroup>;
  defaultValues: Record<string, any>;
  onSave?: (parameters: Record<string, any>) => void;
  primitiveOperations?: string[];
}

export const BaseUO: React.FC<BaseUOProps> = ({
  title,
  description,
  parameterGroups,
  defaultValues,
  onSave,
  primitiveOperations,
}) => {
  const [parameters, setParameters] = useState(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleParameterChange = (paramKey: string, value: any) => {
    setParameters({ ...parameters, [paramKey]: value });
    
    if (errors[paramKey]) {
      setErrors({ ...errors, [paramKey]: '' });
    }
  };

  const validateParameter = (
    paramKey: string,
    value: any,
    definition: ParameterDefinition
  ): string | null => {
    if (definition.required && !value) {
      return `${definition.label} is required`;
    }
    
    if (definition.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${definition.label} must be a number`;
      }
      if (definition.min !== undefined && numValue < definition.min) {
        return `${definition.label} must be at least ${definition.min}`;
      }
      if (definition.max !== undefined && numValue > definition.max) {
        return `${definition.label} must be at most ${definition.max}`;
      }
    }
    
    return null;
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    Object.entries(parameterGroups).forEach(([groupKey, group]) => {
      Object.entries(group.parameters).forEach(([paramKey, definition]) => {
        const error = validateParameter(paramKey, parameters[paramKey], definition);
        if (error) {
          newErrors[paramKey] = error;
          hasErrors = true;
        }
      });
    });
    
    setErrors(newErrors);
    
    if (!hasErrors && onSave) {
      onSave(parameters);
    }
  };

  const handleExport = () => {
    const exportData = {
      unitOperation: title,
      parameters: parameters,
      primitiveOperations: primitiveOperations || [],
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderParameter = (paramKey: string, definition: ParameterDefinition) => {
    const value = parameters[paramKey] ?? definition.defaultValue;
    const error = errors[paramKey];
    
    if (definition.dependsOn) {
      const dependentValue = parameters[definition.dependsOn.parameter];
      if (dependentValue !== definition.dependsOn.value) {
        return null;
      }
    }

    switch (definition.type) {
      case 'number':
        return (
          <TextField
            key={paramKey}
            label={definition.label}
            type="number"
            value={value || ''}
            onChange={(e) => handleParameterChange(paramKey, Number(e.target.value))}
            error={!!error}
            helperText={error || definition.description}
            fullWidth
            margin="normal"
            InputProps={{
              inputProps: {
                min: definition.min,
                max: definition.max,
                step: definition.step,
              },
              endAdornment: definition.unit ? (
                <Typography variant="caption" color="textSecondary">
                  {definition.unit}
                </Typography>
              ) : null,
            }}
          />
        );
        
      case 'string':
        return (
          <TextField
            key={paramKey}
            label={definition.label}
            value={value || ''}
            onChange={(e) => handleParameterChange(paramKey, e.target.value)}
            error={!!error}
            helperText={error || definition.description}
            fullWidth
            margin="normal"
          />
        );
        
      case 'boolean':
        return (
          <FormControlLabel
            key={paramKey}
            className="nodrag"
            control={
              <Checkbox
                checked={value === true}
                onChange={(e) => {
                  e.stopPropagation();
                  handleParameterChange(paramKey, e.target.checked);
                }}
              />
            }
            label={definition.label}
            sx={{ mt: 1, mb: 1 }}
          />
        );
        
      case 'select':
        return (
          <FormControl key={paramKey} fullWidth margin="normal" error={!!error} className="nodrag">
            <InputLabel>{definition.label}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleParameterChange(paramKey, e.target.value)}
              label={definition.label}
            >
              {definition.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || definition.description) && (
              <Typography variant="caption" color={error ? 'error' : 'textSecondary'}>
                {error || definition.description}
              </Typography>
            )}
          </FormControl>
        );
        
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="textSecondary" paragraph>
          {description}
        </Typography>
      )}
      
      {primitiveOperations && primitiveOperations.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            This operation will execute:
          </Typography>
          <Box sx={{ pl: 2 }}>
            {primitiveOperations.map((op, index) => (
              <Typography key={index} variant="body2" color="textSecondary">
                {index + 1}. {op}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
      
      {Object.entries(parameterGroups).map(([groupKey, group]) => (
        <Box key={groupKey} sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {group.label}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {Object.entries(group.parameters).map(([paramKey, definition]) =>
            renderParameter(paramKey, definition)
          )}
        </Box>
      ))}
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={handleExport}
        >
          Export JSON
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
};