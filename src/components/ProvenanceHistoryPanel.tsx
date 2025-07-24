import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Types for experiment run data
interface ExperimentRun {
  id: string;
  userId?: string;
  workflowId: string;
  configHash: string;
  inputSummary?: Record<string, any>;
  outputSummary?: Record<string, any>;
  functionName?: string;
  environment?: Record<string, any>;
  gitCommitHash?: string;
  triggerSource?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

interface ProvenanceHistoryPanelProps {
  workflowId?: string;
  onRunSelect?: (run: ExperimentRun) => void;
  maxHeight?: number;
}

export const ProvenanceHistoryPanel: React.FC<ProvenanceHistoryPanelProps> = ({
  workflowId,
  onRunSelect,
  maxHeight = 600
}) => {
  const [runs, setRuns] = useState<ExperimentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<ExperimentRun | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | false>(false);

  // Fetch experiment runs
  useEffect(() => {
    fetchRuns();
  }, [workflowId]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: '50',
        offset: '0'
      });
      
      if (workflowId) {
        params.append('workflow_id', workflowId);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/runs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch experiment runs');
      }
      
      const data = await response.json();
      setRuns(data.runs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRuns = runs.filter(run => {
    const matchesSearch = searchTerm === '' || 
      run.workflowId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.functionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      completed: 'success',
      running: 'info',
      failed: 'error',
      pending: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      completed: <CheckIcon />,
      running: <PlayIcon />,
      failed: <ErrorIcon />,
      pending: <TimeIcon />
    };
    return icons[status] || <TimeIcon />;
  };

  const handleRunClick = (run: ExperimentRun) => {
    setSelectedRun(run);
    setDialogOpen(true);
    onRunSelect?.(run);
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const renderRunDetails = (run: ExperimentRun) => (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Basic Information
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2"><strong>Run ID:</strong> {run.id}</Typography>
            <Typography variant="body2"><strong>Workflow ID:</strong> {run.workflowId}</Typography>
            <Typography variant="body2"><strong>Function:</strong> {run.functionName || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Status:</strong> 
              <Chip 
                label={run.status} 
                color={getStatusColor(run.status)} 
                size="small" 
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography variant="body2"><strong>Duration:</strong> {formatDuration(run.duration)}</Typography>
            <Typography variant="body2"><strong>Start Time:</strong> {formatTime(run.startTime)}</Typography>
            <Typography variant="body2"><strong>End Time:</strong> {formatTime(run.endTime)}</Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Provenance Information
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2"><strong>Config Hash:</strong> {run.configHash}</Typography>
            <Typography variant="body2"><strong>Git Commit:</strong> {run.gitCommitHash || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Trigger Source:</strong> {run.triggerSource || 'N/A'}</Typography>
            <Typography variant="body2"><strong>User ID:</strong> {run.userId || 'N/A'}</Typography>
          </Box>
        </Grid>
      </Grid>
      
      {run.errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Error:</strong> {run.errorMessage}
        </Alert>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Input Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(run.inputSummary, null, 2)}
          </pre>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Output Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(run.outputSummary, null, 2)}
          </pre>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Environment</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(run.environment, null, 2)}
          </pre>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Metadata</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(run.metadata, null, 2)}
          </pre>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <Paper sx={{ maxWidth: 500, maxHeight, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Experiment Run History
        </Typography>
        
        {/* Search and Filter Controls */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterIcon color="action" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="running">Running</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && filteredRuns.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No experiment runs found
            </Typography>
          )}
          
          {!loading && !error && filteredRuns.length > 0 && (
            <List>
              {filteredRuns.map((run) => (
                <ListItem
                  key={run.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRunClick(run)}
                    >
                      <ViewIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(run.status)}
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {run.functionName || run.workflowId}
                        </Typography>
                        <Chip
                          label={run.status}
                          size="small"
                          color={getStatusColor(run.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {formatTime(run.startTime)} • {formatDuration(run.duration)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {run.configHash}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
      
      {/* Run Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Experiment Run Details
          {selectedRun && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedRun.id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedRun && renderRunDetails(selectedRun)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};