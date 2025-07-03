from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import logging
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    """WebSocket connection manager"""
    
    def __init__(self):
        # active_connections: run_id -> Set[WebSocket]
        self._active_connections: Dict[str, Set[WebSocket]] = {}
        # all_connections: Set[WebSocket]
        self._all_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket, run_id: str = None):
        """build connection"""
        await websocket.accept()
        self._all_connections.add(websocket)
        
        if run_id:
            if run_id not in self._active_connections:
                self._active_connections[run_id] = set()
            self._active_connections[run_id].add(websocket)
            logger.info(f"Client connected to workflow {run_id}")
        else:
            logger.info("Client connected to broadcast channel")
    
    def disconnect(self, websocket: WebSocket, run_id: str = None):

        self._all_connections.discard(websocket)
        
        if run_id and run_id in self._active_connections:
            self._active_connections[run_id].discard(websocket)
            if not self._active_connections[run_id]:
                del self._active_connections[run_id]
            logger.info(f"Client disconnected from workflow {run_id}")
        else:
            logger.info("Client disconnected from broadcast channel")
    
    async def broadcast_workflow_update(self, run_id: str, data: dict):
        """update workflow"""
        if run_id in self._active_connections:
            message = {
                "type": "workflow_update",
                "run_id": run_id,
                "timestamp": datetime.now().isoformat(),
                "data": data
            }
            
            # send to specific workflow connections
            for connection in self._active_connections[run_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to send message to client: {str(e)}")
                    await self.disconnect(connection, run_id)
    
    async def broadcast_system_message(self, message_type: str, data: dict):
        """post system message"""
        message = {
            "type": message_type,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        
        # send to all connections
        for connection in self._all_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send system message: {str(e)}")
                await self.disconnect(connection)

# create global WebSocket manager instance
ws_manager = WebSocketManager()

async def handle_workflow_subscription(websocket: WebSocket, run_id: str):
    """process workflow subscription"""
    try:
        await ws_manager.connect(websocket, run_id)
        
        while True:
            try:
                # keep connection alive, wait for client message
                data = await websocket.receive_text()
                # process client message if needed
                
            except WebSocketDisconnect:
                ws_manager.disconnect(websocket, run_id)
                break
                
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        ws_manager.disconnect(websocket, run_id)

async def handle_broadcast_subscription(websocket: WebSocket):
    """process broadcast subscription"""
    try:
        await ws_manager.connect(websocket)
        
        while True:
            try:
                # keep connection alive, wait for client message
                data = await websocket.receive_text()
                # process client message if needed
                
            except WebSocketDisconnect:
                ws_manager.disconnect(websocket)
                break
                
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        ws_manager.disconnect(websocket) 
