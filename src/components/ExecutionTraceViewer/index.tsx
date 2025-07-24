import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Link,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Schedule,
  ExpandMore,
  ExpandLess,
  PlayArrow,
  Stop,
  Refresh,
  AttachFile,
  ShowChart,
} from '@mui/icons-material';
import { format } from 'date-fns';

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failure' | 'skipped' | 'warning';

export interface ExecutionStep {
  id: string;
  nodeId: string;
  nodeName: string;
  operation: string;
  primitive?: string;
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  message?: string;
  error?: string;
  data?: {
    files?: string[];
    charts?: string[];
    logs?: string[];
    [key: string]: any;
  };
  children?: ExecutionStep[]; // For nested primitives
}

interface ExecutionTraceViewerProps {
  steps: ExecutionStep[];
  onRefresh?: () => void;
  isRunning?: boolean;
}

const statusConfig = {
  pending: {
    color: 'grey' as const,
    icon: <Schedule />,
    label: 'Pending',
  },
  running: {
    color: 'primary' as const,
    icon: <PlayArrow />,
    label: 'Running',
  },
  success: {
    color: 'success' as const,
    icon: <CheckCircle />,
    label: 'Success',
  },
  failure: {
    color: 'error' as const,
    icon: <Error />,
    label: 'Failed',
  },
  skipped: {
    color: 'warning' as const,
    icon: <Warning />,
    label: 'Skipped',
  },
  warning: {
    color: 'warning' as const,
    icon: <Info />,
    label: 'Warning',
  },
};

const ExecutionStepItem: React.FC<{ step: ExecutionStep; isChild?: boolean }> = ({ step, isChild = false }) => {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[step.status];

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  return (
    <TimelineItem>
      <TimelineOppositeContent sx={{ m: 'auto 0' }}>
        <Box>
          {step.startTime && (
            <Typography variant="caption" color="text.secondary">
              {format(step.startTime, 'HH:mm:ss.SSS')}
            </Typography>
          )}
          {step.duration && (
            <Typography variant="caption" display="block" color="text.secondary">
              {formatDuration(step.duration)}
            </Typography>
          )}
        </Box>
      </TimelineOppositeContent>
      
      <TimelineSeparator>
        <TimelineConnector sx={{ bgcolor: 'grey.300' }} />
        <TimelineDot color={config.color}>
          {config.icon}
        </TimelineDot>
        <TimelineConnector sx={{ bgcolor: 'grey.300' }} />
      </TimelineSeparator>
      
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Paper elevation={isChild ? 0 : 1} sx={{ p: 2, bgcolor: isChild ? 'grey.50' : 'background.paper' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box flex={1}>
              <Typography variant={isChild ? 'body2' : 'subtitle1'} component="span">
                {isChild ? step.primitive : step.nodeName}
              </Typography>
              <Chip
                label={config.label}
                color={config.color}
                size="small"
                sx={{ ml: 1 }}
              />
              {step.operation && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {step.operation}
                </Typography>
              )}
            </Box>
            
            {(step.children?.length || step.data || step.message || step.error) && (
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
          
          {step.status === 'running' && (
            <LinearProgress sx={{ mt: 1 }} />
          )}
          
          <Collapse in={expanded}>
            <Box sx={{ mt: 2 }}>
              {step.message && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {step.message}
                </Typography>
              )}
              
              {step.error && (
                <Typography variant="body2" color="error" gutterBottom>
                  Error: {step.error}
                </Typography>
              )}
              
              {step.data && (
                <Box sx={{ mt: 1 }}>
                  {step.data.files && step.data.files.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Generated Files:
                      </Typography>
                      {step.data.files.map((file, idx) => (
                        <Box key={idx} sx={{ ml: 2 }}>
                          <Link href={file} target="_blank" rel="noopener">
                            <AttachFile fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {file}
                          </Link>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {step.data.charts && step.data.charts.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Charts:
                      </Typography>
                      {step.data.charts.map((chart, idx) => (
                        <Box key={idx} sx={{ ml: 2 }}>
                          <Link href={chart} target="_blank" rel="noopener">
                            <ShowChart fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {chart}
                          </Link>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              
              {step.children && step.children.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Primitive Operations:
                  </Typography>
                  <Timeline sx={{ p: 0, m: 0 }}>
                    {step.children.map((child) => (
                      <ExecutionStepItem key={child.id} step={child} isChild />
                    ))}
                  </Timeline>
                </Box>
              )}
            </Box>
          </Collapse>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
};

export const ExecutionTraceViewer: React.FC<ExecutionTraceViewerProps> = ({
  steps,
  onRefresh,
  isRunning = false,
}) => {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => ['success', 'failure', 'skipped'].includes(s.status)).length;
  const failedSteps = steps.filter(s => s.status === 'failure').length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          Execution Trace
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1}>
          {isRunning && (
            <Chip
              icon={<PlayArrow />}
              label="Running"
              color="primary"
              size="small"
            />
          )}
          
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={onRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box mb={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Progress: {completedSteps} / {totalSteps} steps
          </Typography>
          {failedSteps > 0 && (
            <Typography variant="body2" color="error">
              {failedSteps} failed
            </Typography>
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={failedSteps > 0 ? 'error' : 'primary'}
        />
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {steps.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            sx={{ color: 'text.secondary' }}
          >
            <Typography variant="body1">
              No execution data available
            </Typography>
          </Box>
        ) : (
          <Timeline position="alternate">
            {steps.map((step) => (
              <ExecutionStepItem key={step.id} step={step} />
            ))}
          </Timeline>
        )}
      </Box>
    </Paper>
  );
};