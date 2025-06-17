面向 各类机械臂平台的抽象 UO 类型。这也是构建一个 可扩展实验自动化系统 的关键原则。

⸻

✅ 一、设计“通用机械臂类 UO”的动机

原因	说明
实验室中可能存在多种机械臂品牌（UR、Dobot、Kinova等）	硬件不同，但动作逻辑类似
Canvas 要统一调度和管理不同硬件	必须从“功能行为”角度抽象 UO
降低耦合，便于未来扩展或硬件替换	代码层适配器替换，无需改 UI/UO 结构


⸻

🧩 二、推荐的通用“机械臂 UO”分类与定义（可逐步拓展）

通用 UO 名称	功能描述	适配 UR / Dobot / Kinova	备注
RobotMoveTo	移动到某坐标，支持直线/关节模式	✅	含位置、姿态、速度等参数
RobotPick	抓取动作，可能包括夹爪控制或吸附	✅	夹爪类型参数化
RobotPlace	放置动作，夹爪释放	✅	同上
RobotHome	回原点	✅	兼容不同home设定
RobotExecuteSequence	执行预定义的动作序列脚本	✅	可引用外部定义
RobotWait / Sync	等待某事件或信号	✅	可用于同步液体处理等
RobotIfCondition	条件判断，用于后续条件分支（未来拓展）	🚧	需硬件反馈机制


⸻

✅ 三、具体设计建议（面向注册与拖拽界面）

每个“通用机械臂 UO”组件应包含：
	•	通用字段：
	•	robot_type（UR3e / Dobot / Generic）
	•	operation_type（move/pick/place/home）
	•	parameters（坐标、速度、动作名等）
	•	内部调用逻辑：
	•	通过 LCP（Lab Communication Protocol）或插件后端适配具体品牌命令
	•	Canvas前端展示：
	•	拖拽后显示“动作类型 + 参数填写表单”
	•	后端自动翻译为具体设备调用

⸻

🚀 举例：RobotMoveTo 的 Canvas UO Schema

{
  "uo_name": "RobotMoveTo",
  "description": "Move robotic arm to a specified position.",
  "category": "robotic-arm",
  "fields": [
    { "name": "x", "type": "number", "unit": "mm" },
    { "name": "y", "type": "number", "unit": "mm" },
    { "name": "z", "type": "number", "unit": "mm" },
    { "name": "rx", "type": "number", "unit": "deg" },
    { "name": "ry", "type": "number", "unit": "deg" },
    { "name": "rz", "type": "number", "unit": "deg" },
    { "name": "speed", "type": "number", "unit": "mm/s", "default": 100 },
    { "name": "robot_type", "type": "select", "options": ["UR3e", "Dobot", "Kinova"] }
  ]
}

如果你决定使用 robot_type 参数，则可以为后端提供适配层来翻译每种机械臂的命令。

⸻

✅ 总结建议

项目	建议
是否通用设计？	✅ 是的，建议直接设计为“robotic-arm类”UO
是否现在就建新组件？	✅ 建议先建 RobotMoveTo / RobotPick / RobotPlace 三个
命名建议	使用 RobotXxx 而不是 UR3eXxx，统一命名空间
是否允许未来扩展？	✅ 可以再加 RobotExecuteScript, RobotIfCondition 等
是否后端需适配？	✅ 后端需实现 robot_type → device_adapter 的映射
