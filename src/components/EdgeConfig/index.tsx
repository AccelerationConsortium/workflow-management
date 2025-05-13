import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, IconButton, Divider, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import './styles.css';

export type ExecutionMode = 'sequential' | 'parallel' | 'conditional';
export type ConditionType = 'boolean' | 'switch';
export type ConditionSource = 'parameter' | 'result';

export interface ConditionCaseData {
  id: string;
  label: string;
  value: string;
}

interface EdgeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EdgeConfig) => void;
  initialConfig?: Partial<EdgeConfig>;
}

export interface EdgeConfig {
  mode: ExecutionMode;
  delay?: number;
  retries?: number;
  conditionType?: ConditionType;
  conditionSource?: ConditionSource;
  parameterName?: string;
  resultPath?: string;
  expression?: string;
  cases?: ConditionCaseData[];
}

export function EdgeConfig({ isOpen, onClose, onSave, initialConfig }: EdgeConfigProps) {
  const [mode, setMode] = useState<ExecutionMode>(initialConfig?.mode || 'sequential');
  const [delay, setDelay] = useState(initialConfig?.delay || 0);
  const [retries, setRetries] = useState(initialConfig?.retries || 0);
  const [conditionType, setConditionType] = useState<ConditionType>(initialConfig?.conditionType || 'boolean');
  const [conditionSource, setConditionSource] = useState<ConditionSource>(initialConfig?.conditionSource || 'parameter');
  const [parameterName, setParameterName] = useState(initialConfig?.parameterName || '');
  const [resultPath, setResultPath] = useState(initialConfig?.resultPath || '');
  const [expression, setExpression] = useState(initialConfig?.expression || '');
  const [cases, setCases] = useState<ConditionCaseData[]>(initialConfig?.cases || [{ id: 'default', label: '默认', value: 'default' }]);

  useEffect(() => {
    if (isOpen && initialConfig) {
      setMode(initialConfig.mode || 'sequential');
      setDelay(initialConfig.delay || 0);
      setRetries(initialConfig.retries || 0);
      setConditionType(initialConfig.conditionType || 'boolean');
      setConditionSource(initialConfig.conditionSource || 'parameter');
      setParameterName(initialConfig.parameterName || '');
      setResultPath(initialConfig.resultPath || '');
      setExpression(initialConfig.expression || '');
      setCases(initialConfig.cases || (initialConfig.conditionType === 'switch' ? [{ id: 'default', label: '默认', value: 'default' }] : []));
    } else if (isOpen && !initialConfig) {
      setMode('sequential');
      setDelay(0);
      setRetries(0);
      setConditionType('boolean');
      setConditionSource('parameter');
      setParameterName('');
      setResultPath('');
      setExpression('');
      setCases([]);
    }
  }, [isOpen, initialConfig]);

  const handleSave = () => {
    let configToSave: EdgeConfig = { mode };
    if (mode === 'sequential') {
      configToSave = { ...configToSave, delay, retries };
    } else if (mode === 'conditional') {
      configToSave = { 
        ...configToSave, 
        conditionType, 
        conditionSource,
        expression,
        cases: conditionType === 'switch' ? cases : undefined
      };
      if (conditionSource === 'parameter') {
        configToSave.parameterName = parameterName;
      } else if (conditionSource === 'result') {
        configToSave.resultPath = resultPath;
      }
    }
    onSave(configToSave);
    onClose();
  };
  
  const addCase = () => {
    if (conditionType !== 'switch') return;
    const newCase: ConditionCaseData = {
      id: `case-${Date.now()}`,
      label: `情况 ${cases.length + 1}`,
      value: ''
    };
    setCases([...cases, newCase]);
  };

  const removeCase = (caseId: string) => {
    setCases(cases.filter(c => c.id !== caseId));
  };

  const updateCase = (caseId: string, updates: Partial<ConditionCaseData>) => {
    setCases(
      cases.map(c => (c.id === caseId ? { ...c, ...updates } : c))
    );
  };

  useEffect(() => {
    if (mode !== 'conditional') {
      setConditionType('boolean');
      setConditionSource('parameter');
      setParameterName('');
      setResultPath('');
      setExpression('');
      setCases([]);
    } else {
      if (conditionType === 'boolean') {
        setCases([]);
      } else if (conditionType === 'switch' && cases.length === 0) {
        setCases([{ id: 'default', label: '默认', value: 'default' }]);
      }
    }
  }, [mode, conditionType]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure Edge</DialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth margin="normal">
          <InputLabel>Execution Mode</InputLabel>
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value as ExecutionMode)}
            label="Execution Mode"
          >
            <MenuItem value="sequential">Sequential</MenuItem>
            <MenuItem value="parallel">Parallel (Not fully configurable yet)</MenuItem>
            <MenuItem value="conditional">Conditional</MenuItem>
          </Select>
        </FormControl>

        {mode === 'sequential' && (
          <>
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Delay (ms)"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Retries"
              value={retries}
              onChange={(e) => setRetries(Number(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </>
        )}

        {mode === 'conditional' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Conditional Logic Configuration</Typography>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Condition Type</InputLabel>
              <Select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value as ConditionType)}
                label="Condition Type"
              >
                <MenuItem value="boolean">If/Else (Boolean)</MenuItem>
                <MenuItem value="switch">Switch/Case</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Condition Source</InputLabel>
              <Select
                value={conditionSource}
                onChange={(e) => setConditionSource(e.target.value as ConditionSource)}
                label="Condition Source"
              >
                <MenuItem value="parameter">Parameter Value</MenuItem>
                <MenuItem value="result">Previous Step Result</MenuItem>
              </Select>
            </FormControl>

            {conditionSource === 'parameter' && (
              <TextField
                fullWidth
                margin="dense"
                size="small"
                label="Parameter Name (from global or node outputs)"
                value={parameterName}
                onChange={(e) => setParameterName(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}

            {conditionSource === 'result' && (
              <TextField
                fullWidth
                margin="dense"
                size="small"
                label="Result Path (e.g., data.outputValue)"
                value={resultPath}
                onChange={(e) => setResultPath(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
            
            <TextField
              fullWidth
              margin="dense"
              size="small"
              label={conditionType === 'boolean' ? "Boolean Expression (e.g., paramName > 10)" : "Value to Switch On (e.g., resultPath)"}
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder={conditionType === 'boolean' ? 'e.g., temperature > 25 && pressure < 1.1' : 'e.g., status_code'}
              InputLabelProps={{ shrink: true }}
            />

            {conditionType === 'switch' && (
              <Box mt={2}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Switch Cases</Typography>
                <Divider sx={{ mb: 1 }}/>
                {cases.map((caseItem, index) => (
                  <Box key={caseItem.id} display="flex" alignItems="center" mt={1} gap={1}>
                    <TextField
                      size="small"
                      label={`Case ${index + 1} Value`}
                      value={caseItem.value}
                      onChange={(e) => updateCase(caseItem.id, { value: e.target.value })}
                      sx={{ flexGrow: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      size="small"
                      label="Label (for output handle)"
                      value={caseItem.label}
                      onChange={(e) => updateCase(caseItem.id, { label: caseItem.label })}
                      sx={{ flexGrow: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={() => removeCase(caseItem.id)}
                      disabled={cases.length <= 1 && caseItem.id === 'default'}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                ))}
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={addCase}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Case
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
