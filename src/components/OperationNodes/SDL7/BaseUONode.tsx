import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel, Typography,
  IconButton, Collapse, Button, Divider, Chip,
} from '@mui/material';
import { ExpandMore, ExpandLess, FileDownload, FileUpload, Save } from '@mui/icons-material';
import { SDL7Node, ParameterDefinition, ParameterGroup } from './types';
import { ExecutionPreview } from './ExecutionPreview';
import { PortalCheckbox } from './PortalCheckbox';
import { DOMCheckbox } from './DOMCheckbox';
import { SimpleCheckbox } from './SimpleCheckbox';
import { templateService } from '../../../services/templateService';

interface BaseUONodeProps extends NodeProps {
  data: SDL7Node['data'] & {
    onDataChange?: (data: any) => void;
    parameterGroups: Record<string, ParameterGroup>;
    nodeType: string;
    category?: string;
    description?: string;
    primitiveOperations?: string[];
    executionSteps?: Array<{
      operation: string;
      condition?: string;
      description?: string;
    }>;
  };
}

export const BaseUONode: React.FC<BaseUONodeProps> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [parameters, setParameters] = useState(data.parameters || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('BaseUONode useEffect triggered:', { dataParameters: data.parameters });
    if (data.parameters) {
      setParameters(data.parameters);
    }
  }, [data.parameters]);


  const handleParameterChange = useCallback(
    (paramKey: string, value: any) => {
      console.log(`handleParameterChange called for ${paramKey}:`, { 
        oldValue: parameters[paramKey], 
        newValue: value, 
        parameters,
        data: data.onDataChange ? 'present' : 'missing'
      });
      
      const newParams = { ...parameters, [paramKey]: value };
      setParameters(newParams);
      
      if (data.onDataChange) {
        console.log(`Calling data.onDataChange with:`, { ...data, parameters: newParams });
        data.onDataChange({
          ...data,
          parameters: newParams,
        });
      }

      if (errors[paramKey]) {
        setErrors({ ...errors, [paramKey]: '' });
      }
    },
    [parameters, data, errors]
  );

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

  const handleExportJSON = () => {
    const exportData = {
      nodeType: data.nodeType,
      parameters: parameters,
      primitiveOperations: data.primitiveOperations || [],
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.nodeType}_${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log('Importing file:', file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        console.log('Imported data:', importedData);
        
        if (importedData.parameters) {
          setParameters(importedData.parameters);
          if (data.onDataChange) {
            data.onDataChange({
              ...data,
              parameters: importedData.parameters,
              importedFileName: file.name,
            });
          }
          
          // Show success feedback
          setImportedFileName(file.name);
          alert(`Successfully imported configuration from: ${file.name}`);
        } else {
          throw new Error('Invalid file format: missing parameters');
        }
      } catch (error) {
        console.error('Error importing JSON:', error);
        alert(`Error importing file: ${error instanceof Error ? error.message : 'Invalid JSON format'}`);
      }
    };
    reader.readAsText(file);
    
    // Reset the input value to allow importing the same file again
    event.target.value = '';
  };

  const handleSaveAsTemplate = () => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;
    
    const description = prompt('Enter template description (optional):') || '';
    
    try {
      const template = templateService.createTemplate({
        name: templateName,
        description,
        category: 'SDL7',
        nodeType: data.nodeType,
        parameters,
        primitiveOperations: data.primitiveOperations || [],
        tags: [data.category || 'custom'],
        metadata: {
          difficulty: 'intermediate',
          isPublic: false,
          isStandard: false,
          usageCount: 0,
        },
      });
      
      alert(`Template "${templateName}" saved successfully!`);
      console.log('Template saved:', template);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    }
  };

  const renderParameter = (
    paramKey: string,
    definition: ParameterDefinition,
    groupKey?: string
  ) => {
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
            className="nodrag"
            label={definition.label}
            type="number"
            value={value || ''}
            onChange={(e) => handleParameterChange(paramKey, Number(e.target.value))}
            error={!!error}
            helperText={error || definition.description}
            size="small"
            fullWidth
            margin="dense"
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
            className="nodrag"
            label={definition.label}
            value={value || ''}
            onChange={(e) => handleParameterChange(paramKey, e.target.value)}
            error={!!error}
            helperText={error || definition.description}
            size="small"
            fullWidth
            margin="dense"
          />
        );
        
      case 'boolean':
        const boolValue = value === true || value === 'true';
        console.log(`Rendering checkbox for ${paramKey}:`, { 
          rawValue: value, 
          boolValue, 
          type: typeof value,
          definition 
        });
        
        // Test different checkbox implementations
        const checkboxType: 'portal' | 'dom' | 'simple' = 'simple'; // Change this to 'portal', 'dom', or 'simple'
        
        switch (checkboxType) {
          case 'portal':
            return (
              <PortalCheckbox
                key={paramKey}
                paramKey={paramKey}
                label={definition.label}
                checked={boolValue}
                onChange={(checked) => {
                  console.log(`PortalCheckbox ${paramKey} onChange via prop:`, { 
                    checked, 
                    currentValue: value
                  });
                  handleParameterChange(paramKey, checked);
                }}
                disabled={false}
              />
            );
          case 'dom':
            return (
              <DOMCheckbox
                key={paramKey}
                paramKey={paramKey}
                label={definition.label}
                checked={boolValue}
                onChange={(checked) => {
                  console.log(`DOMCheckbox ${paramKey} onChange via prop:`, { 
                    checked, 
                    currentValue: value
                  });
                  handleParameterChange(paramKey, checked);
                }}
                disabled={false}
              />
            );
          case 'simple':
          default:
            return (
              <SimpleCheckbox
                key={paramKey}
                paramKey={paramKey}
                label={definition.label}
                checked={boolValue}
                onChange={(checked) => {
                  console.log(`SimpleCheckbox ${paramKey} onChange via prop:`, { 
                    checked, 
                    currentValue: value
                  });
                  handleParameterChange(paramKey, checked);
                }}
                disabled={false}
              />
            );
        }
        
      case 'select':
        return (
          <FormControl key={paramKey} size="small" fullWidth margin="dense" error={!!error} className="nodrag">
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
    <Box className={`sdl7-node ${data.category?.toLowerCase()}`} sx={{ position: 'relative' }}>
      {/* Single central connection point - can act as both input and output */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-connection`}
        style={{
          background: '#fff',
          border: '3px solid #6b46c1',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(107, 70, 193, 0.3)',
          transition: 'all 0.2s ease',
          right: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
          e.currentTarget.style.background = '#6b46c1';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 70, 193, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 70, 193, 0.3)';
        }}
      />

      {/* Hidden target handle for receiving connections */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-target`}
        style={{
          background: '#fff',
          border: '3px solid #6b46c1',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(107, 70, 193, 0.3)',
          transition: 'all 0.2s ease',
          left: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
          e.currentTarget.style.background = '#6b46c1';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 70, 193, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 70, 193, 0.3)';
        }}
      />
      
      <Box className="node-header">
        <Typography variant="subtitle2" fontWeight="bold">
          {data.label}
        </Typography>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {data.description && (
        <Typography variant="caption" color="textSecondary" sx={{ px: 1, pb: 1 }}>
          {data.description}
        </Typography>
      )}
      
      {importedFileName && (
        <Box sx={{ px: 1, pb: 1 }}>
          <Chip
            size="small"
            label={`Imported: ${importedFileName}`}
            color="success"
            onDelete={() => setImportedFileName(null)}
          />
        </Box>
      )}

      {data.executionSteps && data.executionSteps.length > 0 && (
        <Box sx={{ px: 1, pb: 1 }}>
          <ExecutionPreview steps={data.executionSteps} parameters={parameters} />
        </Box>
      )}

      <Collapse in={expanded}>
        <Box className="node-content nodrag">
          {Object.entries(data.parameterGroups).map(([groupKey, group]) => {
            const typedGroup = group as ParameterGroup;
            return (
              <Box key={groupKey} sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight="bold" color="primary">
                  {typedGroup.label}
                </Typography>
                <Divider sx={{ my: 0.5 }} />
                {Object.entries(typedGroup.parameters).map(([paramKey, definition]) =>
                  renderParameter(paramKey, definition as ParameterDefinition, groupKey)
                )}
              </Box>
            );
          })}
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }} className="nodrag">
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportJSON}
            >
              Export
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileUpload />}
              className="nodrag"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                fileInputRef.current?.click();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              Import
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveAsTemplate}
              style={{ pointerEvents: 'auto' }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Save as Template
            </Button>
          </Box>
        </Box>
      </Collapse>
      
      {/* Hidden file input for import functionality - placed outside Collapse so it's always available */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        style={{ display: 'none' }}
        className="nodrag"
      />
      
    </Box>
  );
};