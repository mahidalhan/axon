"""Muse device manager for connection and real-time processing."""

from __future__ import annotations

import numpy as np
from typing import Optional, Dict, List
from dataclasses import dataclass, asdict
from datetime import datetime
from collections import deque
from scipy import signal as scipy_signal

from pipeline_scripts.utils import get_logger
from pipeline_scripts.muse.streaming import (
    MuseStreamManager,
    SimulatedMuseStream,
    MuseEEGSample,
)
from pipeline_scripts.muse.lri import LRICalculator

logger = get_logger(__name__)


@dataclass
class BandPowerSnapshot:
    """Band power values for a single time point."""
    timestamp: float
    # Average across all channels
    delta: float
    theta: float
    alpha: float
    beta: float
    gamma: float
    # Per-channel values
    tp9_delta: float
    tp9_theta: float
    tp9_alpha: float
    tp9_beta: float
    tp9_gamma: float
    af7_delta: float
    af7_theta: float
    af7_alpha: float
    af7_beta: float
    af7_gamma: float
    af8_delta: float
    af8_theta: float
    af8_alpha: float
    af8_beta: float
    af8_gamma: float
    tp10_delta: float
    tp10_theta: float
    tp10_alpha: float
    tp10_beta: float
    tp10_gamma: float


@dataclass
class RealtimeLRISnapshot:
    """Real-time LRI calculation result."""
    timestamp: float
    lri: float
    base_lri: float
    alertness_score: float
    focus_score: float
    arousal_balance_score: float
    post_exercise_multiplier: float
    quality_tier: str  # "optimal", "moderate", "low"


class MuseDeviceManager:
    """High-level manager for Muse device connection and processing."""

    def __init__(
        self,
        use_simulation: bool = False,
        window_size_seconds: float = 2.0,
        sampling_rate: int = 256,
    ):
        """Initialize Muse device manager.

        Args:
            use_simulation: Use simulated data instead of real hardware
            window_size_seconds: Window size for band power calculation
            sampling_rate: Muse sampling rate in Hz
        """
        self.use_simulation = use_simulation
        self.window_size_seconds = window_size_seconds
        self.sampling_rate = sampling_rate
        self.window_size_samples = int(window_size_seconds * sampling_rate)

        # Stream manager
        if use_simulation:
            self.stream: SimulatedMuseStream = SimulatedMuseStream(sampling_rate)
        else:
            self.stream: MuseStreamManager = MuseStreamManager()

        # Processing components
        self.lri_calculator = LRICalculator()

        # Data buffers for processing
        self.tp9_buffer = deque(maxlen=self.window_size_samples)
        self.af7_buffer = deque(maxlen=self.window_size_samples)
        self.af8_buffer = deque(maxlen=self.window_size_samples)
        self.tp10_buffer = deque(maxlen=self.window_size_samples)

        # Latest metrics
        self.latest_band_power: Optional[BandPowerSnapshot] = None
        self.latest_lri: Optional[RealtimeLRISnapshot] = None

        # Register callback for incoming data
        self.stream.register_eeg_callback(self._on_eeg_sample)

    def discover_devices(self, timeout: float = 10.0) -> List[Dict[str, str]]:
        """Discover available Muse devices.

        Args:
            timeout: Discovery timeout in seconds

        Returns:
            List of discovered devices
        """
        if self.use_simulation:
            logger.info("Using simulation mode - no real devices to discover")
            return [{"name": "Simulated Muse", "address": "00:00:00:00:00:00"}]

        return MuseStreamManager.discover_muses(timeout=timeout)

    def connect(
        self,
        address: Optional[str] = None,
        name: Optional[str] = None
    ):
        """Connect to a Muse device and start streaming.

        Args:
            address: MAC address of device (for real hardware)
            name: Name of device (for real hardware)
        """
        logger.info(f"Connecting to Muse... (simulation={self.use_simulation})")

        if self.use_simulation:
            self.stream.start_stream()
        else:
            self.stream.start_stream(address=address, name=name)

        logger.info("Muse connected successfully")

    def disconnect(self):
        """Disconnect from Muse device."""
        logger.info("Disconnecting from Muse...")
        self.stream.stop_stream()
        logger.info("Muse disconnected")

    def is_connected(self) -> bool:
        """Check if device is connected."""
        return self.stream.is_connected()

    def _on_eeg_sample(self, sample: MuseEEGSample):
        """Callback for new EEG sample."""
        # Add to buffers
        self.tp9_buffer.append(sample.tp9)
        self.af7_buffer.append(sample.af7)
        self.af8_buffer.append(sample.af8)
        self.tp10_buffer.append(sample.tp10)

        # Calculate band power if we have enough data
        if len(self.tp9_buffer) >= self.window_size_samples:
            self._calculate_band_power()

    def _calculate_band_power(self):
        """Calculate band power from current buffer."""
        # Convert buffers to numpy arrays
        tp9 = np.array(self.tp9_buffer)
        af7 = np.array(self.af7_buffer)
        af8 = np.array(self.af8_buffer)
        tp10 = np.array(self.tp10_buffer)

        # Calculate power spectral density for each channel
        tp9_powers = self._compute_band_powers(tp9)
        af7_powers = self._compute_band_powers(af7)
        af8_powers = self._compute_band_powers(af8)
        tp10_powers = self._compute_band_powers(tp10)

        # Create band power snapshot
        self.latest_band_power = BandPowerSnapshot(
            timestamp=datetime.now().timestamp(),
            # Averages
            delta=(tp9_powers['delta'] + af7_powers['delta'] +
                   af8_powers['delta'] + tp10_powers['delta']) / 4,
            theta=(tp9_powers['theta'] + af7_powers['theta'] +
                   af8_powers['theta'] + tp10_powers['theta']) / 4,
            alpha=(tp9_powers['alpha'] + af7_powers['alpha'] +
                   af8_powers['alpha'] + tp10_powers['alpha']) / 4,
            beta=(tp9_powers['beta'] + af7_powers['beta'] +
                  af8_powers['beta'] + tp10_powers['beta']) / 4,
            gamma=(tp9_powers['gamma'] + af7_powers['gamma'] +
                   af8_powers['gamma'] + tp10_powers['gamma']) / 4,
            # TP9
            tp9_delta=tp9_powers['delta'],
            tp9_theta=tp9_powers['theta'],
            tp9_alpha=tp9_powers['alpha'],
            tp9_beta=tp9_powers['beta'],
            tp9_gamma=tp9_powers['gamma'],
            # AF7
            af7_delta=af7_powers['delta'],
            af7_theta=af7_powers['theta'],
            af7_alpha=af7_powers['alpha'],
            af7_beta=af7_powers['beta'],
            af7_gamma=af7_powers['gamma'],
            # AF8
            af8_delta=af8_powers['delta'],
            af8_theta=af8_powers['theta'],
            af8_alpha=af8_powers['alpha'],
            af8_beta=af8_powers['beta'],
            af8_gamma=af8_powers['gamma'],
            # TP10
            tp10_delta=tp10_powers['delta'],
            tp10_theta=tp10_powers['theta'],
            tp10_alpha=tp10_powers['alpha'],
            tp10_beta=tp10_powers['beta'],
            tp10_gamma=tp10_powers['gamma'],
        )

        # Calculate LRI
        self._calculate_lri()

    def _compute_band_powers(self, signal_data: np.ndarray) -> Dict[str, float]:
        """Compute band powers for a signal using Welch's method.

        Args:
            signal_data: 1D array of EEG signal

        Returns:
            Dictionary with band powers (delta, theta, alpha, beta, gamma)
        """
        # Welch's method for power spectral density
        freqs, psd = scipy_signal.welch(
            signal_data,
            fs=self.sampling_rate,
            nperseg=min(256, len(signal_data))
        )

        # Define frequency bands
        bands = {
            'delta': (0.5, 4),
            'theta': (4, 8),
            'alpha': (8, 13),
            'beta': (13, 30),
            'gamma': (30, 50),
        }

        # Calculate power in each band
        powers = {}
        for band_name, (low_freq, high_freq) in bands.items():
            idx = np.logical_and(freqs >= low_freq, freqs < high_freq)
            powers[band_name] = np.mean(psd[idx])

        return powers

    def _calculate_lri(self):
        """Calculate Learning Readiness Index from latest band powers."""
        if not self.latest_band_power:
            return

        # Prepare data in format expected by LRICalculator
        # The calculator expects a dict with specific keys
        band_data = {
            'delta_tp9': self.latest_band_power.tp9_delta,
            'theta_tp9': self.latest_band_power.tp9_theta,
            'alpha_tp9': self.latest_band_power.tp9_alpha,
            'beta_tp9': self.latest_band_power.tp9_beta,
            'gamma_tp9': self.latest_band_power.tp9_gamma,
            'delta_af7': self.latest_band_power.af7_delta,
            'theta_af7': self.latest_band_power.af7_theta,
            'alpha_af7': self.latest_band_power.af7_alpha,
            'beta_af7': self.latest_band_power.af7_beta,
            'gamma_af7': self.latest_band_power.af7_gamma,
            'delta_af8': self.latest_band_power.af8_delta,
            'theta_af8': self.latest_band_power.af8_theta,
            'alpha_af8': self.latest_band_power.af8_alpha,
            'beta_af8': self.latest_band_power.af8_beta,
            'gamma_af8': self.latest_band_power.af8_gamma,
            'delta_tp10': self.latest_band_power.tp10_delta,
            'theta_tp10': self.latest_band_power.tp10_theta,
            'alpha_tp10': self.latest_band_power.tp10_alpha,
            'beta_tp10': self.latest_band_power.tp10_beta,
            'gamma_tp10': self.latest_band_power.tp10_gamma,
        }

        # Calculate LRI
        lri_result = self.lri_calculator.calculate(band_data)

        # Determine quality tier
        lri_value = lri_result.get('lri', 0)
        if lri_value >= 70:
            quality_tier = "optimal"
        elif lri_value >= 50:
            quality_tier = "moderate"
        else:
            quality_tier = "low"

        # Create snapshot
        self.latest_lri = RealtimeLRISnapshot(
            timestamp=self.latest_band_power.timestamp,
            lri=lri_result.get('lri', 0),
            base_lri=lri_result.get('base_lri', 0),
            alertness_score=lri_result.get('alertness_score', 0),
            focus_score=lri_result.get('focus_score', 0),
            arousal_balance_score=lri_result.get('arousal_balance_score', 0),
            post_exercise_multiplier=lri_result.get('post_exercise_multiplier', 1.0),
            quality_tier=quality_tier,
        )

    def get_current_lri(self) -> Optional[Dict]:
        """Get current LRI snapshot.

        Returns:
            Dictionary with LRI data or None if not available
        """
        if not self.latest_lri:
            return None

        return asdict(self.latest_lri)

    def get_current_band_power(self) -> Optional[Dict]:
        """Get current band power snapshot.

        Returns:
            Dictionary with band power data or None if not available
        """
        if not self.latest_band_power:
            return None

        return asdict(self.latest_band_power)

    def get_status(self) -> Dict[str, any]:
        """Get current device status.

        Returns:
            Dictionary with status information
        """
        return {
            "connected": self.is_connected(),
            "simulation_mode": self.use_simulation,
            "sampling_rate": self.sampling_rate,
            "window_size_seconds": self.window_size_seconds,
            "buffer_fill": len(self.tp9_buffer) / self.window_size_samples,
            "has_lri_data": self.latest_lri is not None,
            "has_band_power_data": self.latest_band_power is not None,
        }
