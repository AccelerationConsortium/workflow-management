import { keyframes } from '@emotion/react';

const pulseKeyframe = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
`;

export const nodeStyles = {
  // 节点基础样式
  base: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    padding: '16px',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    border: '1px solid rgba(0,0,0,0.08)',
    fontFamily: 'Inter, system-ui, sans-serif',
    '& h3': {
      fontSize: '15px',
      fontWeight: 500,
      color: '#1a1a1a',
      marginBottom: '8px'
    },
    '& p': {
      fontSize: '13px',
      fontWeight: 400,
      color: '#666666',
      lineHeight: 1.5
    },
    '& .metric': {
      fontSize: '24px',
      fontWeight: 600,
      color: '#1a1a1a',
      letterSpacing: '-0.02em'
    },
    '&:hover': {
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      transform: 'translateY(-2px)'
    }
  },
  // 不同类别节点的颜色主题
  categories: {
    'hardware': {
      borderLeft: '4px solid #4CAF50',
      background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(255,255,255,0) 60%)',
      '& .metric': {
        color: '#2e7d32'
      }
    },
    'analysis': {
      borderLeft: '4px solid #2196F3',
      background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(255,255,255,0) 60%)',
      '& .metric': {
        color: '#1976d2'
      }
    },
    'optimization': {
      borderLeft: '4px solid #9C27B0',
      background: 'linear-gradient(135deg, rgba(156,39,176,0.1) 0%, rgba(255,255,255,0) 60%)',
      '& .metric': {
        color: '#7b1fa2'
      }
    },
    'data': {
      borderLeft: '4px solid #FF9800',
      background: 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,255,255,0) 60%)',
      '& .metric': {
        color: '#f57c00'
      }
    }
  },
  // 节点状态样式
  states: {
    selected: {
      boxShadow: '0 0 0 2px #2196F3, 0 8px 30px rgba(33,150,243,0.2)',
      transform: 'scale(1.03)'
    },
    running: {
      animation: `${pulseKeyframe} 2s infinite`
    },
    error: {
      borderColor: '#f44336',
      boxShadow: '0 4px 20px rgba(244,67,54,0.2)',
      '& .metric': {
        color: '#d32f2f'
      }
    }
  }
};

