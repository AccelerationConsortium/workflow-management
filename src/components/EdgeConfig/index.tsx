import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import './styles.css';

export type ExecutionMode = 'sequential' | 'parallel' | 'conditional';

interface EdgeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EdgeConfig) => void;
}

export interface EdgeConfig {
  mode: ExecutionMode;
  condition?: string;
  delay?: number;
  retries?: number;
}

export function EdgeConfig({ isOpen, onClose, onSave }: EdgeConfigProps) {
  const [mode, setMode] = useState<ExecutionMode>('sequential');
  const [condition, setCondition] = useState('');
  const [delay, setDelay] = useState(0);
  const [retries, setRetries] = useState(0);

  const handleSave = () => {
    onSave({
      mode,
      ...(mode === 'conditional' && { condition }),
      ...(mode === 'sequential' && { delay, retries }),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Configure Connection</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Execution Mode</InputLabel>
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value as ExecutionMode)}
            label="Execution Mode"
          >
            <MenuItem value="sequential">Sequential</MenuItem>
            <MenuItem value="parallel">Parallel</MenuItem>
            <MenuItem value="conditional">Conditional</MenuItem>
          </Select>
        </FormControl>

        {mode === 'conditional' && (
          <TextField
            fullWidth
            margin="normal"
            label="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            helperText="Enter a condition expression"
          />
        )}

        {mode === 'sequential' && (
          <>
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Delay (ms)"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
            />
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Retries"
              value={retries}
              onChange={(e) => setRetries(Number(e.target.value))}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
} 