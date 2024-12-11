import React, { useState } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { EdgeConfig } from '../EdgeConfig';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {data?.mode && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 12 }}
            startOffset="50%"
            textAnchor="middle"
          >
            {data.mode}
          </textPath>
        </text>
      )}
      {isHovered && (
        <g className="edge-buttons" transform={`translate(${labelX},${labelY})`}>
          <foreignObject width={20} height={20}>
            <div className="edge-button">⚙️</div>
          </foreignObject>
        </g>
      )}
    </>
  );
} 