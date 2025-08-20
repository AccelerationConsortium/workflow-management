import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography, Chip, Box, Stack } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import PanToolIcon from '@mui/icons-material/PanTool';
import { NodeData } from '../../types/NodeTypes';

interface OTFlexNodeProps {
  data: NodeData & {
    operationType?: string;
    parameters?: any;
  };
  selected?: boolean;
}

const OTFlexNode: React.FC<OTFlexNodeProps> = ({ data, selected }) => {
  const getOperationIcon = () => {
    switch (data.operationType) {
      case 'otflex_liquid_transfer':
        return <WaterDropIcon sx={{ fontSize: 20, color: '#00acc1' }} />;
      case 'otflex_electrode_wash':
        return <CleaningServicesIcon sx={{ fontSize: 20, color: '#ab47bc' }} />;
      case 'otflex_gripper':
        return <PanToolIcon sx={{ fontSize: 20, color: '#ff9800' }} />;
      default:
        return <ScienceIcon sx={{ fontSize: 20, color: '#00acc1' }} />;
    }
  };

  const getOperationLabel = () => {
    switch (data.operationType) {
      case 'otflex_liquid_transfer':
        return 'Liquid Transfer';
      case 'otflex_electrode_wash':
        return 'Electrode Wash';
      case 'otflex_gripper':
        return 'Gripper Control';
      default:
        return 'OTFlex Operation';
    }
  };

  const getParameterSummary = () => {
    if (!data.parameters) return null;
    
    switch (data.operationType) {
      case 'otflex_liquid_transfer':
        const { source_well, dest_well, volume, pipette } = data.parameters;
        return (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              {source_well || 'A1'} → {dest_well || 'A1'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Volume: {volume || 100} μL
            </Typography>
            {pipette && (
              <Typography variant="caption" color="text.secondary">
                Pipette: {pipette === 'p1000_single_flex' ? 'P1000' : 'P50'}
              </Typography>
            )}
          </Stack>
        );
      case 'otflex_electrode_wash':
        const { water_volume, acid_volume, cycles } = data.parameters;
        return (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Water: {water_volume || 15} ml
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Acid: {acid_volume || 10} ml
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cycles: {cycles || 1}
            </Typography>
          </Stack>
        );
      case 'otflex_gripper':
        const { action, labware } = data.parameters;
        return (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Action: {action || 'move'}
            </Typography>
            {labware && (
              <Typography variant="caption" color="text.secondary">
                Labware: {labware}
              </Typography>
            )}
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        minWidth: 220,
        maxWidth: 300,
        backgroundColor: selected ? '#e0f7fa' : '#fff',
        border: selected ? '2px solid #00acc1' : '1px solid #e0e0e0',
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
          background: '#00acc1',
          width: 8,
          height: 8,
        }}
      />
      
      <CardContent sx={{ p: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {getOperationIcon()}
          <Typography variant="subtitle2" fontWeight="bold">
            {data.label || 'Opentrons Flex'}
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
            <Box sx={{ mt: 0.5 }}>
              {getParameterSummary()}
            </Box>
          )}
        </Box>
      </CardContent>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#00acc1',
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default OTFlexNode;