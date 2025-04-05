use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::sync::RwLock;
use rand::Rng;

mod python;
mod config;
mod error;
mod events;
mod manager;

pub use config::DeviceConfig;
pub use error::{DeviceError, DeviceErrorCode};
pub use events::{DeviceEvent, DeviceEventType, EventBus};
pub use manager::DeviceManager;

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
    config: DeviceConfig,
    device_id: String,
}

impl SDLDeviceExecutor {
    pub fn new() -> Self {
        Self::new_with_config(DeviceConfig::default())
    }

    pub fn new_with_config(config: DeviceConfig) -> Self {
        Self {
            state: RwLock::new(DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            }),
            config,
            device_id: uuid::Uuid::new_v4().to_string(),
        }
    }

    async fn simulate_operation_delay(&self) {
        tokio::time::sleep(tokio::time::Duration::from_millis(self.config.latency_ms)).await;
    }

    fn should_fail(&self) -> bool {
        let mut rng = rand::thread_rng();
        rng.gen::<f64>() < self.config.fail_rate
    }

    fn apply_noise(&self, value: f64) -> f64 {
        if !self.config.enable_noise {
            return value;
        }
        let mut rng = rand::thread_rng();
        let noise = rng.gen_range(-self.config.noise_range..self.config.noise_range);
        value * (1.0 + noise)
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
            DeviceStatus::Busy => return Err(DeviceError::DeviceBusy {
                device_id: self.device_id.clone(),
                operation: operation.to_string(),
                since: chrono::Utc::now(),
            }),
            DeviceStatus::Error => return Err(DeviceError::DeviceError {
                device_id: self.device_id.clone(),
                message: "设备处于错误状态".to_string(),
                error_code: DeviceErrorCode::StateError,
                source: None,
            }),
            DeviceStatus::Idle => {}
        }
        
        // 设置设备为忙状态
        state.status = DeviceStatus::Busy;
        drop(state);  // 释放锁

        // 模拟操作延迟
        self.simulate_operation_delay().await;

        // 模拟随机失败
        if self.should_fail() {
            let mut state = self.state.write().await;
            state.status = DeviceStatus::Error;
            return Err(DeviceError::DeviceError {
                device_id: self.device_id.clone(),
                message: "操作随机失败".to_string(),
                error_code: DeviceErrorCode::HardwareError,
                source: None,
            });
        }
        
        // 执行操作
        let result = match operation {
            "measure" => {
                let base_value = 42.0;
                let value = self.apply_noise(base_value);
                serde_json::json!({
                    "value": value,
                    "unit": "mV",
                    "timestamp": chrono::Utc::now().to_rfc3339()
                })
            }
            "move" => {
                if let Some(position) = params.get("position") {
                    let target_pos = position.as_f64()
                        .ok_or_else(|| DeviceError::InvalidParameter {
                            reason: "位置必须是数字".to_string(),
                            parameter: "position".to_string(),
                            valid_range: Some(format!("{:?}", self.config.position_range)),
                        })?;

                    if !self.config.position_range.contains(&target_pos) {
                        return Err(DeviceError::InvalidParameter {
                            reason: "位置超出范围".to_string(),
                            parameter: "position".to_string(),
                            valid_range: Some(format!("{:?}", self.config.position_range)),
                        });
                    }

                    serde_json::json!({
                        "position": target_pos,
                        "status": "completed"
                    })
                } else {
                    return Err(DeviceError::InvalidParameter {
                        reason: "未指定位置参数".to_string(),
                        parameter: "position".to_string(),
                        valid_range: None,
                    });
                }
            }
            _ => return Err(DeviceError::InvalidParameter {
                reason: format!("未知操作: {}", operation),
                parameter: "operation".to_string(),
                valid_range: None,
            }),
        };
        
        // 恢复空闲状态
        let mut state = self.state.write().await;
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

use pyo3::prelude::*;

#[pymodule]
fn device_executor(_py: Python, m: &PyModule) -> PyResult<()> {
    python::init_module(_py, m)?;
    Ok(())
} 
