from typing import Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from ..types import ExecutionResult, validate_params

def run_cv(params: Dict[str, Any]) -> ExecutionResult:
    """
    Run Cyclic Voltammetry (CV) measurement
    
    Parameters:
    -----------
    params : Dict[str, Any]
        start_voltage : float
            Starting voltage in V
        end_voltage : float
            End voltage in V
        scan_rate : float
            Scan rate in mV/s
        cycles : int
            Number of cycles
        step_size : float
            Voltage step size in mV
        current_range : float
            Current measurement range in mA
            
    Returns:
    --------
    ExecutionResult
        Contains measurement data and metadata
    """
    # Validate parameters
    errors = validate_params(params, [
        {"name": "start_voltage", "min": 0, "max": 5.0},
        {"name": "end_voltage", "min": 0, "max": 5.0},
        {"name": "scan_rate", "min": 0.1, "max": 1000},  # 0.1-1000 mV/s
        {"name": "cycles", "min": 1, "max": 100},
        {"name": "step_size", "min": 0.1, "max": 100},  # 0.1-100 mV
        {"name": "current_range", "min": 0.1, "max": 1000}  # 0.1mA-1A
    ])
    
    if errors:
        return ExecutionResult(
            success=False,
            data=pd.DataFrame(),
            metadata=params,
            error_message="; ".join(errors)
        )
    
    # Extract parameters
    start_v = float(params["start_voltage"])
    end_v = float(params["end_voltage"])
    scan_rate = float(params["scan_rate"]) / 1000  # Convert to V/s
    cycles = int(params["cycles"])
    step_size = float(params["step_size"]) / 1000  # Convert to V
    
    # Calculate time points and voltage profile
    voltage_points = []
    time_points = []
    cycle_numbers = []
    
    time = 0
    step_time = step_size / scan_rate
    
    for cycle in range(cycles):
        # Forward scan
        v = start_v
        while v <= end_v:
            voltage_points.append(v)
            time_points.append(time)
            cycle_numbers.append(cycle + 1)
            v += step_size
            time += step_time
            
        # Backward scan
        v = end_v
        while v >= start_v:
            voltage_points.append(v)
            time_points.append(time)
            cycle_numbers.append(cycle + 1)
            v -= step_size
            time += step_time
    
    # Convert to numpy arrays
    voltage_array = np.array(voltage_points)
    time_array = np.array(time_points)
    
    # Simulate current response (simplified model)
    # I = C * scan_rate + k * (V - E0) * exp(-(V - E0)^2)
    C = 0.001  # Capacitance term
    k = 0.1    # Kinetic term
    E0 = (start_v + end_v) / 2  # Formal potential
    
    current = (C * scan_rate + 
              k * (voltage_array - E0) * np.exp(-(voltage_array - E0)**2))
    current += np.random.normal(0, 0.001, len(voltage_array))  # Add noise
    
    # Create timestamps
    timestamps = [
        datetime.now() + timedelta(seconds=t)
        for t in time_array
    ]
    
    # Create DataFrame
    data = pd.DataFrame({
        "timestamp": timestamps,
        "voltage": voltage_array,
        "current": current,
        "elapsed_time": time_array,
        "cycle": cycle_numbers
    })
    
    # Calculate metadata
    metadata = {
        "mean_current": float(np.mean(current)),
        "std_current": float(np.std(current)),
        "min_current": float(np.min(current)),
        "max_current": float(np.max(current)),
        "total_time": float(time),
        "actual_scan_rate": float(scan_rate * 1000),  # Convert back to mV/s
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
        "start_voltage": 2.5,
        "end_voltage": 4.2,
        "scan_rate": 1.0,  # 1 mV/s
        "cycles": 2,
        "step_size": 1.0,  # 1 mV
        "current_range": 100  # 100 mA
    }
    
    result = run_cv(test_params)
    
    # Save results
    result.to_csv("cv_test.csv")
    result.to_json("cv_test.json") 
