import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as TriggerIcon,
  Schedule as ScheduleIcon,
  Webhook as WebhookIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Code as CodeIcon
} from '@mui/icons-material';

interface TriggerSource {
  id: string;
  type: 'slack' | 'webhook' | 'cron' | 'manual';
  name: string;
  description: string;
  config: any;
  enabled: boolean;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: any;
  }>;
}

interface N8NTriggerPanelProps {
  workflowId?: string;
  onTriggerConfigured?: (config: any) => void;
}

export const N8NTriggerPanel: React.FC<N8NTriggerPanelProps> = ({
  workflowId,
  onTriggerConfigured
}) => {
  const [triggers, setTriggers] = useState<TriggerSource[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [showAddTrigger, setShowAddTrigger] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newTrigger, setNewTrigger] = useState<Partial<TriggerSource>>({
    type: 'webhook',
    enabled: true
  });

  useEffect(() => {
    loadTriggers();
    loadTemplates();
  }, [workflowId]);

  const loadTriggers = async () => {
    try {
      const response = await fetch(`/api/integrations/n8n/triggers${workflowId ? `?workflow=${workflowId}` : ''}`);
      const data = await response.json();
      setTriggers(data.triggers || []);
    } catch (error) {
      console.error('Failed to load triggers:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/workflow-templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const createTrigger = async () => {
    try {
      const response = await fetch('/api/integrations/n8n/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTrigger,
          workflowId: workflowId || selectedTemplate
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTriggers([...triggers, data.trigger]);
        setShowAddTrigger(false);
        setNewTrigger({ type: 'webhook', enabled: true });
        
        if (onTriggerConfigured) {
          onTriggerConfigured(data.trigger);
        }
      }
    } catch (error) {
      console.error('Failed to create trigger:', error);
    }
  };

  const deleteTrigger = async (triggerId: string) => {
    try {
      await fetch(`/api/integrations/n8n/triggers/${triggerId}`, {
        method: 'DELETE'
      });
      setTriggers(triggers.filter(t => t.id !== triggerId));
    } catch (error) {
      console.error('Failed to delete trigger:', error);
    }
  };

  const toggleTrigger = async (triggerId: string, enabled: boolean) => {
    try {
      await fetch(`/api/integrations/n8n/triggers/${triggerId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      setTriggers(triggers.map(t => 
        t.id === triggerId ? { ...t, enabled } : t
      ));
    } catch (error) {
      console.error('Failed to toggle trigger:', error);
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'slack': return <PersonIcon />;
      case 'webhook': return <WebhookIcon />;
      case 'cron': return <ScheduleIcon />;
      case 'manual': return <PersonIcon />;
      default: return <TriggerIcon />;
    }
  };

  const getTriggerDescription = (trigger: TriggerSource) => {
    switch (trigger.type) {
      case 'slack':
        return `Slack command: /${trigger.config?.command || 'experiment'}`;
      case 'webhook':
        return `Webhook URL: ${trigger.config?.url || 'Auto-generated'}`;
      case 'cron':
        return `Schedule: ${trigger.config?.schedule || 'Not set'}`;
      case 'manual':
        return 'Manual trigger from Canvas interface';
      default:
        return trigger.description;
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">N8N Triggers</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddTrigger(true)}
            >
              Add Trigger
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure external triggers to start workflows via n8n automation
          </Typography>

          {triggers.length === 0 ? (
            <Alert severity="info">
              No triggers configured. Add triggers to enable external workflow automation.
            </Alert>
          ) : (
            <List>
              {triggers.map((trigger) => (
                <ListItem
                  key={trigger.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemIcon>
                    {getTriggerIcon(trigger.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">{trigger.name}</Typography>
                        <Chip
                          size="small"
                          label={trigger.type}
                          color="primary"
                          variant="outlined"
                        />
                        {!trigger.enabled && (
                          <Chip
                            size="small"
                            label="Disabled"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={getTriggerDescription(trigger)}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={trigger.enabled}
                      onChange={(e) => toggleTrigger(trigger.id, e.target.checked)}
                      size="small"
                    />
                    <Tooltip title="Configure">
                      <IconButton size="small">
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => deleteTrigger(trigger.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          {/* Usage Examples */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon fontSize="small" />
              Example N8N Workflow Trigger
            </Typography>
            <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
{`// N8N HTTP Request Node
POST /api/v1/n8n/trigger-experiment
{
  "template_id": "${selectedTemplate || 'your_template'}",
  "parameters": {
    "temperature": 80,
    "duration": 300
  },
  "triggered_by": "slack_user:@alice"
}`}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Add Trigger Dialog */}
      <Dialog open={showAddTrigger} onClose={() => setShowAddTrigger(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add N8N Trigger</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Trigger Name"
              value={newTrigger.name || ''}
              onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trigger Type</InputLabel>
              <Select
                value={newTrigger.type}
                label="Trigger Type"
                onChange={(e) => setNewTrigger({ ...newTrigger, type: e.target.value as any })}
              >
                <MenuItem value="webhook">Webhook</MenuItem>
                <MenuItem value="slack">Slack Command</MenuItem>
                <MenuItem value="cron">Scheduled</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>

            {!workflowId && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Workflow Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  label="Workflow Template"
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newTrigger.description || ''}
              onChange={(e) => setNewTrigger({ ...newTrigger, description: e.target.value })}
              sx={{ mb: 2 }}
            />

            {/* Type-specific Configuration */}
            {newTrigger.type === 'slack' && (
              <TextField
                fullWidth
                label="Slack Command"
                placeholder="experiment"
                value={newTrigger.config?.command || ''}
                onChange={(e) => setNewTrigger({
                  ...newTrigger,
                  config: { ...newTrigger.config, command: e.target.value }
                })}
                sx={{ mb: 2 }}
              />
            )}

            {newTrigger.type === 'cron' && (
              <TextField
                fullWidth
                label="Cron Schedule"
                placeholder="0 9 * * 1-5"
                value={newTrigger.config?.schedule || ''}
                onChange={(e) => setNewTrigger({
                  ...newTrigger,
                  config: { ...newTrigger.config, schedule: e.target.value }
                })}
                helperText="Example: '0 9 * * 1-5' for 9 AM Monday-Friday"
                sx={{ mb: 2 }}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={newTrigger.enabled}
                  onChange={(e) => setNewTrigger({ ...newTrigger, enabled: e.target.checked })}
                />
              }
              label="Enable trigger immediately"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              After creating this trigger, you'll need to configure the corresponding n8n workflow 
              to send requests to the Canvas webhook endpoints.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddTrigger(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={createTrigger}
            disabled={!newTrigger.name || (!workflowId && !selectedTemplate)}
          >
            Create Trigger
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};