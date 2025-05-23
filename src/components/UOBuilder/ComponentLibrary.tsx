/**
 * Component Library Panel - Right sidebar with draggable components
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

import { COMPONENT_LIBRARY, COMPONENT_CATEGORIES } from './config/componentLibrary';
import { ComponentLibraryItem } from './types';

interface ComponentLibraryProps {
  dragDrop: {
    startDrag: (item: ComponentLibraryItem, event: React.DragEvent) => void;
    dragContext: any;
  };
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ dragDrop }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string>('INPUT');

  // Filter components based on search term
  const filteredComponents = COMPONENT_LIBRARY.filter(component =>
    component.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered components by category
  const groupedComponents = React.useMemo(() => {
    const groups: Record<string, { category: any; components: ComponentLibraryItem[] }> = {};

    filteredComponents.forEach(component => {
      const categoryKey = component.category || 'other';
      const categoryInfo = COMPONENT_CATEGORIES[categoryKey as keyof typeof COMPONENT_CATEGORIES];

      if (!groups[categoryKey]) {
        groups[categoryKey] = {
          category: categoryInfo || { label: 'Other', description: 'Other components', icon: '📦', color: '#666' },
          components: []
        };
      }
      groups[categoryKey].components.push(component);
    });

    return groups;
  }, [filteredComponents]);

  const handleDragStart = (item: ComponentLibraryItem, event: React.DragEvent) => {
    dragDrop.startDrag(item, event);
  };

  const handleCategoryChange = (categoryKey: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedCategory(isExpanded ? categoryKey : '');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Parameter Components
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Drag components to the canvas to build your UO interface
        </Typography>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Component Categories */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(groupedComponents).map(([categoryKey, group]) => (
          <Accordion
            key={categoryKey}
            expanded={expandedCategory === categoryKey}
            onChange={handleCategoryChange(categoryKey)}
            disableGutters
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'grey.50',
                minHeight: 48,
                '&.Mui-expanded': {
                  minHeight: 48
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{group.category.icon}</span>
                <Typography variant="subtitle2" fontWeight={600}>
                  {group.category.label}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1 }}>
              <Box display="flex" flexDirection="column" gap={1}>
                {group.components.map((component: ComponentLibraryItem) => (
                  <ComponentCard
                    key={component.type}
                    component={component}
                    onDragStart={handleDragStart}
                    isDragging={dragDrop.dragContext.isDragging}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {Object.keys(groupedComponents).length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No components found matching "{searchTerm}"
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Individual component card
interface ComponentCardProps {
  component: ComponentLibraryItem;
  onDragStart: (item: ComponentLibraryItem, event: React.DragEvent) => void;
  isDragging: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onDragStart,
  isDragging
}) => {
  return (
    <Tooltip title={component.description} placement="left">
      <Card
        draggable
        onDragStart={(e) => onDragStart(component, e)}
        sx={{
          cursor: 'grab',
          transition: 'all 0.2s ease',
          opacity: isDragging ? 0.7 : 1,
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-1px)'
          },
          '&:active': {
            cursor: 'grabbing'
          }
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="span" sx={{ fontSize: '1.2rem' }}>
              {component.icon}
            </Typography>
            <Box flex={1}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {component.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {component.description}
              </Typography>
            </Box>
            <DragIcon fontSize="small" color="action" />
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
};
