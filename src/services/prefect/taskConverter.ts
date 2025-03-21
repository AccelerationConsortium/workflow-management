import { DeviceDefinition, DeviceExecutionMode } from '../../types/device';
import { WorkflowNode } from '../../types/workflow';

export interface PrefectTaskDefinition {
  name: string;
  fn_name: string;
  tags: string[];
  retries: number;
  retry_delay_seconds: number;
  timeout_seconds: number;
  script: string;
  parameters: Record<string, any>;
}

export class PrefectTaskConverter {
  private deviceDefinitions: Map<string, DeviceDefinition>;

  constructor(deviceDefinitions: DeviceDefinition[]) {
    this.deviceDefinitions = new Map(
      deviceDefinitions.map(def => [def.type, def])
    );
  }

  public convertNodeToTask(node: WorkflowNode): PrefectTaskDefinition {
    const deviceDef = this.deviceDefinitions.get(node.type);
    if (!deviceDef) {
      throw new Error(`No device definition found for type: ${node.type}`);
    }

    // Validate parameters if validation method exists
    if (deviceDef.validateParameters && !deviceDef.validateParameters(node.data)) {
      throw new Error(`Invalid parameters for device type: ${node.type}`);
    }

    // Generate script based on execution mode
    const script = this.generateScript(deviceDef, node.data);

    return {
      name: `${node.type}_${node.id}`,
      fn_name: `run_${node.type.toLowerCase()}`,
      tags: [`device_${deviceDef.type}`],
      retries: deviceDef.errorHandling?.maxRetries ?? 3,
      retry_delay_seconds: deviceDef.errorHandling?.retryDelay ?? 30,
      timeout_seconds: deviceDef.monitoring?.timeout ?? 3600,
      script,
      parameters: node.data
    };
  }

  private generateScript(deviceDef: DeviceDefinition, parameters: Record<string, any>): string {
    switch (deviceDef.executionMode) {
      case DeviceExecutionMode.LOCAL:
        return this.generateLocalScript(deviceDef, parameters);
      case DeviceExecutionMode.REMOTE:
        return this.generateRemoteScript(deviceDef, parameters);
      case DeviceExecutionMode.MQTT:
        return this.generateMQTTScript(deviceDef, parameters);
      case DeviceExecutionMode.GRPC:
        return this.generateGRPCScript(deviceDef, parameters);
      default:
        throw new Error(`Unsupported execution mode: ${deviceDef.executionMode}`);
    }
  }

  private generateLocalScript(deviceDef: DeviceDefinition, parameters: Record<string, any>): string {
    // 本地脚本执行模板
    return `
import subprocess
import json
import sys
import os

def run_${deviceDef.type.toLowerCase()}(**params):
    try:
        ${deviceDef.initializationScript ? `
        # Run initialization script
        ${deviceDef.initializationScript}
        ` : ''}

        # Prepare parameters
        script_path = "${deviceDef.type.toLowerCase()}_script.py"
        cmd = [sys.executable, script_path]
        
        # Add parameters to command
        for key, value in params.items():
            cmd.extend([f"--{key}", str(value)])
        
        # Execute script
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        ${deviceDef.cleanupScript ? `
        # Run cleanup script
        ${deviceDef.cleanupScript}
        ` : ''}

        # Parse output
        return {
            "status": "success",
            "output": result.stdout,
            "error": result.stderr
        }
        
    except subprocess.CalledProcessError as e:
        return {
            "status": "error",
            "error": str(e),
            "output": e.stdout if e.stdout else ""
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
    `;
  }

  private generateRemoteScript(deviceDef: DeviceDefinition, parameters: Record<string, any>): string {
    if (!deviceDef.communication.remote) {
      throw new Error('Remote configuration is required for REMOTE execution mode');
    }

    const { host, port, username, privateKeyPath } = deviceDef.communication.remote;

    return `
import paramiko
import json
import sys

def run_${deviceDef.type.toLowerCase()}(**params):
    try:
        # Setup SSH client
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Connect to remote host
        client.connect(
            hostname="${host}",
            port=${port},
            username="${username}",
            key_filename="${privateKeyPath}"
        )
        
        # Prepare command
        cmd = f"python3 {script_path}"
        for key, value in params.items():
            cmd += f" --{key} {value}"
        
        # Execute command
        stdin, stdout, stderr = client.exec_command(cmd)
        
        # Get results
        result = {
            "status": "success",
            "output": stdout.read().decode(),
            "error": stderr.read().decode()
        }
        
        client.close()
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
    `;
  }

  private generateMQTTScript(deviceDef: DeviceDefinition, parameters: Record<string, any>): string {
    if (!deviceDef.communication.mqtt) {
      throw new Error('MQTT configuration is required for MQTT execution mode');
    }

    const { broker, port, commandTopic, statusTopic, qos = 1 } = deviceDef.communication.mqtt;

    return `
import paho.mqtt.client as mqtt
import json
import time
import uuid

def run_${deviceDef.type.toLowerCase()}(**params):
    client = mqtt.Client()
    
    try:
        client.connect("${broker}", ${port})
        client.loop_start()
        
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        
        # Prepare message
        message = {
            "request_id": request_id,
            "parameters": params
        }
        
        # Publish message
        client.publish("${commandTopic}", json.dumps(message), qos=${qos})
        
        # Subscribe to status topic
        status = {"received": False}
        
        def on_message(client, userdata, msg):
            if msg.topic == "${statusTopic}":
                response = json.loads(msg.payload)
                if response.get("request_id") == request_id:
                    status["response"] = response
                    status["received"] = True
        
        client.on_message = on_message
        client.subscribe("${statusTopic}", qos=${qos})
        
        # Wait for response
        timeout = ${deviceDef.monitoring.timeout}
        start_time = time.time()
        while not status["received"] and (time.time() - start_time) < timeout:
            time.sleep(0.1)
        
        client.loop_stop()
        client.disconnect()
        
        if not status["received"]:
            return {
                "status": "error",
                "error": "Timeout waiting for response"
            }
        
        return status["response"]
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
    `;
  }

  private generateGRPCScript(deviceDef: DeviceDefinition, parameters: Record<string, any>): string {
    if (!deviceDef.communication.grpc) {
      throw new Error('gRPC configuration is required for gRPC execution mode');
    }

    const { host, port, serviceName, protoPath } = deviceDef.communication.grpc;

    return `
import grpc
import importlib.util
import sys
import os

def run_${deviceDef.type.toLowerCase()}(**params):
    try:
        # Import generated gRPC modules
        spec = importlib.util.spec_from_file_location(
            "${serviceName}_pb2", 
            "${protoPath}/${serviceName}_pb2.py"
        )
        pb2 = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(pb2)
        
        spec = importlib.util.spec_from_file_location(
            "${serviceName}_pb2_grpc",
            "${protoPath}/${serviceName}_pb2_grpc.py"
        )
        pb2_grpc = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(pb2_grpc)
        
        # Create channel and stub
        channel = grpc.insecure_channel("${host}:${port}")
        stub = pb2_grpc.${serviceName}Stub(channel)
        
        # Create request message
        request = pb2.ExecuteRequest(**params)
        
        # Make RPC call
        response = stub.Execute(request)
        
        return {
            "status": "success",
            "response": {
                "result": response.result,
                "message": response.message
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
    `;
  }
} 
