import React from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data - would come from API in real implementation
  const recentOperations = [
    { id: '1', name: 'Distillation Column', category: 'Separation', updatedAt: '2023-10-15' },
    { id: '2', name: 'Heat Exchanger', category: 'Energy Transfer', updatedAt: '2023-10-12' },
    { id: '3', name: 'Reactor', category: 'Chemical Reaction', updatedAt: '2023-10-10' }
  ];
  
  const stats = {
    totalOperations: 15,
    activeOperations: 10,
    pendingApprovals: 2,
    categories: 5
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: '#e3f2fd'
            }}
          >
            <Typography variant="h5" color="primary">{stats.totalOperations}</Typography>
            <Typography variant="body1">Total Operations</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: '#e8f5e9'
            }}
          >
            <Typography variant="h5" color="success.main">{stats.activeOperations}</Typography>
            <Typography variant="body1">Active Operations</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: '#fff8e1'
            }}
          >
            <Typography variant="h5" color="warning.main">{stats.pendingApprovals}</Typography>
            <Typography variant="body1">Pending Approvals</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: '#f3e5f5'
            }}
          >
            <Typography variant="h5" color="secondary.main">{stats.categories}</Typography>
            <Typography variant="body1">Categories</Typography>
          </Paper>
        </Grid>
        
        {/* Recent Operations */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader 
              title="Recent Unit Operations" 
              sx={{ 
                backgroundColor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0' 
              }}
            />
            <CardContent>
              <List>
                {recentOperations.map((op) => (
                  <ListItem 
                    key={op.id} 
                    button 
                    divider
                    onClick={() => navigate(`/unit-operations/${op.id}`)}
                  >
                    <ListItemText 
                      primary={op.name} 
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {op.category}
                          </Typography>
                          {` — Last updated: ${op.updatedAt}`}
                        </>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
