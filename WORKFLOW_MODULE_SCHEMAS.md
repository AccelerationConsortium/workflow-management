# 工作流模块 Schema 定义

## 当前实现架构确认

### ✅ 1. 每个模块都有独立的参数定义 (Schema)

是的，每个工作流模块都有完整的参数 schema 定义。以下是实际的实现：

## 模块 Schema 示例

### 1. Liquid Transfer 模块

```json
{
  "module_type": "LIQUID_TRANSFER",
  "label": "Liquid Transfer",
  "description": "Transfer a specified volume from a source to a target container",
  "icon": "🔁",
  "category": "workflow",
  "parameters": [
    {
      "name": "sourceContainer",
      "type": "string",
      "label": "Source Container",
      "tooltip": "Container ID or label to draw liquid from",
      "required": true,
      "defaultValue": "stock_A",
      "placeholder": "e.g., stock_A"
    },
    {
      "name": "targetContainer", 
      "type": "string",
      "label": "Target Container",
      "tooltip": "Destination container ID or label",
      "required": true,
      "defaultValue": "reactor_tube",
      "placeholder": "e.g., reactor_tube"
    },
    {
      "name": "volumeMl",
      "type": "float",
      "label": "Volume (mL)",
      "tooltip": "Amount of liquid to transfer in mL",
      "required": true,
      "defaultValue": 0.5,
      "min": 0,
      "step": 0.1
    },
    {
      "name": "speedUlPerS",
      "type": "float", 
      "label": "Speed (μL/s)",
      "tooltip": "Transfer speed in microliters per second",
      "required": true,
      "defaultValue": 300
    },
    {
      "name": "pipetteType",
      "type": "enum",
      "label": "Pipette Type",
      "tooltip": "Type of pipette for robotic arms",
      "required": true,
      "defaultValue": "single",
      "options": ["single", "multi"]
    },
    {
      "name": "mixAfter",
      "type": "boolean",
      "label": "Mix After Transfer",
      "tooltip": "Whether to mix the solution after transfer",
      "required": false,
      "defaultValue": true
    }
  ]
}
```

### 2. Device Initialization 模块

```json
{
  "module_type": "DEVICE_INITIALIZATION",
  "label": "Device Initialization", 
  "description": "Initialize one or multiple lab instruments before workflow begins",
  "icon": "🧪",
  "category": "workflow",
  "parameters": [
    {
      "name": "deviceId",
      "type": "string",
      "label": "Device ID",
      "tooltip": "Internal name or alias of the device",
      "required": true,
      "defaultValue": "cytation5",
      "placeholder": "e.g., cytation5"
    },
    {
      "name": "deviceType",
      "type": "enum",
      "label": "Device Type",
      "tooltip": "Type of device for UI grouping",
      "required": true,
      "defaultValue": "cytation",
      "options": ["photoreactor", "cytation", "robot", "other"]
    },
    {
      "name": "initMode",
      "type": "enum",
      "label": "Initialization Mode",
      "tooltip": "Soft: warmup only; Hard: full reset/init",
      "required": true,
      "defaultValue": "soft",
      "options": ["soft", "hard"]
    },
    {
      "name": "timeoutS",
      "type": "int",
      "label": "Timeout (seconds)",
      "tooltip": "Max wait time before failing",
      "required": true,
      "defaultValue": 30,
      "min": 1
    },
    {
      "name": "retryCount",
      "type": "int",
      "label": "Retry Count",
      "tooltip": "Retry attempts before failure",
      "required": true,
      "defaultValue": 2,
      "min": 0
    }
  ]
}
```

### 3. Trigger Measurement 模块

```json
{
  "module_type": "TRIGGER_MEASUREMENT",
  "label": "Trigger Measurement",
  "description": "Trigger a device to measure sample or system status",
  "icon": "📏",
  "category": "workflow", 
  "parameters": [
    {
      "name": "deviceId",
      "type": "string",
      "label": "Device ID",
      "tooltip": "Name or alias of the measurement device",
      "required": true,
      "defaultValue": "cytation5",
      "placeholder": "e.g., cytation5"
    },
    {
      "name": "measurementType",
      "type": "enum",
      "label": "Measurement Type",
      "tooltip": "Common readout types",
      "required": true,
      "defaultValue": "OD600",
      "options": ["OD600", "fluorescence", "absorbance", "other"]
    },
    {
      "name": "wavelengthNm",
      "type": "int",
      "label": "Wavelength (nm)",
      "tooltip": "Optional wavelength override",
      "required": false,
      "defaultValue": 600,
      "min": 200,
      "max": 1000
    },
    {
      "name": "integrationTimeMs",
      "type": "int",
      "label": "Integration Time (ms)",
      "tooltip": "Optional timing configuration",
      "required": false,
      "defaultValue": 500,
      "min": 1
    },
    {
      "name": "exportFormat",
      "type": "enum",
      "label": "Export Format",
      "tooltip": "Output file format",
      "required": true,
      "defaultValue": "csv",
      "options": ["csv", "json"]
    },
    {
      "name": "saveTo",
      "type": "string",
      "label": "Save To",
      "tooltip": "File path or database destination",
      "required": true,
      "defaultValue": "results/exp001_cytation.csv",
      "placeholder": "e.g., results/exp001.csv"
    }
  ]
}
```

## ✅ 2. 前端动态渲染确认

### 架构设计

1. **模块注册**: 每个模块在 `componentLibrary.ts` 中注册时包含完整的 `parameter_schema`
2. **动态渲染**: `ParameterSlot.tsx` 根据模块类型动态渲染对应的参数配置表单
3. **Schema 生成**: `generateUOSchema()` 函数根据拖拽结果动态生成 JSON schema

### 支持的字段类型

- ✅ **string**: 文本输入字段
- ✅ **float**: 浮点数输入字段  
- ✅ **int**: 整数输入字段
- ✅ **enum**: 下拉选择字段
- ✅ **boolean**: 复选框/开关字段
- 🔄 **file**: 文件上传字段 (部分支持，在 FILE_OPERATIONS 组件中)

### 动态 JSON 生成

当用户拖拽并配置模块后，系统会生成如下格式的 UO 定义：

```json
{
  "id": "custom_uo_1703123456789",
  "name": "Automated Photochemistry Workflow",
  "description": "Complete workflow for photochemical synthesis",
  "category": "reaction",
  "parameters": [
    {
      "id": "1",
      "name": "Initialize Cytation Reader", 
      "type": "string",
      "required": true,
      "defaultValue": "cytation5",
      "description": "Initialize the Cytation5 reader before starting",
      "validation": {
        "deviceId": "cytation5",
        "deviceType": "cytation",
        "initMode": "soft",
        "timeoutS": 30,
        "retryCount": 2
      }
    },
    {
      "id": "2", 
      "name": "Transfer Reagent",
      "type": "string",
      "required": true,
      "description": "Transfer liquid between containers",
      "validation": {
        "sourceContainer": "stock_A",
        "targetContainer": "reactor_tube", 
        "volumeMl": 0.5,
        "speedUlPerS": 300,
        "pipetteType": "single",
        "mixAfter": true
      }
    }
  ],
  "createdAt": "2023-12-21T10:30:56.789Z",
  "version": "1.0.0"
}
```

## ✅ 确认结果

**您的架构设计完全正确！** 

1. ✅ **模块 Schema 存储**: 每个模块都有完整的参数定义
2. ✅ **前端动态渲染**: 根据模块类型加载对应的配置界面
3. ✅ **JSON 动态生成**: 拖拽结果可以动态调整生成的 JSON 文件
4. ✅ **字段类型支持**: 支持 string、float、int、enum、boolean 等类型
5. ✅ **Schema 驱动**: 整个系统是 schema 驱动的，便于扩展和维护

这种设计使得添加新的工作流模块变得非常简单，只需要在组件库中定义新的模块 schema 即可。
