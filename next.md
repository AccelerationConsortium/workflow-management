# 下一个阶段的开发计划

⚠️ 1. 实际 LLM 集成（从 mock 转为生产）

实施计划：
	1.	模型选型（如你现在用的是 Qwen，可继续用）：
	•	可用模型：
	•	Qwen API（官方）
	•	OpenAI GPT-4/3.5
	•	Claude
	•	自部署：如 Llama2, Mistral via vLLM
	•	推荐：Qwen-72B-Chat（若中文为主）
	2.	API 接入：
	•	建议封装一层 LLMClient 类，如：

class QwenClient:
    def __init__(self, api_key: str): ...
    def chat(self, prompt: str) -> str: ...


	3.	Prompt 设计与模板优化（从 utils/prompts.py 抽象化）
	4.	冷启动策略：
	•	对用户指令预处理（标准化+结构抽取）后再送入 LLM
	•	设置 prompt token 限制 + fallback 模板（避免异常响应）

⸻

⚠️ 2. 高级参数关联（参数之间的联动关系）

举例场景：
	•	“加热到80°C，持续30分钟” → heating_temp = 80, heating_time = 30；
	•	“在倒入A之前搅拌B三分钟” → 参数之间存在逻辑依赖；

实施方案：
	1.	为每个 UO 参数建立 schema 定义，标注参数间依赖：

{
  "operation": "stir",
  "params": {
    "duration": {"type": "int", "unit": "min"},
    "dependent_on": "add_B"
  }
}


	2.	在生成 JSON 的过程中，增加参数绑定检查器：
	•	如果用户语句中提到“之后”或“完成后”，自动补充依赖字段
	3.	LLM prompt 示例：
“User wants: First add 2ml A, then stir B for 3 minutes. Please return a workflow JSON with step dependency between the two operations.”

⸻

❌ 3. 用户反馈循环（Human-in-the-loop）

你目前的状态：
	•	用户说出一句话，系统生成完整流程；
	•	没有提供“修改建议”、“评分”、“手动调整后的结构反馈”的通道。

实施建议：
	1.	前端集成一个“反馈面板”：
	•	用户可点击每个 UO 节点 → 编辑参数 → 评价系统推荐；
	•	保存这些修改历史（通过 Memory Agent 或 logs）；
	2.	后端添加用户评分记录结构：

{
  "session_id": "abc123",
  "node": "heating",
  "user_feedback": "temperature too high",
  "final_value": 70
}


	3.	将用户反馈作为 future prompt 的 few-shot 记忆，加入 Agent 的上下文。

⸻

⚠️ 4. 前端集成完善

建议步骤：
	1.	已生成 JSON → 立即展示在画布上（已有）；
	2.	增加“自然语言指令面板”：
	•	输入框+执行按钮；
	•	提示词模版支持（如“我想…”）
	3.	增加对话历史/推荐记录面板
	4.	可视化每个节点背后的 LLM reasoning（透明化 AI agent 行为）

⸻

✅ 总结：实施优先顺序建议

优先级	模块	原因
⭐⭐⭐⭐	LLM API 实际部署	关键闭环，mock 模式不能 scale
⭐⭐⭐⭐	高级参数结构支持	增强智能程度，支持复杂实验设计
⭐⭐⭐	前端集成自然语言入口	提升用户体验和真实交互感
⭐⭐	用户反馈机制	非 MVP 必须，但对于系统学习非常关键
⭐	多语言支持	适配需求为主，可后期补充


