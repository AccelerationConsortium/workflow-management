use std::error::Error;
use std::fmt;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceErrorCode {
    InvalidParameter,
    StateError,
    HardwareError,
    SystemError,
    DeviceNotFound,
    DeviceBusy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceError {
    InvalidParameter {
        device_id: String,
        parameter: String,
        reason: String,
        valid_range: Option<String>,
    },
    DeviceBusy {
        device_id: String,
        operation: String,
    },
    DeviceError {
        device_id: String,
        message: String,
        error_code: DeviceErrorCode,
    },
    DeviceNotFound {
        device_id: String,
    },
}

impl fmt::Display for DeviceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DeviceError::InvalidParameter { device_id, parameter, reason, .. } => {
                write!(f, "设备 {} 的参数 {} 无效: {}", device_id, parameter, reason)
            }
            DeviceError::DeviceBusy { device_id, operation } => {
                write!(f, "设备 {} 正在执行操作: {}", device_id, operation)
            }
            DeviceError::DeviceError { device_id, message, .. } => {
                write!(f, "设备 {} 错误: {}", device_id, message)
            }
            DeviceError::DeviceNotFound { device_id } => {
                write!(f, "找不到设备: {}", device_id)
            }
        }
    }
}

impl Error for DeviceError {} 
