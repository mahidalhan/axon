"""Parse Apple Health export XML into EnhancedSleepRecord objects."""

from __future__ import annotations

import math
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple
import xml.etree.ElementTree as ET

import numpy as np

from pipeline_scripts.apple_health.constants import (
    HRV_RECORD_TYPE,
    RESP_RECORD_TYPE,
    SLEEP_RECORD_TYPE,
    SLEEP_VALUES_ASLEEP,
    SLEEP_VALUES_IN_BED,
    SLEEP_VALUES_STAGE_MAP,
    SLEEP_VALUE_AWAKE,
    HIGH_INTENSITY_WORKOUTS,
    WORKOUT_ELEMENT,
    SleepPipelineConfig,
)
from pipeline_scripts.apple_health.models import EnhancedSleepRecord, WorkoutRecord
from pipeline_scripts.apple_health.scoring import calculate_sleep_score
from pipeline_scripts.utils import get_logger

logger = get_logger(__name__)


def parse_apple_health_export(
    export_path: Path,
    config: SleepPipelineConfig,
) -> List[EnhancedSleepRecord]:
    export_path = Path(export_path)
    if not export_path.exists():
        raise FileNotFoundError(f"Apple Health export not found: {export_path}")

    tree = ET.parse(export_path)
    root = tree.getroot()

    sleep_samples = []
    hrv_samples = []
    resp_samples = []

    for record in root.findall(".//Record"):
        rtype = record.get("type")
        start_str = record.get("startDate")
        end_str = record.get("endDate")
        value = record.get("value")
        source = record.get("sourceName")

        if not start_str or not end_str:
            continue

        start = _parse_datetime(start_str)
        end = _parse_datetime(end_str)

        if rtype == SLEEP_RECORD_TYPE:
            sleep_samples.append(
                {
                    "value": value,
                    "start": start,
                    "end": end,
                    "source": source,
                }
            )
        elif rtype == HRV_RECORD_TYPE:
            try:
                hrv_value = float(record.get("value"))
            except (TypeError, ValueError):
                continue
            hrv_samples.append({"timestamp": start, "value": hrv_value})
        elif rtype == RESP_RECORD_TYPE:
            try:
                resp_value = float(record.get("value"))
            except (TypeError, ValueError):
                continue
            resp_samples.append({"timestamp": start, "value": resp_value})

    sleep_sessions = _group_sleep_sessions(sleep_samples, config)
    records = _process_sessions(
        sleep_sessions,
        hrv_samples,
        resp_samples,
        config,
    )

    _add_consistency(records, config.consistency_window_days)
    _attach_sleep_scores(records)

    return records


def _parse_datetime(text: str) -> datetime:
    return datetime.fromisoformat(text.replace("Z", "+00:00"))


def _group_sleep_sessions(
    samples: List[Dict],
    config: SleepPipelineConfig,
) -> List[List[Dict]]:
    if not samples:
        return []

    samples = sorted(samples, key=lambda x: x["start"])
    sessions: List[List[Dict]] = []
    current: List[Dict] = []

    for sample in samples:
        if not current:
            current = [sample]
            continue

        gap_hours = (sample["start"] - current[-1]["end"]).total_seconds() / 3600
        if gap_hours > 3:
            sessions.append(current)
            current = [sample]
        else:
            current.append(sample)

    if current:
        sessions.append(current)

    filtered_sessions = []
    for session in sessions:
        duration_hours = (session[-1]["end"] - session[0]["start"]).total_seconds() / 3600
        start_hour = session[0]["start"].hour
        if duration_hours < config.min_session_hours:
            continue
        if config.start_hour_min <= start_hour <= 23 or 0 <= start_hour <= config.start_hour_max:
            filtered_sessions.append(session)

    return filtered_sessions


def _process_sessions(
    sessions: List[List[Dict]],
    hrv_samples: List[Dict],
    resp_samples: List[Dict],
    config: SleepPipelineConfig,
) -> List[EnhancedSleepRecord]:
    records: List[EnhancedSleepRecord] = []

    for session in sessions:
        record = _process_session(session, hrv_samples, resp_samples)
        if record:
            records.append(record)

    records.sort(key=lambda r: r.start_time)
    return records


def parse_workouts(export_path: Path) -> List[WorkoutRecord]:
    """Parse Apple Health <Workout> elements into WorkoutRecord entries."""
    export_path = Path(export_path)
    if not export_path.exists():
        raise FileNotFoundError(f"Apple Health export not found: {export_path}")

    tree = ET.parse(export_path)
    root = tree.getroot()

    workouts: List[WorkoutRecord] = []
    for w in root.findall(WORKOUT_ELEMENT):
        wtype = w.get("workoutActivityType")
        start_str = w.get("startDate")
        end_str = w.get("endDate")
        source = w.get("sourceName")
        if not wtype or not start_str or not end_str:
            continue
        try:
            start = _parse_datetime(start_str)
            end = _parse_datetime(end_str)
        except Exception:
            continue

        # duration may be in minutes (float) if present
        try:
            duration_minutes = float(w.get("duration", "0"))
        except ValueError:
            duration_minutes = 0.0

        # Heart rate stats (optional) are sometimes included as WorkoutStatistics children
        avg_hr = None
        max_hr = None
        for stat in w.findall("WorkoutStatistics"):
            if stat.get("type") == "HKQuantityTypeIdentifierHeartRate":
                try:
                    avg_hr = float(stat.get("average")) if stat.get("average") is not None else None
                except (TypeError, ValueError):
                    avg_hr = None
                try:
                    max_hr = float(stat.get("maximum")) if stat.get("maximum") is not None else None
                except (TypeError, ValueError):
                    max_hr = None
                break

        is_hi = wtype in HIGH_INTENSITY_WORKOUTS
        record = WorkoutRecord(
            workout_type=wtype,
            start_time=start,
            end_time=end,
            duration_minutes=duration_minutes,
            is_high_intensity=is_hi,
            avg_heart_rate=avg_hr,
            max_heart_rate=max_hr,
            source=source,
        )
        workouts.append(record)

    workouts.sort(key=lambda r: r.start_time)
    logger.info("Extracted %s workouts", len(workouts))
    return workouts

def _process_session(
    session_samples: List[Dict],
    hrv_samples: List[Dict],
    resp_samples: List[Dict],
) -> Optional[EnhancedSleepRecord]:
    if not session_samples:
        return None

    in_bed_time = min(sample["start"] for sample in session_samples)
    final_wake_time = max(sample["end"] for sample in session_samples)

    asleep_samples = [s for s in session_samples if s["value"] in SLEEP_VALUES_ASLEEP]
    if not asleep_samples:
        return None

    first_sleep = min(s["start"] for s in asleep_samples)
    sleep_end = max(s["end"] for s in asleep_samples)

    duration_minutes = sum(
        (s["end"] - s["start"]).total_seconds() / 60
        for s in asleep_samples
    )
    duration_hours = duration_minutes / 60

    time_in_bed_minutes = (final_wake_time - in_bed_time).total_seconds() / 60
    time_in_bed_hours = time_in_bed_minutes / 60
    sleep_efficiency = (duration_minutes / time_in_bed_minutes) * 100 if time_in_bed_minutes else 0.0

    stage_minutes = defaultdict(float)
    for sample in asleep_samples:
        stage = SLEEP_VALUES_STAGE_MAP.get(sample["value"])
        if stage:
            stage_minutes[stage] += (sample["end"] - sample["start"]).total_seconds() / 60

    awake_samples = [s for s in session_samples if s["value"] == SLEEP_VALUE_AWAKE and s["start"] >= first_sleep]
    waso_minutes = sum((s["end"] - s["start"]).total_seconds() / 60 for s in awake_samples)

    sol_minutes = (first_sleep - in_bed_time).total_seconds() / 60 if first_sleep > in_bed_time else 0.0

    hrv_value = _average_in_window(hrv_samples, first_sleep, sleep_end)
    resp_value = _average_in_window(resp_samples, first_sleep, sleep_end)

    deep_minutes = stage_minutes.get("deep")
    rem_minutes = stage_minutes.get("rem")
    core_minutes = stage_minutes.get("core")

    deep_percent = (deep_minutes / duration_minutes * 100) if deep_minutes and duration_minutes else None
    rem_percent = (rem_minutes / duration_minutes * 100) if rem_minutes and duration_minutes else None
    core_percent = (core_minutes / duration_minutes * 100) if core_minutes and duration_minutes else None

    device_type = session_samples[0].get("source")
    date_str = first_sleep.date().isoformat()

    record = EnhancedSleepRecord(
        date=date_str,
        device_type=device_type,
        start_time=first_sleep,
        end_time=sleep_end,
        in_bed_time=in_bed_time,
        final_wake_time=final_wake_time,
        duration_hours=round(duration_hours, 2),
        time_in_bed_hours=round(time_in_bed_hours, 2),
        sleep_efficiency=round(sleep_efficiency, 1),
        deep_sleep_minutes=_round_or_none(deep_minutes),
        rem_sleep_minutes=_round_or_none(rem_minutes),
        core_sleep_minutes=_round_or_none(core_minutes),
        awake_minutes=_round_or_none(sum((s["end"] - s["start"]).total_seconds() / 60 for s in session_samples if s["value"] == SLEEP_VALUE_AWAKE)),
        waso_minutes=_round_or_none(waso_minutes),
        sol_minutes=_round_or_none(sol_minutes),
        hrv_rmssd_sleep=_round_or_none(hrv_value),
        avg_respiratory_rate=_round_or_none(resp_value),
        deep_sleep_percent=_round_or_none(deep_percent),
        rem_sleep_percent=_round_or_none(rem_percent),
        core_sleep_percent=_round_or_none(core_percent),
        has_sleep_stages=any(stage_minutes.values()),
        has_hrv=hrv_value is not None,
    )

    return record


def _average_in_window(samples: List[Dict], start: datetime, end: datetime) -> Optional[float]:
    window_values = [s["value"] for s in samples if start <= s["timestamp"] <= end]
    if not window_values:
        return None
    return float(np.mean(window_values))


def _round_or_none(value: Optional[float], precision: int = 1) -> Optional[float]:
    if value is None:
        return None
    return round(float(value), precision)


def _add_consistency(records: List[EnhancedSleepRecord], window_days: int) -> None:
    if not records:
        return

    bedtimes = []
    for record in records:
        bedtime = record.start_time
        minutes = bedtime.hour * 60 + bedtime.minute
        if bedtime.hour < 6:
            minutes += 24 * 60
        bedtimes.append(minutes)

    for idx, record in enumerate(records):
        start_idx = max(0, idx - window_days + 1)
        window = bedtimes[start_idx: idx + 1]
        if len(window) >= 3:
            sd = float(np.std(window, ddof=0))
            record.bedtime_consistency_sd = round(sd, 1)
            record.days_for_consistency = len(window)
        else:
            record.bedtime_consistency_sd = None
            record.days_for_consistency = len(window)


def _attach_sleep_scores(records: List[EnhancedSleepRecord]) -> None:
    for record in records:
        score_data = calculate_sleep_score(record.to_dict())
        record.sleep_score = score_data["sleep_score"]
        record.sleep_score_version = score_data["sleep_score_version"]
        record.metadata["sleep_components"] = score_data["components"]

