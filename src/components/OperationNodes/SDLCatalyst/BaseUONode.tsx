import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel, Typography,
  IconButton, Collapse, Button, Divider, Chip, Checkbox, FormControlLabel,
} from '@mui/material';
import { ExpandMore, ExpandLess, FileDownload, FileUpload, Save } from '@mui/icons-material';
import { SDLCatalystNode, ParameterDefinition, ParameterGroup } from './types';
import { ExecutionPreview } from './ExecutionPreview';
import { SimpleCheckbox } from './SimpleCheckbox';
import { templateService } from '../../../services/templateService';
import './styles.css';

interface BaseUONodeProps extends NodeProps {
  data: SDLCatalystNode['data'] & {
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

  // Initialize parameters with default values from parameter groups
  const initializeParameters = useCallback(() => {
    const initialParams: Record<string, any> = {};

    if (data.parameterGroups) {
      Object.values(data.parameterGroups).forEach(group => {
        Object.entries(group.parameters).forEach(([key, definition]) => {
          if (definition.defaultValue !== undefined) {
            initialParams[key] = definition.defaultValue;
          }
        });
      });
    }

    // Override with any existing parameters
    return { ...initialParams, ...(data.parameters || {}) };
  }, [data.parameterGroups, data.parameters]);

  const [parameters, setParameters] = useState(initializeParameters);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);

  useEffect(() => {
    const newParams = initializeParameters();
    setParameters(newParams);
  }, [initializeParameters]);

  // Check if content is scrollable
  const checkScrollableContent = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const hasScroll = scrollContainer.scrollHeight > scrollContainer.clientHeight;
      setHasScrollableContent(hasScroll);
    }
  }, []);

  // Handle scroll area mouse events to prevent drag conflicts
  const handleScrollAreaMouseEnter = useCallback(() => {
    setIsScrolling(true);
    checkScrollableContent();
  }, [checkScrollableContent]);

  const handleScrollAreaMouseLeave = useCallback(() => {
    setIsScrolling(false);
  }, []);

  // Prevent node dragging when mouse is over scroll area
  const handleScrollAreaMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handle wheel events in scroll area
  const handleScrollAreaWheel = useCallback((e: React.WheelEvent) => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      // Allow natural scrolling
      scrollContainer.scrollTop += e.deltaY;
      e.stopPropagation();
    }
  }, []);

  // Check scrollable content when expanded state changes
  useEffect(() => {
    if (expanded) {
      setTimeout(checkScrollableContent, 100);
    }
  }, [expanded, checkScrollableContent]);

  const handleParameterChange = useCallback(
    (paramKey: string, value: any) => {
      const newParams = { ...parameters, [paramKey]: value };
      setParameters(newParams);
      
      if (data.onDataChange) {
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

  // Generate execution steps from primitive operations
  const generateExecutionSteps = (primitiveOps: string[], nodeParams: Record<string, any>) => {
    return primitiveOps.map((operation, index) => {
      // Create human-readable descriptions based on operation and parameters
      let description = operation.replace(/_/g, ' ').toLowerCase();
      
      // Add parameter context where relevant
      switch (operation) {
        case 'initialize_potentiostat':
          description = `initialize potentiostat on ${nodeParams.com_port || 'COM4'} channel ${nodeParams.channel || 0}`;
          break;
        case 'measure_ocv':
          description = `measure open circuit voltage for ${nodeParams.duration || 180}s`;
          break;
        case 'perform_lsv':
          description = `linear sweep from ${nodeParams.start_potential || 0.742}V to ${nodeParams.end_potential || 1.642}V`;
          break;
        case 'perform_cva':
          description = `cyclic voltammetry ${nodeParams.cycles || 5} cycles at ${nodeParams.scan_rates?.[0] || 0.01}V/s`;
          break;
        case 'perform_cp':
          description = `chronopotentiometry at ${nodeParams.current || 0.00112}A for ${nodeParams.duration || 300}s`;
          break;
        case 'perform_peis':
          description = `impedance spectroscopy ${nodeParams.start_frequency || 100000}Hz to ${nodeParams.end_frequency || 0.2}Hz`;
          break;
        case 'collect_data':
          description = `collect measurement data with timestamp`;
          break;
        case 'save_results':
          description = `save results to experiment folder`;
          break;
        default:
          description = operation.replace(/_/g, ' ').toLowerCase();
      }

      return {
        step: index + 1,
        operation: operation,
        description: description,
        condition: index === 0 ? undefined : `step_${index}_completed`,
        estimatedDuration: getEstimatedDuration(operation, nodeParams),
      };
    });
  };

  // Estimate duration for each operation type
  const getEstimatedDuration = (operation: string, nodeParams: Record<string, any>): number => {
    switch (operation) {
      case 'initialize_potentiostat':
        return 5; // 5s initialization
      case 'measure_ocv':
        return nodeParams.duration || 180;
      case 'perform_lsv':
        const lsvRange = Math.abs((nodeParams.end_potential || 1.642) - (nodeParams.start_potential || 0.742));
        const lsvRate = nodeParams.scan_rate || 0.01;
        return Math.ceil(lsvRange / lsvRate) + (nodeParams.quiet_time || 30);
      case 'perform_cva':
        const cvaRange = Math.abs((nodeParams.first_voltage_limit || 0.4) - (nodeParams.start_voltage || 0.3)) * 2;
        const cvaRate = nodeParams.scan_rates?.[0] || 0.01;
        const cvaCycles = nodeParams.cycles || 5;
        return Math.ceil((cvaRange / cvaRate) * cvaCycles) + (nodeParams.quiet_time || 10);
      case 'perform_cp':
        return nodeParams.duration || 300;
      case 'perform_peis':
        const decades = Math.log10((nodeParams.start_frequency || 100000) / (nodeParams.end_frequency || 0.2));
        const pointsPerDecade = nodeParams.steps_per_decade || 8;
        return Math.ceil(decades * pointsPerDecade * 2) + (nodeParams.quiet_time || 10);
      case 'collect_data':
      case 'save_results':
        return 2; // 2s for data operations
      default:
        return 5; // 5s default
    }
  };

  const handleExportJSON = (exportType: 'full' | 'execution' = 'execution') => {
    // Create parameter structure based on export type
    const createParameters = () => {
      if (exportType === 'execution') {
        // Simple execution format - only selected values
        const executionParameters: Record<string, any> = {};

        if (data.parameterGroups) {
          Object.entries(data.parameterGroups).forEach(([groupKey, group]) => {
            const typedGroup = group as ParameterGroup;
            Object.entries(typedGroup.parameters).forEach(([paramKey, definition]) => {
              const currentValue = parameters[paramKey] !== undefined ? parameters[paramKey] : definition.defaultValue;
              executionParameters[paramKey] = currentValue;
            });
          });
        }

        return executionParameters;
      } else {
        // Full format with metadata (existing logic)
        const enrichedParameters: Record<string, any> = {};

        if (data.parameterGroups) {
          Object.entries(data.parameterGroups).forEach(([groupKey, group]) => {
          const typedGroup = group as ParameterGroup;
          Object.entries(typedGroup.parameters).forEach(([paramKey, definition]) => {
            const currentValue = parameters[paramKey] ?? definition.defaultValue;
        // Standardize units and create unit-aware values
        const unitStandardization = (value: any, unit: string | undefined) => {
          if (!unit || definition.type !== 'number') {
            return { value, unit: unit || null };
          }
          
          // Standardize common units
          const unitMap: Record<string, string> = {
            'μL': 'uL',
            'µL': 'uL', 
            'mL': 'mL',
            'L': 'L',
            'mm': 'mm',
            'cm': 'cm',
            'm': 'm',
            'ms': 'ms',
            's': 's',
            'min': 'min',
            'h': 'h',
            'Hz': 'Hz',
            'kHz': 'kHz',
            'MHz': 'MHz',
            'V': 'V',
            'mV': 'mV',
            'A': 'A',
            'mA': 'mA',
            'uA': 'uA',
            '°C': 'degC',
            'cycles': 'cycles',
            'mm/s': 'mm_per_s',
          };
          
          const standardUnit = unitMap[unit] || unit;
          
          return {
            value: value,
            unit: standardUnit,
            // Also provide unit-aware string representation for easy parsing
            valueWithUnit: `${value}_${standardUnit}`,
          };
        };

        const unitInfo = unitStandardization(currentValue, definition.unit);

        enrichedParameters[paramKey] = {
          ...unitInfo,
          type: definition.type,
          label: definition.label,
          description: definition.description,
          required: definition.required || false,
          ...(definition.min !== undefined && { min: definition.min }),
          ...(definition.max !== undefined && { max: definition.max }),
          ...(definition.step !== undefined && { step: definition.step }),
          ...(definition.options && { options: definition.options }),
          ...(definition.dependsOn && { dependsOn: definition.dependsOn }),
          group: groupKey,
          groupLabel: typedGroup.label,
          // Add validation rules for backend
          validation: {
            required: definition.required || false,
            ...(definition.min !== undefined && { min: definition.min }),
            ...(definition.max !== undefined && { max: definition.max }),
            ...(definition.type && { dataType: definition.type }),
          }
        };
      });
    });
        }

        return enrichedParameters;
      }
    };

    const exportParameters = createParameters();

    // Auto-generate execution steps from primitive operations
    const autoExecutionSteps = generateExecutionSteps(data.primitiveOperations || [], exportParameters);

    const exportData = {
      // Node metadata
      nodeId: id,
      nodeType: data.nodeType,
      label: data.label,
      description: data.description,
      category: data.category || 'SDLCatalyst',
      
      // Execution information
      primitiveOperations: data.primitiveOperations || [],
      executionSteps: autoExecutionSteps, // Use auto-generated steps
      totalEstimatedDuration: autoExecutionSteps.reduce((sum, step) => sum + step.estimatedDuration, 0),
      
      // Loop and break conditions with expression support
      loopCondition: parameters.loop_condition ? {
        type: "expression",
        expr: parameters.loop_condition,
        description: `Loop while: ${parameters.loop_condition}`,
        maxIterations: parameters.max_iterations || 100,
      } : undefined,
      
      breakCondition: parameters.break_condition ? {
        type: "expression", 
        expr: parameters.break_condition,
        description: `Break when: ${parameters.break_condition}`,
        checkInterval: parameters.check_interval || 1,
      } : undefined,
      
      // Parameter structure (simple values for execution, rich metadata for full export)
      parameters: exportParameters,

      // Parameter groups for structure (only include in full export)
      ...(exportType === 'full' && {
        parameterGroups: data.parameterGroups ? Object.fromEntries(
          Object.entries(data.parameterGroups).map(([key, group]) => [
            key,
            {
              label: (group as ParameterGroup).label,
              parameterKeys: Object.keys((group as ParameterGroup).parameters),
            },
          ])
        ) : {},
      }),

      // Export metadata
      exportMetadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        format: exportType === 'execution' ? 'SDLCatalyst_Execution' : 'SDLCatalyst_Enhanced',
        exportType: exportType,
        totalParameters: Object.keys(exportParameters).length,
        ...(exportType === 'full' && {
          requiredParameters: Object.values(exportParameters).filter((p: any) => p.required).length,
        }),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = exportType === 'execution' ? 'execution' : 'enhanced';
    a.download = `${data.nodeType}_${id}_${suffix}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        let parametersToImport: Record<string, any> = {};
        
        // Handle enhanced format (new format)
        if (importedData.exportMetadata && importedData.exportMetadata.format?.includes('SDLCatalyst_Enhanced')) {
          // Extract values from enhanced parameter structure
          Object.entries(importedData.parameters || {}).forEach(([key, paramData]: [string, any]) => {
            parametersToImport[key] = paramData.value;
          });
          
          console.log(`Importing enhanced format with ${importedData.exportMetadata.totalParameters} parameters`);
        }
        // Handle legacy format (old format)
        else if (importedData.parameters) {
          parametersToImport = importedData.parameters;
          console.log('Importing legacy format');
        }
        else {
          throw new Error('Invalid file format: missing parameters');
        }
        
        // Validate that we have parameters to import
        if (Object.keys(parametersToImport).length === 0) {
          throw new Error('No valid parameters found in import file');
        }
        
        setParameters(parametersToImport);
        if (data.onDataChange) {
          data.onDataChange({
            ...data,
            parameters: parametersToImport,
            importedFileName: file.name,
          });
        }
        
        setImportedFileName(file.name);
        alert(`Successfully imported configuration from: ${file.name} (${Object.keys(parametersToImport).length} parameters)`);
        
      } catch (error) {
        console.error('Error importing JSON:', error);
        alert(`Error importing file: ${error instanceof Error ? error.message : 'Invalid JSON format'}`);
      }
    };
    reader.readAsText(file);
    
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
        category: 'SDLCatalyst',
        nodeType: data.nodeType,
        parameters,
        primitiveOperations: data.primitiveOperations || [],
        tags: [data.category || 'electrochemistry'],
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
    const value = parameters[paramKey] !== undefined ? parameters[paramKey] : definition.defaultValue;
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
        console.log(`SDLCatalyst Rendering checkbox for ${paramKey}:`, {
          rawValue: value,
          boolValue,
          type: typeof value,
          definition
        });

        return (
          <SimpleCheckbox
            key={paramKey}
            paramKey={paramKey}
            label={definition.label}
            checked={boolValue}
            onChange={(checked) => {
              console.log(`SDLCatalyst SimpleCheckbox ${paramKey} onChange:`, {
                checked,
                currentValue: value
              });
              handleParameterChange(paramKey, checked);
            }}
            disabled={definition.readOnly || false}
          />
        );
        
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
    <Box className={`sdl-catalyst-node ${data.category?.toLowerCase()}`} sx={{ position: 'relative' }}>
      {/* Single central connection point - can act as both input and output */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-connection`}
        style={{
          background: '#fff',
          border: '3px solid #1976d2',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
          transition: 'all 0.2s ease',
          right: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
          e.currentTarget.style.background = '#1976d2';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.3)';
        }}
      />

      {/* Hidden target handle for receiving connections */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-target`}
        style={{
          background: '#fff',
          border: '3px solid #1976d2',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
          transition: 'all 0.2s ease',
          left: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
          e.currentTarget.style.background = '#1976d2';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.3)';
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
        <Box
          ref={scrollContainerRef}
          className={`node-content nodrag ${hasScrollableContent ? 'has-scroll' : ''}`}
          onMouseEnter={handleScrollAreaMouseEnter}
          onMouseLeave={handleScrollAreaMouseLeave}
          onMouseDown={handleScrollAreaMouseDown}
          onWheel={handleScrollAreaWheel}
          sx={{
            position: 'relative',
          }}
        >
          {/* Scroll hint */}
          {hasScrollableContent && (
            <Box className="scroll-hint">
              🖱️ Scroll here
            </Box>
          )}
          {data.parameterGroups && Object.entries(data.parameterGroups).map(([groupKey, group]) => {
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
              onClick={() => handleExportJSON('execution')}
              title="Export simplified JSON for execution (values only)"
            >
              Export for Execution
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={() => handleExportJSON('full')}
              title="Export full JSON with metadata and options"
            >
              Export Full
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