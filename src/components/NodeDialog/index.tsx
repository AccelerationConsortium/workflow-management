import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import './styles.css';

interface NodeDialogProps {
  open: boolean;
  node: {
    id: string;
    type: string;
    data: any;
  };
  onClose: () => void;
}

export const NodeDialog: React.FC<NodeDialogProps> = ({ open, node, onClose }) => {
  if (!node?.data) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="node-dialog"
    >
      <DialogTitle>
        <Typography variant="h6">{node.data.label}</Typography>
      </DialogTitle>
      <DialogContent>
        <div className="dialog-content">
          <Typography variant="body1" gutterBottom>
            {node.data.description}
          </Typography>
          {node.data.parameters?.length > 0 && (
            <div className="parameters-section">
              <Typography variant="h6" gutterBottom>Parameters</Typography>
              {node.data.parameters.map((param, index) => (
                <div key={index} className="parameter-item">
                  <span className="param-label">{param.label}:</span>
                  <span className="param-value">
                    {param.value || 'Not set'} {param.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 