import React, { useState } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { Box, Tooltip } from '@mui/material';
import { ConditionType } from '../EdgeConfig';

interface ConditionalEdgeProps extends EdgeProps {
  data?: {
    condition?: {
      type: ConditionType;
      caseId?: string;
      description?: string;
    };
  };
}

export const ConditionalEdge: React.FC<ConditionalEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // get edge path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  // compute edge style based on condition type
  const getEdgeStyle = () => {
    const conditionType = data?.condition?.type || 'boolean';
    
    let strokeColor = '#000';
    let strokeWidth = 2;
    let strokeDasharray = '';
    
    if (conditionType === 'boolean') {
      strokeColor = '#10b981'; // 绿色
    } else if (conditionType === 'switch') {
      strokeColor = '#6366f1'; // 紫色
    }
    
    return {
      ...style,
      stroke: strokeColor,
      strokeWidth,
      strokeDasharray,
    };
  };
  
  // get label text
  const getLabelText = () => {
    const conditionType = data?.condition?.type || 'boolean';
    
    if (conditionType === 'boolean') {
      return 'Boolean';
    } else if (conditionType === 'switch') {
      return `Switch: ${data?.condition?.caseId || ''}`;
    }
    
    return '';
  };
  
  return (
    <>
      <path
        id={id}
        style={getEdgeStyle()}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* edge label */}
      <text>
        <textPath
          href={`#${id}`}
          style={{ 
            fontSize: '10px',
            fill: getEdgeStyle().stroke,
            fontWeight: 'bold'
          }}
          startOffset="50%"
          textAnchor="middle"
          dominantBaseline="central"
          dy={-4}
        >
          {getLabelText()}
        </textPath>
      </text>
      
      {/* node description tooltip */}
      {isHovered && data?.condition?.description && (
        <foreignObject
          width={120}
          height={40}
          x={labelX - 60}
          y={labelY - 20}
          className="edge-tooltip"
        >
          <Tooltip title={data.condition.description} open={true} placement="top">
            <Box sx={{ width: '100%', height: '100%' }}></Box>
          </Tooltip>
        </foreignObject>
      )}
    </>
  );
};

export default ConditionalEdge;
