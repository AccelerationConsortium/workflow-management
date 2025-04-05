use std::collections::HashMap;
use tokio::sync::{RwLock, broadcast};
use serde_json::Value;
use chrono::Utc;

use crate::{
    DeviceExecutor,
    DeviceError,
    DeviceState,
    devices::create_device,
    events::{EventBus, DeviceEvent},
};

pub struct DeviceManager {
    devices: RwLock<HashMap<String, Box<dyn DeviceExecutor>>>,
    event_bus: EventBus,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            devices: RwLock::new(HashMap::new()),
            event_bus: EventBus::new(),
        }
    }

    pub async fn create_device(&self, device_type: &str, device_id: &str, config: Option<Value>) -> Result<(), DeviceError> {
        let mut devices = self.devices.write().await;
        if devices.contains_key(device_id) {
            return Err(DeviceError::new(
                device_id,
                "Device with this ID already exists",
                crate::DeviceErrorCode::InvalidParameter,
            ));
        }

        let device = create_device(device_type, device_id)?;
        device.initialize(config).await?;
        devices.insert(device_id.to_string(), device);

        let event = DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: Utc::now(),
            event_type: "device_created".to_string(),
            data: Value::Null,
        };
        self.event_bus.publish(event).await;

        Ok(())
    }

    pub async fn execute_operation(&self, device_id: &str, operation: &str, params: Option<Value>) -> Result<Value, DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id).ok_or_else(|| DeviceError::new(
            device_id,
            "Device not found",
            crate::DeviceErrorCode::InvalidParameter,
        ))?;

        let event = DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: Utc::now(),
            event_type: "operation_started".to_string(),
            data: Value::Null,
        };
        self.event_bus.publish(event).await;

        let result = device.execute(operation, params).await;

        match &result {
            Ok(value) => {
                let event = DeviceEvent {
                    device_id: device_id.to_string(),
                    timestamp: Utc::now(),
                    event_type: "operation_completed".to_string(),
                    data: value.clone(),
                };
                self.event_bus.publish(event).await;
            }
            Err(err) => {
                let event = DeviceEvent {
                    device_id: device_id.to_string(),
                    timestamp: Utc::now(),
                    event_type: "operation_failed".to_string(),
                    data: serde_json::json!({
                        "error": err.to_string(),
                    }),
                };
                self.event_bus.publish(event).await;
            }
        }

        result
    }

    pub async fn get_device_status(&self, device_id: &str) -> Result<DeviceState, DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id).ok_or_else(|| DeviceError::new(
            device_id,
            "Device not found",
            crate::DeviceErrorCode::InvalidParameter,
        ))?;

        let status = device.get_status().await?;

        let event = DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: Utc::now(),
            event_type: "status_queried".to_string(),
            data: serde_json::to_value(&status)?,
        };
        self.event_bus.publish(event).await;

        Ok(status)
    }

    pub async fn reset_device(&self, device_id: &str) -> Result<(), DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id).ok_or_else(|| DeviceError::new(
            device_id,
            "Device not found",
            crate::DeviceErrorCode::InvalidParameter,
        ))?;

        device.reset().await?;

        let event = DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: Utc::now(),
            event_type: "device_reset".to_string(),
            data: Value::Null,
        };
        self.event_bus.publish(event).await;

        Ok(())
    }

    pub fn subscribe_to_events(&self) -> broadcast::Receiver<DeviceEvent> {
        self.event_bus.subscribe()
    }
} 

