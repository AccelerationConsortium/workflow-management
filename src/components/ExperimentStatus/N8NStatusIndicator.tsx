import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Badge
} from '@mui/material';
import {
  CloudDone as CloudIcon,
  CloudOff as CloudOffIcon,
  Notifications as NotifyIcon,
  Warning as AlertIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

interface N8NNotification {
  id: string;
  type: 'notification' | 'alert' | 'trigger';
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
  message: string;
}

interface N8NStatusIndicatorProps {
  experimentId: string;
  isEnabled?: boolean;
  className?: string;
}

export const N8NStatusIndicator: React.FC<N8NStatusIndicatorProps> = ({
  experimentId,
  isEnabled = false,
  className
}) => {
  const [notifications, setNotifications] = useState<N8NNotification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
    if (isEnabled && experimentId) {
      loadNotifications();
      checkConnectionStatus();
    }
  }, [experimentId, isEnabled]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/integrations/n8n/notifications/${experimentId}`);
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to load N8N notifications:', error);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/integrations/n8n/status');
      const data = await response.json();
      setConnectionStatus(data.status);
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const resendNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/integrations/n8n/notifications/${notificationId}/resend`, {
        method: 'POST'
      });
      loadNotifications(); // Refresh
      handleClose();
    } catch (error) {
      console.error('Failed to resend notification:', error);
    }
  };

  const getStatusIcon = () => {
    if (!isEnabled) return <CloudOffIcon color="disabled" />;
    
    switch (connectionStatus) {
      case 'connected':
        return <CloudIcon color="success" />;
      case 'error':
        return <CloudIcon color="error" />;
      default:
        return <CloudIcon color="disabled" />;
    }
  };

  const getStatusColor = () => {
    if (!isEnabled) return 'default';
    
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const pendingCount = notifications.filter(n => n.status === 'pending').length;
  const failedCount = notifications.filter(n => n.status === 'failed').length;

  if (!isEnabled) {
    return (
      <Tooltip title="N8N integration disabled">
        <Chip
          size="small"
          icon={<CloudOffIcon />}
          label="N8N Off"
          variant="outlined"
          className={className}
        />
      </Tooltip>
    );
  }

  return (
    <Box className={className}>
      <Tooltip title={`N8N Integration - ${connectionStatus}`}>
        <IconButton
          size="small"
          onClick={handleClick}
          color={getStatusColor() as any}
        >
          <Badge
            badgeContent={failedCount > 0 ? failedCount : pendingCount}
            color={failedCount > 0 ? 'error' : 'warning'}
            invisible={pendingCount === 0 && failedCount === 0}
          >
            {getStatusIcon()}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { minWidth: 300 } }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            {getStatusIcon()}
          </ListItemIcon>
          <ListItemText
            primary="N8N Integration"
            secondary={`Status: ${connectionStatus}`}
          />
        </MenuItem>
        
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="No notifications sent" />
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => notification.status === 'failed' && resendNotification(notification.id)}
              sx={{ 
                cursor: notification.status === 'failed' ? 'pointer' : 'default',
                '&:hover': notification.status === 'failed' ? {} : { backgroundColor: 'transparent' }
              }}
            >
              <ListItemIcon>
                {notification.status === 'sent' && <SuccessIcon color="success" />}
                {notification.status === 'pending' && <ScheduleIcon color="warning" />}
                {notification.status === 'failed' && <ErrorIcon color="error" />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {notification.type === 'notification' && <NotifyIcon fontSize="small" />}
                    {notification.type === 'alert' && <AlertIcon fontSize="small" />}
                    {notification.type === 'trigger' && <SendIcon fontSize="small" />}
                    <Typography variant="body2">
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                    {notification.status === 'failed' && (
                      <Typography variant="caption" color="error" display="block">
                        Click to retry
                      </Typography>
                    )}
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}

        {notifications.length > 5 && (
          <>
            <Divider />
            <MenuItem onClick={handleClose}>
              <ListItemText 
                primary={`View all ${notifications.length} notifications`}
                sx={{ textAlign: 'center' }}
              />
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};