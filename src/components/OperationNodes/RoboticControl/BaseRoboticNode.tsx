/**
 * Base component for all Robotic Control nodes
 */

import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
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
  IconButton,
  Tooltip,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { ParameterDefinition } from './types';
import './styles.css';

interface BaseRoboticNodeData {
  label: string;
  description: string;
  parameters: Record<string, ParameterDefinition>;
  values: Record<string, any>;
  robotType?: string;
  icon?: string;
  nodeType?: string;
  showPositionDisplay?: boolean; 
  onParameterChange?: (paramName: string, value: any) => void;
  onExport?: () => void;
  onImport?: () => void;
  onDuplicate?: () => void;
}

interface BaseRoboticNodeProps extends NodeProps {
  data: BaseRoboticNodeData;
}

export const BaseRoboticNode: React.FC<BaseRoboticNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, any>>(data.values || {});

  const handleParameterChange = useCallback((paramName: string, value: any) => {
    const newValues = { ...values, [paramName]: value };
    setValues(newValues);
    
    if (data.onParameterChange) {
      data.onParameterChange(paramName, value);
    }
  }, [values, data]);

  const renderParameter = (paramName: string, param: ParameterDefinition) => {
    const value = values[paramName] ?? param.defaultValue;

    switch (param.type) {
      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={param.label}
            value={value || ''}
            onChange={(e) => {
              const numValue = e.target.value === '' ? 0 : Number(e.target.value);
              handleParameterChange(paramName, numValue);
            }}
            onBlur={(e) => {
              // Ensure the value is within bounds on blur
              let numValue = Number(e.target.value);
              if (param.min !== undefined && numValue < param.min) {
                numValue = param.min;
              }
              if (param.max !== undefined && numValue > param.max) {
                numValue = param.max;
              }
              handleParameterChange(paramName, numValue);
            }}
            inputProps={{
              min: param.min,
              max: param.max,
              step: param.step || 1,
              style: { 
                MozAppearance: 'textfield' // Remove spinner arrows in Firefox
              }
            }}
            helperText={param.description}
            InputProps={{
              endAdornment: param.unit && (
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  {param.unit}
                </Typography>
              )
            }}
            sx={{
              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
            }}
          />
        );

      case 'string':
        return (
          <TextField
            fullWidth
            size="small"
            label={param.label}
            value={value || ''}
            onChange={(e) => handleParameterChange(paramName, e.target.value)}
            helperText={param.description}
          />
        );

      case 'boolean':
        return (
          <Box sx={{ py: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(value)}
                  onChange={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    handleParameterChange(paramName, e.target.checked);
                  }}
                  size="small"
                  onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                />
              }
              label={
                <Box>
                  <Typography variant="body2">{param.label}</Typography>
                  {param.description && (
                    <Typography variant="caption" color="textSecondary">
                      {param.description}
                    </Typography>
                  )}
                </Box>
              }
              sx={{ margin: 0 }}
            />
          </Box>
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={value || param.defaultValue || ''}
              onChange={(e) => {
                handleParameterChange(paramName, e.target.value);
              }}
              label={param.label}
              MenuProps={{
                disableScrollLock: true,
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              }}
            >
              {param.options?.map((option) => (
                <MenuItem 
                  key={option} 
                  value={option}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
            {param.description && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                {param.description}
              </Typography>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  const renderPositionDisplay = () => {
    if (data.showPositionDisplay && values.x !== undefined && values.y !== undefined && values.z !== undefined) {
      return (
        <div className="position-display">
          <div className="position-coords">
            <div className="coord-item">
              <span className="coord-label">X:</span>
              <span className="coord-value">{values.x}</span>
            </div>
            <div className="coord-item">
              <span className="coord-label">Y:</span>
              <span className="coord-value">{values.y}</span>
            </div>
            <div className="coord-item">
              <span className="coord-label">Z:</span>
              <span className="coord-value">{values.z}</span>
            </div>
            {values.rx !== undefined && (
              <>
                <div className="coord-item">
                  <span className="coord-label">RX:</span>
                  <span className="coord-value">{values.rx}°</span>
                </div>
                <div className="coord-item">
                  <span className="coord-label">RY:</span>
                  <span className="coord-value">{values.ry}°</span>
                </div>
                <div className="coord-item">
                  <span className="coord-label">RZ:</span>
                  <span className="coord-value">{values.rz}°</span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getNodeTypeClass = () => {
    const typeMap: Record<string, string> = {
      'robot_move_to': 'move-to',
      'robot_pick': 'pick',
      'robot_place': 'place',
      'robot_home': 'home',
      'robot_execute_sequence': 'sequence',
      'robot_wait': 'wait'
    };
    return typeMap[data.nodeType || ''] || '';
  };

  return (
    <div className={`robotic-node ${selected ? 'selected' : ''} ${getNodeTypeClass()}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle input"
        id="input"
      />

      <Box className="node-header">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="node-icon">{data.icon || '🤖'}</span>
            <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, color: '#1976D2' }}>
              {data.label}
            </Typography>
          </Box>
          {values.robotType && (
            <Chip 
              label={values.robotType} 
              size="small" 
              sx={{ 
                backgroundColor: '#1976D2', 
                color: 'white', 
                fontSize: '11px',
                height: '20px'
              }} 
            />
          )}
        </Box>
        {data.description && (
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '12px', mt: 0.5 }}>
            {data.description}
          </Typography>
        )}
      </Box>

      {/* Compact display of key parameters when collapsed */}
      {!expanded && (
        <Box sx={{ px: 2, pb: 2 }}>
          {renderPositionDisplay()}
          
          {/* Display key parameters in a compact format */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {values.motionType && (
              <Chip 
                label={values.motionType} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '10px', height: '18px' }}
              />
            )}
            {values.speed !== undefined && (
              <Chip 
                label={`${values.speed} mm/s`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '10px', height: '18px' }}
              />
            )}
            {values.objectId && (
              <Chip 
                label={values.objectId} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '10px', height: '18px' }}
              />
            )}
            {values.sequenceName && (
              <Chip 
                label={values.sequenceName} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '10px', height: '18px' }}
              />
            )}
            {values.duration !== undefined && (
              <Chip 
                label={`${values.duration}s`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '10px', height: '18px' }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Expandable parameters section */}
      <Accordion
        expanded={expanded}
        onChange={() => {}} // Disable automatic toggle
        className="node-accordion"
        sx={{
          '& .MuiAccordionSummary-root': {
            cursor: 'pointer',
          },
          '& .MuiAccordionDetails-root': {
            cursor: 'default',
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <Typography>Parameters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box 
            className="parameters-container"
            onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking on parameters
          >
            {Object.entries(data.parameters).map(([paramName, param]) => (
              <Box key={paramName} className="parameter-field" sx={{ mb: 2 }}>
                {renderParameter(paramName, param)}
              </Box>
            ))}
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            {data.onExport && (
              <Tooltip title="Export configuration">
                <IconButton size="small" onClick={data.onExport}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {data.onImport && (
              <Tooltip title="Import configuration">
                <IconButton size="small" onClick={data.onImport}>
                  <UploadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {data.onDuplicate && (
              <Tooltip title="Duplicate node">
                <IconButton size="small" onClick={data.onDuplicate}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle output"
        id="output"
      />
    </div>
  );
};
