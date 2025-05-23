/**
 * Parameter Slot Component - Individual slot for parameter modules
 * 参数插槽组件 - 单个参数模块插槽
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Collapse,
  Button
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

import { ComponentLibraryItem } from '../types';

interface ParameterSlotProps {
  slot: {
    id: string;
    slotNumber: number;
    component: ComponentLibraryItem | null;
    config: any;
  };
  onDrop: (component: ComponentLibraryItem) => void;
  onConfigChange: (config: any) => void;
  onRemove: () => void;
  canRemove: boolean;
  previewMode: boolean;
}

// 获取组件类型对应的单位选项
const getUnitOptions = (componentType: string): string[] => {
  switch (componentType) {
    case 'VOLUME_INPUT':
      return ['mL', 'μL', 'L'];
    case 'CONCENTRATION_INPUT':
      return ['mM', 'μM', 'nM', 'M', 'mg/mL', '%'];
    case 'TIME_INPUT':
      return ['s', 'min', 'h'];
    case 'TEMPERATURE_INPUT':
      return ['°C', 'K', '°F'];
    default:
      return ['mL', 'μL', 'L'];
  }
};

// 获取组件类型对应的默认单位
const getDefaultUnit = (componentType: string): string => {
  switch (componentType) {
    case 'VOLUME_INPUT':
      return 'mL';
    case 'CONCENTRATION_INPUT':
      return 'mM';
    case 'TIME_INPUT':
      return 's';
    case 'TEMPERATURE_INPUT':
      return '°C';
    default:
      return 'mL';
  }
};

export const ParameterSlot: React.FC<ParameterSlotProps> = ({
  slot,
  onDrop,
  onConfigChange,
  onRemove,
  canRemove,
  previewMode
}) => {
  const [configExpanded, setConfigExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const componentData = e.dataTransfer.getData('application/json');
    if (componentData) {
      try {
        const component = JSON.parse(componentData);
        onDrop(component);
      } catch (error) {
        console.error('Error parsing dropped component:', error);
      }
    }
  };

  // 渲染配置面板
  const renderConfigPanel = () => {
    if (!slot.component) return null;

    const { config } = slot;
    const componentType = slot.component.type;

    return (
      <Collapse in={configExpanded}>
        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Parameter Configuration
          </Typography>

          {/* 通用配置 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              size="small"
              label="Parameter Label"
              value={config.label || ''}
              onChange={(e) => onConfigChange({ label: e.target.value })}
              fullWidth
            />

            <TextField
              size="small"
              label="Tooltip Description"
              value={config.tooltip || ''}
              onChange={(e) => onConfigChange({ tooltip: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.required || false}
                  onChange={(e) => onConfigChange({ required: e.target.checked })}
                />
              }
              label="Required Field"
            />

            {/* 根据组件类型显示特定配置 */}
            {(['VOLUME_INPUT', 'CONCENTRATION_INPUT', 'TIME_INPUT', 'TEMPERATURE_INPUT'].includes(componentType)) && (
              <>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Min Value"
                    type="number"
                    value={config.min || 0}
                    onChange={(e) => onConfigChange({ min: Number(e.target.value) })}
                  />
                  <TextField
                    size="small"
                    label="Max Value"
                    type="number"
                    value={config.max || 1000}
                    onChange={(e) => onConfigChange({ max: Number(e.target.value) })}
                  />
                </Box>

                <TextField
                  size="small"
                  label="Default Value"
                  type="number"
                  value={config.defaultValue || 0}
                  onChange={(e) => onConfigChange({ defaultValue: Number(e.target.value) })}
                />

                <FormControl size="small">
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={config.unit || getDefaultUnit(componentType)}
                    onChange={(e) => onConfigChange({ unit: e.target.value })}
                  >
                    {getUnitOptions(componentType).map((unit: string) => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {(['MATERIAL_SELECT', 'CONTAINER_SELECT', 'BUFFER_SELECT'].includes(componentType)) && (
              <>
                <TextField
                  size="small"
                  label="Options (comma separated)"
                  value={(config.options || []).join(', ')}
                  onChange={(e) => onConfigChange({
                    options: e.target.value.split(',').map((opt: string) => opt.trim())
                  })}
                  fullWidth
                  multiline
                  rows={2}
                />

                <FormControl size="small">
                  <InputLabel>Default Selection</InputLabel>
                  <Select
                    value={config.defaultValue || ''}
                    onChange={(e) => onConfigChange({ defaultValue: e.target.value })}
                  >
                    {(config.options || []).map((option: string) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.allowCustomInput || false}
                      onChange={(e) => onConfigChange({ allowCustomInput: e.target.checked })}
                    />
                  }
                  label="Allow Custom Input"
                />
              </>
            )}

            {componentType === 'TEXT_NOTE' && (
              <>
                <TextField
                  size="small"
                  label="Placeholder Text"
                  value={config.placeholder || ''}
                  onChange={(e) => onConfigChange({ placeholder: e.target.value })}
                  fullWidth
                />

                <TextField
                  size="small"
                  label="Max Length"
                  type="number"
                  value={config.maxLength || 500}
                  onChange={(e) => onConfigChange({ maxLength: Number(e.target.value) })}
                />

                <TextField
                  size="small"
                  label="Rows"
                  type="number"
                  value={config.rows || 3}
                  onChange={(e) => onConfigChange({ rows: Number(e.target.value) })}
                />
              </>
            )}

            {componentType === 'FILE_OPERATIONS' && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.allowImport || false}
                      onChange={(e) => onConfigChange({ allowImport: e.target.checked })}
                    />
                  }
                  label="Allow Import"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.allowExport || false}
                      onChange={(e) => onConfigChange({ allowExport: e.target.checked })}
                    />
                  }
                  label="Allow Export"
                />

                <TextField
                  size="small"
                  label="File Types (comma separated)"
                  value={(config.fileTypes || []).join(', ')}
                  onChange={(e) => onConfigChange({
                    fileTypes: e.target.value.split(',').map((type: string) => type.trim())
                  })}
                  fullWidth
                  placeholder=".json, .csv, .xlsx"
                />
              </>
            )}
          </Box>
        </Box>
      </Collapse>
    );
  };

  // 渲染预览模式的组件
  const renderPreviewComponent = () => {
    if (!slot.component) return null;

    const { config } = slot;
    const componentType = slot.component.type;

    switch (componentType) {
      case 'VOLUME_INPUT':
      case 'CONCENTRATION_INPUT':
      case 'TIME_INPUT':
      case 'TEMPERATURE_INPUT':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                size="small"
                type="number"
                defaultValue={config.defaultValue || 0}
                inputProps={{ min: config.min, max: config.max, step: config.step }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    height: '36px'
                  }
                }}
              />
              <Typography variant="body2" sx={{ minWidth: '40px', color: 'text.secondary' }}>
                {config.unit}
              </Typography>
            </Box>
            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      case 'MATERIAL_SELECT':
      case 'CONTAINER_SELECT':
      case 'BUFFER_SELECT':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                defaultValue={config.defaultValue || ''}
                sx={{
                  height: '36px',
                  '& .MuiSelect-select': {
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }
                }}
              >
                {(config.options || ['Option 1', 'Option 2']).map((option: string) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      case 'ENABLE_TOGGLE':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked={config.defaultValue || false} size="small" />}
              label={
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {config.label}
                </Typography>
              }
              sx={{ margin: 0 }}
            />
            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      case 'FILE_OPERATIONS':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<span>📤</span>}>
                Import
              </Button>
              <Button size="small" variant="outlined" startIcon={<span>📥</span>}>
                Export
              </Button>
            </Box>
            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      case 'TEXT_NOTE':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <TextField
              size="small"
              multiline
              rows={config.rows || 2}
              fullWidth
              placeholder={config.placeholder}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem'
                }
              }}
            />
            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder={config.placeholder}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '36px'
                }
              }}
            />
          </Box>
        );
    }
  };

  return (
    <Paper
      elevation={slot.component ? 2 : 0}
      sx={{
        border: slot.component ? '1px solid #e0e0e0' : '2px dashed #ccc',
        borderColor: dragOver ? '#2196F3' : undefined,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Slot Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: slot.component ? '#f5f5f5' : 'transparent',
          borderBottom: slot.component ? '1px solid #e0e0e0' : 'none'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={slot.slotNumber}
            size="small"
            color="primary"
            variant="outlined"
          />
          {slot.component ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{slot.component.icon}</span>
              <Typography variant="subtitle2">
                {slot.component.label}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Drop a component here
            </Typography>
          )}
        </Box>

        {slot.component && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Configure Parameter">
              <IconButton
                size="small"
                onClick={() => setConfigExpanded(!configExpanded)}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {canRemove && (
              <Tooltip title="Remove Parameter">
                <IconButton
                  size="small"
                  onClick={onRemove}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Component Content */}
      {slot.component && (
        <Box sx={{ p: 2 }}>
          {previewMode ? (
            renderPreviewComponent()
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {slot.component.description}
              </Typography>
              <Box sx={{
                p: 1.5,
                bgcolor: '#f8f9fa',
                borderRadius: 1,
                border: '1px solid #e9ecef',
                mt: 1
              }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <strong>Label:</strong> {slot.config.label || 'Not configured'}
                </Typography>
                {slot.config.unit && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Unit:</strong> {slot.config.unit}
                  </Typography>
                )}
                {slot.config.defaultValue !== undefined && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Default:</strong> {slot.config.defaultValue}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Configuration Panel */}
      {slot.component && !previewMode && renderConfigPanel()}
    </Paper>
  );
};
