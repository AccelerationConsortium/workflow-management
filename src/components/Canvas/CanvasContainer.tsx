import { styled } from '@mui/material/styles';

export const CanvasContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  background: theme.palette.background.default,
  backgroundImage: `radial-gradient(${theme.palette.action.hover} 1px, transparent 1px)`,
  backgroundSize: '20px 20px',
  
  // 缩放控件样式
  '.react-flow__controls': {
    border: 'none',
    borderRadius: '8px',
    boxShadow: theme.shadows[2],
    
    button: {
      border: 'none',
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      '&:hover': {
        background: theme.palette.action.hover
      }
    }
  },
  
  // 迷你地图样式
  '.react-flow__minimap': {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: theme.shadows[2]
  }
})); 