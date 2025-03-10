import React from 'react';
import { styled } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';
import { nodeStyles } from './nodeStyles';

export const NodeWrapper = styled(Box)(({ theme, category, state }) => ({
  ...nodeStyles.base,
  ...(category && nodeStyles.categories[category]),
  ...(state && nodeStyles.states[state]),
  
  // Modern internal layout
  display: 'flex',
  flexDirection: 'column',
  
  '.node-header': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    
    '.node-icon': {
      width: 28,
      height: 28,
      marginRight: 12,
      color: theme.palette.primary.main,
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
    
    '.node-title': {
      fontSize: '15px',
      fontWeight: 600,
      color: theme.palette.text.primary,
      letterSpacing: '-0.01em',
    }
  },
  
  '.node-content': {
    padding: '8px 0',
    flex: 1,
  },
  
  '.node-footer': {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: theme.palette.text.secondary,
  },
  
  // Connection point styles
  '.react-flow__handle': {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.primary.main}`,
    background: theme.palette.background.paper,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.2)',
    },
  },
  
  // Hover effect
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    '.node-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    },
  },
}));

export const BaseNode = ({ data, category, state }) => {
  return (
    <NodeWrapper category={category} state={state}>
      <div className="node-header">
        {data.icon && <data.icon className="node-icon" />}
        <Typography className="node-title" variant="h6" component="h3">
          {data.label}
        </Typography>
      </div>
      <div className="node-content">
        <Typography variant="body2">{data.description}</Typography>
      </div>
      {data.metric && (
        <div className="node-footer">
          <Typography className="metric" variant="h4" component="span">
            {data.metric}
          </Typography>
          <Typography variant="caption">{data.metricLabel}</Typography>
        </div>
      )}
    </NodeWrapper>
  );
};

