import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { ValidationResult } from '../services/workflowValidator';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  validationResult: ValidationResult;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  onClose,
  validationResult
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}>
        Validation Failed
      </DialogTitle>
      <DialogContent>
        {validationResult.errors.map((error, index) => (
          <Box key={index} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="error" gutterBottom>
              {error.stage.toUpperCase()} Stage Error:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {error.message}
            </Typography>
            
            {error.suggestion && (
              <Box sx={{ mt: 1, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  Suggestion:
                </Typography>
                <Typography variant="body2">
                  {error.suggestion}
                </Typography>
                
                {error.alternatives && error.alternatives.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      Alternatives:
                    </Typography>
                    <ul style={{ margin: '4px 0' }}>
                      {error.alternatives.map((alt, i) => (
                        <li key={i}>
                          <Typography variant="body2">{alt}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
                
                {error.explanation && (
                  <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                    {error.explanation}
                  </Typography>
                )}
              </Box>
            )}

            {error.details && (
              <Box sx={{ mt: 1, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  Details:
                </Typography>
                <Typography variant="body2">
                  {typeof error.details === 'string' 
                    ? error.details 
                    : JSON.stringify(error.details, null, 2)}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 