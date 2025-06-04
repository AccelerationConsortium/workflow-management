/**
 * Component Preview - Shows how components will look in the final UO
 */

import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Slider,
  Typography,
  Chip
} from '@mui/material';

import { UOComponent, ComponentType } from './types';

interface ComponentPreviewProps {
  component: UOComponent;
  interactive?: boolean;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component,
  interactive = false
}) => {
  const renderComponent = () => {
    switch (component.type) {
      case ComponentType.INPUT:
        const inputComp = component as any;
        return (
          <TextField
            label={component.label}
            placeholder={inputComp.placeholder}
            defaultValue={inputComp.defaultValue}
            fullWidth
            size="small"
            disabled={!interactive}
            required={component.required}
          />
        );

      case ComponentType.NUMBER_INPUT:
        const numberComp = component as any;
        return (
          <Box>
            <TextField
              label={component.label}
              type="number"
              defaultValue={numberComp.defaultValue}
              inputProps={{
                min: numberComp.min,
                max: numberComp.max,
                step: numberComp.step
              }}
              fullWidth
              size="small"
              disabled={!interactive}
              required={component.required}
            />
            {numberComp.unit && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Unit: {numberComp.unit}
              </Typography>
            )}
          </Box>
        );

      case ComponentType.SELECT:
        const selectComp = component as any;
        return (
          <FormControl fullWidth size="small" required={component.required}>
            <InputLabel>{component.label}</InputLabel>
            <Select
              defaultValue={selectComp.defaultValue || ''}
              label={component.label}
              disabled={!interactive}
              multiple={selectComp.multiple}
            >
              {selectComp.options?.map((option: string, index: number) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case ComponentType.BOOLEAN:
        const boolComp = component as any;
        return (
          <FormControlLabel
            control={
              <Switch
                defaultChecked={boolComp.defaultValue}
                disabled={!interactive}
              />
            }
            label={component.label}
          />
        );

      case ComponentType.DATE_PICKER:
        return (
          <TextField
            label={component.label}
            type="date"
            disabled={!interactive}
            size="small"
            fullWidth
            required={component.required}
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      case ComponentType.RANGE_SLIDER:
        const rangeComp = component as any;
        return (
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" gutterBottom>
              {component.label}
              {component.required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
            <Slider
              defaultValue={rangeComp.defaultValue || [rangeComp.min, rangeComp.max]}
              min={rangeComp.min}
              max={rangeComp.max}
              step={rangeComp.step || 1}
              valueLabelDisplay="auto"
              disabled={!interactive}
              marks={[
                { value: rangeComp.min, label: `${rangeComp.min}${rangeComp.unit || ''}` },
                { value: rangeComp.max, label: `${rangeComp.max}${rangeComp.unit || ''}` }
              ]}
            />
          </Box>
        );

      case ComponentType.TEXT_AREA:
        const textAreaComp = component as any;
        return (
          <TextField
            label={component.label}
            placeholder={textAreaComp.placeholder}
            defaultValue={textAreaComp.defaultValue}
            multiline
            rows={textAreaComp.rows || 3}
            fullWidth
            size="small"
            disabled={!interactive}
            required={component.required}
          />
        );

      case ComponentType.UNIT_LABEL:
        const unitComp = component as any;
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">
              {component.label}:
            </Typography>
            <Chip
              label={unitComp.unit}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
        );

      case ComponentType.PARAMETER_NAME:
        const paramComp = component as any;
        return (
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              {paramComp.parameterName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Parameter Name
            </Typography>
          </Box>
        );

      // Workflow components
      case ComponentType.DEVICE_INITIALIZATION:
        const deviceInitComp = component as any;
        return (
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🧪 Device Initialization
            </Typography>
            <Typography variant="body2">Device: {deviceInitComp.deviceId}</Typography>
            <Typography variant="body2">Type: {deviceInitComp.deviceType || 'N/A'}</Typography>
            <Typography variant="body2">Mode: {deviceInitComp.initMode || 'soft'}</Typography>
            <Typography variant="caption" color="text.secondary">
              Timeout: {deviceInitComp.timeoutS || 30}s, Retries: {deviceInitComp.retryCount || 2}
            </Typography>
          </Box>
        );

      case ComponentType.USER_CONFIRMATION:
        const userConfComp = component as any;
        return (
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ User Confirmation
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
              "{userConfComp.promptText}"
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Expected: {userConfComp.expectedResponse || 'yes'} | Timeout: {userConfComp.timeoutS || 120}s
            </Typography>
          </Box>
        );

      case ComponentType.LIQUID_TRANSFER:
        const liquidComp = component as any;
        return (
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🔁 Liquid Transfer
            </Typography>
            <Typography variant="body2">
              {liquidComp.sourceContainer} → {liquidComp.targetContainer}
            </Typography>
            <Typography variant="body2">Volume: {liquidComp.volumeMl} mL</Typography>
            <Typography variant="caption" color="text.secondary">
              Speed: {liquidComp.speedUlPerS || 300} μL/s | {liquidComp.pipetteType || 'single'} pipette
            </Typography>
          </Box>
        );

      case ComponentType.START_REACTION:
        const reactionComp = component as any;
        return (
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🔆 Start Reaction
            </Typography>
            <Typography variant="body2">Device: {reactionComp.deviceId}</Typography>
            <Typography variant="body2">Mode: {reactionComp.mode || 'Default'}</Typography>
            <Typography variant="caption" color="text.secondary">
              Duration: {reactionComp.durationS || 0}s | Intensity: {reactionComp.intensityPct || 100}%
            </Typography>
          </Box>
        );

      case ComponentType.TRIGGER_MEASUREMENT:
        const measureComp = component as any;
        return (
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📏 Trigger Measurement
            </Typography>
            <Typography variant="body2">Device: {measureComp.deviceId}</Typography>
            <Typography variant="body2">Type: {measureComp.measurementType || 'OD600'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {measureComp.wavelengthNm ? `${measureComp.wavelengthNm}nm` : ''} |
              Export: {measureComp.exportFormat || 'csv'}
            </Typography>
          </Box>
        );

      case ComponentType.PAUSE_DELAY:
        const pauseComp = component as any;
        return (
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ⏸️ Pause / Delay
            </Typography>
            <Typography variant="body2">Duration: {pauseComp.durationS} seconds</Typography>
            {pauseComp.reason && (
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                Reason: {pauseComp.reason}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {pauseComp.skippable ? 'Skippable' : 'Required'}
            </Typography>
          </Box>
        );

      default:
        return (
          <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Unknown component type: {component.type}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ minHeight: 60 }}>
      {renderComponent()}
      {component.description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {component.description}
        </Typography>
      )}
    </Box>
  );
};
