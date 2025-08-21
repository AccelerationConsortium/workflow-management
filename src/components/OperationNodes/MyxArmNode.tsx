import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { NodeData } from '../../types/NodeTypes';

interface MyxArmNodeProps {
  data: NodeData & {
    operationType?: string;
    parameters?: any;
  };
  selected?: boolean;
}

const MyxArmNode: React.FC<MyxArmNodeProps> = ({ data, selected }) => {
  const getOperationLabel = () => {
    switch (data.operationType) {
      case 'myxarm_move_position':
        return 'Move to Position';
      case 'myxarm_move_angles':
        return 'Move to Angles';
      case 'myxarm_gripper':
        return 'Gripper Control';
      default:
        return 'MyxArm Operation';
    }
  };

  const getParameterSummary = () => {
    if (!data.parameters) return null;
    
    switch (data.operationType) {
      case 'myxarm_move_position':
        const { x, y, z } = data.parameters;
        return `Position: (${x || 0}, ${y || 0}, ${z || 0}) mm`;
      case 'myxarm_move_angles':
        const { j1, j2, j3 } = data.parameters;
        return `Angles: J1=${j1 || 0}°, J2=${j2 || 0}°, J3=${j3 || 0}°`;
      case 'myxarm_gripper':
        const { position } = data.parameters;
        return `Gripper: ${position || 500} pulse`;
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        minWidth: 200,
        maxWidth: 280,
        backgroundColor: selected ? '#e3f2fd' : '#fff',
        border: selected ? '2px solid #2196f3' : '1px solid #e0e0e0',
        borderRadius: 2,
        boxShadow: selected ? 3 : 1,
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#2196f3',
          width: 8,
          height: 8,
        }}
      />
      
      <CardContent sx={{ p: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <PrecisionManufacturingIcon sx={{ fontSize: 20, color: '#ff6b6b' }} />
          <Typography variant="subtitle2" fontWeight="bold">
            {data.label || 'MyxArm Robot'}
          </Typography>
        </Box>
        
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Chip
            label={getOperationLabel()}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          
          {data.parameters && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {getParameterSummary()}
            </Typography>
          )}
          
          {data.parameters?.speed && (
            <Typography variant="caption" color="text.secondary">
              Speed: {data.parameters.speed} mm/s
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#2196f3',
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default MyxArmNode;