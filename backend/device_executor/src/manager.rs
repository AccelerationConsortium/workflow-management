use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::config::DeviceConfig;
use crate::error::DeviceError;
use crate::events::{EventBus, DeviceEvent, DeviceEventType};
use crate::SDLDeviceExecutor;

pub struct DeviceManager {
    devices: RwLock<HashMap<String, Arc<RwLock<SDLDeviceExecutor>>>>,
    event_bus: Arc<EventBus>,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            devices: RwLock::new(HashMap::new()),
            event_bus: Arc::new(EventBus::default()),
        }
    }

    pub async fn create_device(&self, device_id: String, config: DeviceConfig) -> Result<(), DeviceError> {
        let mut devices = self.devices.write().await;
        
        if devices.contains_key(&device_id) {
            return Err(DeviceError::DeviceError {
                device_id: device_id.clone(),
                message: "设备已存在".to_string(),
                error_code: crate::error::DeviceErrorCode::ConfigurationError,
                source: None,
            });
        }

        // 验证配置
        if let Err(err) = config.validate() {
            return Err(DeviceError::InvalidParameter {
                reason: err,
                parameter: "config".to_string(),
                valid_range: None,
            });
        }

        let device = SDLDeviceExecutor::new_with_config(config);
        devices.insert(device_id.clone(), Arc::new(RwLock::new(device)));

        // 发布设备创建事件
        self.event_bus.publish(DeviceEvent {
            device_id,
            timestamp: std::time::SystemTime::now(),
            event_type: DeviceEventType::StatusChanged,
            data: serde_json::json!({ "status": "created" }),
        });

        Ok(())
    }

    pub async fn get_device(&self, device_id: &str) -> Result<Arc<RwLock<SDLDeviceExecutor>>, DeviceError> {
        let devices = self.devices.read().await;
        devices.get(device_id)
            .cloned()
            .ok_or_else(|| DeviceError::DeviceNotFound {
                device_id: device_id.to_string(),
            })
    }

    pub async fn execute_operation(
        &self,
        device_id: &str,
        operation: &str,
        params: HashMap<String, serde_json::Value>,
    ) -> Result<serde_json::Value, DeviceError> {
        let device = self.get_device(device_id).await?;
        let mut device = device.write().await;

        // 发布操作开始事件
        self.event_bus.publish(DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: std::time::SystemTime::now(),
            event_type: DeviceEventType::OperationStarted,
            data: serde_json::json!({
                "operation": operation,
                "params": params
            }),
        });

        let result = device.execute(operation, params).await;

        // 发布操作结果事件
        match &result {
            Ok(value) => {
                self.event_bus.publish(DeviceEvent {
                    device_id: device_id.to_string(),
                    timestamp: std::time::SystemTime::now(),
                    event_type: DeviceEventType::OperationCompleted,
                    data: value.clone(),
                });
            }
            Err(err) => {
                self.event_bus.publish(DeviceEvent {
                    device_id: device_id.to_string(),
                    timestamp: std::time::SystemTime::now(),
                    event_type: DeviceEventType::ErrorOccurred,
                    data: serde_json::json!({
                        "error": err.to_string(),
                        "code": err.error_code().to_string(),
                    }),
                });
            }
        }

        result
    }

    pub fn subscribe_events(&self) -> tokio::sync::broadcast::Receiver<DeviceEvent> {
        self.event_bus.subscribe()
    }

    pub async fn remove_device(&self, device_id: &str) -> Result<(), DeviceError> {
        let mut devices = self.devices.write().await;
        devices.remove(device_id)
            .ok_or_else(|| DeviceError::DeviceNotFound {
                device_id: device_id.to_string(),
            })?;

        // 发布设备移除事件
        self.event_bus.publish(DeviceEvent {
            device_id: device_id.to_string(),
            timestamp: std::time::SystemTime::now(),
            event_type: DeviceEventType::StatusChanged,
            data: serde_json::json!({ "status": "removed" }),
        });

        Ok(())
    }
} 
