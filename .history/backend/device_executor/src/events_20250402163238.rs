use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;
use std::time::SystemTime;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceEvent {
    /// 设备ID
    pub device_id: String,
    
    /// 事件时间戳
    #[serde(with = "time::serde::timestamp")]
    pub timestamp: SystemTime,
    
    /// 事件类型
    pub event_type: DeviceEventType,
    
    /// 事件数据
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DeviceEventType {
    /// 状态变更
    StatusChanged,
    /// 操作开始
    OperationStarted,
    /// 操作完成
    OperationCompleted,
    /// 错误发生
    ErrorOccurred,
    /// 设备重置
    DeviceReset,
}

pub struct EventBus {
    tx: broadcast::Sender<DeviceEvent>,
}

impl EventBus {
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }
    
    pub fn subscribe(&self) -> broadcast::Receiver<DeviceEvent> {
        self.tx.subscribe()
    }
    
    pub fn publish(&self, event: DeviceEvent) {
        let _ = self.tx.send(event);
    }
}

impl Default for EventBus {
    fn default() -> Self {
        Self::new(100) // 默认缓存100条事件
    }
} 
