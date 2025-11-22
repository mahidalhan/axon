"""Simple test of Muse streaming without pytest dependency."""

import time
import sys
from pathlib import Path

# Add pipeline_scripts to path
sys.path.insert(0, str(Path(__file__).parent))

from pipeline_scripts.muse.device import MuseDeviceManager
from pipeline_scripts.muse.streaming import SimulatedMuseStream


def test_simulated_stream():
    """Test simulated Muse stream."""
    print("Testing simulated stream...")

    stream = SimulatedMuseStream(sampling_rate=256)
    print(f"  Created stream (sampling_rate={stream.sampling_rate})")

    stream.start_stream()
    print("  Stream started")

    time.sleep(2)
    print("  Waited 2 seconds for data...")

    samples = stream.get_latest_eeg_samples(n=100)
    print(f"  Retrieved {len(samples)} samples")

    if len(samples) > 0:
        sample = samples[0]
        print(f"  Sample: TP9={sample.tp9:.2f}, AF7={sample.af7:.2f}, "
              f"AF8={sample.af8:.2f}, TP10={sample.tp10:.2f}")

    stream.stop_stream()
    print("  Stream stopped")

    assert len(samples) > 0, "Should have collected samples"
    print("✅ Simulated stream test passed\n")


def test_device_manager():
    """Test MuseDeviceManager."""
    print("Testing MuseDeviceManager...")

    manager = MuseDeviceManager(use_simulation=True, window_size_seconds=2.0)
    print("  Created manager (simulation mode)")

    manager.connect()
    print("  Connected to simulated device")

    time.sleep(4)
    print("  Waited 4 seconds for buffer to fill...")

    status = manager.get_status()
    print(f"  Status: connected={status['connected']}, "
          f"buffer_fill={status['buffer_fill']:.2f}")

    lri_data = manager.get_current_lri()
    if lri_data:
        print(f"  LRI: {lri_data['lri']:.1f}")
        print(f"    - Alertness: {lri_data['alertness_score']:.1f}")
        print(f"    - Focus: {lri_data['focus_score']:.1f}")
        print(f"    - Quality: {lri_data['quality_tier']}")
    else:
        print("  WARNING: No LRI data available yet")

    band_power = manager.get_current_band_power()
    if band_power:
        print(f"  Band Powers:")
        print(f"    - Delta: {band_power['delta']:.2f}")
        print(f"    - Theta: {band_power['theta']:.2f}")
        print(f"    - Alpha: {band_power['alpha']:.2f}")
        print(f"    - Beta: {band_power['beta']:.2f}")
        print(f"    - Gamma: {band_power['gamma']:.2f}")
    else:
        print("  WARNING: No band power data available yet")

    manager.disconnect()
    print("  Disconnected")

    assert status['connected'], "Should be connected"
    assert lri_data is not None, "Should have LRI data"
    assert band_power is not None, "Should have band power data"

    print("✅ Device manager test passed\n")


def test_continuous_updates():
    """Test continuous LRI updates."""
    print("Testing continuous updates...")

    manager = MuseDeviceManager(use_simulation=True)
    manager.connect()
    print("  Connected")

    time.sleep(3)
    print("  Collecting 5 LRI readings...")

    lri_values = []
    for i in range(5):
        lri_data = manager.get_current_lri()
        if lri_data:
            lri_values.append(lri_data['lri'])
            print(f"    Reading {i+1}: LRI={lri_data['lri']:.1f}, "
                  f"Quality={lri_data['quality_tier']}")
        time.sleep(0.5)

    manager.disconnect()
    print("  Disconnected")

    assert len(lri_values) > 0, "Should have collected LRI values"
    for lri in lri_values:
        assert 0 <= lri <= 100, f"LRI {lri} should be in range 0-100"

    print("✅ Continuous updates test passed\n")


if __name__ == "__main__":
    print("=" * 60)
    print("MUSE SDK INTEGRATION TEST")
    print("=" * 60)
    print()

    try:
        test_simulated_stream()
        test_device_manager()
        test_continuous_updates()

        print("=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
