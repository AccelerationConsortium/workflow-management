use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde_json::Value;
use crate::{DeviceExecutor, DeviceError, DeviceConfig};
use crate::events::{EventPublisher, EventSubscriber, DeviceEvent};

pub struct DeviceManager {
    devices: Arc<RwLock<HashMap<String, Box<dyn DeviceExecutor + Send + Sync>>>>,
    event_publisher: EventPublisher,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            devices: Arc::new(RwLock::new(HashMap::new())),
            event_publisher: EventPublisher::new(100),
        }
    }

    pub async fn create_device(&self, device_id: String, config: DeviceConfig) -> Result<(), DeviceError> {
        let mut devices = self.devices.write().await;
        if devices.contains_key(&device_id) {
            return Err(DeviceError::DeviceError {
                device_id,
                message: "设备已存在".to_string(),
                error_code: crate::error::DeviceErrorCode::ConfigurationError,
                source: None,
            });
        }

        // TODO: 根据配置创建具体的设备实例
        devices.insert(device_id.clone(), Box::new(crate::SDLDeviceExecutor::new_with_config(config)));
        
        self.event_publisher.publish(DeviceEvent {
            device_id,
            status: crate::DeviceStatus::Idle,
            timestamp: chrono::Utc::now(),
            event_type: "device_created".to_string(),
            data: None,
        });

        Ok(())
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

        self.event_publisher.publish(DeviceEvent {
            device_id: device_id.to_string(),
            status: crate::DeviceStatus::Busy,
            timestamp: chrono::Utc::now(),
            event_type: "operation_started".to_string(),
            data: Some(serde_json::to_value(&params).unwrap_or_default()),
        });

        let result = device.execute(operation, params).await;

        self.event_publisher.publish(DeviceEvent {
            device_id: device_id.to_string(),
            status: device.get_status().status,
            timestamp: chrono::Utc::now(),
            event_type: "operation_completed".to_string(),
            data: result.as_ref().ok().cloned(),
        });

        result
    }

    pub async fn get_device(&self, device_id: &str) -> Result<Box<dyn DeviceExecutor + Send + Sync>, DeviceError> {
        let devices = self.devices.read().await;
        devices.get(device_id)
            .cloned()
            .ok_or_else(|| DeviceError::DeviceNotFound {
                device_id: device_id.to_string(),
            })
    }

    pub fn subscribe_events(&self) -> EventSubscriber {
        self.event_publisher.subscribe()
    }

    pub async fn remove_device(&self, device_id: &str) -> Result<(), DeviceError> {
        let mut devices = self.devices.write().await;
        devices.remove(device_id)
            .ok_or_else(|| DeviceError::DeviceNotFound {
                device_id: device_id.to_string(),
            })?;

        self.event_publisher.publish(DeviceEvent {
            device_id: device_id.to_string(),
            status: crate::DeviceStatus::Idle,
            timestamp: chrono::Utc::now(),
            event_type: "device_removed".to_string(),
            data: None,
        });

        Ok(())
    }
} 

