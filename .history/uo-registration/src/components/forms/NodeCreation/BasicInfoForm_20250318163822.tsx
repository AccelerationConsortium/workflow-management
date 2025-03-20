import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Grid,
} from '@mui/material';
import { UnitOperationCategory, UnitOperationSubCategory } from '../../../types/UnitOperation';

export const BasicInfoForm: React.FC = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const category = watch('category');

  const getSubCategories = (category: UnitOperationCategory) => {
    const subCategories = Object.entries(UnitOperationSubCategory).filter(([_, value]) => {
      switch (category) {
        case UnitOperationCategory.REACTION:
          return ['BATCH_REACTOR', 'CONTINUOUS_REACTOR', 'CATALYTIC_REACTOR', 'FERMENTATION'].includes(value);
        case UnitOperationCategory.SEPARATION:
          return ['DISTILLATION', 'EXTRACTION', 'ABSORPTION', 'FILTRATION', 'CRYSTALLIZATION'].includes(value);
        // ... Add other categories
        default:
          return false;
      }
    });
    return subCategories;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Node Name"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message as string}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Display Label"
          {...register('label')}
          error={!!errors.label}
          helperText={errors.label?.message as string}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          {...register('description')}
          error={!!errors.description}
          helperText={errors.description?.message as string}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.category}>
          <InputLabel>Category</InputLabel>
          <Select
            {...register('category')}
            label="Category"
          >
            {Object.entries(UnitOperationCategory).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {key.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.category?.message as string}</FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.subCategory}>
          <InputLabel>Sub Category</InputLabel>
          <Select
            {...register('subCategory')}
            label="Sub Category"
            disabled={!category}
          >
            {category && getSubCategories(category).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {key.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.subCategory?.message as string}</FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
}; 
