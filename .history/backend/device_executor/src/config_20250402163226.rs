use serde::{Deserialize, Serialize};
use std::ops::Range;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceConfig {
    /// 操作延迟（毫秒）
    #[serde(default = "default_latency")]
    pub latency_ms: u64,
    
    /// 操作失败率 (0.0-1.0)
    #[serde(default = "default_fail_rate")]
    pub fail_rate: f64,
    
    /// 位置范围
    #[serde(default = "default_position_range")]
    pub position_range: Range<f64>,
    
    /// 测量值范围
    #[serde(default = "default_measurement_range")]
    pub measurement_range: Range<f64>,
    
    /// 是否启用随机波动
    #[serde(default = "default_enable_noise")]
    pub enable_noise: bool,
    
    /// 随机波动范围（百分比）
    #[serde(default = "default_noise_range")]
    pub noise_range: f64,
}

impl Default for DeviceConfig {
    fn default() -> Self {
        Self {
            latency_ms: default_latency(),
            fail_rate: default_fail_rate(),
            position_range: default_position_range(),
            measurement_range: default_measurement_range(),
            enable_noise: default_enable_noise(),
            noise_range: default_noise_range(),
        }
    }
}

fn default_latency() -> u64 { 1000 }
fn default_fail_rate() -> f64 { 0.1 }
fn default_position_range() -> Range<f64> { 0.0..100.0 }
fn default_measurement_range() -> Range<f64> { -1000.0..1000.0 }
fn default_enable_noise() -> bool { true }
fn default_noise_range() -> f64 { 0.05 } // 5% 波动

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
