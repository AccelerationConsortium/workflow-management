Canvas端接入North-Canvas系统开发清单
📋 Canvas端需要开发的功能模块
1. North-Canvas连接配置模块
1.1 连接配置界面
配置页面 (src/components/settings/NorthCanvasConfig.vue)
North-Canvas API服务器地址配置 (默认: http://localhost:5000)
连接超时设置
重试次数配置
连接状态显示 (在线/离线)
连接测试按钮
1.2 连接管理服务
API连接服务 (src/services/northCanvasApi.js)
class NorthCanvasAPI {
  constructor(baseUrl = 'http://localhost:5000') {}
  
  // 基础连接方法
  async testConnection()
  async getHealth()
  
  // 工作流管理
  async submitWorkflow(workflowData, priority = 'NORMAL')
  async getWorkflowStatus(workflowId)
  async listWorkflows(filters = {})
  async cancelWorkflow(workflowId)
  
  // 队列管理
  async getQueueStatus()
  async setSchedulingPolicy(policy)
  
  // 硬件监控
  async getHardwareStatus()
  
  // 实时更新
  setupEventStream(onUpdate)
}


2. 工作流JSON生成模块
2.1 JSON转换器
Canvas到North-Canvas转换器 (src/services/workflowConverter.js)
class WorkflowConverter {
  // 将Canvas工作流转换为North-Canvas JSON格式
  convertCanvasToNorthCanvas(canvasWorkflow) {
    return {
      workflow_id: generateUniqueId(),
      name: canvasWorkflow.name,
      description: canvasWorkflow.description,
      hardware_config: this.mapHardwareConfig(canvasWorkflow),
      parameters: this.extractParameters(canvasWorkflow),
      vial_status_file: this.getVialStatusFile(canvasWorkflow),
      steps: this.convertSteps(canvasWorkflow.steps),
      output: this.generateOutputConfig(canvasWorkflow)
    }
  }
  
  // 映射Canvas步骤到North-Canvas步骤
  convertSteps(canvasSteps) {}
  
  // 提取可配置参数
  extractParameters(canvasWorkflow) {}
  
  // 映射硬件配置
  mapHardwareConfig(canvasWorkflow) {}
}
2.2 步骤类型映射
步骤映射配置 (src/config/stepMapping.js)
export const STEP_TYPE_MAPPING = {
  // Canvas步骤类型 -> North-Canvas步骤类型
  'robot_move': 'move_vial',
  'liquid_transfer': 'liquid_transfer',
  'measurement': 'measure_wellplate',
  'wait': 'wait',
  'user_input': 'user_confirmation',
  'photoreactor': 'photoreactor_control',
  // ... 更多映射
}

export const PARAMETER_MAPPING = {
  // Canvas参数名 -> North-Canvas参数名
  'volume': 'volume',
  'source_vial': 'source',
  'target_vial': 'destination',
  // ... 更多映射
}
3. 工作流执行控制模块
3.1 执行控制界面
工作流执行面板 (src/components/workflow/ExecutionPanel.vue)
执行按钮 (提交到North-Canvas)
优先级选择 (LOW, NORMAL, HIGH, URGENT)
执行模式选择 (实际执行/模拟模式)
参数覆盖输入框
执行状态显示
3.2 执行管理服务
执行管理器 (src/services/executionManager.js)
class ExecutionManager {
  // 提交工作流执行
  async executeWorkflow(canvasWorkflow, options = {}) {
    const northCanvasWorkflow = converter.convertCanvasToNorthCanvas(canvasWorkflow)
    const result = await api.submitWorkflow(northCanvasWorkflow, options.priority)
    return result.workflow_id
  }
  
  // 监控执行状态
  async monitorExecution(workflowId, onUpdate) {}
  
  // 取消执行
  async cancelExecution(workflowId) {}
}
4. 实时状态监控模块
4.1 状态监控界面
实时状态面板 (src/components/monitoring/StatusPanel.vue)
工作流整体进度条
当前执行步骤显示
步骤列表与状态指示器
预计剩余时间
错误和警告显示
4.2 硬件状态监控
硬件状态组件 (src/components/monitoring/HardwareStatus.vue)
机器人状态指示器 (空闲/忙碌/错误)
Cytation状态显示
光反应器状态显示
轨道系统状态
最后更新时间
4.3 实时更新服务
状态更新服务 (src/services/statusMonitor.js)
class StatusMonitor {
  constructor(api) {
    this.api = api
    this.subscribers = new Map()
  }
  
  // 订阅工作流状态更新
  subscribeToWorkflow(workflowId, callback) {}
  
  // 订阅硬件状态更新
  subscribeToHardware(callback) {}
  
  // 启动实时监控
  startMonitoring() {
    // 使用Server-Sent Events或轮询
    this.api.setupEventStream(this.handleStatusUpdate.bind(this))
  }
  
  handleStatusUpdate(event) {}
}
5. 队列管理模块
5.1 队列监控界面
队列状态面板 (src/components/queue/QueuePanel.vue)
队列中的工作流列表
每个工作流的优先级显示
预计执行时间
队列统计信息 (总数/已完成/失败)
调度策略显示和修改
5.2 队列管理服务
队列管理器 (src/services/queueManager.js)
class QueueManager {
  // 获取队列状态
  async getQueueStatus() {}
  
  // 修改调度策略
  async setSchedulingPolicy(policy) {}
  
  // 取消队列中的工作流
  async cancelQueuedWorkflow(workflowId) {}
  
  // 修改工作流优先级
  async changeWorkflowPriority(workflowId, newPriority) {}
}
6. 历史记录和日志模块
6.1 执行历史界面
执行历史页面 (src/views/ExecutionHistory.vue)
已完成工作流列表
执行时间和持续时间
成功/失败状态
详细日志查看
搜索和过滤功能
6.2 日志查看器
日志查看组件 (src/components/logs/LogViewer.vue)
实时日志流显示
日志级别过滤 (INFO/WARNING/ERROR)
日志搜索功能
日志导出功能
7. 用户界面集成
7.1 主界面集成
工作流设计器增强 (src/components/workflow/WorkflowDesigner.vue)
添加"执行"按钮到工具栏
集成执行状态显示
添加North-Canvas特定的步骤类型
参数验证和提示
7.2 导航和菜单
导航菜单更新 (src/components/layout/Navigation.vue)
添加"执行监控"菜单项
添加"队列管理"菜单项
添加"硬件状态"菜单项
添加"执行历史"菜单项
7.3 状态指示器
全局状态栏 (src/components/layout/StatusBar.vue)
North-Canvas连接状态指示器
当前执行工作流数量
队列中工作流数量
硬件整体状态指示器
8. 配置和设置模块
8.1 North-Canvas设置
设置页面扩展 (src/views/Settings.vue)
North-Canvas服务器配置
默认执行参数设置
监控刷新频率设置
通知设置 (执行完成/错误通知)
8.2 工作流模板
模板管理 (src/components/templates/TemplateManager.vue)
预定义工作流模板
模板参数配置
模板验证和测试
模板导入/导出
9. 错误处理和通知
9.1 错误处理
错误处理服务 (src/services/errorHandler.js)
class ErrorHandler {
  // 处理API连接错误
  handleConnectionError(error) {}
  
  // 处理工作流执行错误
  handleExecutionError(workflowId, error) {}
  
  // 显示用户友好的错误消息
  showUserError(message, details) {}
}
9.2 通知系统
通知组件 (src/components/notifications/NotificationCenter.vue)
执行完成通知
错误和警告通知
队列状态变化通知
硬件状态变化通知
10. 测试和验证
10.1 单元测试
API服务测试 (tests/unit/services/northCanvasApi.spec.js)
工作流转换器测试 (tests/unit/services/workflowConverter.spec.js)
执行管理器测试 (tests/unit/services/executionManager.spec.js)
10.2 集成测试
端到端测试 (tests/e2e/northCanvasIntegration.spec.js)
工作流提交到执行完成的完整流程
错误处理和恢复测试
实时监控功能测试


🔧 技术实现建议
1. 状态管理 (Vuex/Pinia)
// store/modules/northCanvas.js
export const northCanvasModule = {
  state: {
    connectionStatus: 'disconnected',
    currentExecutions: [],
    queueStatus: {},
    hardwareStatus: {},
    executionHistory: []
  },
  
  mutations: {
    SET_CONNECTION_STATUS(state, status) {},
    UPDATE_EXECUTION_STATUS(state, { workflowId, status }) {},
    UPDATE_QUEUE_STATUS(state, queueStatus) {},
    UPDATE_HARDWARE_STATUS(state, hardwareStatus) {}
  },
  
  actions: {
    async connectToNorthCanvas({ commit }) {},
    async submitWorkflow({ commit }, { workflow, options }) {},
    async monitorExecution({ commit }, workflowId) {}
  }
}
2. 实时更新策略
使用Server-Sent Events (SSE) 进行实时状态更新
备用轮询机制 (每5秒) 当SSE不可用时
WebSocket连接作为未来增强选项
3. 错误处理策略
网络错误自动重试 (指数退避)
用户友好的错误消息显示
详细错误日志记录
离线模式支持 (缓存操作)
4. 性能优化
状态更新防抖 (避免过频繁更新UI)
大型工作流的分页加载
图标和状态的缓存
懒加载非关键组件
📅 开发优先级建议
Phase 1 (核心功能)
North-Canvas API连接服务
工作流JSON转换器
基础执行控制
简单状态监控
Phase 2 (增强功能)
实时状态更新
队列管理界面
硬件状态监控
错误处理和通知
Phase 3 (高级功能)
执行历史和日志
工作流模板管理
高级监控和分析
性能优化

基于当前测试结果，Canvas端应该按以下优先级开发：

🚀 Priority 1 (立即开始)
North-Canvas API连接服务 (src/services/northCanvasApi.js)
工作流JSON转换器 (src/services/workflowConverter.js)
基础执行控制界面 (src/components/workflow/ExecutionPanel.vue)
🔥 Priority 2 (第二周)
实时状态监控 (src/components/monitoring/StatusPanel.vue)
队列管理界面 (src/components/queue/QueuePanel.vue)
硬件状态显示 (src/components/monitoring/HardwareStatus.vue)
⭐ Priority 3 (第三周)
执行历史和日志 (src/views/ExecutionHistory.vue)
错误处理和通知 (src/services/errorHandler.js)
高级监控功能
🔧 立即可用的功能
当前可以在Canvas中集成的功能：
工作流提交: 通过POST /api/workflows提交工作流
状态查询: 通过GET /api/workflows/<id>获取执行状态
队列监控: 通过GET /api/queue监控队列状态
硬件监控: 通过GET /api/hardware获取硬件状态
示例Canvas集成代码：
// 在Canvas中提交工作流
async function submitWorkflow(canvasWorkflow) {
  const northCanvasWorkflow = convertCanvasToNorthCanvas(canvasWorkflow);
  
  const response = await fetch('http://localhost:5000/api/workflows', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(northCanvasWorkflow)
  });
  
  return response.json();
}

// 监控工作流状态
async function monitorWorkflow(workflowId) {
  const response = await fetch(`http://localhost:5000/api/workflows/${workflowId}`);
  const status = await response.json();
  
  // 更新Canvas UI
  updateProgressBar(status.progress.percentage);
  updateCurrentStep(status.current_step);
  updateHardwareStatus(status.hardware_status);
}