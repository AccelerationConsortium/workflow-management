#[derive(Debug, Error, Clone, Serialize, Deserialize)]
pub enum DeviceError {
    #[error("设备 {device_id} 未初始化")]
    NotInitialized {
        device_id: String,
    },

    #[error("设备 {device_id} 正在执行操作 {operation}")]
    DeviceBusy {
        device_id: String,
        operation: String,
        since: DateTime<Utc>,
    },

    #[error("无效的参数: {reason}")]
    InvalidParameter {
        reason: String,
        parameter: String,
        valid_range: Option<String>,
    },

    #[error("设备错误: {message}")]
    DeviceError {
        device_id: String,
        message: String,
        error_code: DeviceErrorCode,
        source: Option<Box<dyn StdError + Send + Sync + 'static>>,
    },

    #[error("操作超时")]
    Timeout {
        device_id: String,
        operation: String,
        timeout: Duration,
    },

    #[error("设备 {device_id} 未找到")]
    DeviceNotFound {
        device_id: String,
    },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum DeviceErrorCode {
    HardwareError,
    CommunicationError,
    ConfigurationError,
    StateError,
    SystemError,
    Unknown,
}

impl DeviceError {
    pub fn error_code(&self) -> DeviceErrorCode {
        match self {
            Self::NotInitialized { .. } => DeviceErrorCode::StateError,
            Self::DeviceBusy { .. } => DeviceErrorCode::StateError,
            Self::InvalidParameter { .. } => DeviceErrorCode::ConfigurationError,
            Self::DeviceError { error_code, .. } => *error_code,
            Self::Timeout { .. } => DeviceErrorCode::CommunicationError,
            Self::DeviceNotFound { .. } => DeviceErrorCode::SystemError,
        }
    }

    pub fn is_retryable(&self) -> bool {
        matches!(
            self,
            Self::DeviceBusy { .. } | Self::Timeout { .. } | Self::DeviceError { .. }
        )
    }

    pub fn device_id(&self) -> Option<&str> {
        match self {
            Self::NotInitialized { device_id }
            | Self::DeviceBusy { device_id, .. }
            | Self::DeviceError { device_id, .. }
            | Self::Timeout { device_id, .. }
            | Self::DeviceNotFound { device_id } => Some(device_id),
            Self::InvalidParameter { .. } => None,
        }
    }
} 
