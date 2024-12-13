import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Undo as UndoIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { OperationGroup } from '../services/historyGroupingService';

interface OperationHistoryPanelProps {
  groups: OperationGroup[];
  onUndo: (groupId: string) => void;
}

export const OperationHistoryPanel: React.FC<OperationHistoryPanelProps> = ({
  groups,
  onUndo
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getCategoryColor = (category: OperationGroup['category']): string => {
    const colors: Record<string, string> = {
      parameter: 'primary',
      structure: 'secondary',
      workflow: 'success',
      environment: 'warning'
    };
    return colors[category] || 'default';
  };

  return (
    <Paper sx={{ maxWidth: 400, maxHeight: 500, overflow: 'auto' }}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Operation History
        </Typography>
        <List>
          {groups.map((group) => (
            <ListItem
              key={group.id}
              secondaryAction={
                group.canUndo && (
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onUndo(group.id)}
                  >
                    <UndoIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {group.name}
                    <Chip
                      label={group.category}
                      size="small"
                      color={getCategoryColor(group.category)}
                    />
                  </Box>
                }
                secondary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="caption">
                      {formatTime(group.timestamp)}
                    </Typography>
                  </Box>
                }
              />
              <Tooltip title={group.description}>
                <Box component="span" ml={1}>
                  <IconButton size="small">
                    <TimeIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
}; 