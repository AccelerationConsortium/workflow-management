# Export Format Comparison

This document shows the difference between the two export formats available in the workflow management system.

## Execution Export Format (Simplified)

This format contains only the selected values for each parameter, making it ideal for backend execution and API calls.

```json
{
  "nodeId": "electrochemical-1",
  "nodeType": "ElectrochemicalMeasurement",
  "label": "Electrochemical Measurement",
  "description": "Various electrochemical measurement techniques",
  "category": "SDL1",
  "primitiveOperations": [
    "connect_electrodes",
    "initialize_potentiostat",
    "measure_ocv",
    "apply_current",
    "record_data"
  ],
  "parameters": {
    "uo_name": "Electrochemical_Measurement",
    "description": "Unified electrochemical measurement supporting OCV, CP, CVA, PEIS, and LSV",
    "wait_before": 0,
    "wait_after": 0,
    "error_handling": "stop",
    "log_level": "INFO",
    "com_port": "COM4",
    "channel": 0,
    "measurement_type": "CP",
    "cp_current": -0.004,
    "cp_duration": 720,
    "cp_sample_interval": 1.0,
    "cp_voltage_limit_min": -2.0,
    "cp_voltage_limit_max": 2.0,
    "data_collection_enabled": true,
    "cycle_dependent_collection": true,
    "data_tag": "Electrochemical_Measurement"
  },
  "exportMetadata": {
    "timestamp": "2025-01-24T10:30:00.000Z",
    "version": "1.0",
    "format": "SDL1_Execution",
    "exportType": "execution",
    "totalParameters": 15
  }
}
```

## Full Export Format (With Metadata)

This format includes all parameter metadata, options, validation rules, and structure information.

```json
{
  "nodeId": "electrochemical-1",
  "nodeType": "ElectrochemicalMeasurement",
  "label": "Electrochemical Measurement",
  "description": "Various electrochemical measurement techniques",
  "category": "SDL1",
  "primitiveOperations": [
    "connect_electrodes",
    "initialize_potentiostat",
    "measure_ocv",
    "apply_current",
    "record_data"
  ],
  "parameters": {
    "measurement_type": {
      "value": "CP",
      "unit": null,
      "type": "select",
      "label": "Measurement Type",
      "description": "Type of electrochemical measurement",
      "required": true,
      "options": [
        { "value": "OCV", "label": "Open Circuit Voltage (OCV)" },
        { "value": "CP", "label": "Chronopotentiometry (CP)" },
        { "value": "CVA", "label": "Cyclic Voltammetry (CVA)" },
        { "value": "PEIS", "label": "Potentiostatic EIS (PEIS)" },
        { "value": "LSV", "label": "Linear Sweep Voltammetry (LSV)" }
      ],
      "group": "measurement",
      "groupLabel": "Measurement Configuration",
      "validation": {
        "required": true,
        "dataType": "select"
      }
    },
    "cp_current": {
      "value": -0.004,
      "unit": "A",
      "valueWithUnit": "-0.004_A",
      "type": "number",
      "label": "Current",
      "description": "Applied current",
      "required": false,
      "min": -0.1,
      "max": 0.1,
      "step": 0.0001,
      "dependsOn": {
        "parameter": "measurement_type",
        "value": "CP"
      },
      "group": "cp",
      "groupLabel": "CP Parameters",
      "validation": {
        "required": false,
        "min": -0.1,
        "max": 0.1,
        "dataType": "number"
      }
    }
  },
  "parameterGroups": {
    "common": {
      "label": "Common Parameters",
      "parameterKeys": ["uo_name", "description", "wait_before", "wait_after", "error_handling", "log_level"]
    },
    "hardware": {
      "label": "Hardware Configuration", 
      "parameterKeys": ["com_port", "channel"]
    },
    "measurement": {
      "label": "Measurement Configuration",
      "parameterKeys": ["measurement_type"]
    },
    "cp": {
      "label": "CP Parameters",
      "parameterKeys": ["cp_current", "cp_duration", "cp_sample_interval", "cp_voltage_limit_min", "cp_voltage_limit_max"]
    },
    "data_collection": {
      "label": "Data Collection Settings",
      "parameterKeys": ["data_collection_enabled", "cycle_dependent_collection", "data_tag"]
    }
  },
  "exportMetadata": {
    "timestamp": "2025-01-24T10:30:00.000Z",
    "version": "1.0",
    "format": "SDL1_Enhanced",
    "exportType": "full",
    "totalParameters": 15,
    "requiredParameters": 3
  }
}
```

## Key Differences

### Execution Format Benefits:
- **Smaller file size** - Only contains necessary values
- **Faster parsing** - Direct access to parameter values
- **Backend-friendly** - Ready for API consumption
- **Clean structure** - No metadata clutter

### Full Format Benefits:
- **Complete documentation** - All parameter definitions included
- **Validation rules** - Min/max values, required fields, data types
- **UI reconstruction** - Can rebuild the parameter interface
- **Debugging** - Full context for troubleshooting
- **Parameter relationships** - Dependencies and grouping information

## Usage Recommendations

- **Use Execution Format** for:
  - Backend API calls
  - Workflow execution
  - Data processing pipelines
  - Production deployments

- **Use Full Format** for:
  - Documentation and archival
  - Debugging and development
  - Parameter validation
  - UI reconstruction
  - Sharing complete workflow definitions
