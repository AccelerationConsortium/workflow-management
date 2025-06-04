# UO Builder 完整组件规范

## 🎯 组件体系概述

UO Builder现在包含**10个标准化组件**，分为3个类别：
- **6个功能模块** - 完整的实验室操作功能
- **4个参数组件** - 提升组合灵活性与表达能力

## 📋 完整组件列表

### 🧪 Core Functional Modules (6个)

#### 1. 🧪 Device Initialization
- **Parameters**: device_id (string), device_type (enum), init_mode (enum), timeout_s (int), retry_count (int)
- **Use Case**: Initialize photoreactor, robot arm, cytation reader

#### 2. ✅ User Confirmation Prompt  
- **Parameters**: prompt_text (string), expected_response (enum), timeout_s (int), abort_on_timeout (bool)
- **Use Case**: "Have you placed the vials on the rack?"

#### 3. 🔁 Liquid Transfer
- **Parameters**: source_container (string), target_container (string), volume_ml (float), speed_ul_per_s (float), pipette_type (enum), mix_after (bool)
- **Use Case**: Transfer 0.5 mL from stock A to reactor tube

#### 4. 🔆 Start Reaction
- **Parameters**: device_id (string), mode (string), duration_s (int), intensity_pct (int)
- **Use Case**: Start photoreactor after transfer

#### 5. 📏 Trigger Measurement
- **Parameters**: device_id (string), measurement_type (enum), wavelength_nm (int), integration_time_ms (int), export_format (enum), save_to (string)
- **Use Case**: Trigger a read on the Cytation5

#### 6. ⏸️ Pause / Delay Step
- **Parameters**: duration_s (int), reason (string), skippable (bool)
- **Use Case**: Wait 5 minutes after mixing before measurement

### 🧩 Flexibility Components (4个)

#### 7. 🔧 Device Selector
- **Parameters**: device_id (string), device_type (enum)
- **Use Case**: Select photoreactor_1 for UV reaction
- **Reason**: 当前组件只选容器/缓冲液，缺设备选择项

#### 8. ✓ Boolean Input
- **Parameters**: label (string), default (bool), tooltip (string)
- **Use Case**: Enable mixing after transfer
- **Reason**: 表达是否使用某功能、是否混合等布尔变量

#### 9. 📋 Enum Selector
- **Parameters**: options (array), default (string), label (string), tooltip (string)
- **Use Case**: Select heating mode or light wavelength
- **Reason**: 用于选择模式、方法（如加热模式、光源类型）

#### 10. 🔄 Repeat/Loop Control
- **Parameters**: repeat_times (int), delay_between (float), label (string), tooltip (string)
- **Use Case**: Mix 10 times with 2 second delay between
- **Reason**: 构建需要重复的 step（如混合10次）

## 🧩 实验模板设计

### ✅ 液体加样 (Liquid Sampling)
**组件组合**:
- Volume Parameter (volume_ml, unit)
- Container Selection (source_container, target_container) 
- Material Selection (material_id, type)
- Time Parameter (duration, unit)

**JSON示例**:
```json
{
  "operation": "liquid_sampling",
  "parameters": {
    "volume_ml": 0.5,
    "source_container": "stock_A",
    "target_container": "reactor_tube",
    "material_id": "Cu_salt",
    "duration_s": 30
  }
}
```

### ✅ 反应设定 (Reaction Setup)
**组件组合**:
- Temperature Parameter (temperature, unit)
- Time Parameter (duration, unit)
- Device Selector (device_id, device_type)

**JSON示例**:
```json
{
  "operation": "reaction_setup", 
  "parameters": {
    "temperature": 80,
    "unit": "°C",
    "duration_s": 300,
    "device_id": "heater_1",
    "device_type": "heater"
  }
}
```

### ✅ 光照反应 (Photochemical Reaction)
**组件组合**:
- Enum Selector (wavelength options)
- Time Parameter (duration)
- Device Selector (photoreactor)

**JSON示例**:
```json
{
  "operation": "photochemical_reaction",
  "parameters": {
    "wavelength": "UV-A 365nm",
    "duration_s": 600,
    "device_id": "photoreactor_1",
    "intensity_pct": 80
  }
}
```

### ✅ 多次混合 (Repeated Mixing)
**组件组合**:
- Repeat Control (repeat_times, delay_between)
- Speed Parameter (velocity, unit)
- Device Selector (mixer)

**JSON示例**:
```json
{
  "operation": "repeated_mixing",
  "parameters": {
    "repeat_times": 10,
    "delay_between": 2,
    "speed": 500,
    "unit": "rpm",
    "device_id": "mixer_1"
  }
}
```

### ✅ BO 参数注入 (BO Parameter Injection)
**组件组合**:
- Volume Parameter (推荐体积)
- Concentration Parameter (推荐浓度)
- Temperature Parameter (推荐温度)
- Boolean Input (启用优化)

**JSON示例**:
```json
{
  "operation": "bo_parameter_injection",
  "parameters": {
    "volume_ml": 1.2,
    "concentration": 15.5,
    "concentration_unit": "mM", 
    "temperature": 75,
    "temperature_unit": "°C",
    "enable_optimization": true
  }
}
```

## 🔧 技术实现特点

### 动态配置系统
- 每个组件根据类型显示对应的配置字段
- 参数验证和范围限制
- 实时预览功能

### JSON输出标准化
- 统一的参数命名规范
- 类型安全的数值验证
- 完整的配置导出

### 模块化设计
- 功能模块：完整的实验室操作
- 参数组件：灵活的参数配置
- 可组合性：支持复杂实验流程构建

## 🎉 系统优势

1. **完整性** - 覆盖实验室自动化的核心操作
2. **灵活性** - 4个新增组件提升表达能力
3. **标准化** - 统一的参数规范和JSON输出
4. **可扩展** - 模块化设计支持未来扩展
5. **实用性** - 5个实验模板覆盖常见场景

现在用户可以使用这10个标准化组件构建从简单到复杂的各种实验室工作流程！

## 📦 详细参数规范

### Basic Parameters

| 名称 | 参数字段 | 类型 | 说明 |
|------|----------|------|------|
| Boolean Input | label, default, tooltip | string, bool, string | 布尔值参数，用于启用/禁用功能 |
| Enum Selector | options, default, label, tooltip | array, string, string, string | 枚举选择，用于模式/方法选择 |

### Equipment Parameters

| 名称 | 参数字段 | 类型 | 说明 |
|------|----------|------|------|
| Device Selector | device_id, device_type | string, enum | 设备选择，支持photoreactor/pump/heater等 |

### Control Parameters

| 名称 | 参数字段 | 类型 | 说明 |
|------|----------|------|------|
| Repeat Control | repeat_times, delay_between, label, tooltip | int, float, string, string | 重复控制，支持1-1000次，延迟0-3600秒 |

### Functional Modules

| 名称 | 参数字段 | 类型 | 说明 |
|------|----------|------|------|
| Device Initialization | device_id, device_type, init_mode, timeout_s, retry_count | string, enum, enum, int, int | 设备初始化，支持soft/hard模式 |
| User Confirmation | prompt_text, expected_response, timeout_s, abort_on_timeout | string, enum, int, bool | 用户确认提示，支持多种响应类型 |
| Liquid Transfer | source_container, target_container, volume_ml, speed_ul_per_s, pipette_type, mix_after | string, string, float, float, enum, bool | 液体转移，支持单/多通道移液器 |
| Start Reaction | device_id, mode, duration_s, intensity_pct | string, string, int, int | 启动反应，支持强度控制1-100% |
| Trigger Measurement | device_id, measurement_type, wavelength_nm, integration_time_ms, export_format, save_to | string, enum, int, int, enum, string | 触发测量，支持多种测量类型和导出格式 |
| Pause Delay | duration_s, reason, skippable | int, string, bool | 暂停延迟，支持用户跳过选项 |
