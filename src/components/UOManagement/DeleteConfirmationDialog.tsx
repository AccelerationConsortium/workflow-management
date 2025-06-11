import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { CustomUONode } from '../../services/customUOService';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  uoToDelete: string | string[] | null;
  customUOs: CustomUONode[];
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  uoToDelete,
  customUOs
}) => {
  if (!uoToDelete) return null;

  const isMultipleDelete = Array.isArray(uoToDelete);
  const uosToDelete = isMultipleDelete 
    ? customUOs.filter(uo => (uoToDelete as string[]).includes(uo.type))
    : customUOs.filter(uo => uo.type === uoToDelete);

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6">
            {isMultipleDelete ? 'Delete Multiple UOs' : 'Delete Unit Operation'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {isMultipleDelete 
              ? `You are about to delete ${uosToDelete.length} custom Unit Operation(s). This action cannot be undone.`
              : 'You are about to delete this custom Unit Operation. This action cannot be undone.'
            }
          </Typography>
        </Alert>

        {/* Show UO details */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {isMultipleDelete ? 'UOs to be deleted:' : 'UO to be deleted:'}
          </Typography>
          
          <List dense>
            {uosToDelete.map((uo, index) => (
              <React.Fragment key={uo.type}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight="medium">
                          {uo.label}
                        </Typography>
                        <Chip
                          label={uo.category}
                          size="small"
                          sx={{ 
                            backgroundColor: uo.color || '#8F7FE8', 
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {uo.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {uo.schema.parameters.length} parameter(s) • Created: {new Date(uo.schema.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < uosToDelete.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Warning about potential impacts */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Before deleting:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            • Make sure these UOs are not being used in any active workflows
            <br />
            • Consider exporting your UOs as backup before deletion
            <br />
            • Any workflows using these UOs may become invalid
          </Typography>
        </Alert>

        {/* Future enhancement: Show usage information */}
        {/* 
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Usage Information:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This UO is currently used in 0 workflow(s)
          </Typography>
        </Box>
        */}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          startIcon={<DeleteIcon />}
        >
          {isMultipleDelete ? `Delete ${uosToDelete.length} UOs` : 'Delete UO'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
