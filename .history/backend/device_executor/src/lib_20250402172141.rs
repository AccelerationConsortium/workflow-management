pub mod devices;
pub mod api;
pub mod error;
pub mod events;
pub mod manager;
pub mod config;
pub mod python;

use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use thiserror::Error;
use tokio::sync::RwLock;
use rand::{Rng, thread_rng};
use uuid::Uuid;

pub use error::{DeviceError, DeviceErrorCode};
pub use config::DeviceConfig;
pub use events::{DeviceEvent, DeviceEventType, EventBus};
pub use manager::DeviceManager;

#[derive(Debug, Error)]
pub enum DeviceError {
    #[error("设备未初始化")]
    NotInitialized {
        device_id: String,
    },
    
    #[error("设备忙")]
    Busy {
        device_id: String,
        operation: String,
    },
    
    #[error("无效参数: {reason}")]
    InvalidParameter {
        device_id: String,
        reason: String,
    },
    
    #[error("设备错误: {message}")]
    DeviceError {
        device_id: String,
        message: String,
        error_code: DeviceErrorCode,
    },
}

impl DeviceError {
    pub fn new(device_id: impl Into<String>, message: impl Into<String>, error_code: DeviceErrorCode) -> Self {
        Self::DeviceError {
            device_id: device_id.into(),
            message: message.into(),
            error_code,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceStatus {
    Idle,
    Busy,
    Error,
}

impl std::fmt::Display for DeviceStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DeviceStatus::Idle => write!(f, "IDLE"),
            DeviceStatus::Busy => write!(f, "BUSY"),
            DeviceStatus::Error => write!(f, "ERROR"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceState {
    pub status: DeviceStatus,
    pub parameters: HashMap<String, Value>,
}

#[async_trait]
pub trait DeviceExecutor: Send + Sync {
    async fn initialize(&mut self) -> Result<(), DeviceError>;
    async fn execute(&mut self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError>;
    async fn get_status(&self) -> Result<DeviceState, DeviceError>;
    async fn reset(&mut self) -> Result<(), DeviceError>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SDLDeviceConfig {
    pub latency_ms: u64,
    pub fail_rate: f64,
    pub enable_noise: bool,
    pub noise_range: f64,
    pub position_range: std::ops::Range<f64>,
}

impl Default for SDLDeviceConfig {
    fn default() -> Self {
        Self {
            latency_ms: 100,
            fail_rate: 0.01,
            enable_noise: true,
            noise_range: 0.05,
            position_range: -100.0..100.0,
        }
    }
}

pub struct SDLDeviceExecutor {
    state: RwLock<DeviceState>,
    device_id: String,
    config: SDLDeviceConfig,
}

impl SDLDeviceExecutor {
    pub fn new() -> Self {
        Self::new_with_config(SDLDeviceConfig::default())
    }

    pub fn new_with_config(config: SDLDeviceConfig) -> Self {
        Self {
            state: RwLock::new(DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            }),
            device_id: Uuid::new_v4().to_string(),
            config,
        }
    }

    async fn simulate_operation_delay(&self) {
        tokio::time::sleep(tokio::time::Duration::from_millis(self.config.latency_ms)).await;
    }

    fn should_fail(&self) -> bool {
        let mut rng = thread_rng();
        rng.gen::<f64>() < self.config.fail_rate
    }

    fn apply_noise(&self, value: f64) -> f64 {
        if !self.config.enable_noise {
            return value;
        }
        let mut rng = thread_rng();
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
    
    async fn execute(&mut self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError> {
        let mut state = self.state.write().await;
        
        // 检查设备状态
        match state.status {
            DeviceStatus::Busy => return Err(DeviceError::new(
                self.device_id.clone(),
                "设备正在执行其他操作".to_string(),
                DeviceErrorCode::Busy,
            )),
            DeviceStatus::Error => return Err(DeviceError::new(
                self.device_id.clone(),
                "设备处于错误状态".to_string(),
                DeviceErrorCode::StateError,
                )),
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
            return Err(DeviceError::new(
                self.device_id.clone(),
                "操作随机失败".to_string(),
                DeviceErrorCode::HardwareError,
            ));
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
                        .ok_or_else(|| DeviceError::new(
                            self.device_id.clone(),
                            "位置必须是数字".to_string(),
                            DeviceErrorCode::InvalidParameter,
                        ))?;

                    if !self.config.position_range.contains(&target_pos) {
                        return Err(DeviceError::new(
                            self.device_id.clone(),
                            "位置超出范围".to_string(),
                            DeviceErrorCode::InvalidParameter,
                        ));
                    }

                    serde_json::json!({
                        "position": target_pos,
                        "status": "completed"
                    })
                } else {
                    return Err(DeviceError::new(
                        self.device_id.clone(),
                        "未指定位置参数".to_string(),
                        DeviceErrorCode::InvalidParameter,
                    ));
                }
            }
            _ => return Err(DeviceError::new(
                self.device_id.clone(),
                format!("未知操作: {}", operation),
                DeviceErrorCode::InvalidParameter,
            )),
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

pub fn create_device(device_type: &str, device_id: String) -> Result<Box<dyn DeviceExecutor>, DeviceError> {
    match device_type {
        "cva" => Ok(Box::new(devices::cva::CVADevice::new(&device_id))),
        "sdl" => Ok(Box::new(SDLDeviceExecutor::new())),
        _ => Err(DeviceError::new(
            device_id,
            format!("不支持的设备类型: {}", device_type),
            DeviceErrorCode::InvalidParameter,
        )),
    }
}

#[pymodule]
fn device_executor(_py: Python, m: &PyModule) -> PyResult<()> {
    python::init_module(_py, m)?;
    Ok(())
}

// 导出主要的 API 函数
pub async fn start_api_server() {
    api::run_api_server().await;
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::devices::cva::CVAConfig;

    #[tokio::test]
    async fn test_cva_device_creation() {
        let device_id = "test_cva_1".to_string();
        let config = DeviceConfig::CVA(CVAConfig::default());
        let device = create_device("cva", device_id);
        assert!(device.is_ok());
    }
} 
