# Muse SDK Quick Start Guide

## 🚀 5-Minute Setup

This guide will get you streaming real-time EEG data from a Muse headband (or simulation) in under 5 minutes.

---

## Prerequisites

- Python 3.9+
- Muse 2 or Muse S headband (optional, can use simulation mode)
- Bluetooth enabled (if using real hardware)

---

## Step 1: Install Dependencies

```bash
# Navigate to backend directory
cd /home/user/axon/backend

# Install all dependencies
pip install -r requirements.txt
```

This installs:
- ✅ FastAPI + Uvicorn (web server)
- ✅ muselsl + pylsl (Muse SDK)
- ✅ scipy (signal processing)
- ✅ websockets (real-time streaming)

---

## Step 2: Start the Backend Server

```bash
# Start FastAPI server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

You should see:
```
✅ Muse real-time streaming endpoints enabled
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

---

## Step 3: Test with Simulation Mode

Open a new terminal and test the API:

### Connect to Simulated Muse

```bash
curl -X POST http://localhost:8001/api/muse/connect \
  -H "Content-Type: application/json" \
  -d '{"use_simulation": true}'
```

**Expected response:**
```json
{
  "connected": true,
  "message": "Connected successfully",
  "simulation_mode": true
}
```

### Check Status

```bash
curl http://localhost:8001/api/muse/status
```

**Expected response:**
```json
{
  "connected": true,
  "simulation_mode": true,
  "sampling_rate": 256,
  "window_size_seconds": 2.0,
  "buffer_fill": 1.0,
  "has_lri_data": true,
  "has_band_power_data": true
}
```

### Get Real-Time LRI

Wait 2-3 seconds for buffer to fill, then:

```bash
curl http://localhost:8001/api/muse/lri/current
```

**Expected response:**
```json
{
  "timestamp": 1732291234.567,
  "lri": 68.2,
  "base_lri": 66.5,
  "alertness_score": 64.3,
  "focus_score": 71.8,
  "arousal_balance_score": 68.9,
  "post_exercise_multiplier": 1.0,
  "quality_tier": "moderate"
}
```

🎉 **Success!** You're now getting real-time LRI updates!

### Get Band Powers

```bash
curl http://localhost:8001/api/muse/bandpower/current
```

**Expected response:**
```json
{
  "timestamp": 1732291234.567,
  "delta": 12.3,
  "theta": 8.7,
  "alpha": 15.2,
  "beta": 6.5,
  "gamma": 2.1,
  "tp9_delta": 11.9,
  "tp9_theta": 8.4,
  ...
}
```

### Disconnect

```bash
curl -X POST http://localhost:8001/api/muse/disconnect
```

---

## Step 4: Test WebSocket Streaming

### Option A: Using Python

```python
import asyncio
import websockets
import json

async def test_lri_stream():
    uri = "ws://localhost:8001/api/muse/ws/lri"

    async with websockets.connect(uri) as websocket:
        print("Connected to LRI stream")

        for i in range(10):  # Get 10 updates
            message = await websocket.recv()
            data = json.loads(message)

            if data.get("type") == "lri_update":
                lri_data = data["data"]
                print(f"LRI: {lri_data['lri']:.1f} | "
                      f"Alertness: {lri_data['alertness_score']:.1f} | "
                      f"Focus: {lri_data['focus_score']:.1f} | "
                      f"Quality: {lri_data['quality_tier']}")

# Run
asyncio.run(test_lri_stream())
```

### Option B: Using wscat (Node.js)

```bash
# Install wscat
npm install -g wscat

# Connect to LRI stream
wscat -c ws://localhost:8001/api/muse/ws/lri
```

You'll see updates every 500ms:
```json
{"type":"lri_update","data":{"lri":68.2,...},"timestamp":"2025-11-22T16:30:45Z"}
{"type":"lri_update","data":{"lri":69.1,...},"timestamp":"2025-11-22T16:30:45Z"}
{"type":"lri_update","data":{"lri":67.8,...},"timestamp":"2025-11-22T16:30:46Z"}
```

---

## Step 5: Connect to Real Muse Hardware

### Discover Devices

```bash
curl http://localhost:8001/api/muse/discover
```

**Expected response:**
```json
{
  "devices": [
    {"name": "Muse-1234", "address": "00:55:DA:B0:12:34"}
  ],
  "count": 1
}
```

### Connect to Device

```bash
curl -X POST http://localhost:8001/api/muse/connect \
  -H "Content-Type: application/json" \
  -d '{
    "address": "00:55:DA:B0:12:34",
    "use_simulation": false
  }'
```

### Get Real-Time Data

Same commands as simulation mode:
```bash
# Wait 3-5 seconds for connection
sleep 5

# Get LRI
curl http://localhost:8001/api/muse/lri/current

# Stream via WebSocket
wscat -c ws://localhost:8001/api/muse/ws/lri
```

---

## Common Commands Cheat Sheet

```bash
# Connect (simulation)
curl -X POST http://localhost:8001/api/muse/connect \
  -H "Content-Type: application/json" \
  -d '{"use_simulation": true}'

# Connect (real hardware)
curl -X POST http://localhost:8001/api/muse/connect \
  -H "Content-Type: application/json" \
  -d '{"address": "00:55:DA:B0:XX:XX", "use_simulation": false}'

# Status
curl http://localhost:8001/api/muse/status

# Current LRI
curl http://localhost:8001/api/muse/lri/current

# Current Band Power
curl http://localhost:8001/api/muse/bandpower/current

# Disconnect
curl -X POST http://localhost:8001/api/muse/disconnect

# WebSocket LRI stream
wscat -c ws://localhost:8001/api/muse/ws/lri

# WebSocket Band Power stream
wscat -c ws://localhost:8001/api/muse/ws/bandpower
```

---

## Troubleshooting

### "Connection refused"
- Check server is running: `curl http://localhost:8001/api/health`
- Check port 8001 is not in use: `lsof -i :8001`

### "No device connected" error
- Connect first: `POST /api/muse/connect`
- Check status: `GET /api/muse/status`

### "LRI data not yet available"
- Wait 2-3 seconds after connecting
- Check buffer fill: `GET /api/muse/status` → `buffer_fill` should be ~1.0

### Muse not discovered
- Ensure Bluetooth is on
- Put Muse in pairing mode (LED blinking)
- Increase timeout: `GET /api/muse/discover?timeout=30.0`

---

## Next Steps

1. **Integrate with Mobile App**: See `docs/muse-sdk-integration/README.md` for React Native example
2. **Customize LRI Algorithm**: Edit `pipeline_scripts/muse/lri.py`
3. **Add Post-Exercise Context**: Integrate Apple Health workout data
4. **Long-term Recording**: Store LRI history for trend analysis

---

## Python SDK Usage

For more control, use the Python SDK directly:

```python
from pipeline_scripts.muse.device import MuseDeviceManager
import time

# Create manager
manager = MuseDeviceManager(use_simulation=True)

# Connect
manager.connect()
print("Connected!")

# Wait for data
time.sleep(3)

# Get updates in a loop
for i in range(10):
    lri = manager.get_current_lri()
    if lri:
        print(f"LRI: {lri['lri']:.1f} | Quality: {lri['quality_tier']}")
    time.sleep(1)

# Disconnect
manager.disconnect()
```

---

## Support

- 📖 Full Documentation: `docs/muse-sdk-integration/README.md`
- 🐛 Report Issues: GitHub Issues
- 💬 Questions: [Your contact]

Happy streaming! 🧠✨
