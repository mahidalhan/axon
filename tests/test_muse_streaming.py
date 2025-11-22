"""Tests for Muse real-time streaming integration."""

import pytest
import time
import asyncio
from pipeline_scripts.muse.device import MuseDeviceManager
from pipeline_scripts.muse.streaming import SimulatedMuseStream


def test_simulated_stream_creation():
    """Test creating a simulated Muse stream."""
    stream = SimulatedMuseStream(sampling_rate=256)
    assert stream.sampling_rate == 256
    assert not stream.is_streaming
    assert stream.is_connected() is False


def test_simulated_stream_start_stop():
    """Test starting and stopping simulated stream."""
    stream = SimulatedMuseStream(sampling_rate=256)

    # Start stream
    stream.start_stream()
    assert stream.is_streaming
    assert stream.is_connected()

    # Wait for some data
    time.sleep(1)

    # Get samples
    samples = stream.get_latest_eeg_samples(n=100)
    assert len(samples) > 0

    # Stop stream
    stream.stop_stream()
    assert not stream.is_streaming
    assert not stream.is_connected()


def test_device_manager_simulation_mode():
    """Test MuseDeviceManager in simulation mode."""
    manager = MuseDeviceManager(use_simulation=True, window_size_seconds=2.0)

    assert manager.use_simulation is True
    assert not manager.is_connected()

    # Connect
    manager.connect()
    assert manager.is_connected()

    # Wait for buffer to fill
    time.sleep(3)

    # Check status
    status = manager.get_status()
    assert status["connected"] is True
    assert status["simulation_mode"] is True
    assert status["buffer_fill"] > 0

    # Get LRI
    lri_data = manager.get_current_lri()
    assert lri_data is not None
    assert "lri" in lri_data
    assert "alertness_score" in lri_data
    assert "focus_score" in lri_data
    assert "quality_tier" in lri_data
    assert lri_data["quality_tier"] in ["optimal", "moderate", "low"]

    # Get band power
    band_power = manager.get_current_band_power()
    assert band_power is not None
    assert "delta" in band_power
    assert "theta" in band_power
    assert "alpha" in band_power
    assert "beta" in band_power
    assert "gamma" in band_power

    # Disconnect
    manager.disconnect()
    assert not manager.is_connected()


def test_device_discovery_simulation():
    """Test device discovery in simulation mode."""
    manager = MuseDeviceManager(use_simulation=True)

    devices = manager.discover_devices(timeout=1.0)
    assert len(devices) == 1
    assert devices[0]["name"] == "Simulated Muse"


def test_lri_updates_over_time():
    """Test that LRI updates continuously."""
    manager = MuseDeviceManager(use_simulation=True)
    manager.connect()

    # Wait for initial data
    time.sleep(3)

    # Collect multiple LRI readings
    lri_values = []
    for _ in range(5):
        lri_data = manager.get_current_lri()
        if lri_data:
            lri_values.append(lri_data["lri"])
        time.sleep(0.5)

    # Should have collected some readings
    assert len(lri_values) > 0

    # LRI should be in valid range (0-100)
    for lri in lri_values:
        assert 0 <= lri <= 100

    manager.disconnect()


def test_band_power_extraction():
    """Test band power extraction from simulated data."""
    manager = MuseDeviceManager(use_simulation=True, window_size_seconds=2.0)
    manager.connect()

    # Wait for buffer
    time.sleep(3)

    band_power = manager.get_current_band_power()
    assert band_power is not None

    # Check all channels have values
    channels = ["tp9", "af7", "af8", "tp10"]
    bands = ["delta", "theta", "alpha", "beta", "gamma"]

    for channel in channels:
        for band in bands:
            key = f"{channel}_{band}"
            assert key in band_power
            assert isinstance(band_power[key], float)
            assert band_power[key] >= 0  # Power should be non-negative

    manager.disconnect()


@pytest.mark.asyncio
async def test_concurrent_lri_requests():
    """Test multiple concurrent LRI requests."""
    manager = MuseDeviceManager(use_simulation=True)
    manager.connect()

    # Wait for data
    await asyncio.sleep(3)

    # Make concurrent requests
    async def get_lri():
        return manager.get_current_lri()

    results = await asyncio.gather(
        get_lri(),
        get_lri(),
        get_lri(),
    )

    # All should succeed
    for result in results:
        assert result is not None
        assert "lri" in result

    manager.disconnect()


if __name__ == "__main__":
    # Run tests directly
    print("Running Muse streaming tests...")

    print("\n1. Testing simulated stream creation...")
    test_simulated_stream_creation()
    print("✅ Passed")

    print("\n2. Testing stream start/stop...")
    test_simulated_stream_start_stop()
    print("✅ Passed")

    print("\n3. Testing device manager in simulation mode...")
    test_device_manager_simulation_mode()
    print("✅ Passed")

    print("\n4. Testing device discovery...")
    test_device_discovery_simulation()
    print("✅ Passed")

    print("\n5. Testing LRI updates over time...")
    test_lri_updates_over_time()
    print("✅ Passed")

    print("\n6. Testing band power extraction...")
    test_band_power_extraction()
    print("✅ Passed")

    print("\n✅ All tests passed!")
