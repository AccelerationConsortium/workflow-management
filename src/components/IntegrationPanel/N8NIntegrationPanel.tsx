import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  TextField,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  NotificationsActive as NotifyIcon,
  Warning as AlertIcon,
  Assessment as ReportIcon,
  PlayArrow as TriggerIcon,
  Pause as PauseIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

interface N8NConfig {
  enabled: boolean;
  baseUrl: string;
  hasAuthToken: boolean;
  hasWebhookSecret: boolean;
  endpoints: {
    notify: string;
    alert: string;
    report: string;
    error: string;
  };
  status: 'connected' | 'disconnected' | 'error' | 'checking';
}

interface N8NEvent {
  id: string;
  timestamp: string;
  type: 'notification' | 'alert' | 'trigger' | 'status';
  direction: 'inbound' | 'outbound';
  experimentId: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
}

export const N8NIntegrationPanel: React.FC = () => {
  const [config, setConfig] = useState<N8NConfig>({
    enabled: false,
    baseUrl: '',
    hasAuthToken: false,
    hasWebhookSecret: false,
    endpoints: {
      notify: 'notify-experiment-status',
      alert: 'alert-human-intervention',
      report: 'report-ready',
      error: 'error-notification'
    },
    status: 'disconnected'
  });

  const [events, setEvents] = useState<N8NEvent[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    loadN8NConfig();
    loadRecentEvents();
  }, []);

  const loadN8NConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/integrations/n8n/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load N8N config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentEvents = async () => {
    try {
      const response = await fetch('/api/integrations/n8n/events?limit=20');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load N8N events:', error);
    }
  };

  const testConnection = async () => {
    try {
      setConfig(prev => ({ ...prev, status: 'checking' }));
      const response = await fetch('/api/integrations/n8n/test', { method: 'POST' });
      const data = await response.json();
      
      setConfig(prev => ({
        ...prev,
        status: data.success ? 'connected' : 'error'
      }));
    } catch (error) {
      setConfig(prev => ({ ...prev, status: 'error' }));
    }
  };

  const toggleIntegration = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/integrations/n8n/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        setConfig(prev => ({ ...prev, enabled }));
      }
    } catch (error) {
      console.error('Failed to toggle N8N integration:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'checking': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <SuccessIcon />;
      case 'checking': return <CircularProgress size={20} />;
      case 'error': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Integration Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/integrations/n8n-logo.svg" 
                alt="n8n" 
                style={{ width: 32, height: 32, marginRight: 12 }}
              />
              <Typography variant="h6">N8N Integration</Typography>
            </Box>
            <Switch
              checked={config.enabled}
              onChange={(e) => toggleIntegration(e.target.checked)}
              disabled={isLoading}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Automate experiment notifications, alerts, and triggers through n8n workflow automation
          </Typography>

          {/* Status Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              icon={getStatusIcon(config.status)}
              label={config.status.charAt(0).toUpperCase() + config.status.slice(1)}
              color={getStatusColor(config.status) as any}
              variant="outlined"
            />
            {config.enabled && (
              <Button
                size="small"
                startIcon={<SyncIcon />}
                onClick={testConnection}
                disabled={config.status === 'checking'}
              >
                Test Connection
              </Button>
            )}
          </Box>

          {/* Configuration Summary */}
          {config.enabled && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                size="small"
                icon={<NotifyIcon />}
                label="Notifications"
                color="primary"
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<AlertIcon />}
                label="Alerts"
                color="warning"
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<ReportIcon />}
                label="Reports"
                color="info"
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<TriggerIcon />}
                label="Triggers"
                color="success"
                variant="outlined"
              />
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setShowConfig(true)}
            >
              Configure
            </Button>
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => setShowEvents(true)}
            >
              View Events ({events.length})
            </Button>
          </Box>

          {/* Status Alerts */}
          {!config.hasAuthToken && config.enabled && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Authentication token not configured. Some features may not work properly.
            </Alert>
          )}

          {!config.hasWebhookSecret && config.enabled && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Webhook secret not configured. Consider adding for enhanced security.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {config.enabled && events.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
            <List dense>
              {events.slice(0, 5).map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>
                    {event.type === 'notification' && <NotifyIcon color="primary" />}
                    {event.type === 'alert' && <AlertIcon color="warning" />}
                    {event.type === 'trigger' && <TriggerIcon color="success" />}
                    {event.type === 'status' && <InfoIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.message}
                    secondary={`${event.experimentId} • ${event.direction} • ${new Date(event.timestamp).toLocaleString()}`}
                  />
                  <Chip
                    size="small"
                    label={event.status}
                    color={event.status === 'success' ? 'success' : event.status === 'failed' ? 'error' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Configuration Dialog */}
      <Dialog open={showConfig} onClose={() => setShowConfig(false)} maxWidth="md" fullWidth>
        <DialogTitle>N8N Integration Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="N8N Base URL"
              value={config.baseUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="https://n8n.mylab.io/webhook/"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Webhook Endpoints</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Notification Endpoint"
                value={config.endpoints.notify}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  endpoints: { ...prev.endpoints, notify: e.target.value }
                }))}
              />
              <TextField
                label="Alert Endpoint"
                value={config.endpoints.alert}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  endpoints: { ...prev.endpoints, alert: e.target.value }
                }))}
              />
              <TextField
                label="Report Endpoint"
                value={config.endpoints.report}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  endpoints: { ...prev.endpoints, report: e.target.value }
                }))}
              />
              <TextField
                label="Error Endpoint"
                value={config.endpoints.error}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  endpoints: { ...prev.endpoints, error: e.target.value }
                }))}
              />
            </Box>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Security Configuration:</strong><br/>
                • Set N8N_AUTH_TOKEN environment variable for authentication<br/>
                • Set N8N_WEBHOOK_SECRET for webhook signature verification<br/>
                • Configure these in your deployment environment
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfig(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowConfig(false)}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Events Dialog */}
      <Dialog open={showEvents} onClose={() => setShowEvents(false)} maxWidth="lg" fullWidth>
        <DialogTitle>N8N Integration Events</DialogTitle>
        <DialogContent>
          <List>
            {events.map((event) => (
              <ListItem key={event.id} divider>
                <ListItemIcon>
                  {event.direction === 'outbound' ? <TriggerIcon /> : <NotifyIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={`${event.type.toUpperCase()}: ${event.message}`}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        Experiment: {event.experimentId} | Direction: {event.direction}
                      </Typography>
                      <Typography variant="caption">
                        {new Date(event.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <Chip
                  size="small"
                  label={event.status}
                  color={event.status === 'success' ? 'success' : event.status === 'failed' ? 'error' : 'default'}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEvents(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};