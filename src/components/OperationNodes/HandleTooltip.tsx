import React, { useState } from 'react';
import { Tooltip, Box } from '@mui/material';
import { Handle, Position } from 'reactflow';

interface EnhancedHandleProps {
  type: 'source' | 'target';
  position: Position;
  id: string;
  nodeId: string;
  color: string;
  label?: string;
  style?: React.CSSProperties;
}

export const EnhancedHandle: React.FC<EnhancedHandleProps> = ({
  type,
  position,
  id,
  nodeId,
  color,
  label,
  style = {},
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const tooltipTitle = label || (type === 'target' ? 'Input Connection Point' : 'Output Connection Point');
  const instruction = type === 'target' 
    ? 'Drag from another node\'s output to connect here'
    : 'Drag from here to another node\'s input to connect';

  const handleStyle: React.CSSProperties = {
    background: '#fff',
    border: `3px solid ${color}`,
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    zIndex: 10,
    boxShadow: `0 2px 8px ${color}33`,
    transition: 'all 0.2s ease',
    cursor: 'crosshair',
    ...style,
  };

  const hoverStyle: React.CSSProperties = {
    transform: 'scale(1.3)',
    background: color,
    boxShadow: `0 4px 12px ${color}80`,
  };

  const connectingStyle: React.CSSProperties = {
    transform: 'scale(1.4)',
    background: color,
    boxShadow: `0 6px 16px ${color}99`,
    animation: `pulse-${nodeId} 1s infinite`,
  };

  return (
    <Tooltip
      title={
        <Box>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltipTitle}
          </div>
          <div style={{ fontSize: '0.8em', opacity: 0.9 }}>
            {instruction}
          </div>
        </Box>
      }
      placement={position === Position.Top ? 'top' : 'bottom'}
      arrow
      enterDelay={500}
      leaveDelay={200}
    >
      <Handle
        type={type}
        position={position}
        id={id}
        style={{
          ...handleStyle,
          ...(isHovered ? hoverStyle : {}),
          ...(isConnecting ? connectingStyle : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onConnectStart={() => setIsConnecting(true)}
        onConnectEnd={() => setIsConnecting(false)}
      />
    </Tooltip>
  );
};

// Helper function to create enhanced handles with consistent styling
export const createEnhancedHandle = (
  type: 'source' | 'target',
  position: Position,
  nodeId: string,
  color: string,
  label?: string
) => {
  const id = `${nodeId}-${type}`;
  
  return (
    <EnhancedHandle
      type={type}
      position={position}
      id={id}
      nodeId={nodeId}
      color={color}
      label={label}
    />
  );
};

// Color constants for different SDL types
export const SDL_COLORS = {
  SDL1: '#e91e63',
  SDL2: '#4BBCD4', 
  SDL7: '#6b46c1',
} as const;
