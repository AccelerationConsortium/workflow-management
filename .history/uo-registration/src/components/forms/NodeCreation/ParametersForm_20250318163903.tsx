import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  TextField,
  Grid,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ParameterDirection } from '../../../types/UnitOperation';

export const ParametersForm: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parameters',
  });

  const addParameter = () => {
    append({
      id: `param_${Date.now()}`,
      name: '',
      description: '',
      unit: '',
      direction: ParameterDirection.INPUT,
      required: false,
      parameterType: 'string',
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Parameters
          <IconButton size="small" onClick={addParameter}>
            <AddIcon />
          </IconButton>
        </Typography>
      </Grid>

      {fields.map((field, index) => (
        <Grid container spacing={2} key={field.id} sx={{ ml: 1, mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Name"
              {...register(`parameters.${index}.name`)}
              error={!!errors.parameters?.[index]?.name}
              helperText={errors.parameters?.[index]?.name?.message as string}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                {...register(`parameters.${index}.parameterType`)}
                label="Type"
              >
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
                <MenuItem value="enum">Enum</MenuItem>
                <MenuItem value="date">Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Unit"
              {...register(`parameters.${index}.unit`)}
            />
          </Grid>

          <Grid item xs={1}>
            <IconButton onClick={() => remove(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              {...register(`parameters.${index}.description`)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Direction</InputLabel>
              <Select
                {...register(`parameters.${index}.direction`)}
                label="Direction"
              >
                <MenuItem value={ParameterDirection.INPUT}>Input</MenuItem>
                <MenuItem value={ParameterDirection.OUTPUT}>Output</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  {...register(`parameters.${index}.required`)}
                />
              }
              label="Required"
            />
          </Grid>

          {/* Conditional fields based on parameter type */}
          {watch(`parameters.${index}.parameterType`) === 'number' && (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Value"
                  {...register(`parameters.${index}.minValue`)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Value"
                  {...register(`parameters.${index}.maxValue`)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Default Value"
                  {...register(`parameters.${index}.defaultValue`)}
                />
              </Grid>
            </>
          )}

          {watch(`parameters.${index}.parameterType`) === 'enum' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Options (comma separated)"
                {...register(`parameters.${index}.options`)}
                helperText="Enter options separated by commas"
              />
            </Grid>
          )}
        </Grid>
      ))}
    </Grid>
  );
}; 
