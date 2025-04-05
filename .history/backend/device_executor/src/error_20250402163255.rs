use thiserror::Error;
use serde::{Serialize, Deserialize};

#[derive(Debug, Error, Clone, Serialize, Deserialize)]
pub enum DeviceError {
    #[error("设备 {device_id} 未初始化")]
    NotInitialized {
        device_id: String,
        #[serde(skip)]
        backtrace: Option<String>,
    },

    #[error("设备 {device_id} 忙")]
    DeviceBusy {
        device_id: String,
        operation: String,
        since: chrono::DateTime<chrono::Utc>,
    },

    #[error("无效参数: {reason}")]
    InvalidParameter {
        reason: String,
        parameter: String,
        valid_range: Option<String>,
    },

    #[error("设备 {device_id} 错误: {message}")]
    DeviceError {
        device_id: String,
        message: String,
        error_code: DeviceErrorCode,
        #[serde(skip)]
        source: Option<Box<dyn std::error::Error + Send + Sync>>,
    },

    #[error("设备 {device_id} 超时")]
    Timeout {
        device_id: String,
        operation: String,
        timeout_ms: u64,
    },

    #[error("设备 {device_id} 未找到")]
    DeviceNotFound {
        device_id: String,
    },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DeviceErrorCode {
    /// 硬件错误
    HardwareError,
    /// 通信错误
    CommunicationError,
    /// 配置错误
    ConfigurationError,
    /// 状态错误
    StateError,
    /// 系统错误
    SystemError,
    /// 未知错误
    Unknown,
}

impl DeviceError {
    pub fn error_code(&self) -> DeviceErrorCode {
        match self {
            DeviceError::NotInitialized { .. } => DeviceErrorCode::StateError,
            DeviceError::DeviceBusy { .. } => DeviceErrorCode::StateError,
            DeviceError::InvalidParameter { .. } => DeviceErrorCode::ConfigurationError,
            DeviceError::DeviceError { error_code, .. } => *error_code,
            DeviceError::Timeout { .. } => DeviceErrorCode::CommunicationError,
            DeviceError::DeviceNotFound { .. } => DeviceErrorCode::SystemError,
        }
    }

    pub fn is_retryable(&self) -> bool {
        matches!(
            self,
            DeviceError::DeviceBusy { .. } | DeviceError::Timeout { .. }
        )
    }

    pub fn device_id(&self) -> Option<&str> {
        match self {
            DeviceError::NotInitialized { device_id, .. } => Some(device_id),
            DeviceError::DeviceBusy { device_id, .. } => Some(device_id),
            DeviceError::DeviceError { device_id, .. } => Some(device_id),
            DeviceError::Timeout { device_id, .. } => Some(device_id),
            DeviceError::DeviceNotFound { device_id } => Some(device_id),
            _ => None,
        }
    }
} 
