import React, { useState, useMemo } from 'react';
import { useDnD } from '../context/DnDContext';
import { operationNodes, OperationNode } from '../data/operationNodes';
import './Sidebar.css';

interface CategoryGroupProps {
  title: string;
  nodes: OperationNode[];
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  onDragEnd: () => void;
  color: string;
}

const formatCategory = (category: string) => {
  const words = category.split(' & ');
  return (
    <>
      {words.map((word, index) => (
        <span key={index}>{word}</span>
      ))}
    </>
  );
};

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  title,
  nodes,
  onDragStart,
  onDragEnd,
  color,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="category-group">
      <div 
        className="category-group-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <span className="category-group-title">{title}</span>
        <span className={`category-group-icon ${isExpanded ? 'expanded' : ''}`}>
          ▶
        </span>
      </div>
      <div className={`category-group-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {nodes.map((node) => (
          <div
            key={node.type}
            className="operation-node"
            onDragStart={(e) => onDragStart(e, node.type)}
            onDragEnd={onDragEnd}
            draggable
          >
            <div className="operation-info">
              <div className="operation-title">{node.label}</div>
              <div className="operation-description">{node.description}</div>
            </div>
            <div className={`operation-category category-${node.category.replace(/\s+&?\s+/g, '-')}`}>
              {formatCategory(node.category)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Sidebar() {
  const [, setType] = useDnD();
  const [searchTerm, setSearchTerm] = useState('');

  // 按类别分组节点
  const groupedNodes = useMemo(() => {
    const groups = new Map<string, OperationNode[]>();
    operationNodes.forEach(node => {
      if (!node.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }
      const group = groups.get(node.category) || [];
      group.push(node);
      groups.set(node.category, group);
    });
    return groups;
  }, [searchTerm]);

  // 类别颜色映射
  const categoryColors = {
    'Sample Processing': '#C4395E',
    'Analysis & Measurement': '#AEC17B',
    'Reaction Control': '#F0CA50',
    'Separation & Purification': '#E07B42',
    'Data Acquisition': '#89A7C2',
    'Environment Control': '#4BBCD4',
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    setType(nodeType);
  };

  const onDragEnd = () => {
    setType(null);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Laboratory Automation Components</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="nodes-container">
        {Array.from(groupedNodes.entries()).map(([category, nodes]) => (
          <CategoryGroup
            key={category}
            title={category}
            nodes={nodes}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            color={categoryColors[category]}
          />
        ))}
      </div>
    </aside>
  );
} 