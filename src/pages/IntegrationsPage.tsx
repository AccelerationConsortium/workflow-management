import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert
} from '@mui/material';
import {
  Extension as IntegrationIcon,
  CloudDone as ConnectedIcon,
  CloudOff as DisconnectedIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { N8NIntegrationPanel } from '../components/IntegrationPanel/N8NIntegrationPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const integrationsList = [
  {
    id: 'n8n',
    name: 'N8N Automation',
    description: 'Workflow automation and notification platform',
    status: 'available',
    category: 'Automation',
    logo: '/integrations/n8n-logo.svg',
    features: ['Experiment Notifications', 'Alert Management', 'Workflow Triggers', 'Report Distribution']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    status: 'coming_soon',
    category: 'Communication',
    logo: '/integrations/slack-logo.svg',
    features: ['Direct Messages', 'Channel Notifications', 'Interactive Commands']
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'SMTP email integration for notifications',
    status: 'coming_soon',
    category: 'Communication',
    logo: '/integrations/email-logo.svg',
    features: ['Status Notifications', 'Report Delivery', 'Alert Emails']
  },
  {
    id: 'webhooks',
    name: 'Generic Webhooks',
    description: 'Custom webhook integrations',
    status: 'coming_soon',
    category: 'API',
    logo: '/integrations/webhook-logo.svg',
    features: ['Custom Endpoints', 'Payload Templates', 'Authentication']
  }
];

export const IntegrationsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const availableIntegrations = integrationsList.filter(i => i.status === 'available');
  const comingSoonIntegrations = integrationsList.filter(i => i.status === 'coming_soon');

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IntegrationIcon fontSize="large" />
            Integrations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect Canvas with external services to automate workflows and enhance collaboration
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Available Integrations" />
            <Tab label="Configure N8N" />
            <Tab label="Coming Soon" />
          </Tabs>
        </Box>

        {/* Available Integrations */}
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={3}>
            {availableIntegrations.map((integration) => (
              <Grid item xs={12} md={6} lg={4} key={integration.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <img 
                        src={integration.logo} 
                        alt={integration.name}
                        style={{ width: 40, height: 40, marginRight: 16 }}
                      />
                      <Box>
                        <Typography variant="h6">{integration.name}</Typography>
                        <Chip 
                          size="small" 
                          label={integration.category} 
                          color="primary" 
                          variant="outlined" 
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {integration.description}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Features:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {integration.features.map((feature, index) => (
                        <Chip
                          key={index}
                          size="small"
                          label={feature}
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ConnectedIcon color="success" fontSize="small" />
                        <Typography variant="caption" color="success.main">
                          Available
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => setSelectedTab(1)}
                      >
                        Configure
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {availableIntegrations.length === 0 && (
            <Alert severity="info">
              No integrations are currently available. Check back soon for new integrations.
            </Alert>
          )}
        </TabPanel>

        {/* N8N Configuration */}
        <TabPanel value={selectedTab} index={1}>
          <N8NIntegrationPanel />
        </TabPanel>

        {/* Coming Soon */}
        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={3}>
            {comingSoonIntegrations.map((integration) => (
              <Grid item xs={12} md={6} lg={4} key={integration.id}>
                <Card sx={{ height: '100%', opacity: 0.7 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <img 
                        src={integration.logo} 
                        alt={integration.name}
                        style={{ width: 40, height: 40, marginRight: 16, filter: 'grayscale(100%)' }}
                      />
                      <Box>
                        <Typography variant="h6">{integration.name}</Typography>
                        <Chip 
                          size="small" 
                          label={integration.category} 
                          variant="outlined" 
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {integration.description}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Planned Features:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {integration.features.map((feature, index) => (
                        <Chip
                          key={index}
                          size="small"
                          label={feature}
                          variant="outlined"
                          disabled
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DisconnectedIcon color="disabled" fontSize="small" />
                      <Typography variant="caption" color="text.disabled">
                        Coming Soon
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            These integrations are planned for future releases. 
            Have a specific integration request? Contact the development team.
          </Alert>
        </TabPanel>
      </Box>
    </Container>
  );
};