import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  TextField,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export const SpecificationsForm: React.FC = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const otherSpecs = watch('specs.otherSpecs') || {};

  const addOtherSpec = () => {
    const newKey = `spec_${Object.keys(otherSpecs).length + 1}`;
    setValue(`specs.otherSpecs.${newKey}`, '');
  };

  const removeOtherSpec = (key: string) => {
    const newSpecs = { ...otherSpecs };
    delete newSpecs[key];
    setValue('specs.otherSpecs', newSpecs);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Model"
          {...register('specs.model')}
          error={!!errors.specs?.model}
          helperText={errors.specs?.model?.message as string}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Manufacturer"
          {...register('specs.manufacturer')}
          error={!!errors.specs?.manufacturer}
          helperText={errors.specs?.manufacturer?.message as string}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Type"
          {...register('specs.type')}
          error={!!errors.specs?.type}
          helperText={errors.specs?.type?.message as string}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Range"
          {...register('specs.range')}
          error={!!errors.specs?.range}
          helperText={errors.specs?.range?.message as string}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Precision"
          {...register('specs.precision')}
          error={!!errors.specs?.precision}
          helperText={errors.specs?.precision?.message as string}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Ports"
          {...register('specs.ports')}
          error={!!errors.specs?.ports}
          helperText={errors.specs?.ports?.message as string}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Additional Specifications
          <IconButton size="small" onClick={addOtherSpec}>
            <AddIcon />
          </IconButton>
        </Typography>
        
        {Object.entries(otherSpecs).map(([key, _]) => (
          <Grid container spacing={2} key={key} alignItems="center">
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Name"
                value={key}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Value"
                {...register(`specs.otherSpecs.${key}`)}
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton onClick={() => removeOtherSpec(key)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}; 
