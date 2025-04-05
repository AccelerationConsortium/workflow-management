use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde_json::Value;
use chrono::Utc;

use crate::{DeviceExecutor, DeviceError, SDLDeviceExecutor};
use crate::events::{EventBus, DeviceEvent};

pub struct DeviceManager {
    devices: Arc<RwLock<HashMap<String, Arc<RwLock<SDLDeviceExecutor>>>>>,
    event_bus: Arc<EventBus>,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            devices: Arc::new(RwLock::new(HashMap::new())),
            event_bus: Arc::new(EventBus::new()),
        }
    }

    pub async fn create_device(&self, device_id: String) -> Result<(), DeviceError> {
        let mut devices = self.devices.write().await;
        if devices.contains_key(&device_id) {
            return Err(DeviceError::DeviceError {
                device_id,
                message: "设备已存在".to_string(),
                error_code: crate::DeviceErrorCode::InvalidParameter,
            });
        }

        let device = SDLDeviceExecutor::new(device_id.clone());
        devices.insert(device_id.clone(), Arc::new(RwLock::new(device)));

        self.event_bus.publish(DeviceEvent {
            device_id,
            timestamp: Utc::now(),
            event_type: "DeviceCreated".to_string(),
            data: Value::Null,
        }).await;

        Ok(())
    }

    pub async fn execute_operation(&self, device_id: &str, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id)
            .ok_or_else(|| DeviceError::DeviceNotFound {
                device_id: device_id.to_string(),
            })?;

        self.event_bus.publish(DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: Utc::now(),
            event_type: "OperationStarted".to_string(),
            data: Value::Null,
        }).await;

        let mut device = device.write().await;
        let result = device.execute(operation, params).await;

        match &result {
            Ok(value) => {
                self.event_bus.publish(DeviceEvent {
                    device_id: device_id.to_string(),
                    timestamp: Utc::now(),
                    event_type: "OperationCompleted".to_string(),
                    data: value.clone(),
                }).await;
            }
            Err(err) => {
                self.event_bus.publish(DeviceEvent {
                    device_id: device_id.to_string(),
                    timestamp: Utc::now(),
                    event_type: "ErrorOccurred".to_string(),
                    data: serde_json::json!({
                        "error": err.to_string(),
                    }),
                }).await;
            }
        }

        result
    }

    pub async fn get_device_status(&self, device_id: &str) -> Result<Value, DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id)
            .ok_or_else(|| DeviceError::DeviceNotFound {
                device_id: device_id.to_string(),
            })?;

        let device = device.read().await;
        let status = device.get_status();

        self.event_bus.publish(DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: Utc::now(),
            event_type: "StatusQueried".to_string(),
            data: serde_json::to_value(&status).unwrap_or(Value::Null),
        }).await;

        Ok(serde_json::to_value(&status)?)
    }
} 

