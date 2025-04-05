use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use async_trait::async_trait;
use rand::Rng;
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

    async fn generate_cv_data(&self, scan_rate: f64, cycles: u32) -> Vec<(f64, f64)> {
        let mut data = Vec::new();
        let voltage_step = scan_rate * 0.01; // 10ms sampling rate
        let start_voltage = -0.5;
        let end_voltage = 0.5;

        for _ in 0..cycles {
            // Forward scan
            let mut voltage = start_voltage;
            while voltage <= end_voltage {
                let current = self.simulate_current(voltage);
                data.push((voltage, current));
                voltage += voltage_step;
            }

            // Reverse scan
            voltage = end_voltage;
            while voltage >= start_voltage {
                let current = self.simulate_current(voltage);
                data.push((voltage, current));
                voltage -= voltage_step;
            }
        }

        data
    }

    fn simulate_current(&self, voltage: f64) -> f64 {
        let mut rng = rand::thread_rng();
        
        // Simulate redox peaks
        let oxidation_peak = 0.2;
        let reduction_peak = -0.2;
        let peak_width = 0.1;
        
        let mut current = voltage * 0.1; // Background current
        
        // Add oxidation peak
        current += 5.0 * (-((voltage - oxidation_peak).powi(2)) / (2.0 * peak_width.powi(2))).exp();
        
        // Add reduction peak
        current -= 5.0 * (-((voltage - reduction_peak).powi(2)) / (2.0 * peak_width.powi(2))).exp();
        
        // Add random noise
        current += rng.gen_range(-0.1..0.1);
        
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
                "Device is busy",
                DeviceErrorCode::StateError,
            ));
        }

        if let Some(config) = config {
            state.parameters = config.as_object()
                .ok_or_else(|| DeviceError::new(
                    &self.device_id,
                    "Invalid configuration format",
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
                "Device is busy",
                DeviceErrorCode::StateError,
            ));
        }

        match operation {
            "measure" => {
                let params = params.ok_or_else(|| DeviceError::new(
                    &self.device_id,
                    "Missing parameters for measurement",
                    DeviceErrorCode::InvalidParameter,
                ))?;

                let params_map = params.as_object().ok_or_else(|| DeviceError::new(
                    &self.device_id,
                    "Invalid parameters format",
                    DeviceErrorCode::InvalidParameter,
                ))?;

                let scan_rate = params_map.get("scan_rate")
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::new(
                        &self.device_id,
                        "Missing or invalid scan_rate parameter",
                        DeviceErrorCode::InvalidParameter,
                    ))?;

                let cycles = params_map.get("cycles")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(1) as u32;

                state.status = DeviceStatus::Busy;
                drop(state);

                let data = self.generate_cv_data(scan_rate, cycles).await;
                
                let mut state = self.state.write().await;
                state.status = DeviceStatus::Idle;
                
                Ok(serde_json::to_value(data)?)
            }
            _ => Err(DeviceError::new(
                &self.device_id,
                format!("Unknown operation: {}", operation),
                DeviceErrorCode::InvalidParameter,
            )),
        }
    }

    async fn get_status(&self) -> Result<DeviceState, DeviceError> {
        Ok(self.state.read().await.clone())
    }

    async fn reset(&self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        *state = DeviceState::default();
        Ok(())
    }
} 
