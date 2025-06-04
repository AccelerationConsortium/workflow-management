import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Add,
  Delete,
  Visibility
} from '@mui/icons-material';

interface ListenerStatus {
  is_running: boolean;
  db_path: string;
  polling_interval: number;
  pending_count: number;
}

interface Experiment {
  experiment_id: string;
  experiment_name: string;
  status: string;
  origin: string;
  created_at: string;
  bo_recommendation_id: string;
  bo_round: number;
}

interface Recommendation {
  id: string;
  round: number;
  flow_rate: number;
  powder_type: string;
  volume: number;
  temperature?: number;
  pressure?: number;
  status: string;
  created_at: string;
  processed_at?: string;
}

const BOControlPanel: React.FC = () => {
  const [listenerStatus, setListenerStatus] = useState<ListenerStatus | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState(30);
  const [dbPath, setDbPath] = useState('bo_recommendations.duckdb');
  const [createRecommendationOpen, setCreateRecommendationOpen] = useState(false);

  // 新推荐表单状态
  const [newRecommendation, setNewRecommendation] = useState({
    round: 1,
    flow_rate: 5.0,
    powder_type: 'catalyst_A',
    volume: 25.0,
    temperature: 50.0,
    pressure: 1.0
  });

  const API_BASE = 'http://localhost:8000/api/bo';

  useEffect(() => {
    fetchListenerStatus();
    fetchExperiments();
    fetchRecommendations();
  }, []);

  const fetchListenerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      setListenerStatus(data);
    } catch (err) {
      setError('Failed to fetch listener status');
    }
  };

  const fetchExperiments = async () => {
    try {
      const response = await fetch(`${API_BASE}/experiments`);
      const data = await response.json();
      setExperiments(data);
    } catch (err) {
      setError('Failed to fetch experiments');
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE}/recommendations`);
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      setError('Failed to fetch recommendations');
    }
  };

  const startListener = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db_path: dbPath,
          polling_interval: pollingInterval
        })
      });
      
      if (response.ok) {
        await fetchListenerStatus();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to start listener');
      }
    } catch (err) {
      setError('Failed to start listener');
    } finally {
      setLoading(false);
    }
  };

  const stopListener = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/stop`, { method: 'POST' });
      
      if (response.ok) {
        await fetchListenerStatus();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to stop listener');
      }
    } catch (err) {
      setError('Failed to stop listener');
    } finally {
      setLoading(false);
    }
  };

  const manualTrigger = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/trigger`, { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        await fetchExperiments();
        await fetchRecommendations();
        setError(null);
      } else {
        setError(data.error || 'Manual trigger failed');
      }
    } catch (err) {
      setError('Failed to trigger manual processing');
    } finally {
      setLoading(false);
    }
  };

  const createTestRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecommendation)
      });
      
      if (response.ok) {
        await fetchRecommendations();
        setCreateRecommendationOpen(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create recommendation');
      }
    } catch (err) {
      setError('Failed to create recommendation');
    } finally {
      setLoading(false);
    }
  };

  const cancelExperiment = async (experimentId: string) => {
    try {
      const response = await fetch(`${API_BASE}/experiments/${experimentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchExperiments();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to cancel experiment');
      }
    } catch (err) {
      setError('Failed to cancel experiment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      case 'processed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        BO 推荐系统控制面板
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 监听器状态和控制 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            监听器状态
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={listenerStatus?.is_running ? '运行中' : '已停止'}
                  color={listenerStatus?.is_running ? 'success' : 'default'}
                />
                <Typography variant="body2">
                  待处理推荐: {listenerStatus?.pending_count || 0}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={startListener}
                  disabled={loading || listenerStatus?.is_running}
                  size="small"
                >
                  启动
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Stop />}
                  onClick={stopListener}
                  disabled={loading || !listenerStatus?.is_running}
                  size="small"
                >
                  停止
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={manualTrigger}
                  disabled={loading}
                  size="small"
                >
                  手动触发
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="数据库路径"
                value={dbPath}
                onChange={(e) => setDbPath(e.target.value)}
                fullWidth
                size="small"
                disabled={listenerStatus?.is_running}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="轮询间隔 (秒)"
                type="number"
                value={pollingInterval}
                onChange={(e) => setPollingInterval(Number(e.target.value))}
                fullWidth
                size="small"
                disabled={listenerStatus?.is_running}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 实验列表 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              BO 生成的实验
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={fetchExperiments}
              size="small"
            >
              刷新
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>实验名称</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>BO 轮次</TableCell>
                  <TableCell>创建时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experiments.map((exp) => (
                  <TableRow key={exp.experiment_id}>
                    <TableCell>{exp.experiment_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={exp.status}
                        color={getStatusColor(exp.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{exp.bo_round}</TableCell>
                    <TableCell>
                      {new Date(exp.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => cancelExperiment(exp.experiment_id)}
                        disabled={exp.status === 'completed' || exp.status === 'failed'}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 推荐记录 */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              推荐记录
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Add />}
                onClick={() => setCreateRecommendationOpen(true)}
                size="small"
                variant="outlined"
              >
                创建测试推荐
              </Button>
              <Button
                startIcon={<Refresh />}
                onClick={fetchRecommendations}
                size="small"
              >
                刷新
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>轮次</TableCell>
                  <TableCell>流速</TableCell>
                  <TableCell>粉末类型</TableCell>
                  <TableCell>体积</TableCell>
                  <TableCell>温度</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>创建时间</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendations.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{rec.round}</TableCell>
                    <TableCell>{rec.flow_rate}</TableCell>
                    <TableCell>{rec.powder_type}</TableCell>
                    <TableCell>{rec.volume}</TableCell>
                    <TableCell>{rec.temperature || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={rec.status}
                        color={getStatusColor(rec.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(rec.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 创建推荐对话框 */}
      <Dialog
        open={createRecommendationOpen}
        onClose={() => setCreateRecommendationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>创建测试推荐</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="轮次"
                type="number"
                value={newRecommendation.round}
                onChange={(e) => setNewRecommendation({
                  ...newRecommendation,
                  round: Number(e.target.value)
                })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="流速"
                type="number"
                value={newRecommendation.flow_rate}
                onChange={(e) => setNewRecommendation({
                  ...newRecommendation,
                  flow_rate: Number(e.target.value)
                })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="粉末类型"
                value={newRecommendation.powder_type}
                onChange={(e) => setNewRecommendation({
                  ...newRecommendation,
                  powder_type: e.target.value
                })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="体积"
                type="number"
                value={newRecommendation.volume}
                onChange={(e) => setNewRecommendation({
                  ...newRecommendation,
                  volume: Number(e.target.value)
                })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="温度"
                type="number"
                value={newRecommendation.temperature}
                onChange={(e) => setNewRecommendation({
                  ...newRecommendation,
                  temperature: Number(e.target.value)
                })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="压力"
                type="number"
                value={newRecommendation.pressure}
                onChange={(e) => setNewRecommendation({
                  ...newRecommendation,
                  pressure: Number(e.target.value)
                })}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRecommendationOpen(false)}>
            取消
          </Button>
          <Button
            onClick={createTestRecommendation}
            variant="contained"
            disabled={loading}
          >
            创建
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BOControlPanel;
