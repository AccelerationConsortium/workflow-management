# UO Builder 组件验证清单

## 🎯 验证目标

确认所有10个组件（6个功能模块 + 4个新增组件）都能正确配置并输出标准JSON格式。

## ✅ 验证步骤

### 1. 启动应用
```bash
npm run dev
```

### 2. 进入UO Builder
- 点击"Create & Register UO"按钮
- 确认右侧组件库显示10个组件，分为3个类别

### 3. 逐一验证每个组件

#### 🧪 Core Functional Modules (6个)

**✅ Device Initialization**
- 拖拽到参数插槽
- 点击⚙️配置图标
- 验证配置字段：Device ID, Device Type, Init Mode, Timeout, Retry Count
- 预期JSON：
```json
{
  "type": "DEVICE_INITIALIZATION",
  "device_id": "cytation5",
  "device_type": "cytation", 
  "init_mode": "soft",
  "timeout_s": 30,
  "retry_count": 2
}
```

**✅ User Confirmation Prompt**
- 验证配置字段：Prompt Text, Expected Response, Timeout, Abort on Timeout
- 预期JSON：
```json
{
  "type": "USER_CONFIRMATION",
  "prompt_text": "Confirm vial placement",
  "expected_response": "yes",
  "timeout_s": 120,
  "abort_on_timeout": true
}
```

**✅ Liquid Transfer**
- 验证配置字段：Source Container, Target Container, Volume, Speed, Pipette Type, Mix After
- 预期JSON：
```json
{
  "type": "LIQUID_TRANSFER",
  "source_container": "stock_A",
  "target_container": "reactor_tube", 
  "volume_ml": 0.5,
  "speed_ul_per_s": 300,
  "pipette_type": "single",
  "mix_after": true
}
```

**✅ Start Reaction**
- 验证配置字段：Device ID, Mode, Duration, Intensity
- 预期JSON：
```json
{
  "type": "START_REACTION",
  "device_id": "photoreactor_1",
  "mode": "UV-A 365nm",
  "duration_s": 300,
  "intensity_pct": 80
}
```

**✅ Trigger Measurement**
- 验证配置字段：Device ID, Measurement Type, Wavelength, Integration Time, Export Format, Save To
- 预期JSON：
```json
{
  "type": "TRIGGER_MEASUREMENT",
  "device_id": "cytation5",
  "measurement_type": "OD600",
  "wavelength_nm": 600,
  "integration_time_ms": 500,
  "export_format": "csv",
  "save_to": "results/exp001_cytation.csv"
}
```

**✅ Pause / Delay Step**
- 验证配置字段：Duration, Reason, Skippable
- 预期JSON：
```json
{
  "type": "PAUSE_DELAY",
  "duration_s": 300,
  "reason": "Allow reaction to settle",
  "skippable": true
}
```

#### 🧩 Flexibility Components (4个)

**✅ Device Selector**
- 验证配置字段：Device ID, Device Type
- 预期JSON：
```json
{
  "type": "DEVICE_SELECTOR",
  "device_id": "photoreactor_1",
  "device_type": "photoreactor"
}
```

**✅ Boolean Input**
- 验证配置字段：Label, Default Value, Tooltip
- 预期JSON：
```json
{
  "type": "BOOLEAN_INPUT",
  "label": "Enable Feature",
  "default": false,
  "tooltip": "Boolean parameter for enable/disable"
}
```

**✅ Enum Selector**
- 验证配置字段：Options (comma separated), Default Selection
- 预期JSON：
```json
{
  "type": "ENUM_SELECTOR",
  "options": ["Option 1", "Option 2", "Option 3"],
  "default": "Option 1",
  "label": "Selection"
}
```

**✅ Repeat/Loop Control**
- 验证配置字段：Repeat Times, Delay Between
- 预期JSON：
```json
{
  "type": "REPEAT_CONTROL",
  "repeat_times": 10,
  "delay_between": 2,
  "label": "Repeat Control"
}
```

### 4. 预览模式验证

切换到预览模式，验证每个组件的预览显示：

- **Device Selector**: 显示设备ID标签和类型
- **Boolean Input**: 显示开关控件
- **Enum Selector**: 显示下拉选择框
- **Repeat Control**: 显示重复次数和延迟时间标签
- **功能模块**: 显示对应的操作界面

### 5. 实验模板验证

尝试构建5个实验模板：

**✅ 液体加样模板**
- 使用：Liquid Transfer + Device Selector + Boolean Input
- 验证组合配置能正确输出

**✅ 反应设定模板**  
- 使用：Start Reaction + Device Selector + Enum Selector
- 验证温度和时间参数配置

**✅ 光照反应模板**
- 使用：Start Reaction + Enum Selector (wavelength) + Pause Delay
- 验证光源选择和反应控制

**✅ 多次混合模板**
- 使用：Repeat Control + Device Selector + Boolean Input
- 验证重复操作配置

**✅ BO参数注入模板**
- 使用：多个参数组件 + Boolean Input (enable optimization)
- 验证参数推荐系统集成

## 🔧 故障排除

### 常见问题

1. **组件不显示配置字段**
   - 检查componentType匹配
   - 确认ParameterSlot.tsx中有对应的配置case

2. **预览模式显示错误**
   - 检查renderPreviewComponent中的case
   - 确认config字段名称正确

3. **JSON输出格式错误**
   - 检查defaultProps中的字段名
   - 确认类型转换正确

### 验证通过标准

- [x] 所有10个组件都能正确拖拽和配置
- [x] 每个组件显示对应的专用配置字段
- [x] 预览模式正确显示组件外观
- [x] JSON输出格式符合规范
- [x] 实验模板能够成功构建
- [x] 参数验证和范围限制正常工作

## 🎉 验证完成

当所有检查项都通过时，UO Builder的10个组件系统就可以投入使用，为通用UO注册系统提供完整的积木模块支持！
