
🧠 1. 设计原则

✅ 聚合语义相关的 primitive

以用户实验的直觉步骤为单位，例如“完成一次HPLC检测”不只是 run_hplc，还包含 sample_aliquot, weigh_container 等。

✅ 包含硬件状态预检查和容错机制

Unit Operation 中可以内嵌设备检查逻辑或 fallback，比如缺少样本时直接报错。

✅ 封装参数模版 + 提示

UO 要设置默认参数组和可视化提示，便于科学家在 Canvas 上快速拖拽使用。

✅ 抽象物理概念而非机械动作

UO 命名应偏向“做什么实验”而非“移动哪个 vial”。

⸻

🛠️ 2. 建议创建的 Unit Operation 示例

🧪 UO1：Prepare and Inject HPLC Sample

步骤组合：
	•	sample_aliquot
	•	weigh_container
	•	run_hplc

UO 功能描述：

从指定源取样，称重，注入到HPLC进行检测。

参数抽象：

{
  "source": "reaction_tray_A1",
  "dest_vial": "hplc_P2_B1",
  "aliquot_volume_ul": 100,
  "inj_vol": 5,
  "hplc_method": "standard_curve_01"
}


⸻

💧 UO2：Run Extraction and Transfer to HPLC

步骤组合：
	•	run_extraction
	•	extraction_vial_from_reactor
	•	sample_aliquot（可选）
	•	run_hplc

UO 功能描述：

运行萃取后自动完成样品转移并运行HPLC检测。

⸻

🧰 UO3：Deck Initialization

步骤组合：
	•	initialize_deck
	•	hplc_instrument_setup

功能：

初始化所有设备，为实验做准备。适合放在 Canvas 工作流开头自动调用。

⸻

📦 UO4：Add Solvent to Sample Vial

步骤组合：
	•	add_solvent
	•	weigh_container（可选）

⸻

📐 3. Canvas 中如何结构化显示这些 UO

每个 UO 节点可以包含以下结构：

字段	内容
名称	e.g. “Run HPLC Sample”
描述	完整描述其功能与依赖的设备
输入参数	来自上游节点（如 vial 名、method）或用户填写
输出	数据路径、HPLC结果等
失败处理	e.g. 如果没有 vial，是否继续或报错


⸻

✨ Bonus：为科学家定制 Super-UO

比如 Full Extraction & Quantification 一键完成从反应结束到数据分析，底层可能组合 6–8 个 primitive。但上层只显示为 1 个块，让非程序用户更直觉地组合流程。

⸻

这个开发计划非常清晰且有远见，展现出你对 Canvas 系统模块化架构的深入理解和推进 SDL7 工作流标准化的决心。从系统设计和用户体验角度来看，它在多个方面都做得很好，下面是我的分析和一些优化建议：



✨ 我建议你增加/优化的几点

✳️ 1. 更强的类型化定义（types.ts）

你可以为每个 UO 的参数定义 interface，以增强类型推导和 IDE 支持。例如：

export interface PrepareAndInjectHPLCSampleParams {
  source_tray: string;
  source_vial: string;
  aliquot_volume_ul: number;
  perform_weighing?: boolean;
  sample_name?: string;
  hplc_method: string;
  injection_volume: number;
}

这样也便于后续自动生成表单或导出 JSON。

⸻

✳️ 2. 每个 UO 带有执行预览功能（optional）

在 BaseUONode 中加入“预览执行步骤”的功能，可以让用户展开看到它会依次执行哪些 primitive，有助于 debug 和 trust-building。

<ExecutionPreview
  steps={[
    "sample_aliquot",
    "weigh_container (if enabled)",
    "run_hplc"
  ]}
/>


⸻

✳️ 3. 引入 meta.json 来定义 UO metadata

比如你可以在每个 UO 的目录中加入 meta.json 或 meta.ts：

{
  "label": "Prepare and Inject HPLC Sample",
  "description": "Takes sample from source tray and vial, weighs it, and runs HPLC",
  "primitives": ["sample_aliquot", "weigh_container", "run_hplc"],
  "color": "#6AA6D6"
}

这将来可以用于：
	•	自动生成节点 label / tooltip
	•	Canvas 上的主题色注册
	•	文档自动生成

⸻

✳️ 4. 加入条件执行与断点支持

例如 perform_weighing 可以作为一个 condition，在 JSON 输出中表现为：

{
  "type": "weigh_container",
  "condition": "perform_weighing == true",
  ...
}

这样未来支持更复杂的逻辑分支或动态工作流。

⸻

✳️ 5. 后端 provenance 追踪建议
	•	记录每个 UO 拆解成的 primitive 执行 ID（如 trace_id、parent_uo_id）
	•	可以在 UI 上呈现哪个 UO 的哪些步骤出现失败
	•	有利于未来实现自动 retry 某个 primitive 而不重复整个 UO


📌 你可以继续优化的方向

✳️ 1. 加入 Execution Flow 描述（用于 JSON 输出）

meta.ts 中可以加入：

export const executionSteps = [
  { primitive: "run_extraction", condition: true },
  { primitive: "extraction_vial_from_reactor" },
  { primitive: "sample_aliquot", params: { dest_tray: "hplc" } },
  { primitive: "run_hplc" }
];

这样后端可以直接调用 executor 拆解结构。

⸻

✳️ 2. 组件间加强复用（例如参数表单模板）

例如你可以定义：
	•	AliquotFormGroup
	•	HPLCMethodGroup
	•	ExtractionParamsGroup

在 BaseUO.tsx 中使用 props 注入就能快速复用这些字段块。

⸻

✳️ 3. 未来加入“UO嵌套”机制（高级功能）

比如允许一个 UO 中调用另一个 UO（不是 primitive），实现高级嵌套控制。

目前JSON 输出结构 只是节点级别的“表层抽象”，并没有反映出 Unit Operation (UO) 的内部执行逻辑（即 primitive 步骤），也无法直接交由 executor 执行。这是个“UI级结构”，而不是“执行级结构”。

🧠 当前 JSON 存在的问题（或说局限）

{
  "type": "sdl7PrepareAndInjectHPLCSample",
  "params": {}
}

这只是说明了“这是一个叫 PrepareAndInjectHPLCSample 的高层 UO”，没有展开出：
	•	对应的 primitive 调用列表
	•	参数如何映射到 primitive
	•	执行顺序
	•	错误处理 / 条件逻辑
	•	是否为模拟运行、是否需要 weigh 等

⸻

✅ 理想中 executor 要吃的结构，应该长这样（示例）

{
  "execution": [
    {
      "type": "sample_aliquot",
      "params": {
        "source_tray": "Reaction Tray",
        "source_vial": "A1",
        "dest_tray": "HPLC Tray",
        "dest_vial": "A1",
        "aliquot_volume_ul": 100
      },
      "uo": "sdl7PrepareAndInjectHPLCSample"
    },
    {
      "type": "weigh_container",
      "params": {
        "vial": "A1",
        "tray": "HPLC Tray",
        "sample_name": "Sample_001"
      },
      "uo": "sdl7PrepareAndInjectHPLCSample",
      "condition": "perform_weighing == true"
    },
    {
      "type": "run_hplc",
      "params": {
        "method": "Standard Curve 01",
        "vial": "A1",
        "vial_hplc_location": "P2-B1",
        "inj_vol": 5
      },
      "uo": "sdl7PrepareAndInjectHPLCSample"
    }
  ]
}


⸻

🛠 如何解决这个脱节问题

你需要在导出 JSON 的阶段 引入一个“UO 展开层（UO expander）”，它会将每个节点如 sdl7RunExtractionAndTransferToHPLC 映射为对应 primitive 步骤序列。

方法：后端解析器负责展开

在 backend executor 层（比如 sdl_catalyst_executor.py）写一个 dispatcher：

def resolve_uo_to_primitives(uo_type: str, params: dict):
    if uo_type == "sdl7RunExtractionAndTransferToHPLC":
        return [
            {"type": "run_extraction", "params": extract_extraction_params(params)},
            {"type": "extraction_vial_from_reactor", "params": {...}},
            ...
        ]

这样你保留了前端的高层抽象，执行时再细化逻辑。

⸻

✨ Bonus：让 meta.ts 参与解析

你已经在每个 UO 目录下写了 meta.ts，可以定义一个类似：

export const executionPlan = [
  { primitive: "sample_aliquot", paramMap: mapAliquotParams },
  { primitive: "weigh_container", paramMap: mapWeighParams, condition: "perform_weighing" },
  ...
]

后端或前端均可读取它作为展开模板。

⸻

✅ 总结

问题	当前输出 JSON 只是节点图，不能执行
应该输出什么	拆解后的 primitive 执行序列（带参数）
解决方案	在导出时加入“UO → Primitive 展开”逻辑
推荐做法	后端 executor 中使用 dispatcher 或查表展开
加强方式	每个 meta.ts 提供 primitive 映射与 paramMap 函数
