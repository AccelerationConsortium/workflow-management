use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use rand::{Rng, thread_rng};
use async_trait::async_trait;

mod error;
mod config;
mod events;
mod api;
mod python;
mod devices;
mod manager;

pub use error::{DeviceError, DeviceErrorCode};
pub use config::DeviceConfig;
pub use events::DeviceEvent;
pub use manager::DeviceManager;

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
pub trait DeviceExecutor: Send + Sync {
    async fn initialize(&mut self, config: Value) -> Result<(), DeviceError>;
    async fn execute(&mut self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError>;
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
        
        let mut rng = thread_rng();
        rng.gen::<f64>() < failure_rate
    }

    async fn apply_noise(&self, value: f64) -> f64 {
        let noise_amplitude = self.state.parameters.get("noise_amplitude")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        
        let mut rng = thread_rng();
        let noise = rng.gen_range(-noise_amplitude..noise_amplitude);
        value + noise
    }
}

#[async_trait]
impl DeviceExecutor for SDLDeviceExecutor {
    async fn initialize(&mut self, config: Value) -> Result<(), DeviceError> {
        if let Value::Object(map) = config {
            self.state.parameters = map.into_iter()
                .map(|(k, v)| (k, v))
                .collect();
        }
        self.state.status = DeviceStatus::Idle;
        Ok(())
    }

    async fn execute(&mut self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError> {
        if self.state.status == DeviceStatus::Busy {
            return Err(DeviceError::DeviceBusy {
                device_id: self.device_id.clone(),
                operation: operation.to_string(),
            });
        }

        if self.state.status == DeviceStatus::Error {
            return Err(DeviceError::DeviceError {
                device_id: self.device_id.clone(),
                message: "设备处于错误状态".to_string(),
                error_code: DeviceErrorCode::StateError,
            });
        }

        self.state.status = DeviceStatus::Busy;

        // 模拟随机失败
        if self.should_fail().await {
            self.state.status = DeviceStatus::Error;
            return Err(DeviceError::DeviceError {
                device_id: self.device_id.clone(),
                message: "操作随机失败".to_string(),
                error_code: DeviceErrorCode::HardwareError,
            });
        }

        let result = match operation {
            "move_to" => {
                let target_pos = params.get("position")
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::InvalidParameter {
                        device_id: self.device_id.clone(),
                        parameter: "position".to_string(),
                        reason: "位置必须是数字".to_string(),
                        valid_range: None,
                    })?;

                let position_range = self.state.parameters.get("position_range")
                    .and_then(|v| v.as_array())
                    .and_then(|arr| {
                        if arr.len() == 2 {
                            Some((
                                arr[0].as_f64().unwrap_or(0.0),
                                arr[1].as_f64().unwrap_or(1.0)
                            ))
                        } else {
                            None
                        }
                    })
                    .unwrap_or((0.0, 1.0));

                if target_pos < position_range.0 || target_pos > position_range.1 {
                    return Err(DeviceError::InvalidParameter {
                        device_id: self.device_id.clone(),
                        parameter: "position".to_string(),
                        reason: "位置超出范围".to_string(),
                        valid_range: Some(format!("{:?}", position_range)),
                    });
                }

                self.state.parameters.insert("position".to_string(), Value::from(target_pos));
                Value::from(target_pos)
            }
            _ => {
                return Err(DeviceError::InvalidParameter {
                    device_id: self.device_id.clone(),
                    parameter: "operation".to_string(),
                    reason: format!("未知操作: {}", operation),
                    valid_range: None,
                });
            }
        };

        self.state.status = DeviceStatus::Idle;
        Ok(result)
    }

    fn get_status(&self) -> DeviceState {
        self.state.clone()
    }

    async fn reset(&mut self) -> Result<(), DeviceError> {
        self.state.status = DeviceStatus::Idle;
        self.state.parameters.clear();
        Ok(())
    }
} 
