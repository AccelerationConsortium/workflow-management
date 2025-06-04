"""
BO 推荐系统监听器模块

功能：
- 监听 DuckDB 数据库中 recommendations 表的变化
- 定时轮询获取新的推荐点
- 判断是否有新的推荐点需要注入实验流程
"""

import asyncio
import logging
import duckdb
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from pathlib import Path

from boToUoMapper import BOToUOMapper
from createExperimentTask import ExperimentTaskCreator

logger = logging.getLogger(__name__)


@dataclass
class BORecommendation:
    """BO 推荐点数据结构"""
    id: str
    round: int
    flow_rate: float
    powder_type: str
    volume: float
    temperature: Optional[float] = None
    pressure: Optional[float] = None
    status: str = 'pending'
    created_at: datetime = None
    processed_at: Optional[datetime] = None


class RecommendationListener:
    """BO 推荐监听器"""

    def __init__(
        self,
        db_path: str = "bo_recommendations.duckdb",
        polling_interval: int = 30,
        auto_start: bool = False
    ):
        """
        初始化监听器

        Args:
            db_path: DuckDB 数据库文件路径
            polling_interval: 轮询间隔（秒）
            auto_start: 是否自动启动监听
        """
        self.db_path = db_path
        self.polling_interval = polling_interval
        self.is_running = False
        self._stop_event = asyncio.Event()

        # 初始化依赖组件
        self.mapper = BOToUOMapper()
        self.task_creator = ExperimentTaskCreator()

        # 确保数据库表存在
        self._ensure_database_schema()

        if auto_start:
            asyncio.create_task(self.start_listening())

    def _ensure_database_schema(self):
        """确保数据库表结构存在"""
        try:
            conn = duckdb.connect(self.db_path)

            # 创建 recommendations 表
            conn.execute("""
                CREATE TABLE IF NOT EXISTS recommendations (
                    id VARCHAR PRIMARY KEY,
                    round INTEGER NOT NULL,
                    flow_rate DOUBLE NOT NULL,
                    powder_type VARCHAR NOT NULL,
                    volume DOUBLE NOT NULL,
                    temperature DOUBLE,
                    pressure DOUBLE,
                    status VARCHAR DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP,
                    metadata JSON
                )
            """)

            # 创建索引
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_recommendations_status
                ON recommendations(status)
            """)

            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_recommendations_created_at
                ON recommendations(created_at)
            """)

            conn.close()
            logger.info("Database schema initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize database schema: {e}")
            raise

    async def start_listening(self):
        """启动监听器"""
        if self.is_running:
            logger.warning("Listener is already running")
            return

        self.is_running = True
        self._stop_event.clear()

        logger.info(f"Starting BO recommendation listener with {self.polling_interval}s interval")

        try:
            while self.is_running and not self._stop_event.is_set():
                await self._poll_recommendations()

                # 等待下一次轮询或停止信号
                try:
                    await asyncio.wait_for(
                        self._stop_event.wait(),
                        timeout=self.polling_interval
                    )
                    break  # 收到停止信号
                except asyncio.TimeoutError:
                    continue  # 超时，继续下一次轮询

        except Exception as e:
            logger.error(f"Error in recommendation listener: {e}")
            raise
        finally:
            self.is_running = False
            logger.info("BO recommendation listener stopped")

    async def stop_listening(self):
        """停止监听器"""
        if not self.is_running:
            logger.warning("Listener is not running")
            return

        logger.info("Stopping BO recommendation listener...")
        self.is_running = False
        self._stop_event.set()

    async def _poll_recommendations(self):
        """轮询推荐点"""
        try:
            # 获取未处理的推荐点
            pending_recommendations = self._get_pending_recommendations()

            if not pending_recommendations:
                logger.debug("No pending recommendations found")
                return

            logger.info(f"Found {len(pending_recommendations)} pending recommendations")

            # 处理每个推荐点
            for recommendation in pending_recommendations:
                try:
                    await self._process_recommendation(recommendation)
                except Exception as e:
                    logger.error(f"Failed to process recommendation {recommendation.id}: {e}")
                    # 标记为失败但继续处理其他推荐
                    self._mark_recommendation_failed(recommendation.id, str(e))

        except Exception as e:
            logger.error(f"Error polling recommendations: {e}")

    def _get_pending_recommendations(self) -> List[BORecommendation]:
        """获取待处理的推荐点"""
        try:
            conn = duckdb.connect(self.db_path)

            # 查询未处理的推荐点，按创建时间排序
            result = conn.execute("""
                SELECT id, round, flow_rate, powder_type, volume,
                       temperature, pressure, status, created_at, processed_at
                FROM recommendations
                WHERE status = 'pending'
                ORDER BY created_at ASC
                LIMIT 10
            """).fetchall()

            conn.close()

            recommendations = []
            for row in result:
                recommendations.append(BORecommendation(
                    id=row[0],
                    round=row[1],
                    flow_rate=row[2],
                    powder_type=row[3],
                    volume=row[4],
                    temperature=row[5],
                    pressure=row[6],
                    status=row[7],
                    created_at=row[8],
                    processed_at=row[9]
                ))

            return recommendations

        except Exception as e:
            logger.error(f"Failed to get pending recommendations: {e}")
            return []

    async def _process_recommendation(self, recommendation: BORecommendation):
        """处理单个推荐点"""
        logger.info(f"Processing recommendation {recommendation.id} for round {recommendation.round}")

        try:
            # 1. 将 BO 推荐点映射为 UO 配置
            uo_config = self.mapper.map_bo_to_uo(recommendation)

            # 2. 创建实验任务
            experiment_id = await self.task_creator.create_experiment_task(
                recommendation=recommendation,
                uo_config=uo_config
            )

            # 3. 标记推荐点为已处理
            self._mark_recommendation_processed(recommendation.id, experiment_id)

            logger.info(f"Successfully processed recommendation {recommendation.id}, created experiment {experiment_id}")

        except Exception as e:
            logger.error(f"Failed to process recommendation {recommendation.id}: {e}")
            raise

    def _mark_recommendation_processed(self, recommendation_id: str, experiment_id: str):
        """标记推荐点为已处理"""
        try:
            conn = duckdb.connect(self.db_path)

            conn.execute("""
                UPDATE recommendations
                SET status = 'processed',
                    processed_at = CURRENT_TIMESTAMP,
                    metadata = json_object('experiment_id', ?)
                WHERE id = ?
            """, [experiment_id, recommendation_id])

            conn.close()
            logger.debug(f"Marked recommendation {recommendation_id} as processed")

        except Exception as e:
            logger.error(f"Failed to mark recommendation {recommendation_id} as processed: {e}")

    def _mark_recommendation_failed(self, recommendation_id: str, error_message: str):
        """标记推荐点处理失败"""
        try:
            conn = duckdb.connect(self.db_path)

            conn.execute("""
                UPDATE recommendations
                SET status = 'failed',
                    processed_at = CURRENT_TIMESTAMP,
                    metadata = json_object('error', ?)
                WHERE id = ?
            """, [error_message, recommendation_id])

            conn.close()
            logger.debug(f"Marked recommendation {recommendation_id} as failed")

        except Exception as e:
            logger.error(f"Failed to mark recommendation {recommendation_id} as failed: {e}")

    def get_status(self) -> Dict[str, Any]:
        """获取监听器状态"""
        return {
            "is_running": self.is_running,
            "db_path": self.db_path,
            "polling_interval": self.polling_interval,
            "pending_count": len(self._get_pending_recommendations())
        }

    async def manual_trigger(self) -> Dict[str, Any]:
        """手动触发一次推荐处理"""
        logger.info("Manual trigger for recommendation processing")

        try:
            await self._poll_recommendations()
            return {
                "success": True,
                "message": "Manual trigger completed successfully",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Manual trigger failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


# 全局监听器实例
_listener_instance: Optional[RecommendationListener] = None


def get_listener() -> RecommendationListener:
    """获取全局监听器实例"""
    global _listener_instance
    if _listener_instance is None:
        _listener_instance = RecommendationListener()
    return _listener_instance


async def start_bo_listener(
    db_path: str = "bo_recommendations.duckdb",
    polling_interval: int = 30
):
    """启动 BO 监听器"""
    global _listener_instance
    _listener_instance = RecommendationListener(db_path, polling_interval)
    await _listener_instance.start_listening()


async def stop_bo_listener():
    """停止 BO 监听器"""
    global _listener_instance
    if _listener_instance:
        await _listener_instance.stop_listening()
