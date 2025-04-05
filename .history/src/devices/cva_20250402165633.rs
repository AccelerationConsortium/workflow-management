use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use async_trait::async_trait;
use rand::Rng;

use crate::{DeviceExecutor, DeviceError, DeviceState, DeviceStatus};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVAConfig {
    pub voltage_range: (f64, f64),
    pub scan_rate_range: (f64, f64),
    pub max_cycles: u32,
    pub sample_interval: f64,
}

impl Default for CVAConfig {
    fn default() -> Self {
        Self {
            voltage_range: (-2.0, 2.0),
            scan_rate_range: (0.01, 1.0),
            max_cycles: 10,
            sample_interval: 0.01,
        }
    }
}

pub struct CVADevice {
    config: CVAConfig,
    state: tokio::sync::RwLock<DeviceState>,
    device_id: String,
}

impl CVADevice {
    pub fn new(device_id: String, config: CVAConfig) -> Self {
        Self {
            config,
            state: tokio::sync::RwLock::new(DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            }),
            device_id,
        }
    }

    async fn generate_cv_data(&self, start_v: f64, end_v: f64, scan_rate: f64, cycles: u32) -> Vec<(f64, f64)> {
        let mut data = Vec::new();
        let mut rng = rand::thread_rng();

        for cycle in 0..cycles {
            let points = ((end_v - start_v).abs() / self.config.sample_interval) as usize;
            
            // 正向扫描
            for i in 0..points {
                let voltage = start_v + (i as f64 * self.config.sample_interval);
                let current = self.simulate_current(voltage) + rng.gen_range(-0.1..0.1);
                data.push((voltage, current));
            }

            // 反向扫描
            for i in 0..points {
                let voltage = end_v - (i as f64 * self.config.sample_interval);
                let current = self.simulate_current(voltage) + rng.gen_range(-0.1..0.1);
                data.push((voltage, current));
            }
        }

        data
    }

    fn simulate_current(&self, voltage: f64) -> f64 {
        // 使用简单的电化学模型模拟电流响应
        let base_current = voltage * 0.1; // 基础线性响应
        let peak1 = 0.5 * (-((voltage - 0.5) * 10.0).powi(2)).exp(); // 氧化峰
        let peak2 = -0.3 * (-((voltage + 0.5) * 10.0).powi(2)).exp(); // 还原峰
        base_current + peak1 + peak2
    }
}

#[async_trait]
impl DeviceExecutor for CVADevice {
    async fn initialize(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }

    async fn execute(&self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError> {
        match operation {
            "measure_cv" => {
                let start_v = params.get("start_voltage")
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::InvalidParameter {
                        reason: "起始电压必须是数字".to_string(),
                        parameter: "start_voltage".to_string(),
                        valid_range: Some(format!("{:?}", self.config.voltage_range)),
                    })?;

                let end_v = params.get("end_voltage")
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::InvalidParameter {
                        reason: "结束电压必须是数字".to_string(),
                        parameter: "end_voltage".to_string(),
                        valid_range: Some(format!("{:?}", self.config.voltage_range)),
                    })?;

                let scan_rate = params.get("scan_rate")
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::InvalidParameter {
                        reason: "扫描速率必须是数字".to_string(),
                        parameter: "scan_rate".to_string(),
                        valid_range: Some(format!("{:?}", self.config.scan_rate_range)),
                    })?;

                let cycles = params.get("cycles")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(1) as u32;

                if cycles > self.config.max_cycles {
                    return Err(DeviceError::InvalidParameter {
                        reason: format!("循环次数不能超过 {}", self.config.max_cycles),
                        parameter: "cycles".to_string(),
                        valid_range: Some(format!("1..{}", self.config.max_cycles)),
                    });
                }

                let mut state = self.state.write().await;
                state.status = DeviceStatus::Busy;
                drop(state);

                let data = self.generate_cv_data(start_v, end_v, scan_rate, cycles).await;
                
                let mut state = self.state.write().await;
                state.status = DeviceStatus::Idle;
                
                Ok(serde_json::to_value(data)?)
            }
            _ => Err(DeviceError::InvalidParameter {
                reason: format!("未知操作: {}", operation),
                parameter: "operation".to_string(),
                valid_range: None,
            }),
        }
    }

    fn get_status(&self) -> DeviceState {
        self.state.try_read()
            .map(|state| state.clone())
            .unwrap_or_else(|_| DeviceState {
                status: DeviceStatus::Error,
                parameters: HashMap::new(),
            })
    }

    async fn reset(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }
} 
