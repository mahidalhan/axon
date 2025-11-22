"""FastAPI endpoints for real-time Muse EEG streaming."""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, Dict, List
import asyncio
import json
from datetime import datetime

import sys
from pathlib import Path

# Add pipeline_scripts to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline_scripts.muse.device import MuseDeviceManager
from pipeline_scripts.utils import get_logger

logger = get_logger(__name__)

# Create router
router = APIRouter(prefix="/api/muse", tags=["muse-realtime"])

# Global device manager instance
device_manager: Optional[MuseDeviceManager] = None

# WebSocket connections for real-time updates
active_websockets: List[WebSocket] = []


class DeviceDiscoverResponse(BaseModel):
    """Response for device discovery."""
    devices: List[Dict[str, str]]
    count: int


class ConnectRequest(BaseModel):
    """Request to connect to a Muse device."""
    address: Optional[str] = None
    name: Optional[str] = None
    use_simulation: bool = False


class ConnectResponse(BaseModel):
    """Response for connection request."""
    connected: bool
    message: str
    simulation_mode: bool


class StatusResponse(BaseModel):
    """Device status response."""
    connected: bool
    simulation_mode: bool
    sampling_rate: int
    window_size_seconds: float
    buffer_fill: float
    has_lri_data: bool
    has_band_power_data: bool


class CurrentLRIResponse(BaseModel):
    """Current LRI response."""
    timestamp: float
    lri: float
    base_lri: float
    alertness_score: float
    focus_score: float
    arousal_balance_score: float
    post_exercise_multiplier: float
    quality_tier: str


# Endpoints

@router.get("/discover", response_model=DeviceDiscoverResponse)
async def discover_devices(timeout: float = 10.0):
    """Discover available Muse headbands.

    Args:
        timeout: Discovery timeout in seconds (default: 10.0)

    Returns:
        List of discovered Muse devices
    """
    global device_manager

    try:
        # Create temporary manager for discovery
        temp_manager = MuseDeviceManager(use_simulation=False)
        devices = temp_manager.discover_devices(timeout=timeout)

        return DeviceDiscoverResponse(
            devices=devices,
            count=len(devices)
        )
    except Exception as e:
        logger.error(f"Error discovering devices: {e}")
        raise HTTPException(status_code=500, detail=f"Discovery failed: {str(e)}")


@router.post("/connect", response_model=ConnectResponse)
async def connect_device(request: ConnectRequest):
    """Connect to a Muse device and start streaming.

    Args:
        request: Connection parameters

    Returns:
        Connection status
    """
    global device_manager

    try:
        # Disconnect existing device if connected
        if device_manager and device_manager.is_connected():
            device_manager.disconnect()

        # Create new device manager
        device_manager = MuseDeviceManager(
            use_simulation=request.use_simulation,
            window_size_seconds=2.0,
            sampling_rate=256,
        )

        # Connect
        device_manager.connect(
            address=request.address,
            name=request.name
        )

        # Wait a moment for connection to stabilize
        await asyncio.sleep(1.0)

        return ConnectResponse(
            connected=device_manager.is_connected(),
            message="Connected successfully",
            simulation_mode=request.use_simulation
        )

    except Exception as e:
        logger.error(f"Error connecting to device: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Connection failed: {str(e)}"
        )


@router.post("/disconnect")
async def disconnect_device():
    """Disconnect from current Muse device."""
    global device_manager

    if not device_manager:
        raise HTTPException(status_code=400, detail="No device connected")

    try:
        device_manager.disconnect()
        device_manager = None
        return {"message": "Disconnected successfully"}

    except Exception as e:
        logger.error(f"Error disconnecting: {e}")
        raise HTTPException(status_code=500, detail=f"Disconnect failed: {str(e)}")


@router.get("/status", response_model=StatusResponse)
async def get_status():
    """Get current device status."""
    global device_manager

    if not device_manager:
        raise HTTPException(status_code=400, detail="No device connected")

    try:
        status = device_manager.get_status()
        return StatusResponse(**status)

    except Exception as e:
        logger.error(f"Error getting status: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@router.get("/lri/current")
async def get_current_lri():
    """Get current real-time LRI value.

    Returns:
        Current LRI snapshot or null if not yet available
    """
    global device_manager

    if not device_manager:
        raise HTTPException(status_code=400, detail="No device connected")

    if not device_manager.is_connected():
        raise HTTPException(status_code=400, detail="Device not connected")

    try:
        lri_data = device_manager.get_current_lri()

        if not lri_data:
            return {"message": "LRI data not yet available", "data": None}

        return lri_data

    except Exception as e:
        logger.error(f"Error getting LRI: {e}")
        raise HTTPException(status_code=500, detail=f"LRI retrieval failed: {str(e)}")


@router.get("/bandpower/current")
async def get_current_band_power():
    """Get current band power values.

    Returns:
        Current band power snapshot or null if not yet available
    """
    global device_manager

    if not device_manager:
        raise HTTPException(status_code=400, detail="No device connected")

    if not device_manager.is_connected():
        raise HTTPException(status_code=400, detail="Device not connected")

    try:
        band_power_data = device_manager.get_current_band_power()

        if not band_power_data:
            return {"message": "Band power data not yet available", "data": None}

        return band_power_data

    except Exception as e:
        logger.error(f"Error getting band power: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Band power retrieval failed: {str(e)}"
        )


@router.websocket("/ws/lri")
async def websocket_lri_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time LRI streaming.

    Sends LRI updates every second while connected.
    """
    global device_manager, active_websockets

    await websocket.accept()
    active_websockets.append(websocket)

    logger.info("WebSocket client connected for LRI stream")

    try:
        while True:
            if not device_manager or not device_manager.is_connected():
                await websocket.send_json({
                    "error": "No device connected",
                    "timestamp": datetime.now().isoformat()
                })
                await asyncio.sleep(1.0)
                continue

            # Get current LRI
            lri_data = device_manager.get_current_lri()

            if lri_data:
                await websocket.send_json({
                    "type": "lri_update",
                    "data": lri_data,
                    "timestamp": datetime.now().isoformat()
                })
            else:
                await websocket.send_json({
                    "type": "waiting",
                    "message": "Waiting for data...",
                    "timestamp": datetime.now().isoformat()
                })

            # Send update every 500ms
            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
        active_websockets.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_websockets:
            active_websockets.remove(websocket)


@router.websocket("/ws/bandpower")
async def websocket_bandpower_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time band power streaming.

    Sends band power updates every second while connected.
    """
    global device_manager, active_websockets

    await websocket.accept()
    active_websockets.append(websocket)

    logger.info("WebSocket client connected for band power stream")

    try:
        while True:
            if not device_manager or not device_manager.is_connected():
                await websocket.send_json({
                    "error": "No device connected",
                    "timestamp": datetime.now().isoformat()
                })
                await asyncio.sleep(1.0)
                continue

            # Get current band power
            band_power_data = device_manager.get_current_band_power()

            if band_power_data:
                await websocket.send_json({
                    "type": "bandpower_update",
                    "data": band_power_data,
                    "timestamp": datetime.now().isoformat()
                })
            else:
                await websocket.send_json({
                    "type": "waiting",
                    "message": "Waiting for data...",
                    "timestamp": datetime.now().isoformat()
                })

            # Send update every 500ms
            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
        active_websockets.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_websockets:
            active_websockets.remove(websocket)
