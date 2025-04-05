use std::error::Error as StdError;
use thiserror::Error;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceErrorCode {
    HardwareError,
    CommunicationError,
    ConfigurationError,
    StateError,
    SystemError,
    Unknown,
}

#[derive(Debug, Error, Clone, Serialize, Deserialize)]
pub enum DeviceError {
    #[error("设备未初始化")]
    NotInitialized,
    
    #[error("设备忙: {device_id} 正在执行 {operation} 自 {since}")]
    DeviceBusy {
        device_id: String,
        operation: String,
        since: DateTime<Utc>,
    },
    
    #[error("无效参数 {parameter}: {reason}")]
    InvalidParameter {
        reason: String,
        parameter: String,
        valid_range: Option<String>,
    },
    
    #[error("设备错误 {device_id}: {message}")]
    DeviceError {
        device_id: String,
        message: String,
        error_code: DeviceErrorCode,
        #[serde(skip)]
        source: Option<Box<dyn StdError + Send + Sync + 'static>>,
    },
    
    #[error("操作超时")]
    Timeout {
        device_id: String,
        operation: String,
        timeout_ms: u64,
    },
    
    #[error("设备不存在: {device_id}")]
    DeviceNotFound {
        device_id: String,
    },
}

impl DeviceError {
    pub fn error_code(&self) -> DeviceErrorCode {
        match self {
            Self::NotInitialized => DeviceErrorCode::StateError,
            Self::DeviceBusy { .. } => DeviceErrorCode::StateError,
            Self::InvalidParameter { .. } => DeviceErrorCode::ConfigurationError,
            Self::DeviceError { error_code, .. } => error_code.clone(),
            Self::Timeout { .. } => DeviceErrorCode::CommunicationError,
            Self::DeviceNotFound { .. } => DeviceErrorCode::ConfigurationError,
        }
    }
    
    pub fn is_retryable(&self) -> bool {
        matches!(self,
            Self::DeviceBusy { .. } |
            Self::Timeout { .. }
        )
    }
    
    pub fn device_id(&self) -> Option<&str> {
        match self {
            Self::DeviceBusy { device_id, .. } |
            Self::DeviceError { device_id, .. } |
            Self::Timeout { device_id, .. } |
            Self::DeviceNotFound { device_id } => Some(device_id),
            _ => None,
        }
    }
} 
