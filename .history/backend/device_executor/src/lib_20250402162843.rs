use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::sync::RwLock;

#[derive(Debug, Error)]
pub enum DeviceError {
    #[error("设备未初始化")]
    NotInitialized,
    #[error("设备忙")]
    DeviceBusy,
    #[error("无效参数: {0}")]
    InvalidParameter(String),
    #[error("设备错误: {0}")]
    DeviceError(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceStatus {
    Idle,
    Busy,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceState {
    pub status: DeviceStatus,
    pub parameters: HashMap<String, serde_json::Value>,
}

#[async_trait]
pub trait DeviceExecutor: Send + Sync {
    /// 初始化设备
    async fn initialize(&mut self) -> Result<(), DeviceError>;
    
    /// 执行设备操作
    async fn execute(&mut self, operation: &str, params: HashMap<String, serde_json::Value>) -> Result<serde_json::Value, DeviceError>;
    
    /// 获取设备状态
    async fn get_status(&self) -> Result<DeviceState, DeviceError>;
    
    /// 重置设备
    async fn reset(&mut self) -> Result<(), DeviceError>;
}

pub struct SDLDeviceExecutor {
    state: RwLock<DeviceState>,
}

impl SDLDeviceExecutor {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            }),
        }
    }
}

#[async_trait]
impl DeviceExecutor for SDLDeviceExecutor {
    async fn initialize(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        Ok(())
    }
    
    async fn execute(&mut self, operation: &str, params: HashMap<String, serde_json::Value>) -> Result<serde_json::Value, DeviceError> {
        let mut state = self.state.write().await;
        
        // 检查设备状态
        match state.status {
            DeviceStatus::Busy => return Err(DeviceError::DeviceBusy),
            DeviceStatus::Error => return Err(DeviceError::DeviceError("设备处于错误状态".to_string())),
            DeviceStatus::Idle => {}
        }
        
        // 设置设备为忙状态
        state.status = DeviceStatus::Busy;
        
        // 执行操作
        let result = match operation {
            "measure" => {
                // 模拟测量操作
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                serde_json::json!({
                    "value": 42.0,
                    "unit": "mV",
                    "timestamp": chrono::Utc::now().to_rfc3339()
                })
            }
            "move" => {
                // 模拟移动操作
                if let Some(position) = params.get("position") {
                    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                    serde_json::json!({
                        "position": position,
                        "status": "completed"
                    })
                } else {
                    return Err(DeviceError::InvalidParameter("未指定位置参数".to_string()));
                }
            }
            _ => return Err(DeviceError::InvalidParameter(format!("未知操作: {}", operation))),
        };
        
        // 恢复空闲状态
        state.status = DeviceStatus::Idle;
        
        Ok(result)
    }
    
    async fn get_status(&self) -> Result<DeviceState, DeviceError> {
        Ok(self.state.read().await.clone())
    }
    
    async fn reset(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }
} 
