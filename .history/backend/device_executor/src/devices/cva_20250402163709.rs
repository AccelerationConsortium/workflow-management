use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::{DeviceExecutor, DeviceError, DeviceState, DeviceStatus};
use async_trait::async_trait;

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
    state: DeviceState,
    config: CVAConfig,
}

impl CVADevice {
    pub fn new(config: CVAConfig) -> Self {
        Self {
            state: DeviceState {
                status: DeviceStatus::Idle,
                parameters: HashMap::new(),
            },
            config,
        }
    }
    
    fn generate_cv_data(&self, scan_rate: f64) -> Vec<(f64, f64)> {
        let mut data = Vec::new();
        let mut voltage = self.config.start_voltage;
        let step = scan_rate * (self.config.sample_interval as f64 / 1000.0);
        
        // 正向扫描
        while voltage <= self.config.end_voltage {
            let current = self.simulate_current(voltage, scan_rate);
            data.push((voltage, current));
            voltage += step;
        }
        
        // 反向扫描
        while voltage >= self.config.start_voltage {
            let current = self.simulate_current(voltage, scan_rate);
            data.push((voltage, current));
            voltage -= step;
        }
        
        data
    }
    
    fn simulate_current(&self, voltage: f64, scan_rate: f64) -> f64 {
        // 模拟 CV 曲线的电流响应
        // 使用简化的 Butler-Volmer 方程
        let base_current = 1e-6; // 基础电流 (1 µA)
        let alpha = 0.5; // 传递系数
        let f = 96485.0; // 法拉第常数
        let r = 8.314; // 气体常数
        let t = 298.0; // 温度 (K)
        
        let eta = voltage; // 过电位
        let forward = (-alpha * f * eta / (r * t)).exp();
        let backward = ((1.0 - alpha) * f * eta / (r * t)).exp();
        
        let current = base_current * (forward - backward);
        
        // 添加扫描速率依赖性
        current * (scan_rate / 0.05).sqrt()
    }
}

#[async_trait]
impl DeviceExecutor for CVADevice {
    async fn initialize(&mut self) -> Result<(), DeviceError> {
        self.state.status = DeviceStatus::Idle;
        Ok(())
    }
    
    async fn execute(&mut self, operation: &str, params: HashMap<String, serde_json::Value>) -> Result<serde_json::Value, DeviceError> {
        match operation {
            "measure" => {
                self.state.status = DeviceStatus::Busy;
                
                let mut all_data = Vec::new();
                for &scan_rate in &self.config.scan_rates {
                    // 生成该扫描速率下的数据
                    let data = self.generate_cv_data(scan_rate);
                    
                    // 计算统计信息
                    let currents: Vec<f64> = data.iter().map(|(_, i)| *i).collect();
                    let mean_current = currents.iter().sum::<f64>() / currents.len() as f64;
                    let max_current = currents.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
                    let min_current = currents.iter().fold(f64::INFINITY, |a, &b| a.min(b));
                    
                    all_data.push(serde_json::json!({
                        "scan_rate": scan_rate,
                        "data": data,
                        "statistics": {
                            "mean_current": mean_current,
                            "max_current": max_current,
                            "min_current": min_current,
                        }
                    }));
                }
                
                self.state.status = DeviceStatus::Idle;
                
                Ok(serde_json::json!({
                    "type": if self.config.is_cva { "CVA" } else { "CV" },
                    "measurements": all_data,
                    "parameters": {
                        "start_voltage": self.config.start_voltage,
                        "end_voltage": self.config.end_voltage,
                        "scan_rates": self.config.scan_rates,
                    }
                }))
            }
            _ => Err(DeviceError::InvalidParameter {
                reason: format!("未知操作: {}", operation),
                parameter: "operation".to_string(),
                valid_range: None,
            }),
        }
    }
    
    async fn get_status(&self) -> Result<DeviceState, DeviceError> {
        Ok(self.state.clone())
    }
    
    async fn reset(&mut self) -> Result<(), DeviceError> {
        self.state.status = DeviceStatus::Idle;
        self.state.parameters.clear();
        Ok(())
    }
} 
