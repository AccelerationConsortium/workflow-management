/**
 * UO Builder Header Component - Basic Info Section
 */

import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import {
  Category as CategoryIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import { BuilderValidation } from './types';

interface UOBuilderHeaderProps {
  name: string;
  description: string;
  category: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryClick: () => void;
  validation: BuilderValidation;
}

export const UOBuilderHeader: React.FC<UOBuilderHeaderProps> = ({
  name,
  description,
  category,
  onNameChange,
  onDescriptionChange,
  onCategoryClick,
  validation
}) => {
  // Get field-specific errors
  const getFieldError = (fieldName: string) => {
    return validation.errors.find(error => error.field === fieldName);
  };

  const nameError = getFieldError('name');
  const descriptionError = getFieldError('description');
  const categoryError = getFieldError('category');

  return (
    <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
      <Typography variant="h6" gutterBottom>
        Unit Operation Details
      </Typography>
      
      <Box display="flex" flexDirection="column" gap={2}>
        {/* UO Name */}
        <TextField
          label="UO Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter unit operation name..."
          fullWidth
          required
          error={!!nameError}
          helperText={nameError?.message}
          InputProps={{
            endAdornment: nameError && <ErrorIcon color="error" fontSize="small" />
          }}
        />

        {/* UO Description */}
        <TextField
          label="Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe what this unit operation does..."
          multiline
          rows={2}
          fullWidth
          required
          error={!!descriptionError}
          helperText={descriptionError?.message}
        />

        {/* Category Selection */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Category *
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {category ? (
              <Chip
                label={category}
                onClick={onCategoryClick}
                onDelete={onCategoryClick}
                color="primary"
                variant="outlined"
                icon={<CategoryIcon />}
              />
            ) : (
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={onCategoryClick}
                color={categoryError ? "error" : "primary"}
              >
                Select Category
              </Button>
            )}
          </Box>
          {categoryError && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {categoryError.message}
            </Typography>
          )}
        </Box>

        {/* Validation Summary */}
        {validation.errors.length > 0 && (
          <Alert severity="error" size="small">
            <Typography variant="body2">
              Please fix {validation.errors.length} error(s) before proceeding:
            </Typography>
            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
              {validation.errors.slice(0, 3).map((error, index) => (
                <li key={index}>
                  <Typography variant="caption">
                    {error.componentId ? `Component: ${error.message}` : error.message}
                  </Typography>
                </li>
              ))}
              {validation.errors.length > 3 && (
                <li>
                  <Typography variant="caption">
                    ... and {validation.errors.length - 3} more
                  </Typography>
                </li>
              )}
            </ul>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert severity="warning" size="small">
            <Typography variant="body2">
              {validation.warnings.length} warning(s):
            </Typography>
            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
              {validation.warnings.slice(0, 2).map((warning, index) => (
                <li key={index}>
                  <Typography variant="caption">
                    {warning.message}
                  </Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}
      </Box>
    </Box>
  );
};
