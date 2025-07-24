import asyncio
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from backend.executors.base_executor import BaseExecutor, TaskConfig, TaskResult, TaskStatus
from backend.api.websocket_service import ws_manager
from backend.services.provenance_logger import provenance_logger

logger = logging.getLogger(__name__)

@dataclass
class SDLWorkflowState:
    workflow_id: str
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    current_step: Optional[str] = None
    progress: float = 0.0
    results: Dict[str, Any] = None
    error: Optional[str] = None

class SDLCatalystExecutor(BaseExecutor):
    
    def __init__(self):
        self._workflows: Dict[str, SDLWorkflowState] = {}
        self._task_status: Dict[str, TaskStatus] = {}
        self._task_logs: Dict[str, list[str]] = {}
        self._provenance_run_ids: Dict[str, str] = {}
    
    async def initialize(self) -> None:
        logger.info("Initializing SDL Catalyst executor")
        pass
    
    def _log_task(self, task_id: str, message: str) -> None:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        log_entry = f"[{timestamp}] {message}"
        if task_id not in self._task_logs:
            self._task_logs[task_id] = []
        self._task_logs[task_id].append(log_entry)
        logger.info(f"Task {task_id}: {message}")
    
    async def _update_workflow_progress(self, workflow_id: str, progress: float, current_step: str) -> None:
        if workflow_id in self._workflows:
            workflow = self._workflows[workflow_id]
            workflow.progress = progress
            workflow.current_step = current_step
            logger.info(f"Workflow {workflow_id}: {progress}% - {current_step}")
            
            await ws_manager.broadcast_workflow_update(
                workflow_id,
                {
                    "progress": progress,
                    "current_step": current_step,
                    "status": workflow.status
                }
            )
    
    async def _execute_sdl_workflow(self, workflow_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        workflow = SDLWorkflowState(
            workflow_id=workflow_id,
            status="pending",
            start_time=datetime.now(),
            results={},
        )
        self._workflows[workflow_id] = workflow
        
        try:
            workflow.status = "running"
            await ws_manager.broadcast_workflow_update(
                workflow_id,
                {"status": "running", "progress": 0}
            )
            
            nodes = config.get("nodes", [])
            edges = config.get("edges", [])
            sdl7_nodes = [node for node in nodes if node.get("type", "").startswith("sdl7")]
            
            if sdl7_nodes:
                return await self._execute_sdl7_workflow(workflow_id, workflow, config)
            else:
                return await self._execute_traditional_sdl_workflow(workflow_id, workflow, config)
                
        except Exception as e:
            workflow.status = "failed"
            workflow.error = str(e)
            workflow.end_time = datetime.now()
            await ws_manager.broadcast_workflow_update(
                workflow_id,
                {
                    "status": "failed",
                    "error": str(e)
                }
            )
            raise
    
    async def _execute_sdl7_workflow(self, workflow_id: str, workflow: SDLWorkflowState, config: Dict[str, Any]) -> Dict[str, Any]:
        nodes = config.get("nodes", [])
        edges = config.get("edges", [])
        
        primitive_operations = []
        execution_order = self._determine_execution_order(nodes, edges)
        
        current_progress = 0
        total_nodes = len(execution_order)
        
        for i, node_id in enumerate(execution_order):
            node = next((n for n in nodes if n["id"] == node_id), None)
            if not node:
                continue
                
            node_type = node.get("type", "")
            if node_type.startswith("sdl7"):
                primitives = self._expand_sdl7_node(node)
                primitive_operations.extend(primitives)
                
                for j, primitive in enumerate(primitives):
                    trace_id = f"{workflow_id}_{node['id']}_{j}"
                    primitive_with_tracking = {
                        **primitive,
                        "trace_id": trace_id,
                        "parent_uo_id": node['id'],
                        "uo_type": node_type
                    }
                    
                    current_step = f"Executing {primitive['operation']} for {node.get('data', {}).get('label', node_type)}"
                    await self._update_workflow_progress(
                        workflow_id, 
                        current_progress + (i + (j + 1) / len(primitives)) * (100 / total_nodes),
                        current_step
                    )
                    
                    await self._execute_primitive_operation(primitive_with_tracking)
                    await asyncio.sleep(0.5)
            
            current_progress = (i + 1) * (100 / total_nodes)
        
        workflow.results = {
            "sdl7_execution": {
                "status": "success",
                "total_unit_operations": len([n for n in nodes if n.get("type", "").startswith("sdl7")]),
                "total_primitive_operations": len(primitive_operations),
                "executed_operations": primitive_operations
            },
            "execution_time": f"{(datetime.now() - workflow.start_time).total_seconds():.2f}s"
        }
        
        workflow.status = "completed"
        workflow.end_time = datetime.now()
        await ws_manager.broadcast_workflow_update(
            workflow_id,
            {
                "status": "completed",
                "progress": 100,
                "results": workflow.results
            }
        )
        return workflow.results
    
    async def _execute_traditional_sdl_workflow(self, workflow_id: str, workflow: SDLWorkflowState, _config: Dict[str, Any]) -> Dict[str, Any]:
        steps = [
            ("Initialize parameters", 10),
            ("Load data", 30),
            ("Execute analysis", 60),
            ("Generate report", 90),
            ("Complete", 100)
        ]
        
        for step, progress in steps:
            await self._update_workflow_progress(workflow_id, progress, step)
            await asyncio.sleep(1)
        
        workflow.results = {
            "analysis_results": {
                "status": "success",
                "metrics": {
                    "accuracy": 0.95,
                    "performance": "good"
                }
            },
            "execution_time": "5s",
            "resource_usage": {
                "cpu": "45%",
                "memory": "1.2GB"
            }
        }
        
        workflow.status = "completed"
        workflow.end_time = datetime.now()
        await ws_manager.broadcast_workflow_update(
            workflow_id,
            {
                "status": "completed",
                "progress": 100,
                "results": workflow.results
            }
        )
        return workflow.results
    
    def _determine_execution_order(self, nodes: list, edges: list) -> list:
        node_ids = [node["id"] for node in nodes]
        
        if not edges:
            return node_ids
        
        dependencies = {node_id: [] for node_id in node_ids}
        for edge in edges:
            target = edge.get("target")
            source = edge.get("source")
            if target in dependencies and source in node_ids:
                dependencies[target].append(source)
        
        visited = set()
        result = []
        
        def visit(node_id):
            if node_id in visited:
                return
            visited.add(node_id)
            for dep in dependencies.get(node_id, []):
                visit(dep)
            result.append(node_id)
        
        for node_id in node_ids:
            visit(node_id)
        
        return result
    
    def _expand_sdl7_node(self, node: Dict[str, Any]) -> list:
        node_type = node.get("type", "")
        node_data = node.get("data", {})
        parameters = node_data.get("parameters", {})
        
        operations = []
        
        if node_type == "sdl7PrepareAndInjectHPLCSample":
            operations.extend([
                {
                    "operation": "sample_aliquot",
                    "parameters": {
                        "source_tray": parameters.get("source_tray", "reaction_tray"),
                        "source_vial": parameters.get("source_vial", "A1"),
                        "dest_tray": parameters.get("dest_tray", "hplc"),
                        "dest_vial": parameters.get("dest_vial", "A1"),
                        "aliquot_volume_ul": parameters.get("aliquot_volume_ul", 100)
                    }
                }
            ])
            
            if parameters.get("perform_weighing", True):
                operations.append({
                    "operation": "weigh_container",
                    "parameters": {
                        "vial": parameters.get("dest_vial", "A1"),
                        "tray": parameters.get("dest_tray", "hplc"),
                        "sample_name": parameters.get("sample_name", f"Sample_{parameters.get('dest_vial', 'A1')}"),
                        "to_hplc_inst": True
                    }
                })
            
            operations.append({
                "operation": "run_hplc",
                "parameters": {
                    "method": parameters.get("hplc_method", "standard_curve_01"),
                    "sample_name": parameters.get("sample_name", f"Sample_{parameters.get('dest_vial', 'A1')}"),
                    "stall": parameters.get("stall", False),
                    "vial": parameters.get("dest_vial", "A1"),
                    "vial_hplc_location": f"P2-{parameters.get('dest_vial', 'A1')}",
                    "inj_vol": parameters.get("injection_volume", 5)
                }
            })
            
        elif node_type == "sdl7RunExtractionAndTransferToHPLC":
            operations.extend([
                {
                    "operation": "run_extraction",
                    "parameters": {
                        "stir_time": parameters.get("stir_time", 5),
                        "settle_time": parameters.get("settle_time", 2),
                        "rate": parameters.get("rate", 1000),
                        "reactor": parameters.get("reactor", 1),
                        "time_units": parameters.get("time_units", "min"),
                        "output_file": f"extraction_{parameters.get('sample_name', 'sample')}.csv"
                    }
                },
                {
                    "operation": "extraction_vial_from_reactor",
                    "parameters": {
                        "vial": parameters.get("extraction_vial", "A1")
                    }
                }
            ])
            
            if parameters.get("perform_aliquot", True):
                operations.append({
                    "operation": "sample_aliquot",
                    "parameters": {
                        "source_tray": "extraction_tray",
                        "source_vial": parameters.get("extraction_vial", "A1"),
                        "dest_tray": "hplc",
                        "dest_vial": parameters.get("extraction_vial", "A1"),
                        "aliquot_volume_ul": parameters.get("aliquot_volume_ul", 100)
                    }
                })
            
            operations.append({
                "operation": "run_hplc",
                "parameters": {
                    "method": parameters.get("hplc_method", "extraction_analysis"),
                    "sample_name": parameters.get("sample_name", "Extraction_Sample"),
                    "stall": False,
                    "vial": parameters.get("extraction_vial", "A1"),
                    "vial_hplc_location": f"P2-{parameters.get('extraction_vial', 'A1')}",
                    "inj_vol": parameters.get("injection_volume", 10)
                }
            })
            
        elif node_type == "sdl7DeckInitialization":
            operations.extend([
                {
                    "operation": "initialize_deck",
                    "parameters": {
                        "experiment_name": parameters.get("experiment_name", "SDL7_Experiment"),
                        "solvent_file": parameters.get("solvent_file", "solvents_default.csv"),
                        "method_name": parameters.get("method_name", "standard_curve_01"),
                        "inj_vol": parameters.get("injection_volume", 5)
                    }
                },
                {
                    "operation": "hplc_instrument_setup",
                    "parameters": {
                        "method": parameters.get("method_name", "standard_curve_01"),
                        "injection_volume": parameters.get("injection_volume", 5),
                        "sequence": parameters.get("sequence", None)
                    }
                }
            ])
            
        elif node_type == "sdl7AddSolventToSampleVial":
            operations.append({
                "operation": "add_solvent",
                "parameters": {
                    "vial": parameters.get("vial", "A1"),
                    "tray": parameters.get("tray", "hplc"),
                    "solvent": parameters.get("solvent", "Methanol"),
                    "solvent_vol": parameters.get("solvent_vol", 900),
                    "clean": parameters.get("clean", False)
                }
            })
            
            if parameters.get("perform_weighing", False):
                operations.append({
                    "operation": "weigh_container",
                    "parameters": {
                        "vial": parameters.get("vial", "A1"),
                        "tray": parameters.get("tray", "hplc"),
                        "sample_name": parameters.get("sample_name", f"{parameters.get('solvent', 'Methanol')}_{parameters.get('vial', 'A1')}"),
                        "to_hplc_inst": False
                    }
                })
        
        return operations
    
    async def _execute_primitive_operation(self, operation: Dict[str, Any]) -> Dict[str, Any]:
        op_name = operation.get("operation", "unknown")
        op_params = operation.get("parameters", {})
        trace_id = operation.get("trace_id")
        parent_uo_id = operation.get("parent_uo_id")
        condition = operation.get("condition")
        
        if condition:
            logger.info(f"Executing conditional primitive: {op_name} (condition: {condition}) [trace: {trace_id}]")
        else:
            logger.info(f"Executing primitive operation: {op_name} [trace: {trace_id}]")
        
        operation_delays = {
            "sample_aliquot": 2.0,
            "weigh_container": 3.0,
            "run_hplc": 5.0,
            "run_extraction": 10.0,
            "extraction_vial_from_reactor": 2.0,
            "initialize_deck": 5.0,
            "hplc_instrument_setup": 3.0,
            "add_solvent": 1.5
        }
        
        delay = operation_delays.get(op_name, 1.0)
        await asyncio.sleep(delay)
        
        return {
            "status": "completed", 
            "operation": op_name, 
            "execution_time": delay,
            "trace_id": trace_id,
            "parent_uo_id": parent_uo_id,
            "condition": condition
        }
    
    async def execute_task(self, config: TaskConfig) -> TaskResult:
        self._task_status[config.task_id] = TaskStatus.RUNNING
        self._log_task(config.task_id, f"Starting SDL workflow: {config.task_type}")
        
        run_id = None
        
        try:
            workflow_config = config.parameters.get("workflow_config")
            if not workflow_config:
                raise ValueError("workflow_config is required")
            
            workflow_id = f"sdl_wf_{config.task_id}"
            
            run_id = provenance_logger.start_run(
                workflow_id=workflow_id,
                workflow_config=workflow_config,
                user_id=config.parameters.get("user_id"),
                trigger_source="workflow_api",
                function_name=config.task_type,
                input_data=config.parameters
            )
            self._provenance_run_ids[config.task_id] = run_id
            self._log_task(config.task_id, f"Started provenance tracking: {run_id}")
            
            self._log_task(config.task_id, f"Executing SDL workflow {workflow_id}")
            result = await self._execute_sdl_workflow(workflow_id, workflow_config)
            
            self._task_status[config.task_id] = TaskStatus.SUCCESS
            self._log_task(config.task_id, "Workflow completed successfully")
            
            provenance_logger.finish_run(
                run_id=run_id,
                output_data=result,
                status="completed"
            )
            
            return TaskResult(
                task_id=config.task_id,
                status=TaskStatus.SUCCESS,
                result={
                    "workflow_id": workflow_id,
                    "workflow_state": self._workflows[workflow_id],
                    "provenance_run_id": run_id,
                    **result
                },
                logs=self._task_logs.get(config.task_id, [])
            )
            
        except Exception as e:
            error_msg = str(e)
            self._log_task(config.task_id, f"Workflow failed: {error_msg}")
            self._task_status[config.task_id] = TaskStatus.ERROR
            
            if run_id:
                provenance_logger.finish_run(
                    run_id=run_id,
                    status="failed",
                    error_message=error_msg
                )
            
            return TaskResult(
                task_id=config.task_id,
                status=TaskStatus.ERROR,
                error=error_msg,
                logs=self._task_logs.get(config.task_id, [])
            )
    
    async def get_status(self, task_id: str) -> TaskStatus:
        return self._task_status.get(task_id, TaskStatus.PENDING)
    
    def get_workflow_state(self, workflow_id: str) -> Optional[SDLWorkflowState]:
        return self._workflows.get(workflow_id)
    
    async def cleanup(self) -> None:
        self._workflows.clear()
        self._task_status.clear()
        self._task_logs.clear()
        self._provenance_run_ids.clear()
        logger.info("SDL Catalyst executor cleaned up")