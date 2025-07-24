import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Drawer,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Visibility,
  VisibilityOff,
  BugReport,
  Timeline,
} from '@mui/icons-material';
import { ExecutionTraceViewer, ExecutionStep } from './ExecutionTraceViewer';
import { executionTraceService } from '../services/executionTraceService';

interface ExecutionTracePanelProps {
  workflowId: string;
  nodes: any[];
  onExecute?: () => void;
  onStop?: () => void;
  isRunning?: boolean;
}

export const ExecutionTracePanel: React.FC<ExecutionTracePanelProps> = ({
  workflowId,
  nodes,
  onExecute,
  onStop,
  isRunning = false,
}) => {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Initialize execution trace when nodes change
    if (nodes.length > 0) {
      executionTraceService.initializeWorkflow(workflowId, nodes);
    }

    // Subscribe to execution updates
    const unsubscribe = executionTraceService.subscribe(workflowId, (steps) => {
      setExecutionSteps(steps);
    });

    return () => {
      unsubscribe();
    };
  }, [workflowId, nodes]);

  const handleExecute = async () => {
    if (onExecute) {
      onExecute();
    }
    
    // Start simulation
    await executionTraceService.simulateExecution(workflowId);
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  const handleRefresh = () => {
    const steps = executionTraceService.getExecutionSteps(workflowId);
    setExecutionSteps(steps);
  };

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const totalSteps = executionSteps.length;
  const completedSteps = executionSteps.filter(s => 
    ['success', 'failure', 'skipped'].includes(s.status)
  ).length;
  const failedSteps = executionSteps.filter(s => s.status === 'failure').length;

  return (
    <>
      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Paper elevation={3} sx={{ p: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              color="primary"
              onClick={handleToggleVisibility}
              size="small"
            >
              {isVisible ? <VisibilityOff /> : <Timeline />}
            </IconButton>
            
            {nodes.length > 0 && !isRunning && (
              <IconButton
                color="success"
                onClick={handleExecute}
                size="small"
              >
                <PlayArrow />
              </IconButton>
            )}
            
            {isRunning && (
              <IconButton
                color="error"
                onClick={handleStop}
                size="small"
              >
                <Stop />
              </IconButton>
            )}
            
            {totalSteps > 0 && (
              <Box sx={{ minWidth: 60 }}>
                <Typography variant="caption" color="text.secondary">
                  {completedSteps}/{totalSteps}
                </Typography>
                {failedSteps > 0 && (
                  <Typography variant="caption" color="error" display="block">
                    {failedSteps} failed
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Execution Trace Drawer */}
      <Drawer
        anchor="right"
        open={isVisible}
        onClose={() => setIsVisible(false)}
        variant="persistent"
        sx={{
          width: 400,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">
              Execution Trace
            </Typography>
            <IconButton onClick={() => setIsVisible(false)}>
              <VisibilityOff />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleExecute}
              disabled={isRunning || nodes.length === 0}
              size="small"
            >
              Execute
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleStop}
              disabled={!isRunning}
              size="small"
            >
              Stop
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BugReport />}
              onClick={() => executionTraceService.clearWorkflow(workflowId)}
              size="small"
            >
              Clear
            </Button>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Auto-refresh"
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <ExecutionTraceViewer
            steps={executionSteps}
            onRefresh={handleRefresh}
            isRunning={isRunning}
          />
        </Box>
      </Drawer>
    </>
  );
};