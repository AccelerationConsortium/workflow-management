# UO注册功能测试指南

## 🚀 快速测试步骤

### 1. **访问应用**
- 打开浏览器，访问：http://localhost:5175/
- 确保页面正常加载，没有Console错误

### 2. **打开UO Builder**
- 在主界面工具栏中找到 **"Create & Register UO"** 按钮
- 点击按钮，应该打开全屏的UO Builder界面

### 3. **创建测试UO**
填写基本信息：
- **UO Name**: `Test UO`
- **Description**: `A test unit operation for validation`
- **Category**: 选择 `Custom`

### 4. **加载示例参数**
- 点击 **"Load Example"** 按钮
- 界面应该自动填充10个参数插槽，包括：
  - Metal Salt Type (选择器)
  - Metal Salt Volume (体积输入)
  - Metal Salt Concentration (浓度输入)
  - Ligand Type (选择器)
  - 等等...

### 5. **保存并注册**
- 点击 **"Save & Register"** 按钮
- 应该看到成功提示
- Modal应该在2秒后自动关闭

### 6. **验证Sidebar更新**
- 回到主界面
- 查看右侧Sidebar
- 在 **"Custom"** 类别下应该看到新创建的 **"Test UO"**

## ✅ 预期结果

### 成功指标：
1. ✅ UO Builder正常打开，无Console错误
2. ✅ 可以填写基本信息
3. ✅ "Load Example"功能正常工作
4. ✅ 参数插槽显示正确的单位选项
5. ✅ 保存成功，无错误提示
6. ✅ Sidebar中出现新的自定义UO
7. ✅ 可以拖拽新UO到画布上

### 数据验证：
```javascript
// 在浏览器Console中检查localStorage
console.log(localStorage.getItem('custom_unit_operations'));

// 应该看到类似这样的JSON数据：
{
  "custom_uo_1234567890": {
    "id": "custom_uo_1234567890",
    "name": "Test UO",
    "description": "A test unit operation for validation",
    "category": "Custom",
    "parameters": [...],
    "createdAt": "2024-01-20T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## 🐛 故障排除

### 问题1: UO Builder不打开
**解决方案**：
- 检查Console是否有JavaScript错误
- 确保所有文件都已保存
- 刷新页面重试

### 问题2: 保存后Sidebar没有更新
**解决方案**：
- 检查localStorage中是否有数据
- 确认类别名称是否正确
- 检查customUOService是否正常工作

### 问题3: 参数单位显示错误
**解决方案**：
- 检查getUnitOptions函数是否正确映射
- 确认组件类型是否正确

### 问题4: Console错误
**解决方案**：
- 检查是否有重复的import语句
- 确认所有依赖都已正确导入
- 重启开发服务器

## 📋 测试清单

- [ ] 页面正常加载
- [ ] UO Builder正常打开
- [ ] 基本信息可以填写
- [ ] Load Example功能正常
- [ ] 参数插槽工作正常
- [ ] 单位选择器显示正确选项
- [ ] 保存功能正常
- [ ] Sidebar更新正常
- [ ] 新UO可以拖拽使用
- [ ] localStorage数据正确

## 🎯 下一步计划

完成基础测试后，可以考虑：

1. **后端集成**：将localStorage替换为API调用
2. **文件生成**：自动生成UO组件文件
3. **系统注册**：集成到现有的节点注册系统
4. **高级功能**：添加更多参数类型和验证规则

现在请按照上述步骤测试UO注册功能！
