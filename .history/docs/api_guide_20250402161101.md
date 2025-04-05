# Workflow Management API Guide

## Overview
The Workflow Management API provides a set of endpoints for managing and monitoring workflow executions. It supports both REST API calls and WebSocket connections for real-time updates.

## Base URL
```
http://localhost:8000
```

## Authentication
Currently, no authentication is required (for development purposes only).

## REST API Endpoints

### 1. Start Workflow Execution
Start a new workflow execution.

**Endpoint:** `POST /run`

**Request Body:**
```json
{
    "workflow_type": "sdl_analysis",
    "workflow_config": {
        "input_data": "sample_data.csv",
        "analysis_type": "performance",
        "parameters": {
            "threshold": 0.8,
            "max_iterations": 100
        }
    }
}
```

**Response:**
```json
{
    "run_id": "98742a9e-a870-4fc7-a4f3-72acd014d351",
    "status": "accepted",
    "message": "Workflow execution started"
}
```

### 2. Get Workflow Status
Retrieve the current status of a workflow execution.

**Endpoint:** `GET /status/{run_id}`

**Response:**
```json
{
    "run_id": "98742a9e-a870-4fc7-a4f3-72acd014d351",
    "status": "completed",
    "progress": 100.0,
    "current_step": "完成",
    "start_time": "2025-04-02T16:08:40.354414",
    "end_time": "2025-04-02T16:08:45.359005",
    "error": null,
    "results": {
        "analysis_results": {
            "status": "success",
            "metrics": {
                "accuracy": 0.95,
                "performance": "good"
            }
        },
        "execution_time": "5s",
        "resource_usage": {
            "cpu": "45%",
            "memory": "1.2GB"
        }
    }
}
```

### 3. Get Workflow Logs
Retrieve execution logs for a workflow.

**Endpoint:** `GET /logs/{run_id}`

**Response:**
```json
{
    "run_id": "98742a9e-a870-4fc7-a4f3-72acd014d351",
    "logs": [
        "[2025-04-02 16:08:40.354] Starting SDL workflow: sdl_analysis",
        "[2025-04-02 16:08:40.354] Executing SDL workflow sdl_wf_98742a9e-a870-4fc7-a4f3-72acd014d351",
        "[2025-04-02 16:08:45.359] Workflow completed successfully"
    ]
}
```

## WebSocket API

### 1. Subscribe to Specific Workflow Updates
Connect to receive real-time updates for a specific workflow.

**Endpoint:** `ws://localhost:8000/ws/{run_id}`

**Example Update Message:**
```json
{
    "type": "workflow_update",
    "run_id": "98742a9e-a870-4fc7-a4f3-72acd014d351",
    "timestamp": "2025-04-02T16:08:40.354Z",
    "data": {
        "progress": 60,
        "current_step": "执行分析",
        "status": "running"
    }
}
```

### 2. Subscribe to All Workflow Updates
Connect to receive updates for all workflows.

**Endpoint:** `ws://localhost:8000/ws`

## Python Client Example

### REST API Usage
```python
import requests
import json

# Start workflow
response = requests.post(
    "http://localhost:8000/run",
    json={
        "workflow_type": "sdl_analysis",
        "workflow_config": {
            "input_data": "sample_data.csv",
            "analysis_type": "performance"
        }
    }
)
run_id = response.json()["run_id"]

# Get status
status = requests.get(f"http://localhost:8000/status/{run_id}").json()

# Get logs
logs = requests.get(f"http://localhost:8000/logs/{run_id}").json()
```

### WebSocket Client
```python
import asyncio
import websockets
import json

async def subscribe_to_workflow(run_id: str):
    uri = f"ws://localhost:8000/ws/{run_id}"
    
    async with websockets.connect(uri) as websocket:
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            print(f"Received update: {json.dumps(data, indent=2)}")

# Run the client
asyncio.run(subscribe_to_workflow("your-run-id"))
```

## Status Codes
- 200: Success
- 404: Workflow not found
- 500: Internal server error

## Workflow States
- `pending`: Initial state
- `running`: Workflow is executing
- `completed`: Workflow finished successfully
- `failed`: Workflow execution failed

## Best Practices
1. Always store the `run_id` returned from the `/run` endpoint
2. Use WebSocket connections for real-time monitoring
3. Implement proper error handling for both REST and WebSocket connections
4. Check workflow logs for detailed execution information
5. Use the status endpoint to verify workflow completion

## Rate Limits
Currently, no rate limits are implemented (development only).

## Support
For issues and feature requests, please contact the development team. 
