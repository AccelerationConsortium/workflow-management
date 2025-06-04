# UO Builder 功能模块规范

## 🎯 重新设计说明

根据用户要求，我们已将组件库从**参数模块**重新设计为**功能模块**。每个模块代表一个完整的实验室操作功能，包含对应的参数字段配置。

## 📋 6个核心功能模块

### 1. 🧪 Device Initialization
- **Module Name**: Device Initialization
- **Description**: Initialize one or multiple lab instruments before workflow begins
- **Typical Use Case**: Initialize photoreactor, robot arm, cytation reader
- **Configurable Parameters**:

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| device_id | string | "cytation5" | Internal name or alias of the device |
| device_type | enum | "photoreactor", "cytation", "robot", "pump", "heater" | Device type for UI grouping |
| init_mode | enum | "soft", "hard" | Soft: warmup only; Hard: full reset/init |
| timeout_s | int | 30 | Max wait time before failing (5-300s) |
| retry_count | int | 2 | Retry attempts before failure (0-10) |

### 2. ✅ User Confirmation Prompt
- **Module Name**: User Confirmation Prompt
- **Description**: Ask user to confirm a physical setup step before proceeding
- **Typical Use Case**: "Have you placed the vials on the rack?"
- **Configurable Parameters**:

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| prompt_text | string | "Confirm vial placement" | Message shown to the user |
| expected_response | enum | "yes", "ok", "done", "confirm" | Expected answer from user |
| timeout_s | int | 120 | Time to wait for response (10-600s) |
| abort_on_timeout | bool | true | Whether to cancel if no response |

### 3. 🔁 Liquid Transfer
- **Module Name**: Liquid Transfer
- **Description**: Transfer a specified volume from a source to a target container
- **Typical Use Case**: Transfer 0.5 mL from stock A to reactor tube
- **Configurable Parameters**:

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| source_container | string | "stock_A" | Container ID or label |
| target_container | string | "reactor_tube" | Destination container ID |
| volume_ml | float | 0.5 | Volume to transfer in mL (0.001-50) |
| speed_ul_per_s | float | 300 | Transfer speed (10-1000 μL/s) |
| pipette_type | enum | "single", "multi" | For robotic arms with multiple tips |
| mix_after | bool | true | Optional mix step post transfer |

### 4. 🔆 Start Reaction
- **Module Name**: Start Reaction
- **Description**: Activate a device to start a chemical or biological reaction
- **Typical Use Case**: Start photoreactor after transfer
- **Configurable Parameters**:

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| device_id | string | "photoreactor_1" | Device ID or name |
| mode | string | "UV-A 365nm" | Reaction mode or preset |
| duration_s | int | 300 | Duration in seconds (1-86400) |
| intensity_pct | int | 80 | Optional power level % (1-100) |

### 5. 📏 Trigger Measurement
- **Module Name**: Trigger Measurement
- **Description**: Trigger a device to measure sample or system status
- **Typical Use Case**: Trigger a read on the Cytation5
- **Configurable Parameters**:

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| device_id | string | "cytation5" | Name or alias of the measurement device |
| measurement_type | enum | "OD600", "fluorescence", "absorbance", "luminescence" | Common readout types |
| wavelength_nm | int | 600 | Wavelength override (200-1000nm) |
| integration_time_ms | int | 500 | Timing config (10-10000ms) |
| export_format | enum | "csv", "json", "xlsx" | Output file format |
| save_to | string | "results/exp001_cytation.csv" | File path or DB destination |

### 6. ⏸️ Pause / Delay Step
- **Module Name**: Pause / Delay Step
- **Description**: Pause the workflow execution for a fixed duration
- **Typical Use Case**: Wait 5 minutes after mixing before measurement
- **Configurable Parameters**:

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| duration_s | int | 300 | Duration to pause in seconds (1-86400) |
| reason | string | "Allow reaction to settle" | Shown in UI/log |
| skippable | bool | true | Whether user can skip this manually |

## 🔧 技术实现

### 组件库配置
- 每个模块在 `componentLibrary.ts` 中定义
- 包含 `useCase` 字段说明典型用途
- `defaultProps` 包含所有参数的默认值

### 动态配置界面
- `ParameterSlot.tsx` 为每个模块类型提供专用配置界面
- 根据参数类型自动生成对应的输入控件
- 支持参数验证和范围限制

### JSON 输出格式
每个配置的模块将生成如下格式的JSON：

```json
{
  "type": "LIQUID_TRANSFER",
  "label": "Transfer Sample",
  "required": true,
  "source_container": "stock_A",
  "target_container": "reactor_tube",
  "volume_ml": 0.5,
  "speed_ul_per_s": 300,
  "pipette_type": "single",
  "mix_after": true
}
```

## ✅ 验证清单

- [x] 6个功能模块完全匹配用户提供的规范
- [x] 每个模块包含所有必需的参数字段
- [x] 参数类型和验证规则正确实现
- [x] 动态配置界面根据模块类型显示对应字段
- [x] 能够正确输出JSON格式的配置
- [x] 模块名称、描述、用途举例完整
- [x] 参数字段说明（字段名、类型、示例、说明）完整

## 🎉 结论

重新设计的功能模块系统现在完全符合通用UO注册系统的要求：
1. **功能完整性** - 每个模块代表完整的实验室操作
2. **参数规范性** - 所有参数字段按照规范定义
3. **配置动态性** - 界面根据模块类型动态生成配置项
4. **输出标准性** - 能够生成标准JSON格式的配置

用户现在可以使用这6个标准化的功能模块来构建复杂的实验室工作流程。
