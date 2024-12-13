import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Tooltip,
  LinearProgress 
} from '@mui/material';
import { ParameterRecommendation } from '../types/recommendation';

interface RecommendationItemProps {
  recommendation: ParameterRecommendation;
  onApply: (value: number) => void;
}

export const RecommendationItem: React.FC<RecommendationItemProps> = ({
  recommendation,
  onApply
}) => {
  const confidencePercent = Math.round(recommendation.confidence * 100);

  return (
    <Box className="recommendation-item" sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">
          {recommendation.paramId}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onApply(recommendation.value)}
        >
          Apply
        </Button>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Tooltip title="Confidence level">
          <Box sx={{ width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={confidencePercent}
              sx={{ 
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: confidencePercent > 70 ? '#4caf50' : '#ff9800'
                }
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              {confidencePercent}% confidence
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      <Box sx={{ mt: 1 }}>
        <Typography variant="body2">
          Suggested: {recommendation.value}
          {recommendation.relatedParams && recommendation.relatedParams.length > 0 && (
            <Tooltip title="Related parameters that may be affected">
              <Typography 
                component="span" 
                sx={{ 
                  ml: 1,
                  color: 'text.secondary',
                  fontSize: '0.75rem'
                }}
              >
                (affects: {recommendation.relatedParams.join(', ')})
              </Typography>
            </Tooltip>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Typical range: {recommendation.typicalRange[0]} - {recommendation.typicalRange[1]}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            display: 'block',
            mt: 0.5,
            fontStyle: 'italic'
          }}
        >
          {recommendation.reason}
        </Typography>
      </Box>
    </Box>
  );
}; 