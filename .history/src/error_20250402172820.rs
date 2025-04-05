use std::error::Error as StdError;
use std::fmt;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
pub enum DeviceErrorCode {
    InvalidParameter,
    StateError,
    HardwareError,
    NotFound,
    AlreadyExists,
    Busy,
    InternalError,
}

#[derive(Debug)]
pub struct DeviceError {
    pub device_id: String,
    pub error_code: DeviceErrorCode,
    pub message: String,
    pub source: Option<Box<dyn std::error::Error + Send + Sync>>,
}

impl DeviceError {
    pub fn new(device_id: &str, message: &str, error_code: DeviceErrorCode) -> Self {
        Self {
            device_id: device_id.to_string(),
            message: message.to_string(),
            error_code,
            source: None,
        }
    }

    pub fn with_source<E>(mut self, source: E) -> Self
    where
        E: StdError + Send + Sync + 'static,
    {
        self.source = Some(Box::new(source));
        self
    }
}

impl fmt::Display for DeviceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}: {}", self.error_code, self.message)
    }
}

impl StdError for DeviceError {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        self.source.as_ref().map(|s| s.as_ref() as &(dyn StdError + 'static))
    }
} 
