from typing import Dict, Any, Union, List
from dataclasses import dataclass
from datetime import datetime
import json
import os
import pandas as pd

@dataclass
class ExecutionResult:
    success: bool
    data: pd.DataFrame
    metadata: Dict[str, Any]
    error_message: str = ""
    
    def to_json(self, filename: str) -> None:
        """Save execution result to JSON file"""
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        result = {
            "success": self.success,
            "data": self.data.to_dict(orient="records"),
            "metadata": self.metadata,
            "error_message": self.error_message,
            "timestamp": datetime.now().isoformat()
        }
        
        with open(os.path.join(output_dir, filename), "w") as f:
            json.dump(result, f, indent=2)
            
    def to_csv(self, filename: str) -> None:
        """Save data to CSV file"""
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        # Save data
        self.data.to_csv(os.path.join(output_dir, filename), index=False)
        
        # Save metadata separately
        meta_filename = f"{os.path.splitext(filename)[0]}_metadata.json"
        meta_data = {
            "success": self.success,
            "metadata": self.metadata,
            "error_message": self.error_message,
            "timestamp": datetime.now().isoformat()
        }
        
        with open(os.path.join(output_dir, meta_filename), "w") as f:
            json.dump(meta_data, f, indent=2)

# Common parameter validation functions
def validate_numeric_param(
    params: Dict[str, Any],
    param_name: str,
    min_value: float = None,
    max_value: float = None,
    required: bool = True
) -> Union[str, None]:
    """Validate a numeric parameter"""
    if param_name not in params:
        return f"Missing required parameter: {param_name}" if required else None
        
    try:
        value = float(params[param_name])
        if min_value is not None and value < min_value:
            return f"{param_name} must be >= {min_value}"
        if max_value is not None and value > max_value:
            return f"{param_name} must be <= {max_value}"
    except (ValueError, TypeError):
        return f"{param_name} must be a number"
    
    return None

def validate_params(
    params: Dict[str, Any],
    required_params: List[Dict[str, Any]]
) -> List[str]:
    """Validate multiple parameters"""
    errors = []
    
    for param in required_params:
        error = validate_numeric_param(
            params,
            param["name"],
            param.get("min"),
            param.get("max"),
            param.get("required", True)
        )
        if error:
            errors.append(error)
            
    return errors 
