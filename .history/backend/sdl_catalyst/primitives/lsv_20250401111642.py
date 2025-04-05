from typing import Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from ..types import ExecutionResult, validate_params

def run_lsv(params: Dict[str, Any]) -> ExecutionResult:
    """
    Run Linear Sweep Voltammetry (LSV) measurement
    
    Parameters:
    -----------
    params : Dict[str, Any]
        start_voltage : float
            Starting voltage in V
        end_voltage : float
            End voltage in V
        scan_rate : float
            Scan rate in mV/s
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
    step_size = float(params["step_size"]) / 1000  # Convert to V
    
    # Calculate voltage points
    if end_v > start_v:
        voltage_points = np.arange(start_v, end_v + step_size, step_size)
    else:
        voltage_points = np.arange(start_v, end_v - step_size, -step_size)
    
    # Calculate time points
    time_points = np.arange(len(voltage_points)) * (step_size / scan_rate)
    
    # Simulate current response (simplified Butler-Volmer model)
    # i = i0 * (exp(alpha*F*(V-E0)/RT) - exp(-(1-alpha)*F*(V-E0)/RT))
    i0 = 1e-3    # Exchange current (A)
    alpha = 0.5   # Transfer coefficient
    E0 = (start_v + end_v) / 2  # Standard potential
    F = 96485    # Faraday constant
    R = 8.314    # Gas constant
    T = 298      # Temperature (K)
    
    eta = voltage_points - E0  # Overpotential
    current = i0 * (np.exp(alpha*F*eta/(R*T)) - np.exp(-(1-alpha)*F*eta/(R*T)))
    current = current * 1000  # Convert to mA
    
    # Add noise
    current += np.random.normal(0, abs(current).max()*0.01, len(current))
    
    # Create timestamps
    timestamps = [
        datetime.now() + timedelta(seconds=t)
        for t in time_points
    ]
    
    # Create DataFrame
    data = pd.DataFrame({
        "timestamp": timestamps,
        "voltage": voltage_points,
        "current": current,
        "elapsed_time": time_points
    })
    
    # Calculate metadata
    metadata = {
        "mean_current": float(np.mean(current)),
        "std_current": float(np.std(current)),
        "min_current": float(np.min(current)),
        "max_current": float(np.max(current)),
        "total_time": float(time_points[-1]),
        "actual_scan_rate": float(scan_rate * 1000),  # Convert back to mV/s
        "voltage_range": f"{start_v:.3f}-{end_v:.3f} V",
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
        "step_size": 1.0,  # 1 mV
        "current_range": 100  # 100 mA
    }
    
    result = run_lsv(test_params)
    
    # Save results
    result.to_csv("lsv_test.csv")
    result.to_json("lsv_test.json") 
