use serde::{Deserialize, Serialize};
use crate::error::DeviceError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceConfig {
    pub latency_ms: u64,
    pub fail_rate: f64,
    pub position_range: (f64, f64),
    pub measurement_range: (f64, f64),
    pub noise_range: f64,
    pub enable_noise: bool,
}

impl Default for DeviceConfig {
    fn default() -> Self {
        Self {
            latency_ms: 100,
            fail_rate: 0.01,
            position_range: (-100.0, 100.0),
            measurement_range: (-10.0, 10.0),
            noise_range: 0.1,
            enable_noise: true,
        }
    }
}

impl DeviceConfig {
    pub fn validate(&self) -> Result<(), DeviceError> {
        if self.fail_rate < 0.0 || self.fail_rate > 1.0 {
            return Err(DeviceError::InvalidParameter {
                reason: "失败率必须在 0.0 到 1.0 之间".to_string(),
                parameter: "fail_rate".to_string(),
                valid_range: Some("0.0..1.0".to_string()),
            });
        }

        if self.position_range.0 >= self.position_range.1 {
            return Err(DeviceError::InvalidParameter {
                reason: "位置范围的起始值必须小于结束值".to_string(),
                parameter: "position_range".to_string(),
                valid_range: None,
            });
        }

        if self.measurement_range.0 >= self.measurement_range.1 {
            return Err(DeviceError::InvalidParameter {
                reason: "测量范围的起始值必须小于结束值".to_string(),
                parameter: "measurement_range".to_string(),
                valid_range: None,
            });
        }

        if self.noise_range < 0.0 || self.noise_range > 1.0 {
            return Err(DeviceError::InvalidParameter {
                reason: "噪声范围必须在 0.0 到 1.0 之间".to_string(),
                parameter: "noise_range".to_string(),
                valid_range: Some("0.0..1.0".to_string()),
            });
        }

        Ok(())
    }
} 
