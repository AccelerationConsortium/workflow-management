import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { BaseRoboticNode } from './OperationNodes/RoboticControl/BaseRoboticNode';
import { PARAMETERS as MOVE_TO_PARAMETERS } from './OperationNodes/RoboticControl/RobotMoveTo/constants';

const TestRobotParameters: React.FC = () => {
  const [nodeData, setNodeData] = useState({
    robotType: 'UR3e',
    x: 100,
    y: 200,
    z: 150,
    rx: 0,
    ry: 0,
    rz: 0,
    speed: 100,
    motionType: 'linear',
    waitAfter: 0,
    safeMode: true
  });

  const handleParameterChange = (paramName: string, value: any) => {
    console.log(`Parameter ${paramName} changed to:`, value);
    setNodeData(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const testNodeProps = {
    id: 'test-robot-move-to',
    type: 'robot_move_to',
    position: { x: 0, y: 0 },
    data: {
      label: 'Test Robot Move To',
      description: 'Test all parameter types',
      icon: '🎯',
      nodeType: 'robot_move_to',
      parameters: MOVE_TO_PARAMETERS,
      values: nodeData,
      onParameterChange: handleParameterChange,
      ...nodeData
    },
    selected: false
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Robot Control Parameters Test
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.href = '/'}
        >
          回到主界面
        </Button>
      </Box>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Parameter Values:
        </Typography>
        <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(nodeData, null, 2)}
        </pre>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <BaseRoboticNode {...testNodeProps} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Instructions:
        </Typography>
        <ul>
          <li><strong>下拉菜单 (Robot Type, Motion Type):</strong> 点击向下箭头应该能看到选项列表</li>
          <li><strong>开关 (Safe Mode 等):</strong> 点击开关应该能切换状态</li>
          <li><strong>数字输入 (X, Y, Z, Speed 等):</strong> 应该能够手动输入数字，不应该有持续变化的箭头</li>
          <li><strong>文本输入:</strong> 应该能正常输入文本</li>
          <li><strong>Accordion:</strong> 点击 "Parameters" 标题应该展开/收起，点击参数控件不应该影响展开状态</li>
        </ul>
      </Box>
    </Box>
  );
};

export default TestRobotParameters;