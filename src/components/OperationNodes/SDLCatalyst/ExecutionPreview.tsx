import React, { useState } from 'react';
import { Box, Typography, IconButton, Collapse, Chip } from '@mui/material';
import { ExpandMore, ExpandLess, PlayArrow } from '@mui/icons-material';

interface ExecutionStep {
  operation: string;
  condition?: string;
  description?: string;
  step?: number;
  estimatedDuration?: number;
}

interface ExecutionPreviewProps {
  steps: ExecutionStep[];
  parameters?: Record<string, any>;
}

export const ExecutionPreview: React.FC<ExecutionPreviewProps> = ({ steps, parameters }) => {
  const [expanded, setExpanded] = useState(false);

  const isStepActive = (step: ExecutionStep): boolean => {
    if (!step.condition || !parameters) return true;
    
    const conditionParts = step.condition.split(' == ');
    if (conditionParts.length !== 2) return true;
    
    const [paramName, expectedValue] = conditionParts;
    const actualValue = parameters[paramName.trim()];
    const expected = expectedValue.trim() === 'true' ? true : expectedValue.trim() === 'false' ? false : expectedValue.trim();
    
    return actualValue === expected;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const totalDuration = steps
    .filter(step => isStepActive(step))
    .reduce((sum, step) => sum + (step.estimatedDuration || 0), 0);

  return (
    <Box sx={{ mb: 1 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          p: 0.5,
          borderRadius: 1
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <PlayArrow sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ flexGrow: 1 }}>
          Execution Preview ({steps.filter(s => isStepActive(s)).length} steps, ~{formatDuration(totalDuration)})
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ pl: 3, pt: 1 }}>
          {steps.map((step, index) => {
            const isActive = isStepActive(step);
            return (
              <Box key={index} sx={{ mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      minWidth: 20, 
                      color: isActive ? 'text.primary' : 'text.disabled',
                      fontWeight: isActive ? 500 : 400
                    }}
                  >
                    {step.step || index + 1}.
                  </Typography>
                  <Chip
                    label={step.operation}
                    size="small"
                    variant={isActive ? "outlined" : "filled"}
                    sx={{ 
                      ml: 1, 
                      height: 20, 
                      fontSize: '0.7rem',
                      opacity: isActive ? 1 : 0.5,
                      backgroundColor: isActive ? undefined : 'grey.200'
                    }}
                  />
                  {step.estimatedDuration && (
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      ({formatDuration(step.estimatedDuration)})
                    </Typography>
                  )}
                  {step.condition && (
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                      if {step.condition}
                    </Typography>
                  )}
                </Box>
                {step.description && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      ml: 3, 
                      color: 'text.secondary', 
                      display: 'block',
                      opacity: isActive ? 1 : 0.5
                    }}
                  >
                    → {step.description}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
};