use std::net::SocketAddr;
use std::sync::Arc;
use axum::{
    extract::ws::{WebSocket, Message},
    routing::get,
    Router,
};
use futures::{SinkExt, StreamExt};
use serde_json::Value;
use tokio::sync::broadcast;

use crate::{DeviceManager, DeviceConfig};

pub struct ApiState {
    device_manager: Arc<DeviceManager>,
}

pub async fn run_api_server(device_manager: Arc<DeviceManager>) {
    let state = Arc::new(ApiState {
        device_manager,
    });

    let app = Router::new()
        .route("/ws", get(handle_websocket))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("API server listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn handle_websocket(
    ws: WebSocket,
    state: Arc<ApiState>,
) {
    let (mut sender, mut receiver) = ws.split();
    let mut event_rx = state.device_manager.subscribe_events();

    let mut send_task = tokio::spawn(async move {
        while let Ok(event) = event_rx.recv().await {
            let msg = serde_json::to_string(&event).unwrap();
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(message)) = receiver.next().await {
            match message {
                Message::Text(text) => {
                    println!("Received message: {}", text);
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
} 
