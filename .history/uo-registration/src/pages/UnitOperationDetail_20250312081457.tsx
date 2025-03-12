import React from 'react';
import { 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  Chip, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardHeader,
  CardContent 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit as EditIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';

// Type definitions for unit operation data
interface UnitOperationData {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  location: string;
  capacity: string;
  operationTemperature: string;
  operationPressure: string;
  maintenanceSchedule: string;
  safetyProcedures: string;
  technicalDocuments: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const UnitOperationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Mock data - would come from API in real implementation
  const operationData: UnitOperationData = {
    id: id || '1',
    name: 'Distillation Column',
    description: 'A vertical column used to separate components of a mixture based on differences in volatilities.',
    category: 'Separation',
    status: 'Active',
    location: 'Building B, Room 204',
    capacity: '500 L/h',
    operationTemperature: '80-120°C',
    operationPressure: '1-2 bar',
    maintenanceSchedule: 'Quarterly',
    safetyProcedures: 'Ensure proper ventilation. Check pressure gauges before operation. Wear appropriate PPE.',
    technicalDocuments: [
      {
        id: 'd1',
        name: 'Operation Manual.pdf',
        type: 'PDF',
        uploadedAt: '2023-08-15'
      },
      {
        id: 'd2',
        name: 'Maintenance Checklist.xlsx',
        type: 'Excel',
        uploadedAt: '2023-09-01'
      }
    ],
    createdAt: '2023-07-15',
    updatedAt: '2023-10-15'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header with back button and edit button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/unit-operations')}
        >
          Back to List
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<EditIcon />}
          onClick={() => navigate(`/unit-operations/${id}/edit`)}
        >
          Edit
        </Button>
      </Box>
      
      {/* Title and status */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {operationData.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={operationData.category}
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={operationData.status}
            color={getStatusColor(operationData.status) as any}
          />
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Main details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography paragraph>{operationData.description}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Technical Specifications</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography>{operationData.location}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Capacity</Typography>
                  <Typography>{operationData.capacity}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Operating Temperature</Typography>
                  <Typography>{operationData.operationTemperature}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Operating Pressure</Typography>
                  <Typography>{operationData.operationPressure}</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Maintenance Information</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Maintenance Schedule</Typography>
              <Typography>{operationData.maintenanceSchedule}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Safety Procedures</Typography>
            <Typography paragraph>{operationData.safetyProcedures}</Typography>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Technical Documents */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardHeader 
              title="Technical Documents" 
              sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}
            />
            <CardContent>
              <List>
                {operationData.technicalDocuments.map((doc) => (
                  <ListItem key={doc.id} disablePadding>
                    <ListItemText 
                      primary={doc.name} 
                      secondary={`${doc.type} • Uploaded on ${doc.uploadedAt}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          
          {/* Metadata */}
          <Card elevation={2}>
            <CardHeader 
              title="Information" 
              sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}
            />
            <CardContent>
              <List>
                <ListItem disablePadding>
                  <ListItemText 
                    primary="Created" 
                    secondary={operationData.createdAt}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText 
                    primary="Last Updated" 
                    secondary={operationData.updatedAt}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText 
                    primary="ID" 
                    secondary={operationData.id}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UnitOperationDetail; 
