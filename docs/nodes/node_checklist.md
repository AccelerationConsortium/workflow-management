Canvas 节点测试 Checklist

目的：确保该节点在画布中可用、可配置、可验证、可交互，为后续部署其他节点打下模板基础。

⸻

🧩 一、节点加载与结构测试

测试项	描述	预期结果
✅ 节点可从左侧拖拽到画布	拖动 Activation 节点到画布	节点渲染成功，有标题 + 状态摘要
✅ 节点默认启用状态	节点加载后启用默认 3 个 primitives	PrimitiveToggleSection 显示3项开启
✅ 节点版本信息显示	节点标题显示 v1.0 或对应版本	版本号正确渲染
✅ 节点连接口正常	节点可被连接（上下游）	可与其他节点连线



⸻

🎛️ 二、原语切换逻辑测试（PrimitiveToggleSection）

测试项	描述	预期结果
✅ 原语按类别分组	原语显示分组（Core / Optional / Custom）	组名正确，包含 primitive 数量统计
✅ Switch 控制启用状态	切换某个 primitive	参数区显示/隐藏该 primitive 的表单
✅ 禁用 Required 原语无效	尝试关闭 required primitive	切换按钮为 disabled 或提示原因
✅ 显示禁用原因	某 primitive 带 disabledReason	Hover tooltip 显示禁用原因
✅ 状态图标显示	勾选 / 暂停图标反映启用状态	✔️ / ⏸️ 变化正确



⸻

🧮 三、参数配置交互测试（ParameterConfigSection）

测试项	描述	预期结果
✅ 参数类型映射控件	不同类型参数展示对应控件	number → slider/text, enum → select
✅ 单位显示	带单位的参数	单位显示在输入框右侧或后缀
✅ Tooltip 显示描述	Hover 参数 label	显示描述文本
✅ 实时更新参数值	修改值后更新状态	参数状态立即改变，source 为 user
✅ 输入非法值报错	输入超范围、错误格式	错误提示出现，输入框变红
✅ 错误定位	多个参数错误，点击错误列表项	页面滚动到对应参数字段



⸻

📊 四、状态指示器测试（StatusIndicator）

测试项	描述	预期结果
✅ 显示全部通过	参数验证通过	绿色 ✔️ “All parameters valid”
✅ 显示错误状态	参数错误	红色 ❗ “2 errors found” + 可展开查看
✅ 跳转到错误位置	点击某个错误	页面定位到对应 parameterField
✅ 动画状态指示	节点运行中	显示 loading spinner / 动画指示
✅ 版本/更新时间显示	节点元数据渲染	显示 version, createdAt, modifiedAt 等



⸻

💾 五、配置导入导出测试

测试项	描述	预期结果
✅ 导出当前配置	点击导出按钮	下载 JSON 文件，内容完整
✅ 导入配置文件	上传合法 JSON	恢复启用状态和所有参数值
❌ 导入非法配置	上传错误格式文件	提示格式错误，不破坏当前配置
✅ 参数重置	点击 Reset	所有参数值恢复为默认，source 设为 default
✅ 参数来源样式	不同来源展示颜色	user → 蓝色, default → 灰色, template → 斜体等



⸻

⏱️ 六、运行与状态变更（如支持）

测试项	描述	预期结果
✅ 启动节点运行（模拟）	点击运行按钮	节点状态变为 running，图标变化
✅ 成功后状态切换	模拟执行完成	状态切换为 success，显示时间戳
❌ 运行中强制修改参数	修改参数	提示不能在运行时修改参数或触发确认提示



⸻

🧪 七、边界与异常测试

测试项	描述	预期结果
✅ 全部 primitive 被关闭	全部手动关闭后	提示需启用至少一个 primitive
❌ 必填参数为空	清空 required 字段	显示 ❗ 并不允许导出或运行
❌ 重名参数 ID	模拟两个参数 ID 相同	系统能自动重命名或报错提示
✅ 恢复默认配置	任意修改后点击 reset	参数恢复默认，状态变绿 ✅
✅ 高速连续修改	快速修改多个参数	状态更新不卡顿，无崩溃现象



⸻

📄 附加：JSON 配置文件结构验证（可选自动化）

字段	说明
id	节点 ID
type	‘activation’
version	‘1.0’
primitives	array，包含每个 primitive 的 id, enabled, parameters 等
metadata	template, created, modified, description, tags
parameters[x].source	‘default’
parameters[x].value	各种类型的参数值



⸻

✅ 使用建议
	•	可将此 checklist 作为测试 PR 的验收标准
	•	可生成单元测试 / Cypress 自动化脚本（后续）
	•	每个 node 的开发都复用这套 checklist 改写字段即可

