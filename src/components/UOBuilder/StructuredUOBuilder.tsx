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

  // 加载示例UO（类似截图2的Compound Preparation）
  const loadExampleUO = () => {
    // 设置基本信息
    actions.setName('Compound Preparation');
    actions.setDescription('Prepare compounds by mixing metal salts, ligands, and buffers');
    actions.setCategory('reaction');

    // 设置示例参数插槽
    const exampleSlots = [
      {
        id: '1',
        slotNumber: 1,
        component: COMPONENT_LIBRARY.find(c => c.type === 'MATERIAL_SELECT'),
        config: {
          label: 'Metal Salt Type',
          options: ['Cu', 'Fe', 'Zn', 'Ni'],
          defaultValue: 'Cu',
          tooltip: 'Select the metal salt type to use',
          required: true
        }
      },
      {
        id: '2',
        slotNumber: 2,
        component: COMPONENT_LIBRARY.find(c => c.type === 'VOLUME_INPUT'),
        config: {
          label: 'Metal Salt Volume',
          min: 0,
          max: 100,
          defaultValue: 1,
          unit: 'mL',
          tooltip: 'Volume of metal salt solution',
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
        component: COMPONENT_LIBRARY.find(c => c.type === 'MATERIAL_SELECT'),
        config: {
          label: 'Ligand Type',
          options: ['EDTA', 'DTPA', 'EGTA', 'NTA'],
          defaultValue: 'EDTA',
          tooltip: 'Select the ligand to use',
          required: true
        }
      },
      {
        id: '5',
        slotNumber: 5,
        component: COMPONENT_LIBRARY.find(c => c.type === 'VOLUME_INPUT'),
        config: {
          label: 'Ligand Volume',
          min: 0,
          max: 100,
          defaultValue: 1,
          unit: 'mL',
          tooltip: 'Volume of ligand solution',
          required: true
        }
      },
      {
        id: '6',
        slotNumber: 6,
        component: COMPONENT_LIBRARY.find(c => c.type === 'CONCENTRATION_INPUT'),
        config: {
          label: 'Ligand Concentration',
          min: 0,
          max: 1000,
          defaultValue: 10,
          unit: 'mM',
          tooltip: 'Concentration of ligand solution',
          required: true
        }
      },
      {
        id: '7',
        slotNumber: 7,
        component: COMPONENT_LIBRARY.find(c => c.type === 'BUFFER_SELECT'),
        config: {
          label: 'Buffer Type',
          options: ['Buffer1', 'Buffer2', 'PBS', 'HEPES', 'Tris'],
          defaultValue: 'Buffer1',
          tooltip: 'Select the buffer to use',
          required: true
        }
      },
      {
        id: '8',
        slotNumber: 8,
        component: COMPONENT_LIBRARY.find(c => c.type === 'VOLUME_INPUT'),
        config: {
          label: 'Buffer Volume',
          min: 0,
          max: 100,
          defaultValue: 5,
          unit: 'mL',
          tooltip: 'Volume of buffer',
          required: true
        }
      },
      {
        id: '9',
        slotNumber: 9,
        component: COMPONENT_LIBRARY.find(c => c.type === 'TIME_INPUT'),
        config: {
          label: 'Mixing Time',
          min: 0,
          max: 3600,
          defaultValue: 30,
          unit: 's',
          tooltip: 'Time to mix the solution',
          required: true
        }
      },
      {
        id: '10',
        slotNumber: 10,
        component: COMPONENT_LIBRARY.find(c => c.type === 'CONTAINER_SELECT'),
        config: {
          label: 'Output Destination',
          options: ['Mixing Container', 'Storage Vial', 'Reaction Tube', 'Collection Plate'],
          defaultValue: 'Mixing Container',
          tooltip: 'Destination for the mixed solution',
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
      .map(slot => ({
        id: slot.id,
        name: slot.config.label || `Parameter ${slot.slotNumber}`,
        type: getParameterTypeFromComponent(slot.component!.type),
        required: slot.config.required || false,
        defaultValue: slot.config.defaultValue,
        unit: slot.config.unit || getDefaultUnit(slot.component!.type),
        description: slot.config.tooltip || slot.component!.description,
        validation: {
          min: slot.config.min,
          max: slot.config.max,
          step: slot.config.step,
          options: slot.config.options,
          maxLength: slot.config.maxLength
        }
      }));

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
