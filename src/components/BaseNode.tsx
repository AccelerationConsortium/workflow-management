import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { OperationNode, Parameter } from '../types/workflow';
import { nodeColors } from '../styles/nodeTheme';
import { FileUploader } from './FileUploader';
import './BaseNode.css';
import { styled } from '@mui/material/styles';
import { Box, Typography, Tooltip, Select, MenuItem, FormControl, InputLabel, Switch, TextField } from '@mui/material';
import { nodeStyles } from '../theme/nodeStyles';

// 添加运行状态类型
type RunStatus = 'idle' | 'running' | 'completed' | 'error';

// 添加从 nodes/BaseNode.tsx 导入的类型定义
interface NodeWrapperProps {
  category?: string;
  state?: string;
  theme?: any;
}

interface BaseNodeProps {
  data: OperationNode & {
    runStatus?: RunStatus;
    startTime?: number;
    endTime?: number;
  };
  category?: string;
  state?: string;
}

// 添加状态指示器样式组件
const StatusIndicator = styled('div')<{ status: RunStatus }>(({ theme, status }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  marginLeft: 8,
  transition: 'all 0.3s ease',
  backgroundColor: {
    idle: theme.palette.grey[400],
    running: theme.palette.success.main,
    completed: theme.palette.info.main,
    error: theme.palette.error.main
  }[status],
  ...(status === 'running' && {
    animation: 'pulse 1.5s infinite',
  }),
}));

// 添加运行时间格式化函数
const formatDuration = (startTime?: number, endTime?: number): string => {
  if (!startTime) return '未开始';
  const end = endTime || Date.now();
  const duration = end - startTime;
  
  if (duration < 1000) return '< 1秒';
  if (duration < 60000) return `${Math.floor(duration / 1000)}秒`;
  if (duration < 3600000) {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
  }
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  return `${hours}小时${minutes}分`;
};

// 添加从 nodes/BaseNode.tsx 导入的样式组件
const NodeWrapper = styled(Box)<NodeWrapperProps>(({ theme, category, state }) => ({
  ...nodeStyles.base,
  ...(category && nodeStyles.categories[category as keyof typeof nodeStyles.categories]),
  ...(state && nodeStyles.states[state as keyof typeof nodeStyles.states]),
  
  // Modern internal layout
  display: 'flex',
  flexDirection: 'column',
  
  '.node-header': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    
    '.node-icon': {
      width: 28,
      height: 28,
      marginRight: 12,
      color: theme.palette.primary.main,
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
    
    '.node-title': {
      fontSize: '15px',
      fontWeight: 600,
      color: theme.palette.text.primary,
      letterSpacing: '-0.01em',
      display: 'flex',
      alignItems: 'center',
    }
  },
  
  '.node-content': {
    padding: '8px 0',
    flex: 1,
  },
  
  '.node-footer': {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: theme.palette.text.secondary,
  },
  
  // Connection point styles
  '.react-flow__handle': {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.primary.main}`,
    background: theme.palette.background.paper,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.2)',
    },
  },
  
  // Hover effect
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    '.node-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    },
  },

  // 添加状态指示器动画
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.2)',
      opacity: 0.8,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
}));

// 添加参数值渲染组件
const ParameterInput: React.FC<{
  param: Parameter;
  value: any;
  onChange: (value: any) => void;
}> = ({ param, value, onChange }) => {
  switch (param.type) {
    case 'boolean':
      return (
        <FormControl fullWidth size="small">
          <Select
            value={value ?? param.default ?? false}
            onChange={(e) => onChange(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
          </Select>
        </FormControl>
      );
    
    case 'select':
      return (
        <FormControl fullWidth size="small">
          <Select
            value={value ?? param.default ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {param.options?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    
    case 'number':
      return (
        <TextField
          type="number"
          size="small"
          value={value ?? param.default ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          InputProps={{
            endAdornment: param.unit && (
              <Typography variant="caption" sx={{ ml: 1 }}>
                {param.unit}
              </Typography>
            )
          }}
          sx={{ width: '100%' }}
        />
      );
    
    default:
      return (
        <TextField
          size="small"
          value={value ?? param.default ?? ''}
          onChange={(e) => onChange(e.target.value)}
          sx={{ width: '100%' }}
        />
      );
  }
};

export const BaseNode: React.FC<BaseNodeProps> = ({ data, category, state }) => {
  const [selectedTab, setSelectedTab] = useState<'parameters' | 'io' | 'specs' | 'primitives'>('parameters');
  const [runDuration, setRunDuration] = useState<string>('');
  const [paramValues, setParamValues] = useState<Record<string, any>>({});

  useEffect(() => {
    // 初始化参数值
    if (data.parameters && Array.isArray(data.parameters)) {
      const initialValues = data.parameters.reduce((acc, param) => ({
        ...acc,
        [param.name]: param.default
      }), {});
      setParamValues(initialValues);
    } else {
      setParamValues({});
    }
  }, [data.parameters]);

  // 处理参数值变化
  const handleParameterChange = (paramName: string, value: any) => {
    const newValues = { ...paramValues, [paramName]: value };
    setParamValues(newValues);
    
    if (data.onDataChange && data.parameters && Array.isArray(data.parameters)) {
      const updatedData = {
        ...data,
        parameters: data.parameters.map(param => 
          param.name === paramName 
            ? { ...param, default: value }
            : param
        )
      };
      data.onDataChange(updatedData);
    }
  };

  // 更新运行时间
  useEffect(() => {
    if (data.runStatus === 'running' && data.startTime) {
      const interval = setInterval(() => {
        setRunDuration(formatDuration(data.startTime));
      }, 1000);
      return () => clearInterval(interval);
    } else if (data.startTime && data.endTime) {
      setRunDuration(formatDuration(data.startTime, data.endTime));
    }
  }, [data.runStatus, data.startTime, data.endTime]);

  const handleUploadComplete = (inputId: string) => (result: any) => {
    console.log('File upload complete for input:', inputId, result);
    
    if (data.onDataChange) {
      const updatedData = {
        ...data,
        inputs: data.inputs?.map(input => 
          input.id === inputId 
            ? { 
                ...input, 
                value: {
                  fileName: result.fileName,
                  fileType: result.fileType,
                  data: result.data
                }
              }
            : input
        )
      };
      console.log('Updating node data:', updatedData);
      data.onDataChange(updatedData);
    }
  };

  const colors = nodeColors[data.category] || {
    handle: '#555',
    border: '#ddd',
    background: 'white',
    text: '#333'
  };

  return (
    <NodeWrapper category={category} state={state}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: colors.handle }}
      />
      
      <div className="node-header">
        {data.icon && React.createElement(data.icon, { className: "node-icon" })}
        <Typography className="node-title" variant="h6" component="h3">
          {data.label}
          <Tooltip title={`状态: ${data.runStatus || 'idle'}\n运行时间: ${runDuration || '未开始'}`}>
            <StatusIndicator status={data.runStatus || 'idle'} />
          </Tooltip>
        </Typography>
      </div>

      <div className="node-content">
        {selectedTab === 'parameters' && data.parameters && Array.isArray(data.parameters) && data.parameters.length > 0 ? (
          <div className="parameters-list">
            {data.parameters.map((param, index) => (
              <div key={index} className="parameter-item">
                <div className="param-header">
                  <span>{param.label}</span>
                  {param.unit && <span className="unit">{param.unit}</span>}
                </div>
                <ParameterInput
                  param={param}
                  value={paramValues[param.name]}
                  onChange={(value) => handleParameterChange(param.name, value)}
                />
              </div>
            ))}
          </div>
        ) : selectedTab === 'parameters' && (
          <div className="no-parameters">No parameters available</div>
        )}

        {selectedTab === 'io' && (
          <div className="tab-content">
            {data.inputs && (
              <div className="io-group">
                <h4>Inputs</h4>
                {data.inputs.map((input) => (
                  <div key={input.id} className="io-item">
                    <div className="io-header">
                      <span>{input.label}</span>
                      {input.required && <span className="required">*</span>}
                      <div className="io-upload-wrapper">
                        <FileUploader
                          inputId={input.id}
                          nodeId={data.id}
                          onUploadComplete={handleUploadComplete(input.id)}
                        />
                      </div>
                    </div>
                    {input.description && (
                      <div className="io-desc">{input.description}</div>
                    )}
                    {input.value?.fileName && (
                      <div className="io-file-info">
                        Uploaded: {input.value.fileName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {data.outputs && (
              <div className="io-section">
                <h4>Outputs</h4>
                {data.outputs.map((output, index) => (
                  <div key={index} className="io-item">
                    <div>{output.label}</div>
                    <div className="io-desc">{output.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'specs' && data.specs && (
          <div className="specs-list">
            {Object.entries(data.specs).map(([key, value]) => (
              <div key={key} className="spec-item">
                <div className="spec-label">{key}</div>
                <div>{value}</div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'primitives' && (
          <div className="node-content">
            {data.primitives && Object.keys(data.primitives).length > 0 ? (
              Object.entries(data.primitives).map(([primitiveName, primitiveData]) => (
                <div key={primitiveName} className="primitive-item">
                  <div className="primitive-header">
                    <span className="primitive-name">{primitiveName}</span>
                    <span className={`primitive-status ${primitiveData.enabled ? 'enabled' : 'disabled'}`}>
                      {primitiveData.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {primitiveData.disabledReason && (
                    <div className="primitive-description">{primitiveData.disabledReason}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-primitives">No primitives defined</div>
            )}
          </div>
        )}
      </div>

      <div className="node-footer">
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {runDuration || '未开始运行'}
        </Typography>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: colors.handle }}
      />
    </NodeWrapper>
  );
}; 
