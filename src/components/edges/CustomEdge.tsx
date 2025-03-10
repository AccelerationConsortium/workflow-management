import { styled } from '@mui/material/styles';

export const StyledPath = styled('path')(({ theme, type }) => ({
  strokeWidth: 2,
  stroke: theme.palette.primary.main,
  strokeDasharray: type === 'dashed' ? '5,5' : 'none',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    strokeWidth: 3,
    stroke: theme.palette.primary.dark
  }
}));

export const EdgeLabel = styled('div')(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  boxShadow: theme.shadows[1]
})); 