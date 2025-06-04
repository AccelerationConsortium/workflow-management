# BO 推荐系统集成

本模块实现了 Bayesian Optimization（BO）推荐系统与 Canvas 工作流系统的集成，能够自动将 BO 生成的推荐参数转化为实验任务并执行。

## 🏗️ 系统架构

```
BO 推荐系统
    ↓
DuckDB 数据库 (recommendations 表)
    ↓
推荐监听器 (recommendationListener.py)
    ↓
参数映射器 (boToUoMapper.py)
    ↓
实验任务创建器 (createExperimentTask.py)
    ↓
Canvas 工作流执行系统
```

## 📁 文件结构

```
backend/services/bo/
├── __init__.py                     # 模块初始化
├── recommendationListener.py       # BO 推荐监听器
├── boToUoMapper.py                # BO 到 UO 参数映射
├── createExperimentTask.py        # 实验任务创建
├── api.py                         # REST API 接口
├── start_bo_service.py            # 服务启动脚本
├── test_bo_system.py              # 系统测试脚本
├── config/
│   └── bo_uo_mapping_config.json  # 参数映射配置
└── README.md                      # 本文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装 Python 依赖
pip install duckdb>=0.9.0 fastapi>=0.100.0 uvicorn>=0.23.0

# 或者使用项目的 setup.py
pip install -e .
```

### 2. 启动 BO 服务

```bash
# 启动服务（默认配置）
python backend/services/bo/start_bo_service.py start

# 自定义配置启动
python backend/services/bo/start_bo_service.py start \
    --db-path /path/to/bo_recommendations.duckdb \
    --interval 60 \
    --log-level INFO
```

### 3. 检查服务状态

```bash
# 查看服务状态
python backend/services/bo/start_bo_service.py status

# 手动触发推荐处理
python backend/services/bo/start_bo_service.py trigger
```

### 4. 运行测试

```bash
# 运行完整测试套件
python backend/services/bo/start_bo_service.py test

# 或直接运行测试脚本
python backend/services/bo/test_bo_system.py
```

## 🔧 配置说明

### 数据库配置

系统使用 DuckDB 作为推荐数据存储，会自动创建以下表结构：

```sql
CREATE TABLE recommendations (
    id VARCHAR PRIMARY KEY,
    round INTEGER NOT NULL,
    flow_rate DOUBLE NOT NULL,
    powder_type VARCHAR NOT NULL,
    volume DOUBLE NOT NULL,
    temperature DOUBLE,
    pressure DOUBLE,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    metadata JSON
);
```

### 参数映射配置

参数映射配置文件 `config/bo_uo_mapping_config.json` 定义了如何将 BO 推荐参数映射到 UO 参数：

```json
{
  "dispense_powder": {
    "template": {
      "unit_operation": "dispense_powder",
      "category": "material_handling",
      "description": "Dispense powder material"
    },
    "parameter_mappings": [
      {
        "bo_field": "flow_rate",
        "uo_parameter": "flow_rate",
        "unit_conversion": 1.0,
        "validation_range": [0.1, 100.0],
        "required": true
      }
    ]
  }
}
```

## 📡 API 接口

### 启动/停止监听器

```bash
# 启动监听器
curl -X POST "http://localhost:8000/api/bo/start" \
  -H "Content-Type: application/json" \
  -d '{"db_path": "bo_recommendations.duckdb", "polling_interval": 30}'

# 停止监听器
curl -X POST "http://localhost:8000/api/bo/stop"
```

### 查看状态

```bash
# 监听器状态
curl "http://localhost:8000/api/bo/status"

# 实验列表
curl "http://localhost:8000/api/bo/experiments"

# 推荐记录
curl "http://localhost:8000/api/bo/recommendations"
```

### 手动操作

```bash
# 手动触发推荐处理
curl -X POST "http://localhost:8000/api/bo/trigger"

# 创建测试推荐
curl -X POST "http://localhost:8000/api/bo/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "round": 1,
    "flow_rate": 5.5,
    "powder_type": "catalyst_A",
    "volume": 25.0,
    "temperature": 50.0,
    "pressure": 1.2
  }'
```

## 🔄 工作流程

### 1. BO 推荐生成

外部 BO 系统将推荐参数插入到 DuckDB 数据库的 `recommendations` 表中：

```python
import duckdb

conn = duckdb.connect("bo_recommendations.duckdb")
conn.execute("""
    INSERT INTO recommendations (
        id, round, flow_rate, powder_type, volume, 
        temperature, pressure, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
""", [recommendation_id, round_num, flow_rate, powder_type, 
      volume, temperature, pressure])
conn.close()
```

### 2. 自动监听和处理

监听器定期轮询数据库，发现新的 `pending` 推荐后：

1. **参数映射**：将 BO 推荐参数映射为 UO 配置
2. **任务创建**：生成 Canvas 工作流配置
3. **执行提交**：提交到工作流执行系统
4. **状态更新**：标记推荐为 `processed`

### 3. 实验执行

生成的实验任务会自动在 Canvas 系统中执行，包括：

- 设备控制
- 参数监控
- 结果收集
- 状态反馈

## 🎛️ 前端控制面板

使用 `src/components/BOControlPanel.tsx` 组件可以在前端管理 BO 系统：

```tsx
import BOControlPanel from './components/BOControlPanel';

// 在应用中使用
<BOControlPanel />
```

控制面板功能：
- 启动/停止监听器
- 查看监听器状态
- 管理实验任务
- 查看推荐记录
- 创建测试推荐

## 🧪 测试和调试

### 运行测试

```bash
# 完整测试套件
python backend/services/bo/test_bo_system.py

# 单独测试组件
python -c "
import asyncio
from backend.services.bo.test_bo_system import test_parameter_mapping
asyncio.run(test_parameter_mapping())
"
```

### 调试模式

```bash
# 启用调试日志
python backend/services/bo/start_bo_service.py start --log-level DEBUG

# 短间隔测试
python backend/services/bo/start_bo_service.py start --interval 5
```

### 常见问题

1. **数据库连接失败**
   - 检查 DuckDB 文件路径和权限
   - 确保目录存在且可写

2. **推荐处理失败**
   - 检查参数映射配置
   - 验证 BO 推荐数据格式

3. **实验创建失败**
   - 检查工作流执行器状态
   - 验证 UO 配置格式

## 🔧 扩展和定制

### 添加新的 UO 类型

1. 在 `config/bo_uo_mapping_config.json` 中添加新的映射配置
2. 更新 `boToUoMapper.py` 中的 `_determine_uo_type` 方法
3. 测试新的映射规则

### 自定义参数映射

```python
from backend.services.bo.boToUoMapper import BOToUOMapper

mapper = BOToUOMapper()
mapper.add_custom_mapping(
    uo_type="custom_operation",
    template={
        "unit_operation": "custom_operation",
        "category": "custom",
        "description": "Custom operation"
    },
    mappings=[
        {
            "bo_field": "custom_param",
            "uo_parameter": "target_param",
            "unit_conversion": 2.0,
            "required": True
        }
    ]
)
```

### 集成外部 BO 系统

1. 实现数据接口将 BO 推荐写入 DuckDB
2. 配置推荐数据格式和字段映射
3. 设置适当的轮询间隔
4. 实现结果回传机制（可选）

## 📊 监控和日志

### 日志文件

- `bo_service.log`：服务运行日志
- `workflow.log`：工作流执行日志

### 监控指标

- 推荐处理成功率
- 实验执行状态
- 系统响应时间
- 错误率统计

## 🚀 部署建议

### 生产环境

1. 使用专用数据库路径
2. 配置适当的轮询间隔（建议 30-60 秒）
3. 启用日志轮转
4. 设置监控和告警
5. 配置自动重启机制

### 高可用性

1. 使用共享存储的数据库
2. 部署多个监听器实例（注意避免重复处理）
3. 实现健康检查端点
4. 配置负载均衡

---

## 📞 支持

如有问题或建议，请联系开发团队或提交 Issue。
