pub use error::{DeviceError, DeviceErrorCode}; 

pub struct SDLDeviceExecutor {
    pub state: RwLock<DeviceState>,
    pub device_id: String,
    pub config: DeviceConfig,
}

impl SDLDeviceExecutor {
    pub fn new_with_config(config: DeviceConfig) -> Self {
        Self {
            state: RwLock::new(DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            }),
            device_id: uuid::Uuid::new_v4().to_string(),
            config,
        }
    }
} 
