/**
 * Custom UO Node Component
 * 通用自定义单元操作节点组件 - 遵循SDL2设计模式
 */

import React, { useState, useCallback, useRef, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

import { customUOService } from '../../services/customUOService';
import { GeneratedUOSchema, GeneratedParameter } from '../UOBuilder/types';

interface CustomUONodeProps extends NodeProps {
  data: {
    type: string;
    label: string;
    description?: string;
    category?: string;
    isCustom?: boolean;
    [key: string]: any;
  };
}

export const CustomUONode: React.FC<CustomUONodeProps> = memo(({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get custom UO schema
  const customUO = customUOService.getUOById(data.type);

  if (!customUO) {
    return (
      <div className={`custom-uo-node error ${selected ? 'selected' : ''}`}>
        <Handle type="target" position={Position.Top} />
        <Box sx={{ p: 2, bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 1 }}>
          <Typography color="error">
            UO Schema not found: {data.type}
          </Typography>
        </Box>
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  }

  const handleParameterChange = useCallback((paramId: string, value: any) => {
    setParameters(prev => {
      const newParams = {
        ...prev,
        [paramId]: value
      };

      // Notify ReactFlow about the parameter change
      if (data.onParameterChange) {
        data.onParameterChange(newParams);
      }

      return newParams;
    });
  }, [data]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        // Update parameters from the JSON file
        const newParams = { ...parameters };

        // Process the imported JSON data
        Object.entries(jsonData.parameters || jsonData).forEach(([key, value]) => {
          // Find parameter by name or id
          const param = customUO.parameters.find(p => p.name === key || p.id === key);
          if (param) {
            newParams[param.id] = value;
          }
        });

        setParameters(newParams);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Invalid JSON file. Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const config = {
      uoType: data.type,
      uoName: data.label,
      parameters: parameters,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.label.replace(/\s+/g, '_')}_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if there are file operation parameters
  const hasFileOperations = customUO.parameters.some(param =>
    param.name.toLowerCase().includes('file') ||
    param.name.toLowerCase().includes('upload') ||
    param.name.toLowerCase().includes('import') ||
    param.name.toLowerCase().includes('export')
  );

  const renderParameter = (param: GeneratedParameter) => {
    const value = parameters[param.id] ?? param.defaultValue;

    // Check if this is a file operation parameter
    const isFileParam = param.name.toLowerCase().includes('file') ||
                       param.name.toLowerCase().includes('upload') ||
                       param.name.toLowerCase().includes('import');

    if (isFileParam) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {param.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadFileIcon />}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json,.csv,.xlsx';
                input.onchange = (event) => {
                  const file = (event.target as HTMLInputElement).files?.[0];
                  if (file) {
                    handleParameterChange(param.id, file.name);
                  }
                };
                input.click();
              }}
              sx={{
                borderColor: '#8F7FE8',
                color: '#8F7FE8',
                '&:hover': { borderColor: '#7B6FD8', bgcolor: '#f3f0ff' }
              }}
            >
              Select File
            </Button>
            {value && (
              <Typography variant="caption" sx={{ color: '#666' }}>
                {value}
              </Typography>
            )}
          </Box>
          {param.description && (
            <Typography variant="caption" color="textSecondary">
              {param.description}
            </Typography>
          )}
        </Box>
      );
    }

    switch (param.type) {
      case 'number':
        return (
          <TextField
            label={param.name}
            type="number"
            value={value || ''}
            onChange={(e) => {
              const rawValue = e.target.value;
              if (rawValue === '') {
                handleParameterChange(param.id, undefined);
              } else {
                const numValue = parseFloat(rawValue);
                if (!isNaN(numValue)) {
                  handleParameterChange(param.id, numValue);
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
              min: param.validation?.min,
              max: param.validation?.max,
              step: 0.1,
            }}
          />
        );

      case 'string':
        return (
          <TextField
            label={param.name}
            value={value || ''}
            onChange={(e) => handleParameterChange(param.id, e.target.value)}
            fullWidth
            margin="dense"
            helperText={param.description}
          />
        );

      case 'boolean':
        return (
          <TextField
            label={param.name}
            value={value === undefined ? '' : (value ? 'yes' : 'no')}
            onChange={(e) => {
              const inputValue = e.target.value.toLowerCase().trim();
              if (inputValue === 'yes' || inputValue === 'y' || inputValue === 'true' || inputValue === '1') {
                handleParameterChange(param.id, true);
              } else if (inputValue === 'no' || inputValue === 'n' || inputValue === 'false' || inputValue === '0') {
                handleParameterChange(param.id, false);
              } else if (inputValue === '') {
                handleParameterChange(param.id, undefined);
              }
              // For other values, don't update (invalid input)
            }}
            fullWidth
            margin="dense"
            placeholder="Type: yes/no, y/n, true/false, 1/0"
            helperText={param.description ? `${param.description} (Enter: yes/no, y/n, true/false, 1/0)` : "Enter: yes/no, y/n, true/false, 1/0"}
            InputProps={{
              style: {
                color: value === true ? '#4CAF50' : value === false ? '#f44336' : '#666'
              }
            }}
          />
        );

      case 'enum':
        return (
          <FormControl fullWidth margin="dense">
            <InputLabel>{param.name}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleParameterChange(param.id, e.target.value)}
              label={param.name}
              displayEmpty
            >
              {param.validation?.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
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
        return (
          <TextField
            label={param.name}
            value={value || ''}
            onChange={(e) => handleParameterChange(param.id, e.target.value)}
            fullWidth
            margin="dense"
            helperText={param.description}
          />
        );
    }
  };

  return (
    <div className={`custom-uo-node ${selected ? 'selected' : ''}`} style={{ minWidth: 250, maxWidth: 400 }}>
      <Handle type="target" position={Position.Top} />

      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{
          boxShadow: 'none',
          '&:before': { display: 'none' },
          bgcolor: '#f3f0ff',
          border: '2px solid #8F7FE8'
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography sx={{ fontSize: '1.2rem' }}>🔧</Typography>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ color: '#8F7FE8', fontWeight: 'bold' }}>
                {data.label}
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {data.description && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {data.description}
            </Typography>
          )}

          {/* JSON Import/Export Controls - Only show when file operation parameters exist */}
          {hasFileOperations && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = handleFileUpload;
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {customUO.parameters.map((param) => (
              <Box key={param.id}>
                {renderParameter(param)}
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
