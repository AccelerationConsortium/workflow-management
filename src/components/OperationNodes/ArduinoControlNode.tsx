import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import VibrationIcon from '@mui/icons-material/Vibration';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { NodeData } from '../../types/NodeTypes';

interface ArduinoControlNodeProps {
  data: NodeData & {
    operationType?: string;
    parameters?: any;
  };
  selected?: boolean;
}

const ArduinoControlNode: React.FC<ArduinoControlNodeProps> = ({ data, selected }) => {
  const getOperationIcon = () => {
    switch (data.operationType) {
      case 'arduino_pump':
        return <LocalDrinkIcon sx={{ fontSize: 20, color: '#4fc3f7' }} />;
      case 'arduino_temperature':
        return <ThermostatIcon sx={{ fontSize: 20, color: '#ff7043' }} />;
      case 'arduino_ultrasonic':
        return <VibrationIcon sx={{ fontSize: 20, color: '#9c27b0' }} />;
      case 'arduino_furnace':
        return <WhatshotIcon sx={{ fontSize: 20, color: '#ff5722' }} />;
      case 'arduino_electrode':
        return <FlashOnIcon sx={{ fontSize: 20, color: '#ffc107' }} />;
      default:
        return <MemoryIcon sx={{ fontSize: 20, color: '#66bb6a' }} />;
    }
  };

  const getOperationLabel = () => {
    switch (data.operationType) {
      case 'arduino_pump':
        return 'Pump Control';
      case 'arduino_temperature':
        return 'Temperature Control';
      case 'arduino_ultrasonic':
        return 'Ultrasonic Control';
      case 'arduino_furnace':
        return 'Furnace Control';
      case 'arduino_electrode':
        return 'Electrode Switch';
      case 'arduino_reactor':
        return 'Reactor Control';
      default:
        return 'Arduino Control';
    }
  };

  const getParameterSummary = () => {
    if (!data.parameters) return null;
    
    switch (data.operationType) {
      case 'arduino_pump':
        const { pump_number, volume, mode } = data.parameters;
        if (mode === 'dispense') {
          return `Pump ${pump_number || 0}: ${volume || 0} ml`;
        }
        return `Pump ${pump_number || 0}: ${mode || 'off'}`;
      case 'arduino_temperature':
        const { base_number, temperature } = data.parameters;
        return `Base ${base_number || 0}: ${temperature || 25}°C`;
      case 'arduino_ultrasonic':
        const { base_number: base, duration } = data.parameters;
        return `Base ${base || 0}: ${(duration || 5000) / 1000}s`;
      case 'arduino_furnace':
        return `Furnace: ${data.parameters.action || 'open'}`;
      case 'arduino_electrode':
        return `Mode: ${data.parameters.mode || '3-electrode'}`;
      case 'arduino_reactor':
        return `Reactor: ${data.parameters.action || 'open'}`;
      default:
        return null;
    }
  };

  const getChipColor = () => {
    switch (data.operationType) {
      case 'arduino_pump':
        return 'info';
      case 'arduino_temperature':
        return 'error';
      case 'arduino_ultrasonic':
        return 'secondary';
      case 'arduino_furnace':
        return 'warning';
      case 'arduino_electrode':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Card
      sx={{
        minWidth: 200,
        maxWidth: 280,
        backgroundColor: selected ? '#e8f5e9' : '#fff',
        border: selected ? '2px solid #66bb6a' : '1px solid #e0e0e0',
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
          background: '#66bb6a',
          width: 8,
          height: 8,
        }}
      />
      
      <CardContent sx={{ p: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {getOperationIcon()}
          <Typography variant="subtitle2" fontWeight="bold">
            {data.label || 'Arduino Controller'}
          </Typography>
        </Box>
        
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Chip
            label={getOperationLabel()}
            size="small"
            color={getChipColor()}
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          
          {data.parameters && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {getParameterSummary()}
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#66bb6a',
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default ArduinoControlNode;