/**
 * Component Renderer - Renders individual components on the canvas
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Popover,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import { UOComponent, ComponentType, ValidationError } from '../../types/UOBuilder';
import { ComponentPreview } from './ComponentPreview';

interface ComponentRendererProps {
  component: UOComponent;
  isSelected: boolean;
  errors: ValidationError[];
  onSelect: () => void;
  onUpdate: (updates: Partial<UOComponent>) => void;
  onDragStart: (event: React.DragEvent) => void;
  onMove: (deltaX: number, deltaY: number) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  errors,
  onSelect,
  onUpdate,
  onDragStart,
  onMove
}) => {
  const [editAnchor, setEditAnchor] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  const hasErrors = errors.length > 0;

  // Handle edit popover
  const handleEditClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setEditAnchor(event.currentTarget);
  };

  const handleEditClose = () => {
    setEditAnchor(null);
  };

  // Handle drag start
  const handleDragStart = (event: React.DragEvent) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    onDragStart(event);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      onMove(deltaX, deltaY);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  // Update component property
  const updateProperty = (property: string, value: any) => {
    onUpdate({ [property]: value });
  };

  return (
    <>
      <Paper
        ref={componentRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        onClick={onSelect}
        sx={{
          position: 'absolute',
          left: component.position.x,
          top: component.position.y,
          minWidth: 200,
          cursor: isDragging ? 'grabbing' : 'grab',
          border: isSelected ? '2px solid #2196f3' : hasErrors ? '2px solid #f44336' : '1px solid #e0e0e0',
          borderRadius: 1,
          backgroundColor: 'white',
          boxShadow: isSelected ? 3 : 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2
          }
        }}
      >
        {/* Component Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            backgroundColor: hasErrors ? 'error.light' : isSelected ? 'primary.light' : 'grey.100',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <DragIcon fontSize="small" color="action" />
            <Typography variant="caption" fontWeight={500}>
              {component.type.replace('_', ' ').toUpperCase()}
            </Typography>
            {hasErrors && (
              <Tooltip title={`${errors.length} error(s)`}>
                <ErrorIcon fontSize="small" color="error" />
              </Tooltip>
            )}
          </Box>
          <Box>
            <IconButton size="small" onClick={handleEditClick}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Component Preview */}
        <Box sx={{ p: 1 }}>
          <ComponentPreview component={component} />
        </Box>

        {/* Error Messages */}
        {hasErrors && (
          <Box sx={{ p: 1, pt: 0 }}>
            {errors.map((error, index) => (
              <Alert key={index} severity="error" size="small" sx={{ mt: 0.5 }}>
                <Typography variant="caption">
                  {error.message}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}
      </Paper>

      {/* Edit Popover */}
      <Popover
        open={Boolean(editAnchor)}
        anchorEl={editAnchor}
        onClose={handleEditClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Edit Component
          </Typography>

          {/* Common Properties */}
          <TextField
            label="Label"
            value={component.label}
            onChange={(e) => updateProperty('label', e.target.value)}
            fullWidth
            margin="dense"
            size="small"
          />

          <TextField
            label="Description"
            value={component.description || ''}
            onChange={(e) => updateProperty('description', e.target.value)}
            fullWidth
            margin="dense"
            size="small"
            multiline
            rows={2}
          />

          <FormControlLabel
            control={
              <Switch
                checked={component.required}
                onChange={(e) => updateProperty('required', e.target.checked)}
              />
            }
            label="Required"
            sx={{ mt: 1 }}
          />

          {/* Type-specific Properties */}
          <ComponentSpecificEditor
            component={component}
            onUpdate={updateProperty}
          />
        </Box>
      </Popover>
    </>
  );
};

// Component-specific property editor
interface ComponentSpecificEditorProps {
  component: UOComponent;
  onUpdate: (property: string, value: any) => void;
}

const ComponentSpecificEditor: React.FC<ComponentSpecificEditorProps> = ({
  component,
  onUpdate
}) => {
  switch (component.type) {
    case ComponentType.SELECT:
      const selectComp = component as any;
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Options (one per line)
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            size="small"
            value={selectComp.options?.join('\n') || ''}
            onChange={(e) => onUpdate('options', e.target.value.split('\n').filter(Boolean))}
          />
          <FormControlLabel
            control={
              <Switch
                checked={selectComp.multiple || false}
                onChange={(e) => onUpdate('multiple', e.target.checked)}
              />
            }
            label="Multiple Selection"
            sx={{ mt: 1 }}
          />
        </Box>
      );

    case ComponentType.NUMBER_INPUT:
      const numberComp = component as any;
      return (
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <TextField
            label="Min"
            type="number"
            value={numberComp.min || ''}
            onChange={(e) => onUpdate('min', parseFloat(e.target.value))}
            size="small"
          />
          <TextField
            label="Max"
            type="number"
            value={numberComp.max || ''}
            onChange={(e) => onUpdate('max', parseFloat(e.target.value))}
            size="small"
          />
          <TextField
            label="Unit"
            value={numberComp.unit || ''}
            onChange={(e) => onUpdate('unit', e.target.value)}
            size="small"
          />
        </Box>
      );

    case ComponentType.UNIT_LABEL:
      const unitComp = component as any;
      return (
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Unit"
            value={unitComp.unit || ''}
            onChange={(e) => onUpdate('unit', e.target.value)}
            fullWidth
            size="small"
          />
        </Box>
      );

    default:
      return null;
  }
};
