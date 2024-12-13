import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { ShortcutHint } from '../services/shortcutHintService';

interface ShortcutHintPanelProps {
  shortcuts: Record<string, ShortcutHint[]>;
}

export const ShortcutHintPanel: React.FC<ShortcutHintPanelProps> = ({
  shortcuts
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <Paper sx={{ maxWidth: 400 }}>
      {Object.entries(shortcuts).map(([category, hints]) => (
        <Box key={category}>
          <ListItem
            button
            onClick={() => setExpandedCategory(
              expandedCategory === category ? null : category
            )}
          >
            <ListItemText
              primary={category.charAt(0).toUpperCase() + category.slice(1)}
            />
            <IconButton edge="end" size="small">
              {expandedCategory === category ? 
                <ExpandLessIcon /> : 
                <ExpandMoreIcon />
              }
            </IconButton>
          </ListItem>
          <Collapse in={expandedCategory === category}>
            <List dense>
              {hints.map((hint) => (
                <ListItem key={hint.key}>
                  <ListItemText
                    primary={hint.description}
                    secondary={
                      <Box
                        component="span"
                        sx={{
                          backgroundColor: 'action.hover',
                          px: 1,
                          borderRadius: 1,
                          fontSize: '0.875rem'
                        }}
                      >
                        {hint.key}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
          <Divider />
        </Box>
      ))}
    </Paper>
  );
}; 