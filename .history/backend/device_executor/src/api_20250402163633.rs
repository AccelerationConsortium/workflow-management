use axum::{
    routing::{post, get},
    Router,
    extract::Json,
    extract::State,
    response::IntoResponse,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;
use futures::{Stream, StreamExt};
use std::collections::HashMap;
use crate::{DeviceManager, DeviceConfig, DeviceEvent};

#[derive(Debug, Deserialize)]
pub struct DeviceOperation {
    device_type: String,
    operation: String,
    #[serde(default)]
    config: Option<DeviceConfig>,
    parameters: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct OperationResponse {
    device_id: String,
    status: String,
    data: Option<serde_json::Value>,
    error: Option<String>,
}

pub struct ApiState {
    device_manager: Arc<DeviceManager>,
}

pub async fn run_api_server() {
    let device_manager = Arc::new(DeviceManager::new());
    
    let app_state = Arc::new(ApiState {
        device_manager: device_manager.clone(),
    });

    let app = Router::new()
        .route("/api/device/send", post(handle_device_operation))
        .route("/api/ws", get(handle_websocket))
        .with_state(app_state);

    println!("API server running on http://localhost:3000");
    
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn handle_device_operation(
    State(state): State<Arc<ApiState>>,
    Json(operation): Json<DeviceOperation>,
) -> impl IntoResponse {
    // 为每个操作创建一个新的设备实例
    let device_id = uuid::Uuid::new_v4().to_string();
    
    // 使用默认配置或提供的配置
    let config = operation.config.unwrap_or_default();
    
    // 创建设备
    if let Err(e) = state.device_manager.create_device(device_id.clone(), config).await {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(OperationResponse {
                device_id,
                status: "error".to_string(),
                data: None,
                error: Some(e.to_string()),
            }),
        );
    }
    
    // 执行操作
    match state.device_manager.execute_operation(&device_id, &operation.operation, operation.parameters).await {
        Ok(result) => (
            StatusCode::OK,
            Json(OperationResponse {
                device_id,
                status: "success".to_string(),
                data: Some(result),
                error: None,
            }),
        ),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(OperationResponse {
                device_id,
                status: "error".to_string(),
                data: None,
                error: Some(e.to_string()),
            }),
        ),
    }
}

async fn handle_websocket(
    State(state): State<Arc<ApiState>>,
    ws: axum::extract::WebSocketUpgrade,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_websocket_connection(socket, state))
}

async fn handle_websocket_connection(
    socket: axum::extract::ws::WebSocket,
    state: Arc<ApiState>,
) {
    let (mut sender, _receiver) = socket.split();
    let mut event_rx = state.device_manager.subscribe_events();
    
    while let Ok(event) = event_rx.recv().await {
        let msg = serde_json::to_string(&event).unwrap();
        if sender.send(axum::extract::ws::Message::Text(msg)).await.is_err() {
            break;
        }
    }
} 
