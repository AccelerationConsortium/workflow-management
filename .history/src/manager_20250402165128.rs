use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use serde_json::Value;

use crate::{
    DeviceExecutor,
    SDLDeviceExecutor,
    DeviceConfig,
    DeviceError,
    events::DeviceEvent,
};

pub struct DeviceManager {
    devices: Arc<RwLock<HashMap<String, SDLDeviceExecutor>>>,
    event_bus: broadcast::Sender<DeviceEvent>,
}

impl DeviceManager {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        Self {
            devices: Arc::new(RwLock::new(HashMap::new())),
            event_bus: tx,
        }
    }

    pub async fn create_device(&self, config: DeviceConfig) -> Result<String, DeviceError> {
        let mut devices = self.devices.write().await;
        let device = SDLDeviceExecutor::new_with_config(config);
        let device_id = device.device_id.clone();
        devices.insert(device_id.clone(), device);

        self.event_bus.send(DeviceEvent::DeviceCreated {
            device_id: device_id.clone(),
            timestamp: chrono::Utc::now(),
        }).ok();

        Ok(device_id)
    }

    pub async fn get_device(&self, device_id: &str) -> Option<SDLDeviceExecutor> {
        let devices = self.devices.read().await;
        devices.get(device_id).cloned()
    }

    pub async fn execute_operation(
        &self,
        device_id: &str,
        operation: &str,
        params: HashMap<String, Value>,
    ) -> Result<Value, DeviceError> {
        let devices = self.devices.read().await;
        let device = devices.get(device_id).ok_or_else(|| DeviceError::DeviceNotFound {
            device_id: device_id.to_string(),
        })?;

        self.event_bus.send(DeviceEvent::OperationStarted {
            device_id: device_id.to_string(),
            operation: operation.to_string(),
            timestamp: chrono::Utc::now(),
        }).ok();

        let result = device.execute(operation, params).await;

        match &result {
            Ok(value) => {
                self.event_bus.send(DeviceEvent::OperationCompleted {
                    device_id: device_id.to_string(),
                    operation: operation.to_string(),
                    timestamp: chrono::Utc::now(),
                    data: value.clone(),
                }).ok();
            }
            Err(err) => {
                self.event_bus.send(DeviceEvent::OperationFailed {
                    device_id: device_id.to_string(),
                    operation: operation.to_string(),
                    timestamp: chrono::Utc::now(),
                    error: err.to_string(),
                }).ok();
            }
        }

        result
    }

    pub fn subscribe_events(&self) -> broadcast::Receiver<DeviceEvent> {
        self.event_bus.subscribe()
    }

    pub async fn remove_device(&self, device_id: &str) -> Result<(), DeviceError> {
        let mut devices = self.devices.write().await;
        devices.remove(device_id).ok_or_else(|| DeviceError::DeviceNotFound {
            device_id: device_id.to_string(),
        })?;

        self.event_bus.send(DeviceEvent::DeviceRemoved {
            device_id: device_id.to_string(),
            timestamp: chrono::Utc::now(),
        }).ok();

        Ok(())
    }
} 
