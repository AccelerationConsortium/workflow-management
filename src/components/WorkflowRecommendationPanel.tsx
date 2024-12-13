import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip 
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { RecommendationService } from '../services/recommendationService';
import { WorkflowRecommendation } from '../types/recommendation';

interface WorkflowRecommendationPanelProps {
  currentNodes: Node[];
  onAddNode: (nodeType: string) => void;
}

export const WorkflowRecommendationPanel: React.FC<WorkflowRecommendationPanelProps> = ({
  currentNodes,
  onAddNode
}) => {
  const [recommendations, setRecommendations] = useState<WorkflowRecommendation[]>([]);
  const recommendationService = new RecommendationService();

  useEffect(() => {
    const fetchRecommendations = async () => {
      const recs = await recommendationService.getNextStepRecommendations(currentNodes);
      setRecommendations(recs);
    };

    fetchRecommendations();
  }, [currentNodes]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Suggested Next Steps
      </Typography>
      <List>
        {recommendations.map((rec, index) => (
          <ListItem 
            key={index}
            sx={{
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <ListItemText
              primary={rec.nextSteps.join(' → ')}
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {Math.round(rec.confidence * 100)}% confidence
                  </Typography>
                  <Typography
                    component="p"
                    variant="caption"
                    color="text.secondary"
                  >
                    {rec.reason}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              {rec.nextSteps.map((step, i) => (
                <Tooltip key={i} title={`Add ${step}`}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onAddNode(step)}
                    sx={{ ml: 1 }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              ))}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 