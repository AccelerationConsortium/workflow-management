from typing import Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from ..types import ExecutionResult, validate_params

def run_ocv(params: Dict[str, Any]) -> ExecutionResult:
    """
    Run Open Circuit Voltage (OCV) measurement
    
    Parameters:
    -----------
    params : Dict[str, Any]
        duration : float
            Duration of measurement in seconds
        sample_interval : float
            Time between measurements in seconds
            
    Returns:
    --------
    ExecutionResult
        Contains measurement data and metadata
    """
    # Validate parameters
    errors = validate_params(params, [
        {"name": "duration", "min": 0},
        {"name": "sample_interval", "min": 0.1}
    ])
    
    if errors:
        return ExecutionResult(
            success=False,
            data=pd.DataFrame(),
            metadata=params,
            error_message="; ".join(errors)
        )
    
    # Generate time points
    duration = float(params["duration"])
    sample_interval = float(params["sample_interval"])
    num_points = int(duration / sample_interval) + 1
    
    timestamps = [
        datetime.now() + timedelta(seconds=i * sample_interval)
        for i in range(num_points)
    ]
    
    # Simulate OCV measurement
    # In real implementation, this would interface with hardware
    voltage = 3.0 + np.random.normal(0, 0.001, num_points)  # Simulated voltage around 3V
    
    # Create DataFrame
    data = pd.DataFrame({
        "timestamp": timestamps,
        "voltage": voltage,
        "elapsed_time": np.arange(num_points) * sample_interval
    })
    
    # Calculate metadata
    metadata = {
        "mean_voltage": float(np.mean(voltage)),
        "std_voltage": float(np.std(voltage)),
        "min_voltage": float(np.min(voltage)),
        "max_voltage": float(np.max(voltage)),
        "params": params
    }
    
    return ExecutionResult(
        success=True,
        data=data,
        metadata=metadata
    )

if __name__ == "__main__":
    # Test the function
    test_params = {
        "duration": 10,
        "sample_interval": 0.5
    }
    
    result = run_ocv(test_params)
    
    # Save results
    result.to_csv("ocv_test.csv")
    result.to_json("ocv_test.json") 
