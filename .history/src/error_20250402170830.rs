use std::error::Error as StdError;
use std::fmt;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceErrorCode {
    InvalidParameter,
    StateError,
    HardwareError,
    SystemError,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceError {
    pub device_id: String,
    pub message: String,
    pub error_code: DeviceErrorCode,
    #[serde(skip)]
    pub source: Option<Box<dyn StdError + Send + Sync>>,
}

impl fmt::Display for DeviceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} (Device: {})", self.message, self.device_id)
    }
}

impl StdError for DeviceError {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        self.source.as_ref().map(|e| &**e as &(dyn StdError + 'static))
    }
}

impl DeviceError {
    pub fn new(device_id: impl Into<String>, message: impl Into<String>, error_code: DeviceErrorCode) -> Self {
        Self {
            device_id: device_id.into(),
            message: message.into(),
            error_code,
            source: None,
        }
    }

    pub fn with_source(mut self, source: impl StdError + Send + Sync + 'static) -> Self {
        self.source = Some(Box::new(source));
        self
    }
} 
