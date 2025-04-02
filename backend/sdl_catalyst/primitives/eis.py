from typing import Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from ..types import ExecutionResult, validate_params

def run_eis(params: Dict[str, Any]) -> ExecutionResult:
    """
    Run Electrochemical Impedance Spectroscopy (EIS) measurement
    
    Parameters:
    -----------
    params : Dict[str, Any]
        frequency_start : float
            Start frequency in Hz
        frequency_end : float
            End frequency in Hz
        points_per_decade : int
            Number of frequency points per decade
        amplitude : float
            AC amplitude in mV
        dc_voltage : float
            DC bias voltage in V
            
    Returns:
    --------
    ExecutionResult
        Contains measurement data and metadata
    """
    # Validate parameters
    errors = validate_params(params, [
        {"name": "frequency_start", "min": 0.001, "max": 1e6},
        {"name": "frequency_end", "min": 0.001, "max": 1e6},
        {"name": "points_per_decade", "min": 1, "max": 100},
        {"name": "amplitude", "min": 0.1, "max": 100},  # 0.1-100 mV
        {"name": "dc_voltage", "min": 0, "max": 5.0}
    ])
    
    if errors:
        return ExecutionResult(
            success=False,
            data=pd.DataFrame(),
            metadata=params,
            error_message="; ".join(errors)
        )
    
    # Extract parameters
    f_start = float(params["frequency_start"])
    f_end = float(params["frequency_end"])
    ppd = int(params["points_per_decade"])
    amplitude = float(params["amplitude"]) / 1000  # Convert to V
    dc_voltage = float(params["dc_voltage"])
    
    # Generate frequency points
    decades = np.log10(f_end) - np.log10(f_start)
    num_points = int(decades * ppd) + 1
    frequencies = np.logspace(np.log10(f_start), np.log10(f_end), num_points)
    
    # Simulate impedance response (simplified Randles circuit)
    Rs = 10      # Series resistance (Ω)
    Rct = 100    # Charge transfer resistance (Ω)
    Cdl = 1e-6   # Double layer capacitance (F)
    W = 100      # Warburg coefficient
    
    # Calculate complex impedance
    omega = 2 * np.pi * frequencies
    Z_dl = 1 / (1j * omega * Cdl)
    Z_w = W * (1 - 1j) / np.sqrt(omega)
    Z = Rs + 1 / (1/Rct + 1/(Z_dl + Z_w))
    
    # Add some noise
    noise_factor = 0.02  # 2% noise
    Z *= (1 + noise_factor * (np.random.normal(0, 1, len(Z)) + 
                             1j * np.random.normal(0, 1, len(Z))))
    
    # Extract magnitude and phase
    magnitude = np.abs(Z)
    phase = np.angle(Z, deg=True)
    
    # Calculate real and imaginary components
    Z_real = np.real(Z)
    Z_imag = np.imag(Z)
    
    # Create timestamps (for logging purposes)
    # Assume each frequency point takes 1 second
    timestamps = [
        datetime.now() + timedelta(seconds=i)
        for i in range(len(frequencies))
    ]
    
    # Create DataFrame
    data = pd.DataFrame({
        "timestamp": timestamps,
        "frequency": frequencies,
        "magnitude": magnitude,
        "phase": phase,
        "Z_real": Z_real,
        "Z_imag": Z_imag,
        "dc_voltage": np.full_like(frequencies, dc_voltage),
        "ac_amplitude": np.full_like(frequencies, amplitude * 1000)  # Convert back to mV
    })
    
    # Calculate metadata
    metadata = {
        "num_points": len(frequencies),
        "frequency_range": f"{f_start:.3g}-{f_end:.3g} Hz",
        "mean_magnitude": float(np.mean(magnitude)),
        "min_phase": float(np.min(phase)),
        "max_phase": float(np.max(phase)),
        "estimated_Rs": float(Z_real[0]),  # High frequency limit
        "estimated_Rct": float(Z_real[-1] - Z_real[0]),  # Low frequency limit - Rs
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
        "frequency_start": 0.1,
        "frequency_end": 1000,
        "points_per_decade": 10,
        "amplitude": 10,  # 10 mV
        "dc_voltage": 3.0
    }
    
    result = run_eis(test_params)
    
    # Save results
    result.to_csv("eis_test.csv")
    result.to_json("eis_test.json") 
