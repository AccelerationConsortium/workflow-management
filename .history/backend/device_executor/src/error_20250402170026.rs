use std::error::Error as StdError;
use thiserror::Error;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum DeviceErrorCode {
    HardwareError,
    CommunicationError,
    ConfigurationError,
    StateError,
    SystemError,
}

#[derive(Debug, Error, Serialize, Deserialize)]
pub struct DeviceError {
    pub device_id: String,
    pub message: String,
    pub error_code: DeviceErrorCode,
    #[serde(skip)]
    pub source: Option<Box<dyn StdError + Send + Sync + 'static>>,
}

impl Clone for DeviceError {
    fn clone(&self) -> Self {
        Self {
            device_id: self.device_id.clone(),
            message: self.message.clone(),
            error_code: self.error_code,
            source: None,
        }
    }
}

impl DeviceError {
    pub fn new(device_id: String, message: String, error_code: DeviceErrorCode) -> Self {
        Self {
            device_id,
            message,
            error_code,
            source: None,
        }
    }

    pub fn with_source(mut self, source: Box<dyn StdError + Send + Sync + 'static>) -> Self {
        self.source = Some(source);
        self
    }

    pub fn is_retryable(&self) -> bool {
        matches!(self.error_code, 
            DeviceErrorCode::CommunicationError | 
            DeviceErrorCode::HardwareError
        )
    }
} 
