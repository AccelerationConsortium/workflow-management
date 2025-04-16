import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { BaseUOProps, Parameter, UOConfig } from './types';

/**
 * BaseUO - 一个简化的参数编辑组件，不包含 ReactFlow 节点功能
 * 可以在非流程图环境中使用，例如配置面板或测试界面
 * 注意：在大多数场景下，应该使用 BaseUONode，这个组件主要用于单独测试参数编辑功能
 */
export const BaseUO: React.FC<BaseUOProps & { config: UOConfig }> = ({
  id,
  position,
  onParameterChange,
  onExport,
  config,
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    // Initialize with default values
    return Object.entries(config.parameters).reduce((acc, [key, param]) => {
      acc[key] = param.defaultValue;
      return acc;
    }, {} as Record<string, any>);
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateParameter = (name: string, value: any, param: Parameter): string => {
    if (param.required && (value === undefined || value === '')) {
      return '此字段为必填项';
    }
    if (param.type === 'number') {
      if (param.min !== undefined && value < param.min) {
        return `值必须大于等于 ${param.min}`;
      }
      if (param.max !== undefined && value > param.max) {
        return `值必须小于等于 ${param.max}`;
      }
    }
    return '';
  };

  const handleParameterChange = (name: string, value: any) => {
    const param = config.parameters[name];
    const error = validateParameter(name, value, param);
    
    setParameters(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // 只有在没有错误时才触发onChange
    if (!error) {
      onParameterChange(parameters);
    }
  };

  const handleExport = () => {
    const exportData = {
      uo_type: config.uo_type,
      parameters,
    };
    onExport();
    console.log('导出配置:', exportData);
  };

  const renderParameter = (name: string, param: Parameter) => {
    const error = errors[name];
    
    switch (param.type) {
      case 'number':
        return (
          <TextField
            key={name}
            fullWidth
            label={param.label}
            type="number"
            value={parameters[name]}
            onChange={(e) => handleParameterChange(name, Number(e.target.value))}
            error={!!error}
            helperText={error || param.description}
            InputProps={{
              endAdornment: param.unit && (
                <Typography color="textSecondary">{param.unit}</Typography>
              ),
            }}
            margin="normal"
          />
        );
        
      case 'select':
        return (
          <FormControl key={name} fullWidth margin="normal" error={!!error}>
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={parameters[name]}
              onChange={(e) => handleParameterChange(name, e.target.value)}
              label={param.label}
            >
              {param.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || param.description) && (
              <FormHelperText>{error || param.description}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'boolean':
        return (
          <FormControl key={name} fullWidth margin="normal" error={!!error}>
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={String(parameters[name])}
              onChange={(e) => handleParameterChange(name, e.target.value === 'true')}
              label={param.label}
            >
              <MenuItem value="true">是</MenuItem>
              <MenuItem value="false">否</MenuItem>
            </Select>
            {(error || param.description) && (
              <FormHelperText>{error || param.description}</FormHelperText>
            )}
          </FormControl>
        );
        
      default:
        return (
          <TextField
            key={name}
            fullWidth
            label={param.label}
            value={parameters[name]}
            onChange={(e) => handleParameterChange(name, e.target.value)}
            error={!!error}
            helperText={error || param.description}
            margin="normal"
          />
        );
    }
  };

  return (
    <Card
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 300,
        cursor: 'move',
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {config.uo_type}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {Object.entries(config.parameters).map(([name, param]) =>
            renderParameter(name, param)
          )}
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={Object.keys(errors).some(key => !!errors[key])}
          >
            导出
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 
