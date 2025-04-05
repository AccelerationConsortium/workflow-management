use serde::{Deserialize, Serialize};
use std::ops::Range;
use crate::devices::cva::CVAConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum DeviceConfig {
    #[serde(rename = "cva")]
    CVA(CVAConfig),
}

impl Default for DeviceConfig {
    fn default() -> Self {
        Self::CVA(CVAConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_serialization() {
        let config = DeviceConfig::CVA(CVAConfig::default());
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: DeviceConfig = serde_json::from_str(&json).unwrap();
        
        match deserialized {
            DeviceConfig::CVA(cfg) => {
                assert_eq!(cfg.scan_rates.len(), 5);
                assert!(cfg.is_cva);
            }
        }
    }
}

impl DeviceConfig {
    pub fn validate(&self) -> Result<(), String> {
        if self.fail_rate < 0.0 || self.fail_rate > 1.0 {
            return Err("失败率必须在 0.0-1.0 之间".to_string());
        }
        if self.position_range.start >= self.position_range.end {
            return Err("位置范围无效".to_string());
        }
        if self.measurement_range.start >= self.measurement_range.end {
            return Err("测量范围无效".to_string());
        }
        if self.noise_range < 0.0 || self.noise_range > 1.0 {
            return Err("噪声范围必须在 0.0-1.0 之间".to_string());
        }
        Ok(())
    }
} 
