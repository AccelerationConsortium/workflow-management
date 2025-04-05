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
        match self {
            DeviceConfig::CVA(config) => {
                if config.scan_rates.is_empty() {
                    return Err("扫描速率列表不能为空".to_string());
                }
                if config.start_voltage >= config.end_voltage {
                    return Err("起始电压必须小于结束电压".to_string());
                }
                if config.sample_interval == 0 {
                    return Err("采样间隔不能为0".to_string());
                }
                Ok(())
            }
        }
    }
} 
