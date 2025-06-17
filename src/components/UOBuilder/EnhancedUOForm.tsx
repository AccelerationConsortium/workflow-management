/**
 * Enhanced UO Form - Additional fields for comprehensive UO definition
 * Includes inputs/outputs, specs, constraints, environment requirements
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Input as InputIcon,
  Output as OutputIcon,
  Settings as SpecsIcon,
  Security as ConstraintsIcon,
  Eco as EnvironmentIcon
} from '@mui/icons-material';

import {
  UOPort,
  UOSpecs,
  UOPrimitive,
  SupportedDevice,
  UOConstraints,
  EnvironmentRequirements
} from './types';

interface EnhancedUOFormProps {
  inputs: UOPort[];
  outputs: UOPort[];
  specs: UOSpecs;
  primitives: UOPrimitive[];
  supportedDevices: SupportedDevice[];
  constraints: UOConstraints;
  environment: EnvironmentRequirements;
  onInputsChange: (inputs: UOPort[]) => void;
  onOutputsChange: (outputs: UOPort[]) => void;
  onSpecsChange: (specs: UOSpecs) => void;
  onPrimitivesChange: (primitives: UOPrimitive[]) => void;
  onSupportedDevicesChange: (devices: SupportedDevice[]) => void;
  onConstraintsChange: (constraints: UOConstraints) => void;
  onEnvironmentChange: (environment: EnvironmentRequirements) => void;
}

export const EnhancedUOForm: React.FC<EnhancedUOFormProps> = ({
  inputs,
  outputs,
  specs,
  primitives,
  supportedDevices,
  constraints,
  environment,
  onInputsChange,
  onOutputsChange,
  onSpecsChange,
  onPrimitivesChange,
  onSupportedDevicesChange,
  onConstraintsChange,
  onEnvironmentChange
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['inputs']);

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Input/Output port management
  const addPort = (type: 'input' | 'output') => {
    const newPort: UOPort = {
      id: `${type}_${Date.now()}`,
      label: `${type === 'input' ? 'Input' : 'Output'} ${type === 'input' ? inputs.length + 1 : outputs.length + 1}`,
      type: 'liquid',
      required: false,
      description: ''
    };

    if (type === 'input') {
      onInputsChange([...inputs, newPort]);
    } else {
      onOutputsChange([...outputs, newPort]);
    }
  };

  const updatePort = (type: 'input' | 'output', index: number, updates: Partial<UOPort>) => {
    const ports = type === 'input' ? inputs : outputs;
    const updatedPorts = ports.map((port, i) => 
      i === index ? { ...port, ...updates } : port
    );
    
    if (type === 'input') {
      onInputsChange(updatedPorts);
    } else {
      onOutputsChange(updatedPorts);
    }
  };

  const removePort = (type: 'input' | 'output', index: number) => {
    const ports = type === 'input' ? inputs : outputs;
    const updatedPorts = ports.filter((_, i) => i !== index);
    
    if (type === 'input') {
      onInputsChange(updatedPorts);
    } else {
      onOutputsChange(updatedPorts);
    }
  };

  const renderPortSection = (type: 'input' | 'output') => {
    const ports = type === 'input' ? inputs : outputs;
    const Icon = type === 'input' ? InputIcon : OutputIcon;
    
    return (
      <Accordion 
        expanded={expandedSections.includes(`${type}s`)}
        onChange={() => handleSectionToggle(`${type}s`)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary" />
            <Typography variant="h6">
              {type === 'input' ? 'Input' : 'Output'} Ports ({ports.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={() => addPort(type)}
              variant="outlined"
              size="small"
            >
              Add {type === 'input' ? 'Input' : 'Output'} Port
            </Button>
          </Box>
          
          {ports.map((port, index) => (
            <Box key={port.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <TextField
                    label="Label"
                    value={port.label}
                    onChange={(e) => updatePort(type, index, { label: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={port.type}
                      onChange={(e) => updatePort(type, index, { type: e.target.value })}
                      label="Type"
                    >
                      <MenuItem value="liquid">Liquid</MenuItem>
                      <MenuItem value="gas">Gas</MenuItem>
                      <MenuItem value="solid">Solid</MenuItem>
                      <MenuItem value="signal">Signal</MenuItem>
                      <MenuItem value="data">Data</MenuItem>
                      <MenuItem value="power">Power</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Description"
                    value={port.description || ''}
                    onChange={(e) => updatePort(type, index, { description: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={port.required}
                        onChange={(e) => updatePort(type, index, { required: e.target.checked })}
                      />
                    }
                    label="Required"
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removePort(type, index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Enhanced UO Configuration
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Configure additional properties to match preset UO capabilities
      </Typography>

      {/* Input Ports */}
      {renderPortSection('input')}

      {/* Output Ports */}
      {renderPortSection('output')}

      {/* Hardware Specifications */}
      <Accordion 
        expanded={expandedSections.includes('specs')}
        onChange={() => handleSectionToggle('specs')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpecsIcon color="primary" />
            <Typography variant="h6">Hardware Specifications</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Manufacturer"
                value={specs.manufacturer || ''}
                onChange={(e) => onSpecsChange({ ...specs, manufacturer: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Model"
                value={specs.model || ''}
                onChange={(e) => onSpecsChange({ ...specs, model: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Operating Range"
                value={specs.range || ''}
                onChange={(e) => onSpecsChange({ ...specs, range: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., 0-100 mL/min"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Precision"
                value={specs.precision || ''}
                onChange={(e) => onSpecsChange({ ...specs, precision: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., ±0.1 mL/min"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Communication Protocol"
                value={specs.communicationProtocol || ''}
                onChange={(e) => onSpecsChange({ ...specs, communicationProtocol: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., RS232, USB, Ethernet"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Power Requirement"
                value={specs.powerRequirement || ''}
                onChange={(e) => onSpecsChange({ ...specs, powerRequirement: e.target.value })}
                fullWidth
                size="small"
                placeholder="e.g., 110-240V AC, 50-60Hz"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Constraints */}
      <Accordion
        expanded={expandedSections.includes('constraints')}
        onChange={() => handleSectionToggle('constraints')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ConstraintsIcon color="primary" />
            <Typography variant="h6">Operational Constraints</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Max Concurrent Operations"
                type="number"
                value={constraints.maxConcurrentOperations || ''}
                onChange={(e) => onConstraintsChange({
                  ...constraints,
                  maxConcurrentOperations: parseInt(e.target.value) || undefined
                })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Maintenance Interval"
                value={constraints.maintenanceInterval || ''}
                onChange={(e) => onConstraintsChange({
                  ...constraints,
                  maintenanceInterval: e.target.value
                })}
                fullWidth
                size="small"
                placeholder="e.g., 1000 hours, 6 months"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={constraints.requiredCalibration || false}
                    onChange={(e) => onConstraintsChange({
                      ...constraints,
                      requiredCalibration: e.target.checked
                    })}
                  />
                }
                label="Requires Regular Calibration"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Environment Requirements */}
      <Accordion
        expanded={expandedSections.includes('environment')}
        onChange={() => handleSectionToggle('environment')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EnvironmentIcon color="primary" />
            <Typography variant="h6">Environment Requirements</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Ventilation</InputLabel>
                <Select
                  value={environment.ventilation || 'none'}
                  onChange={(e) => onEnvironmentChange({
                    ...environment,
                    ventilation: e.target.value as 'required' | 'recommended' | 'none'
                  })}
                  label="Ventilation"
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="recommended">Recommended</MenuItem>
                  <MenuItem value="required">Required</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={environment.fumeHood || false}
                    onChange={(e) => onEnvironmentChange({
                      ...environment,
                      fumeHood: e.target.checked
                    })}
                  />
                }
                label="Fume Hood Required"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={environment.cleanRoom || false}
                    onChange={(e) => onEnvironmentChange({
                      ...environment,
                      cleanRoom: e.target.checked
                    })}
                  />
                }
                label="Clean Room Environment"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={environment.vibrationIsolation || false}
                    onChange={(e) => onEnvironmentChange({
                      ...environment,
                      vibrationIsolation: e.target.checked
                    })}
                  />
                }
                label="Vibration Isolation"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
