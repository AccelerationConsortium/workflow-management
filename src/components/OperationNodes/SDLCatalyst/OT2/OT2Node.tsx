import React, { useState } from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { Box, Tab, Tabs } from '@mui/material';
import { BasicConfig } from './components';
import { OT2Parameters } from './types';

// Parameter definitions
const parameters = {
  // Basic Configuration
  ipAddress: {
    type: 'string',
    label: 'IP Address',
    description: 'OT2 device IP address',
    defaultValue: '192.168.1.1',
    required: true,
    validation: (value: string) => {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(value)) {
        return 'Invalid IP address format';
      }
      return '';
    }
  },
  pipetteType: {
    type: 'string',
    label: 'Pipette Type',
    description: 'Type of pipette to use',
    options: [
      { value: 'p20_single', label: 'P20 Single-Channel' },
      { value: 'p300_single', label: 'P300 Single-Channel' },
      { value: 'p1000_single', label: 'P1000 Single-Channel' },
      { value: 'p20_multi', label: 'P20 8-Channel' },
      { value: 'p300_multi', label: 'P300 8-Channel' }
    ],
    defaultValue: 'p300_single',
    required: true
  },
  mountPosition: {
    type: 'string',
    label: 'Mount Position',
    description: 'Pipette mount position',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' }
    ],
    defaultValue: 'right',
    required: true
  },

  // Labware Configuration
  labwareConfigs: {
    type: 'array',
    label: 'Labware Configurations',
    description: 'Configure labware positions and types',
    defaultValue: [],
    required: true
  },

  // Liquid Handling
  liquidHandlingSteps: {
    type: 'array',
    label: 'Liquid Handling Steps',
    description: 'Define liquid transfer operations',
    defaultValue: [],
    required: true
  },

  // Position Offset
  positionOffset: {
    type: 'object',
    label: 'Position Offset',
    description: 'Fine-tune position adjustments',
    defaultValue: {
      x: 0,
      y: 0,
      z: 0,
      speed: 400
    },
    required: false
  },

  // Tip Management
  tipManagement: {
    type: 'object',
    label: 'Tip Management',
    description: 'Configure tip handling settings',
    defaultValue: {
      tipRacks: [],
      reuseStrategy: 'single-use'
    },
    required: true
  }
};

export const OT2Node: React.FC<NodeProps> = (props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleParameterChange = (key: string, value: any) => {
    const param = parameters[key as keyof typeof parameters];
    let error = '';

    if (param.validation) {
      error = param.validation(value);
    } else if (param.required && !value) {
      error = `${param.label} is required`;
    }

    setErrors(prev => ({
      ...prev,
      [key]: error
    }));

    if (props.data.onParameterChange) {
      props.data.onParameterChange({
        ...props.data.parameters,
        [key]: value
      });
    }
  };

  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'OT2',
        parameters,
        onParameterChange: (params) => {
          console.log('OT2 parameters changed:', params);
          if (props.data.onParameterChange) {
            props.data.onParameterChange(params);
          }
        },
        onExport: () => {
          console.log('Exporting OT2 configuration');
          if (props.data.onExport) {
            props.data.onExport();
          }
        }
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="OT2 configuration tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                py: 0,
                fontSize: '0.875rem'
              }
            }}
          >
            <Tab label="Basic" />
            <Tab label="Labware" />
            <Tab label="Liquid" />
            <Tab label="Position" />
            <Tab label="Tips" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 1 }}>
          {activeTab === 0 && (
            <BasicConfig
              parameters={props.data.parameters || {}}
              onChange={handleParameterChange}
              errors={errors}
            />
          )}
          {activeTab === 1 && <div>Labware Configuration</div>}
          {activeTab === 2 && <div>Liquid Handling</div>}
          {activeTab === 3 && <div>Position Offset</div>}
          {activeTab === 4 && <div>Tip Management</div>}
        </Box>
      </Box>
    </BaseUONode>
  );
}; 
