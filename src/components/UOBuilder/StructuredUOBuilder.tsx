/**
 * Structured UO Builder - Slot-based Parameter Module System
 * 结构化UO生成器 - 基于插槽的参数模块系统
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { ComponentLibrary } from './ComponentLibrary';
import { ParameterSlot } from './components/ParameterSlot';
import { useUOBuilder } from './hooks/useUOBuilder';
import { useDragDrop } from './hooks/useDragDrop';
import { ComponentLibraryItem } from './types';
import { DEFAULT_UO_CATEGORIES, COMPONENT_LIBRARY } from './config/componentLibrary';

interface StructuredUOBuilderProps {
  onClose: () => void;
  onSave?: (uoData: any) => void;
}

export const StructuredUOBuilder: React.FC<StructuredUOBuilderProps> = ({
  onClose,
  onSave
}) => {
  const { state, actions, validation } = useUOBuilder();
  const dragDrop = useDragDrop();

  // 参数插槽状态
  const [parameterSlots, setParameterSlots] = useState<Array<{
    id: string;
    slotNumber: number;
    component: ComponentLibraryItem | null;
    config: any;
  }>>([
    { id: '1', slotNumber: 1, component: null, config: {} }
  ]);

  const [previewMode, setPreviewMode] = useState(false);

  // 添加新的参数插槽
  const addParameterSlot = () => {
    const newSlot = {
      id: String(parameterSlots.length + 1),
      slotNumber: parameterSlots.length + 1,
      component: null,
      config: {}
    };
    setParameterSlots([...parameterSlots, newSlot]);
  };

  // 删除参数插槽
  const removeParameterSlot = (slotId: string) => {
    if (parameterSlots.length > 1) {
      setParameterSlots(parameterSlots.filter(slot => slot.id !== slotId));
    }
  };

  // 处理组件拖拽到插槽
  const handleSlotDrop = (slotId: string, component: ComponentLibraryItem) => {
    setParameterSlots(slots =>
      slots.map(slot =>
        slot.id === slotId
          ? { ...slot, component, config: component.defaultProps }
          : slot
      )
    );
  };

  // 更新插槽配置
  const updateSlotConfig = (slotId: string, config: any) => {
    setParameterSlots(slots =>
      slots.map(slot =>
        slot.id === slotId
          ? { ...slot, config: { ...slot.config, ...config } }
          : slot
      )
    );
  };

  // 加载示例UO（包含工作流组件的自动化实验）
  const loadExampleUO = () => {
    // 设置基本信息
    actions.setName('Automated Lab Workflow');
    actions.setDescription('Complete automated workflow with device control, liquid handling, and measurements');
    actions.setCategory('reaction');

    // 设置示例参数插槽（包含新的工作流组件）
    const exampleSlots = [
      {
        id: '1',
        slotNumber: 1,
        component: COMPONENT_LIBRARY.find(c => c.type === 'DEVICE_INITIALIZATION'),
        config: {
          label: 'Initialize Cytation Reader',
          deviceId: 'cytation5',
          deviceType: 'cytation',
          initMode: 'soft',
          timeoutS: 30,
          retryCount: 2,
          tooltip: 'Initialize the Cytation5 reader before starting',
          required: true
        }
      },
      {
        id: '2',
        slotNumber: 2,
        component: COMPONENT_LIBRARY.find(c => c.type === 'USER_CONFIRMATION'),
        config: {
          label: 'Confirm Sample Placement',
          promptText: 'Please confirm that all sample vials are properly placed in the rack',
          expectedResponse: 'yes',
          timeoutS: 120,
          abortOnTimeout: true,
          tooltip: 'User confirmation for sample setup',
          required: true
        }
      },
      {
        id: '3',
        slotNumber: 3,
        component: COMPONENT_LIBRARY.find(c => c.type === 'LIQUID_TRANSFER'),
        config: {
          label: 'Transfer Reagent A',
          sourceContainer: 'reagent_A_stock',
          targetContainer: 'reaction_tube_1',
          volumeMl: 0.5,
          speedUlPerS: 300,
          pipetteType: 'single',
          mixAfter: true,
          tooltip: 'Transfer reagent A to reaction tube',
          required: true
        }
      },
      {
        id: '3',
        slotNumber: 3,
        component: COMPONENT_LIBRARY.find(c => c.type === 'CONCENTRATION_INPUT'),
        config: {
          label: 'Metal Salt Concentration',
          min: 0,
          max: 1000,
          defaultValue: 10,
          unit: 'mM',
          tooltip: 'Concentration of metal salt solution',
          required: true
        }
      },
      {
        id: '4',
        slotNumber: 4,
        component: COMPONENT_LIBRARY.find(c => c.type === 'START_REACTION'),
        config: {
          label: 'Start Photoreaction',
          deviceId: 'photoreactor_1',
          mode: 'UV-A 365nm',
          durationS: 300,
          intensityPct: 80,
          tooltip: 'Start the photochemical reaction',
          required: true
        }
      },
      {
        id: '5',
        slotNumber: 5,
        component: COMPONENT_LIBRARY.find(c => c.type === 'PAUSE_DELAY'),
        config: {
          label: 'Reaction Incubation',
          durationS: 300,
          reason: 'Allow reaction to proceed',
          skippable: false,
          tooltip: 'Wait for reaction completion',
          required: true
        }
      },
      {
        id: '6',
        slotNumber: 6,
        component: COMPONENT_LIBRARY.find(c => c.type === 'TRIGGER_MEASUREMENT'),
        config: {
          label: 'Measure OD600',
          deviceId: 'cytation5',
          measurementType: 'OD600',
          wavelengthNm: 600,
          integrationTimeMs: 500,
          exportFormat: 'csv',
          saveTo: 'results/automated_workflow.csv',
          tooltip: 'Measure optical density at 600nm',
          required: true
        }
      }
    ].filter(slot => slot.component); // 过滤掉找不到的组件

    setParameterSlots(exampleSlots);
  };

  // 生成UO Schema
  const generateUOSchema = () => {
    const parameters = parameterSlots
      .filter(slot => slot.component)
      .map(slot => {
        const componentType = slot.component!.type;

        // 为工作流模块生成详细的参数结构
        if (['DEVICE_INITIALIZATION', 'USER_CONFIRMATION', 'LIQUID_TRANSFER', 'START_REACTION', 'TRIGGER_MEASUREMENT', 'PAUSE_DELAY'].includes(componentType)) {
          return generateWorkflowModuleParameters(slot);
        }

        // 基础参数类型的处理
        return generateBasicModuleParameters(slot);
      });

    return {
      id: `custom_uo_${Date.now()}`,
      name: state.name,
      description: state.description,
      category: state.category,
      parameters,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
  };

  // 为基础模块生成详细的参数结构
  const generateBasicModuleParameters = (slot: any) => {
    const componentType = slot.component!.type;
    const config = slot.config;

    const baseParam = {
      id: slot.id,
      name: config.label || `Parameter ${slot.slotNumber}`,
      type: getParameterTypeFromComponent(componentType),
      required: config.required || false,
      defaultValue: config.defaultValue,
      description: config.tooltip || slot.component!.description,
      validation: {
        min: config.min,
        max: config.max,
        options: config.options
      }
    };

    // 根据模块类型添加特定的属性
    switch (componentType) {
      case 'VOLUME_INPUT':
      case 'CONCENTRATION_INPUT':
      case 'TIME_INPUT':
      case 'TEMPERATURE_INPUT':
        return {
          ...baseParam,
          unit: config.unit,
          unitOptions: config.unitOptions,
          step: config.step,
          subParameters: [
            { name: 'value', type: 'number', value: config.defaultValue, label: 'Value', unit: config.unit },
            { name: 'unit', type: 'enum', value: config.unit, label: 'Unit', options: config.unitOptions || [config.unit] },
            { name: 'min', type: 'number', value: config.min, label: 'Min Value' },
            { name: 'max', type: 'number', value: config.max, label: 'Max Value' }
          ]
        };

      case 'MATERIAL_SELECT':
      case 'CONTAINER_SELECT':
      case 'BUFFER_SELECT':
        return {
          ...baseParam,
          allowCustomInput: config.allowCustomInput,
          subParameters: [
            { name: 'selectedValue', type: 'enum', value: config.defaultValue, label: 'Selected Option', options: config.options },
            { name: 'allowCustomInput', type: 'boolean', value: config.allowCustomInput, label: 'Allow Custom Input' },
            { name: 'options', type: 'string', value: config.options?.join(', '), label: 'Available Options' }
          ]
        };

      case 'ENABLE_TOGGLE':
        return {
          ...baseParam,
          subParameters: [
            { name: 'enabled', type: 'boolean', value: config.defaultValue, label: 'Enabled' },
            { name: 'label', type: 'string', value: config.label, label: 'Toggle Label' }
          ]
        };

      case 'FILE_OPERATIONS':
        return {
          ...baseParam,
          allowImport: config.allowImport,
          allowExport: config.allowExport,
          fileTypes: config.fileTypes,
          subParameters: [
            { name: 'allowImport', type: 'boolean', value: config.allowImport, label: 'Allow Import' },
            { name: 'allowExport', type: 'boolean', value: config.allowExport, label: 'Allow Export' },
            { name: 'fileTypes', type: 'string', value: config.fileTypes?.join(', '), label: 'Supported File Types' }
          ]
        };

      case 'TEXT_NOTE':
        return {
          ...baseParam,
          placeholder: config.placeholder,
          maxLength: config.maxLength,
          rows: config.rows,
          subParameters: [
            { name: 'text', type: 'string', value: '', label: 'Note Text' },
            { name: 'placeholder', type: 'string', value: config.placeholder, label: 'Placeholder' },
            { name: 'maxLength', type: 'number', value: config.maxLength, label: 'Max Length' },
            { name: 'rows', type: 'number', value: config.rows, label: 'Rows' }
          ]
        };

      default:
        return baseParam;
    }
  };

  // 为工作流模块生成详细的参数结构
  const generateWorkflowModuleParameters = (slot: any) => {
    const componentType = slot.component!.type;
    const config = slot.config;

    const baseParam = {
      id: slot.id,
      name: config.label || `Parameter ${slot.slotNumber}`,
      type: 'workflow_module' as const,
      moduleType: componentType,
      required: config.required || false,
      description: config.tooltip || slot.component!.description,
      config: config
    };

    // 根据模块类型生成具体的子参数
    switch (componentType) {
      case 'DEVICE_INITIALIZATION':
        return {
          ...baseParam,
          subParameters: [
            { name: 'deviceId', type: 'string', value: config.deviceId, label: 'Device ID' },
            { name: 'deviceType', type: 'enum', value: config.deviceType, label: 'Device Type', options: ['photoreactor', 'cytation', 'robot', 'other'] },
            { name: 'initMode', type: 'enum', value: config.initMode, label: 'Init Mode', options: ['soft', 'hard'] },
            { name: 'timeoutS', type: 'number', value: config.timeoutS, label: 'Timeout (s)' },
            { name: 'retryCount', type: 'number', value: config.retryCount, label: 'Retry Count' }
          ]
        };

      case 'USER_CONFIRMATION':
        return {
          ...baseParam,
          subParameters: [
            { name: 'promptText', type: 'string', value: config.promptText, label: 'Prompt Text' },
            { name: 'expectedResponse', type: 'enum', value: config.expectedResponse, label: 'Expected Response', options: ['yes', 'ok', 'done'] },
            { name: 'timeoutS', type: 'number', value: config.timeoutS, label: 'Timeout (s)' },
            { name: 'abortOnTimeout', type: 'boolean', value: config.abortOnTimeout, label: 'Abort on Timeout' }
          ]
        };

      case 'LIQUID_TRANSFER':
        return {
          ...baseParam,
          subParameters: [
            { name: 'sourceContainer', type: 'string', value: config.sourceContainer, label: 'Source Container' },
            { name: 'targetContainer', type: 'string', value: config.targetContainer, label: 'Target Container' },
            { name: 'volumeMl', type: 'number', value: config.volumeMl, label: 'Volume (mL)' },
            { name: 'speedUlPerS', type: 'number', value: config.speedUlPerS, label: 'Speed (μL/s)' },
            { name: 'pipetteType', type: 'enum', value: config.pipetteType, label: 'Pipette Type', options: ['single', 'multi'] },
            { name: 'mixAfter', type: 'boolean', value: config.mixAfter, label: 'Mix After' }
          ]
        };

      case 'START_REACTION':
        return {
          ...baseParam,
          subParameters: [
            { name: 'deviceId', type: 'string', value: config.deviceId, label: 'Device ID' },
            { name: 'mode', type: 'string', value: config.mode, label: 'Reaction Mode' },
            { name: 'durationS', type: 'number', value: config.durationS, label: 'Duration (s)' },
            { name: 'intensityPct', type: 'number', value: config.intensityPct, label: 'Intensity (%)' }
          ]
        };

      case 'TRIGGER_MEASUREMENT':
        return {
          ...baseParam,
          subParameters: [
            { name: 'deviceId', type: 'string', value: config.deviceId, label: 'Device ID' },
            { name: 'measurementType', type: 'enum', value: config.measurementType, label: 'Measurement Type', options: ['OD600', 'fluorescence', 'absorbance', 'other'] },
            { name: 'wavelengthNm', type: 'number', value: config.wavelengthNm, label: 'Wavelength (nm)' },
            { name: 'integrationTimeMs', type: 'number', value: config.integrationTimeMs, label: 'Integration Time (ms)' },
            { name: 'exportFormat', type: 'enum', value: config.exportFormat, label: 'Export Format', options: ['csv', 'json'] },
            { name: 'saveTo', type: 'string', value: config.saveTo, label: 'Save To' }
          ]
        };

      case 'PAUSE_DELAY':
        return {
          ...baseParam,
          subParameters: [
            { name: 'durationS', type: 'number', value: config.durationS, label: 'Duration (s)' },
            { name: 'reason', type: 'string', value: config.reason, label: 'Reason' },
            { name: 'skippable', type: 'boolean', value: config.skippable, label: 'Skippable' }
          ]
        };

      default:
        return baseParam;
    }
  };

  // 保存并注册UO
  const handleSaveAndRegister = () => {
    const schema = generateUOSchema();

    const uoData = {
      name: state.name,
      description: state.description,
      category: state.category,
      parameters: parameterSlots
        .filter(slot => slot.component)
        .map(slot => ({
          id: slot.id,
          slotNumber: slot.slotNumber,
          componentType: slot.component!.type,
          label: slot.config.label || `Parameter ${slot.slotNumber}`,
          config: slot.config
        })),
      schema: schema
    };

    if (onSave) {
      onSave(uoData);
    }

    console.log('Generated UO:', uoData);
  };

  // 辅助函数：获取组件类型对应的默认单位
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
        return '';
    }
  };

  // 辅助函数：将组件类型转换为参数类型
  const getParameterTypeFromComponent = (componentType: string): 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'range' => {
    switch (componentType) {
      case 'VOLUME_INPUT':
      case 'CONCENTRATION_INPUT':
      case 'TIME_INPUT':
      case 'TEMPERATURE_INPUT':
      case 'POSITION_INPUT':
      case 'SPEED_INPUT':
      case 'PRESSURE_INPUT':
      case 'FLOW_RATE_INPUT':
        return 'number';
      case 'MATERIAL_SELECT':
      case 'CONTAINER_SELECT':
      case 'BUFFER_SELECT':
        return 'enum';
      case 'ENABLE_TOGGLE':
        return 'boolean';
      case 'TEXT_NOTE':
      case 'DEVICE_INITIALIZATION':
      case 'USER_CONFIRMATION':
      case 'LIQUID_TRANSFER':
      case 'START_REACTION':
      case 'TRIGGER_MEASUREMENT':
      case 'PAUSE_DELAY':
        return 'string';
      default:
        return 'string';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h1">
            Create & Register Unit Operation
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAndRegister}
              disabled={!validation.isValid}
            >
              Save & Register
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - UO Configuration */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {/* Basic Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Unit Operation Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="UO Name"
                value={state.name}
                onChange={(e) => actions.setName(e.target.value)}
                required
                error={!state.name && validation.errors.length > 0}
                helperText={!state.name ? "UO name is required" : ""}
              />

              <TextField
                fullWidth
                label="Description"
                value={state.description}
                onChange={(e) => actions.setDescription(e.target.value)}
                multiline
                rows={2}
                required
                error={!state.description && validation.errors.length > 0}
                helperText={!state.description ? "UO description is required" : ""}
              />

              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={state.category}
                  onChange={(e) => actions.setCategory(e.target.value)}
                  error={!state.category && validation.errors.length > 0}
                >
                  {DEFAULT_UO_CATEGORIES.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{category.icon}</span>
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {validation.errors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Please fill in all required fields before proceeding.
              </Alert>
            )}
          </Paper>

          {/* Parameter Slots */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Parameter Modules
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addParameterSlot}
                >
                  Add Parameter
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={loadExampleUO}
                >
                  Load Example
                </Button>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Drag components from the right panel into the slots below to build your UO interface
            </Typography>

            {/* Parameter Slots List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {parameterSlots.map((slot) => (
                <ParameterSlot
                  key={slot.id}
                  slot={slot}
                  onDrop={(component) => handleSlotDrop(slot.id, component)}
                  onConfigChange={(config) => updateSlotConfig(slot.id, config)}
                  onRemove={() => removeParameterSlot(slot.id)}
                  canRemove={parameterSlots.length > 1}
                  previewMode={previewMode}
                />
              ))}
            </Box>

            {parameterSlots.filter(slot => slot.component).length === 0 && (
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                  mt: 2
                }}
              >
                <Typography variant="body1">
                  Drag components here to build your UO interface
                </Typography>
                <Typography variant="body2">
                  Start by dragging parameter components from the right panel
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Right Panel - Component Library */}
        <Box sx={{ width: 350, borderLeft: '1px solid #e0e0e0' }}>
          <ComponentLibrary dragDrop={dragDrop} />
        </Box>
      </Box>
    </Box>
  );
};
