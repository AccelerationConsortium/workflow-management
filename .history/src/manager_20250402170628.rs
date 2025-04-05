use std::collections::HashMap;
use tokio::sync::RwLock;
use serde_json::Value;

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
            return Err(DeviceError::DeviceAlreadyExists {
                device_id: device_id.to_string(),
                message: "Device with this ID already exists".to_string(),
            });
        }

        let device = create_device(device_type, device_id)?;
        device.initialize(config).await?;
        devices.insert(device_id.to_string(), device);
        Ok(())
    }

    pub async fn execute_operation(&self, device_id: &str, operation: &str, params: Option<Value>) -> Result<Value, DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id).ok_or_else(|| DeviceError::DeviceNotFound {
            device_id: device_id.to_string(),
            message: "Device not found".to_string(),
        })?;

        let result = device.execute(operation, params).await?;

        // Publish event
        let event = DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: chrono::Utc::now(),
            event_type: "operation_executed".to_string(),
            data: result.clone(),
        };
        self.event_bus.publish(event).await;

        Ok(result)
    }

    pub async fn get_device_status(&self, device_id: &str) -> Result<DeviceState, DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id).ok_or_else(|| DeviceError::DeviceNotFound {
            device_id: device_id.to_string(),
            message: "Device not found".to_string(),
        })?;

        device.get_status().await
    }

    pub async fn reset_device(&self, device_id: &str) -> Result<(), DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id).ok_or_else(|| DeviceError::DeviceNotFound {
            device_id: device_id.to_string(),
            message: "Device not found".to_string(),
        })?;

        device.reset().await?;

        // Publish event
        let event = DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: chrono::Utc::now(),
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

