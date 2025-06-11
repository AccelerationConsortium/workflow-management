/**
 * Builder Canvas - Main drag & drop area for building UO interface
 */

import React, { useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  GridOn as GridIcon,
  GridOff as GridOffIcon
} from '@mui/icons-material';

import { UOComponent, BuilderValidation } from '../../types/UOBuilder';
import { CANVAS_SETTINGS, BUILDER_GRID } from '../../config/componentLibrary';
import { ComponentRenderer } from './ComponentRenderer';

interface BuilderCanvasProps {
  components: UOComponent[];
  dragDrop: any;
  onAddComponent: (component: Omit<UOComponent, 'id'>) => void;
  onUpdateComponent: (id: string, updates: Partial<UOComponent>) => void;
  onRemoveComponent: (id: string) => void;
  onMoveComponent: (id: string, position: { x: number; y: number }) => void;
  validation: BuilderValidation;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  components,
  dragDrop,
  onAddComponent,
  onUpdateComponent,
  onRemoveComponent,
  onMoveComponent,
  validation
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(BUILDER_GRID.showGrid);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Handle drop on canvas
  const handleDrop = (event: React.DragEvent) => {
    dragDrop.handleDrop(event, onAddComponent);
  };

  // Handle component selection
  const handleComponentSelect = (componentId: string) => {
    setSelectedComponentId(componentId === selectedComponentId ? null : componentId);
  };

  // Handle component drag within canvas
  const handleComponentDragStart = (component: UOComponent, event: React.DragEvent) => {
    dragDrop.startComponentDrag(component, event);
    setSelectedComponentId(component.id);
  };

  // Handle component move
  const handleComponentMove = (componentId: string, deltaX: number, deltaY: number) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const newPosition = {
        x: Math.max(0, component.position.x + deltaX),
        y: Math.max(0, component.position.y + deltaY)
      };
      
      // Snap to grid if enabled
      if (BUILDER_GRID.snapToGrid) {
        newPosition.x = Math.round(newPosition.x / BUILDER_GRID.size) * BUILDER_GRID.size;
        newPosition.y = Math.round(newPosition.y / BUILDER_GRID.size) * BUILDER_GRID.size;
      }
      
      onMoveComponent(componentId, newPosition);
    }
  };

  // Get component validation errors
  const getComponentErrors = (componentId: string) => {
    return validation.errors.filter(error => error.componentId === componentId);
  };

  // Grid pattern for background
  const gridPattern = showGrid ? `
    radial-gradient(circle, ${BUILDER_GRID.gridColor} 1px, transparent 1px)
  ` : 'none';

  const gridSize = BUILDER_GRID.size;

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Canvas */}
      <Paper
        ref={canvasRef}
        onDragOver={dragDrop.handleDragOver}
        onDragLeave={dragDrop.handleDragLeave}
        onDrop={handleDrop}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          backgroundColor: CANVAS_SETTINGS.backgroundColor,
          backgroundImage: gridPattern,
          backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : 'none',
          backgroundPosition: '0 0',
          cursor: dragDrop.dragContext.isDragging ? 'copy' : 'default',
          border: dragDrop.isDropZoneActive('builder') ? '2px dashed #2196f3' : 'none',
          transition: 'border 0.2s ease'
        }}
      >
        {/* Empty state */}
        {components.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Drag components here to build your UO interface
            </Typography>
            <Typography variant="body2">
              Start by dragging parameter components from the right panel
            </Typography>
          </Box>
        )}

        {/* Render components */}
        {components.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            isSelected={selectedComponentId === component.id}
            errors={getComponentErrors(component.id)}
            onSelect={() => handleComponentSelect(component.id)}
            onUpdate={(updates) => onUpdateComponent(component.id, updates)}
            onDragStart={(event) => handleComponentDragStart(component, event)}
            onMove={(deltaX, deltaY) => handleComponentMove(component.id, deltaX, deltaY)}
          />
        ))}
      </Paper>

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {/* Grid Toggle */}
        <Tooltip title={showGrid ? 'Hide Grid' : 'Show Grid'}>
          <Fab
            size="small"
            color="default"
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? <GridOffIcon /> : <GridIcon />}
          </Fab>
        </Tooltip>

        {/* Trash Zone */}
        <Tooltip title="Drop components here to delete">
          <Fab
            size="medium"
            color="error"
            onDragOver={dragDrop.handleDragOverTrash}
            onDragLeave={dragDrop.handleDragLeave}
            onDrop={(event) => dragDrop.handleDropTrash(event, onRemoveComponent)}
            sx={{
              opacity: dragDrop.isDropZoneActive('trash') ? 1 : 0.7,
              transform: dragDrop.isDropZoneActive('trash') ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s ease',
              border: dragDrop.isDropZoneActive('trash') ? '2px dashed #f44336' : 'none'
            }}
          >
            <DeleteIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* Component Count */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          px: 1,
          py: 0.5
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {components.length} component{components.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Box>
  );
};
