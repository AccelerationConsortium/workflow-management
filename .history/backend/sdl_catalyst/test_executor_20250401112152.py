from executor import UOExecutor

def test_all_uo_types():
    """Test all UO types with sample parameters"""
    executor = UOExecutor()
    
    # Test cases for each UO type
    test_cases = {
        "OCV": {
            "duration": 10,
            "sample_interval": 0.5
        },
        "CP": {
            "current": 100,
            "duration": 10,
            "sample_interval": 0.1,
            "voltage_limit_high": 4.2,
            "voltage_limit_low": 2.5
        },
        "CVA": {
            "start_voltage": 2.5,
            "end_voltage": 4.2,
            "scan_rate": 1.0,
            "cycles": 2,
            "step_size": 1.0,
            "current_range": 100
        },
        "LSV": {
            "start_voltage": 2.5,
            "end_voltage": 4.2,
            "scan_rate": 1.0,
            "step_size": 1.0,
            "current_range": 100
        },
        "PEIS": {
            "frequency_start": 0.1,
            "frequency_end": 1000,
            "points_per_decade": 10,
            "amplitude": 10,
            "dc_voltage": 3.0
        }
    }
    
    # Test each UO type
    for uo_type, params in test_cases.items():
        print(f"\nTesting {uo_type}...")
        
        # Get UO info
        try:
            uo_info = executor.get_uo_info(uo_type)
            print(f"UO Info: {uo_info['description']}")
        except Exception as e:
            print(f"Error getting UO info: {str(e)}")
            continue
            
        # Validate parameters
        error = executor.validate_parameters(uo_type, params)
        if error:
            print(f"Parameter validation failed: {error}")
            continue
            
        # Execute UO
        try:
            result = executor.execute(uo_type, params)
            if result.success:
                print("Execution successful!")
                print(f"Data shape: {result.data.shape}")
                print(f"Metadata: {result.metadata}")
                
                # Save results
                result.to_csv(f"{uo_type.lower()}_test.csv")
                result.to_json(f"{uo_type.lower()}_test.json")
            else:
                print(f"Execution failed: {result.error_message}")
        except Exception as e:
            print(f"Error during execution: {str(e)}")

if __name__ == "__main__":
    test_all_uo_types() 
