use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use async_trait::async_trait;
use rand::Rng;
use tokio::sync::RwLock;

use crate::{DeviceExecutor, DeviceError, DeviceState, DeviceStatus, DeviceErrorCode};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVAConfig {
    /// 是否是 CVA 模式（否则为普通 CV）
    pub is_cva: bool,
    
    /// 扫描速率列表 (V/s)
    pub scan_rates: Vec<f64>,
    
    /// 起始电压 (V)
    pub start_voltage: f64,
    
    /// 结束电压 (V)
    pub end_voltage: f64,
    
    /// 采样间隔 (ms)
    pub sample_interval: u64,
}

impl Default for CVAConfig {
    fn default() -> Self {
        Self {
            is_cva: true,
            scan_rates: vec![0.02, 0.04, 0.06, 0.08, 0.1],
            start_voltage: -0.5,
            end_voltage: 0.5,
            sample_interval: 100,
        }
    }
}

pub struct CVADevice {
    device_id: String,
    config: CVAConfig,
    state: RwLock<DeviceState>,
}

impl CVADevice {
    pub fn new(device_id: String, config: CVAConfig) -> Self {
        Self {
            device_id,
            config,
            state: RwLock::new(DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            }),
        }
    }
    
    async fn generate_cv_data(&self, scan_rate: f64, cycles: u32) -> Vec<(f64, f64)> {
        let mut data = Vec::new();
        let mut rng = rand::thread_rng();

        for _ in 0..cycles {
            let points = ((self.config.end_voltage - self.config.start_voltage).abs() / 
                (self.config.sample_interval as f64 / 1000.0)) as usize;
            
            // 正向扫描
            for i in 0..points {
                let voltage = self.config.start_voltage + 
                    (i as f64 * (self.config.sample_interval as f64 / 1000.0));
                let current = self.simulate_current(voltage) + rng.gen_range(-0.1..0.1);
                data.push((voltage, current));
            }

            // 反向扫描
            for i in 0..points {
                let voltage = self.config.end_voltage - 
                    (i as f64 * (self.config.sample_interval as f64 / 1000.0));
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
        Ok(())
    }
    
    async fn execute(&mut self, operation: &str, params: HashMap<String, Value>) -> Result<Value, DeviceError> {
        let mut state = self.state.write().await;
        
        if state.status == DeviceStatus::Busy {
            return Err(DeviceError::new(
                self.device_id.clone(),
                "设备正忙".to_string(),
                DeviceErrorCode::StateError,
            ));
        }

        match operation {
            "measure" => {
                state.status = DeviceStatus::Busy;

                let scan_rate = params.get("scan_rate")
                    .and_then(|v| v.as_f64())
                    .ok_or_else(|| DeviceError::new(
                        self.device_id.clone(),
                        "缺少扫描速率参数".to_string(),
                        DeviceErrorCode::ConfigurationError,
                    ))?;

                let cycles = params.get("cycles")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(1) as u32;

                let data = self.generate_cv_data(scan_rate, cycles).await;
                
                state.status = DeviceStatus::Idle;
                
                Ok(serde_json::json!({
                    "data": data,
                    "scan_rate": scan_rate,
                    "cycles": cycles,
                }))
            }
            _ => Err(DeviceError::new(
                self.device_id.clone(),
                format!("未知操作: {}", operation),
                DeviceErrorCode::ConfigurationError,
            )),
        }
    }
    
    async fn get_status(&self) -> Result<DeviceState, DeviceError> {
        Ok(self.state.read().await.clone())
    }
    
    async fn reset(&mut self) -> Result<(), DeviceError> {
        let mut state = self.state.write().await;
        state.status = DeviceStatus::Idle;
        state.parameters.clear();
        Ok(())
    }
}

impl From<serde_json::Error> for DeviceError {
    fn from(err: serde_json::Error) -> Self {
        DeviceError::new(
            String::new(),
            format!("JSON 序列化错误: {}", err),
            DeviceErrorCode::SystemError,
        )
    }
} 
