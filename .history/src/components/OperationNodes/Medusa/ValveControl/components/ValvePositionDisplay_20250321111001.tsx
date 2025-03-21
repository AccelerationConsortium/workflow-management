import React from 'react';
import { PORT_LABELS, FLOW_PATHS } from '../constants';

interface ValvePositionDisplayProps {
  currentPosition: number;
  isMoving: boolean;
  flowPath: keyof typeof FLOW_PATHS;
}

export const ValvePositionDisplay: React.FC<ValvePositionDisplayProps> = ({
  currentPosition,
  isMoving,
  flowPath
}) => {
  const renderPort = (label: string, index: number) => {
    const isActive = FLOW_PATHS[flowPath].from === label || FLOW_PATHS[flowPath].to === label;
    const angle = (360 / PORT_LABELS.length) * index;
    const radius = 60;
    const x = radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = radius * Math.sin((angle - 90) * Math.PI / 180);

    return (
      <g key={label} transform={`translate(${x + 80}, ${y + 80})`}>
        <circle
          r="15"
          className={`valve-port ${isActive ? 'active' : ''}`}
        />
        <text
          className="port-label"
          dy=".3em"
          textAnchor="middle"
        >
          {label}
        </text>
      </g>
    );
  };

  const renderFlowPath = () => {
    const { from, to } = FLOW_PATHS[flowPath];
    const fromIndex = PORT_LABELS.indexOf(from);
    const toIndex = PORT_LABELS.indexOf(to);
    const fromAngle = (360 / PORT_LABELS.length) * fromIndex;
    const toAngle = (360 / PORT_LABELS.length) * toIndex;
    const radius = 30;

    const fromX = radius * Math.cos((fromAngle - 90) * Math.PI / 180);
    const fromY = radius * Math.sin((fromAngle - 90) * Math.PI / 180);
    const toX = radius * Math.cos((toAngle - 90) * Math.PI / 180);
    const toY = radius * Math.sin((toAngle - 90) * Math.PI / 180);

    return (
      <line
        x1={fromX + 80}
        y1={fromY + 80}
        x2={toX + 80}
        y2={toY + 80}
        className={`flow-path ${isMoving ? 'moving' : ''}`}
      />
    );
  };

  return (
    <div className="valve-position-display">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* 外圈 */}
        <circle
          cx="80"
          cy="80"
          r="75"
          className="valve-outline"
        />
        
        {/* 端口 */}
        {PORT_LABELS.map((label, index) => renderPort(label, index))}
        
        {/* 流路 */}
        {renderFlowPath()}
        
        {/* 中心点 */}
        <circle
          cx="80"
          cy="80"
          r="10"
          className={`valve-center ${isMoving ? 'moving' : ''}`}
        />
        
        {/* 位置标签 */}
        <text
          x="80"
          y="80"
          dy=".3em"
          textAnchor="middle"
          className="position-label"
        >
          {currentPosition}
        </text>
      </svg>
    </div>
  );
}; 
