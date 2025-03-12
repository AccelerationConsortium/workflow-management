import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Snackbar, Alert, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import GenericUnitOperationForm from '../components/forms/GenericUnitOperationForm';
import { UnitOperationFormData } from '../types/UnitOperation';
import { useCreateGenericUnitOperation, useUpdateGenericUnitOperation, useGetGenericUnitOperation } from '../services/api/unitOperations';

/**
 * 通用单元操作表单页面
 * 支持创建新的通用单元操作或编辑现有通用单元操作
 */
const GenericUnitOperationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  
  // 获取单元操作详情（如果是编辑模式）
  const { data: unitOperation, isLoading } = useGetGenericUnitOperation(
    id || '', 
    { enabled: isEditing }
  );
  
  // 创建和更新操作的hooks
  const createMutation = useCreateGenericUnitOperation();
  const updateMutation = useUpdateGenericUnitOperation();
  
  // 通知状态
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // 处理表单提交
  const handleSubmit = async (data: UnitOperationFormData) => {
    try {
      if (isEditing && id) {
        // 更新现有单元操作
        await updateMutation.mutateAsync({ id, data });
        setNotification({
          open: true,
          message: 'Unit operation updated successfully!',
          severity: 'success'
        });
      } else {
        // 创建新的单元操作
        const result = await createMutation.mutateAsync(data);
        setNotification({
          open: true,
          message: 'Unit operation created successfully!',
          severity: 'success'
        });
        
        // 创建成功后导航到详情页面
        setTimeout(() => {
          navigate(`/unit-operations/${result.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setNotification({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        severity: 'error'
      });
    }
  };
  
  // 关闭通知
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  // 加载状态渲染
  if (isEditing && isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography>Loading unit operation details...</Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 面包屑导航 */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/unit-operations" underline="hover" color="inherit">
          Unit Operations
        </Link>
        <Typography color="text.primary">
          {isEditing ? 'Edit' : 'Create'} Generic Unit Operation
        </Typography>
      </Breadcrumbs>
      
      {/* 页面标题 */}
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit' : 'Create'} Generic Unit Operation
      </Typography>
      
      {/* 表单描述 */}
      <Typography variant="body1" paragraph>
        {isEditing 
          ? 'Edit the details of this generic unit operation. This will update the template that can be used for creating specific unit operations.'
          : 'Create a new generic unit operation that will serve as a template for specific unit operations.'
        }
      </Typography>
      
      {/* 表单组件 */}
      <Box sx={{ mt: 3 }}>
        <GenericUnitOperationForm
          initialData={unitOperation}
          onSubmit={handleSubmit}
          isEditing={isEditing}
        />
      </Box>
      
      {/* 通知组件 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GenericUnitOperationFormPage; 
