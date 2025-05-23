/**
 * Custom UO Node Component
 * 通用自定义单元操作节点组件
 */

import React, { useState, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Collapse,
  IconButton,
  Tooltip,
  Paper,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Assessment as AssessmentIcon,
  Science as ScienceIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { customUOService } from '../../services/customUOService';
import { GeneratedUOSchema, GeneratedParameter } from '../UOBuilder/types';

interface CustomUONodeProps extends NodeProps {
  data: {
    id: string;
    label: string;
    customUOId?: string;
    schema?: GeneratedUOSchema;
    [key: string]: any;
  };
}

export const CustomUONode: React.FC<CustomUONodeProps> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  
  // 获取自定义UO的schema
  const schema = data.schema || (data.customUOId ? customUOService.getUOById(data.customUOId) : null);
  
  if (!schema) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          minWidth: 200,
          border: '2px solid #ff5722',
          borderRadius: 2
        }}
      >
        <Typography variant="body2" color="error">
          Custom UO not found: {data.customUOId || 'Unknown'}
        </Typography>
      </Paper>
    );
  }

  const handleParameterChange = useCallback((paramId: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [paramId]: value
    }));
  }, []);

  const renderParameter = (param: GeneratedParameter) => {
    const value = parameterValues[param.id] ?? param.defaultValue;

    switch (param.type) {
      case 'number':
        return (
          <TextField
            size="small"
            type="number"
            label={param.name}
            value={value || ''}
            onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
            inputProps={{
              min: param.validation?.min,
              max: param.validation?.max
            }}
            helperText={param.unit ? `Unit: ${param.unit}` : param.description}
            fullWidth
          />
        );

      case 'enum':
        return (
          <FormControl size="small" fullWidth>
            <InputLabel>{param.name}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleParameterChange(param.id, e.target.value)}
              label={param.name}
            >
              {(param.validation?.options || []).map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value || false}
                onChange={(e) => handleParameterChange(param.id, e.target.checked)}
              />
            }
            label={param.name}
          />
        );

      case 'string':
      default:
        return (
          <TextField
            size="small"
            label={param.name}
            value={value || ''}
            onChange={(e) => handleParameterChange(param.id, e.target.value)}
            helperText={param.description}
            fullWidth
          />
        );
    }
  };

  const handleRun = () => {
    console.log('Running custom UO:', schema.name, 'with parameters:', parameterValues);
    // TODO: 实现自定义UO的执行逻辑
  };

  const handleExport = () => {
    const exportData = {
      uoType: schema.id,
      uoName: schema.name,
      parameters: parameterValues,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.replace(/\s+/g, '_')}_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        minWidth: 250,
        maxWidth: 400,
        border: '2px solid #8F7FE8',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#8F7FE8',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>🔧</span>
          <Typography variant="subtitle1" fontWeight="bold">
            {schema.name}
          </Typography>
          <Chip
            label="Custom"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '0.7rem'
            }}
          />
        </Box>
        
        <Tooltip title={expanded ? "Collapse" : "Expand"}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'white' }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {schema.description}
        </Typography>

        <Collapse in={expanded}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Parameters */}
            {schema.parameters.map((param) => (
              <Box key={param.id}>
                {renderParameter(param)}
              </Box>
            ))}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleRun}
                sx={{ flex: 1 }}
              >
                Run
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};
