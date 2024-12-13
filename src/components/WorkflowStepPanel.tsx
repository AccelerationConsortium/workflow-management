import React, { useState, useEffect, useMemo } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Autocomplete, TextField, Button, Box, Paper } from '@mui/material';
import './WorkflowStepPanel.css';
import { WorkflowStorage } from '../services/workflowStorage';

interface WorkflowStepPanelProps {
  anchorEl: HTMLElement | null;
}

export const WorkflowStepPanel: React.FC<WorkflowStepPanelProps> = ({ anchorEl }) => {
  const { state, dispatch } = useWorkflow();
  const [stepName, setStepName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUOs, setSelectedUOs] = useState<string[]>([]);
  
  // 获取画布上所有可用的 UO
  const availableUOs = useMemo(() => 
    state.nodes
      .filter(node => node.type !== 'input') // 排除开始节点
      .map(node => ({
        id: node.id,
        label: node.data.label
      }))
  , [state.nodes]);

  const handleCreateStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      name: stepName,
      description,
      nodeIds: selectedUOs,
      order: state.currentWorkflow?.steps.length || 0,
      status: 'pending',
      dependencies: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    dispatch({ type: 'ADD_STEP', payload: newStep });
    
    // 清空表单
    setStepName('');
    setDescription('');
    setSelectedUOs([]);
  };

  const handleSaveWorkflow = async () => {
    try {
      // ��备完整的工作流数据
      const workflowData = {
        ...state.currentWorkflow,
        nodes: state.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            parameters: node.data.parameters || {},
            primitives: node.data.primitives || {},
          }
        })),
        edges: state.edges,
        metadata: {
          ...state.currentWorkflow.metadata,
          updatedAt: new Date()
        }
      };

      // 保存工作流
      await WorkflowStorage.saveWorkflow(workflowData);
      
      // 更新状态
      dispatch({ type: 'SET_WORKFLOW_CREATING', payload: false });
      
      // 显示成功提示
      console.log('Workflow saved successfully');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      // TODO: 显示错误提示
    }
  };

  // 计算面板位置
  const panelStyle = useMemo(() => {
    if (!anchorEl) return {};
    
    const rect = anchorEl.getBoundingClientRect();
    return {
      position: 'absolute',
      top: `${rect.bottom + 10}px`,
      left: `${rect.left}px`,
    };
  }, [anchorEl]);

  return (
    <Paper 
      className="workflow-step-panel"
      style={panelStyle}
      elevation={3}
    >
      <h3>Create Workflow Step</h3>
      
      <TextField
        fullWidth
        label="Step Name"
        value={stepName}
        onChange={(e) => setStepName(e.target.value)}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={2}
        margin="normal"
      />
      
      <Autocomplete
        multiple
        options={availableUOs}
        getOptionLabel={(option) => option.label}
        value={selectedUOs.map(id => availableUOs.find(uo => uo.id === id)!)}
        onChange={(_, newValue) => setSelectedUOs(newValue.map(v => v.id))}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Unit Operations"
            margin="normal"
          />
        )}
      />

      <Box className="step-actions">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateStep}
          disabled={!stepName || selectedUOs.length === 0}
        >
          Create Step
        </Button>
        
        <Button 
          variant="outlined"
          onClick={() => dispatch({ type: 'SET_WORKFLOW_CREATING', payload: false })}
        >
          Cancel
        </Button>
      </Box>

      {state.currentWorkflow?.steps.length > 0 && (
        <Box className="workflow-summary">
          <h4>Current Steps</h4>
          {state.currentWorkflow.steps.map((step, index) => (
            <Paper key={step.id} className="step-item">
              <div className="step-header">
                <span className="step-number">#{index + 1}</span>
                <span className="step-name">{step.name}</span>
              </div>
              <div className="step-uos">
                {step.nodeIds.map(id => {
                  const uo = availableUOs.find(u => u.id === id);
                  return (
                    <span key={id} className="uo-tag">
                      {uo?.label}
                    </span>
                  );
                })}
              </div>
            </Paper>
          ))}
          
          <Button 
            variant="contained" 
            color="success" 
            fullWidth 
            onClick={handleSaveWorkflow}
            sx={{ mt: 2 }}
          >
            Save Workflow
          </Button>
        </Box>
      )}
    </Paper>
  );
}; 