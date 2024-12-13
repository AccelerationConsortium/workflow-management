import React, { useEffect, useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { RecommendationService } from '../services/recommendationService';
import { ParameterRecommendation } from '../types/recommendation';
import { ParameterValue } from '../types/parameters';
import { RecommendationItem } from './RecommendationItem';

interface ParameterRecommendationPanelProps {
  nodeType: string;
  currentParams: ParameterValue[];
  onApplyRecommendation: (paramId: string, value: number) => void;
}

export const ParameterRecommendationPanel: React.FC<ParameterRecommendationPanelProps> = ({
  nodeType,
  currentParams,
  onApplyRecommendation
}) => {
  const [expanded, setExpanded] = useState(true);
  const [recommendations, setRecommendations] = useState<ParameterRecommendation[]>([]);
  const recommendationService = new RecommendationService();

  useEffect(() => {
    const fetchRecommendations = async () => {
      const recs = await recommendationService.getParameterRecommendations(
        nodeType,
        currentParams
      );
      setRecommendations(recs);
    };

    fetchRecommendations();
  }, [nodeType, currentParams]);

  return (
    <Box className="recommendations-section">
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          mb: 1
        }}
      >
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          Parameter Recommendations
        </Typography>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Box>

      <Collapse in={expanded}>
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <RecommendationItem
              key={rec.paramId}
              recommendation={rec}
              onApply={(value) => onApplyRecommendation(rec.paramId, value)}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No recommendations available for this operation.
          </Typography>
        )}
      </Collapse>
    </Box>
  );
}; 