use device_executor::{
    create_device,
    DeviceConfig,
    devices::cva::CVAConfig,
};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 创建 CVA 设备
    let device_id = "test_cva_1".to_string();
    let config = DeviceConfig::CVA(CVAConfig {
        is_cva: true,
        scan_rates: vec![0.02, 0.04, 0.06],
        start_voltage: -0.8,
        end_voltage: 0.8,
        sample_interval: 50,
    });

    let mut device = create_device("cva", device_id, config)?;
    
    // 初始化设备
    device.initialize().await?;
    println!("设备初始化完成");

    // 执行 CVA 测量
    let params = json!({
        "scan_rate": 0.02,
        "cycles": 1
    });

    println!("开始 CVA 测量...");
    let result = device.execute("measure", params.as_object().unwrap().clone()).await?;
    
    println!("CVA 测量结果:");
    println!("{}", serde_json::to_string_pretty(&result)?);

    // 获取并打印设备状态
    let status = device.get_status().await?;
    println!("设备状态: {:?}", status);

    Ok(())
} 
