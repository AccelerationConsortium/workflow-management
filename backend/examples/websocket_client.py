import asyncio
import websockets
import json

async def subscribe_to_workflow(run_id: str):
    """订阅工作流状态更新"""
    uri = f"ws://localhost:8000/ws/{run_id}"
    
    async with websockets.connect(uri) as websocket:
        print(f"Connected to workflow {run_id}")
        
        try:
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                print(f"Received update: {json.dumps(data, indent=2)}")
                
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")

async def main():
    # 替换为实际的 run_id
    run_id = "98742a9e-a870-4fc7-a4f3-72acd014d351"
    await subscribe_to_workflow(run_id)

if __name__ == "__main__":
    asyncio.run(main()) 
