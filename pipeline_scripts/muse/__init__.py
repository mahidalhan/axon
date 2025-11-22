"""Muse EEG data pipeline modules."""

from .cli import app as muse_cli  # noqa: F401
from .device import MuseDeviceManager  # noqa: F401
from .streaming import MuseStreamManager, SimulatedMuseStream  # noqa: F401

