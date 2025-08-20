/**
 * Enhanced AutoEIS Workflow Node Component
 * Advanced UI with multiple input methods, drag-drop, and intelligent parameter suggestions
 */

import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Science as ScienceIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Code as CodeIcon,
  FileUpload as FileUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// Simplified AutoEIS parameters interface
interface SimplifiedAutoEISParams {
  // Data source selection
  dataSource: {
    type: 'single_file' | 'separate_files' | 'upstream';
  };
  
  // Basic settings (dropdown selections)
  circuitModel: 'auto-detect' | 'simple' | 'complex';
  algorithm: 'fast' | 'accurate' | 'robust';
  outputFormat: 'json' | 'csv' | 'report';
  
  // Execution mode
  mode: 'idle' | 'enhanced';
}

// Enhanced input configuration
interface EnhancedInput {
  // Single file upload
  singleFile?: {
    file: File;
    columnMapping: ColumnMap;
    preview?: string[][];
  };
  
  // Separate AC/DC files
  separateFiles?: {
    acFile: File | null;
    dcFile: File | null;
    autoDetectColumns: boolean;
    preview?: {
      ac?: string[][];
      dc?: string[][];
    };
  };
  
  // From upstream nodes
  fromUpstream?: {
    nodeId: string;
    dataType: 'ac' | 'dc' | 'both';
    preview?: any;
  };
}

interface ColumnMap {
  frequency: string;
  realImpedance: string;
  imagImpedance: string;
}

// Enhanced AutoEIS result interface
interface EnhancedEISResult {
  analysisId: string;
  status: 'completed' | 'failed' | 'running';
  
  // Core results
  circuitModel: string;
  parameters: Record<string, {
    value: number;
    uncertainty?: number;
    unit?: string;
  }>;
  
  // Quality metrics
  fitQualityMetrics: {
    chiSquared: number;
    rSquared: number;
    rmse: number;
    aic: number;
    bic: number;
  };
  
  // Key electrochemical metrics
  keyMetrics: {
    rct: number;
    coulombicEfficiency: number;
    overallScore: number;
    capacitance?: number;
    warburg?: number;
  };
  
  // Visualizations
  visualizations: {
    nyquistPlot?: string;
    bodePlot?: string;
    residualsPlot?: string;
    circuitDiagram?: string;
    interactiveDashboardUrl?: string;
  };
  
  // Processing metadata
  processingTime?: number;
  errorMessage?: string;
  suggestions?: string[];
}

// Enhanced node data interface
interface EnhancedAutoEISNodeData {
  id: string;
  type: string;
  label: string;
  
  // Simplified parameters
  params: SimplifiedAutoEISParams;
  
  // Input configuration
  inputConfig?: EnhancedInput;
  
  // Results
  lastResult?: EnhancedEISResult;
  
  // Callbacks
  onStatusChange?: (status: string) => void;
  onResultReady?: (result: EnhancedEISResult) => void;
  onError?: (error: string) => void;
}

// Communication status enum
enum CommunicationStatus {
  IDLE = 'idle',
  PREPARING_DATA = 'preparing_data',
  UPLOADING = 'uploading',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export const EnhancedAutoEISNode: React.FC<NodeProps<EnhancedAutoEISNodeData>> = memo(({ 
  data, 
  selected,
  id 
}) => {
  // State management
  const [status, setStatus] = useState<CommunicationStatus>(CommunicationStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<EnhancedEISResult | null>(data.lastResult || null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  // Input method tabs
  const [inputTabValue, setInputTabValue] = useState(0);
  const [inputData, setInputData] = useState<EnhancedInput>({});
  
  // Simplified parameter configuration
  const [params, setParams] = useState<SimplifiedAutoEISParams>(
    data.params || {
      dataSource: {
        type: 'single_file'
      },
      circuitModel: 'auto-detect',
      algorithm: 'accurate',
      outputFormat: 'json',
      mode: 'enhanced'
    }
  );
  
  // UI state
  const [expandedResults, setExpandedResults] = useState(false);
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // File upload dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: inputTabValue === 1, // Allow multiple files for AC/DC separate mode
    onDrop: handleFileDrop
  });

  // Handle file drop
  async function handleFileDrop(acceptedFiles: File[]) {
    if (inputTabValue === 0) {
      // Single file mode
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const preview = await getFilePreview(file);
        setInputData({
          singleFile: {
            file,
            columnMapping: {
              frequency: 'frequency',
              realImpedance: 'z_real',
              imagImpedance: 'z_imag'
            },
            preview
          }
        });
        setPreviewData(preview);
      }
    } else if (inputTabValue === 1) {
      // Separate files mode
      const currentSeparate = inputData.separateFiles || { acFile: null, dcFile: null, autoDetectColumns: true };
      
      for (const file of acceptedFiles) {
        if (file.name.toLowerCase().includes('ac')) {
          currentSeparate.acFile = file;
        } else if (file.name.toLowerCase().includes('dc')) {
          currentSeparate.dcFile = file;
        } else {
          // Let user choose
          currentSeparate.acFile = file;
        }
      }
      
      setInputData({
        ...inputData,
        separateFiles: currentSeparate
      });
    }
  }

  // Get file preview (first 5 rows)
  const getFilePreview = async (file: File): Promise<string[][]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(0, 6); // Header + 5 rows
        const data = lines.map(line => line.split(','));
        resolve(data);
      };
      reader.readAsText(file);
    });
  };

  // Intelligent parameter suggestions
  const suggestParameters = useCallback(async (data: any) => {
    // Mock intelligent analysis
    const suggestions = [
      "High frequency noise detected - consider enabling outlier removal",
      "Data suggests Randles circuit model would be optimal",
      "Good signal quality - Levenberg-Marquardt algorithm recommended"
    ];
    
    setSuggestions(suggestions);
    
    // Auto-update parameters based on analysis
    setBasicParams(prev => ({
      ...prev,
      circuitInitialGuess: 'R0-(R1||C1)', // Randles
      fittingAlgorithm: 'levenberg_marquardt'
    }));
    
    setAdvancedParams(prev => ({
      ...prev,
      analysis: {
        ...prev.analysis,
        outlierRemoval: true
      }
    }));
  }, []);

  // Run enhanced analysis
  const runEnhancedAnalysis = useCallback(async () => {
    try {
      setError(null);
      setStatus(CommunicationStatus.PREPARING_DATA);
      setProgress(10);
      
      // Prepare enhanced payload
      const enhancedPayload = {
        metadata: {
          workflowId: `workflow_${Date.now()}`,
          nodeId: id,
          experimentName: `Enhanced_EIS_${Date.now()}`,
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        },
        
        simplifiedParams: params,
        
        dataSource: {
          type: params.dataSource.type,
          config: inputData
        },
        
        executionConfig: {
          mode: params.mode === 'enhanced' ? 'cloud' : 'local',
          timeout: 300,
          priority: 'normal'
        }
      };
      
      setStatus(CommunicationStatus.UPLOADING);
      setProgress(40);
      
      // Mock analysis (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus(CommunicationStatus.ANALYZING);
      setProgress(70);
      
      // Mock result generation
      const mockResult: EnhancedEISResult = {
        analysisId: `analysis_${Date.now()}`,
        status: 'completed',
        circuitModel: 'R0-(R1||C1)-W1',
        parameters: {
          R0: { value: 5.2, uncertainty: 0.1, unit: 'Ω' },
          R1: { value: 45.8, uncertainty: 1.2, unit: 'Ω' },
          C1: { value: 2.3e-6, uncertainty: 1.1e-7, unit: 'F' },
          W1: { value: 0.002, uncertainty: 0.0001, unit: 'Ω⋅s^-0.5' }
        },
        fitQualityMetrics: {
          chiSquared: 0.0023,
          rSquared: 0.9987,
          rmse: 0.045,
          aic: -234.5,
          bic: -225.8
        },
        keyMetrics: {
          rct: 45.8,
          coulombicEfficiency: 0.94,
          overallScore: 9.2,
          capacitance: 2.3e-6,
          warburg: 0.002
        },
        visualizations: {
          nyquistPlot: 'data:image/png;base64,mock_plot_data',
          interactiveDashboardUrl: 'https://mock-dashboard.com/analysis_123'
        },
        processingTime: 12.5,
        suggestions: [
          "Excellent fit quality (R² = 0.9987)",
          "Warburg element indicates diffusion-limited behavior",
          "Consider temperature effects for complete analysis"
        ]
      };
      
      setResult(mockResult);
      setStatus(CommunicationStatus.COMPLETED);
      setProgress(100);
      
      if (data.onResultReady) {
        data.onResultReady(mockResult);
      }
      
    } catch (err: any) {
      setError(err.message || 'Enhanced analysis failed');
      setStatus(CommunicationStatus.ERROR);
      if (data.onError) {
        data.onError(err.message);
      }
    }
  }, [inputData, params, data, id, inputTabValue]);

  // Auto-suggest parameters when data changes
  useEffect(() => {
    if (inputData.singleFile || inputData.separateFiles) {
      suggestParameters(inputData);
    }
  }, [inputData, suggestParameters]);

  // Render input tab panels
  const renderInputTabs = () => (
    <Box sx={{ mb: 2 }}>
      <Tabs 
        value={inputTabValue} 
        onChange={(_, v) => {
          setInputTabValue(v);
          // Update data source type
          const sourceTypes: ('single_file' | 'separate_files' | 'upstream')[] = ['single_file', 'separate_files', 'upstream'];
          setParams({...params, dataSource: {type: sourceTypes[v]}});
        }} 
        variant="fullWidth"
      >
        <Tab label="Single File" icon={<FileUploadIcon />} />
        <Tab label="AC/DC Separate" icon={<CloudUploadIcon />} />
        <Tab label="From Upstream" icon={<TrendingUpIcon />} />
      </Tabs>
      
      <Box sx={{ mt: 2, minHeight: 120, border: '2px dashed #ccc', borderRadius: 2, p: 2 }}>
        {inputTabValue === 0 && (
          <Box {...getRootProps()} sx={{ textAlign: 'center', cursor: 'pointer' }}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography>Drop the EIS data file here...</Typography>
            ) : (
              <Box>
                <FileUploadIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
                <Typography>Drag & drop EIS data file, or click to select</Typography>
                <Typography variant="caption" color="textSecondary">
                  Supports CSV, XLS, XLSX files
                </Typography>
              </Box>
            )}
            
            {inputData.singleFile && (
              <Chip 
                label={inputData.singleFile.file.name} 
                color="primary" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>
        )}
        
        {inputTabValue === 1 && (
          <Box {...getRootProps()} sx={{ textAlign: 'center', cursor: 'pointer' }}>
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
            <Typography>Upload separate AC and DC files</Typography>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
              {inputData.separateFiles?.acFile && (
                <Chip label={`AC: ${inputData.separateFiles.acFile.name}`} color="primary" />
              )}
              {inputData.separateFiles?.dcFile && (
                <Chip label={`DC: ${inputData.separateFiles.dcFile.name}`} color="secondary" />
              )}
            </Box>
          </Box>
        )}
        
        {inputTabValue === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
            <Typography>Connect to upstream analysis nodes</Typography>
            <FormControl sx={{ mt: 2, minWidth: 200 }}>
              <InputLabel>Select Source Node</InputLabel>
              <Select value="" label="Select Source Node">
                <MenuItem value="node1">Battery Testing Node</MenuItem>
                <MenuItem value="node2">Data Processing Node</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
    </Box>
  );

  // Render data preview
  const renderDataPreview = () => {
    if (!previewData || previewData.length === 0) return null;
    
    return (
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Data Preview ({previewData.length - 1} rows)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {previewData[0]?.map((header, idx) => (
                    <TableCell key={idx}><strong>{header}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.slice(1, 6).map((row, idx) => (
                  <TableRow key={idx}>
                    {row.map((cell, cellIdx) => (
                      <TableCell key={cellIdx}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Render intelligent suggestions
  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;
    
    return (
      <Card sx={{ mb: 2, bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
        <CardHeader
          avatar={<AutoAwesomeIcon sx={{ color: '#2196f3' }} />}
          title="Intelligent Suggestions"
          titleTypographyProps={{ variant: 'subtitle2' }}
        />
        <CardContent sx={{ pt: 0 }}>
          {suggestions.map((suggestion, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
              • {suggestion}
            </Typography>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Get status color and icon
  const getStatusColor = () => {
    switch (status) {
      case CommunicationStatus.COMPLETED: return 'success';
      case CommunicationStatus.ERROR: return 'error';
      case CommunicationStatus.ANALYZING:
      case CommunicationStatus.UPLOADING: return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case CommunicationStatus.COMPLETED: return <CheckCircleIcon />;
      case CommunicationStatus.ERROR: return <ErrorIcon />;
      case CommunicationStatus.ANALYZING: return <CircularProgress size={20} />;
      default: return <ScienceIcon />;
    }
  };

  return (
    <div 
      className={`enhanced-autoeis-node ${selected ? 'selected' : ''}`}
      style={{ 
        minWidth: 450, 
        maxWidth: 520,
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f3e5f5 100%)',
        border: `2px solid ${selected ? '#4caf50' : '#ddd'}`,
        borderRadius: 16,
        overflow: 'hidden'
      }}
    >
      <Handle type="target" position={Position.Top} />

      {/* Enhanced Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'rgba(76, 175, 80, 0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ScienceIcon sx={{ mr: 1, color: '#4caf50', fontSize: '2rem' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              {data.label || 'Enhanced AutoEIS'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Advanced EIS Analysis with AI
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setShowSettings(true)}>
            <SettingsIcon />
          </IconButton>
        </Box>

        {/* Status indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={getStatusIcon()}
            label={status.toUpperCase().replace('_', ' ')}
            color={getStatusColor()}
            size="small"
          />
          <Chip 
            label="Enhanced Mode" 
            size="small" 
            variant="outlined" 
            color="success"
            icon={<AutoAwesomeIcon />}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Progress indicator */}
        {status !== CommunicationStatus.IDLE && status !== CommunicationStatus.COMPLETED && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              {status === CommunicationStatus.PREPARING_DATA && 'Preparing enhanced data...'}
              {status === CommunicationStatus.UPLOADING && 'Uploading to cloud service...'}
              {status === CommunicationStatus.ANALYZING && 'Running AI-enhanced analysis...'}
            </Typography>
          </Box>
        )}

        {/* Input configuration */}
        {renderInputTabs()}
        {renderDataPreview()}
        {renderSuggestions()}

        {/* Simplified Basic Settings */}
        <Card sx={{ mb: 2 }}>
          <CardHeader 
            title="Basic Settings" 
            avatar={<AnalyticsIcon />}
            titleTypographyProps={{ variant: 'subtitle2' }}
          />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Circuit Model</InputLabel>
                  <Select
                    value={params.circuitModel}
                    onChange={(e) => setParams({...params, circuitModel: e.target.value as any})}
                  >
                    <MenuItem value="auto-detect">Auto-Detect</MenuItem>
                    <MenuItem value="simple">Simple Circuit</MenuItem>
                    <MenuItem value="complex">Complex Circuit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Algorithm</InputLabel>
                  <Select
                    value={params.algorithm}
                    onChange={(e) => setParams({...params, algorithm: e.target.value as any})}
                  >
                    <MenuItem value="fast">Fast Analysis</MenuItem>
                    <MenuItem value="accurate">Accurate Analysis</MenuItem>
                    <MenuItem value="robust">Robust Analysis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Output Format</InputLabel>
                  <Select
                    value={params.outputFormat}
                    onChange={(e) => setParams({...params, outputFormat: e.target.value as any})}
                  >
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="report">Full Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Mode</InputLabel>
                  <Select
                    value={params.mode}
                    onChange={(e) => setParams({...params, mode: e.target.value as any})}
                  >
                    <MenuItem value="idle">Idle</MenuItem>
                    <MenuItem value="enhanced">Enhanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Enhanced results display */}
        {result && (
          <Card sx={{ mb: 2, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Enhanced Analysis Results
              </Typography>
              
              {/* Key metrics grid */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#4caf50' }}>
                      {result.keyMetrics.rct.toFixed(1)} Ω
                    </Typography>
                    <Typography variant="caption">Rct</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#2196f3' }}>
                      {(result.keyMetrics.coulombicEfficiency * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="caption">CE</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#ff9800' }}>
                      {result.keyMetrics.overallScore.toFixed(1)}
                    </Typography>
                    <Typography variant="caption">Score</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                      {result.fitQualityMetrics.rSquared.toFixed(3)}
                    </Typography>
                    <Typography variant="caption">R²</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Expandable details */}
              <Collapse in={expandedResults}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Circuit Model:</strong> {result.circuitModel}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Processing Time:</strong> {result.processingTime?.toFixed(1)}s
                </Typography>
                
                {/* Parameter values with uncertainties */}
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Fitted Parameters:
                </Typography>
                {Object.entries(result.parameters).map(([param, data]) => (
                  <Typography key={param} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    {param}: {data.value.toExponential(2)} ± {data.uncertainty?.toExponential(1)} {data.unit}
                  </Typography>
                ))}
                
                {/* AI suggestions */}
                {result.suggestions && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      AI Analysis:
                    </Typography>
                    {result.suggestions.map((suggestion, idx) => (
                      <Typography key={idx} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                        • {suggestion}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Collapse>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <IconButton size="small" onClick={() => setExpandedResults(!expandedResults)}>
                  {expandedResults ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<SendIcon />}
            onClick={runEnhancedAnalysis}
            disabled={status === CommunicationStatus.ANALYZING}
            sx={{ flex: 1, minWidth: 140 }}
          >
            Run Enhanced Analysis
          </Button>

          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => setShowJsonPreview(true)}
            size="small"
          >
            JSON
          </Button>

          {result?.visualizations?.interactiveDashboardUrl && (
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => window.open(result.visualizations?.interactiveDashboardUrl, '_blank')}
              size="small"
            >
              Dashboard
            </Button>
          )}
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AutoEIS Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Simplified Parameters</Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Data Source Type</InputLabel>
              <Select
                value={params.dataSource.type}
                onChange={(e) => setParams({
                  ...params,
                  dataSource: { type: e.target.value as any }
                })}
              >
                <MenuItem value="single_file">Single File</MenuItem>
                <MenuItem value="separate_files">Separate AC/DC Files</MenuItem>
                <MenuItem value="upstream">From Upstream Node</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Circuit Model Complexity</InputLabel>
              <Select
                value={params.circuitModel}
                onChange={(e) => setParams({...params, circuitModel: e.target.value as any})}
              >
                <MenuItem value="auto-detect">Auto-Detect</MenuItem>
                <MenuItem value="simple">Simple Circuit</MenuItem>
                <MenuItem value="complex">Complex Circuit</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Analysis Algorithm</InputLabel>
              <Select
                value={params.algorithm}
                onChange={(e) => setParams({...params, algorithm: e.target.value as any})}
              >
                <MenuItem value="fast">Fast (Quick Results)</MenuItem>
                <MenuItem value="accurate">Accurate (Balanced)</MenuItem>
                <MenuItem value="robust">Robust (High Quality)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Output Format</InputLabel>
              <Select
                value={params.outputFormat}
                onChange={(e) => setParams({...params, outputFormat: e.target.value as any})}
              >
                <MenuItem value="json">JSON Data</MenuItem>
                <MenuItem value="csv">CSV Format</MenuItem>
                <MenuItem value="report">Full Report</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Execution Mode</InputLabel>
              <Select
                value={params.mode}
                onChange={(e) => setParams({...params, mode: e.target.value as any})}
              >
                <MenuItem value="idle">Idle Mode</MenuItem>
                <MenuItem value="enhanced">Enhanced Mode</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* JSON Preview Dialog */}
      <Dialog open={showJsonPreview} onClose={() => setShowJsonPreview(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Enhanced JSON Payload</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={25}
            fullWidth
            value={JSON.stringify({
              metadata: { version: '2.0.0', enhancedMode: true },
              simplifiedParams: params,
              inputData
            }, null, 2)}
            slotProps={{
              input: {
                readOnly: true,
                style: { fontFamily: 'monospace', fontSize: '12px' }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJsonPreview(false)}>Close</Button>
          <Button startIcon={<DownloadIcon />}>Download</Button>
        </DialogActions>
      </Dialog>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default EnhancedAutoEISNode;