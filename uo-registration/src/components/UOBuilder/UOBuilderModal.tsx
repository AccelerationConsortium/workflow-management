/**
 * Main UO Builder Modal Component
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';

import { useUOBuilder } from '../../hooks/useUOBuilder';
import { useDragDrop } from '../../hooks/useDragDrop';
import { UOBuilderHeader } from './UOBuilderHeader';
import { ComponentLibrary } from './ComponentLibrary';
import { BuilderCanvas } from './BuilderCanvas';
import { UOPreview } from './UOPreview';
import { CategorySelector } from './CategorySelector';
import { UORegistrationResult } from '../../types/UOBuilder';

interface UOBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (schema: any) => Promise<UORegistrationResult>;
}

export const UOBuilderModal: React.FC<UOBuilderModalProps> = ({
  open,
  onClose,
  onRegister
}) => {
  const { state, actions, validation, generateSchema } = useUOBuilder();
  const dragDrop = useDragDrop();
  
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<UORegistrationResult | null>(null);

  // Handle save and register
  const handleSaveAndRegister = async () => {
    if (!validation.isValid) {
      return;
    }

    setIsRegistering(true);
    try {
      const schema = generateSchema();
      const result = await onRegister(schema);
      setRegistrationResult(result);
      
      if (result.success) {
        // Reset builder after successful registration
        setTimeout(() => {
          actions.resetBuilder();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setRegistrationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle preview toggle
  const handlePreviewToggle = () => {
    actions.setPreviewMode(!state.previewMode);
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the builder? All changes will be lost.')) {
      actions.resetBuilder();
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    actions.setCategory(categoryId);
    setShowCategorySelector(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">
              Create & Register Unit Operation
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                startIcon={<PreviewIcon />}
                onClick={handlePreviewToggle}
                variant={state.previewMode ? "contained" : "outlined"}
                size="small"
              >
                {state.previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                startIcon={<ResetIcon />}
                onClick={handleReset}
                variant="outlined"
                size="small"
                color="warning"
              >
                Reset
              </Button>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
          <Box display="flex" height="100%">
            {/* Left Side - UO Editor */}
            <Box flex={1} display="flex" flexDirection="column" sx={{ borderRight: 1, borderColor: 'divider' }}>
              {/* Header with basic info */}
              <UOBuilderHeader
                name={state.name}
                description={state.description}
                category={state.category}
                onNameChange={actions.setName}
                onDescriptionChange={actions.setDescription}
                onCategoryClick={() => setShowCategorySelector(true)}
                validation={validation}
              />

              <Divider />

              {/* Main canvas area */}
              <Box flex={1} position="relative">
                {state.previewMode ? (
                  <UOPreview
                    name={state.name}
                    description={state.description}
                    components={state.components}
                  />
                ) : (
                  <BuilderCanvas
                    components={state.components}
                    dragDrop={dragDrop}
                    onAddComponent={actions.addComponent}
                    onUpdateComponent={actions.updateComponent}
                    onRemoveComponent={actions.removeComponent}
                    onMoveComponent={actions.moveComponent}
                    validation={validation}
                  />
                )}
              </Box>
            </Box>

            {/* Right Side - Component Library */}
            {!state.previewMode && (
              <Box width={300} sx={{ borderLeft: 1, borderColor: 'divider' }}>
                <ComponentLibrary
                  dragDrop={dragDrop}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box>
              {validation.errors.length > 0 && (
                <Typography variant="body2" color="error">
                  {validation.errors.length} error(s) found
                </Typography>
              )}
            </Box>
            <Box display="flex" gap={1}>
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
              <Button
                onClick={handleSaveAndRegister}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={!validation.isValid || isRegistering}
                loading={isRegistering}
              >
                {isRegistering ? 'Registering...' : 'Save & Register'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Category Selector Dialog */}
      <CategorySelector
        open={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
        onSelect={handleCategorySelect}
        selectedCategory={state.category}
      />

      {/* Registration Result Snackbar */}
      <Snackbar
        open={!!registrationResult}
        autoHideDuration={6000}
        onClose={() => setRegistrationResult(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setRegistrationResult(null)}
          severity={registrationResult?.success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {registrationResult?.success
            ? `Unit Operation "${state.name}" registered successfully!`
            : `Registration failed: ${registrationResult?.error}`
          }
        </Alert>
      </Snackbar>
    </>
  );
};
