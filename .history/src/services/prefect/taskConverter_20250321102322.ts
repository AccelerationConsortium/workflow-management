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

    // Generate script based on execution mode
    const script = this.generateScript(deviceDef, node.data);

    return {
      name: `${node.type}_${node.id}`,
      fn_name: `run_${node.type.toLowerCase()}`,
      tags: [...deviceDef.tags, `device_${deviceDef.type}`],
      retries: 3,
      retry_delay_seconds: 30,
      timeout_seconds: 3600,
      script,
      parameters: node.data
    };
  }

  private generateScript(deviceDef: DeviceDefinition, parameters: Record<string, any>): string {
    if (deviceDef.executionMode === 'local') {
      return this.generateLocalScript(deviceDef, parameters);
    } else {
      return this.generateRemoteScript(deviceDef, parameters);
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
        # Prepare parameters
        script_path = "${deviceDef.scriptPath}"
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
    if (deviceDef.remoteConfig?.protocol === 'mqtt') {
      return this.generateMQTTScript(deviceDef, parameters);
    } else if (deviceDef.remoteConfig?.protocol === 'grpc') {
      return this.generateGRPCScript(deviceDef, parameters);
    }
    throw new Error(`Unsupported remote protocol: ${deviceDef.remoteConfig?.protocol}`);
  }

  private generateMQTTScript(deviceDef: DeviceDefinition, parameters: Record<string, any>): string {
    return `
import paho.mqtt.client as mqtt
import json
import time
import uuid

def run_${deviceDef.type.toLowerCase()}(**params):
    client = mqtt.Client()
    
    # Set up credentials if needed
    ${deviceDef.remoteConfig?.credentials ? `
    client.username_pw_set(
        "${deviceDef.remoteConfig.credentials.username}",
        "${deviceDef.remoteConfig.credentials.password}"
    )` : ''}
    
    try:
        client.connect("${deviceDef.remoteConfig?.host}", ${deviceDef.remoteConfig?.port})
        client.loop_start()
        
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        
        # Prepare message
        message = {
            "request_id": request_id,
            "script": "${deviceDef.scriptPath}",
            "parameters": params
        }
        
        # Publish message
        client.publish("${deviceDef.remoteConfig?.topic}/request", json.dumps(message))
        
        # Wait for response (implement response handling logic)
        time.sleep(5)  # Adjust timeout as needed
        
        client.loop_stop()
        client.disconnect()
        
        return {
            "status": "success",
            "request_id": request_id
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
    `;
  }

  private generateGRPCScript(deviceDef: DeviceDefinition, parameters: Record<string, any>): string {
    // 实现 gRPC 调用脚本生成
    // 这里需要根据具体的 gRPC 服务定义来生成
    return `
# gRPC implementation placeholder
# Will be implemented based on specific service definition
    `;
  }
} 
