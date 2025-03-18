import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Divider,
  Autocomplete,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  UnitOperationType,
  UnitOperationCategory,
  UnitOperationSubCategory,
  Laboratory,
  ParameterDirection,
  UnitOperationStatus,
  UnitOperationFormData,
  UnitOperationParameter
} from '../../types/UnitOperation';

// 用于显示子类别的映射
const SUBCATEGORY_MAP: Record<UnitOperationCategory, UnitOperationSubCategory[]> = {
  [UnitOperationCategory.REACTION]: [
    UnitOperationSubCategory.BATCH_REACTOR,
    UnitOperationSubCategory.CONTINUOUS_REACTOR,
    UnitOperationSubCategory.CATALYTIC_REACTOR,
    UnitOperationSubCategory.FERMENTATION
  ],
  [UnitOperationCategory.SEPARATION]: [
    UnitOperationSubCategory.DISTILLATION,
    UnitOperationSubCategory.EXTRACTION,
    UnitOperationSubCategory.ABSORPTION,
    UnitOperationSubCategory.FILTRATION,
    UnitOperationSubCategory.CRYSTALLIZATION
  ],
  [UnitOperationCategory.HEAT_TRANSFER]: [
    UnitOperationSubCategory.HEAT_EXCHANGER,
    UnitOperationSubCategory.EVAPORATOR,
    UnitOperationSubCategory.CONDENSER
  ],
  [UnitOperationCategory.MASS_TRANSFER]: [
    UnitOperationSubCategory.ABSORPTION_COLUMN,
    UnitOperationSubCategory.ADSORPTION,
    UnitOperationSubCategory.MEMBRANE_SEPARATION
  ],
  [UnitOperationCategory.FLUID_FLOW]: [
    UnitOperationSubCategory.PUMPING,
    UnitOperationSubCategory.COMPRESSION,
    UnitOperationSubCategory.PIPING
  ],
  [UnitOperationCategory.OTHERS]: [
    UnitOperationSubCategory.MIXING,
    UnitOperationSubCategory.GRINDING,
    UnitOperationSubCategory.CUSTOM
  ]
};

// 获取类别的显示名称
const getCategoryDisplayName = (category: UnitOperationCategory): string => {
  switch (category) {
    case UnitOperationCategory.REACTION:
      return 'Reaction';
    case UnitOperationCategory.SEPARATION:
      return 'Separation';
    case UnitOperationCategory.HEAT_TRANSFER:
      return 'Heat Transfer';
    case UnitOperationCategory.MASS_TRANSFER:
      return 'Mass Transfer';
    case UnitOperationCategory.FLUID_FLOW:
      return 'Fluid Flow';
    case UnitOperationCategory.OTHERS:
      return 'Others';
    default:
      return category;
  }
};

// 获取子类别的显示名称
const getSubCategoryDisplayName = (subCategory: UnitOperationSubCategory): string => {
  // 将下划线换成空格，并将首字母大写
  return subCategory
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// 获取实验室的显示名称
const getLaboratoryDisplayName = (lab: Laboratory): string => {
  switch (lab) {
    case Laboratory.SDL1:
      return 'SDL 1';
    case Laboratory.SDL2:
      return 'SDL 2';
    case Laboratory.SDL3:
      return 'SDL 3';
    case Laboratory.SDL4:
      return 'SDL 4';
    case Laboratory.SDL5:
      return 'SDL 5';
    case Laboratory.SDL6:
      return 'SDL 6';
    default:
      return lab;
  }
};

// 表单验证架构
const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  subCategory: yup.string().required('Sub-category is required'),
  status: yup.string().required('Status is required'),
  applicableLabs: yup.array().min(1, 'At least one laboratory must be selected'),
  
  technicalSpecifications: yup.object().shape({
    capacity: yup.string().required('Capacity is required'),
    operatingTemperature: yup.string().required('Operating temperature is required'),
    operatingPressure: yup.string().required('Operating pressure is required')
  }),
  
  parameters: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Parameter name is required'),
      description: yup.string().required('Parameter description is required'),
      unit: yup.string(),
      direction: yup.string().required('Direction is required'),
      parameterType: yup.string().required('Parameter type is required'),
      required: yup.boolean()
    })
  ),
  
  workflowCompatibility: yup.object().shape({
    requiresFileUpload: yup.boolean()
  })
});

interface GenericUnitOperationFormProps {
  initialData?: Partial<UnitOperationFormData>;
  onSubmit: (data: UnitOperationFormData) => void;
  isEditing?: boolean;
}

const GenericUnitOperationForm: React.FC<GenericUnitOperationFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false
}) => {
  // 当前激活的标签页
  const [activeTab, setActiveTab] = useState(0);
  
  // 表单实例
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<UnitOperationFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      type: UnitOperationType.GENERIC,
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || UnitOperationCategory.OTHERS,
      subCategory: initialData?.subCategory || UnitOperationSubCategory.CUSTOM,
      status: initialData?.status || UnitOperationStatus.DRAFT,
      applicableLabs: initialData?.applicableLabs || [],
      
      technicalSpecifications: {
        capacity: initialData?.technicalSpecifications?.capacity || '',
        operatingTemperature: initialData?.technicalSpecifications?.operatingTemperature || '',
        operatingPressure: initialData?.technicalSpecifications?.operatingPressure || '',
        otherSpecifications: initialData?.technicalSpecifications?.otherSpecifications || {}
      },
      
      parameters: initialData?.parameters || [],
      
      parentUnitOperationId: initialData?.parentUnitOperationId || '',
      subUnitOperations: initialData?.subUnitOperations || [],
      
      workflowCompatibility: {
        applicableWorkflows: initialData?.workflowCompatibility?.applicableWorkflows || [],
        requiresFileUpload: initialData?.workflowCompatibility?.requiresFileUpload || false
      },
      
      safetyGuidelines: initialData?.safetyGuidelines || '',
      theoryBackground: initialData?.theoryBackground || '',
      operatingProcedure: initialData?.operatingProcedure || '',
      equipmentRequirements: initialData?.equipmentRequirements || [],
      maintenanceRequirements: initialData?.maintenanceRequirements || '',
      references: initialData?.references || []
    }
  });
  
  // 监听类别变化，以更新子类别选项
  const category = watch('category');
  useEffect(() => {
    if (category) {
      // 当类别变化时，设置默认的子类别
      const subCategories = SUBCATEGORY_MAP[category as UnitOperationCategory];
      if (subCategories && subCategories.length > 0) {
        setValue('subCategory', subCategories[0]);
      }
    }
  }, [category, setValue]);
  
  // 参数字段数组
  const { fields: parameterFields, append: appendParameter, remove: removeParameter } = useFieldArray({
    control,
    name: 'parameters'
  });
  
  // 添加新参数
  const handleAddParameter = (direction: ParameterDirection) => {
    appendParameter({
      id: `param_${Date.now()}`,
      name: '',
      description: '',
      unit: '',
      direction,
      required: true,
      parameterType: 'string',
      minValue: undefined,
      maxValue: undefined,
      defaultValue: undefined,
      options: []
    } as UnitOperationParameter);
  };
  
  // 处理标签页变化
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // 表单提交处理
  const handleFormSubmit = (data: UnitOperationFormData) => {
    // 确保类型字段为 GENERIC
    data.type = UnitOperationType.GENERIC;
    onSubmit(data);
  };
  
  // 渲染参数表单
  const renderParameterForm = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Parameters Configuration
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleAddParameter(ParameterDirection.INPUT)}
            >
              Add Input Parameter
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleAddParameter(ParameterDirection.OUTPUT)}
            >
              Add Output Parameter
            </Button>
          </Box>
        </Grid>

        {parameterFields.map((field, index) => (
          <Grid container spacing={2} key={field.id} sx={{ ml: 1, mb: 2, width: '100%' }}>
            <Grid item xs={12} md={3}>
              <Controller
                name={`parameters.${index}.name`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Name"
                    error={!!errors.parameters?.[index]?.name}
                    helperText={errors.parameters?.[index]?.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Controller
                name={`parameters.${index}.parameterType`}
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      <MenuItem value="string">String</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Boolean</MenuItem>
                      <MenuItem value="enum">Enum</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Controller
                name={`parameters.${index}.unit`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Unit"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Controller
                name={`parameters.${index}.direction`}
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Direction</InputLabel>
                    <Select {...field} label="Direction">
                      <MenuItem value={ParameterDirection.INPUT}>Input</MenuItem>
                      <MenuItem value={ParameterDirection.OUTPUT}>Output</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Controller
                name={`parameters.${index}.required`}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Required"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={1}>
              <IconButton onClick={() => removeParameter(index)}>
                <DeleteIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name={`parameters.${index}.description`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    error={!!errors.parameters?.[index]?.description}
                    helperText={errors.parameters?.[index]?.description?.message}
                  />
                )}
              />
            </Grid>

            {/* 根据参数类型显示额外字段 */}
            {watch(`parameters.${index}.parameterType`) === 'number' && (
              <>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`parameters.${index}.minValue`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Min Value"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`parameters.${index}.maxValue`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Max Value"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name={`parameters.${index}.defaultValue`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Default Value"
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {watch(`parameters.${index}.parameterType`) === 'enum' && (
              <Grid item xs={12}>
                <Controller
                  name={`parameters.${index}.options`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Options (comma separated)"
                      helperText="Enter options separated by commas"
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Basic Information" />
        <Tab label="Technical Specifications" />
        <Tab label="Parameters" />
        <Tab label="Inheritance & Composition" />
        <Tab label="Workflow Compatibility" />
        <Tab label="Documentation" />
      </Tabs>
      
      {/* 基本信息标签页 */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {Object.values(UnitOperationStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {Object.values(UnitOperationCategory).map((category) => (
                        <MenuItem key={category} value={category}>
                          {getCategoryDisplayName(category)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="subCategory"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.subCategory}>
                    <InputLabel>Sub-Category</InputLabel>
                    <Select {...field} label="Sub-Category">
                      {category && SUBCATEGORY_MAP[category as UnitOperationCategory]?.map((subCategory) => (
                        <MenuItem key={subCategory} value={subCategory}>
                          {getSubCategoryDisplayName(subCategory)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.subCategory && <FormHelperText>{errors.subCategory.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="applicableLabs"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.applicableLabs}>
                    <InputLabel id="labs-label">Applicable Laboratories</InputLabel>
                    <Select
                      {...field}
                      labelId="labs-label"
                      label="Applicable Laboratories"
                      multiple
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as Laboratory[]).map((value) => (
                            <Chip key={value} label={getLaboratoryDisplayName(value)} />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.values(Laboratory).map((lab) => (
                        <MenuItem key={lab} value={lab}>
                          {getLaboratoryDisplayName(lab)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.applicableLabs && <FormHelperText>{errors.applicableLabs.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* 技术规格标签页 */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Technical Specifications</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Controller
                name="technicalSpecifications.capacity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Capacity"
                    fullWidth
                    required
                    error={!!errors.technicalSpecifications?.capacity}
                    helperText={errors.technicalSpecifications?.capacity?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="technicalSpecifications.operatingTemperature"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Operating Temperature"
                    fullWidth
                    required
                    error={!!errors.technicalSpecifications?.operatingTemperature}
                    helperText={errors.technicalSpecifications?.operatingTemperature?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="technicalSpecifications.operatingPressure"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Operating Pressure"
                    fullWidth
                    required
                    error={!!errors.technicalSpecifications?.operatingPressure}
                    helperText={errors.technicalSpecifications?.operatingPressure?.message}
                  />
                )}
              />
            </Grid>
            
            {/* 自定义技术规格（可选项） */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Additional Technical Specifications
              </Typography>
              {/* 这里可以添加动态字段的逻辑 */}
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* 参数标签页 */}
      {activeTab === 2 && renderParameterForm()}
      
      {/* 继承和组合标签页 */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Inheritance & Composition</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="parentUnitOperationId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Parent Unit Operation (ID)"
                    fullWidth
                    helperText="Leave blank if this is not derived from another unit operation"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Sub Unit Operations (Components)
              </Typography>
              {/* 这里可以添加动态字段的逻辑 */}
              <Typography variant="body2" color="text.secondary">
                This feature will be implemented in a future update.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* 工作流兼容性标签页 */}
      {activeTab === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Workflow Compatibility</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="workflowCompatibility.applicableWorkflows"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Applicable Workflows"
                    fullWidth
                    helperText="Comma-separated list of workflow IDs"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="workflowCompatibility.requiresFileUpload"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Requires File Upload Support"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* 文档标签页 */}
      {activeTab === 5 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Documentation</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="safetyGuidelines"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Safety Guidelines"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="theoryBackground"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Theory Background"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="operatingProcedure"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Operating Procedure"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="maintenanceRequirements"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Maintenance Requirements"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="equipmentRequirements"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Equipment Requirements"
                    fullWidth
                    multiline
                    rows={3}
                    helperText="Enter equipment items separated by new lines"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="references"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="References"
                    fullWidth
                    multiline
                    rows={3}
                    helperText="Enter references separated by new lines"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* 表单操作按钮 */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
          disabled={activeTab === 0}
        >
          Previous
        </Button>
        
        <Box>
          {activeTab < 5 ? (
            <Button 
              variant="contained" 
              onClick={() => setActiveTab(Math.min(5, activeTab + 1))}
            >
              Next
            </Button>
          ) : (
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
            >
              {isEditing ? 'Update' : 'Create'} Unit Operation
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default GenericUnitOperationForm; 
