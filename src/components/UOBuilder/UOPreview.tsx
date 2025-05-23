/**
 * UO Preview - Shows how the complete UO will look when used
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Visibility as PreviewIcon,
  Settings as ParametersIcon
} from '@mui/icons-material';

import { UOComponent } from './types';
import { ComponentPreview } from './ComponentPreview';

interface UOPreviewProps {
  name: string;
  description: string;
  components: UOComponent[];
}

export const UOPreview: React.FC<UOPreviewProps> = ({
  name,
  description,
  components
}) => {
  // Sort components by position for better layout
  const sortedComponents = [...components].sort((a, b) => {
    if (a.position.y === b.position.y) {
      return a.position.x - b.position.x;
    }
    return a.position.y - b.position.y;
  });

  // Group components by rows (approximate)
  const groupedComponents = sortedComponents.reduce((groups, component) => {
    const rowIndex = Math.floor(component.position.y / 100); // Group by 100px rows
    if (!groups[rowIndex]) {
      groups[rowIndex] = [];
    }
    groups[rowIndex].push(component);
    return groups;
  }, {} as Record<number, UOComponent[]>);

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
      {/* Preview Header */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <PreviewIcon color="primary" />
        <Typography variant="h5" component="h1">
          Unit Operation Preview
        </Typography>
      </Box>

      {/* UO Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {name || 'Untitled Unit Operation'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {description || 'No description provided'}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              icon={<ParametersIcon />}
              label={`${components.length} Parameter${components.length !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Parameters Section */}
      {components.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Parameters
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Render components in a grid layout */}
            <Grid container spacing={2}>
              {Object.entries(groupedComponents).map(([rowIndex, rowComponents]) => (
                <React.Fragment key={rowIndex}>
                  {rowComponents.map((component, index) => (
                    <Grid item xs={12} sm={6} md={4} key={component.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          height: '100%',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: 2
                          }
                        }}
                      >
                        <ComponentPreview
                          component={component}
                          interactive={true}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </React.Fragment>
              ))}
            </Grid>

            {/* Component Summary */}
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Parameter Summary
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {components.map((component) => (
                  <Chip
                    key={component.id}
                    label={component.label}
                    size="small"
                    color={component.required ? 'primary' : 'default'}
                    variant={component.required ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary'
              }}
            >
              <ParametersIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No Parameters Defined
              </Typography>
              <Typography variant="body2">
                Switch back to edit mode to add parameter components
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Usage Instructions
          </Typography>
          <Typography variant="body2" paragraph>
            This preview shows how your unit operation will appear when users add it to their workflow. 
            The parameters you've defined will be available for configuration in the node properties panel.
          </Typography>
          <Typography variant="body2">
            <strong>Next steps:</strong>
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>
              <Typography variant="body2">
                Review the parameter layout and functionality
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Switch back to edit mode to make adjustments
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Click "Save & Register" to add this UO to your component library
              </Typography>
            </li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};
