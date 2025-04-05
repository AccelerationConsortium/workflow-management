import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Collapse,
  ButtonGroup,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  ToggleButtonGroup,
  ToggleButton,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ScienceIcon from '@mui/icons-material/Science';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { useWorkflow } from '../../../context/WorkflowContext';

interface Parameter {
  type: string;
  label: string;
  unit?: string;
  description?: string;
  min?: number;
  max?: number;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  required?: boolean;
  render?: (props: any) => React.ReactNode;
  inputProps?: any;
}

interface BaseUONodeProps extends NodeProps {
  data: {
    label: string;
    parameters: Record<string, Parameter>;
    onParameterChange?: (params: Record<string, any>) => void;
    onExport?: () => void;
    workflowId: string;
    onDelete?: (id: string) => void;
    onNodeDelete?: (id: string) => void;
  };
  id: string;
  workflowId?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 250,
  position: 'relative',
  '&:hover .delete-button': {
    opacity: 1,
  },
}));

const StyledCardContent = styled(CardContent)({
  padding: '8px 16px',
  '&:last-child': {
    paddingBottom: '8px',
  },
});

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .MuiButton-root': {
    minWidth: '40px',
    width: '40px',
    padding: theme.spacing(1),
    flex: 1,
  },
  '& .MuiButton-startIcon': {
    margin: 0,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  }
}));

const StyledExportButton = styled(Button)(({ theme }) => ({
  '& .MuiButton-startIcon': {
    margin: 0,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  minHeight: '40px',
  '& .MuiSelect-select': {
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  }
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: '100%',
  '& .MuiToggleButtonGroup-grouped': {
    flex: 1,
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
      marginLeft: theme.spacing(1),
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.875rem',
  padding: theme.spacing(0.5, 1),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: theme.spacing(0.5),
  opacity: 0,
  zIndex: 1,
  '&:hover': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  marginTop: theme.spacing(1),
  '& .MuiFormControlLabel-root': {
    marginRight: theme.spacing(2),
  },
}));

export const BaseUONode: React.FC<BaseUONodeProps> = ({ data, id, workflowId }) => {
  const { state, dispatch } = useWorkflow();
  const [expanded, setExpanded] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize parameters with default values
  useEffect(() => {
    const defaultParams: Record<string, any> = {};
    Object.entries(data.parameters).forEach(([name, param]) => {
      if (param.defaultValue !== undefined) {
        defaultParams[name] = param.defaultValue;
      }
    });
    setParameters(prev => ({...defaultParams, ...prev}));
  }, [data.parameters]);

  const handleParameterChange = useCallback((name: string, value: any) => {
    console.log('handleParameterChange 开始:', { name, value });
    const param = data.parameters[name];
    let error = '';

    // 特殊处理布尔值
    if (param.type === 'boolean') {
      console.log('处理布尔值参数:', {
        name,
        value,
        type: typeof value,
        convertedValue: typeof value === 'string' ? value === 'true' : Boolean(value)
      });

      const boolValue = typeof value === 'string' ? value === 'true' : Boolean(value);
      console.log('更新布尔值参数:', {
        name,
        boolValue,
        oldParameters: parameters
      });

      setParameters(prev => {
        const newParams = { ...prev, [name]: boolValue };
        console.log('新的参数状态:', newParams);
        return newParams;
      });

      // 立即通知父组件参数更新
      if (data.onParameterChange) {
        const updatedParams = { ...parameters, [name]: boolValue };
        console.log('通知父组件参数更新:', updatedParams);
        data.onParameterChange(updatedParams);
      }
      return;
    }

    // 处理数字类型
    if (param.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        error = '必须是数字';
      } else if (param.min !== undefined && numValue < param.min) {
        error = `不能小于 ${param.min}`;
      } else if (param.max !== undefined && numValue > param.max) {
        error = `不能大于 ${param.max}`;
      }
      value = numValue;
    }

    setParameters(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: error }));

    // 只有在没有错误时才通知父组件
    if (!error && data.onParameterChange) {
      const updatedParams = { ...parameters, [name]: value };
      data.onParameterChange(updatedParams);
    }
  }, [data.parameters, data.onParameterChange, parameters]);

  const handleDelete = useCallback(() => {
    if (window.confirm('确定要删除这个节点吗？')) {
      console.log('开始删除节点:', id);
      
      try {
        // 1. 从 WorkflowContext 中删除节点
        dispatch({ type: 'REMOVE_NODE', payload: id });
        
        // 2. 删除与该节点相关的所有边
        dispatch({ type: 'REMOVE_EDGES', payload: id });
        
        // 3. 从 ReactFlow 状态中删除节点
        if (data.onDelete) {
          data.onDelete(id);
        }
        
        console.log('节点删除完成:', id);
      } catch (error) {
        console.error('删除节点时出错:', error);
        alert('删除节点失败，请重试');
      }
    }
  }, [id, dispatch, data.onDelete]);

  const handleExport = useCallback(() => {
    if (data.onExport) {
      data.onExport();
    }
    console.log('Exported parameters:', parameters);
  }, [data.onExport, parameters]);

  const handleRun = useCallback(() => {
    console.log('Running experiment with parameters:', parameters);
  }, [parameters]);

  const handleViewResult = useCallback(() => {
    console.log('Viewing results');
  }, []);

  const handleSimulate = useCallback(() => {
    console.log('Running simulation with parameters:', parameters);
  }, [parameters]);

  const renderBooleanParameter = (name: string, param: Parameter) => {
    const value = parameters[name] ?? param.defaultValue ?? false;
    console.log('渲染布尔值选择器:', {
      name,
      currentValue: value,
      stringValue: String(value),
      defaultValue: param.defaultValue
    });

    return (
      <FormControl component="fieldset" fullWidth margin="dense">
        <FormControlLabel
          control={
            <Radio
              checked={value === true}
              onChange={() => handleParameterChange(name, true)}
            />
          }
          label="是"
        />
        <FormControlLabel
          control={
            <Radio
              checked={value === false}
              onChange={() => handleParameterChange(name, false)}
            />
          }
          label="否"
        />
      </FormControl>
    );
  };

  return (
    <StyledCard variant="outlined">
      <Handle type="target" position={Position.Top} />
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{data.label}</Typography>
        <Box>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ mr: 1 }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <StyledCloseButton
            className="delete-button"
            size="small"
            onClick={handleDelete}
          >
            <DeleteIcon fontSize="small" />
          </StyledCloseButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box mt={2}>
          {Object.entries(data.parameters).map(([name, param]) => {
            // Custom render component
            if (param.type === 'custom' && param.render) {
              return (
                <Box key={name} sx={{ mb: 2 }}>
                  {param.render({})}
                </Box>
              );
            }
            
            // Boolean parameter with select
            if (param.type === 'boolean') {
              const currentValue = parameters[name] !== undefined 
                ? parameters[name] 
                : param.defaultValue !== undefined 
                  ? param.defaultValue 
                  : false;

              console.log('渲染布尔值选择器:', {
                name,
                currentValue,
                stringValue: String(currentValue),
                defaultValue: param.defaultValue
              });

              return (
                <FormControl key={name} fullWidth sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    {param.label}
                  </Typography>
                  {param.description && (
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      {param.description}
                    </Typography>
                  )}
                  <Select
                    value={String(currentValue)}
                    onChange={(e) => {
                      console.log('Select onChange:', {
                        newValue: e.target.value,
                        convertedValue: e.target.value === 'true'
                      });
                      const newValue = e.target.value === 'true';
                      handleParameterChange(name, newValue);
                    }}
                    size="small"
                  >
                    <MenuItem value="true">True</MenuItem>
                    <MenuItem value="false">False</MenuItem>
                  </Select>
                </FormControl>
              );
            }
            
            // Select input - This is the new code for handling select type parameters
            if (param.type === 'select') {
              return (
                <FormControl
                  key={name}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors[name]}
                  required={param.required}
                  sx={{ mb: 2 }}
                >
                  <InputLabel>{param.label}</InputLabel>
                  <Select
                    label={param.label}
                    value={parameters[name] !== undefined ? parameters[name] : (param.defaultValue || '')}
                    onChange={(e) => handleParameterChange(name, e.target.value)}
                  >
                    {param.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                        {param.unit && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="textSecondary"
                            sx={{ ml: 1 }}
                          >
                            {param.unit}
                          </Typography>
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {(errors[name] || param.description) && (
                    <FormHelperText>{errors[name] || param.description}</FormHelperText>
                  )}
                </FormControl>
              );
            }
            
            // Options as toggle buttons
            if (param.type === 'string' && param.options) {
              return (
                <FormControl
                  key={name}
                  fullWidth
                  error={!!errors[name]}
                  required={param.required}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {param.label}
                  </Typography>
                  <StyledToggleButtonGroup
                    value={parameters[name] || param.defaultValue || ''}
                    exclusive
                    onChange={(e, value) => value && handleParameterChange(name, value)}
                    size="small"
                    fullWidth
                  >
                    {param.options.map((option) => (
                      <StyledToggleButton key={option.value} value={option.value}>
                        {option.label}
                      </StyledToggleButton>
                    ))}
                  </StyledToggleButtonGroup>
                  <FormHelperText>{errors[name] || param.description}</FormHelperText>
                </FormControl>
              );
            }
            
            // Default text/number input
            return (
              <TextField
                key={name}
                fullWidth
                label={param.label}
                type={param.type === 'number' ? 'number' : 'text'}
                value={parameters[name] !== undefined ? parameters[name] : (param.defaultValue || '')}
                onChange={(e) => handleParameterChange(name, e.target.value)}
                error={!!errors[name]}
                helperText={errors[name] || param.description}
                margin="dense"
                size="small"
                required={param.required}
                sx={{ 
                  mb: 1,
                  ...(param.inputProps?.sx || {})
                }}
                InputProps={{
                  ...param.inputProps,
                  endAdornment: param.unit && (
                    <Typography color="textSecondary" variant="caption">
                      {param.unit}
                    </Typography>
                  ),
                }}
              />
            );
          })}
        </Box>

        <Box mt={2} display="flex" flexDirection="column" gap={1}>
          <StyledButtonGroup variant="outlined" fullWidth>
            <Tooltip title="Run Experiment">
              <Button
                startIcon={<PlayArrowIcon />}
                onClick={handleRun}
                disabled={Object.keys(errors).some(key => !!errors[key])}
              />
            </Tooltip>
            <Tooltip title="View Results">
              <Button
                startIcon={<AssessmentIcon />}
                onClick={handleViewResult}
              />
            </Tooltip>
            <Tooltip title="Run Simulation">
              <Button
                startIcon={<ScienceIcon />}
                onClick={handleSimulate}
              />
            </Tooltip>
          </StyledButtonGroup>

          <Tooltip title="Export Configuration">
            <StyledExportButton
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleExport}
              disabled={Object.keys(errors).some(key => !!errors[key])}
              fullWidth
            />
          </Tooltip>
        </Box>
      </Collapse>

      <Handle type="source" position={Position.Bottom} />
    </StyledCard>
  );
};
