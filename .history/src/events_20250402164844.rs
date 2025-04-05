use serde::{Deserialize, Serialize};
use serde_json::Value;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceEvent {
    DeviceCreated {
        device_id: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
    },
    DeviceRemoved {
        device_id: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
    },
    OperationStarted {
        device_id: String,
        operation: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
    },
    OperationCompleted {
        device_id: String,
        operation: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
        data: Value,
    },
    OperationFailed {
        device_id: String,
        operation: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
        error: String,
    },
} 
