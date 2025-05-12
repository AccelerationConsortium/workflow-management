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
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/theme.css';
import './styles/App.css';
import { ConnectionType, OperationNode, UnitOperation } from './types/workflow';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button } from '@mui/material';

// Import BaseNode separately
import { BaseNode } from './components/BaseNode';

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
  [key]: memo((props) => React.createElement(component, { ...props }))
}), {});

// Define SDL2 node types
const MemoizedSDL2Nodes = Object.entries(SDL2Nodes).reduce((acc, [key, component]) => ({
  ...acc,
  [key]: memo((props) => React.createElement(component, { ...props }))
}), {});

// Define all node types
const ALL_NODE_TYPES = {
  ...baseNodeTypes,
  ...MemoizedSDLCatalystNodes,
  ...MemoizedSDL2Nodes,
  conditional: memo(ConditionalNode),
  custom: CustomEdge
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
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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

  const [isRealRunMode, setIsRealRunMode] = useState(false);

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
    // 获取源节点和源句柄ID
    const sourceNode = nodes.find(node => node.id === params.source);
    const sourceNodeType = sourceNode?.type;
    const sourceHandleId = params.sourceHandle;

    // 设置连接配置对话框的参数
    setShowEdgeConfig(true);
    setSelectedEdge({
      ...params,
      // 添加源节点类型和源句柄ID，以便在EdgeConfig中使用
      sourceNodeType,
      sourceHandleId
    });
  }, [nodes]);

  const handleEdgeConfig = useCallback((config: EdgeConfig) => {
    if (selectedEdge) {
      // 获取源节点类型
      const sourceNode = nodes.find(node => node.id === selectedEdge.source);
      const sourceNodeType = sourceNode?.type;

      // 确定边的类型
      const edgeType = config.mode === 'conditional' || sourceNodeType === 'conditional'
        ? 'conditional'
        : 'custom';

      const edge = {
        ...selectedEdge,
        data: config,
        type: edgeType,
        label: config.label,
        style: config.style,
        animated: config.animated
      };

      setEdges((eds) => addEdge(edge, eds));
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
          workflowId: state.currentWorkflow?.id || undefined,
        },
      };

      console.log('Creating new node:', newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, state.currentWorkflow]
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
      // Extract label and params from node.data, ensuring they exist
      // IMPORTANT: Assumes node.data contains a 'label' string and a 'params' object
      // structured exactly like in test.json.
      const label = node.data?.label || node.type || 'Unnamed Node'; // Fallback label
      const params = node.data?.params || {}; // Fallback to empty object if no params in data

      // Construct the node object according to test.json format
      return {
        id: node.id,
        type: node.type,
        label: label, // Top-level label
        params: params  // Top-level params object (must match test.json structure internally)
      };
    });

    // --- Edges Transformation ---
    const transformedEdges = edges.map(edge => {
      // Only include source and target
      return {
        source: edge.source,
        target: edge.target
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
      alert("保存工作流失败：无法生成符合格式的工作流数据。");
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


    console.log('准备保存的工作流文件数据:', saveData);

    try {
      // Save to localStorage might need adjustment if WorkflowStorage expects the new format
      // WorkflowStorage.saveWorkflow(saveData); // Or maybe save just saveData.workflow? Check implementation.
      setShowSaveDialog(false);

      // Create and download the JSON file using the combined save data
      const workflowJson = JSON.stringify(saveData, null, 2); // Save the structure with metadata
      console.log('序列化后的 JSON 长度:', workflowJson.length);

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

      alert(`工作流 "${name}" 已保存并下载！`);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert(`保存工作流失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [generateWorkflowPayload]); // Dependency includes the payload generator

  /**
   * Sends the current workflow JSON to the remote execution endpoint.
   * Processes the structured response including step results and log file path.
   * Only proceeds if isRealRunMode is true.
   */
  const handleRunExperiment = useCallback(async () => {
    if (!isRealRunMode) {
      alert("当前处于模拟模式。请切换到真实运行模式以发送到远程机器。");
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
        alert("无法生成工作流数据，无法发送实验请求。");
        console.error("Failed to generate workflow payload for execution.");
        return;
    }

    console.log("准备发送到远程执行:", JSON.stringify(workflowPayload, null, 2));
    alert("正在发送实验请求到远程服务器...");

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
        const errorMsg = responseData.message || `服务器错误: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      console.log("远程运行结果:", responseData);

      if (responseData.results && responseData.execution_order) {
        updateNodesStatusFromResults(responseData.execution_order, responseData.results);
      } else {
         console.warn("Backend response missing 'results' or 'execution_order', cannot update node statuses.");
      }

      if (responseData.log_file) {
        console.log("远程日志文件:", responseData.log_file);
        alert(`实验执行完成！状态: ${responseData.status}. 日志文件: ${responseData.log_file}`);
      } else {
         alert(`实验执行完成！状态: ${responseData.status}.`);
      }

    } catch (error) {
      console.error("发送或处理实验请求失败:", error);
      alert(`实验请求失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [generateWorkflowPayload, isRealRunMode, setNodes, updateNodesStatusFromResults]);

  const Toolbar = () => {
    const createButtonRef = useRef<HTMLButtonElement>(null);

    return (
      <div className="toolbar" style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.8)', // Added background for visibility
        padding: '5px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
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
          💾 Save Workflow
        </button>
        <button onClick={() => {/* TODO: 添加加载功能 */}}>
          📂 Load Workflow
        </button>
        {/* Toggle Run Mode Button */}
        <button onClick={() => setIsRealRunMode(!isRealRunMode)} title={isRealRunMode ? "Switch to Simulation Mode" : "Switch to Real Run Mode"}>
          {isRealRunMode ? '🔬 Real Mode' : '💻 Sim Mode'}
        </button>
        {/* Run Experiment Button */}
        <button onClick={handleRunExperiment} disabled={!nodes.length} title={isRealRunMode ? "Send workflow to remote lab" : "Run simulation (or switch mode)"}>
           ▶️ Run Experiment
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
      >
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
          onInit={setReactFlowInstance}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          onNodeContextMenu={onNodeContextMenu}
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
          sourceNodeType={selectedEdge?.sourceNodeType}
          sourceHandleId={selectedEdge?.sourceHandleId}
          connection={selectedEdge}
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

      {/* 添加保存工作流的对话框 */}
      {showSaveDialog && (
        <SaveWorkflowDialog
          onSave={handleSaveWorkflow}
          onCancel={() => setShowSaveDialog(false)}
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

