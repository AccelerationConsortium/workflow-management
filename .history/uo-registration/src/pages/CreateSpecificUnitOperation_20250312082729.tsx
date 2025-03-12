import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  Snackbar,
  Card,
  CardHeader,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  Slider,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { unitOperationsApi } from '../services/api';
import { 
  GenericUnitOperation, 
  UnitOperationType, 
  OperationParameter 
} from '../types/UnitOperation';

// 模拟实验室数据，实际应用中应该从API获取
const MOCK_LABORATORIES = [
  { id: 'lab001', name: 'Laboratory A' },
  { id: 'lab002', name: 'Laboratory B' },
  { id: 'lab003', name: 'Laboratory C' },
];

interface FormErrors {
  name?: string;
  description?: string;
  laboratoryId?: string;
  [key: string]: string | undefined;
}

const CreateSpecificUnitOperation: React.FC = () => {
  const { genericId } = useParams<{ genericId: string }>();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [genericUO, setGenericUO] = useState<GenericUnitOperation | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'Active',
    location: '',
    capacity: '',
    operationTemperature: '',
    operationPressure: '',
    maintenanceSchedule: '',
    safetyProcedures: '',
    type: UnitOperationType.SPECIFIC,
    baseGenericUnitOperationId: genericId || '',
    laboratoryId: '',
    customParameters: [] as OperationParameter[]
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // 获取通用UO详情
  useEffect(() => {
    const fetchGenericUO = async () => {
      if (!genericId) {
        navigate('/unit-operations/generic');
        return;
      }
      
      try {
        setLoading(true);
        const response = await unitOperationsApi.getById(genericId);
        
        if (response.type !== UnitOperationType.GENERIC) {
          console.error('Provided ID is not for a generic unit operation');
          navigate('/unit-operations/generic');
          return;
        }
        
        setGenericUO(response as GenericUnitOperation);
        
        // 预填表单，复制默认参数
        setFormData({
          ...formData,
          name: `${response.name} - Custom`,
          description: response.description,
          category: response.category,
          capacity: response.capacity,
          operationTemperature: response.operationTemperature,
          operationPressure: response.operationPressure,
          customParameters: JSON.parse(JSON.stringify(response.defaultParameters))
        });
      } catch (error) {
        console.error('Error fetching generic unit operation:', error);
        navigate('/unit-operations/generic');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGenericUO();
  }, [genericId, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // 清除错误
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: undefined
        });
      }
    }
  };
  
  // 更新参数值
  const handleParameterChange = (paramId: string, value: any) => {
    const updatedParams = formData.customParameters.map(param => {
      if (param.id === paramId) {
        return { ...param, defaultValue: value };
      }
      return param;
    });
    
    setFormData({
      ...formData,
      customParameters: updatedParams
    });
  };
  
  const validateBasicInfo = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.laboratoryId) {
      newErrors.laboratoryId = 'Laboratory is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (activeStep === 0) {
      // 验证基本信息
      if (!validateBasicInfo()) {
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBasicInfo()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      await unitOperationsApi.create(formData);
      setShowSuccessMessage(true);
      
      // 成功后跳转
      setTimeout(() => {
        navigate('/unit-operations/specific');
      }, 1500);
    } catch (error) {
      console.error('Error creating specific unit operation:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // 渲染参数编辑器
  const renderParameterEditor = (param: OperationParameter) => {
    switch (param.dataType) {
      case 'NUMBER':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>{param.name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {param.description}
            </Typography>
            
            {param.min !== undefined && param.max !== undefined ? (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Slider
                    value={param.defaultValue as number || param.min}
                    min={param.min}
                    max={param.max}
                    onChange={(_, value) => handleParameterChange(param.id, value)}
                    valueLabelDisplay="auto"
                    aria-labelledby={`slider-${param.id}`}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    value={param.defaultValue || ''}
                    onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
                    inputProps={{
                      step: ((param.max - param.min) / 10),
                      min: param.min,
                      max: param.max,
                      type: 'number',
                      'aria-labelledby': `slider-${param.id}`,
                    }}
                    size="small"
                    sx={{ width: 80 }}
                  />
                  {param.unit && (
                    <Typography variant="body2" display="inline" sx={{ ml: 1 }}>
                      {param.unit}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            ) : (
              <TextField
                fullWidth
                value={param.defaultValue || ''}
                onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
                type="number"
                size="small"
                InputProps={{
                  endAdornment: param.unit ? param.unit : undefined
                }}
              />
            )}
          </Box>
        );
        
      case 'STRING':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>{param.name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {param.description}
            </Typography>
            <TextField
              fullWidth
              value={param.defaultValue || ''}
              onChange={(e) => handleParameterChange(param.id, e.target.value)}
              size="small"
            />
          </Box>
        );
        
      case 'BOOLEAN':
        return (
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(param.defaultValue)}
                  onChange={(e) => handleParameterChange(param.id, e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography>{param.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {param.description}
                  </Typography>
                </Box>
              }
            />
          </Box>
        );
        
      case 'ENUM':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>{param.name}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {param.description}
            </Typography>
            {param.options && param.options.length > 0 && (
              <RadioGroup
                value={param.defaultValue || param.options[0]}
                onChange={(e) => handleParameterChange(param.id, e.target.value)}
              >
                {param.options.map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <Box>
        <Typography>Loading generic unit operation data...</Typography>
      </Box>
    );
  }
  
  if (!genericUO) {
    return (
      <Box>
        <Typography color="error">
          Could not load the generic unit operation. Please go back and try again.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/unit-operations/generic')}
          sx={{ mt: 2 }}
        >
          Back to Generic UOs
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Snackbar 
        open={showSuccessMessage} 
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Specific unit operation created successfully!
        </Alert>
      </Snackbar>
      
      {/* Header with back button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/unit-operations/generic')}
        >
          Back to Generic Unit Operations
        </Button>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        Create Specific Unit Operation
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Based on generic template: <strong>{genericUO.name}</strong>
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Basic Information</StepLabel>
        </Step>
        <Step>
          <StepLabel>Customize Parameters</StepLabel>
        </Step>
        <Step>
          <StepLabel>Review & Create</StepLabel>
        </Step>
      </Stepper>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {activeStep === 0 && (
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                required
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={Boolean(errors.laboratoryId)}>
                <InputLabel id="laboratory-label">Laboratory</InputLabel>
                <Select
                  labelId="laboratory-label"
                  name="laboratoryId"
                  value={formData.laboratoryId}
                  label="Laboratory"
                  onChange={handleChange}
                >
                  {MOCK_LABORATORIES.map((lab) => (
                    <MenuItem key={lab.id} value={lab.id}>
                      {lab.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.laboratoryId && <FormHelperText>{errors.laboratoryId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  {['Active', 'Inactive', 'Pending'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Building B, Room 204"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={4}
                error={Boolean(errors.description)}
                helperText={errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            {/* Technical Specifications */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Technical Specifications</Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="capacity"
                label="Capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g. 500 L/h"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="operationTemperature"
                label="Operating Temperature"
                value={formData.operationTemperature}
                onChange={handleChange}
                placeholder="e.g. 80-120°C"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="operationPressure"
                label="Operating Pressure"
                value={formData.operationPressure}
                onChange={handleChange}
                placeholder="e.g. 1-2 bar"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            {/* Maintenance & Safety */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Maintenance & Safety</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="maintenanceSchedule"
                label="Maintenance Schedule"
                value={formData.maintenanceSchedule}
                onChange={handleChange}
                placeholder="e.g. Quarterly"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="safetyProcedures"
                label="Safety Procedures"
                value={formData.safetyProcedures}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="List required safety procedures..."
              />
            </Grid>
          </Grid>
        )}
        
        {activeStep === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              Customize Operation Parameters
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Adjust the parameters of this specific unit operation according to your laboratory's requirements.
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            {formData.customParameters.length === 0 ? (
              <Typography variant="body1">
                No parameters available for customization.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {formData.customParameters.map((param) => (
                  <Grid item xs={12} md={6} key={param.id}>
                    <Card variant="outlined">
                      <CardContent>
                        {renderParameterEditor(param)}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
        
        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Review Specific Unit Operation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please review the information before creating the specific unit operation.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardHeader title="Basic Information" sx={{ backgroundColor: '#f5f5f5' }} />
                  <CardContent>
                    <List>
                      <ListItem divider>
                        <ListItemText primary="Name" secondary={formData.name} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Laboratory" secondary={
                          MOCK_LABORATORIES.find(lab => lab.id === formData.laboratoryId)?.name || formData.laboratoryId
                        } />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Status" secondary={formData.status} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Description" secondary={formData.description} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardHeader title="Technical Specifications" sx={{ backgroundColor: '#f5f5f5' }} />
                  <CardContent>
                    <List>
                      <ListItem divider>
                        <ListItemText primary="Location" secondary={formData.location || 'Not specified'} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Capacity" secondary={formData.capacity || 'Not specified'} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Operation Temperature" secondary={formData.operationTemperature || 'Not specified'} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Operation Pressure" secondary={formData.operationPressure || 'Not specified'} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Maintenance Schedule" secondary={formData.maintenanceSchedule || 'Not specified'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Safety Procedures" secondary={formData.safetyProcedures || 'Not specified'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Customized Parameters" sx={{ backgroundColor: '#f5f5f5' }} />
                  <CardContent>
                    {formData.customParameters.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No custom parameters defined.
                      </Typography>
                    ) : (
                      <List>
                        {formData.customParameters.map((param) => (
                          <ListItem key={param.id} divider>
                            <ListItemText 
                              primary={param.name} 
                              secondary={
                                <>
                                  <Typography variant="body2" component="span">
                                    {param.description}
                                  </Typography>
                                  <br />
                                  <Typography variant="body2" component="span" color="primary">
                                    Value: {
                                      param.dataType === 'BOOLEAN' 
                                        ? (param.defaultValue ? 'Yes' : 'No')
                                        : `${param.defaultValue || 'Not set'}${param.unit ? ` ${param.unit}` : ''}`
                                    }
                                  </Typography>
                                </>
                              } 
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  This specific unit operation is based on the generic template: <strong>{genericUO.name}</strong>
                </Alert>
              </Grid>
            </Grid>
          </>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/unit-operations/generic') : handleBack}
            startIcon={<ArrowBackIcon />}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          {activeStep === 2 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
              disabled={isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Specific Unit Operation'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateSpecificUnitOperation; 
