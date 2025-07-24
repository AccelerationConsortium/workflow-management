import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import { SDL2NodeProps, ParameterDefinition } from './types';
import './styles.css';

interface BaseUONodeProps extends SDL2NodeProps {
  data: {
    label: string;
    description?: string;
    parameters: Record<string, ParameterDefinition>;
    onParameterChange?: (params: Record<string, any>) => void;
    onExport?: () => void;
    canImportJSON?: boolean;
    expanded?: boolean;
  };
}

export const BaseUONode: React.FC<BaseUONodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(data.expanded === undefined ? false : data.expanded);
  const [params, setParams] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.expanded !== undefined && data.expanded !== expanded) {
      setExpanded(data.expanded);
    }
  }, [data.expanded]);

  const handleChange = (paramName: string, value: any) => {
    const newParams = { ...params, [paramName]: value };
    setParams(newParams);

    if (data.onParameterChange) {
      data.onParameterChange(newParams);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        // Update all parameters from the JSON file
        const newParams = { ...params };

        // Process the imported JSON data
        Object.entries(jsonData).forEach(([key, value]) => {
          if (data.parameters[key]) {
            newParams[key] = value;
          }
        });

        setParams(newParams);

        if (data.onParameterChange) {
          data.onParameterChange(newParams);
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Invalid JSON file. Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const exportData = { ...params };

    // Add default values for parameters that haven't been set
    Object.entries(data.parameters).forEach(([key, param]) => {
      if (exportData[key] === undefined && param.defaultValue !== undefined) {
        exportData[key] = param.defaultValue;
      }
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.label.replace(/\s+/g, '_').toLowerCase()}_parameters.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderParameter = (name: string, param: ParameterDefinition) => {
    const value = params[name] !== undefined ? params[name] : param.defaultValue;

    switch (param.type) {
      case 'number':
        const currentValueForNumber = params[name] !== undefined ? params[name] : param.defaultValue;
        const displayValueForNumber = currentValueForNumber === undefined || currentValueForNumber === null || (typeof currentValueForNumber === 'number' && isNaN(currentValueForNumber)) ? '' : String(currentValueForNumber);

        return (
          <TextField
            label={param.label}
            type="number"
            value={displayValueForNumber}
            onChange={(e) => {
              const rawValue = e.target.value;
              if (rawValue === '') {
                handleChange(name, undefined);
              } else {
                const numValue = parseFloat(rawValue);
                if (!isNaN(numValue)) {
                  handleChange(name, numValue);
                } else {
                  // Optional: handle invalid number input, e.g., show error, revert, or do nothing
                  // For now, do nothing and let TextField manage its state if input is invalid (e.g. "abc")
                }
              }
            }}
            fullWidth
            margin="dense"
            helperText={param.description}
            InputProps={{
              endAdornment: param.unit ? <span>{param.unit}</span> : null,
            }}
            inputProps={{
              min: param.min,
              max: param.max,
              step: param.step !== undefined ? param.step : 0.1,
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
              displayEmpty
            >
              {param.options?.map((option) => (
                <MenuItem key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </MenuItem>
              ))}
            </Select>
            {param.description && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, ml: 1.5 }}>
                {param.description}
              </Typography>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  // Only show JSON import/export for CompoundPreparation, ElectrochemicalMeasurement, and DataAnalysis
  const showJSONControls = data.canImportJSON !== false;

  return (
    <div className={`sdl2-node ${selected ? 'selected' : ''}`} style={{ position: 'relative' }}>
      {/* Single central connection point - can act as both input and output */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-connection`}
        style={{
          background: '#fff',
          border: '3px solid #4BBCD4',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(75, 188, 212, 0.3)',
          transition: 'all 0.2s ease',
          right: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
          e.currentTarget.style.background = '#4BBCD4';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 188, 212, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(75, 188, 212, 0.3)';
        }}
      />

      {/* Hidden target handle for receiving connections */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-target`}
        style={{
          background: '#fff',
          border: '3px solid #4BBCD4',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(75, 188, 212, 0.3)',
          transition: 'all 0.2s ease',
          left: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
          e.currentTarget.style.background = '#4BBCD4';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 188, 212, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(75, 188, 212, 0.3)';
        }}
      />

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
          {showJSONControls && (
            <Box className="json-controls" sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 1 }}>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                variant="outlined"
                size="small"
                color="primary"
                startIcon={<UploadFileIcon />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // 直接使用DOM API打开文件选择窗口
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (event) => {
                    const file = (event.target as HTMLInputElement).files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const jsonData = JSON.parse(e.target?.result as string);
                        // Update all parameters from the JSON file
                        const newParams = { ...params };

                        // Process the imported JSON data
                        Object.entries(jsonData).forEach(([key, value]) => {
                          if (data.parameters[key]) {
                            newParams[key] = value;
                          }
                        });

                        setParams(newParams);

                        if (data.onParameterChange) {
                          data.onParameterChange(newParams);
                        }
                      } catch (error) {
                        console.error('Error parsing JSON file:', error);
                        alert('Invalid JSON file. Please upload a valid JSON file.');
                      }
                    };
                    reader.readAsText(file);
                  };
                  input.click();
                }}
                sx={{ mr: 1, flex: 1 }}
              >
                Import JSON
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleExportJSON}
                sx={{ flex: 1 }}
              >
                Export JSON
              </Button>
            </Box>
          )}
          <Box className="parameters-container">
            {Object.entries(data.parameters).map(([name, param]) => (
              <Box key={name} className="parameter-field">
                {renderParameter(name, param)}
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>


    </div>
  );
};
