"""Data models for Apple Health sleep processing."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class EnhancedSleepRecord:
    date: str
    device_type: Optional[str]
    start_time: datetime
    end_time: datetime
    in_bed_time: datetime
    final_wake_time: datetime

    duration_hours: float
    time_in_bed_hours: float
    sleep_efficiency: float

    deep_sleep_minutes: Optional[float] = None
    rem_sleep_minutes: Optional[float] = None
    core_sleep_minutes: Optional[float] = None
    awake_minutes: Optional[float] = None

    waso_minutes: Optional[float] = None
    sol_minutes: Optional[float] = None
    hrv_rmssd_sleep: Optional[float] = None
    avg_respiratory_rate: Optional[float] = None

    deep_sleep_percent: Optional[float] = None
    rem_sleep_percent: Optional[float] = None
    core_sleep_percent: Optional[float] = None

    bedtime_consistency_sd: Optional[float] = None
    days_for_consistency: int = 0

    sleep_score: Optional[float] = None
    sleep_score_version: Optional[str] = None

    has_sleep_stages: bool = False
    has_hrv: bool = False

    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        data = asdict(self)
        data["start_time"] = self.start_time.isoformat()
        data["end_time"] = self.end_time.isoformat()
        data["in_bed_time"] = self.in_bed_time.isoformat()
        data["final_wake_time"] = self.final_wake_time.isoformat()
        return data


@dataclass
class WorkoutRecord:
    workout_type: str
    start_time: datetime
    end_time: datetime
    duration_minutes: float
    is_high_intensity: bool
    avg_heart_rate: Optional[float] = None
    max_heart_rate: Optional[float] = None
    source: Optional[str] = None

    def to_dict(self) -> dict:
        data = asdict(self)
        data["start_time"] = self.start_time.isoformat()
        data["end_time"] = self.end_time.isoformat()
        return data

