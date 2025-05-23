/**
 * Custom hook for drag and drop functionality in UO Builder
 */

import { useState, useCallback, useRef } from 'react';
import { ComponentLibraryItem, UOComponent, DragDropContext } from '../types';

export function useDragDrop() {
  const [dragContext, setDragContext] = useState<DragDropContext>({
    draggedItem: null,
    dropZone: null,
    isDragging: false
  });

  const dragImageRef = useRef<HTMLElement | null>(null);

  // Start dragging a component from the library
  const startDrag = useCallback((item: ComponentLibraryItem, event: React.DragEvent) => {
    setDragContext({
      draggedItem: item,
      dropZone: null,
      isDragging: true
    });

    // Set drag data
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'copy';

    // Create custom drag image if needed
    if (dragImageRef.current) {
      event.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    }
  }, []);

  // Handle drag over canvas
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    
    setDragContext(prev => ({
      ...prev,
      dropZone: 'builder'
    }));
  }, []);

  // Handle drag over trash
  const handleDragOverTrash = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    setDragContext(prev => ({
      ...prev,
      dropZone: 'trash'
    }));
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only update if we're actually leaving the drop zone
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragContext(prev => ({
        ...prev,
        dropZone: null
      }));
    }
  }, []);

  // Handle drop on canvas
  const handleDrop = useCallback((
    event: React.DragEvent,
    onAddComponent: (component: Omit<UOComponent, 'id'>) => void
  ) => {
    event.preventDefault();
    
    try {
      const itemData = event.dataTransfer.getData('application/json');
      const item: ComponentLibraryItem = JSON.parse(itemData);
      
      // Calculate drop position relative to canvas
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Create new component from library item
      const newComponent: Omit<UOComponent, 'id'> = {
        ...item.defaultProps,
        position: { x, y }
      } as Omit<UOComponent, 'id'>;
      
      onAddComponent(newComponent);
      
    } catch (error) {
      console.error('Error handling drop:', error);
    } finally {
      setDragContext({
        draggedItem: null,
        dropZone: null,
        isDragging: false
      });
    }
  }, []);

  // Handle drop on trash (for deleting components)
  const handleDropTrash = useCallback((
    event: React.DragEvent,
    onRemoveComponent: (componentId: string) => void
  ) => {
    event.preventDefault();
    
    try {
      // Check if we're dragging an existing component
      const componentId = event.dataTransfer.getData('component-id');
      if (componentId) {
        onRemoveComponent(componentId);
      }
    } catch (error) {
      console.error('Error handling trash drop:', error);
    } finally {
      setDragContext({
        draggedItem: null,
        dropZone: null,
        isDragging: false
      });
    }
  }, []);

  // Start dragging an existing component (for moving or deleting)
  const startComponentDrag = useCallback((
    component: UOComponent,
    event: React.DragEvent
  ) => {
    setDragContext({
      draggedItem: null,
      dropZone: null,
      isDragging: true
    });

    // Set component ID for potential deletion
    event.dataTransfer.setData('component-id', component.id);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle component move within canvas
  const handleComponentMove = useCallback((
    componentId: string,
    newPosition: { x: number; y: number },
    onMoveComponent: (id: string, position: { x: number; y: number }) => void
  ) => {
    onMoveComponent(componentId, newPosition);
  }, []);

  // End drag operation
  const endDrag = useCallback(() => {
    setDragContext({
      draggedItem: null,
      dropZone: null,
      isDragging: false
    });
  }, []);

  // Check if a specific drop zone is active
  const isDropZoneActive = useCallback((zone: 'builder' | 'trash') => {
    return dragContext.isDragging && dragContext.dropZone === zone;
  }, [dragContext]);

  // Get drag preview component
  const getDragPreview = useCallback(() => {
    if (!dragContext.draggedItem) return null;
    
    return {
      type: dragContext.draggedItem.type,
      label: dragContext.draggedItem.label,
      icon: dragContext.draggedItem.icon
    };
  }, [dragContext.draggedItem]);

  return {
    dragContext,
    dragImageRef,
    startDrag,
    startComponentDrag,
    handleDragOver,
    handleDragOverTrash,
    handleDragLeave,
    handleDrop,
    handleDropTrash,
    handleComponentMove,
    endDrag,
    isDropZoneActive,
    getDragPreview
  };
}
