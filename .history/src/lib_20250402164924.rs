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
pub trait DeviceExecutor {
    async fn initialize(&mut self) -> Result<(), DeviceError>;
    async fn execute(&self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError>;
    fn get_status(&self) -> DeviceState;
    async fn reset(&mut self) -> Result<(), DeviceError>;
}

pub struct SDLDeviceExecutor {
    pub state: RwLock<DeviceState>,
    pub device_id: String,
    pub config: DeviceConfig,
}

impl SDLDeviceExecutor {
    pub fn new_with_config(config: DeviceConfig) -> Self {
        Self {
            state: RwLock::new(DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            }),
            device_id: uuid::Uuid::new_v4().to_string(),
            config,
        }
    }

    async fn simulate_delay(&self) {
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
        value + noise
    }
}

#[async_trait]
impl DeviceExecutor for SDLDeviceExecutor {
    async fn initialize(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }

    async fn execute(&self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError> {
        let state = self.state.read().await;
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
            _ => {}
        }
        drop(state);

        self.simulate_delay().await;

        if self.should_fail() {
            return Err(DeviceError::DeviceError {
                device_id: self.device_id.clone(),
                message: "操作随机失败".to_string(),
                error_code: DeviceErrorCode::HardwareError,
                source: None,
            });
        }

        match operation {
            "move" => {
                let target_pos = params.get("position")
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::InvalidParameter {
                        reason: "位置必须是数字".to_string(),
                        parameter: "position".to_string(),
                        valid_range: None,
                    })?;

                if !self.config.position_range.0 <= target_pos && target_pos <= self.config.position_range.1 {
                    return Err(DeviceError::InvalidParameter {
                        reason: "位置超出范围".to_string(),
                        parameter: "position".to_string(),
                        valid_range: Some(format!("{:?}", (self.config.position_range.0, self.config.position_range.1))),
                    });
                }

                let mut state = self.state.write().await;
                state.parameters.insert("position".to_string(), Value::from(target_pos));
                Ok(Value::from(target_pos))
            }
            "get_position" => {
                let state = self.state.read().await;
                state.parameters.get("position")
                    .cloned()
                    .ok_or_else(|| DeviceError::InvalidParameter {
                        reason: "未指定位置参数".to_string(),
                        parameter: "position".to_string(),
                        valid_range: None,
                    })
            }
            _ => {
                Err(DeviceError::InvalidParameter {
                    reason: format!("未知操作: {}", operation),
                    parameter: "operation".to_string(),
                    valid_range: None,
                })
            }
        }
    }

    fn get_status(&self) -> DeviceState {
        self.state.try_read()
            .map(|state| state.clone())
            .unwrap_or_else(|_| DeviceState {
                status: DeviceStatus::Error,
                parameters: HashMap::new(),
            })
    }

    async fn reset(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }
} 
