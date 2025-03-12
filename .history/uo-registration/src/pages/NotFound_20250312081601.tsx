import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{
          padding: 5,
          textAlign: 'center',
          maxWidth: 500,
          backgroundColor: '#f8f9fa'
        }}
      >
        <ErrorOutlineIcon 
          color="error" 
          sx={{ fontSize: 80, mb: 2 }}
        />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound; 
