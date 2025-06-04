# UO Builder 窗口大小调整修复

## 🎯 问题描述

用户反馈："Create & Register Unit Operation"窗口被右上角的BO Control Panel等元素遮挡，需要将窗口缩小到2/3大小并靠近左侧。

## 🔧 修复方案

### 1. 调整Dialog窗口大小和位置

**文件**: `src/components/UOBuilder/UOBuilderModal.tsx`

**修改前**:
```tsx
<Dialog
  open={open}
  onClose={onClose}
  maxWidth={false}
  fullScreen
  PaperProps={{
    sx: {
      height: '100vh',
      maxHeight: '100vh'
    }
  }}
>
```

**修改后**:
```tsx
<Dialog
  open={open}
  onClose={onClose}
  maxWidth={false}
  PaperProps={{
    sx: {
      width: '66.67vw', // 2/3 of viewport width
      height: '90vh',   // 90% of viewport height for better visibility
      maxWidth: '66.67vw',
      maxHeight: '90vh',
      margin: 0,
      marginLeft: '2vw', // Position towards left side
      marginTop: '5vh',  // Center vertically with some top margin
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
    }
  }}
  sx={{
    '& .MuiDialog-container': {
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    }
  }}
>
```

### 2. 调整内部容器高度

**文件**: `src/components/UOBuilder/StructuredUOBuilder.tsx`

**修改前**:
```tsx
<Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
```

**修改后**:
```tsx
<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
```

## 📐 新的窗口规格

### 尺寸设置
- **宽度**: 66.67vw (视口宽度的2/3)
- **高度**: 90vh (视口高度的90%)
- **最大宽度**: 66.67vw
- **最大高度**: 90vh

### 位置设置
- **左边距**: 2vw (靠近左侧)
- **上边距**: 5vh (垂直居中，留出顶部空间)
- **对齐方式**: flex-start (左上角对齐)

### 视觉效果
- **圆角**: 12px
- **阴影**: 0 8px 32px rgba(0,0,0,0.12)
- **边距**: 0 (移除默认边距)

## 🎯 解决的问题

1. **避免遮挡**: 窗口不再占据全屏，为右上角的BO Control Panel等元素留出空间
2. **合适大小**: 2/3宽度提供足够的工作空间，同时不会过于拥挤
3. **左侧对齐**: 窗口靠近左侧，符合用户的视觉习惯
4. **响应式**: 使用vw/vh单位，在不同屏幕尺寸下都能保持合适的比例

## 🔍 测试验证

### 验证步骤
1. 点击"Create & Register UO"按钮
2. 确认窗口大小为屏幕的2/3宽度
3. 确认窗口位置靠近左侧
4. 确认右上角的BO Control Panel等元素不被遮挡
5. 确认窗口内容正常显示和滚动

### 预期效果
- ✅ 窗口大小适中，不会过大或过小
- ✅ 窗口位置合理，不遮挡其他UI元素
- ✅ 内容布局正常，所有功能可正常使用
- ✅ 在不同屏幕尺寸下都能正常显示

## 🎉 修复完成

现在UO Builder窗口已经调整为合适的大小和位置，用户可以在不被其他UI元素遮挡的情况下正常使用所有功能。窗口的2/3宽度设计既提供了足够的工作空间，又为其他界面元素留出了充足的空间。
