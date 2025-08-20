# EIS分析组件集成指南

## 概述

EIS（电化学阻抗谱）分析组件是一个专门用于科学实验工作流系统的高级数据分析单元操作，支持异步操作、REST API通信和嵌入式可视化。

## 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端React组件   │    │   后端API服务    │    │ Hugging Face    │
│   EISAnalysisNode │ -> │ eis_analysis_api │ -> │   EIS Analyzer  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         v                        v                        v
   用户界面交互           API路由和任务管理         实际EIS数据分析
```

## 主要特性

### 1. 用户界面特性
- **状态指示器**: 显示分析的实时状态（待运行/运行中/完成/错误）
- **嵌入式可视化**: 使用iframe显示来自Hugging Face的交互式图表
- **关键指标显示**: Rct（电荷转移电阻）、CE（库仑效率）、综合评分
- **进度跟踪**: 实时进度条和状态更新
- **文件自动检测**: 自动发现工作流中的ac_*.csv和dc_*.csv文件

### 2. 技术特性
- **异步处理**: 完全异步的分析流程，不阻塞UI
- **REST API集成**: 与Hugging Face Spaces的无缝通信
- **错误处理**: 完善的错误处理和重试机制
- **状态持久化**: 分析状态可保存和恢复
- **工作流集成**: 标准的输入/输出端口支持

## 文件结构

```
src/components/OperationNodes/
├── EISAnalysisNode.tsx          # React组件（主要UI）
├── EISAnalysisUnit.py           # PyQt5组件（桌面版）
└── AutoEISNode.tsx              # AutoEIS组件（对比参考）

src/services/
├── eisAnalysisService.ts        # 分析服务类
└── customUOService.ts           # 自定义UO服务

backend/api/
└── eis_analysis_api.py          # 后端API路由

docs/
└── EIS_ANALYSIS_INTEGRATION_GUIDE.md  # 本文档
```

## API接口规范

### 1. 提交分析任务

**端点**: `POST /api/eis/analyze`

**请求格式**: `multipart/form-data`

**参数**:
- `ac_file`: AC阻抗数据文件（CSV格式）
- `dc_file`: DC阻抗数据文件（可选）
- `node_id`: 节点ID
- `workflow_id`: 工作流ID
- `api_endpoint`: Hugging Face Space API端点
- `api_key`: API密钥（可选）
- `circuit_model`: 电路模型（auto/randles/custom）
- `fitting_algorithm`: 拟合算法（lm/trf/differential-evolution）
- `max_iterations`: 最大迭代次数

**响应**:
```json
{
  "task_id": "uuid-string",
  "status": "running",
  "progress": 10,
  "message": "Task created",
  "created_at": "2024-01-20T10:30:00Z",
  "updated_at": "2024-01-20T10:30:00Z"
}
```

### 2. 查询任务状态

**端点**: `GET /api/eis/status/{task_id}`

**响应**:
```json
{
  "task_id": "uuid-string",
  "status": "completed",
  "progress": 100,
  "message": "Analysis completed",
  "result": {
    "rct": 45.3,
    "coulombic_efficiency": 0.85,
    "overall_score": 82.5,
    "circuit_model": "R0-(R1||C1)",
    "fit_quality": 0.95,
    "visualization_url": "https://huggingface.co/.../visualize/task_id"
  }
}
```

### 3. 取消任务

**端点**: `DELETE /api/eis/tasks/{task_id}`

## Hugging Face Space集成

### 1. Space要求

您的Hugging Face Space需要提供以下API端点：

- `POST /analyze` - 接收分析请求
- `GET /status/{task_id}` - 查询分析状态
- `GET /visualize/{task_id}` - 显示可视化结果

### 2. 数据格式

**输入数据格式**:
```csv
frequency,z_real,z_imag
10000,100.5,-25.3
5000,120.1,-35.7
...
```

**分析结果格式**:
```json
{
  "rct": 45.3,
  "coulombic_efficiency": 0.85,
  "overall_score": 82.5,
  "circuit_model": "R0-(R1||C1)",
  "fit_quality": 0.95,
  "metadata": {
    "analysis_time": 12.5,
    "data_points": 1000,
    "frequency_range": [0.1, 100000]
  }
}
```

### 3. 回调机制（可选）

如果Space支持回调，可以在分析完成时主动通知：

**回调端点**: `POST /api/eis/callback/{task_id}`

**回调数据**:
```json
{
  "status": "completed",
  "result": { ... },
  "timestamp": "2024-01-20T10:45:00Z"
}
```

## 使用示例

### 1. React组件使用

```tsx
import { EISAnalysisNode } from './components/OperationNodes/EISAnalysisNode';

// 在工作流Canvas中使用
<EISAnalysisNode
  data={{
    id: 'eis_node_1',
    type: 'eisAnalysis',
    label: 'EIS Analysis',
    apiEndpoint: 'https://huggingface.co/spaces/YOUR_SPACE/eis-analyzer/api',
    apiKey: 'your-api-key',
    autoDetectFiles: true,
    onDataChange: (data) => console.log('Node data changed:', data)
  }}
  selected={false}
  id="eis_node_1"
/>
```

### 2. 服务类使用

```typescript
import { eisAnalysisService } from './services/eisAnalysisService';

// 提交分析任务
const task = await eisAnalysisService.submitAnalysis(
  'node_id',
  'workflow_id',
  {
    acFile: 'path/to/ac_data.csv',
    dcFile: 'path/to/dc_data.csv'
  },
  {
    circuitModel: 'auto',
    fittingAlgorithm: 'levenberg-marquardt'
  }
);

// 监听任务完成
eisAnalysisService.on('taskCompleted', (task) => {
  console.log('Analysis completed:', task.result);
});
```

### 3. PyQt5组件使用

```python
from components.OperationNodes.EISAnalysisUnit import EISUnitOperation

# 创建EIS分析组件
eis_unit = EISUnitOperation()

# 连接信号
eis_unit.analysis_completed.connect(
    lambda result: print(f"Analysis completed: {result}")
)

# 添加到布局
layout.addWidget(eis_unit)
```

## 配置和部署

### 1. 环境变量

```bash
# React应用
REACT_APP_EIS_API_ENDPOINT=https://huggingface.co/spaces/YOUR_SPACE/eis-analyzer/api
REACT_APP_EIS_API_KEY=your-api-key

# 后端API
EIS_API_ENDPOINT=https://huggingface.co/spaces/YOUR_SPACE/eis-analyzer/api
EIS_API_KEY=your-api-key
API_BASE_URL=https://your-workflow-system.com
```

### 2. 依赖安装

**前端依赖**:
```json
{
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "reactflow": "^11.x"
}
```

**后端依赖**:
```txt
fastapi>=0.68.0
aiohttp>=3.8.0
pydantic>=1.8.0
```

**PyQt5依赖**:
```txt
PyQt5>=5.15.0
PyQtWebEngine>=5.15.0
aiohttp>=3.8.0
```

### 3. 后端集成

在主FastAPI应用中注册路由器：

```python
from backend.api.eis_analysis_api import router as eis_router

app = FastAPI()
app.include_router(eis_router)

# 启动清理任务
@app.on_event("startup")
async def startup_event():
    from backend.api.eis_analysis_api import start_cleanup_scheduler
    asyncio.create_task(start_cleanup_scheduler())
```

## 错误处理

### 1. 常见错误类型

- **文件格式错误**: CSV文件格式不正确
- **网络超时**: 与Hugging Face Space通信超时
- **API限制**: API调用频率限制或配额用完
- **分析失败**: 数据质量问题或分析算法失败

### 2. 错误恢复策略

- **自动重试**: 网络错误时自动重试3次
- **降级处理**: API不可用时提供基本分析功能
- **用户通知**: 清晰的错误消息和建议操作

## 性能优化

### 1. 前端优化

- **懒加载**: 可视化组件按需加载
- **缓存**: 分析结果本地缓存
- **防抖**: API调用防抖处理

### 2. 后端优化

- **连接池**: HTTP连接复用
- **任务队列**: 大量任务时的队列管理
- **资源清理**: 定期清理过期任务

## 测试和验证

### 1. 单元测试

```typescript
// 服务类测试
describe('EISAnalysisService', () => {
  test('should submit analysis task', async () => {
    const service = new EISAnalysisService();
    const task = await service.submitAnalysis(/* ... */);
    expect(task.status).toBe('pending');
  });
});
```

### 2. 集成测试

```python
# API端点测试
def test_analyze_endpoint():
    response = client.post('/api/eis/analyze', files={...})
    assert response.status_code == 200
    assert 'task_id' in response.json()
```

## 故障排除

### 1. 常见问题

**问题**: 分析任务一直处于pending状态
**解决**: 检查Hugging Face Space是否正常运行，API密钥是否正确

**问题**: 可视化无法显示
**解决**: 检查iframe的CORS设置，确保visualization_url可访问

**问题**: 文件检测失败
**解决**: 确保工作流目录权限正确，文件命名符合规范

### 2. 调试技巧

- 启用详细日志记录
- 使用浏览器开发工具检查网络请求
- 检查Hugging Face Space的运行日志

## 扩展和自定义

### 1. 添加新的分析参数

在`EISAnalysisNode.tsx`中添加新的UI控件，在API中添加相应的参数处理。

### 2. 支持更多数据格式

扩展文件检测和上传逻辑，支持Excel、HDF5等格式。

### 3. 自定义可视化

实现自定义的图表组件，减少对外部服务的依赖。

## 维护和监控

### 1. 日志记录

所有关键操作都有详细的日志记录，便于问题诊断。

### 2. 性能监控

监控API响应时间、成功率、错误率等关键指标。

### 3. 版本控制

组件支持版本标识，便于升级和回滚。

## 总结

EIS分析组件提供了完整的电化学阻抗谱数据分析解决方案，集成了现代Web技术和科学计算服务。通过合理的架构设计和丰富的功能特性，能够满足科学实验工作流的复杂需求。