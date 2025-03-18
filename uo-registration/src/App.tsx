import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UnitOperationsList from './pages/UnitOperationsList';
import UnitOperationForm from './pages/UnitOperationForm';
import UnitOperationDetail from './pages/UnitOperationDetail';
import NotFound from './pages/NotFound';
import GenericUnitOperationFormPage from './pages/GenericUnitOperationForm';
import SpecificUnitOperationFormPage from './pages/SpecificUnitOperationForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/unit-operations" element={<UnitOperationsList />} />
            <Route path="/unit-operations/create" element={<UnitOperationForm />} />
            <Route path="/unit-operations/:id" element={<UnitOperationDetail />} />
            <Route path="/unit-operations/:id/edit" element={<UnitOperationForm />} />
            
            {/* 通用单元操作表单路由 */}
            <Route path="/generic-unit-operations/create" element={<GenericUnitOperationFormPage />} />
            <Route path="/generic-unit-operations/:id/edit" element={<GenericUnitOperationFormPage />} />
            
            {/* 特定单元操作表单路由 */}
            <Route path="/specific-unit-operations/create" element={<SpecificUnitOperationFormPage />} />
            <Route path="/specific-unit-operations/:id/edit" element={<SpecificUnitOperationFormPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Box>
    </ThemeProvider>
  );
};

export default App; 
