"""
JSON Builder Module

This module handles the construction of standardized workflow JSON
that can be consumed by the Canvas frontend for visualization.
"""

import json
import uuid
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from pathlib import Path


class JSONBuilder:
    """
    Workflow JSON Constructor
    
    Converts structured unit operations into standardized Canvas-compatible
    JSON format with nodes, edges, and metadata.
    """
    
    def __init__(self):
        """Initialize the JSON builder"""
        self.templates = self._load_templates()
        self.node_spacing = {"x": 300, "y": 150}  # Spacing between nodes
        self.canvas_start = {"x": 100, "y": 100}  # Starting position
    
    def _load_templates(self) -> Dict[str, Any]:
        """Load UO templates for node configuration"""
        try:
            template_path = Path(__file__).parent.parent / "registry" / "uo_templates.json"
            with open(template_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"templates": {}, "categories": {}}
    
    def build_workflow_json(self, 
                           operations: List[Dict[str, Any]], 
                           metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Build complete workflow JSON from unit operations
        
        Args:
            operations: List of unit operation dictionaries
            metadata: Optional metadata about the workflow
            
        Returns:
            Complete Canvas-compatible workflow JSON
        """
        
        # Generate workflow metadata
        workflow_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        default_metadata = {
            "id": workflow_id,
            "name": "AI Generated Workflow",
            "description": "Laboratory workflow generated from natural language",
            "created_at": timestamp,
            "created_by": "AI Agent",
            "version": "1.0.0",
            "tags": ["AI Generated", "Automated"]
        }
        
        if metadata:
            default_metadata.update(metadata)
        
        # Build nodes and edges
        nodes, edges = self._build_nodes_and_edges(operations)
        
        # Construct complete workflow JSON
        workflow_json = {
            "metadata": default_metadata,
            "workflow": {
                "nodes": nodes,
                "edges": edges,
                "viewport": {
                    "x": 0,
                    "y": 0,
                    "zoom": 1
                }
            },
            "execution": {
                "status": "draft",
                "total_steps": len(operations),
                "estimated_duration": self._estimate_duration(operations),
                "required_devices": self._get_required_devices(operations)
            },
            "validation": {
                "is_valid": True,
                "errors": [],
                "warnings": [],
                "last_validated": timestamp
            }
        }
        
        return workflow_json
    
    def _build_nodes_and_edges(self, 
                              operations: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], 
                                                                        List[Dict[str, Any]]]:
        """Build nodes and edges from operations"""
        
        nodes = []
        edges = []
        
        # Add start node
        start_node = self._create_start_node()
        nodes.append(start_node)
        
        previous_node_id = start_node["id"]
        
        # Create nodes for each operation
        for i, operation in enumerate(operations):
            node = self._create_operation_node(operation, i)
            nodes.append(node)
            
            # Create edge from previous node
            edge = self._create_edge(previous_node_id, node["id"], i)
            edges.append(edge)
            
            previous_node_id = node["id"]
        
        # Add end node
        end_node = self._create_end_node(len(operations))
        nodes.append(end_node)
        
        # Create edge to end node
        final_edge = self._create_edge(previous_node_id, end_node["id"], len(operations))
        edges.append(final_edge)
        
        return nodes, edges
    
    def _create_start_node(self) -> Dict[str, Any]:
        """Create workflow start node"""
        return {
            "id": "start",
            "type": "start",
            "position": {
                "x": self.canvas_start["x"],
                "y": self.canvas_start["y"]
            },
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
    
    def _create_end_node(self, step_count: int) -> Dict[str, Any]:
        """Create workflow end node"""
        return {
            "id": "end", 
            "type": "end",
            "position": {
                "x": self.canvas_start["x"],
                "y": self.canvas_start["y"] + (step_count + 1) * self.node_spacing["y"]
            },
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
    
    def _create_operation_node(self, operation: Dict[str, Any], index: int) -> Dict[str, Any]:
        """Create node for unit operation"""
        
        operation_type = operation.get("type", "unknown")
        operation_id = operation.get("id", f"step_{index + 1}")
        
        # Get template information
        template = self.templates.get("templates", {}).get(operation_type, {})
        category = template.get("category", "general")
        
        # Calculate position
        position = {
            "x": self.canvas_start["x"],
            "y": self.canvas_start["y"] + (index + 1) * self.node_spacing["y"]
        }
        
        # Get node styling based on category
        style = self._get_node_style(category)
        
        # Build node data
        node_data = {
            "label": operation.get("name", template.get("name", operation_type)),
            "description": operation.get("description", template.get("description", "")),
            "nodeType": operation_type,
            "category": category,
            "parameters": operation.get("params", {}),
            "template": template,
            "step_number": index + 1
        }
        
        return {
            "id": operation_id,
            "type": "operationNode",
            "position": position,
            "data": node_data,
            "style": style
        }
    
    def _create_edge(self, source_id: str, target_id: str, index: int) -> Dict[str, Any]:
        """Create edge between nodes"""
        return {
            "id": f"edge_{source_id}_to_{target_id}",
            "source": source_id,
            "target": target_id,
            "type": "smoothstep",
            "animated": False,
            "style": {
                "stroke": "#666",
                "strokeWidth": 2
            },
            "label": f"Step {index}" if index > 0 else "",
            "labelStyle": {
                "fontSize": "12px",
                "color": "#666"
            }
        }
    
    def _get_node_style(self, category: str) -> Dict[str, Any]:
        """Get styling for node based on category"""
        
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
            "measurement": {
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
    
    def _estimate_duration(self, operations: List[Dict[str, Any]]) -> int:
        """Estimate total workflow duration in seconds"""
        
        total_duration = 0
        
        for operation in operations:
            params = operation.get("params", {})
            
            # Add operation-specific durations
            if "duration" in params:
                duration = params["duration"]
                if isinstance(duration, (int, float)):
                    total_duration += duration
            
            # Add default execution times for operations without explicit duration
            else:
                operation_type = operation.get("type", "")
                default_durations = {
                    "add_liquid": 30,
                    "heat": 300,
                    "cv": 180,
                    "lsv": 120,
                    "ocv": 60,
                    "stir": 60,
                    "transfer": 30,
                    "wash": 60,
                    "wait": 60
                }
                total_duration += default_durations.get(operation_type, 60)
        
        return int(total_duration)
    
    def _get_required_devices(self, operations: List[Dict[str, Any]]) -> List[str]:
        """Get list of required devices for workflow"""
        
        device_mapping = {
            "add_liquid": ["pump", "liquid_handler"],
            "heat": ["heater", "temperature_controller"],
            "cv": ["potentiostat", "electrodes"],
            "lsv": ["potentiostat", "electrodes"],
            "ocv": ["potentiostat", "electrodes"],
            "stir": ["magnetic_stirrer"],
            "transfer": ["pipette", "liquid_handler"],
            "wash": ["pump", "liquid_handler"],
            "wait": []
        }
        
        required_devices = set()
        
        for operation in operations:
            operation_type = operation.get("type", "")
            devices = device_mapping.get(operation_type, [])
            required_devices.update(devices)
        
        return list(required_devices)
    
    def add_branching_logic(self, 
                           workflow_json: Dict[str, Any], 
                           conditions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Add conditional branching to workflow
        
        Args:
            workflow_json: Base workflow JSON
            conditions: List of condition dictionaries
            
        Returns:
            Workflow with branching logic
        """
        
        # This is a placeholder for advanced branching logic
        # In a full implementation, this would handle:
        # - Conditional nodes
        # - Decision points
        # - Parallel execution paths
        # - Loop structures
        
        enhanced_workflow = workflow_json.copy()
        
        # Add condition metadata
        if conditions:
            enhanced_workflow["branching"] = {
                "enabled": True,
                "conditions": conditions,
                "decision_points": []
            }
        
        return enhanced_workflow
    
    def optimize_layout(self, workflow_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize node layout for better visualization
        
        Args:
            workflow_json: Workflow JSON to optimize
            
        Returns:
            Workflow with optimized layout
        """
        
        optimized_workflow = workflow_json.copy()
        nodes = optimized_workflow["workflow"]["nodes"]
        
        # Simple linear layout optimization
        for i, node in enumerate(nodes):
            if node["id"] not in ["start", "end"]:
                # Add slight horizontal offset for better visual spacing
                node["position"]["x"] += (i % 2) * 50
        
        return optimized_workflow
    
    def export_to_formats(self, workflow_json: Dict[str, Any]) -> Dict[str, str]:
        """
        Export workflow to multiple formats
        
        Args:
            workflow_json: Workflow to export
            
        Returns:
            Dict with different format exports
        """
        
        exports = {}
        
        # Standard JSON
        exports["json"] = json.dumps(workflow_json, indent=2, ensure_ascii=False)
        
        # Simplified format for external systems
        simplified = {
            "workflow_id": workflow_json["metadata"]["id"],
            "name": workflow_json["metadata"]["name"],
            "steps": []
        }
        
        for node in workflow_json["workflow"]["nodes"]:
            if node["type"] == "operationNode":
                simplified["steps"].append({
                    "step": node["data"]["step_number"],
                    "operation": node["data"]["nodeType"],
                    "parameters": node["data"]["parameters"],
                    "description": node["data"]["description"]
                })
        
        exports["simplified_json"] = json.dumps(simplified, indent=2, ensure_ascii=False)
        
        # CSV format for tabular view
        csv_lines = ["Step,Operation,Description,Parameters"]
        for step in simplified["steps"]:
            params_str = "; ".join([f"{k}={v}" for k, v in step["parameters"].items()])
            csv_lines.append(f'{step["step"]},{step["operation"]},"{step["description"]}","{params_str}"')
        
        exports["csv"] = "\n".join(csv_lines)
        
        return exports
    
    def validate_canvas_compatibility(self, workflow_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate workflow JSON for Canvas compatibility
        
        Args:
            workflow_json: Workflow to validate
            
        Returns:
            Validation results
        """
        
        errors = []
        warnings = []
        
        # Check required top-level keys
        required_keys = ["metadata", "workflow"]
        for key in required_keys:
            if key not in workflow_json:
                errors.append(f"Missing required key: {key}")
        
        # Check workflow structure
        if "workflow" in workflow_json:
            workflow = workflow_json["workflow"]
            
            if "nodes" not in workflow:
                errors.append("Missing 'nodes' in workflow")
            
            if "edges" not in workflow:
                errors.append("Missing 'edges' in workflow")
            
            # Validate nodes
            if "nodes" in workflow:
                for node in workflow["nodes"]:
                    if "id" not in node:
                        errors.append("Node missing 'id' field")
                    
                    if "position" not in node:
                        warnings.append(f"Node {node.get('id', 'unknown')} missing position")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "canvas_compatible": len(errors) == 0
        }