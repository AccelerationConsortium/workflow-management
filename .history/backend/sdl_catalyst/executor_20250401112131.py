from typing import Dict, Any, Optional
import yaml
import importlib
import os
from datetime import datetime

from .types import ExecutionResult

class UOExecutor:
    """Unit Operation Executor
    
    This class handles the dynamic loading and execution of unit operations
    based on the configuration in uo_function_map.yaml
    """
    
    def __init__(self):
        self.config = self._load_config()
        self.function_cache = {}
        
    def _load_config(self) -> Dict[str, Any]:
        """Load the UO function mapping configuration"""
        config_path = os.path.join(
            os.path.dirname(__file__),
            "config",
            "uo_function_map.yaml"
        )
        
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
            
    def _get_function(self, uo_type: str):
        """Get the function for a given UO type"""
        if uo_type not in self.config:
            raise ValueError(f"Unknown UO type: {uo_type}")
            
        if uo_type not in self.function_cache:
            uo_config = self.config[uo_type]
            module_name = uo_config["module"]
            function_name = uo_config["function"]
            
            try:
                module = importlib.import_module(module_name)
                function = getattr(module, function_name)
                self.function_cache[uo_type] = function
            except (ImportError, AttributeError) as e:
                raise RuntimeError(f"Failed to load function for {uo_type}: {str(e)}")
                
        return self.function_cache[uo_type]
        
    def validate_parameters(self, uo_type: str, params: Dict[str, Any]) -> Optional[str]:
        """Validate parameters against the configuration"""
        if uo_type not in self.config:
            return f"Unknown UO type: {uo_type}"
            
        uo_config = self.config[uo_type]
        required_params = uo_config["parameters"]
        
        # Check for missing parameters
        missing = [
            name for name in required_params
            if name not in params
        ]
        if missing:
            return f"Missing required parameters: {', '.join(missing)}"
            
        # Validate parameter types and ranges
        for name, value in params.items():
            if name not in required_params:
                return f"Unknown parameter: {name}"
                
            param_config = required_params[name]
            if param_config["type"] == "number":
                try:
                    value = float(value)
                    if "min" in param_config and value < param_config["min"]:
                        return f"{name} must be >= {param_config['min']} {param_config.get('unit', '')}"
                    if "max" in param_config and value > param_config["max"]:
                        return f"{name} must be <= {param_config['max']} {param_config.get('unit', '')}"
                except (ValueError, TypeError):
                    return f"{name} must be a number"
                    
        return None
        
    def execute(self, uo_type: str, params: Dict[str, Any]) -> ExecutionResult:
        """Execute a unit operation
        
        Parameters
        ----------
        uo_type : str
            The type of unit operation to execute
        params : Dict[str, Any]
            The parameters for the unit operation
            
        Returns
        -------
        ExecutionResult
            The result of the execution
        """
        # Validate parameters
        error = self.validate_parameters(uo_type, params)
        if error:
            return ExecutionResult(
                success=False,
                data=None,
                metadata={"params": params},
                error_message=error
            )
            
        try:
            # Get and execute the function
            function = self._get_function(uo_type)
            result = function(params)
            
            # Add execution metadata
            if result.success:
                result.metadata.update({
                    "execution_time": datetime.now().isoformat(),
                    "uo_type": uo_type
                })
                
            return result
            
        except Exception as e:
            return ExecutionResult(
                success=False,
                data=None,
                metadata={"params": params},
                error_message=f"Execution failed: {str(e)}"
            )
            
    def get_uo_info(self, uo_type: str) -> Dict[str, Any]:
        """Get information about a unit operation type"""
        if uo_type not in self.config:
            raise ValueError(f"Unknown UO type: {uo_type}")
            
        return self.config[uo_type] 
