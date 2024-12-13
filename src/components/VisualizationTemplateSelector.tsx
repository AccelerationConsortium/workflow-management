import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  ShowChart as ChartIcon,
  Speed as GaugeIcon
} from '@mui/icons-material';
import { VisualizationTemplate } from '../services/visualizationTemplateService';

interface VisualizationTemplateSelectorProps {
  templates: VisualizationTemplate[];
  onSelect: (template: VisualizationTemplate) => void;
  selectedId?: string;
}

export const VisualizationTemplateSelector: React.FC<VisualizationTemplateSelectorProps> = ({
  templates,
  onSelect,
  selectedId
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'chart': return <ChartIcon />;
      case 'gauge': return <GaugeIcon />;
      case 'timeline': return <TimelineIcon />;
      default: return <ChartIcon />;
    }
  };

  return (
    <Grid container spacing={2}>
      {templates.map((template) => (
        <Grid item xs={12} sm={6} key={template.id}>
          <Card 
            variant={selectedId === template.id ? "outlined" : "elevation"}
            sx={{ 
              borderColor: selectedId === template.id ? 'primary.main' : undefined
            }}
          >
            <CardActionArea onClick={() => onSelect(template)}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {getIcon(template.type)}
                  <Typography variant="subtitle1">
                    {template.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {template.description}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  {template.applicableTypes.map(type => (
                    <Chip
                      key={type}
                      label={type}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}; 