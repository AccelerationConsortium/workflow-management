import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Box, 
  Typography, 
  FormControl, 
  Select, 
  MenuItem, 
  TextField,
  IconButton,
  Divider,
  Button,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import { ConditionalNodeData, ConditionCase } from './types';
import './styles.css';

export const ConditionalNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const [nodeData, setNodeData] = useState<ConditionalNodeData>({
    id: id,
    label: data.label || '条件节点',
    type: 'conditional',
    conditionType: data.conditionType || 'boolean',
    conditionSource: data.conditionSource || 'parameter',
    expression: data.expression || '',
    cases: data.cases || [{ id: 'default', label: '默认', value: 'default' }]
  });
  
  // 当外部数据变化时更新内部状态
  useEffect(() => {
    if (data) {
      setNodeData(prevData => ({
        ...prevData,
        ...data,
        cases: data.cases || prevData.cases
      }));
    }
  }, [data]);
  
  // 当内部状态变化时通知父组件
  useEffect(() => {
    if (data.onNodeDataChange) {
      data.onNodeDataChange(nodeData);
    }
  }, [nodeData, data]);
  
  const handleConditionTypeChange = (event: SelectChangeEvent<string>) => {
    const type = event.target.value as 'boolean' | 'switch';
    setNodeData({
      ...nodeData,
      conditionType: type,
      cases: type === 'switch' ? 
        nodeData.cases.length ? nodeData.cases : [{ id: 'default', label: '默认', value: 'default' }] : 
        []
    });
  };
  
  const handleConditionSourceChange = (event: SelectChangeEvent<string>) => {
    setNodeData({
      ...nodeData,
      conditionSource: event.target.value as 'parameter' | 'result'
    });
  };
  
  const handleExpressionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNodeData({
      ...nodeData,
      expression: event.target.value
    });
  };
  
  const addCase = () => {
    if (nodeData.conditionType !== 'switch') return;
    
    const newCase: ConditionCase = {
      id: `case-${Date.now()}`,
      label: `情况 ${nodeData.cases.length + 1}`,
      value: ''
    };
    
    setNodeData({
      ...nodeData,
      cases: [...nodeData.cases, newCase]
    });
  };
  
  const removeCase = (caseId: string) => {
    setNodeData({
      ...nodeData,
      cases: nodeData.cases.filter(c => c.id !== caseId)
    });
  };
  
  const updateCase = (caseId: string, updates: Partial<ConditionCase>) => {
    setNodeData({
      ...nodeData,
      cases: nodeData.cases.map(c => 
        c.id === caseId ? { ...c, ...updates } : c
      )
    });
  };
  
  return (
    <div className={`conditional-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <Box className="node-header" sx={{ backgroundColor: '#6b21a8', color: 'white', padding: '8px' }}>
        <Typography variant="subtitle1">{nodeData.label}</Typography>
        <Typography variant="caption">
          {nodeData.conditionType === 'boolean' ? 'If/Else 条件' : 'Switch/Case 条件'}
        </Typography>
      </Box>
      
      <Box className="node-content" sx={{ padding: '8px' }}>
        <FormControl fullWidth size="small" margin="dense">
          <Typography variant="caption">条件类型</Typography>
          <Select
            value={nodeData.conditionType}
            onChange={handleConditionTypeChange}
            size="small"
          >
            <MenuItem value="boolean">If/Else (布尔)</MenuItem>
            <MenuItem value="switch">Switch/Case (多分支)</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" margin="dense">
          <Typography variant="caption">条件来源</Typography>
          <Select
            value={nodeData.conditionSource}
            onChange={handleConditionSourceChange}
            size="small"
          >
            <MenuItem value="parameter">参数值</MenuItem>
            <MenuItem value="result">上一步结果</MenuItem>
          </Select>
        </FormControl>
        
        {nodeData.conditionSource === 'parameter' && (
          <TextField
            fullWidth
            margin="dense"
            size="small"
            label="参数名称"
            value={nodeData.parameterName || ''}
            onChange={(e) => setNodeData({...nodeData, parameterName: e.target.value})}
          />
        )}
        
        {nodeData.conditionSource === 'result' && (
          <TextField
            fullWidth
            margin="dense"
            size="small"
            label="结果路径"
            value={nodeData.resultPath || ''}
            onChange={(e) => setNodeData({...nodeData, resultPath: e.target.value})}
          />
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            margin="dense"
            size="small"
            label="条件表达式"
            value={nodeData.expression || ''}
            onChange={handleExpressionChange}
            placeholder={nodeData.conditionType === 'boolean' ? 'pH > 7' : 'result_level'}
          />
          <IconButton size="small" title="表达式帮助">
            <CodeIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {nodeData.conditionType === 'switch' && (
          <Box mt={1}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>分支情况</Typography>
            <Divider />
            
            {nodeData.cases.map((caseItem) => (
              <Box key={caseItem.id} display="flex" alignItems="center" mt={1}>
                <TextField
                  size="small"
                  label="值"
                  value={caseItem.value}
                  onChange={(e) => updateCase(caseItem.id, { value: e.target.value })}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <TextField
                  size="small"
                  label="标签"
                  value={caseItem.label}
                  onChange={(e) => updateCase(caseItem.id, { label: e.target.value })}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => removeCase(caseItem.id)}
                  disabled={nodeData.cases.length <= 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            
            <Button 
              startIcon={<AddIcon />} 
              onClick={addCase}
              size="small"
              sx={{ mt: 1 }}
            >
              添加分支
            </Button>
          </Box>
        )}
      </Box>
      
      {/* 输出端口 */}
      {nodeData.conditionType === 'boolean' ? (
        <>
          <div className="port-label true-port">True</div>
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="true" 
            style={{ left: '30%', background: '#10b981' }}
          />
          <div className="port-label false-port">False</div>
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="false" 
            style={{ left: '70%', background: '#ef4444' }}
          />
        </>
      ) : (
        <>
          {nodeData.cases.map((caseItem, index) => (
            <React.Fragment key={caseItem.id}>
              <div 
                className="port-label case-port"
                style={{ 
                  left: `${(index + 1) * (100 / (nodeData.cases.length + 1))}%`,
                  bottom: '15px'
                }}
              >
                {caseItem.label}
              </div>
              <Handle
                type="source"
                position={Position.Bottom}
                id={caseItem.id}
                style={{ 
                  left: `${(index + 1) * (100 / (nodeData.cases.length + 1))}%`,
                  background: '#6366f1'
                }}
              />
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
};

export default ConditionalNode;
