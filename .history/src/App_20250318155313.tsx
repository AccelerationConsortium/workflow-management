import React, { useCallback, useRef, useState, useEffect, useMemo, memo } from 'react';
import { operationNodes } from './data/operationNodes';
import ReactFlow, { 
  Background, 
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  EdgeProps,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/theme.css';
import './styles/App.css';
import { ConnectionType, OperationNode } from './types/workflow';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import { Box, Button } from '@mui/material';

import Sidebar from './components/Sidebar';
import { DnDProvider, useDnD } from './context/DnDContext';
import {
  PowderDispenser,
  LiquidHandler,
  Homogenizer,
  Balancer,
  SampleLibrary,
  SampleSplitter,
  AutoSampler,
  NMRNode,
  MassSpectrometerNode,
  FluorometerNode,
  FTIRNode,
  RamanNode,
  ThermocyclerNode,
  BioreactorNode,
  FlowReactorNode,
  PhotoreactorNode,
  CrystallizerNode,
  FilterSystemNode,
  GelElectrophoresisNode,
  ColumnChromatographyNode,
  DataLoggerNode,
  MicroscopeNode,
  MultiChannelAnalyzerNode,
  ThermalImagerNode,
  CO2IncubatorNode,
  CleanBenchNode,
  GloveboxNode,
  TemperatureControllerNode,
  UltraLowFreezerNode,
  FileNode,
  DataUploadNode,
  PrepareElectrolyte,
  PrepareElectrolyte_1,
  MixSolution,
  HeatTreatment,
  Characterization,
  PumpControl,
} from './components/OperationNodes';
import { EdgeConfig } from './components/EdgeConfig';
import { ContextMenu } from './components/ContextMenu';
import { SaveWorkflowDialog } from './components/SaveWorkflowDialog';
import { WorkflowStorage } from './services/workflowStorage';
import './components/Toolbar.css';
import { WorkflowSimulator } from './components/WorkflowSimulator';
import { ValidatedNode } from './components/ValidatedNode';
import { ValidationResult } from './types/validation';
import { NodeProperties } from './components/NodeProperties';
import { unitOperationService } from './services/unitOperationService';
import { CustomEdge } from './components/CustomEdge';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { WorkflowStepCreator } from './components/WorkflowStepCreator';
import { WorkflowStepPanel } from './components/WorkflowStepPanel';
import { ControlPanel } from './components/ControlPanel';
import { useControlPanelState } from './hooks/useControlPanelState';
import { BaseNode } from './components/nodes/BaseNode';
import TestStylePage from './components/TestStylePage';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#4BBCD4',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Node' },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

// 将所有节点组件用 memo 包装并移到组件外部
const MemoizedNodes = {
  baseNode: memo(BaseNode),
  PrepareElectrolyte: memo(PrepareElectrolyte),
  PrepareElectrolyte_1: memo(PrepareElectrolyte_1),
  MixSolution: memo(MixSolution),
  HeatTreatment: memo(HeatTreatment),
  Characterization: memo(Characterization),
  powderDispenser: memo(PowderDispenser),
  liquidHandler: memo(LiquidHandler),
  homogenizer: memo(Homogenizer),
  balancer: memo(Balancer),
  sampleLibrary: memo(SampleLibrary),
  sampleSplitter: memo(SampleSplitter),
  autoSampler: memo(AutoSampler),
  nmr: memo(NMRNode),
  massSpectrometer: memo(MassSpectrometerNode),
  fileInput: memo(FileNode),
  dataUpload: memo(DataUploadNode),
  PumpControl: memo(PumpControl),
};

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [propertiesPosition, setPropertiesPosition] = useState(null);
  const [showEdgeConfig, setShowEdgeConfig] = useState(false);
  const [testUOs, setTestUOs] = useState<OperationNode[]>([]);
  const { state, dispatch } = useWorkflow();

  const {
    parameterImpacts,
    visualizationTemplates,
    shortcuts,
    operationGroups,
    handleParameterChange,
    handleUndo,
    setCurrentNodeId
  } = useControlPanelState();

  // 获取测试节点数据
  useEffect(() => {
    // 使用本地数据
    const testNodes = operationNodes.filter(node => node.category === 'Test');
    setTestUOs(testNodes);
  }, []);

  const onConnectStart = useCallback((_, { nodeId, handleId }) => {
    console.log('Connection started:', nodeId, handleId);
  }, []);

  const onConnectEnd = useCallback((event) => {
    console.log('Connection ended:', event);
  }, []);

  const onConnect = useCallback((params) => {
    setShowEdgeConfig(true);
    setSelectedEdge(params);
  }, []);

  const handleEdgeConfig = useCallback((config: EdgeConfig) => {
    if (selectedEdge) {
      const edge = {
        ...selectedEdge,
        data: config,
        type: 'custom',
      };
      setEdges((eds) => addEdge(edge, eds));
      setShowEdgeConfig(false);
      setSelectedEdge(null);
    }
  }, [selectedEdge, setEdges]);

  const addConnection = useCallback(
    (type: ConnectionType) => {
      if (!selectedConnection) return;

      const newEdge = {
        ...selectedConnection,
        type,
        label: type === 'parallel' ? 'Parallel' : 
               type === 'conditional' ? 'If' : 
               'Sequential',
        animated: type === 'parallel',
        style: {
          stroke: type === 'parallel' ? '#1a90ff' : 
                 type === 'conditional' ? '#722ed1' : '#000',
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setSelectedConnection(null);
    },
    [selectedConnection, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 使用 useMemo 来缓存 nodeTypes
  const nodeTypes = useMemo(() => MemoizedNodes, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 从 operationNodes 中找到对应的节点定义
      const nodeDefinition = operationNodes.find(node => node.type === type);
      
      if (!nodeDefinition) {
        console.warn(`No definition found for node type: ${type}`);
        return;
      }

      const newNode = {
        id: `${type}_${getId()}`,
        type,
        position,
        data: {
          ...nodeDefinition,
          id: `${type}_${getId()}`,
        },
      };

      console.log('Creating new node:', newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onEdgeClick = useCallback((event, edge) => {
    event.preventDefault();
    setSelectedEdge(edge);
  }, []);

  const handleEdgeUpdate = useCallback((updatedEdge) => {
    setEdges(eds => 
      eds.map(edge => 
        edge.id === updatedEdge.id ? updatedEdge : edge
      )
    );
  }, []);

  const onEdgeDelete = useCallback((edge: Edge) => {
    setEdges(edges => edges.filter(e => e.id !== edge.id));
  }, [setEdges]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();
      
      const menuPosition = {
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id
      };
      
      setContextMenu(menuPosition);
    },
    []
  );

  const handleDeleteNode = useCallback(() => {
    if (!contextMenu) return;
    
    setNodes((nodes) => nodes.filter((node) => node.id !== contextMenu.nodeId));
    setEdges((edges) => edges.filter(
      (edge) => edge.source !== contextMenu.nodeId && edge.target !== contextMenu.nodeId
    ));
    setContextMenu(null);
  }, [contextMenu, setNodes, setEdges]);

  const handleDuplicateNode = useCallback(() => {
    if (!contextMenu) return;
    
    const sourceNode = nodes.find(node => node.id === contextMenu.nodeId);
    if (sourceNode) {
      const newNode = {
        ...sourceNode,
        id: `${sourceNode.type}-${Date.now()}`,
        position: {
          x: sourceNode.position.x + 250,
          y: sourceNode.position.y
        }
      };
      setNodes((nds) => [...nds, newNode]);
    }
    setContextMenu(null);
  }, [contextMenu, nodes, setNodes]);

  // 点击画布时关闭右键菜单
  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    setSelectedNode(null);
    setPropertiesPosition(null);
  }, []);

  const duplicateNode = useCallback(() => {
    if (!contextMenu) return;

    const node = nodes.find(n => n.id === contextMenu.nodeId);
    if (!node) return;

    const newNode = {
      ...node,
      id: getId(),
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };

    setNodes(nds => [...nds, newNode]);
    setContextMenu(null);
  }, [contextMenu, nodes, setNodes]);

  const deleteNode = useCallback(() => {
    if (!contextMenu) return;

    setNodes(nds => nds.filter(n => n.id !== contextMenu.nodeId));
    setEdges(eds => eds.filter(
      e => e.source !== contextMenu.nodeId && e.target !== contextMenu.nodeId
    ));
    setContextMenu(null);
  }, [contextMenu, setNodes, setEdges]);

  const handleCopyNode = useCallback(() => {
    if (contextMenu) {
      const sourceNode = nodes.find(node => node.id === contextMenu.nodeId);
      if (sourceNode) {
        // 创建新节点，复制原节点的数据
        const newNode = {
          ...sourceNode,
          id: `${sourceNode.type}-${Date.now()}`, // 生成新的唯一ID
          position: {
            x: sourceNode.position.x + 250, // 在原节点右侧创建
            y: sourceNode.position.y
          }
        };
        
        setNodes((nds) => [...nds, newNode]);
      }
      setContextMenu(null);
    }
  }, [contextMenu, nodes, setNodes]);

  interface EdgeWithButtonsProps extends EdgeProps {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    label?: string;
    style?: React.CSSProperties;
    data?: any;
  }

  const EdgeWithButtons: React.FC<EdgeWithButtonsProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label,
    style = {},
    data,
  }) => {
    const deltaX = Math.abs(targetX - sourceX);
    const deltaY = Math.abs(targetY - sourceY);
    
    const controlPointOffset = Math.min(deltaX * 0.5, 150);
    
    const controlPoint1X = sourceX + (targetX > sourceX ? controlPointOffset : -controlPointOffset);
    const controlPoint1Y = sourceY;
    const controlPoint2X = targetX - (targetX > sourceX ? controlPointOffset : -controlPointOffset);
    const controlPoint2Y = targetY;
    
    const edgePath = `M ${sourceX},${sourceY} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${targetX},${targetY}`;

    return (
      <>
        <path
          id={id}
          style={{
            ...style,
            stroke: 'var(--edge-color)',
            strokeWidth: 2,
          }}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd="url(#edge-arrow)"
        />
        {label && (
          <text>
            <textPath
              href={`#${id}`}
              style={{ fontSize: '12px' }}
              startOffset="50%"
              textAnchor="middle"
              dominantBaseline="text-after-edge"
              dy="-5"
            >
              {label}
            </textPath>
          </text>
        )}
        <g
          transform={`translate(${(sourceX + targetX) / 2}, ${(sourceY + targetY) / 2})`}
          className="edge-buttons"
        >
          <rect
            x="-12"
            y="-12"
            width="24"
            height="24"
            fill="white"
            rx="4"
          />
          <circle
            className="edge-button"
            cx="0"
            cy="0"
            r="8"
            stroke="#ff4d4f"
            strokeWidth="1"
            fill="white"
            onClick={(event) => {
              event.stopPropagation();
              onEdgeDelete({ id } as Edge);
            }}
          />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#ff4d4f"
            fontSize="12"
            pointerEvents="none"
          >
            ×
          </text>
        </g>
      </>
    );
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Delete selected nodes
        setNodes(nds => nds.filter(n => !n.selected));
        // Delete related edges
        setEdges(eds => eds.filter(
          e => !nodes.find(n => n.selected && (e.source === n.id || e.target === n.id))
        ));
      } else if (event.ctrlKey || event.metaKey) {
        if (event.key === 'c') {
          // Copy selected nodes
          const selectedNodes = nodes.filter(n => n.selected);
          if (selectedNodes.length > 0) {
            localStorage.setItem('clipboard', JSON.stringify(selectedNodes));
          }
        } else if (event.key === 'v') {
          // Paste nodes
          const clipboard = localStorage.getItem('clipboard');
          if (clipboard) {
            const pastedNodes = JSON.parse(clipboard).map((node: Node) => ({
              ...node,
              id: getId(),
              position: {
                x: node.position.x + 50,
                y: node.position.y + 50,
              },
            }));
            setNodes(nds => [...nds, ...pastedNodes]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, setNodes, setEdges]);

  const handleSaveWorkflow = (name: string, description: string) => {
    const workflowData = {
      name,
      description,
      nodes,
      edges,
    };
    
    try {
      WorkflowStorage.saveWorkflow(workflowData);
      setShowSaveDialog(false);
      // 可以添加一个提示保存成功
    } catch (error) {
      console.error('Failed to save workflow:', error);
      // 可以添加一个错误提示
    }
  };

  const Toolbar = () => {
    const createButtonRef = useRef<HTMLButtonElement>(null);

    return (
      <div className="toolbar" style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <button 
          ref={createButtonRef}
          onClick={handleCreateWorkflow}
          className={state.isCreatingWorkflow ? 'active' : ''}
        >
          Create Workflow
        </button>
        {state.isCreatingWorkflow && (
          <WorkflowStepPanel 
            anchorEl={createButtonRef.current} 
          />
        )}
        <button onClick={() => setShowSaveDialog(true)}>
          Save Workflow
        </button>
        <button onClick={() => {/* TODO: 添加加载功能 */}}>
          Load Workflow
        </button>
      </div>
    );
  };

  const handleValidationComplete = (result: ValidationResult) => {
    setValidationErrors(result);
    if (result.isValid) {
      console.log('Workflow is valid!');
    } else {
      console.error('Validation errors:', result.errors);
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 检查点击的是否是节点标题区域
    const target = event.target as HTMLElement;
    if (!target.closest('.node-header')) {
      return; // 如果不是标题区域，不显示属性面板
    }
    
    // 计算弹出位置，确保在视口内
    const rect = target.getBoundingClientRect();
    const position = {
      x: Math.min(rect.right + 10, window.innerWidth - 290),
      y: Math.min(rect.top, window.innerHeight - 400)
    };

    setSelectedNode({
      id: node.id,
      type: node.type,
      data: node.data,
      position
    });
  }, []);

  const handleNodeUpdate = useCallback(async (
    nodeId: string, 
    data: Partial<UnitOperation>
  ) => {
    try {
      // 调用API更新节点数据
      const updatedUO = await unitOperationService.updateUnitOperation(nodeId, data);
      
      // 更新本地状态
      setNodes(nds => 
        nds.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, ...updatedUO } }
            : node
        )
      );
    } catch (error) {
      console.error('Failed to update node:', error);
      // 这里可以添加错误提示
    }
  }, []);

  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    if (state.isCreatingWorkflow && state.selectedNodeIds.length > 0) {
      event.preventDefault();
      setContextMenuPosition({
        x: event.clientX,
        y: event.clientY
      });
    }
  }, [state.isCreatingWorkflow, state.selectedNodeIds]);

  // 当节点变化时，同步到 WorkflowContext
  useEffect(() => {
    dispatch({ type: 'SET_NODES', payload: nodes });
  }, [nodes, dispatch]);

  useEffect(() => {
    dispatch({ type: 'SET_EDGES', payload: edges });
  }, [edges, dispatch]);

  // 确保在创建工作流时初始化 currentWorkflow
  const handleCreateWorkflow = () => {
    dispatch({ 
      type: 'SET_CURRENT_WORKFLOW', 
      payload: {
        id: `workflow-${Date.now()}`,
        name: '',
        description: '',
        steps: [],
        status: 'draft',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: 'user',
          version: '1.0',
          tags: []
        }
      }
    });
    dispatch({ type: 'SET_WORKFLOW_CREATING', payload: true });
  };

  // 在节点选择时更新当前节点
  const onNodeSelect = (nodeId: string) => {
    setCurrentNodeId(nodeId);
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
      <Sidebar />
      <div 
        className="flow-container" 
        ref={reactFlowWrapper}
        onContextMenu={handleContextMenu}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={{ custom: CustomEdge }}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          onNodeContextMenu={onNodeContextMenu}
        >
          <Background />
          <Controls />
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              nodeId={contextMenu.nodeId}
              onClose={() => setContextMenu(null)}
            />
          )}
          {contextMenu && (
            <div
              className="context-menu"
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 1000,
              }}
            >
              <button onClick={handleDeleteNode}>
                <span role="img" aria-label="delete">🗑️</span> Delete Node
              </button>
              <button onClick={handleDuplicateNode}>
                <span role="img" aria-label="duplicate">📋</span> Duplicate Node
              </button>
            </div>
          )}
          <WorkflowSimulator
            nodes={nodes}
            edges={edges}
            onValidationComplete={handleValidationComplete}
          />
        </ReactFlow>
        <EdgeConfig
          isOpen={showEdgeConfig}
          onClose={() => {
            setShowEdgeConfig(false);
            setSelectedEdge(null);
          }}
          onSave={handleEdgeConfig}
        />
        <Toolbar />
        {selectedNode && (
          <NodeProperties
            node={selectedNode}
            position={selectedNode.position}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleNodeUpdate}
          />
        )}
        {contextMenuPosition && (
          <WorkflowStepCreator
            position={contextMenuPosition}
            onClose={() => setContextMenuPosition(null)}
          />
        )}
        <ControlPanel
          parameterImpacts={parameterImpacts}
          visualizationTemplates={visualizationTemplates}
          shortcuts={shortcuts}
          operationGroups={operationGroups}
          onParameterChange={handleParameterChange}
          onUndo={handleUndo}
        />
      </div>
    </Box>
  );
}

function App() {
  // 添加一个状态来控制是否显示测试页面
  const [showTestPage, setShowTestPage] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showTestPage ? (
        <>
          <Box sx={{ position: 'fixed', top: 10, left: 10, zIndex: 9999 }}>
            <Button 
              variant="contained" 
              onClick={() => setShowTestPage(false)}
              size="small"
            >
              Back to Main App
            </Button>
          </Box>
          <TestStylePage />
        </>
      ) : (
        <>
          <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
            <Button 
              variant="contained" 
              onClick={() => setShowTestPage(true)}
              size="small"
            >
              Test Styles
            </Button>
          </Box>
          <WorkflowProvider>
            <DnDProvider>
              <ReactFlowProvider>
                <Flow />
              </ReactFlowProvider>
            </DnDProvider>
          </WorkflowProvider>
        </>
      )}
    </ThemeProvider>
  );
}

export default App; 
