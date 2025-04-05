use tokio;
use serde_json::json;
use device_executor::{DeviceExecutor, SDLDeviceExecutor, DeviceConfig, events::EventSubscriber};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 创建设备执行器
    let mut executor = SDLDeviceExecutor::new_with_config(DeviceConfig::default());
    
    // 订阅设备状态变化事件
    let mut subscriber = executor.subscribe_events().await?;
    
    // 在后台任务中监听设备状态变化
    tokio::spawn(async move {
        while let Ok(event) = subscriber.recv().await {
            println!("设备状态变化: {:?}", event);
        }
    });

    // 初始化设备
    executor.initialize().await?;
    println!("设备初始化完成");

    // 执行 CVA 测量
    let params = json!({
        "start_voltage": -0.5,
        "end_voltage": 0.5,
        "scan_rate": 0.1,
        "cycles": 1
    });

    println!("开始 CVA 测量...");
    let result = executor.execute("measure_cv", params.as_object().unwrap().clone()).await?;
    
    println!("CVA 测量结果:");
    println!("{}", serde_json::to_string_pretty(&result)?);

    // 等待一段时间以观察状态变化
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

    Ok(())
} 
