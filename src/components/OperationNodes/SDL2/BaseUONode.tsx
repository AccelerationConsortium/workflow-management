import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SDL2NodeProps, ParameterDefinition } from './types';
import './styles.css';

interface BaseUONodeProps extends SDL2NodeProps {
  data: {
    label: string;
    description?: string;
    parameters: Record<string, ParameterDefinition>;
    onParameterChange?: (params: Record<string, any>) => void;
    onExport?: () => void;
  };
}

export const BaseUONode: React.FC<BaseUONodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(true);
  const [params, setParams] = useState<Record<string, any>>({});

  const handleChange = (paramName: string, value: any) => {
    const newParams = { ...params, [paramName]: value };
    setParams(newParams);
    
    if (data.onParameterChange) {
      data.onParameterChange(newParams);
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
            margin="dense"
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
            margin="dense"
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
          <FormControl fullWidth margin="dense">
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
    <div className={`sdl2-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <Box className="node-header">
        <Typography variant="h6">{data.label}</Typography>
        {data.description && (
          <Typography variant="body2" color="textSecondary">
            {data.description}
          </Typography>
        )}
      </Box>
      
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        className="node-accordion"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Parameters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box className="parameters-container">
            {Object.entries(data.parameters).map(([name, param]) => (
              <Box key={name} className="parameter-field">
                {renderParameter(name, param)}
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
