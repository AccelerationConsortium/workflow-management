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
  Button,
  Checkbox
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

            {/* Device Initialization 配置 */}
            {componentType === 'DEVICE_INITIALIZATION' && (
              <>
                <TextField
                  size="small"
                  label="Device ID"
                  value={config.deviceId || ''}
                  onChange={(e) => onConfigChange({ deviceId: e.target.value })}
                  fullWidth
                  placeholder="e.g., cytation5"
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    value={config.deviceType || 'cytation'}
                    onChange={(e) => onConfigChange({ deviceType: e.target.value })}
                  >
                    <MenuItem value="photoreactor">Photoreactor</MenuItem>
                    <MenuItem value="cytation">Cytation Reader</MenuItem>
                    <MenuItem value="robot">Robot Arm</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Initialization Mode</InputLabel>
                  <Select
                    value={config.initMode || 'soft'}
                    onChange={(e) => onConfigChange({ initMode: e.target.value })}
                  >
                    <MenuItem value="soft">Soft (Warmup only)</MenuItem>
                    <MenuItem value="hard">Hard (Full reset)</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Timeout (seconds)"
                    type="number"
                    value={config.timeoutS || 30}
                    onChange={(e) => onConfigChange({ timeoutS: Number(e.target.value) })}
                  />
                  <TextField
                    size="small"
                    label="Retry Count"
                    type="number"
                    value={config.retryCount || 2}
                    onChange={(e) => onConfigChange({ retryCount: Number(e.target.value) })}
                  />
                </Box>
              </>
            )}

            {/* User Confirmation 配置 */}
            {componentType === 'USER_CONFIRMATION' && (
              <>
                <TextField
                  size="small"
                  label="Prompt Text"
                  value={config.promptText || ''}
                  onChange={(e) => onConfigChange({ promptText: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="e.g., Confirm vial placement"
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>Expected Response</InputLabel>
                  <Select
                    value={config.expectedResponse || 'yes'}
                    onChange={(e) => onConfigChange({ expectedResponse: e.target.value })}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="ok">OK</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Timeout (seconds)"
                    type="number"
                    value={config.timeoutS || 120}
                    onChange={(e) => onConfigChange({ timeoutS: Number(e.target.value) })}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.abortOnTimeout || false}
                        onChange={(e) => onConfigChange({ abortOnTimeout: e.target.checked })}
                      />
                    }
                    label="Abort on timeout"
                  />
                </Box>
              </>
            )}

            {/* Liquid Transfer 配置 */}
            {componentType === 'LIQUID_TRANSFER' && (
              <>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Source Container"
                    value={config.sourceContainer || ''}
                    onChange={(e) => onConfigChange({ sourceContainer: e.target.value })}
                    placeholder="e.g., stock_A"
                  />
                  <TextField
                    size="small"
                    label="Target Container"
                    value={config.targetContainer || ''}
                    onChange={(e) => onConfigChange({ targetContainer: e.target.value })}
                    placeholder="e.g., reactor_tube"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Volume (mL)"
                    type="number"
                    value={config.volumeMl || 0.5}
                    onChange={(e) => onConfigChange({ volumeMl: Number(e.target.value) })}
                    inputProps={{ step: 0.1, min: 0 }}
                  />
                  <TextField
                    size="small"
                    label="Speed (μL/s)"
                    type="number"
                    value={config.speedUlPerS || 300}
                    onChange={(e) => onConfigChange({ speedUlPerS: Number(e.target.value) })}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Pipette Type</InputLabel>
                    <Select
                      value={config.pipetteType || 'single'}
                      onChange={(e) => onConfigChange({ pipetteType: e.target.value })}
                    >
                      <MenuItem value="single">Single</MenuItem>
                      <MenuItem value="multi">Multi</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.mixAfter || false}
                        onChange={(e) => onConfigChange({ mixAfter: e.target.checked })}
                      />
                    }
                    label="Mix after transfer"
                  />
                </Box>
              </>
            )}

            {/* Start Reaction 配置 */}
            {componentType === 'START_REACTION' && (
              <>
                <TextField
                  size="small"
                  label="Device ID"
                  value={config.deviceId || ''}
                  onChange={(e) => onConfigChange({ deviceId: e.target.value })}
                  fullWidth
                  placeholder="e.g., photoreactor_1"
                />

                <TextField
                  size="small"
                  label="Reaction Mode"
                  value={config.mode || ''}
                  onChange={(e) => onConfigChange({ mode: e.target.value })}
                  fullWidth
                  placeholder="e.g., UV-A 365nm"
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Duration (seconds)"
                    type="number"
                    value={config.durationS || 300}
                    onChange={(e) => onConfigChange({ durationS: Number(e.target.value) })}
                  />
                  <TextField
                    size="small"
                    label="Intensity (%)"
                    type="number"
                    value={config.intensityPct || 80}
                    onChange={(e) => onConfigChange({ intensityPct: Number(e.target.value) })}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Box>
              </>
            )}

            {/* Trigger Measurement 配置 */}
            {componentType === 'TRIGGER_MEASUREMENT' && (
              <>
                <TextField
                  size="small"
                  label="Device ID"
                  value={config.deviceId || ''}
                  onChange={(e) => onConfigChange({ deviceId: e.target.value })}
                  fullWidth
                  placeholder="e.g., cytation5"
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>Measurement Type</InputLabel>
                  <Select
                    value={config.measurementType || 'OD600'}
                    onChange={(e) => onConfigChange({ measurementType: e.target.value })}
                  >
                    <MenuItem value="OD600">OD600</MenuItem>
                    <MenuItem value="fluorescence">Fluorescence</MenuItem>
                    <MenuItem value="absorbance">Absorbance</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Wavelength (nm)"
                    type="number"
                    value={config.wavelengthNm || 600}
                    onChange={(e) => onConfigChange({ wavelengthNm: Number(e.target.value) })}
                  />
                  <TextField
                    size="small"
                    label="Integration Time (ms)"
                    type="number"
                    value={config.integrationTimeMs || 500}
                    onChange={(e) => onConfigChange({ integrationTimeMs: Number(e.target.value) })}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Export Format</InputLabel>
                    <Select
                      value={config.exportFormat || 'csv'}
                      onChange={(e) => onConfigChange({ exportFormat: e.target.value })}
                    >
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label="Save To"
                    value={config.saveTo || ''}
                    onChange={(e) => onConfigChange({ saveTo: e.target.value })}
                    placeholder="e.g., results/exp001.csv"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </>
            )}

            {/* Pause/Delay Step 配置 */}
            {componentType === 'PAUSE_DELAY' && (
              <>
                <TextField
                  size="small"
                  label="Duration (seconds)"
                  type="number"
                  value={config.durationS || 300}
                  onChange={(e) => onConfigChange({ durationS: Number(e.target.value) })}
                  fullWidth
                />

                <TextField
                  size="small"
                  label="Reason"
                  value={config.reason || ''}
                  onChange={(e) => onConfigChange({ reason: e.target.value })}
                  fullWidth
                  placeholder="e.g., Allow reaction to settle"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config.skippable || false}
                      onChange={(e) => onConfigChange({ skippable: e.target.checked })}
                    />
                  }
                  label="User can skip this step"
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

      // Workflow components preview
      case 'DEVICE_INITIALIZATION':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              🧪 {config.label}
            </Typography>
            <Box sx={{ p: 1, bgcolor: '#f0f8ff', borderRadius: 1, border: '1px solid #e3f2fd' }}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Device: {config.deviceId || 'Not set'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Type: {config.deviceType || 'cytation'} | Mode: {config.initMode || 'soft'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Timeout: {config.timeoutS || 30}s | Retries: {config.retryCount || 2}
              </Typography>
            </Box>
          </Box>
        );

      case 'USER_CONFIRMATION':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              ✅ {config.label}
            </Typography>
            <Box sx={{ p: 1, bgcolor: '#f0fff0', borderRadius: 1, border: '1px solid #e8f5e8' }}>
              <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
                "{config.promptText || 'Confirm action'}"
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Expected: {config.expectedResponse || 'yes'} | Timeout: {config.timeoutS || 120}s
              </Typography>
            </Box>
          </Box>
        );

      case 'LIQUID_TRANSFER':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              🔁 {config.label}
            </Typography>
            <Box sx={{ p: 1, bgcolor: '#fff8f0', borderRadius: 1, border: '1px solid #ffe8cc' }}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {config.sourceContainer || 'Source'} → {config.targetContainer || 'Target'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Volume: {config.volumeMl || 0.5} mL
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Speed: {config.speedUlPerS || 300} μL/s | {config.pipetteType || 'single'} pipette
              </Typography>
            </Box>
          </Box>
        );

      case 'START_REACTION':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              🔆 {config.label}
            </Typography>
            <Box sx={{ p: 1, bgcolor: '#fff0f8', borderRadius: 1, border: '1px solid #fce4ec' }}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Device: {config.deviceId || 'Not set'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Mode: {config.mode || 'Default'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Duration: {config.durationS || 300}s | Intensity: {config.intensityPct || 80}%
              </Typography>
            </Box>
          </Box>
        );

      case 'TRIGGER_MEASUREMENT':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              📏 {config.label}
            </Typography>
            <Box sx={{ p: 1, bgcolor: '#f8f0ff', borderRadius: 1, border: '1px solid #e8d5ff' }}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Device: {config.deviceId || 'Not set'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Type: {config.measurementType || 'OD600'}
                {config.wavelengthNm && ` @ ${config.wavelengthNm}nm`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Export: {config.exportFormat || 'csv'} | {config.saveTo || 'results/data.csv'}
              </Typography>
            </Box>
          </Box>
        );

      case 'PAUSE_DELAY':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              ⏸️ {config.label}
            </Typography>
            <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Duration: {config.durationS || 300} seconds
              </Typography>
              {config.reason && (
                <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
                  Reason: {config.reason}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {config.skippable ? 'Skippable' : 'Required'}
              </Typography>
            </Box>
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
