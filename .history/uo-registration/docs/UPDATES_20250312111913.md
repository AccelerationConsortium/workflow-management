# UO Registration System - Updates

## 2023-11-15: UO 类型和列表页面更新

### 新增功能和改进

1. **类型定义改进**
   - 重新设计了 `UnitOperation` 类型系统
   - 添加了 `UnitOperationStatus` 和 `UnitOperationCategory` 枚举
   - 改进了参数定义，增加了 `UnitOperationParameter` 和 `UnitOperationParameterValue` 类型
   - 更新了通用UO和特定UO的接口定义，增加了更多属性

2. **API 服务改进**
   - 增加了新的 API 方法，支持按类型和实验室筛选
   - 实现了特定 UO 和通用 UO 的分离查询
   - 改进了参数处理和数据转换
   - 添加了实验室服务的模拟实现

3. **UI 组件改进**
   - 更新通用 UO 列表页面
     - 添加状态显示，使用彩色 Chip 组件
     - 改进了表格布局和响应式设计
     - 增加了通知系统，提供操作反馈
     - 优化了操作按钮的布局和交互
   
   - 更新特定 UO 列表页面
     - 重构页面以匹配更新的类型定义
     - 添加按实验室筛选功能
     - 改进了搜索功能，支持多字段搜索
     - 增加了删除操作的实现

4. **实用工具函数**
   - 创建了日期格式化工具
   - 添加了数字格式化工具
   - 添加了文本截断工具函数

### Bug 修复

1. 修复了类型引用错误
2. 修复了 API 参数不一致的问题
3. 改进了错误处理和用户反馈

### 待办事项

1. 实现通用 UO 和特定 UO 的详情页面
2. 实现通用 UO 和特定 UO 的编辑页面
3. 完善创建特定 UO 的表单，支持从通用 UO 派生
4. 添加实际的后端 API 实现，替换模拟数据
5. 添加用户认证和授权功能

## Update Log: 2023-09-23

### Type Definitions

- Redesigned `UnitOperation` type system to better distinguish between generic and specific UOs
- Added `UnitOperationStatus` and `UnitOperationCategory` enums for better code readability
- Added `UnitOperationSubCategory` enum for more detailed classification 
- Added `Laboratory` enum to define different laboratory identifiers (SDL1 to SDL6)
- Added `ParameterDirection` enum to specify input/output parameters
- Added `TechnicalSpecifications` interface for capacity, temperatures, etc.
- Added `WorkflowCompatibility` interface for workflow integration

### Forms and UI Components

- Created comprehensive `GenericUnitOperationForm` component with:
  - Tab-based interface for organizing different aspects of UO information
  - Basic information section for name, status, description, category, and lab selection
  - Technical specifications section for capacity and operating conditions
  - Dynamic Input/Output parameter management with type selection
  - Inheritance & composition section for parent/child relationships
  - Workflow compatibility section
  - Documentation section for additional technical information
- Implemented validation using Yup and React Hook Form
- Added support for dynamic field arrays for parameters

### API Services

- Introduced mock data service for frontend development and testing
- Added laboratory service interfaces
- Implemented filters for UOs by type, laboratory, and category
- Split generic and specific UO queries

### Utility Functions

- Created date formatting functions
- Added number formatting utilities
- Implemented text truncation helpers

### Bug Fixes

- Fixed type reference errors
- Improved error handling
- Enhanced user feedback mechanisms

### Pending Tasks

- Complete implementation of UO details page
- Implement edit functionality for specific UOs
- Connect form submission to backend API
- Add file upload capability for documentation
- Implement sub-unit operations selection interface 
