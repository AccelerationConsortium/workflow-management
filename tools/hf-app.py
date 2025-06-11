# app.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn
import os
import json
import logging
from collections import defaultdict, deque
from datetime import datetime

from dispatch import ExperimentDispatcher
from gradio import Interface

# ====== 初始化 FastAPI ======
app = FastAPI(
    title="Canvas Workflow Backend",
    description="Receives workflow JSON and dispatches experiments",
    version="2.0.0"
)

# ====== 启用日志 ======
logger = logging.getLogger("canvas_backend")
logging.basicConfig(level=logging.INFO)

# ====== 启用跨域 CORS ======
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== 初始化调度器 ======
dispatcher = ExperimentDispatcher()

# ====== 根路径 ======
@app.get("/", response_class=HTMLResponse)
async def index():
    return """
    <h2>Canvas Workflow Backend</h2>
    <p>POST to <code>/run_experiment</code> with full workflow JSON.</p>
    """

# ====== 健康检查 ======
@app.get("/health")
async def health():
    return {"status": "ok", "message": "API is healthy"}

# ====== 执行完整工作流 ======
@app.post("/run_experiment")
async def run_workflow(request: Request):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file_path = f"logs/workflow_{timestamp}.log"
    os.makedirs("logs", exist_ok=True)

    def log_step(message):
        with open(log_file_path, "a") as f:
            f.write(f"{datetime.now().isoformat()} - {message}\n")
        logger.info(message)

    try:
        data = await request.json()
        nodes = data.get("nodes")
        edges = data.get("edges")
        global_config = data.get("global_config", {})
    except Exception as e:
        log_step(f"Invalid JSON: {e}")
        return JSONResponse(status_code=400, content={"status": "error", "message": f"Invalid JSON: {e}"})

    if not nodes or not edges:
        log_step("Missing nodes or edges")
        return JSONResponse(status_code=422, content={"status": "error", "message": "Missing nodes or edges in workflow"})

    try:
        # 拓扑排序
        graph = defaultdict(list)
        indegree = defaultdict(int)
        node_map = {node["id"]: node for node in nodes}

        for edge in edges:
            graph[edge["source"]].append(edge["target"])
            indegree[edge["target"]] += 1

        queue = deque([nid for nid in node_map if indegree[nid] == 0])
        execution_order = []

        while queue:
            nid = queue.popleft()
            execution_order.append(nid)
            for neighbor in graph[nid]:
                indegree[neighbor] -= 1
                if indegree[neighbor] == 0:
                    queue.append(neighbor)

        log_step(f"Execution order: {execution_order}")

        results = []
        step_count = len(execution_order)

        for idx, nid in enumerate(execution_order):
            node = node_map[nid]
            uo_data = {
                "uo_type": node["type"],
                "parameters": node["params"],
                "global_config": global_config
            }
            step_label = f"Step {idx+1}/{step_count}: {node['label']} ({node['type']})"
            log_step(f"\n--- {step_label} ---")

            try:
                result = dispatcher.execute_experiment(uo_data)
                result["step_index"] = idx + 1
                result["label"] = node["label"]
                result["status"] = result.get("status", "success")
                log_step(f"Execution complete: {result['status']}")
            except Exception as e:
                result = {
                    "step_index": idx + 1,
                    "label": node["label"],
                    "status": "error",
                    "message": str(e)
                }
                log_step(f"Error in step: {str(e)}")

            results.append(result)

        overall_status = "success" if all(r["status"] == "success" for r in results) else "partial_failure"
        return {
            "status": overall_status,
            "results": results,
            "execution_order": execution_order,
            "log_file": log_file_path
        }

    except Exception as e:
        log_step(f"Unexpected error: {str(e)}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# ====== 防止 Hugging Face 休眠 ======
def greet(uo_type):
    return f"POST workflow JSON to /run_experiment."

demo = Interface(fn=greet, inputs="text", outputs="text", title="Canvas Backend")

if __name__ == "__main__":
    if os.environ.get("SPACE_AUTHOR_NAME"):
        demo.launch(share=False)
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)
