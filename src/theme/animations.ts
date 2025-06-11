import { keyframes } from '@mui/material/styles';

export const animations = {
  nodeHover: keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
    100% { transform: translateY(0); }
  `,
  
  nodeDrag: keyframes`
    0% { transform: scale(1); }
    100% { transform: scale(1.05); }
  `,
  
  connectionLine: keyframes`
    0% { stroke-dashoffset: 24; }
    100% { stroke-dashoffset: 0; }
  `
}; 