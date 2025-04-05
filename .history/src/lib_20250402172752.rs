use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use tokio::sync::RwLock;

mod error;
pub use error::{DeviceError, DeviceErrorCode};

pub mod devices;
pub mod events;
pub mod manager;
pub mod python;

#[derive(Debug, Clone, PartialEq)]
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

impl Default for DeviceState {
    fn default() -> Self {
        Self {
            status: DeviceStatus::Idle,
            parameters: HashMap::new(),
        }
    }
}

#[async_trait]
pub trait DeviceExecutor: Send + Sync {
    async fn initialize(&self, config: Option<Value>) -> Result<(), DeviceError>;
    async fn execute(&self, operation: &str, params: Option<Value>) -> Result<Value, DeviceError>;
    async fn get_status(&self) -> Result<DeviceState, DeviceError>;
    async fn reset(&self) -> Result<(), DeviceError>;
}

pub struct SDLDeviceExecutor {
    device_id: String,
    state: RwLock<DeviceState>,
}

impl SDLDeviceExecutor {
    pub fn new(device_id: &str) -> Self {
        Self {
            device_id: device_id.to_string(),
            state: RwLock::new(DeviceState::default()),
        }
    }

    async fn should_fail(&self) -> bool {
        let failure_rate = self.state.read().await.parameters.get("failure_rate")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let mut rng = thread_rng();
        rng.gen::<f64>() < failure_rate
    }

    async fn apply_noise(&self, value: f64) -> f64 {
        let noise_amplitude = self.state.read().await.parameters.get("noise_amplitude")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let mut rng = thread_rng();
        let noise = rng.gen_range(-noise_amplitude..noise_amplitude);
        value + noise
    }
}

#[async_trait]
impl DeviceExecutor for SDLDeviceExecutor {
    async fn initialize(&self, _config: Option<Value>) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        Ok(())
    }

    async fn execute(&self, operation: &str, params: Option<Value>) -> Result<Value, DeviceError> {
        let mut state = self.state.write().await;
        if state.status == DeviceStatus::Busy {
            return Err(DeviceError::new(
                &self.device_id,
                "设备正在执行其他操作",
                DeviceErrorCode::Busy,
            ));
        }

        state.status = DeviceStatus::Busy;
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        match operation {
            "get_position" => {
                state.status = DeviceStatus::Idle;
                Ok(serde_json::json!({ "position": 0.0 }))
            }
            "move_to" => {
                let target_pos = params
                    .and_then(|v| v.get("position"))
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::new(
                        &self.device_id,
                        "未指定目标位置",
                        DeviceErrorCode::InvalidParameter,
                    ))?;

                tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                state.status = DeviceStatus::Idle;
                Ok(serde_json::json!({ "position": target_pos }))
            }
            _ => Err(DeviceError::new(
                &self.device_id,
                &format!("未知操作: {}", operation),
                DeviceErrorCode::InvalidParameter,
            )),
        }
    }

    async fn get_status(&self) -> Result<DeviceState, DeviceError> {
        Ok(self.state.read().await.clone())
    }

    async fn reset(&self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }
} 
