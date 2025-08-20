/**
 * AutoEIS Workflow Node Component
 * for Hugging Face Space AutoEIS GUI component
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
  CardContent
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
  Code as CodeIcon
} from '@mui/icons-material';

// AutoEIS通信状态
enum CommunicationStatus {
  IDLE = 'idle',
  PREPARING_DATA = 'preparing_data',
  UPLOADING = 'uploading',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// AutoEIS分析参数接口
interface AutoEISParameters {
  // 数据列配置
  frequency_column: string;
  z_real_column: string;
  z_imag_column: string;
  
  // 分析配置
  circuit_initial_guess: 'auto' | 'R0-C1' | 'R0-(R1-C1)' | 'R0-(R1||C1)' | 'R0-(R1||C1)-(R2||C2)';
  fitting_algorithm: 'lm' | 'trf' | 'dogbox';
  max_iterations: number;
  tolerance: number;
  
  // 输出配置
  output_format: 'json' | 'csv' | 'both';
  generate_plots: boolean;
  save_circuit_diagram: boolean;
  
  // 高级配置
  frequency_range?: [number, number];
  preprocessing?: {
    remove_outliers: boolean;
    kramers_kronig_test: boolean;
    smooth_data: boolean;
  };
  
  // 工作流信息
  workflow_id: string;
  node_id: string;
  experiment_name?: string;
}

// AutoEIS JSON负载结构
interface AutoEISPayload {
  // 元数据
  metadata: {
    workflow_id: string;
    node_id: string;
    experiment_name: string;
    timestamp: string;
    version: string;
  };
  
  // 数据文件信息
  data_files: {
    ac_file?: {
      filename: string;
      content_base64: string;
      mime_type: string;
      size_bytes: number;
    };
    dc_file?: {
      filename: string;
      content_base64: string;
      mime_type: string;
      size_bytes: number;
    };
  };
  
  // 分析参数
  parameters: AutoEISParameters;
  
  // 回调配置
  callback: {
    url?: string;
    method: 'POST';
    headers?: Record<string, string>;
  };
}

// AutoEIS结果接口
interface AutoEISResult {
  analysis_id: string;
  status: 'completed' | 'failed' | 'running';
  
  // 核心结果
  circuit_model: string;
  fit_parameters: Record<string, number>;
  fit_quality_metrics: {
    chi_squared: number;
    r_squared: number;
    rmse: number;
  };
  
  // 关键指标（针对电池/电化学应用）
  key_metrics?: {
    rct: number; // 电荷转移电阻
    coulombic_efficiency: number;
    overall_score: number;
  };
  
  // 可视化
  visualizations: {
    nyquist_plot?: string; // base64 或 URL
    bode_plot?: string;
    residuals_plot?: string;
    interactive_dashboard_url?: string;
  };
  
  // 原始数据
  raw_data?: any;
  processing_time?: number;
  error_message?: string;
}

// 节点数据接口
interface AutoEISNodeData {
  id: string;
  type: string;
  label: string;
  
  // HF Space配置
  hf_space_url: string;
  api_endpoint: string;
  api_key?: string;
  
  // 检测到的文件
  detected_files?: {
    ac_file?: string;
    dc_file?: string;
  };
  
  // 分析参数
  parameters: AutoEISParameters;
  
  // 最后的结果
  last_result?: AutoEISResult;
  
  // 回调函数
  onStatusChange?: (status: CommunicationStatus) => void;
  onResultReady?: (result: AutoEISResult) => void;
  onError?: (error: string) => void;
}

export const AutoEISWorkflowNode: React.FC<NodeProps<AutoEISNodeData>> = memo(({ 
  data, 
  selected,
  id 
}) => {
  // 状态管理
  const [status, setStatus] = useState<CommunicationStatus>(CommunicationStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AutoEISResult | null>(data.last_result || null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // 当前JSON负载
  const [currentPayload, setCurrentPayload] = useState<AutoEISPayload | null>(null);
  
  // 参数状态
  const [parameters, setParameters] = useState<AutoEISParameters>(
    data.parameters || {
      frequency_column: 'frequency',
      z_real_column: 'z_real',
      z_imag_column: 'z_imag',
      circuit_initial_guess: 'auto',
      fitting_algorithm: 'lm',
      max_iterations: 1000,
      tolerance: 1e-8,
      output_format: 'json',
      generate_plots: true,
      save_circuit_diagram: false,
      workflow_id: 'workflow_' + Date.now(),
      node_id: id || 'autoeis_node'
    }
  );

  // 文件引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检测EIS文件
  useEffect(() => {
    detectEISFiles();
  }, []);

  const detectEISFiles = useCallback(async () => {
    // Mock file detection for workflow context
    try {
      // In real implementation, access workflow context
      // Update detected files notification
      if (data.onStatusChange) {
        data.onStatusChange(CommunicationStatus.IDLE);
      }
      
    } catch (err) {
      console.error('File detection failed:', err);
    }
  }, [data]);

  // 准备JSON负载
  const preparePayload = useCallback(async (): Promise<AutoEISPayload> => {
    setStatus(CommunicationStatus.PREPARING_DATA);
    setProgress(10);

    // 读取文件内容（模拟）
    const acFileContent = await mockReadFile('ac_experiment_001.csv');
    const dcFileContent = await mockReadFile('dc_experiment_001.csv');

    const payload: AutoEISPayload = {
      metadata: {
        workflow_id: parameters.workflow_id,
        node_id: parameters.node_id,
        experiment_name: parameters.experiment_name || `Experiment_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      },
      
      data_files: {
        ac_file: {
          filename: 'ac_data.csv',
          content_base64: btoa(acFileContent),
          mime_type: 'text/csv',
          size_bytes: acFileContent.length
        },
        dc_file: {
          filename: 'dc_data.csv',
          content_base64: btoa(dcFileContent),
          mime_type: 'text/csv',
          size_bytes: dcFileContent.length
        }
      },
      
      parameters: {
        ...parameters,
        preprocessing: {
          remove_outliers: true,
          kramers_kronig_test: true,
          smooth_data: false
        }
      },
      
      callback: {
        method: 'POST',
        url: `${window.location.origin}/api/autoeis/callback/${id}`,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    };

    setCurrentPayload(payload);
    setProgress(25);
    
    return payload;
  }, [parameters, id]);

  // Mock file reading
  const mockReadFile = async (_filename: string): Promise<string> => {
    // In real implementation, read from workflow storage
    return `frequency,z_real,z_imag
10000,100.5,-25.3
5000,120.1,-35.7
1000,145.8,-48.2
500,165.3,-58.9
100,195.7,-72.1`;
  };

  // 发送到Hugging Face
  const sendToHuggingFace = useCallback(async () => {
    try {
      setError(null);
      const payload = await preparePayload();
      
      setStatus(CommunicationStatus.UPLOADING);
      setProgress(50);

      // 目前是手动模式，生成JSON供用户下载
      if (data.hf_space_url.includes('manual') || !data.api_key) {
        // 手动模式：生成JSON文件供下载
        const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(jsonBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autoeis_payload_${payload.metadata.experiment_name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setStatus(CommunicationStatus.COMPLETED);
        setProgress(100);
        
        // 显示手动操作提示
        alert(`JSON文件已下载！请手动上传到Hugging Face Space:\n${data.hf_space_url}`);
        
      } else {
        // 自动模式：直接API调用
        const response = await fetch(`${data.api_endpoint}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.api_key}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`API请求失败: ${response.statusText}`);
        }

        const apiResult = await response.json();
        
        setStatus(CommunicationStatus.ANALYZING);
        setProgress(75);
        
        // 开始轮询结果
        await pollForResults(apiResult.analysis_id || apiResult.task_id);
      }

    } catch (err: any) {
      setError(err.message || '通信失败');
      setStatus(CommunicationStatus.ERROR);
      if (data.onError) {
        data.onError(err.message);
      }
    }
  }, [data, preparePayload]);

  // 轮询结果
  const pollForResults = useCallback(async (analysisId: string) => {
    const maxAttempts = 60; // 5分钟超时
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`${data.api_endpoint}/status/${analysisId}`, {
          headers: {
            'Authorization': `Bearer ${data.api_key}`
          }
        });

        if (!response.ok) {
          throw new Error('状态查询失败');
        }

        const statusData = await response.json();
        
        if (statusData.status === 'completed') {
          setResult(statusData.result);
          setStatus(CommunicationStatus.COMPLETED);
          setProgress(100);
          
          if (data.onResultReady) {
            data.onResultReady(statusData.result);
          }
          
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || '分析失败');
          
        } else if (attempts < maxAttempts) {
          // 更新进度
          setProgress(75 + (attempts / maxAttempts) * 20);
          setTimeout(poll, 5000); // 5秒后重试
          attempts++;
          
        } else {
          throw new Error('分析超时');
        }

      } catch (err: any) {
        setError(err.message);
        setStatus(CommunicationStatus.ERROR);
      }
    };

    await poll();
  }, [data]);

  // 手动上传结果JSON
  const handleResultUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const resultData = JSON.parse(e.target?.result as string);
        setResult(resultData);
        setStatus(CommunicationStatus.COMPLETED);
        setProgress(100);
        
        if (data.onResultReady) {
          data.onResultReady(resultData);
        }
      } catch (err) {
        setError('结果文件格式错误');
      }
    };
    reader.readAsText(file);
  }, [data]);

  // 获取状态颜色和图标
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
      className={`autoeis-workflow-node ${selected ? 'selected' : ''}`}
      style={{ 
        minWidth: 420, 
        maxWidth: 500,
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
        border: `2px solid ${selected ? '#5e35b1' : '#ddd'}`,
        borderRadius: 12,
        overflow: 'hidden'
      }}
    >
      <Handle type="target" position={Position.Top} />

      {/* 头部区域 */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'rgba(94, 53, 177, 0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ScienceIcon sx={{ mr: 1, color: '#5e35b1', fontSize: '1.8rem' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#5e35b1', fontWeight: 'bold' }}>
              {data.label || 'AutoEIS Analysis'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Hugging Face Integration
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setShowSettings(true)}>
            <SettingsIcon />
          </IconButton>
        </Box>

        {/* 状态指示器 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={getStatusIcon()}
            label={status.toUpperCase().replace('_', ' ')}
            color={getStatusColor()}
            size="small"
          />
          {data.detected_files?.ac_file && (
            <Chip label="AC Data" size="small" variant="outlined" color="primary" />
          )}
          {data.detected_files?.dc_file && (
            <Chip label="DC Data" size="small" variant="outlined" color="secondary" />
          )}
        </Box>
      </Box>

      {/* 主要内容区域 */}
      <Box sx={{ p: 2 }}>
        {/* 错误显示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 进度条 */}
        {status !== CommunicationStatus.IDLE && status !== CommunicationStatus.COMPLETED && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              {status === CommunicationStatus.PREPARING_DATA && '准备数据...'}
              {status === CommunicationStatus.UPLOADING && '上传到Hugging Face...'}
              {status === CommunicationStatus.ANALYZING && '分析中...'}
            </Typography>
          </Box>
        )}

        {/* 结果显示 */}
        {result && (
          <Card sx={{ mb: 2, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Analysis Results
              </Typography>
              
              {result.key_metrics && (
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#4caf50' }}>
                      {result.key_metrics.rct.toFixed(2)} Ω
                    </Typography>
                    <Typography variant="caption">Rct</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#2196f3' }}>
                      {(result.key_metrics.coulombic_efficiency * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="caption">CE</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#ff9800' }}>
                      {result.key_metrics.overall_score.toFixed(1)}
                    </Typography>
                    <Typography variant="caption">Score</Typography>
                  </Box>
                </Box>
              )}

              <Collapse in={expanded}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Circuit:</strong> {result.circuit_model}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>R²:</strong> {result.fit_quality_metrics?.r_squared?.toFixed(4)}
                </Typography>
                {result.visualizations?.interactive_dashboard_url && (
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => window.open(result.visualizations?.interactive_dashboard_url, '_blank')}
                  >
                    View Dashboard
                  </Button>
                )}
              </Collapse>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={sendToHuggingFace}
            disabled={status === CommunicationStatus.ANALYZING}
            sx={{ flex: 1, minWidth: 120 }}
          >
            Send to HF
          </Button>

          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => setShowJsonPreview(true)}
            size="small"
          >
            JSON
          </Button>

          {/* 手动上传结果按钮 */}
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleResultUpload}
            ref={fileInputRef}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            size="small"
          >
            Upload Result
          </Button>
        </Box>
      </Box>

      {/* JSON预览对话框 */}
      <Dialog 
        open={showJsonPreview} 
        onClose={() => setShowJsonPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          AutoEIS JSON Payload
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setShowJsonPreview(false)}
          >
            <ExpandLessIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={20}
            fullWidth
            value={currentPayload ? JSON.stringify(currentPayload, null, 2) : '点击"Send to HF"生成JSON'}
            slotProps={{
              input: {
                readOnly: true,
                style: { fontFamily: 'monospace', fontSize: '12px' }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJsonPreview(false)}>关闭</Button>
          {currentPayload && (
            <Button 
              startIcon={<DownloadIcon />}
              onClick={() => {
                const blob = new Blob([JSON.stringify(currentPayload, null, 2)], {
                  type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `autoeis_payload_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              下载JSON
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 设置对话框 */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AutoEIS Settings</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Connection" />
            <Tab label="Parameters" />
            <Tab label="Advanced" />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ pt: 2 }}>
              <TextField
                label="Hugging Face Space URL"
                value={data.hf_space_url || ''}
                fullWidth
                margin="normal"
                helperText="例如: https://huggingface.co/spaces/username/autoeis-analyzer"
              />
              <TextField
                label="API Endpoint"
                value={data.api_endpoint || ''}
                fullWidth
                margin="normal"
              />
              <TextField
                label="API Key (可选)"
                type="password"
                value={data.api_key || ''}
                fullWidth
                margin="normal"
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Circuit Model</InputLabel>
                <Select
                  value={parameters.circuit_initial_guess}
                  onChange={(e) => setParameters({...parameters, circuit_initial_guess: e.target.value as any})}
                >
                  <MenuItem value="auto">Auto Detection</MenuItem>
                  <MenuItem value="R0-C1">R-C</MenuItem>
                  <MenuItem value="R0-(R1-C1)">R-(R-C)</MenuItem>
                  <MenuItem value="R0-(R1||C1)">Randles</MenuItem>
                  <MenuItem value="R0-(R1||C1)-(R2||C2)">Double Layer</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Fitting Algorithm</InputLabel>
                <Select
                  value={parameters.fitting_algorithm}
                  onChange={(e) => setParameters({...parameters, fitting_algorithm: e.target.value as any})}
                >
                  <MenuItem value="lm">Levenberg-Marquardt</MenuItem>
                  <MenuItem value="trf">Trust Region</MenuItem>
                  <MenuItem value="dogbox">Dogbox</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Max Iterations"
                type="number"
                value={parameters.max_iterations}
                onChange={(e) => setParameters({...parameters, max_iterations: parseInt(e.target.value)})}
                fullWidth
                margin="normal"
              />
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ pt: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={parameters.generate_plots}
                    onChange={(e) => setParameters({...parameters, generate_plots: e.target.checked})}
                  />
                }
                label="Generate Plots"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={parameters.save_circuit_diagram}
                    onChange={(e) => setParameters({...parameters, save_circuit_diagram: e.target.checked})}
                  />
                }
                label="Save Circuit Diagram"
              />
              <TextField
                label="Experiment Name"
                value={parameters.experiment_name || ''}
                onChange={(e) => setParameters({...parameters, experiment_name: e.target.value})}
                fullWidth
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export default AutoEISWorkflowNode;