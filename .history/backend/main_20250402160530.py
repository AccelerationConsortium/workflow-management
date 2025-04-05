import uvicorn
import logging
import os
from api.workflow_api import app

# 配置日志
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, 'workflow.log')),
        logging.StreamHandler()
    ]
)

if __name__ == "__main__":
    uvicorn.run(
        "api.workflow_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 
