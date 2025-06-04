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
    case 'POSITION_INPUT':
      return ['mm', 'cm', 'inch'];
    case 'SPEED_INPUT':
      return ['mm/s', 'cm/s', 'rpm'];
    case 'PRESSURE_INPUT':
      return ['bar', 'psi', 'Pa', 'atm'];
    case 'FLOW_RATE_INPUT':
      return ['mL/min', 'μL/min', 'L/min'];
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
    case 'POSITION_INPUT':
      return 'mm';
    case 'SPEED_INPUT':
      return 'mm/s';
    case 'PRESSURE_INPUT':
      return 'bar';
    case 'FLOW_RATE_INPUT':
      return 'mL/min';
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

            {/* 基础参数类型的通用配置 */}
            {(componentType === 'VOLUME_INPUT' ||
              componentType === 'CONCENTRATION_INPUT' ||
              componentType === 'TIME_INPUT' ||
              componentType === 'TEMPERATURE_INPUT' ||
              componentType === 'POSITION_INPUT' ||
              componentType === 'SPEED_INPUT' ||
              componentType === 'PRESSURE_INPUT' ||
              componentType === 'FLOW_RATE_INPUT') && (
              <>
                <TextField
                  size="small"
                  label="Default Value"
                  type="number"
                  value={config.defaultValue || ''}
                  onChange={(e) => onConfigChange({ defaultValue: Number(e.target.value) || 0 })}
                  fullWidth
                  placeholder="Enter default value"
                />

                <TextField
                  size="small"
                  label="Minimum Value"
                  type="number"
                  value={config.min || ''}
                  onChange={(e) => onConfigChange({ min: Number(e.target.value) || 0 })}
                  fullWidth
                  placeholder="Enter minimum value"
                />

                <TextField
                  size="small"
                  label="Maximum Value"
                  type="number"
                  value={config.max || ''}
                  onChange={(e) => onConfigChange({ max: Number(e.target.value) || 100 })}
                  fullWidth
                  placeholder="Enter maximum value"
                />

                <TextField
                  size="small"
                  label="Step Size"
                  type="number"
                  value={config.step || ''}
                  onChange={(e) => onConfigChange({ step: Number(e.target.value) || 0.1 })}
                  fullWidth
                  placeholder="Enter step size"
                  inputProps={{ min: 0.001, step: 0.001 }}
                />

                <FormControl size="small">
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={config.unit || getDefaultUnit(componentType)}
                    onChange={(e) => onConfigChange({ unit: e.target.value })}
                  >
                    {getUnitOptions(componentType).map((unit) => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* 选择类型参数的配置 */}
            {(componentType === 'MATERIAL_SELECT' ||
              componentType === 'CONTAINER_SELECT' ||
              componentType === 'BUFFER_SELECT') && (
              <>
                <TextField
                  size="small"
                  label="Options (comma separated)"
                  value={(config.options || []).join(', ')}
                  onChange={(e) => onConfigChange({
                    options: e.target.value.split(',').map((opt: string) => opt.trim()).filter(opt => opt)
                  })}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Option 1, Option 2, Option 3"
                />

                <FormControl size="small">
                  <InputLabel>Default Selection</InputLabel>
                  <Select
                    value={config.defaultValue || ''}
                    onChange={(e) => onConfigChange({ defaultValue: e.target.value })}
                  >
                    {(config.options || ['Option 1']).map((option: string) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* 开关类型参数的配置 */}
            {componentType === 'ENABLE_TOGGLE' && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.defaultValue || false}
                      onChange={(e) => onConfigChange({ defaultValue: e.target.checked })}
                    />
                  }
                  label="Default State"
                />
              </>
            )}

            {/* 文本类型参数的配置 */}
            {componentType === 'TEXT_NOTE' && (
              <>
                <TextField
                  size="small"
                  label="Default Text"
                  value={config.defaultValue || ''}
                  onChange={(e) => onConfigChange({ defaultValue: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter default text"
                />

                <TextField
                  size="small"
                  label="Max Length"
                  type="number"
                  value={config.maxLength || ''}
                  onChange={(e) => onConfigChange({ maxLength: Number(e.target.value) || 255 })}
                  fullWidth
                  placeholder="Maximum character length"
                  inputProps={{ min: 1, max: 1000 }}
                />
              </>
            )}

            {componentType === 'DEVICE_INITIALIZATION' && (
              <>
                <TextField
                  size="small"
                  label="Device ID"
                  value={config.device_id || 'cytation5'}
                  onChange={(e) => onConfigChange({ device_id: e.target.value })}
                  fullWidth
                  placeholder="e.g., cytation5, photoreactor_1"
                />

                <FormControl size="small">
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    value={config.device_type || 'cytation'}
                    onChange={(e) => onConfigChange({ device_type: e.target.value })}
                  >
                    <MenuItem value="photoreactor">Photoreactor</MenuItem>
                    <MenuItem value="cytation">Cytation Reader</MenuItem>
                    <MenuItem value="robot">Robot Arm</MenuItem>
                    <MenuItem value="pump">Pump</MenuItem>
                    <MenuItem value="heater">Heater</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Initialization Mode</InputLabel>
                  <Select
                    value={config.init_mode || 'soft'}
                    onChange={(e) => onConfigChange({ init_mode: e.target.value })}
                  >
                    <MenuItem value="soft">Soft (Warmup only)</MenuItem>
                    <MenuItem value="hard">Hard (Full reset/init)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="Timeout (seconds)"
                  type="number"
                  value={config.timeout_s || 30}
                  onChange={(e) => onConfigChange({ timeout_s: Number(e.target.value) })}
                  inputProps={{ min: 5, max: 300 }}
                />

                <TextField
                  size="small"
                  label="Retry Count"
                  type="number"
                  value={config.retry_count || 2}
                  onChange={(e) => onConfigChange({ retry_count: Number(e.target.value) })}
                  inputProps={{ min: 0, max: 10 }}
                />
              </>
            )}

            {componentType === 'USER_CONFIRMATION' && (
              <>
                <TextField
                  size="small"
                  label="Prompt Text"
                  value={config.prompt_text || 'Confirm vial placement'}
                  onChange={(e) => onConfigChange({ prompt_text: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Message shown to the user"
                />

                <FormControl size="small">
                  <InputLabel>Expected Response</InputLabel>
                  <Select
                    value={config.expected_response || 'yes'}
                    onChange={(e) => onConfigChange({ expected_response: e.target.value })}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="ok">OK</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                    <MenuItem value="confirm">Confirm</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="Timeout (seconds)"
                  type="number"
                  value={config.timeout_s || 120}
                  onChange={(e) => onConfigChange({ timeout_s: Number(e.target.value) })}
                  inputProps={{ min: 10, max: 600 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.abort_on_timeout || true}
                      onChange={(e) => onConfigChange({ abort_on_timeout: e.target.checked })}
                    />
                  }
                  label="Abort on Timeout"
                />
              </>
            )}

            {componentType === 'LIQUID_TRANSFER' && (
              <>
                <TextField
                  size="small"
                  label="Source Container"
                  value={config.source_container || 'stock_A'}
                  onChange={(e) => onConfigChange({ source_container: e.target.value })}
                  fullWidth
                  placeholder="e.g., stock_A, reservoir_1"
                />

                <TextField
                  size="small"
                  label="Target Container"
                  value={config.target_container || 'reactor_tube'}
                  onChange={(e) => onConfigChange({ target_container: e.target.value })}
                  fullWidth
                  placeholder="e.g., reactor_tube, collection_plate"
                />

                <TextField
                  size="small"
                  label="Volume (mL)"
                  type="number"
                  value={config.volume_ml || 0.5}
                  onChange={(e) => onConfigChange({ volume_ml: Number(e.target.value) })}
                  inputProps={{ min: 0.001, max: 50, step: 0.001 }}
                />

                <TextField
                  size="small"
                  label="Transfer Speed (μL/s)"
                  type="number"
                  value={config.speed_ul_per_s || 300}
                  onChange={(e) => onConfigChange({ speed_ul_per_s: Number(e.target.value) })}
                  inputProps={{ min: 10, max: 1000 }}
                />

                <FormControl size="small">
                  <InputLabel>Pipette Type</InputLabel>
                  <Select
                    value={config.pipette_type || 'single'}
                    onChange={(e) => onConfigChange({ pipette_type: e.target.value })}
                  >
                    <MenuItem value="single">Single Channel</MenuItem>
                    <MenuItem value="multi">Multi Channel</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.mix_after || true}
                      onChange={(e) => onConfigChange({ mix_after: e.target.checked })}
                    />
                  }
                  label="Mix After Transfer"
                />
              </>
            )}

            {componentType === 'START_REACTION' && (
              <>
                <TextField
                  size="small"
                  label="Device ID"
                  value={config.device_id || 'photoreactor_1'}
                  onChange={(e) => onConfigChange({ device_id: e.target.value })}
                  fullWidth
                  placeholder="e.g., photoreactor_1, heater_2"
                />

                <TextField
                  size="small"
                  label="Reaction Mode"
                  value={config.mode || 'UV-A 365nm'}
                  onChange={(e) => onConfigChange({ mode: e.target.value })}
                  fullWidth
                  placeholder="e.g., UV-A 365nm, heating_80C"
                />

                <TextField
                  size="small"
                  label="Duration (seconds)"
                  type="number"
                  value={config.duration_s || 300}
                  onChange={(e) => onConfigChange({ duration_s: Number(e.target.value) })}
                  inputProps={{ min: 1, max: 86400 }}
                />

                <TextField
                  size="small"
                  label="Intensity (%)"
                  type="number"
                  value={config.intensity_pct || 80}
                  onChange={(e) => onConfigChange({ intensity_pct: Number(e.target.value) })}
                  inputProps={{ min: 1, max: 100 }}
                />
              </>
            )}

            {componentType === 'TRIGGER_MEASUREMENT' && (
              <>
                <TextField
                  size="small"
                  label="Device ID"
                  value={config.device_id || 'cytation5'}
                  onChange={(e) => onConfigChange({ device_id: e.target.value })}
                  fullWidth
                  placeholder="e.g., cytation5, spectrometer_1"
                />

                <FormControl size="small">
                  <InputLabel>Measurement Type</InputLabel>
                  <Select
                    value={config.measurement_type || 'OD600'}
                    onChange={(e) => onConfigChange({ measurement_type: e.target.value })}
                  >
                    <MenuItem value="OD600">OD600</MenuItem>
                    <MenuItem value="fluorescence">Fluorescence</MenuItem>
                    <MenuItem value="absorbance">Absorbance</MenuItem>
                    <MenuItem value="luminescence">Luminescence</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="Wavelength (nm)"
                  type="number"
                  value={config.wavelength_nm || 600}
                  onChange={(e) => onConfigChange({ wavelength_nm: Number(e.target.value) })}
                  inputProps={{ min: 200, max: 1000 }}
                />

                <TextField
                  size="small"
                  label="Integration Time (ms)"
                  type="number"
                  value={config.integration_time_ms || 500}
                  onChange={(e) => onConfigChange({ integration_time_ms: Number(e.target.value) })}
                  inputProps={{ min: 10, max: 10000 }}
                />

                <FormControl size="small">
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={config.export_format || 'csv'}
                    onChange={(e) => onConfigChange({ export_format: e.target.value })}
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="xlsx">Excel</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="Save To"
                  value={config.save_to || 'results/exp001_cytation.csv'}
                  onChange={(e) => onConfigChange({ save_to: e.target.value })}
                  fullWidth
                  placeholder="File path or DB destination"
                />
              </>
            )}

            {componentType === 'PAUSE_DELAY' && (
              <>
                <TextField
                  size="small"
                  label="Duration (seconds)"
                  type="number"
                  value={config.duration_s || 300}
                  onChange={(e) => onConfigChange({ duration_s: Number(e.target.value) })}
                  inputProps={{ min: 1, max: 86400 }}
                />

                <TextField
                  size="small"
                  label="Reason"
                  value={config.reason || 'Allow reaction to settle'}
                  onChange={(e) => onConfigChange({ reason: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Reason for pause (shown in UI/log)"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.skippable || true}
                      onChange={(e) => onConfigChange({ skippable: e.target.checked })}
                    />
                  }
                  label="User Can Skip Manually"
                />
              </>
            )}

            {componentType === 'DEVICE_SELECTOR' && (
              <>
                <TextField
                  size="small"
                  label="Device ID"
                  value={config.device_id || 'photoreactor_1'}
                  onChange={(e) => onConfigChange({ device_id: e.target.value })}
                  fullWidth
                  placeholder="e.g., photoreactor_1, pump_A"
                />

                <FormControl size="small">
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    value={config.device_type || 'photoreactor'}
                    onChange={(e) => onConfigChange({ device_type: e.target.value })}
                  >
                    <MenuItem value="photoreactor">Photoreactor</MenuItem>
                    <MenuItem value="pump">Pump</MenuItem>
                    <MenuItem value="heater">Heater</MenuItem>
                    <MenuItem value="mixer">Mixer</MenuItem>
                    <MenuItem value="cytation">Cytation Reader</MenuItem>
                    <MenuItem value="robot">Robot Arm</MenuItem>
                    <MenuItem value="spectrometer">Spectrometer</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            {componentType === 'BOOLEAN_INPUT' && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.default || false}
                      onChange={(e) => onConfigChange({ default: e.target.checked })}
                    />
                  }
                  label="Default Value"
                />
              </>
            )}

            {componentType === 'ENUM_SELECTOR' && (
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
                  placeholder="Option 1, Option 2, Option 3"
                />

                <FormControl size="small">
                  <InputLabel>Default Selection</InputLabel>
                  <Select
                    value={config.default || ''}
                    onChange={(e) => onConfigChange({ default: e.target.value })}
                  >
                    {(config.options || ['Option 1']).map((option: string) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {componentType === 'REPEAT_CONTROL' && (
              <>
                <TextField
                  size="small"
                  label="Repeat Times"
                  type="number"
                  value={config.repeat_times || 10}
                  onChange={(e) => onConfigChange({ repeat_times: Number(e.target.value) })}
                  inputProps={{ min: 1, max: 1000 }}
                />

                <TextField
                  size="small"
                  label="Delay Between (seconds)"
                  type="number"
                  value={config.delay_between || 2}
                  onChange={(e) => onConfigChange({ delay_between: Number(e.target.value) })}
                  inputProps={{ min: 0, max: 3600, step: 0.1 }}
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
      case 'POSITION_INPUT':
      case 'SPEED_INPUT':
      case 'PRESSURE_INPUT':
      case 'FLOW_RATE_INPUT':
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

      case 'MOVEMENT_CONTROL':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>

            {/* Movement Type Selection */}
            <FormControl size="small" fullWidth>
              <Select
                defaultValue={config.moveType || 'absolute'}
                sx={{ height: '36px' }}
              >
                <MenuItem value="absolute">Absolute Position</MenuItem>
                <MenuItem value="relative">Relative Movement</MenuItem>
                <MenuItem value="home">Return to Home</MenuItem>
                <MenuItem value="point_to_point">Point to Point</MenuItem>
              </Select>
            </FormControl>

            {/* Position Display */}
            {config.moveType === 'point_to_point' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Start: ({config.startX || 0}, {config.startY || 0}, {config.startZ || 0}) mm
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  End: ({config.targetX || 0}, {config.targetY || 0}, {config.targetZ || 0}) mm
                </Typography>
              </Box>
            )}

            {config.moveType === 'absolute' && (
              <Typography variant="caption" color="text.secondary">
                Target: ({config.targetX || 0}, {config.targetY || 0}, {config.targetZ || 0}) mm
              </Typography>
            )}

            {config.moveType === 'relative' && (
              <Typography variant="caption" color="text.secondary">
                Delta: (Δ{config.deltaX || 0}, Δ{config.deltaY || 0}, Δ{config.deltaZ || 0}) mm
              </Typography>
            )}

            {/* Speed and Safety Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Speed: {config.speed || 100} mm/s
              </Typography>
              {config.safetyCheck && (
                <Chip label="Safety ON" size="small" color="success" variant="outlined" />
              )}
            </Box>

            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      case 'SAFETY_TOGGLE':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                defaultChecked={config.defaultValue || false}
                size="small"
                color={config.safetyLevel === 'critical' ? 'error' : config.safetyLevel === 'warning' ? 'warning' : 'primary'}
              />
              <Chip
                label={config.safetyLevel || 'normal'}
                size="small"
                color={config.safetyLevel === 'critical' ? 'error' : config.safetyLevel === 'warning' ? 'warning' : 'default'}
              />
            </Box>
            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      case 'LIQUID_TRANSFER':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>

            {/* Transfer Route Display */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={config.sourceContainer || 'Source'}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography variant="body2">→</Typography>
              <Chip
                label={config.targetContainer || 'Target'}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>

            {/* Volume and Pipette Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {config.volume || 1} {config.volumeUnit || 'mL'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {config.pipetteType || 'P1000'}
              </Typography>
            </Box>

            {/* Additional Settings */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={config.transferSpeed || 'normal'}
                size="small"
                variant="outlined"
              />
              {config.mixAfter && (
                <Chip
                  label={`Mix ${config.mixCycles || 3}x`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>

            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      case 'DEVICE_SELECTOR':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={config.device_id || 'photoreactor_1'}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                ({config.device_type || 'photoreactor'})
              </Typography>
            </Box>
            {config.tooltip && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {config.tooltip}
              </Typography>
            )}
          </Box>
        );

      case 'BOOLEAN_INPUT':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked={config.default || false} size="small" />}
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

      case 'ENUM_SELECTOR':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                defaultValue={config.default || ''}
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

      case 'REPEAT_CONTROL':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {config.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${config.repeat_times || 10}x`}
                size="small"
                color="secondary"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                {config.delay_between || 2}s delay
              </Typography>
            </Box>
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
