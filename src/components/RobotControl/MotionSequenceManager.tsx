/**
 * Motion Sequence Manager Component
 * Allows users to define, save, and execute multi-step robotic operations
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

import { CoordinateInput3D } from './CoordinateInput3D';
import { TrajectoryVisualization } from './TrajectoryVisualization';

interface Position3D {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

interface SequenceStep {
  id: string;
  type: 'move' | 'pick' | 'place' | 'wait' | 'home' | 'execute_sequence';
  position?: Position3D;
  duration?: number;
  speed?: number;
  description: string;
  parameters?: Record<string, any>;
}

interface MotionSequence {
  id: string;
  name: string;
  description: string;
  robotType: 'UR3e' | 'Dobot' | 'Kinova' | 'Generic';
  steps: SequenceStep[];
  totalDuration: number;
  created: string;
  modified: string;
  tags: string[];
}

interface MotionSequenceManagerProps {
  robotType?: 'UR3e' | 'Dobot' | 'Kinova' | 'Generic';
  workspaceSize?: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  onSequenceExecute?: (sequence: MotionSequence) => void;
  disabled?: boolean;
}

const DEFAULT_WORKSPACE = {
  x: [-500, 500] as [number, number],
  y: [-500, 500] as [number, number],
  z: [0, 400] as [number, number]
};

const STEP_TYPES = [
  { value: 'move', label: 'Move To Position', icon: '🎯' },
  { value: 'pick', label: 'Pick Object', icon: '🤏' },
  { value: 'place', label: 'Place Object', icon: '📦' },
  { value: 'wait', label: 'Wait/Delay', icon: '⏱️' },
  { value: 'home', label: 'Go Home', icon: '🏠' },
  { value: 'execute_sequence', label: 'Execute Sub-sequence', icon: '🔄' }
];

export const MotionSequenceManager: React.FC<MotionSequenceManagerProps> = ({
  robotType = 'Generic',
  workspaceSize = DEFAULT_WORKSPACE,
  onSequenceExecute,
  disabled = false
}) => {
  const [sequences, setSequences] = useState<MotionSequence[]>([]);
  const [currentSequence, setCurrentSequence] = useState<MotionSequence | null>(null);
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [showSequenceDialog, setShowSequenceDialog] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<{
    isRunning: boolean;
    currentStep: number;
    progress: number;
    error?: string;
  }>({ isRunning: false, currentStep: 0, progress: 0 });
  const [sequenceForm, setSequenceForm] = useState({
    name: '',
    description: '',
    tags: ''
  });
  const [stepForm, setStepForm] = useState<Partial<SequenceStep>>({
    type: 'move',
    description: '',
    position: { x: 0, y: 0, z: 100 },
    duration: 1,
    speed: 100
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create new sequence
  const createNewSequence = () => {
    const newSequence: MotionSequence = {
      id: `seq_${Date.now()}`,
      name: 'New Sequence',
      description: '',
      robotType,
      steps: [],
      totalDuration: 0,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      tags: []
    };
    setCurrentSequence(newSequence);
    setSequenceForm({
      name: newSequence.name,
      description: newSequence.description,
      tags: newSequence.tags.join(', ')
    });
    setShowSequenceDialog(true);
  };

  // Save sequence
  const saveSequence = () => {
    if (!currentSequence) return;

    const updatedSequence: MotionSequence = {
      ...currentSequence,
      name: sequenceForm.name || 'Untitled Sequence',
      description: sequenceForm.description,
      tags: sequenceForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      totalDuration: calculateTotalDuration(currentSequence.steps),
      modified: new Date().toISOString()
    };

    const existingIndex = sequences.findIndex(seq => seq.id === updatedSequence.id);
    if (existingIndex >= 0) {
      const newSequences = [...sequences];
      newSequences[existingIndex] = updatedSequence;
      setSequences(newSequences);
    } else {
      setSequences([...sequences, updatedSequence]);
    }

    setCurrentSequence(updatedSequence);
    setShowSequenceDialog(false);
  };

  // Add/Edit step
  const addStep = () => {
    setEditingStep(null);
    setStepForm({
      type: 'move',
      description: '',
      position: { x: 0, y: 0, z: 100 },
      duration: 1,
      speed: 100
    });
    setShowStepDialog(true);
  };

  const editStep = (step: SequenceStep) => {
    setEditingStep(step);
    setStepForm(step);
    setShowStepDialog(true);
  };

  const saveStep = () => {
    if (!currentSequence) return;

    const step: SequenceStep = {
      id: editingStep?.id || `step_${Date.now()}`,
      type: stepForm.type || 'move',
      description: stepForm.description || `${stepForm.type} step`,
      position: stepForm.position,
      duration: stepForm.duration,
      speed: stepForm.speed,
      parameters: stepForm.parameters
    };

    let newSteps;
    if (editingStep) {
      newSteps = currentSequence.steps.map(s => s.id === step.id ? step : s);
    } else {
      newSteps = [...currentSequence.steps, step];
    }

    setCurrentSequence({
      ...currentSequence,
      steps: newSteps,
      modified: new Date().toISOString()
    });

    setShowStepDialog(false);
  };

  const deleteStep = (stepId: string) => {
    if (!currentSequence) return;
    
    setCurrentSequence({
      ...currentSequence,
      steps: currentSequence.steps.filter(step => step.id !== stepId),
      modified: new Date().toISOString()
    });
  };

  const reorderSteps = (fromIndex: number, toIndex: number) => {
    if (!currentSequence) return;

    const newSteps = [...currentSequence.steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);

    setCurrentSequence({
      ...currentSequence,
      steps: newSteps,
      modified: new Date().toISOString()
    });
  };

  // Execution control
  const executeSequence = async (sequence: MotionSequence) => {
    if (disabled || executionStatus.isRunning) return;

    setExecutionStatus({ isRunning: true, currentStep: 0, progress: 0 });

    try {
      for (let i = 0; i < sequence.steps.length; i++) {
        const step = sequence.steps[i];
        setExecutionStatus(prev => ({ ...prev, currentStep: i }));

        // Simulate step execution
        await executeStep(step);
        
        const progress = ((i + 1) / sequence.steps.length) * 100;
        setExecutionStatus(prev => ({ ...prev, progress }));
      }

      setExecutionStatus({ isRunning: false, currentStep: 0, progress: 100 });
      
      if (onSequenceExecute) {
        onSequenceExecute(sequence);
      }
    } catch (error) {
      setExecutionStatus({
        isRunning: false,
        currentStep: 0,
        progress: 0,
        error: error instanceof Error ? error.message : 'Execution failed'
      });
    }
  };

  const executeStep = async (step: SequenceStep): Promise<void> => {
    return new Promise((resolve, reject) => {
      const duration = step.duration || 1;
      
      // Simulate step execution time
      setTimeout(() => {
        console.log(`Executing ${step.type}: ${step.description}`);
        resolve();
      }, duration * 1000);
    });
  };

  const stopExecution = () => {
    setExecutionStatus({ isRunning: false, currentStep: 0, progress: 0 });
  };

  // Utility functions
  const calculateTotalDuration = (steps: SequenceStep[]): number => {
    return steps.reduce((total, step) => total + (step.duration || 1), 0);
  };

  const exportSequence = (sequence: MotionSequence) => {
    const dataStr = JSON.stringify(sequence, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${sequence.name}.json`;
    link.click();
  };

  const importSequences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSequence = JSON.parse(e.target?.result as string) as MotionSequence;
        importedSequence.id = `seq_${Date.now()}`;
        importedSequence.created = new Date().toISOString();
        importedSequence.modified = new Date().toISOString();
        
        setSequences([...sequences, importedSequence]);
      } catch (error) {
        console.error('Failed to import sequence:', error);
      }
    };
    reader.readAsText(file);
  };

  const duplicateSequence = (sequence: MotionSequence) => {
    const duplicated: MotionSequence = {
      ...sequence,
      id: `seq_${Date.now()}`,
      name: `${sequence.name} (Copy)`,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
    setSequences([...sequences, duplicated]);
  };

  const getTrajectoryPoints = () => {
    if (!currentSequence) return [];
    
    return currentSequence.steps
      .filter(step => step.position)
      .map(step => ({
        id: step.id,
        type: step.type as 'move' | 'pick' | 'place' | 'wait',
        ...step.position!,
        duration: step.duration,
        speed: step.speed,
        description: step.description
      }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Motion Sequence Manager
      </Typography>

      {/* Control Panel */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createNewSequence}
            disabled={disabled}
          >
            New Sequence
          </Button>

          <Button
            variant="outlined"
            startIcon={<OpenIcon />}
            onClick={() => setShowLibraryDialog(true)}
            disabled={disabled}
          >
            Library ({sequences.length})
          </Button>

          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Import
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={importSequences}
          />

          {currentSequence && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={executionStatus.isRunning ? <PauseIcon /> : <PlayIcon />}
                onClick={() => executeSequence(currentSequence)}
                disabled={disabled || currentSequence.steps.length === 0}
              >
                {executionStatus.isRunning ? 'Running...' : 'Execute'}
              </Button>

              {executionStatus.isRunning && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={stopExecution}
                >
                  Stop
                </Button>
              )}
            </>
          )}

          <Chip
            label={`Robot: ${robotType}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Execution Status */}
        {executionStatus.isRunning && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Executing step {executionStatus.currentStep + 1} of {currentSequence?.steps.length}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={executionStatus.progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {executionStatus.error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setExecutionStatus(prev => ({ ...prev, error: undefined }))}>
            {executionStatus.error}
          </Alert>
        )}
      </Paper>

      {/* Main Content */}
      {currentSequence ? (
        <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
          {/* Sequence Editor */}
          <Paper elevation={2} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h6">{currentSequence.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentSequence.steps.length} steps • {calculateTotalDuration(currentSequence.steps)}s total
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit Sequence Info">
                  <IconButton onClick={() => setShowSequenceDialog(true)} disabled={disabled}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Sequence">
                  <IconButton onClick={() => exportSequence(currentSequence)} disabled={disabled}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicate Sequence">
                  <IconButton onClick={() => duplicateSequence(currentSequence)} disabled={disabled}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addStep}
              disabled={disabled}
              sx={{ mb: 2 }}
            >
              Add Step
            </Button>

            {/* Steps List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List>
                {currentSequence.steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <ListItem
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: executionStatus.currentStep === index ? '#e3f2fd' : 'transparent'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ minWidth: 20 }}>
                              {index + 1}.
                            </Typography>
                            <span>{STEP_TYPES.find(t => t.value === step.type)?.icon}</span>
                            <Typography variant="subtitle2">
                              {step.description}
                            </Typography>
                            {executionStatus.currentStep === index && executionStatus.isRunning && (
                              <CheckIcon color="success" fontSize="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            {step.position && (
                              <Typography variant="caption">
                                Position: ({step.position.x}, {step.position.y}, {step.position.z})
                              </Typography>
                            )}
                            {step.duration && (
                              <Typography variant="caption">
                                Duration: {step.duration}s
                              </Typography>
                            )}
                            {step.speed && (
                              <Typography variant="caption">
                                Speed: {step.speed}mm/s
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => editStep(step)} disabled={disabled}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => deleteStep(step.id)}
                            disabled={disabled}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Paper>

          {/* Visualization Panel */}
          <Box sx={{ width: 400 }}>
            <TrajectoryVisualization
              trajectoryPoints={getTrajectoryPoints()}
              onTrajectoryChange={() => {}}
              workspaceSize={workspaceSize}
              robotType={robotType}
              disabled={disabled}
            />
          </Box>
        </Box>
      ) : (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', flex: 1 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Sequence Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new sequence or select one from the library to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createNewSequence}
            disabled={disabled}
          >
            Create New Sequence
          </Button>
        </Paper>
      )}

      {/* Step Editor Dialog */}
      <Dialog
        open={showStepDialog}
        onClose={() => setShowStepDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStep ? 'Edit Step' : 'Add New Step'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Step Type</InputLabel>
              <Select
                value={stepForm.type || 'move'}
                onChange={(e) => setStepForm({ ...stepForm, type: e.target.value as any })}
              >
                {STEP_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{type.icon}</span>
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={stepForm.description || ''}
              onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
              fullWidth
            />

            {(['move', 'pick', 'place'].includes(stepForm.type || '')) && (
              <CoordinateInput3D
                value={stepForm.position || { x: 0, y: 0, z: 100 }}
                onChange={(position) => setStepForm({ ...stepForm, position })}
                workspaceSize={workspaceSize}
                robotType={robotType}
                label="Target Position"
              />
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Duration (seconds)"
                type="number"
                value={stepForm.duration || 1}
                onChange={(e) => setStepForm({ ...stepForm, duration: Number(e.target.value) })}
                inputProps={{ min: 0.1, step: 0.1 }}
              />
              
              {(['move', 'pick', 'place'].includes(stepForm.type || '')) && (
                <TextField
                  label="Speed (mm/s)"
                  type="number"
                  value={stepForm.speed || 100}
                  onChange={(e) => setStepForm({ ...stepForm, speed: Number(e.target.value) })}
                  inputProps={{ min: 1, max: 1000 }}
                />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStepDialog(false)}>Cancel</Button>
          <Button onClick={saveStep} variant="contained">
            {editingStep ? 'Update' : 'Add'} Step
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sequence Info Dialog */}
      <Dialog
        open={showSequenceDialog}
        onClose={() => setShowSequenceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sequence Information</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Sequence Name"
              value={sequenceForm.name}
              onChange={(e) => setSequenceForm({ ...sequenceForm, name: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={sequenceForm.description}
              onChange={(e) => setSequenceForm({ ...sequenceForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            
            <TextField
              label="Tags (comma separated)"
              value={sequenceForm.tags}
              onChange={(e) => setSequenceForm({ ...sequenceForm, tags: e.target.value })}
              fullWidth
              placeholder="e.g., pick-and-place, testing, calibration"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSequenceDialog(false)}>Cancel</Button>
          <Button onClick={saveSequence} variant="contained">
            Save Sequence
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sequence Library Dialog */}
      <Dialog
        open={showLibraryDialog}
        onClose={() => setShowLibraryDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Sequence Library</DialogTitle>
        <DialogContent>
          {sequences.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No sequences saved yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {sequences.map(sequence => (
                <Card key={sequence.id} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {sequence.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {sequence.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {sequence.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {sequence.steps.length} steps • {sequence.totalDuration}s • {sequence.robotType}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => {
                        setCurrentSequence(sequence);
                        setShowLibraryDialog(false);
                      }}
                    >
                      Load
                    </Button>
                    <Button
                      size="small"
                      onClick={() => duplicateSequence(sequence)}
                    >
                      Copy
                    </Button>
                    <Button
                      size="small"
                      onClick={() => exportSequence(sequence)}
                    >
                      Export
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setSequences(sequences.filter(s => s.id !== sequence.id))}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLibraryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MotionSequenceManager;