use serde::{Deserialize, Serialize};
use crate::error::DeviceError;
use std::ops::Range;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceConfig {
    pub position_range: Range<f64>,
    pub latency_ms: u64,
    pub failure_rate: f64,
    pub noise_amplitude: f64,
}

impl Default for DeviceConfig {
    fn default() -> Self {
        Self {
            position_range: -10.0..10.0,
            latency_ms: 100,
            failure_rate: 0.01,
            noise_amplitude: 0.1,
        }
    }
}

impl DeviceConfig {
    pub fn validate(&self) -> Result<(), DeviceError> {
        if self.failure_rate < 0.0 || self.failure_rate > 1.0 {
            return Err(DeviceError::InvalidParameter {
                reason: "失败率必须在 0.0 到 1.0 之间".to_string(),
                parameter: "failure_rate".to_string(),
                valid_range: Some("0.0..1.0".to_string()),
            });
        }

        if self.position_range.start >= self.position_range.end {
            return Err(DeviceError::InvalidParameter {
                reason: "位置范围的起始值必须小于结束值".to_string(),
                parameter: "position_range".to_string(),
                valid_range: None,
            });
        }

        if self.noise_amplitude < 0.0 || self.noise_amplitude > 1.0 {
            return Err(DeviceError::InvalidParameter {
                reason: "噪声范围必须在 0.0 到 1.0 之间".to_string(),
                parameter: "noise_amplitude".to_string(),
                valid_range: Some("0.0..1.0".to_string()),
            });
        }

        Ok(())
    }
} 
