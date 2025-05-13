import React from 'react';
import { Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'; // Import MUI components
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // For Accordion
import { operationNodes, OperationNode } from '../../data/operationNodes'; // Import data and type
import './styles.css';
import { useTheme } from '@mui/material/styles';

// Helper function to group nodes by category
const groupNodesByCategory = (nodes: OperationNode[]) => {
  return nodes.reduce((acc, node) => {
    const category = node.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(node);
    return acc;
  }, {} as Record<string, OperationNode[]>);
};

export function Sidebar() {
  const theme = useTheme();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const groupedOperations = groupNodesByCategory(operationNodes);

  return (
    <aside className="sidebar" style={{ backgroundColor: '#F8F9FA', borderRight: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Unit Operations</Typography>
      </Box>
      <Box className="sidebar-content" sx={{ p: 1, overflowY: 'auto' }}>
        {Object.entries(groupedOperations).map(([categoryName, operations]) => (
          <Accordion key={categoryName} defaultExpanded sx={{ 
            boxShadow: 'none', 
            '&:before': { display: 'none' }, 
            mb: 1, 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '4px',
            backgroundColor: 'background.paper'
          }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />} 
              sx={{ 
                backgroundColor: 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`,
                minHeight: '48px',
                '&.Mui-expanded': { minHeight: '48px' },
                '.MuiAccordionSummary-content': { m: '12px 0', '&.Mui-expanded': { m: '12px 0' } }
              }}
            >
              <Typography sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                {categoryName} ({operations.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1, backgroundColor: 'background.paper' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {operations.map((op) => (
                  <Box
                    key={op.type}
                    onDragStart={(event) => onDragStart(event, op.type)}
                    draggable
                    sx={{
                      p: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '4px',
                      cursor: 'grab',
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                      {op.label}
                    </Typography>
                    {op.description && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.8rem' }}>
                        {op.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </aside>
  );
}
