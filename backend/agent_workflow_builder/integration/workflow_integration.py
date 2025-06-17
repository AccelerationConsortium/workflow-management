"""
Workflow Integration Module

Integrates the AI agent with the existing UO creation and workflow system.
Ensures compatibility with CustomUOService and existing backend execution logic.
"""

import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

class WorkflowIntegration:
    """
    Integration layer between AI agent and existing workflow system
    
    Handles:
    - Converting AI-generated UOs to GeneratedUOSchema format
    - Integrating with CustomUOService registration flow
    - Using existing workflow construction logic
    - Maintaining compatibility with backend execution
    """
    
    def __init__(self):
        """Initialize integration with existing system templates"""
        self.existing_uo_types = self._load_existing_uo_types()
        
    def _load_existing_uo_types(self) -> Dict[str, Any]:
        """Load existing UO types from the main system"""
        # This would typically connect to the existing UO registry
        # For now, we'll use known types from the codebase
        return {
            "cv": {
                "category": "electrochemical",
                "description": "Cyclic Voltammetry measurement",
                "executor": "sdl_catalyst_executor",
                "function": "cv"
            },
            "lsv": {
                "category": "electrochemical", 
                "description": "Linear Sweep Voltammetry",
                "executor": "sdl_catalyst_executor",
                "function": "lsv"
            },
            "ocv": {
                "category": "electrochemical",
                "description": "Open Circuit Voltage measurement", 
                "executor": "sdl_catalyst_executor",
                "function": "ocv"
            },
            "add_liquid": {
                "category": "liquid_handling",
                "description": "Add liquid to container",
                "executor": "python_executor",
                "function": "add_liquid"
            },
            "heat": {
                "category": "temperature_control",
                "description": "Heat sample to target temperature",
                "executor": "python_executor", 
                "function": "heat"
            },
            "stir": {
                "category": "mixing",
                "description": "Stir solution for mixing",
                "executor": "python_executor",
                "function": "stir"
            },
            "wait": {
                "category": "timing",
                "description": "Wait for specified duration",
                "executor": "python_executor",
                "function": "wait"
            },
            "transfer": {
                "category": "liquid_handling",
                "description": "Transfer liquid between containers",
                "executor": "python_executor",
                "function": "transfer"
            },
            "wash": {
                "category": "cleaning",
                "description": "Wash equipment or container",
                "executor": "python_executor",
                "function": "wash"
            },
            "robot_move_to": {
                "category": "robotic_control",
                "description": "Move robotic arm to specified position",
                "executor": "sdl_catalyst_executor",
                "function": "robot_move_to"
            },
            "robot_pick": {
                "category": "robotic_control",
                "description": "Execute pick operation with robotic arm",
                "executor": "sdl_catalyst_executor",
                "function": "robot_pick"
            },
            "robot_place": {
                "category": "robotic_control",
                "description": "Execute place operation with robotic arm",
                "executor": "sdl_catalyst_executor",
                "function": "robot_place"
            },
            "robot_home": {
                "category": "robotic_control",
                "description": "Move robotic arm to home position",
                "executor": "sdl_catalyst_executor",
                "function": "robot_home"
            },
            "robot_execute_sequence": {
                "category": "robotic_control",
                "description": "Execute robot motion sequence/script",
                "executor": "sdl_catalyst_executor",
                "function": "robot_execute_sequence"
            },
            "robot_wait": {
                "category": "robotic_control",
                "description": "Robot wait/synchronization operation",
                "executor": "sdl_catalyst_executor",
                "function": "robot_wait"
            }
        }
    
    def convert_to_generated_uo_schema(self, operation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert AI-generated operation to GeneratedUOSchema format
        
        This ensures compatibility with the existing CustomUOService
        """
        operation_type = operation.get("type", "unknown")
        params = operation.get("params", {})
        
        # Generate parameters in the expected format
        generated_parameters = []
        
        for param_name, param_value in params.items():
            param_type = self._infer_parameter_type(param_value)
            
            generated_param = {
                "id": f"{operation_type}_{param_name}",
                "name": param_name,
                "type": param_type,
                "required": True,
                "defaultValue": param_value,
                "description": f"{param_name.replace('_', ' ').title()} parameter"
            }
            
            # Add validation based on parameter type
            if param_type == "number":
                generated_param["validation"] = self._get_number_validation(param_name, param_value)
            elif param_type == "string":
                generated_param["validation"] = {"pattern": ".*"}
                
            generated_parameters.append(generated_param)
        
        # Create GeneratedUOSchema compatible structure
        schema = {
            "id": operation.get("id", str(uuid.uuid4())),
            "name": operation.get("name", operation_type.replace("_", " ").title()),
            "description": operation.get("description", f"AI-generated {operation_type} operation"),
            "category": self._get_category_for_operation(operation_type),
            "parameters": generated_parameters,
            "createdAt": datetime.now().isoformat(),
            "version": "1.0.0"
        }
        
        return schema
    
    def _infer_parameter_type(self, value: Any) -> str:
        """Infer parameter type from value"""
        if isinstance(value, bool):
            return "boolean"
        elif isinstance(value, (int, float)):
            return "number"
        elif isinstance(value, str):
            # Check if it's a date
            try:
                datetime.fromisoformat(value)
                return "date"
            except:
                return "string"
        else:
            return "string"
    
    def _get_number_validation(self, param_name: str, value: float) -> Dict[str, Any]:
        """Get validation rules for number parameters"""
        validation = {}
        
        # Set reasonable bounds based on parameter name
        if "temperature" in param_name.lower():
            validation["min"] = -273.15  # Absolute zero
            validation["max"] = 500      # Reasonable lab max
        elif "voltage" in param_name.lower():
            validation["min"] = -10
            validation["max"] = 10
        elif "volume" in param_name.lower():
            validation["min"] = 0
            validation["max"] = 1000    # 1L max
        elif "duration" in param_name.lower() or "time" in param_name.lower():
            validation["min"] = 0
            validation["max"] = 86400   # 24 hours max
        elif "speed" in param_name.lower() or "rate" in param_name.lower():
            validation["min"] = 0
            validation["max"] = 10000   # Reasonable speed max
        else:
            # Default bounds
            validation["min"] = 0
            validation["max"] = 1000
            
        return validation
    
    def _get_category_for_operation(self, operation_type: str) -> str:
        """Get category for operation type"""
        if operation_type in self.existing_uo_types:
            return self.existing_uo_types[operation_type]["category"]
        else:
            return "general"
    
    def build_workflow_for_canvas(self, operations: List[Dict[str, Any]], 
                                metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Build workflow JSON compatible with existing Canvas system
        
        Uses the same node/edge structure as the existing system
        """
        workflow_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Build metadata compatible with existing system
        workflow_metadata = {
            "id": workflow_id,
            "name": metadata.get("name", "AI Generated Workflow") if metadata else "AI Generated Workflow",
            "description": metadata.get("description", "Workflow generated from natural language") if metadata else "Workflow generated from natural language",
            "created_at": timestamp,
            "created_by": "AI Agent",
            "version": "1.0.0",
            "tags": ["AI Generated", "Natural Language"]
        }
        
        if metadata:
            workflow_metadata.update(metadata)
        
        # Build nodes and edges using existing structure
        nodes, edges = self._build_canvas_nodes_and_edges(operations)
        
        # Create workflow structure compatible with existing system
        workflow = {
            "metadata": workflow_metadata,
            "workflow": {
                "nodes": nodes,
                "edges": edges,
                "viewport": {"x": 0, "y": 0, "zoom": 1}
            },
            "execution": {
                "status": "draft",
                "total_steps": len(operations),
                "estimated_duration": self._estimate_total_duration(operations),
                "required_devices": self._get_required_devices(operations),
                "execution_order": [node["id"] for node in nodes if node["type"] == "operationNode"]
            },
            "validation": {
                "is_valid": True,
                "errors": [],
                "warnings": [],
                "last_validated": timestamp
            }
        }
        
        return workflow
    
    def _build_canvas_nodes_and_edges(self, operations: List[Dict[str, Any]]) -> tuple:
        """Build nodes and edges compatible with existing Canvas"""
        nodes = []
        edges = []
        
        # Start node (compatible with existing system)
        start_node = {
            "id": "start",
            "type": "start",
            "position": {"x": 100, "y": 100},
            "data": {
                "label": "Start",
                "description": "Workflow start",
                "nodeType": "start"
            },
            "style": {
                "backgroundColor": "#4CAF50",
                "color": "white",
                "border": "2px solid #2E7D32"
            }
        }
        nodes.append(start_node)
        
        previous_node_id = "start"
        y_position = 100
        
        # Create operation nodes
        for i, operation in enumerate(operations):
            y_position += 150
            
            # Create node compatible with existing OperationNode structure
            node = {
                "id": operation.get("id", f"operation_{i+1}"),
                "type": "operationNode",
                "position": {"x": 100, "y": y_position},
                "data": {
                    "label": operation.get("name", operation.get("type", "Unknown")),
                    "description": operation.get("description", ""),
                    "nodeType": operation.get("type", "unknown"),
                    "category": self._get_category_for_operation(operation.get("type", "")),
                    "parameters": self._convert_params_to_canvas_format(operation.get("params", {})),
                    "step_number": i + 1,
                    "runStatus": "idle"
                },
                "style": self._get_node_style_for_category(
                    self._get_category_for_operation(operation.get("type", ""))
                )
            }
            nodes.append(node)
            
            # Create edge from previous node
            edge = {
                "id": f"edge_{previous_node_id}_to_{node['id']}",
                "source": previous_node_id,
                "target": node["id"],
                "type": "smoothstep",
                "animated": False,
                "style": {"stroke": "#666", "strokeWidth": 2},
                "label": f"Step {i+1}",
                "data": {"type": "sequential"}
            }
            edges.append(edge)
            
            previous_node_id = node["id"]
        
        # End node
        y_position += 150
        end_node = {
            "id": "end",
            "type": "end", 
            "position": {"x": 100, "y": y_position},
            "data": {
                "label": "End",
                "description": "Workflow end",
                "nodeType": "end"
            },
            "style": {
                "backgroundColor": "#F44336",
                "color": "white",
                "border": "2px solid #C62828"
            }
        }
        nodes.append(end_node)
        
        # Final edge to end
        final_edge = {
            "id": f"edge_{previous_node_id}_to_end",
            "source": previous_node_id,
            "target": "end",
            "type": "smoothstep",
            "animated": False,
            "style": {"stroke": "#666", "strokeWidth": 2},
            "data": {"type": "sequential"}
        }
        edges.append(final_edge)
        
        return nodes, edges
    
    def _convert_params_to_canvas_format(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Convert operation parameters to Canvas format"""
        canvas_params = []
        
        for param_name, param_value in params.items():
            param_type = self._infer_parameter_type(param_value)
            
            canvas_param = {
                "id": f"param_{param_name}",
                "name": param_name,
                "label": param_name.replace("_", " ").title(),
                "type": param_type,
                "value": param_value,
                "required": True,
                "description": f"{param_name.replace('_', ' ').title()} parameter"
            }
            
            # Add validation and constraints
            if param_type == "number":
                canvas_param.update(self._get_number_validation(param_name, param_value))
            
            canvas_params.append(canvas_param)
        
        return canvas_params
    
    def _get_node_style_for_category(self, category: str) -> Dict[str, Any]:
        """Get node styling based on category (same as existing system)"""
        category_styles = {
            "liquid_handling": {
                "backgroundColor": "#2196F3",
                "color": "white",
                "border": "2px solid #1976D2"
            },
            "temperature_control": {
                "backgroundColor": "#FF9800",
                "color": "white", 
                "border": "2px solid #F57C00"
            },
            "electrochemical": {
                "backgroundColor": "#9C27B0",
                "color": "white",
                "border": "2px solid #7B1FA2"
            },
            "mixing": {
                "backgroundColor": "#00BCD4",
                "color": "white",
                "border": "2px solid #0097A7"
            },
            "timing": {
                "backgroundColor": "#607D8B",
                "color": "white",
                "border": "2px solid #455A64"
            },
            "cleaning": {
                "backgroundColor": "#4CAF50",
                "color": "white",
                "border": "2px solid #388E3C"
            },
            "robotic_control": {
                "backgroundColor": "#E91E63",
                "color": "white",
                "border": "2px solid #C2185B"
            }
        }
        
        return category_styles.get(category, {
            "backgroundColor": "#666",
            "color": "white",
            "border": "2px solid #333"
        })
    
    def _estimate_total_duration(self, operations: List[Dict[str, Any]]) -> int:
        """Estimate total workflow duration"""
        total_duration = 0
        
        for operation in operations:
            params = operation.get("params", {})
            operation_type = operation.get("type", "")
            
            # Check for explicit duration
            if "duration" in params:
                duration = params["duration"]
                if isinstance(duration, (int, float)):
                    total_duration += duration
            else:
                # Use default durations based on operation type
                default_durations = {
                    "add_liquid": 30,
                    "heat": 300,
                    "cv": 180,
                    "lsv": 120,
                    "ocv": 60,
                    "stir": 60,
                    "transfer": 30,
                    "wash": 60,
                    "wait": 60,
                    "robot_move_to": 10,
                    "robot_pick": 8,
                    "robot_place": 8,
                    "robot_home": 15,
                    "robot_execute_sequence": 30,
                    "robot_wait": 5
                }
                total_duration += default_durations.get(operation_type, 60)
        
        return int(total_duration)
    
    def _get_required_devices(self, operations: List[Dict[str, Any]]) -> List[str]:
        """Get list of required devices (compatible with existing system)"""
        device_mapping = {
            "add_liquid": ["pump", "liquid_handler"],
            "heat": ["heater", "temperature_controller"],
            "cv": ["potentiostat", "electrodes"],
            "lsv": ["potentiostat", "electrodes"],
            "ocv": ["potentiostat", "electrodes"],
            "stir": ["magnetic_stirrer"],
            "transfer": ["pipette", "liquid_handler"],
            "wash": ["pump", "liquid_handler"],
            "wait": [],
            "robot_move_to": ["robotic_arm", "position_controller"],
            "robot_pick": ["robotic_arm", "gripper", "sensor"],
            "robot_place": ["robotic_arm", "gripper"],
            "robot_home": ["robotic_arm", "position_controller"],
            "robot_execute_sequence": ["robotic_arm", "motion_controller"],
            "robot_wait": ["robotic_arm", "sync_controller"]
        }
        
        required_devices = set()
        
        for operation in operations:
            operation_type = operation.get("type", "")
            devices = device_mapping.get(operation_type, [])
            required_devices.update(devices)
        
        return list(required_devices)
    
    def get_execution_config(self, operation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get execution configuration for operation
        
        Returns config compatible with existing executor system
        """
        operation_type = operation.get("type", "")
        
        if operation_type in self.existing_uo_types:
            uo_info = self.existing_uo_types[operation_type]
            
            return {
                "executor": uo_info["executor"],
                "function": uo_info["function"],
                "parameters": operation.get("params", {}),
                "operation_id": operation.get("id"),
                "operation_type": operation_type
            }
        else:
            # Default to python executor for unknown operations
            return {
                "executor": "python_executor",
                "function": operation_type,
                "parameters": operation.get("params", {}),
                "operation_id": operation.get("id"),
                "operation_type": operation_type
            }