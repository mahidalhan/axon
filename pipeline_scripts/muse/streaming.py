"""Real-time Muse EEG streaming using muselsl."""

from __future__ import annotations

import time
import threading
import numpy as np
from typing import Optional, Callable, Dict, List
from dataclasses import dataclass
from datetime import datetime
from queue import Queue

try:
    from muselsl import stream, list_muses
    from pylsl import StreamInlet, resolve_byprop
    MUSELSL_AVAILABLE = True
except ImportError:
    MUSELSL_AVAILABLE = False
    print("Warning: muselsl not installed. Real-time streaming will not be available.")

from pipeline_scripts.utils import get_logger
from pipeline_scripts.muse.constants import BAND_COLUMNS_LOWER

logger = get_logger(__name__)


@dataclass
class MuseEEGSample:
    """Single EEG sample from Muse headband."""
    timestamp: float
    tp9: float  # Left ear
    af7: float  # Left forehead
    af8: float  # Right forehead
    tp10: float  # Right ear
    aux: float  # Auxiliary (reference)


@dataclass
class MuseBandPower:
    """Band power values from Muse."""
    timestamp: float
    # TP9 (left ear)
    delta_tp9: float
    theta_tp9: float
    alpha_tp9: float
    beta_tp9: float
    gamma_tp9: float
    # AF7 (left forehead)
    delta_af7: float
    theta_af7: float
    alpha_af7: float
    beta_af7: float
    gamma_af7: float
    # AF8 (right forehead)
    delta_af8: float
    theta_af8: float
    alpha_af8: float
    beta_af8: float
    gamma_af8: float
    # TP10 (right ear)
    delta_tp10: float
    theta_tp10: float
    alpha_tp10: float
    beta_tp10: float
    gamma_tp10: float


class MuseStreamManager:
    """Manages real-time Muse EEG streaming."""

    def __init__(self, buffer_size: int = 256):
        """Initialize Muse stream manager.

        Args:
            buffer_size: Number of samples to buffer for processing
        """
        if not MUSELSL_AVAILABLE:
            raise RuntimeError(
                "muselsl not installed. Install with: pip install muselsl pylsl"
            )

        self.buffer_size = buffer_size
        self.is_streaming = False
        self.stream_thread: Optional[threading.Thread] = None

        # Inlets for different stream types
        self.eeg_inlet: Optional[StreamInlet] = None
        self.ppg_inlet: Optional[StreamInlet] = None
        self.acc_inlet: Optional[StreamInlet] = None
        self.gyro_inlet: Optional[StreamInlet] = None

        # Data buffers
        self.eeg_buffer: Queue = Queue(maxsize=buffer_size)
        self.band_power_buffer: Queue = Queue(maxsize=100)

        # Callbacks
        self.eeg_callbacks: List[Callable[[MuseEEGSample], None]] = []
        self.band_power_callbacks: List[Callable[[MuseBandPower], None]] = []

    @staticmethod
    def discover_muses(timeout: float = 10.0) -> List[Dict[str, str]]:
        """Discover available Muse headbands.

        Args:
            timeout: Discovery timeout in seconds

        Returns:
            List of discovered Muse devices with name and address
        """
        if not MUSELSL_AVAILABLE:
            logger.error("muselsl not available")
            return []

        logger.info("Searching for Muse headbands...")
        muses = list_muses(timeout=timeout)

        if not muses:
            logger.warning("No Muse headbands found")
            return []

        logger.info(f"Found {len(muses)} Muse device(s)")
        return muses

    def start_stream(self, address: Optional[str] = None, name: Optional[str] = None):
        """Start streaming from a Muse headband.

        Args:
            address: MAC address of Muse device (e.g., "00:55:DA:B0:XX:XX")
            name: Name of Muse device (alternative to address)
        """
        if self.is_streaming:
            logger.warning("Stream already running")
            return

        logger.info("Starting Muse stream...")

        # Start muselsl streaming in background
        self.stream_thread = threading.Thread(
            target=self._start_muse_stream,
            args=(address, name),
            daemon=True
        )
        self.stream_thread.start()

        # Wait for streams to become available
        time.sleep(2)

        # Connect to LSL streams
        self._connect_to_lsl_streams()

        # Start data collection
        self._start_data_collection()

        self.is_streaming = True
        logger.info("Muse stream started successfully")

    def _start_muse_stream(self, address: Optional[str], name: Optional[str]):
        """Start muselsl stream in background thread."""
        try:
            stream(address=address, name=name)
        except Exception as e:
            logger.error(f"Failed to start Muse stream: {e}")
            self.is_streaming = False

    def _connect_to_lsl_streams(self):
        """Connect to LSL streams published by muselsl."""
        logger.info("Connecting to LSL streams...")

        # EEG stream
        streams = resolve_byprop('type', 'EEG', timeout=5)
        if streams:
            self.eeg_inlet = StreamInlet(streams[0])
            logger.info("Connected to EEG stream")
        else:
            logger.warning("No EEG stream found")

        # PPG stream (for heart rate)
        streams = resolve_byprop('type', 'PPG', timeout=2)
        if streams:
            self.ppg_inlet = StreamInlet(streams[0])
            logger.info("Connected to PPG stream")

        # Accelerometer stream
        streams = resolve_byprop('type', 'ACC', timeout=2)
        if streams:
            self.acc_inlet = StreamInlet(streams[0])
            logger.info("Connected to ACC stream")

        # Gyroscope stream
        streams = resolve_byprop('type', 'GYRO', timeout=2)
        if streams:
            self.gyro_inlet = StreamInlet(streams[0])
            logger.info("Connected to GYRO stream")

    def _start_data_collection(self):
        """Start collecting data from LSL streams."""
        if self.eeg_inlet:
            collection_thread = threading.Thread(
                target=self._collect_eeg_data,
                daemon=True
            )
            collection_thread.start()

    def _collect_eeg_data(self):
        """Collect EEG data from LSL stream (runs in background thread)."""
        logger.info("Starting EEG data collection...")

        while self.is_streaming and self.eeg_inlet:
            try:
                # Pull sample from LSL stream
                sample, timestamp = self.eeg_inlet.pull_sample(timeout=1.0)

                if sample:
                    # Create EEG sample
                    eeg_sample = MuseEEGSample(
                        timestamp=timestamp,
                        tp9=sample[0],
                        af7=sample[1],
                        af8=sample[2],
                        tp10=sample[3],
                        aux=sample[4] if len(sample) > 4 else 0.0
                    )

                    # Add to buffer (non-blocking)
                    if not self.eeg_buffer.full():
                        self.eeg_buffer.put(eeg_sample)

                    # Trigger callbacks
                    for callback in self.eeg_callbacks:
                        try:
                            callback(eeg_sample)
                        except Exception as e:
                            logger.error(f"Error in EEG callback: {e}")

            except Exception as e:
                logger.error(f"Error collecting EEG data: {e}")
                time.sleep(0.1)

    def stop_stream(self):
        """Stop streaming from Muse."""
        logger.info("Stopping Muse stream...")
        self.is_streaming = False

        # Close inlets
        if self.eeg_inlet:
            self.eeg_inlet.close()
            self.eeg_inlet = None
        if self.ppg_inlet:
            self.ppg_inlet.close()
            self.ppg_inlet = None
        if self.acc_inlet:
            self.acc_inlet.close()
            self.acc_inlet = None
        if self.gyro_inlet:
            self.gyro_inlet.close()
            self.gyro_inlet = None

        logger.info("Muse stream stopped")

    def register_eeg_callback(self, callback: Callable[[MuseEEGSample], None]):
        """Register callback for EEG samples."""
        self.eeg_callbacks.append(callback)

    def register_band_power_callback(self, callback: Callable[[MuseBandPower], None]):
        """Register callback for band power updates."""
        self.band_power_callbacks.append(callback)

    def get_latest_eeg_samples(self, n: int = 256) -> List[MuseEEGSample]:
        """Get the latest N EEG samples from buffer.

        Args:
            n: Number of samples to retrieve

        Returns:
            List of EEG samples (may be less than n if buffer doesn't have enough)
        """
        samples = []
        temp_queue = Queue()

        # Extract samples from queue
        while not self.eeg_buffer.empty() and len(samples) < n:
            sample = self.eeg_buffer.get()
            samples.append(sample)
            temp_queue.put(sample)  # Keep for re-queuing

        # Re-queue samples
        while not temp_queue.empty():
            self.eeg_buffer.put(temp_queue.get())

        return samples[-n:] if len(samples) > n else samples

    def is_connected(self) -> bool:
        """Check if Muse is connected and streaming."""
        return self.is_streaming and self.eeg_inlet is not None


class SimulatedMuseStream:
    """Simulated Muse stream for testing without hardware."""

    def __init__(self, sampling_rate: int = 256):
        """Initialize simulated stream.

        Args:
            sampling_rate: Simulated sampling rate in Hz
        """
        self.sampling_rate = sampling_rate
        self.is_streaming = False
        self.stream_thread: Optional[threading.Thread] = None
        self.eeg_buffer: Queue = Queue(maxsize=1000)
        self.eeg_callbacks: List[Callable[[MuseEEGSample], None]] = []

    def start_stream(self):
        """Start simulated stream."""
        if self.is_streaming:
            return

        self.is_streaming = True
        self.stream_thread = threading.Thread(
            target=self._generate_data,
            daemon=True
        )
        self.stream_thread.start()
        logger.info("Simulated Muse stream started")

    def _generate_data(self):
        """Generate simulated EEG data."""
        t = 0
        dt = 1.0 / self.sampling_rate

        while self.is_streaming:
            # Generate realistic-looking EEG signals
            # Mix of alpha (10 Hz), beta (20 Hz), and theta (6 Hz)
            alpha = 10.0 * np.sin(2 * np.pi * 10 * t)
            beta = 5.0 * np.sin(2 * np.pi * 20 * t)
            theta = 3.0 * np.sin(2 * np.pi * 6 * t)
            noise = np.random.normal(0, 2.0)

            signal = alpha + beta + theta + noise

            sample = MuseEEGSample(
                timestamp=time.time(),
                tp9=signal + np.random.normal(0, 0.5),
                af7=signal + np.random.normal(0, 0.5),
                af8=signal + np.random.normal(0, 0.5),
                tp10=signal + np.random.normal(0, 0.5),
                aux=0.0
            )

            if not self.eeg_buffer.full():
                self.eeg_buffer.put(sample)

            # Trigger callbacks
            for callback in self.eeg_callbacks:
                try:
                    callback(sample)
                except Exception as e:
                    logger.error(f"Error in simulated EEG callback: {e}")

            t += dt
            time.sleep(dt)

    def stop_stream(self):
        """Stop simulated stream."""
        self.is_streaming = False
        logger.info("Simulated Muse stream stopped")

    def register_eeg_callback(self, callback: Callable[[MuseEEGSample], None]):
        """Register callback for EEG samples."""
        self.eeg_callbacks.append(callback)

    def get_latest_eeg_samples(self, n: int = 256) -> List[MuseEEGSample]:
        """Get the latest N EEG samples from buffer."""
        samples = []
        temp_queue = Queue()

        while not self.eeg_buffer.empty() and len(samples) < n:
            sample = self.eeg_buffer.get()
            samples.append(sample)
            temp_queue.put(sample)

        while not temp_queue.empty():
            self.eeg_buffer.put(temp_queue.get())

        return samples[-n:] if len(samples) > n else samples

    def is_connected(self) -> bool:
        """Check if simulated stream is running."""
        return self.is_streaming
