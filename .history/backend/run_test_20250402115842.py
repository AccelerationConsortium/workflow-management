import asyncio
import yaml
from runner.run_from_config import ConfigRunner
from executors.python_executor import PythonExecutor
from registry.executor_registry import ExecutorRegistry

async def main():
    # 创建运行器
    runner = ConfigRunner()
    
    # 注册Python执行器
    registry = ExecutorRegistry()
    registry.register_executor("python", PythonExecutor)
    
    # 加载测试配置
    with open("config/test_workflow.yaml", "r") as f:
        workflow_config = yaml.safe_load(f)
    
    try:
        # 运行工作流
        results = await runner.run_workflow(workflow_config)
        
        # 打印结果
        print("\nWorkflow Results:")
        for result in results:
            print(f"Task {result.task_id}: {result.status.value}")
            if result.result is not None:
                print(f"Result: {result.result}")
            if result.error is not None:
                print(f"Error: {result.error}")
            print("---")
    
    finally:
        # 清理资源
        await runner.cleanup()

if __name__ == "__main__":
    asyncio.run(main()) 
