import React, { ReactNode } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  ListSubheader
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#4BBCD4'
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Unit Operations Registration System
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f8f9fa',
            borderRight: '1px solid #e0e0e0'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 2 }}>
          <List>
            <ListItem button component={RouterLink} to="/">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
          </List>
          
          <Divider />
          
          <List subheader={
            <ListSubheader component="div" id="unit-operations-subheader">
              Unit Operations
            </ListSubheader>
          }>
            <ListItem button component={RouterLink} to="/unit-operations">
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Browse All UOs" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/unit-operations/create">
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Create Specific UO" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/generic-unit-operations/create">
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Create Generic UO" />
            </ListItem>

            <ListItem button component={RouterLink} to="/nodes/create">
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Create New Node" />
            </ListItem>
          </List>
          
          <Divider />
          
          <List subheader={
            <ListSubheader component="div" id="reference-data-subheader">
              Reference Data
            </ListSubheader>
          }>
            <ListItem button component={RouterLink} to="/categories">
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="Categories" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/laboratories">
              <ListItemIcon>
                <NewReleasesIcon />
              </ListItemIcon>
              <ListItemText primary="Laboratories" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 
