import React, { useCallback, useRef, useState } from 'react';
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
  EdgeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/theme.css';
import { ConnectionType } from './types/workflow';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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

const nodeTypes = {
  powderDispenser: PowderDispenser,
  liquidHandler: LiquidHandler,
  homogenizer: Homogenizer,
  balancer: Balancer,
  sampleLibrary: SampleLibrary,
  sampleSplitter: SampleSplitter,
  autoSampler: AutoSampler,
  
  nmr: NMRNode,
  massSpectrometer: MassSpectrometerNode,
  fluorometer: FluorometerNode,
  ftir: FTIRNode,
  raman: RamanNode,
  
  thermocycler: ThermocyclerNode,
  bioreactor: BioreactorNode,
  flowReactor: FlowReactorNode,
  photoreactor: PhotoreactorNode,
  
  crystallizer: CrystallizerNode,
  filterSystem: FilterSystemNode,
  gelElectrophoresis: GelElectrophoresisNode,
  columnChromatography: ColumnChromatographyNode,
  
  dataLogger: DataLoggerNode,
  microscope: MicroscopeNode,
  multiChannelAnalyzer: MultiChannelAnalyzerNode,
  thermalImager: ThermalImagerNode,
  
  co2Incubator: CO2IncubatorNode,
  cleanBench: CleanBenchNode,
  glovebox: GloveboxNode,
  temperatureController: TemperatureControllerNode,
  ultraLowFreezer: UltraLowFreezerNode,
  
  fileInput: FileNode,
  dataUpload: DataUploadNode,
};

const validationRules = [
  {
    type: 'required' as const,
    field: 'Sample ID',
    message: 'Sample ID column is required'
  },
  {
    type: 'required' as const,
    field: 'Concentration',
    message: 'Concentration column is required'
  }
];

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

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

  const onConnectStart = useCallback((_, { nodeId, handleId }) => {
    console.log('Connection started:', nodeId, handleId);
  }, []);

  const onConnectEnd = useCallback((event) => {
    console.log('Connection ended:', event);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setSelectedConnection(connection);
    },
    []
  );

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

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} Node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type]
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
      
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

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

  const Toolbar = () => (
    <div className="toolbar">
      <button onClick={() => setShowSaveDialog(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Save Workflow
      </button>
      <button onClick={() => {/* TODO: 添加加载功能 */}}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Load Workflow
      </button>
    </div>
  );

  const handleValidationComplete = (result: ValidationResult) => {
    setValidationErrors(result);
    if (result.isValid) {
      console.log('Workflow is valid!');
    } else {
      console.error('Validation errors:', result.errors);
    }
  };

  const onNodeClick = useCallback((event, node) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 计算弹出位置，确保在视口内
    const rect = event.target.getBoundingClientRect();
    const position = {
      x: Math.min(rect.right + 10, window.innerWidth - 290), // 290 = popup width + margin
      y: Math.min(rect.top, window.innerHeight - 400) // 400 = max popup height
    };
    
    setSelectedNode(node);
    setPropertiesPosition(position);
  }, []);

  // 点击画布空白处关闭属性面板
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setPropertiesPosition(null);
  }, []);

  return (
    <div className="flow-container" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        style={{
          backgroundColor: theme.palette.background.default
        }}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
      >
        <Controls />
        <Background />
        <Toolbar />
      </ReactFlow>
      <Sidebar />
      
      {selectedConnection && (
        <div className="connection-dialog">
          <h3>Select Connection Type</h3>
          <button onClick={() => addConnection('sequential')}>Sequential</button>
          <button onClick={() => addConnection('parallel')}>Parallel</button>
          <button onClick={() => addConnection('conditional')}>Conditional</button>
          <button onClick={() => setSelectedConnection(null)}>Cancel</button>
        </div>
      )}

      {selectedEdge && (
        <EdgeConfig
          edge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onUpdate={handleEdgeUpdate}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={deleteNode}
          onDuplicate={duplicateNode}
        />
      )}

      {showSaveDialog && (
        <SaveWorkflowDialog
          onSave={handleSaveWorkflow}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}

      <NodeProperties
        node={selectedNode}
        position={propertiesPosition}
        onClose={() => {
          setSelectedNode(null);
          setPropertiesPosition(null);
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReactFlowProvider>
        <DnDProvider>
          <Flow />
        </DnDProvider>
      </ReactFlowProvider>
    </ThemeProvider>
  );
}

export default App; 