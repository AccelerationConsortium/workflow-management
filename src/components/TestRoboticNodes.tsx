import React from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { RoboticControlNodes } from './OperationNodes/RoboticControl';
import { Box, Typography } from '@mui/material';

const initialNodes: Node[] = [
  {
    id: 'robot_move_to_1',
    type: 'robot_move_to',
    position: { x: 50, y: 50 },
    data: {
      label: 'Robot Move To',
      robotType: 'UR3e',
      x: 100,
      y: 200,
      z: 150,
      speed: 100,
      motionType: 'linear'
    }
  },
  {
    id: 'robot_pick_1',
    type: 'robot_pick',
    position: { x: 350, y: 50 },
    data: {
      label: 'Robot Pick',
      robotType: 'UR3e',
      x: 100,
      y: 200,
      z: 50,
      objectId: 'vial_001',
      gripForce: 60
    }
  },
  {
    id: 'robot_place_1',
    type: 'robot_place',
    position: { x: 650, y: 50 },
    data: {
      label: 'Robot Place',
      robotType: 'UR3e',
      x: 300,
      y: 100,
      z: 50,
      objectId: 'vial_001'
    }
  },
  {
    id: 'robot_home_1',
    type: 'robot_home',
    position: { x: 50, y: 300 },
    data: {
      label: 'Robot Home',
      robotType: 'UR3e',
      reason: 'Return to safe position'
    }
  },
  {
    id: 'robot_execute_sequence_1',
    type: 'robot_execute_sequence',
    position: { x: 350, y: 300 },
    data: {
      label: 'Robot Execute Sequence',
      robotType: 'UR3e',
      sequenceName: 'pick_and_place_routine',
      loops: 3
    }
  },
  {
    id: 'robot_wait_1',
    type: 'robot_wait',
    position: { x: 650, y: 300 },
    data: {
      label: 'Robot Wait',
      robotType: 'UR3e',
      duration: 5,
      reason: 'Wait for reaction'
    }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'robot_move_to_1',
    target: 'robot_pick_1',
    type: 'default'
  },
  {
    id: 'e2-3',
    source: 'robot_pick_1',
    target: 'robot_place_1',
    type: 'default'
  }
];

const TestRoboticNodes: React.FC = () => {
  return (
    <Box sx={{ width: '100vw', height: '100vh' }}>
      <Typography variant="h4" sx={{ p: 2 }}>
        Robotic Control Nodes Test
      </Typography>
      <Box sx={{ width: '100%', height: 'calc(100% - 80px)' }}>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={RoboticControlNodes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default TestRoboticNodes;