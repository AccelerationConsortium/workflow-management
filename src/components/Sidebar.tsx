import React, { useState, useMemo, useEffect } from 'react';
import { useDnD } from '../context/DnDContext';
import { operationNodes, OperationNode } from '../data/operationNodes';
import { SearchPanel } from './SearchPanel';
import './Sidebar.css';
import { Box, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Search as SearchIcon,
  KeyboardCommandKey as CmdIcon,
  Keyboard as CtrlIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { customUOService, CustomUONode } from '../services/customUOService';
import { DeleteConfirmationDialog } from './UOManagement';

interface CategoryGroupProps {
  title: string;
  nodes: OperationNode[];
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  onDragEnd: () => void;
  color: string;
  onContextMenu?: (event: React.MouseEvent, node: OperationNode) => void;
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
  onContextMenu
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
            onContextMenu={(event) => {
              if (node.isCustom && onContextMenu) {
                event.preventDefault();
                onContextMenu(event, node);
              }
            }}
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
  const [customUOs, setCustomUOs] = useState<CustomUONode[]>([]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    node: OperationNode | null;
  } | null>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

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

  // Subscribe to custom UO changes
  useEffect(() => {
    const unsubscribe = customUOService.subscribe((uos) => {
      setCustomUOs(uos);
    });

    // Load initial custom UOs
    setCustomUOs(customUOService.getCustomUONodes());

    return unsubscribe;
  }, []);

  const handleNodeSelect = (nodeType: string) => {
    console.log('Selected node:', nodeType);
  };

  const groupedNodes = useMemo(() => {
    const groups = new Map<string, OperationNode[]>();

    // Add regular operation nodes
    operationNodes.forEach(node => {
      if (!node.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }
      const group = groups.get(node.category) || [];
      group.push(node);
      groups.set(node.category, group);
    });

    // Add custom UOs
    customUOs.forEach(customUO => {
      if (!customUO.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }

      // Convert CustomUONode to OperationNode format
      const operationNode: OperationNode = {
        type: customUO.type,
        label: customUO.label,
        description: customUO.description,
        category: customUO.category,
        isCustom: true
      };

      const group = groups.get(customUO.category) || [];
      group.push(operationNode);
      groups.set(customUO.category, group);
    });

    return groups;
  }, [searchTerm, customUOs]);

  const categoryColors = {
    'Sample Processing': '#C4395E',
    'Analysis & Measurement': '#AEC17B',
    'Reaction Control': '#F0CA50',
    'Separation & Purification': '#E07B42',
    'Data Acquisition': '#89A7C2',
    'Environment Control': '#4BBCD4',
    'Catalyst Workflow': '#7B68EE',
    'SDL Catalyst': '#9C27B0',
    // Default colors for custom categories
    'Separation': '#FF6B6B',
    'Chemical Reaction': '#4ECDC4',
    'Mixing': '#45B7D1',
    'Heat Transfer': '#F9CA24',
    'Measurement': '#6C5CE7',
    'Material Transport': '#A0E7E5',
    'Custom': '#8F7FE8' // Matrix purple for custom UOs
  };

  // Function to get color for any category
  const getCategoryColor = (category: string) => {
    return categoryColors[category] || '#8F7FE8'; // Default to matrix purple
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    setType(nodeType);
  };

  const onDragEnd = () => {
    setType(null);
  };

  // Handle right-click context menu
  const handleContextMenu = (event: React.MouseEvent, node: OperationNode) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      node: node
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteFromContextMenu = () => {
    if (contextMenu?.node) {
      setNodeToDelete(contextMenu.node.type);
      setDeleteDialogOpen(true);
    }
    handleCloseContextMenu();
  };

  const handleConfirmDelete = () => {
    if (nodeToDelete) {
      const success = customUOService.deleteUO(nodeToDelete);
      if (success) {
        console.log('UO deleted successfully');
      } else {
        console.error('Failed to delete UO');
      }
    }
    setDeleteDialogOpen(false);
    setNodeToDelete(null);
  };

  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        height: '100vh',
        overflow: 'auto',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'background.paper',
        zIndex: 1000,
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="sidebar-header">
        <h3>Laboratory Automation Components</h3>
        <div className="search-shortcut-hint">
          Press <kbd>{navigator.platform.includes('Mac') ? <CmdIcon fontSize="small" /> : <CtrlIcon fontSize="small" />}</kbd> + <kbd>P</kbd> for advanced search
        </div>
        <div className="search-box">
          <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
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
            color={getCategoryColor(category)}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>

      <SearchPanel
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        onSelect={handleNodeSelect}
      />

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleDeleteFromContextMenu}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete UO</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setNodeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        uoToDelete={nodeToDelete}
        customUOs={customUOs}
      />
    </Box>
  );
};

export default Sidebar;
