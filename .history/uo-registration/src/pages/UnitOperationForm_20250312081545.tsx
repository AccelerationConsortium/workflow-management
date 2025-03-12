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
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';

// Type definitions for form data
interface FormData {
  name: string;
  description: string;
  category: string;
  status: string;
  location: string;
  capacity: string;
  operationTemperature: string;
  operationPressure: string;
  maintenanceSchedule: string;
  safetyProcedures: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  [key: string]: string | undefined;
}

const UnitOperationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    status: 'Active',
    location: '',
    capacity: '',
    operationTemperature: '',
    operationPressure: '',
    maintenanceSchedule: '',
    safetyProcedures: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // For edit mode, fetch existing data
  useEffect(() => {
    if (isEditMode) {
      // This would be an API call in a real implementation
      // Simulating data fetch for demo
      const mockData = {
        name: 'Distillation Column',
        description: 'A vertical column used to separate components of a mixture based on differences in volatilities.',
        category: 'Separation',
        status: 'Active',
        location: 'Building B, Room 204',
        capacity: '500 L/h',
        operationTemperature: '80-120°C',
        operationPressure: '1-2 bar',
        maintenanceSchedule: 'Quarterly',
        safetyProcedures: 'Ensure proper ventilation. Check pressure gauges before operation. Wear appropriate PPE.'
      };
      
      setFormData(mockData);
    }
  }, [isEditMode, id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear errors when field is changed
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: undefined
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessMessage(true);
      
      // Redirect after successful save
      setTimeout(() => {
        if (isEditMode) {
          navigate(`/unit-operations/${id}`);
        } else {
          navigate('/unit-operations');
        }
      }, 1500);
    }, 1000);
  };
  
  const categories = [
    'Separation',
    'Chemical Reaction',
    'Energy Transfer',
    'Fluid Flow',
    'Mixing',
    'Size Reduction',
    'Size Enlargement'
  ];
  
  const statuses = ['Active', 'Inactive', 'Pending'];
  
  return (
    <Box>
      <Snackbar 
        open={showSuccessMessage} 
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Unit operation {isEditMode ? 'updated' : 'created'} successfully!
        </Alert>
      </Snackbar>
      
      {/* Header with back button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(isEditMode ? `/unit-operations/${id}` : '/unit-operations')}
        >
          {isEditMode ? 'Back to Detail View' : 'Back to List'}
        </Button>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Unit Operation' : 'Create New Unit Operation'}
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
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
              <FormControl fullWidth required error={Boolean(errors.category)}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
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
                  {statuses.map((status) => (
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
            
            {/* Submit Buttons */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(isEditMode ? `/unit-operations/${id}` : '/unit-operations')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UnitOperationForm; 
