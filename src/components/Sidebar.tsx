import React, { useState, useMemo, useEffect } from 'react';
import { useDnD } from '../context/DnDContext';
import { operationNodes, OperationNode } from '../data/operationNodes';
import { SearchPanel } from './SearchPanel';
import './Sidebar.css';
import { Box } from '@mui/material';

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
        {nodes.map((node, index) => (
          <div
            key={`${title}-${node.type}-${index}`}
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

const Sidebar: React.FC = () => {
  const [, setType] = useDnD();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMacCmd = e.metaKey && !e.ctrlKey;
      const isCtrl = e.ctrlKey && !e.metaKey;
      
      if ((isMacCmd || isCtrl) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsSearchPanelOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNodeSelect = (nodeType: string) => {
    console.log('Selected node:', nodeType);
  };

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

  const categoryColors = {
    'Sample Processing': '#C4395E',
    'Analysis & Measurement': '#AEC17B',
    'Reaction Control': '#F0CA50',
    'Separation & Purification': '#E07B42',
    'Data Acquisition': '#89A7C2',
    'Environment Control': '#4BBCD4',
    'Catalyst Workflow': '#7B68EE',
    'SDL Catalyst': '#9C27B0'
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
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        height: '100vh',
        overflow: 'auto',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'background.paper',
        zIndex: 1000
      }}
    >
      <div className="sidebar-header">
        <h3>Laboratory Automation Components</h3>
        <div className="search-shortcut-hint">
          Press <kbd>{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</kbd> + <kbd>P</kbd> for advanced search
        </div>
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

      <SearchPanel
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        onSelect={handleNodeSelect}
      />
    </Box>
  );
};

export default Sidebar; 
