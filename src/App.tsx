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
  NodeTypes,
  Node,
  ReactFlowInstance,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/theme.css';
import './styles/App.css';
import { ConnectionType, OperationNode, UnitOperation, WorkflowData } from './types/workflow';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import SaveIcon from '@mui/icons-material/Save';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import ComputerIcon from '@mui/icons-material/Computer';
import ScienceIcon from '@mui/icons-material/Science';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Import BaseNode separately
import { BaseNode } from './components/BaseNode';
import { CustomUONode } from './components/OperationNodes/CustomUONode';
import { customUOService } from './services/customUOService';

// Import all node components
import {
  FileNode,
  DataUploadNode,
  PowderDispenser,
  LiquidHandler,
  Homogenizer,
  Balancer,
  SampleLibrary,
  SampleSplitter,
  AutoSampler,
  NMRNode,
  MassSpectrometerNode,
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
  PrepareElectrolyte,
  MixSolution,
  HeatTreatment,
  Characterization,
  PumpControl,
  ValveControl,
  HotplateControl,
  BalanceControl,
  Activation
} from './components/OperationNodes';
import ConditionalNode from './components/OperationNodes/ConditionalNode';

// Import other components and contexts
import { DnDProvider, useDnD } from './context/DnDContext';
import { EdgeConfig } from './components/EdgeConfig';
import { ContextMenu } from './components/ContextMenu';
import { SaveWorkflowDialog } from './components/SaveWorkflowDialog';
import { LoadWorkflowDialog } from './components/LoadWorkflowDialog';
import { WorkflowStorage } from './services/workflowStorage';
import { WorkflowSimulator } from './components/WorkflowSimulator';
import { ValidatedNode } from './components/ValidatedNode';
import { ValidationResult } from './types/validation';
import { NodeProperties } from './components/NodeProperties';
import { unitOperationService } from './services/unitOperationService';
import { CustomEdge } from './components/CustomEdge';
import ConditionalEdge from './components/edges/ConditionalEdge';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { WorkflowStepCreator } from './components/WorkflowStepCreator';
import { WorkflowStepPanel } from './components/WorkflowStepPanel';
import { ControlPanel } from './components/ControlPanel';
import { useControlPanelState } from './hooks/useControlPanelState';
import { SDLCatalystNodes } from './components/OperationNodes/SDLCatalyst';
import { SDL2Nodes } from './components/OperationNodes/SDL2';
import Sidebar from './components/Sidebar';
import TestStylePage from './components/TestStylePage';
import { UORegistrationButton } from './components/UOBuilder/UORegistrationButton';
import { EdgeConfig as EdgeConfigFromComponent } from './components/EdgeConfig';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#105A73', // Deep Sea / Dark Cyan
    },
    secondary: {
      main: '#198492', // Teal me teal / Lighter Teal
    },
    background: {
      default: '#FFFFFF', // Pure White
      paper: '#FFFFFF',   // Pure White for surfaces like cards, dialogs
    },
    text: {
      primary: '#212121',   // Near Black for primary text
      secondary: '#757575', // Medium Grey for secondary text
    },
    divider: '#E0E0E0', // Light Grey for dividers
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Keep button text as is (e.g., "Click Me" instead of "CLICK ME")
    }
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

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Node' },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

// Define base node types outside of the component
const baseNodeTypes = {
  fileInput: memo(FileNode),
  dataUpload: memo(DataUploadNode),
  powderDispenser: memo(PowderDispenser),
  liquidHandler: memo(LiquidHandler),
  homogenizer: memo(Homogenizer),
  balancer: memo(Balancer),
  sampleLibrary: memo(SampleLibrary),
  sampleSplitter: memo(SampleSplitter),
  autoSampler: memo(AutoSampler),
  nmr: memo(NMRNode),
  massSpectrometer: memo(MassSpectrometerNode),
  filterSystem: memo(FilterSystemNode),
  gelElectrophoresis: memo(GelElectrophoresisNode),
  columnChromatography: memo(ColumnChromatographyNode),
  dataLogger: memo(DataLoggerNode),
  microscope: memo(MicroscopeNode),
  multiChannelAnalyzer: memo(MultiChannelAnalyzerNode),
  thermalImager: memo(ThermalImagerNode),
  co2Incubator: memo(CO2IncubatorNode),
  cleanBench: memo(CleanBenchNode),
  glovebox: memo(GloveboxNode),
  temperatureController: memo(TemperatureControllerNode),
  ultraLowFreezer: memo(UltraLowFreezerNode),
  prepareElectrolyte: memo(PrepareElectrolyte),
  mixSolution: memo(MixSolution),
  heatTreatment: memo(HeatTreatment),
  characterization: memo(Characterization),
  pumpControl: memo(PumpControl),
  valveControl: memo(ValveControl),
  hotplateControl: memo(HotplateControl),
  balanceControl: memo(BalanceControl),
  activation: memo(Activation)
};

// Define SDL Catalyst node types
const MemoizedSDLCatalystNodes = Object.entries(SDLCatalystNodes).reduce((acc, [key, component]) => ({
  ...acc,
  [key]: memo((props: NodeProps) => React.createElement(component as React.ComponentType<NodeProps>, props))
}), {});

// Define SDL2 node types
const MemoizedSDL2Nodes = Object.entries(SDL2Nodes).reduce((acc, [key, component]) => ({
  ...acc,
  [key]: memo((props: NodeProps) => React.createElement(component as React.ComponentType<NodeProps>, props))
}), {});

// Define all node types
const ALL_NODE_TYPES: NodeTypes = {
  ...baseNodeTypes,
  ...MemoizedSDLCatalystNodes,
  ...MemoizedSDL2Nodes,
  customUO: memo(CustomUONode), // 添加自定义UO节点类型
  // custom: CustomEdge, // Removed: CustomEdge is an edge type, should be in edgeTypes
};

// Define the remote execution endpoint
const REMOTE_EXECUTION_URL = "https://SissiFeng-catalyst-OT2.hf.space/run_experiment";

// Interface for backend step result
interface StepResult {
  step_index: number;
  label: string; // Ideally backend should return node id
  status: 'success' | 'error';
  message?: string;
  // other potential fields from backend result
}

// Interface for backend overall response
interface WorkflowExecutionResponse {
  status: 'success' | 'partial_failure' | 'error';
  results?: StepResult[];
  execution_order?: string[];
  log_file?: string;
  message?: string; // For top-level errors
}

// Default Global Config (Example based on test.json - replace/manage as needed)
const DEFAULT_GLOBAL_CONFIG = {
    labware: {
      reactor_plate: { type: "opentrons_24_wellplate_3.4ml_pcr_full_skirt", slot: 9, working_well: "B2" },
      wash_station: { type: "opentrons_6_wellplate_16.2ml_flat", slot: 3 },
      tip_rack: { type: "opentrons_96_tiprack_1000ul", slot: 1 },
      electrode_tip_rack: { type: "opentrons_96_tiprack_300ul", slot: 10 },
      solution_rack: { type: "opentrons_12_reservoir_21000ul", slot: 2 }
    },
    instruments: {
      pipette: { type: "p1000_single_gen2", mount: "right" }
    },
    solutions: {
      electrolyte: { labware: "solution_rack", position: "A1" },
      wash_solution: { labware: "solution_rack", position: "A2" }
    },
    arduino_control: {
      pumps: { water: 0, acid: 1, out: 2 },
      temperature: { default: 25.0 }
    },
    biologic_control: {
      reference_electrode: { type: "RE", enabled: true }
    }
};

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<any>>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Use ALL_NODE_TYPES directly
  const nodeTypes = ALL_NODE_TYPES;

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
    conditional: ConditionalEdge
  }), []);

  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [propertiesPosition, setPropertiesPosition] = useState<{ x: number; y: number } | null>(null);
  const [showEdgeConfig, setShowEdgeConfig] = useState(false);
  const [testUOs, setTestUOs] = useState<any[]>([]);
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

  const [isRealRunMode, setIsRealRunMode] = useState(false);

  // 获取测试节点数据
  useEffect(() => {
    // 使用本地数据
    const testNodes = operationNodes.filter(node => node.category === 'Test');
    setTestUOs(testNodes);
  }, []);

  const onConnectStart = useCallback((event: React.MouseEvent | React.TouchEvent, { nodeId, handleId }: { nodeId: string | null, handleId: string | null }) => {
    console.log('Connection started:', nodeId, handleId);
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    console.log('Connection ended:', event);
  }, []);

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const sourceNodeType = sourceNode?.type;
    const sourceHandleId = params.sourceHandle;

    setShowEdgeConfig(true);
    setSelectedEdge({
      ...params,
      data: { sourceNodeType, sourceHandleId } // Storing source info for context in EdgeConfig if needed later or for edge type determination
    } as Edge);
  }, [nodes]);

  const handleEdgeConfig = useCallback((config: EdgeConfigFromComponent) => {
    if (selectedEdge) {
      const sourceNode = nodes.find(node => node.id === selectedEdge.source);
      // Retrieve sourceNodeType from selectedEdge.data if it was stored there, or directly from sourceNode
      const sourceNodeTypeFromData = selectedEdge.data?.sourceNodeType || sourceNode?.type;

      let edgeType = 'custom'; // Default edge type
      let edgeLabel = config.mode === 'sequential' ? 'Sequential' :
                      config.mode === 'parallel' ? 'Parallel' :
                      'Conditional';
      let edgeStyle: React.CSSProperties = {};
      let edgeAnimated = false;

      const edgeData = { ...selectedEdge.data, ...config }; // Merge existing data with new config from EdgeConfig

      if (config.mode === 'conditional') {
        edgeType = 'conditional'; // Always use conditional edge type for this mode
        edgeStyle = { stroke: '#722ed1' }; // Style for conditional edges
        if (config.conditionType === 'boolean') {
          edgeLabel = config.expression ? `If: ${config.expression}` : 'Boolean Condition';
        } else if (config.conditionType === 'switch') {
          edgeLabel = config.expression ? `Switch: ${config.expression}` : 'Switch Condition';
          // Potentially add case count to label or other info if desired
        }
      } else if (config.mode === 'parallel') {
        edgeType = 'custom'; // Or a specific parallel edge type if you have one
        edgeStyle = { stroke: '#1a90ff' };
        edgeAnimated = true;
      } else { // Sequential
        edgeType = 'custom';
        if (config.delay) edgeLabel += ` (Delay: ${config.delay}ms)`;
        if (config.retries) edgeLabel += ` (Retries: ${config.retries}retries)`;
      }

      const newEdge: Edge = {
        ...selectedEdge, // Includes id, source, target, sourceHandle, targetHandle
        data: edgeData,  // All config from EdgeConfig is now here, plus original sourceNodeType etc.
        type: edgeType,
        label: edgeLabel,
        style: edgeStyle,
        animated: edgeAnimated,
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setShowEdgeConfig(false);
      setSelectedEdge(null);
    }
  }, [selectedEdge, setEdges, nodes]);

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
      const reactFlowWrapperCurrent = reactFlowWrapper.current;
      if (!reactFlowWrapperCurrent) return; // Null check

      const reactFlowBounds = reactFlowWrapperCurrent.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }
      const currentReactFlowInstance = reactFlowInstance;
      if (!currentReactFlowInstance) return; // Null check

      const position = currentReactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 检查是否是自定义UO
      const customUO = customUOService.getUOById(type);

      let nodeDefinition;
      let nodeType = type;

      if (customUO) {
        // 自定义UO
        nodeDefinition = {
          type: type,
          label: customUO.name,
          description: customUO.description,
          category: customUO.category,
          isCustom: true
        };
        nodeType = 'customUO'; // 使用通用的customUO节点类型
      } else {
        // 标准节点
        nodeDefinition = operationNodes.find(node => node.type === type);

        if (!nodeDefinition) {
          console.warn(`No definition found for node type: ${type}`);
          return;
        }
      }

      const newNode = {
        id: `${type}_${getId()}`,
        type: nodeType,
        position,
        data: {
          ...nodeDefinition,
          id: `${type}_${getId()}`,
          workflowId: state.currentWorkflow?.id || undefined,
          customUOId: customUO ? type : undefined,
          schema: customUO || undefined,
        },
      };

      console.log('Creating new node:', newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, state.currentWorkflow]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setSelectedEdge(edge);
  }, []);

  const handleEdgeUpdate = useCallback((updatedEdge: Edge) => {
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
      const targetElement = event.target as HTMLElement;
      const isInputFocused = targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA' || targetElement.isContentEditable;

      if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputFocused) {
        // Only delete nodes if not focused on an input/textarea
        setNodes(nds => nds.filter(n => !n.selected));
        setEdges(eds => eds.filter(
          e => !nodes.find(n => n.selected && (e.source === n.id || e.target === n.id))
        ));
      } else if ((event.ctrlKey || event.metaKey) && !isInputFocused) { // Also check for input focus for copy/paste
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

  /**
   * Updates the execution status visual representation on the nodes.
   * @param {string[]} executionOrder - Array of node IDs in execution order.
   * @param {StepResult[]} results - Array of results for each step from the backend.
   */
  const updateNodesStatusFromResults = useCallback((executionOrder: string[], results: StepResult[]) => {
    setNodes((currentNodes) => {
      // Create a map for quick lookup of results by execution order index
      const resultMap = new Map<string, StepResult>();
      results.forEach((result, index) => {
        // Use the node ID from executionOrder at the same index to map the result
        if (executionOrder && executionOrder[index]) {
           const nodeId = executionOrder[index];
           resultMap.set(nodeId, result);
        } else {
           console.warn(`Result at index ${index} could not be mapped to execution order.`);
        }
      });

      return currentNodes.map((node) => {
        const result = resultMap.get(node.id);
        if (result) {
          // Update the node's data with the execution status
          // Ensure data object exists
          const newData = {
             ...(node.data || {}), // Preserve existing data
             executionStatus: result.status, // Add or update status
             executionMessage: result.message // Optional: Add message if exists
          };
          return { ...node, data: newData };
        }
        // Reset status for nodes not in this run? Or keep previous status?
        // For now, only update nodes that were part of this execution.
        // Resetting might be better for clarity on subsequent runs.
        // Let's reset status for nodes *not* in the current executionOrder:
        else if (executionOrder.includes(node.id)) {
             // Node was expected but no result? Should not happen if backend is correct. Mark as unknown?
             // Or maybe the node wasn't executed due to upstream failure. Keep its status null/undefined.
             return node; // Keep as is for now
        } else {
            // Node was not part of this execution run, reset its status
            const newData = { ...(node.data || {}) };
            delete newData.executionStatus; // Remove status from previous runs
            delete newData.executionMessage;
            return { ...node, data: newData };
        }
        // return node; // Keep nodes not in results unchanged
      });
    });
    console.log("Node statuses updated based on execution results.");
     // 📝 TODO: Trigger visual updates in BaseNode/specific nodes based on `data.executionStatus`
  }, [setNodes]);

  /**
   * Generates the workflow payload in the format matching test.json.
   * Includes global_config, structured nodes, and simplified edges.
   * @returns {object | null} The workflow data object or null if generation fails.
   */
  const generateWorkflowPayload = useCallback(() => {
    // --- Nodes Transformation ---
    const transformedNodes = nodes.map(node => {
      const label = node.data?.label || node.type || 'Unnamed Node';
      const params = node.data?.params || {};
      return {
        id: node.id,
        type: node.type,
        label: label,
        params: params
      };
    });

    // --- Edges Transformation (FIXED) ---
    const transformedEdges = edges.map(edge => {
      return {
        id: edge.id,                     // Include edge id
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle, // Include sourceHandle
        targetHandle: edge.targetHandle, // Include targetHandle
        type: edge.type,                 // Include edge type (e.g., 'conditional', 'custom')
        data: edge.data,                // CRITICAL: Include all data from EdgeConfig
        label: edge.label,              // Optional: include label if backend uses it
        animated: edge.animated,        // Optional: include animated status
        style: edge.style               // Optional: include style object
      };
    });

    // --- Combine with Global Config ---
    const finalPayload = {
      global_config: DEFAULT_GLOBAL_CONFIG, // Using the default for now
      nodes: transformedNodes,
      edges: transformedEdges
    };

     // Basic validation
     if (!finalPayload.nodes || finalPayload.nodes.length === 0) {
        console.error("Workflow generation failed: No nodes found.");
        return null; // Return null if no nodes
     }
     if (!finalPayload.edges) { // Edges might be empty for single-node workflows
        console.warn("Workflow generation: No edges found.");
     }


    return finalPayload;
  }, [nodes, edges]); // Dependencies: nodes and edges

  /**
   * Handles saving the workflow to local storage and downloading as a JSON file.
   * @param {string} name - The name for the workflow.
   * @param {string} description - The description for the workflow.
   */
  const handleSaveWorkflow = useCallback((name: string, description: string) => {
    const workflowPayload = generateWorkflowPayload(); // Use the new generator
    if (!workflowPayload) {
      console.error("Failed to generate workflow payload for saving.");
      alert("can't generate workflow data, can't save workflow.");
      return;
    }

    // Add metadata separate from the core payload if needed for the file,
    // but the core payload sent to execution should match test.json
    const saveData = {
       // Metadata for the saved file itself
       metadata: {
          id: `workflow-${Date.now()}`,
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'user',
          version: '1.0',
          tags: []
       },
       // The actual workflow data matching test.json structure
       workflow: workflowPayload
    };


    console.log('ready to save workflow file', saveData);

    try {
      // Save to localStorage might need adjustment if WorkflowStorage expects the new format
      // WorkflowStorage.saveWorkflow(saveData); // Or maybe save just saveData.workflow? Check implementation.
      setShowSaveDialog(false);

      // Create and download the JSON file using the combined save data
      const workflowJson = JSON.stringify(saveData, null, 2); // Save the structure with metadata
      console.log('json length:', workflowJson.length);

      const blob = new Blob([workflowJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeName || 'workflow'}_${saveData.metadata.id}.json`; // Use metadata id
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      alert(`workflow "${name}" saved and downloaded!`);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert(`Failed to save workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [generateWorkflowPayload]); // Dependency includes the payload generator

  /**
   * Handles loading a workflow from a JSON file.
   * Parses the file and updates the canvas with the loaded nodes and edges.
   * @param {File} file - The JSON file to load.
   */
  const handleLoadWorkflow = useCallback((file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const workflowData = JSON.parse(content);

        if (!workflowData || !workflowData.workflow) {
          throw new Error('Invalid workflow file format');
        }

        const { workflow, metadata } = workflowData;

        // Extract nodes from the workflow
        const loadedNodes = workflow.nodes.map((node: any) => {
          // Find the node definition from operationNodes
          const nodeDefinition = operationNodes.find(n => n.type === node.type);

          // Create a position for the node if it doesn't have one
          // In a real implementation, positions would be saved in the JSON
          const position = {
            x: Math.random() * 500,
            y: Math.random() * 300
          };

          return {
            id: node.id,
            type: node.type,
            position,
            data: {
              ...nodeDefinition,
              id: node.id,
              label: node.label,
              params: node.params || {},
              workflowId: metadata?.id
            }
          };
        });

        // Extract edges from the workflow
        const loadedEdges = workflow.edges.map((edge: any) => {
          return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: edge.type || 'custom',
            data: edge.data || {},
            label: edge.label || '',
            animated: edge.animated || false,
            style: edge.style || {}
          };
        });

        // Update the canvas with the loaded nodes and edges
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setShowLoadDialog(false);

        console.log('Workflow loaded successfully:', metadata?.name);
        alert(`Workflow "${metadata?.name}" loaded successfully!`);
      } catch (error) {
        console.error('Failed to load workflow:', error);
        alert(`Failed to load workflow: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading file');
    };

    reader.readAsText(file);
  }, [operationNodes, setNodes, setEdges]);

  /**
   * Sends the current workflow JSON to the remote execution endpoint.
   * Processes the structured response including step results and log file path.
   * Only proceeds if isRealRunMode is true.
   */
  const handleRunExperiment = useCallback(async () => {
    if (!isRealRunMode) {
      alert("current mode: simulation. please switch to real run mode to send to remote machine.");
      console.log("Simulation mode active. Remote execution skipped.");
      return;
    }

    // Reset statuses before sending the new run
     setNodes((nds) =>
         nds.map((n) => {
             const newData = { ...(n.data || {}) };
             delete newData.executionStatus;
             delete newData.executionMessage;
             return { ...n, data: newData };
         })
     );

    const workflowPayload = generateWorkflowPayload(); // Generate the payload matching test.json
    if (!workflowPayload) {
        alert("can't generate workflow data, can't send experiment request.");
        console.error("Failed to generate workflow payload for execution.");
        return;
    }

    console.log("ready to send to remote execution:", JSON.stringify(workflowPayload, null, 2));
    alert("sending experiment request to remote server...");

    try {
      const response = await fetch(REMOTE_EXECUTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(workflowPayload) // Send the correctly formatted payload
      });

      const responseData: WorkflowExecutionResponse = await response.json();

      if (!response.ok) {
        const errorMsg = responseData.message || `server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      console.log("remote execution result:", responseData);

      if (responseData.results && responseData.execution_order) {
        updateNodesStatusFromResults(responseData.execution_order, responseData.results);
      } else {
         console.warn("Backend response missing 'results' or 'execution_order', cannot update node statuses.");
      }

      if (responseData.log_file) {
        console.log("remote log file:", responseData.log_file);
        alert(`experiment execution completed! status: ${responseData.status}. log file: ${responseData.log_file}`);
      } else {
         alert(`experiment execution completed! status: ${responseData.status}.`);
      }

    } catch (error) {
      console.error("failed to send or process experiment request:", error);
      alert(`experiment request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [generateWorkflowPayload, isRealRunMode, setNodes, updateNodesStatusFromResults]);

  const Toolbar = () => {
    const createButtonRef = useRef<HTMLButtonElement>(null);

    // 定义按钮样式
    const buttonStyle = {
      borderRadius: '12px',
      padding: '10px 16px',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontSize: '16px',
      textTransform: 'none' as const,
      minWidth: '160px',
      height: '48px',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }
    };

    // 定义不同按钮的颜色 - 使用赛博柔和色调
    const buttonColors = {
      create: {
        backgroundColor: '#41C4A9', // Deep Aqua
        color: 'white',
        '&:hover': {
          backgroundColor: '#35A38B',
        },
        '&.active': {
          backgroundColor: '#2A8270',
        }
      },
      save: {
        backgroundColor: '#F08A7E', // Techno Coral
        color: 'white',
        '&:hover': {
          backgroundColor: '#E57A6E',
        }
      },
      load: {
        backgroundColor: '#8F7FE8', // Matrix Purple
        color: 'white',
        '&:hover': {
          backgroundColor: '#7A6BD0',
        }
      },
      mode: {
        backgroundColor: '#A3E048', // Lime
        color: '#1A3A3A',
        '&:hover': {
          backgroundColor: '#8BC53F',
        }
      },
      run: {
        backgroundColor: '#00A3B4', // Teal
        color: 'white',
        '&:hover': {
          backgroundColor: '#008A99',
        },
        '&:disabled': {
          backgroundColor: '#cccccc',
          color: '#666666',
        }
      }
    };

    return (
      <div className="toolbar" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '20px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        {/* UO Registration Button */}
        <UORegistrationButton
          onUORegistered={(result) => {
            if (result.success) {
              console.log('UO registered successfully:', result.schema);
              // Show success message
              alert(`Unit Operation "${result.schema?.name}" registered successfully! Check the sidebar to see your new custom UO.`);
            } else {
              console.error('UO registration failed:', result.error);
              alert(`Registration failed: ${result.error}`);
            }
          }}
        />
        <Button
          ref={createButtonRef}
          onClick={handleCreateWorkflow}
          sx={{
            ...buttonStyle,
            ...buttonColors.create,
            ...(state.isCreatingWorkflow ? buttonColors.create['&.active'] : {})
          }}
          startIcon={<CreateIcon sx={{ fontSize: 22 }} />}
        >
          Create Workflow
        </Button>
        {state.isCreatingWorkflow && (
          <WorkflowStepPanel
            anchorEl={createButtonRef.current}
          />
        )}
        <Button
          onClick={() => setShowSaveDialog(true)}
          sx={{
            ...buttonStyle,
            ...buttonColors.save
          }}
          startIcon={<SaveIcon sx={{ fontSize: 22 }} />}
        >
          Save Workflow
        </Button>
        <Button
          onClick={() => setShowLoadDialog(true)}
          sx={{
            ...buttonStyle,
            ...buttonColors.load
          }}
          startIcon={<FileOpenIcon sx={{ fontSize: 22 }} />}
        >
          Load Workflow
        </Button>
        {/* Toggle Run Mode Button */}
        <Button
          onClick={() => setIsRealRunMode(!isRealRunMode)}
          title={isRealRunMode ? "Switch to Simulation Mode" : "Switch to Real Run Mode"}
          sx={{
            ...buttonStyle,
            ...buttonColors.mode
          }}
          startIcon={isRealRunMode ? <ScienceIcon sx={{ fontSize: 22 }} /> : <ComputerIcon sx={{ fontSize: 22 }} />}
        >
          {isRealRunMode ? 'Real Mode' : 'Sim Mode'}
        </Button>
        {/* Run Experiment Button */}
        <Button
          onClick={handleRunExperiment}
          disabled={!nodes.length}
          title={isRealRunMode ? "Send workflow to remote lab" : "Run simulation (or switch mode)"}
          sx={{
            ...buttonStyle,
            ...buttonColors.run,
            ...(nodes.length ? {} : buttonColors.run['&:disabled'])
          }}
          startIcon={<PlayArrowIcon sx={{ fontSize: 22 }} />}
        >
          Run Experiment
        </Button>
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

    // 不再显示属性面板，取消basic/advance卡片功能
    // 保留事件处理以防止其他副作用
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
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 2,
          width: '100%',
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(16,90,115,0.05) 0%, rgba(255,255,255,0) 100%)'
        }}>
          <Toolbar />
        </Box>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={(instance: ReactFlowInstance) => setReactFlowInstance(instance)}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          onNodeContextMenu={onNodeContextMenu}
          style={{ flexGrow: 1 }}
        >
          <Background />
          <Controls />
          {contextMenu && (
            <div
              className="context-menu"
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 1000,
                background: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                borderRadius: '4px',
                padding: '8px 0',
                minWidth: '150px'
              }}
            >
              <button
                onClick={handleDeleteNode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span role="img" aria-label="delete" style={{ marginRight: '8px' }}>🗑️</span> Delete Node
              </button>
              <button
                onClick={handleDuplicateNode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span role="img" aria-label="duplicate" style={{ marginRight: '8px' }}>📋</span> Duplicate Node
              </button>
            </div>
          )}
          <WorkflowSimulator
            workflow={generateWorkflowPayload() as WorkflowData | null}
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
        {selectedNode && selectedNode.type && selectedNode.data && (
          <NodeProperties
            node={{ ...selectedNode, type: selectedNode.type as string } as Node<UnitOperation>}
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
          currentNodeId={selectedNode?.id || null}
          workflowId={state.currentWorkflow?.id || 'default-workflow'}
          optimizationParameters={selectedNode?.data?.parameters?.map(p => ({
            id: p.id,
            name: p.name,
            min: p.min || 0,
            max: p.max || 100,
            currentValue: p.value,
            unit: p.unit
          })) || []}
          onParameterChange={(paramId, value) => {
            if (selectedNode) {
              handleParameterChange(selectedNode.id, paramId, value);
            }
          }}
          onUndo={handleUndo}
          onApplyOptimizationSuggestion={(parameters) => {
            if (selectedNode) {
              // 应用优化建议到节点参数
              Object.entries(parameters).forEach(([paramId, value]) => {
                handleParameterChange(selectedNode.id, paramId, value);
              });
            }
          }}
        />
      </div>

      {/* 添加保存工作流的对话框 */}
      {showSaveDialog && (
        <SaveWorkflowDialog
          onSave={handleSaveWorkflow}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}

      {/* 添加加载工作流的对话框 */}
      {showLoadDialog && (
        <LoadWorkflowDialog
          onLoad={handleLoadWorkflow}
          onCancel={() => setShowLoadDialog(false)}
        />
      )}
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

