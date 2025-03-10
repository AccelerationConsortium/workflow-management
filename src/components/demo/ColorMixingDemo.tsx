// 演示专用的容器组件
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ReactFlow } from 'reactflow';
import { useColorMixingDemo } from '../../hooks/demo/useColorMixingDemo';

export const ColorMixingDemo = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onParameterChange,
    status,
    results
  } = useColorMixingDemo();

  return (
    <Box>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
      <DemoStatusPanel status={status} results={results} />
    </Box>
  );
}; 