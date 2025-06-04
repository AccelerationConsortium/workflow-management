#!/usr/bin/env python3
"""
BO 推荐系统启动脚本

用于启动和管理 BO 推荐系统服务
"""

import asyncio
import argparse
import logging
import signal
import sys
from pathlib import Path

from recommendationListener import start_bo_listener, stop_bo_listener, get_listener


# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bo_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class BOServiceManager:
    """BO 服务管理器"""
    
    def __init__(self, db_path: str = "bo_recommendations.duckdb", polling_interval: int = 30):
        self.db_path = db_path
        self.polling_interval = polling_interval
        self.running = False
        self._shutdown_event = asyncio.Event()
    
    async def start(self):
        """启动 BO 服务"""
        logger.info("Starting BO recommendation service...")
        
        try:
            # 设置信号处理
            self._setup_signal_handlers()
            
            # 启动监听器
            self.running = True
            listener_task = asyncio.create_task(
                start_bo_listener(self.db_path, self.polling_interval)
            )
            
            logger.info(f"BO service started with DB: {self.db_path}, interval: {self.polling_interval}s")
            
            # 等待关闭信号
            await self._shutdown_event.wait()
            
            # 停止监听器
            logger.info("Stopping BO service...")
            await stop_bo_listener()
            
            # 等待监听器任务完成
            try:
                await asyncio.wait_for(listener_task, timeout=10)
            except asyncio.TimeoutError:
                logger.warning("Listener task did not complete within timeout, cancelling...")
                listener_task.cancel()
                try:
                    await listener_task
                except asyncio.CancelledError:
                    pass
            
            logger.info("BO service stopped")
            
        except Exception as e:
            logger.error(f"Error in BO service: {e}")
            raise
        finally:
            self.running = False
    
    def _setup_signal_handlers(self):
        """设置信号处理器"""
        def signal_handler(signum, frame):
            logger.info(f"Received signal {signum}, initiating shutdown...")
            self._shutdown_event.set()
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def status(self):
        """获取服务状态"""
        try:
            listener = get_listener()
            status = listener.get_status()
            
            print("BO 推荐系统状态:")
            print(f"  运行状态: {'运行中' if status['is_running'] else '已停止'}")
            print(f"  数据库路径: {status['db_path']}")
            print(f"  轮询间隔: {status['polling_interval']}秒")
            print(f"  待处理推荐: {status['pending_count']}个")
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get status: {e}")
            print(f"获取状态失败: {e}")
            return None
    
    async def trigger(self):
        """手动触发推荐处理"""
        try:
            listener = get_listener()
            result = await listener.manual_trigger()
            
            if result["success"]:
                print("手动触发成功")
                print(f"处理时间: {result['timestamp']}")
            else:
                print(f"手动触发失败: {result.get('error', '未知错误')}")
            
            return result
            
        except Exception as e:
            logger.error(f"Manual trigger failed: {e}")
            print(f"手动触发失败: {e}")
            return {"success": False, "error": str(e)}


async def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="BO 推荐系统服务管理")
    parser.add_argument(
        "command",
        choices=["start", "status", "trigger", "test"],
        help="要执行的命令"
    )
    parser.add_argument(
        "--db-path",
        default="bo_recommendations.duckdb",
        help="DuckDB 数据库文件路径 (默认: bo_recommendations.duckdb)"
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=30,
        help="轮询间隔秒数 (默认: 30)"
    )
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        default="INFO",
        help="日志级别 (默认: INFO)"
    )
    
    args = parser.parse_args()
    
    # 设置日志级别
    logging.getLogger().setLevel(getattr(logging, args.log_level))
    
    # 创建服务管理器
    service_manager = BOServiceManager(args.db_path, args.interval)
    
    try:
        if args.command == "start":
            await service_manager.start()
            
        elif args.command == "status":
            await service_manager.status()
            
        elif args.command == "trigger":
            await service_manager.trigger()
            
        elif args.command == "test":
            # 运行测试
            from test_bo_system import main as test_main
            success = await test_main()
            sys.exit(0 if success else 1)
            
    except KeyboardInterrupt:
        logger.info("Service interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Service error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
