use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use async_trait::async_trait;
use rand::{Rng, thread_rng};
use tokio::sync::RwLock;

use crate::{DeviceExecutor, DeviceError, DeviceState, DeviceStatus, DeviceErrorCode};

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
    device_id: String,
    state: RwLock<DeviceState>,
}

impl CVADevice {
    pub fn new(device_id: &str) -> Self {
        Self {
            device_id: device_id.to_string(),
            state: RwLock::new(DeviceState::default()),
        }
    }

    async fn generate_cv_data(&self, _scan_rate: f64, cycles: u32) -> Vec<(f64, f64)> {
        let mut data = Vec::new();
        let mut rng = thread_rng();

        for _ in 0..cycles {
            for voltage in (-500..=500).step_by(10) {
                let voltage = voltage as f64 / 1000.0;
                let mut current = self.simulate_current(voltage);
                current += rng.gen_range(-0.1..0.1);
                data.push((voltage, current));
            }
            for voltage in ((-500..=500).step_by(10)).rev() {
                let voltage = voltage as f64 / 1000.0;
                let mut current = self.simulate_current(voltage);
                current += rng.gen_range(-0.1..0.1);
                data.push((voltage, current));
            }
        }

        data
    }

    fn simulate_current(&self, voltage: f64) -> f64 {
        let mut current = 0.0;

        // 模拟氧化峰
        let ox_peak = 0.2;
        let ox_width = 0.1;
        current += 5.0 * (-((voltage - ox_peak).powi(2)) / (2.0 * ox_width.powi(2))).exp();

        // 模拟还原峰
        let red_peak = -0.2;
        let red_width = 0.1;
        current -= 5.0 * (-((voltage - red_peak).powi(2)) / (2.0 * red_width.powi(2))).exp();

        // 添加基线电流
        current += 2.0 * voltage;

        current
    }
}

impl From<serde_json::Error> for DeviceError {
    fn from(err: serde_json::Error) -> Self {
        DeviceError::DeviceError {
            device_id: String::new(),
            message: format!("JSON 序列化错误: {}", err),
            error_code: DeviceErrorCode::SystemError,
            source: Some(Box::new(err)),
        }
    }
}

#[async_trait]
impl DeviceExecutor for CVADevice {
    async fn initialize(&self, config: Option<Value>) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        if state.status == DeviceStatus::Busy {
            return Err(DeviceError::new(
                &self.device_id,
                "设备正在执行其他操作",
                DeviceErrorCode::Busy,
            ));
        }

        if let Some(config) = config {
            state.parameters = config.as_object()
                .ok_or_else(|| DeviceError::new(
                    &self.device_id,
                    "配置必须是一个对象",
                    DeviceErrorCode::InvalidParameter,
                ))?
                .iter()
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect();
        }

        state.status = DeviceStatus::Idle;
        Ok(())
    }

    async fn execute(&self, operation: &str, params: Option<Value>) -> Result<Value, DeviceError> {
        let mut state = self.state.write().await;
        if state.status == DeviceStatus::Busy {
            return Err(DeviceError::new(
                &self.device_id,
                "设备正在执行其他操作",
                DeviceErrorCode::Busy,
            ));
        }

        state.status = DeviceStatus::Busy;

        let result = match operation {
            "measure" => {
                let scan_rate = params
                    .as_ref()
                    .and_then(|v| v.get("scan_rate"))
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.1);

                let cycles = params
                    .as_ref()
                    .and_then(|v| v.get("cycles"))
                    .and_then(|v| v.as_u64())
                    .unwrap_or(1) as u32;

                let data = self.generate_cv_data(scan_rate, cycles).await;
                serde_json::to_value(data)?
            }
            _ => {
                state.status = DeviceStatus::Idle;
                return Err(DeviceError::new(
                    &self.device_id,
                    &format!("未知操作: {}", operation),
                    DeviceErrorCode::InvalidParameter,
                ));
            }
        };

        state.status = DeviceStatus::Idle;
        Ok(result)
    }

    async fn get_status(&self) -> Result<DeviceState, DeviceError> {
        Ok(self.state.read().await.clone())
    }

    async fn reset(&self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }
} 
