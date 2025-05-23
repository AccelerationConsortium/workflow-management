# UO注册流程修复说明

## 🔧 问题诊断

### 原始问题
用户创建了一个名为"test"的自定义UO，类别为"custom"，但保存后没有出现在右侧sidebar中。

### 根本原因
1. **服务连接断开**：新的`StructuredUOBuilder`没有连接到`customUOService`
2. **Schema格式不匹配**：生成的schema格式与`customUOService`期望的格式不一致
3. **参数类型映射错误**：新的组件类型没有正确映射到参数类型

## ✅ 修复方案

### 1. **连接customUOService**
**文件**: `src/components/UOBuilder/UOBuilderModal.tsx`

```tsx
// 添加导入
import { customUOService } from '../../services/customUOService';

// 修复保存逻辑
onSave={async (uoData) => {
  // Register with the custom UO service (this updates the sidebar)
  const result = customUOService.registerUO(uoData.schema);
  // ...
}}
```

### 2. **修复Schema生成**
**文件**: `src/components/UOBuilder/StructuredUOBuilder.tsx`

```tsx
// 新增正确的Schema生成函数
const generateUOSchema = () => {
  const parameters = parameterSlots
    .filter(slot => slot.component)
    .map(slot => ({
      id: slot.id,
      name: slot.config.label || `Parameter ${slot.slotNumber}`,
      type: getParameterTypeFromComponent(slot.component!.type),
      required: slot.config.required || false,
      defaultValue: slot.config.defaultValue,
      unit: slot.config.unit,
      description: slot.config.tooltip || slot.component!.description,
      validation: {
        min: slot.config.min,
        max: slot.config.max,
        options: slot.config.options
      }
    }));

  return {
    id: `custom_uo_${Date.now()}`,
    name: state.name,
    description: state.description,
    category: state.category,
    parameters,
    createdAt: new Date().toISOString(),
    version: '1.0.0'
  };
};
```

### 3. **组件类型映射**
```tsx
const getParameterTypeFromComponent = (componentType: string) => {
  switch (componentType) {
    case 'VOLUME_INPUT':
    case 'CONCENTRATION_INPUT':
    case 'TIME_INPUT':
    case 'TEMPERATURE_INPUT':
      return 'number';
    case 'MATERIAL_SELECT':
    case 'CONTAINER_SELECT':
    case 'BUFFER_SELECT':
      return 'enum';
    case 'ENABLE_TOGGLE':
      return 'boolean';
    case 'TEXT_NOTE':
      return 'string';
    default:
      return 'string';
  }
};
```

## 🔄 完整注册流程

### 步骤1: 用户创建UO
1. 点击"Create & Register UO"按钮
2. 填写UO基本信息（名称、描述、类别）
3. 拖拽参数组件到插槽中
4. 配置每个参数的属性

### 步骤2: 保存和注册
1. 点击"Save & Register"按钮
2. `StructuredUOBuilder.generateUOSchema()` 生成标准schema
3. `UOBuilderModal` 调用 `customUOService.registerUO(schema)`
4. `customUOService` 验证并保存到localStorage
5. `customUOService` 通知所有监听器（包括Sidebar）

### 步骤3: Sidebar更新
1. `Sidebar` 组件通过 `customUOService.subscribe()` 监听变化
2. 收到通知后，`Sidebar` 重新渲染，显示新的自定义UO
3. 新UO出现在对应的类别下

## 🧪 测试验证

### 测试步骤
1. 打开应用，点击"Create & Register UO"
2. 填写信息：
   - Name: "Test UO"
   - Description: "A test unit operation"
   - Category: "Custom"
3. 点击"Load Example"加载示例参数
4. 点击"Save & Register"
5. 检查右侧Sidebar的"Custom"类别

### 预期结果
- ✅ 保存成功，无错误提示
- ✅ Modal自动关闭
- ✅ Sidebar中出现"Test UO"在"Custom"类别下
- ✅ 可以拖拽新UO到画布上

## 📋 数据流图

```
用户操作 → StructuredUOBuilder → UOBuilderModal → customUOService → Sidebar
    ↓              ↓                    ↓               ↓              ↓
  填写表单      生成Schema           调用注册         保存到localStorage   更新显示
  拖拽组件      验证数据             处理结果         通知监听器         重新渲染
```

## 🔍 调试信息

### 检查localStorage
```javascript
// 在浏览器Console中运行
console.log(localStorage.getItem('custom_unit_operations'));
```

### 检查customUOService状态
```javascript
// 在浏览器Console中运行
import { customUOService } from './src/services/customUOService';
console.log(customUOService.getCustomUONodes());
```

## 🎯 关键修复点

1. **服务集成**: 确保StructuredUOBuilder使用customUOService
2. **Schema格式**: 生成符合GeneratedUOSchema接口的数据
3. **类型映射**: 正确映射组件类型到参数类型
4. **监听机制**: 利用customUOService的订阅机制更新Sidebar

现在用户创建的自定义UO应该能够正确出现在Sidebar中了！
