use device_executor::devices::cva::CVAConfig;
use device_executor::DeviceConfig;
use reqwest::Client;
use serde_json::json;
use tokio::time::Duration;
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 创建 HTTP 客户端
    let client = Client::new();
    
    // 准备 CVA 配置
    let config = DeviceConfig::CVA(CVAConfig {
        is_cva: true,
        scan_rates: vec![0.02, 0.04, 0.06],
        start_voltage: -0.8,
        end_voltage: 0.8,
        sample_interval: 50,
    });
    
    // 发送设备操作请求
    let response = client.post("http://localhost:3000/api/device/send")
        .json(&json!({
            "device_type": "cva",
            "operation": "measure",
            "config": config,
            "parameters": {}
        }))
        .send()
        .await?;
        
    println!("操作响应: {:#?}", response.json::<serde_json::Value>().await?);
    
    // 连接 WebSocket 以接收设备事件
    let (ws_stream, _) = connect_async("ws://localhost:3000/api/ws").await?;
    println!("WebSocket 连接已建立");
    
    let (mut write, mut read) = ws_stream.split();
    
    // 发送心跳消息
    tokio::spawn(async move {
        loop {
            write.send(Message::Text("ping".to_string())).await.unwrap();
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    });
    
    // 接收并打印设备事件
    while let Some(msg) = read.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                println!("收到设备事件: {}", text);
            }
            Err(e) => {
                eprintln!("WebSocket 错误: {}", e);
                break;
            }
            _ => {}
        }
    }
    
    Ok(())
} 
