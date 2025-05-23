import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useOptimizer } from '../hooks/useOptimizer';
import { OptimizationParameter, OptimizationObjective } from '../services/optimizer/optimizerService';

interface OptimizerPanelProps {
  workflowId: string;
  nodeId: string | null;
  parameters: OptimizationParameter[];
  onApplySuggestion: (parameters: Record<string, number>) => void;
}

export const OptimizerPanel: React.FC<OptimizerPanelProps> = ({
  workflowId,
  nodeId,
  parameters,
  onApplySuggestion
}) => {
  // 如果没有选择节点，显示提示信息
  if (!nodeId) {
    return (
      <Box p={2}>
        <Typography color="text.secondary" align="center">
          请选择一个节点以使用优化器
        </Typography>
      </Box>
    );
  }

  // 使用优化器钩子
  const {
    session,
    suggestion,
    history,
    isLoading,
    error,
    createSession,
    getNextSuggestion,
    submitResult,
    pauseSession,
    resumeSession,
    refreshHistory
  } = useOptimizer({
    workflowId,
    nodeId
  });

  // 本地状态
  const [objectives, setObjectives] = useState<OptimizationObjective[]>([
    { id: 'yield', name: '产量', direction: 'maximize' },
    { id: 'time', name: '时间', direction: 'minimize' }
  ]);
  const [objectiveValues, setObjectiveValues] = useState<Record<string, number>>({});
  const [showCreateForm, setShowCreateForm] = useState<boolean>(!session);

  // 处理创建会话
  const handleCreateSession = async () => {
    try {
      await createSession({
        parameters,
        objectives,
        maxIterations: 20
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create optimization session:', error);
    }
  };

  // 处理应用建议
  const handleApplySuggestion = () => {
    if (suggestion) {
      onApplySuggestion(suggestion.parameters);
    }
  };

  // 处理提交结果
  const handleSubmitResult = async () => {
    try {
      await submitResult(objectiveValues);
      // 清空目标值
      setObjectiveValues({});
    } catch (error) {
      console.error('Failed to submit result:', error);
    }
  };

  // 处理目标值变化
  const handleObjectiveValueChange = (id: string, value: number) => {
    setObjectiveValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // 渲染创建会话表单
  const renderCreateForm = () => (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        创建优化会话
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        参数
      </Typography>
      <List dense>
        {parameters.map(param => (
          <ListItem key={param.id}>
            <ListItemText
              primary={param.name}
              secondary={`范围: ${param.min} - ${param.max} ${param.unit || ''}`}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        优化目标
      </Typography>
      <List dense>
        {objectives.map(objective => (
          <ListItem key={objective.id}>
            <ListItemText
              primary={objective.name}
              secondary={objective.direction === 'maximize' ? '最大化' : '最小化'}
            />
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateSession}
        disabled={isLoading || parameters.length === 0}
        sx={{ mt: 2 }}
      >
        {isLoading ? <CircularProgress size={24} /> : '创建会话'}
      </Button>
    </Box>
  );

  // 渲染会话控制
  const renderSessionControls = () => (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          优化会话
        </Typography>
        <Box>
          {session?.status === 'running' ? (
            <Button
              variant="outlined"
              startIcon={<PauseIcon />}
              onClick={pauseSession}
              disabled={isLoading}
              size="small"
            >
              暂停
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={resumeSession}
              disabled={isLoading || session?.status === 'completed'}
              size="small"
            >
              继续
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshHistory}
            disabled={isLoading}
            size="small"
            sx={{ ml: 1 }}
          >
            刷新
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          会话状态
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">
              状态: <Chip
                label={session?.status}
                color={
                  session?.status === 'running' ? 'success' :
                  session?.status === 'paused' ? 'warning' :
                  session?.status === 'completed' ? 'info' : 'default'
                }
                size="small"
              />
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              迭代: {session?.currentIteration} / {session?.maxIterations}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {suggestion ? (
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            建议参数
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <List dense>
              {Object.entries(suggestion.parameters).map(([id, value]) => {
                const param = parameters.find(p => p.id === id);
                return (
                  <ListItem key={id}>
                    <ListItemText
                      primary={param?.name || id}
                      secondary={`${value} ${param?.unit || ''}`}
                    />
                  </ListItem>
                );
              })}
            </List>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={handleApplySuggestion}
              fullWidth
              sx={{ mt: 1 }}
            >
              应用建议
            </Button>
          </Paper>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            提交结果
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {objectives.map(objective => (
              <Box key={objective.id} mb={2}>
                <Typography variant="body2" gutterBottom>
                  {objective.name} ({objective.direction === 'maximize' ? '最大化' : '最小化'})
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={objectiveValues[objective.id] || ''}
                  onChange={(e) => handleObjectiveValueChange(objective.id, parseFloat(e.target.value))}
                  InputProps={{
                    inputProps: { step: 0.01 }
                  }}
                />
              </Box>
            ))}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitResult}
              disabled={isLoading || Object.keys(objectiveValues).length !== objectives.length}
              fullWidth
            >
              提交结果
            </Button>
          </Paper>
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={getNextSuggestion}
            disabled={isLoading || session?.status !== 'running'}
          >
            获取下一个建议
          </Button>
        </Box>
      )}

      {history.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            优化历史
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {history.map((result, index) => (
                <ListItem key={result.id}>
                  <ListItemText
                    primary={`迭代 ${result.iteration}`}
                    secondary={
                      <React.Fragment>
                        {Object.entries(result.objectives).map(([id, value]) => {
                          const objective = objectives.find(o => o.id === id);
                          return (
                            <Typography variant="body2" component="span" display="block" key={id}>
                              {objective?.name || id}: {value}
                            </Typography>
                          );
                        })}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      {showCreateForm || !session ? renderCreateForm() : renderSessionControls()}
    </Box>
  );
};
