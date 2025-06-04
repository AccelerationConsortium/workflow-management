/**
 * Main UO Builder Modal Component with Drag & Drop Interface
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
  Snackbar,
  TextField,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';

// Now enabling full functionality step by step
import { useUOBuilder } from './hooks/useUOBuilder';
import { useDragDrop } from './hooks/useDragDrop';
// import { UOBuilderHeader } from './UOBuilderHeader';
import { ComponentLibrary } from './ComponentLibrary';
import { StructuredUOBuilder } from './StructuredUOBuilder';
import { customUOService } from '../../services/customUOService';
// import { BuilderCanvas } from './BuilderCanvas';
// import { UOPreview } from './UOPreview';
// import { CategorySelector } from './CategorySelector';
import { UORegistrationResult } from './types';

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
  // Now using full builder functionality
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

      // Register with the custom UO service
      const result = customUOService.registerUO(schema);
      setRegistrationResult(result);

      if (result.success) {
        // Notify parent component
        await onRegister(schema);

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
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '66.67vw', // 2/3 of viewport width
            height: '90vh',   // 90% of viewport height for better visibility
            maxWidth: '66.67vw',
            maxHeight: '90vh',
            margin: 0,
            marginLeft: '2vw', // Position towards left side
            marginTop: '5vh',  // Center vertically with some top margin
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
            justifyContent: 'flex-start'
          }
        }}
      >
        {/* Use the new Structured UO Builder */}
        <StructuredUOBuilder
          onClose={onClose}
          onSave={async (uoData) => {
            setIsRegistering(true);
            try {
              // Register with the custom UO service (this updates the sidebar)
              const result = customUOService.registerUO(uoData.schema);
              setRegistrationResult(result);

              if (result.success) {
                // Also notify parent component
                await onRegister(uoData.schema);

                // Close modal after successful registration
                setTimeout(() => {
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
          }}
        />
      </Dialog>

      {/* Category Selector Dialog - Temporarily simplified */}
      <Dialog
        open={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Category</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1} sx={{ pt: 1 }}>
            {['Separation', 'Chemical Reaction', 'Mixing', 'Heat Transfer', 'Measurement', 'Material Transport', 'Custom'].map((category) => (
              <Button
                key={category}
                variant={state.category === category ? "contained" : "outlined"}
                onClick={() => handleCategorySelect(category)}
                fullWidth
              >
                {category}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCategorySelector(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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
