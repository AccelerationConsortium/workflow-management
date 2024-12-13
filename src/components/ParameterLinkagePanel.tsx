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
import { Check as CheckIcon, Info as InfoIcon } from '@mui/icons-material';
import { ParameterImpact } from '../services/parameterLinkageService';

interface ParameterLinkagePanelProps {
  impacts: ParameterImpact[];
  onApply: (paramId: string, value: number) => void;
}

export const ParameterLinkagePanel: React.FC<ParameterLinkagePanelProps> = ({
  impacts,
  onApply
}) => {
  if (!impacts.length) {
    return (
      <Box p={2}>
        <Typography color="text.secondary" align="center">
          No parameter impacts to show
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {impacts.map((impact) => (
        <ListItem
          key={impact.paramId}
          secondaryAction={
            <IconButton 
              size="small" 
              onClick={() => onApply(impact.paramId, impact.suggestedValue)}
              color="primary"
            >
              <CheckIcon />
            </IconButton>
          }
        >
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2">
                  {impact.paramId}
                </Typography>
                <Chip
                  label={`${impact.suggestedValue}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Tooltip title={impact.reason}>
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current: {impact.currentValue}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Confidence:
                  </Typography>
                  <Box
                    sx={{
                      width: 100,
                      height: 4,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${impact.confidence * 100}%`,
                        bgcolor: 'primary.main',
                        borderRadius: 2
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(impact.confidence * 100)}%
                  </Typography>
                </Box>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}; 