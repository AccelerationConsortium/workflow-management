import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Button, Container } from '@mui/material';
import { testNodes } from '../data/testNode';
import { BaseNode } from './nodes/BaseNode';
import { CanvasContainer } from './Canvas/CanvasContainer';

// 注册节点类型
const nodeTypes = {
  baseNode: BaseNode,
};

const TestStylePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ height: '100vh', py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Style Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        This page displays test nodes with different categories to verify styling.
      </Typography>
      
      <Box sx={{ height: 'calc(100vh - 200px)', border: '1px solid #eee' }}>
        <CanvasContainer>
          <ReactFlow
            nodes={testNodes}
            edges={[]}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </CanvasContainer>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained">Test Button</Button>
        <Button variant="outlined">Secondary Button</Button>
      </Box>
    </Container>
  );
};

export default TestStylePage; 
