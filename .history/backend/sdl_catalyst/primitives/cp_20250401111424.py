from typing import Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from ..types import ExecutionResult, validate_params

def run_cp(params: Dict[str, Any]) -> ExecutionResult:
    """
    Run Chronopotentiometry (CP) measurement
    
    Parameters:
    -----------
    params : Dict[str, Any]
        current : float
            Applied current in mA
        duration : float
            Duration of measurement in seconds
        sample_interval : float
            Time between measurements in seconds
        voltage_limit_high : float
            Upper voltage limit in V
        voltage_limit_low : float
            Lower voltage limit in V
            
    Returns:
    --------
    ExecutionResult
        Contains measurement data and metadata
    """
    # Validate parameters
    errors = validate_params(params, [
        {"name": "current", "min": -1000, "max": 1000},  # ±1A limit
        {"name": "duration", "min": 0},
        {"name": "sample_interval", "min": 0.1},
        {"name": "voltage_limit_high", "min": 0, "max": 5.0},
        {"name": "voltage_limit_low", "min": 0, "max": 5.0}
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
    
    # Simulate CP measurement
    # In real implementation, this would interface with hardware
    current = float(params["current"])
    time_array = np.arange(num_points) * sample_interval
    
    # Simulate voltage response (simplified model)
    # V = V0 + IR + K*sqrt(t) (Cottrell equation inspired)
    V0 = 3.0  # Initial voltage
    R = 0.1   # Simulated internal resistance
    K = 0.01  # Rate constant
    
    voltage = V0 + current * R + K * np.sqrt(time_array)
    voltage += np.random.normal(0, 0.001, num_points)  # Add noise
    
    # Check voltage limits
    voltage_limit_high = float(params["voltage_limit_high"])
    voltage_limit_low = float(params["voltage_limit_low"])
    
    voltage_exceeded = np.any((voltage > voltage_limit_high) | (voltage < voltage_limit_low))
    
    if voltage_exceeded:
        return ExecutionResult(
            success=False,
            data=pd.DataFrame(),
            metadata=params,
            error_message="Voltage limits exceeded"
        )
    
    # Create DataFrame
    data = pd.DataFrame({
        "timestamp": timestamps,
        "voltage": voltage,
        "current": np.full(num_points, current),
        "elapsed_time": time_array
    })
    
    # Calculate metadata
    metadata = {
        "mean_voltage": float(np.mean(voltage)),
        "std_voltage": float(np.std(voltage)),
        "min_voltage": float(np.min(voltage)),
        "max_voltage": float(np.max(voltage)),
        "applied_current": current,
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
        "current": 100,  # 100mA
        "duration": 10,
        "sample_interval": 0.1,
        "voltage_limit_high": 4.2,
        "voltage_limit_low": 2.5
    }
    
    result = run_cp(test_params)
    
    # Save results
    result.to_csv("cp_test.csv")
    result.to_json("cp_test.json") 
