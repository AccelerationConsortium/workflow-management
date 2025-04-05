use serde::{Deserialize, Serialize};
use serde_json::Value;
use chrono::{DateTime, Utc};
use tokio::sync::broadcast;
use crate::DeviceStatus;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceEvent {
    pub device_id: String,
    pub status: DeviceStatus,
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub data: Option<Value>,
}

pub struct EventSubscriber {
    rx: broadcast::Receiver<DeviceEvent>,
}

impl EventSubscriber {
    pub fn new(rx: broadcast::Receiver<DeviceEvent>) -> Self {
        Self { rx }
    }

    pub async fn recv(&mut self) -> Result<DeviceEvent, broadcast::error::RecvError> {
        self.rx.recv().await
    }
}

pub struct EventPublisher {
    tx: broadcast::Sender<DeviceEvent>,
}

impl EventPublisher {
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }

    pub fn subscribe(&self) -> EventSubscriber {
        EventSubscriber::new(self.tx.subscribe())
    }

    pub fn publish(&self, event: DeviceEvent) {
        let _ = self.tx.send(event);
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceEvent {
    DeviceCreated {
        device_id: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
    },
    DeviceRemoved {
        device_id: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
    },
    OperationStarted {
        device_id: String,
        operation: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
    },
    OperationCompleted {
        device_id: String,
        operation: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
        data: Value,
    },
    OperationFailed {
        device_id: String,
        operation: String,
        #[serde(with = "chrono::serde::ts_seconds")]
        timestamp: DateTime<Utc>,
        error: String,
    },
}

pub struct EventBus {
    sender: broadcast::Sender<DeviceEvent>,
}

impl EventBus {
    pub fn new() -> Self {
        let (sender, _) = broadcast::channel(100);
        Self { sender }
    }

    pub async fn publish(&self, event: DeviceEvent) {
        let _ = self.sender.send(event);
    }

    pub fn subscribe(&self) -> broadcast::Receiver<DeviceEvent> {
        self.sender.subscribe()
    }
} 
