use std::collections::HashMap;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use async_trait::async_trait;
use rand::Rng;

pub use error::{DeviceError, DeviceErrorCode};
pub use config::DeviceConfig;
pub mod error;
pub mod config;
pub mod events;
pub mod manager;
pub mod python;
pub mod devices;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
pub trait DeviceExecutor {
    async fn initialize(&mut self) -> Result<(), DeviceError>;
    async fn execute(&self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError>;
    fn get_status(&self) -> DeviceState;
    async fn reset(&mut self) -> Result<(), DeviceError>;
}

pub struct SDLDeviceExecutor {
    device_id: String,
    state: DeviceState,
}

impl SDLDeviceExecutor {
    pub fn new(device_id: String) -> Self {
        Self {
            device_id,
            state: DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            },
        }
    }

    async fn should_fail(&self) -> bool {
        let failure_rate = self.state.parameters.get("failure_rate")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let mut rng = rand::thread_rng();
        rng.gen::<f64>() < failure_rate
    }

    async fn apply_noise(&self, value: f64) -> f64 {
        let noise_amplitude = self.state.parameters.get("noise_amplitude")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let mut rng = rand::thread_rng();
        let noise = rng.gen_range(-noise_amplitude..noise_amplitude);
        value + noise
    }
}

#[async_trait]
impl DeviceExecutor for SDLDeviceExecutor {
    async fn initialize(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.parameters.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }

    async fn execute(&self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError> {
        let mut state = self.state.parameters.write().await;
        
        // 检查设备状态
        match state.status {
            DeviceStatus::Busy => {
                return Err(DeviceError::DeviceBusy {
                    device_id: self.device_id.clone(),
                    operation: operation.to_string(),
                    since: chrono::Utc::now(),
                });
            }
            DeviceStatus::Error => {
                return Err(DeviceError::DeviceError {
                    device_id: self.device_id.clone(),
                    message: "设备处于错误状态".to_string(),
                    error_code: DeviceErrorCode::StateError,
                    source: None,
                });
            }
            DeviceStatus::Idle => {}
        }

        // 设置设备为忙状态
        state.status = DeviceStatus::Busy;
        drop(state);

        // 模拟操作延迟
        self.simulate_delay().await;

        // 模拟随机失败
        if self.should_fail() {
            let mut state = self.state.parameters.write().await;
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
            "move" => {
                let target_pos = params.get("position")
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::InvalidParameter {
                        reason: "位置必须是数字".to_string(),
                        parameter: "position".to_string(),
                        valid_range: None,
                    })?;

                if !self.config.position_range.contains(&target_pos) {
                    return Err(DeviceError::InvalidParameter {
                        reason: "位置超出范围".to_string(),
                        parameter: "position".to_string(),
                        valid_range: Some(format!("{:?}", self.config.position_range)),
                    });
                }

                let mut state = self.state.parameters.write().await;
                state.parameters.insert("position".to_string(), Value::from(target_pos));
                Value::from(target_pos)
            }
            "measure" => {
                let base_value = 42.0;
                let value = self.apply_noise(base_value);
                Value::from(value)
            }
            _ => {
                return Err(DeviceError::InvalidParameter {
                    reason: format!("未知操作: {}", operation),
                    parameter: "operation".to_string(),
                    valid_range: None,
                });
            }
        };

        // 恢复空闲状态
        let mut state = self.state.parameters.write().await;
        state.status = DeviceStatus::Idle;
        
        Ok(result)
    }

    fn get_status(&self) -> DeviceState {
        self.state.clone()
    }

    async fn reset(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.parameters.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }
} 
