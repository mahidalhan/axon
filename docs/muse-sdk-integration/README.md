# Muse SDK Integration Guide

## Overview

The Axon project now supports **real-time EEG streaming** from Muse headbands using the **muselsl** (Muse Lab Streaming Layer) SDK. This enables live neuroplasticity optimization with real-time Learning Readiness Index (LRI) calculations.

## Features

✅ **Real-time EEG streaming** from Muse 2, Muse S headbands
✅ **Live LRI calculation** updated every 2 seconds
✅ **WebSocket API** for real-time updates to mobile/web apps
✅ **Simulation mode** for testing without hardware
✅ **Band power analysis** (Delta, Theta, Alpha, Beta, Gamma)
✅ **Device discovery** and connection management

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Muse Headband  │ ──BLE──>│  muselsl Stream  │ ──LSL──>│  Axon Backend   │
│  (Hardware)     │         │  (Python)        │         │  (FastAPI)      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                                                  │
                                                                  │ WebSocket
                                                                  ▼
                                                          ┌─────────────────┐
                                                          │  Mobile App     │
                                                          │  (React Native) │
                                                          └─────────────────┘
```

### Components

1. **Muse Headband** → Bluetooth Low Energy (BLE) connection
2. **muselsl** → Streams EEG data via Lab Streaming Layer (LSL)
3. **MuseStreamManager** → Receives LSL streams, buffers EEG data
4. **MuseDeviceManager** → Calculates band powers and LRI in real-time
5. **FastAPI Endpoints** → REST API + WebSocket for real-time updates
6. **Mobile App** → Consumes real-time LRI via WebSocket

---

## Installation

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Pipeline dependencies
cd ../pipeline_scripts
pip install -r requirements.txt
```

**Key new dependencies:**
- `muselsl>=2.2.0` - Muse streaming SDK
- `pylsl>=1.16.0` - Lab Streaming Layer protocol
- `scipy>=1.11.0` - Signal processing (Welch's method for PSD)
- `websockets>=12.0` - WebSocket support for FastAPI

### 2. System Requirements

**macOS/Linux:**
- Bluetooth support
- Python 3.9+

**Windows:**
- BlueMuse required (separate Windows app for Muse → LSL bridge)
- Python 3.9+

---

## Quick Start

### Option 1: Simulation Mode (No Hardware)

Perfect for testing without a Muse headband:

```python
from pipeline_scripts.muse.device import MuseDeviceManager

# Create manager in simulation mode
manager = MuseDeviceManager(use_simulation=True)

# Connect (starts simulated stream)
manager.connect()

# Wait for data to accumulate
import time
time.sleep(3)

# Get real-time LRI
lri_data = manager.get_current_lri()
print(lri_data)
# {
#   "lri": 72.3,
#   "alertness_score": 68.5,
#   "focus_score": 75.1,
#   "quality_tier": "optimal"
# }

# Disconnect
manager.disconnect()
```

### Option 2: Real Hardware

```python
from pipeline_scripts.muse.device import MuseDeviceManager

# Create manager for real hardware
manager = MuseDeviceManager(use_simulation=False)

# Discover available Muse devices
devices = manager.discover_devices(timeout=10.0)
print(devices)
# [{"name": "Muse-XXXX", "address": "00:55:DA:B0:XX:XX"}]

# Connect to first device
manager.connect(address=devices[0]["address"])

# Wait for data
import time
time.sleep(5)

# Get real-time LRI
lri_data = manager.get_current_lri()
print(lri_data)

# Get band powers
band_power = manager.get_current_band_power()
print(band_power)

# Disconnect
manager.disconnect()
```

---

## API Endpoints

### REST API

All endpoints are prefixed with `/api/muse`:

#### 1. Discover Devices

```http
GET /api/muse/discover?timeout=10.0
```

**Response:**
```json
{
  "devices": [
    {"name": "Muse-1234", "address": "00:55:DA:B0:XX:XX"}
  ],
  "count": 1
}
```

#### 2. Connect to Device

```http
POST /api/muse/connect
Content-Type: application/json

{
  "address": "00:55:DA:B0:XX:XX",
  "name": null,
  "use_simulation": false
}
```

**Response:**
```json
{
  "connected": true,
  "message": "Connected successfully",
  "simulation_mode": false
}
```

#### 3. Disconnect

```http
POST /api/muse/disconnect
```

**Response:**
```json
{
  "message": "Disconnected successfully"
}
```

#### 4. Get Device Status

```http
GET /api/muse/status
```

**Response:**
```json
{
  "connected": true,
  "simulation_mode": false,
  "sampling_rate": 256,
  "window_size_seconds": 2.0,
  "buffer_fill": 0.85,
  "has_lri_data": true,
  "has_band_power_data": true
}
```

#### 5. Get Current LRI

```http
GET /api/muse/lri/current
```

**Response:**
```json
{
  "timestamp": 1732291234.567,
  "lri": 72.3,
  "base_lri": 70.1,
  "alertness_score": 68.5,
  "focus_score": 75.1,
  "arousal_balance_score": 72.8,
  "post_exercise_multiplier": 1.0,
  "quality_tier": "optimal"
}
```

#### 6. Get Current Band Power

```http
GET /api/muse/bandpower/current
```

**Response:**
```json
{
  "timestamp": 1732291234.567,
  "delta": 12.5,
  "theta": 8.3,
  "alpha": 15.7,
  "beta": 6.2,
  "gamma": 2.1,
  "tp9_delta": 12.1,
  "tp9_theta": 8.5,
  ...
}
```

### WebSocket API

#### Real-time LRI Stream

```javascript
const ws = new WebSocket('ws://localhost:8001/api/muse/ws/lri');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
  // {
  //   "type": "lri_update",
  //   "data": { "lri": 72.3, ... },
  //   "timestamp": "2025-11-22T16:30:45.123Z"
  // }
};
```

#### Real-time Band Power Stream

```javascript
const ws = new WebSocket('ws://localhost:8001/api/muse/ws/bandpower');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
  // {
  //   "type": "bandpower_update",
  //   "data": { "delta": 12.5, ... },
  //   "timestamp": "2025-11-22T16:30:45.123Z"
  // }
};
```

---

## Testing

### 1. Start Backend Server

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Test with cURL

```bash
# Connect in simulation mode
curl -X POST http://localhost:8001/api/muse/connect \
  -H "Content-Type: application/json" \
  -d '{"use_simulation": true}'

# Get status
curl http://localhost:8001/api/muse/status

# Get current LRI
curl http://localhost:8001/api/muse/lri/current

# Disconnect
curl -X POST http://localhost:8001/api/muse/disconnect
```

### 3. Test WebSocket

```bash
# Install wscat if not already installed
npm install -g wscat

# Connect to LRI stream
wscat -c ws://localhost:8001/api/muse/ws/lri
```

---

## Integration with Mobile App

### React Native Example

```typescript
// src/services/museService.ts
import { useState, useEffect } from 'react';

export const useMuseLRI = () => {
  const [lri, setLRI] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('ws://192.168.1.10:8001/api/muse/ws/lri');

    ws.onopen = () => {
      console.log('Connected to Muse stream');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'lri_update') {
        setLRI(data.data);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Muse stream');
      setConnected(false);
    };

    return () => ws.close();
  }, []);

  return { lri, connected };
};

// Usage in component
const LiveLRIScreen = () => {
  const { lri, connected } = useMuseLRI();

  if (!connected) {
    return <Text>Connecting to Muse...</Text>;
  }

  if (!lri) {
    return <Text>Waiting for data...</Text>;
  }

  return (
    <View>
      <Text>Learning Readiness Index</Text>
      <Text style={{ fontSize: 48 }}>{lri.lri.toFixed(1)}</Text>
      <Text>Quality: {lri.quality_tier}</Text>
      <Text>Alertness: {lri.alertness_score.toFixed(1)}</Text>
      <Text>Focus: {lri.focus_score.toFixed(1)}</Text>
    </View>
  );
};
```

---

## Technical Details

### EEG Processing Pipeline

1. **Data Acquisition** (256 Hz sampling rate)
   - TP9: Left temporal-parietal (behind left ear)
   - AF7: Left forehead
   - AF8: Right forehead
   - TP10: Right temporal-parietal (behind right ear)

2. **Buffering** (2-second windows)
   - 512 samples per window (256 Hz × 2 seconds)
   - Rolling buffer with overlap

3. **Band Power Extraction** (Welch's Method)
   - Delta: 0.5-4 Hz → Sleep/relaxation
   - Theta: 4-8 Hz → Focus, meditation
   - Alpha: 8-13 Hz → Relaxed alertness
   - Beta: 13-30 Hz → Active thinking, alertness
   - Gamma: 30-50 Hz → Information processing

4. **LRI Calculation** (see `pipeline_scripts/muse/lri.py`)
   - Alertness score (40% weight)
   - Focus score (40% weight)
   - Arousal balance (20% weight)
   - Post-exercise multiplier (if workout context available)

### Performance

- **Latency**: ~2 seconds from EEG sample to LRI update
- **Update frequency**: 500ms (2 Hz) via WebSocket
- **Buffer size**: 512 samples (2 seconds of data)
- **Memory usage**: ~10 MB per active stream

---

## Troubleshooting

### Muse Not Discovered

1. **Ensure Bluetooth is enabled**
   ```bash
   # macOS
   system_profiler SPBluetoothDataType

   # Linux
   hcitool dev
   ```

2. **Check Muse is charged and in pairing mode**
   - LED should be blinking

3. **Try manual discovery**
   ```python
   from muselsl import list_muses
   devices = list_muses(timeout=15)
   print(devices)
   ```

### Connection Fails

1. **Restart Muse headband** (power off/on)
2. **Clear Bluetooth cache** (unpair and re-pair)
3. **Check for other apps** using the Muse (close them)

### No LRI Data

1. **Wait 2-3 seconds** after connection (buffer needs to fill)
2. **Check buffer fill**: `GET /api/muse/status` → `buffer_fill` should be > 0.8
3. **Verify EEG signal quality** → Check that Muse sensors are making good contact with skin

### Windows-Specific Issues

- **Install BlueMuse** first: https://github.com/kowalej/BlueMuse
- Start BlueMuse **before** running Python code
- Check that BlueMuse shows the Muse device connected

---

## Future Enhancements

- [ ] Multi-device support (compare multiple users)
- [ ] Calibration wizard for personalized baselines
- [ ] Artifact rejection (blink detection, motion artifacts)
- [ ] Long-term session recording
- [ ] Cloud sync for historical LRI data
- [ ] Push notifications for optimal learning windows

---

## References

- **muselsl Documentation**: https://github.com/alexandrebarachant/muse-lsl
- **LSL Protocol**: https://labstreaminglayer.readthedocs.io/
- **Muse Developer Docs**: https://choosemuse.com/development/
- **Huberman Lab Neuroplasticity**: See `docs/algorithm/neuro-PRD.md`

---

## Support

For issues or questions:
- Check logs: Backend logs show detailed connection status
- File issue on GitHub
- Contact: [Your contact info]
