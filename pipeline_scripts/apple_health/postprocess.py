"""Post-processing utilities to produce last-20-day sleep and workout slices."""

from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple
import xml.etree.ElementTree as ET

import pandas as pd

from pipeline_scripts.apple_health.constants import (
    SLEEP_RECORD_TYPE,
    SLEEP_VALUES_ASLEEP,
    SLEEP_VALUES_IN_BED,
    SLEEP_VALUE_AWAKE,
)
from pipeline_scripts.apple_health.scoring import calculate_sleep_score
from pipeline_scripts.utils import get_logger, ensure_directory

logger = get_logger(__name__)

# Some exports include "AsleepUnspecified" — treat as asleep if present.
ASLEEP_LIKE_VALUES = set(SLEEP_VALUES_ASLEEP) | {"HKCategoryValueSleepAnalysisAsleepUnspecified"}


def _parse_dt(text: str) -> datetime:
    # Accepts strings like "2025-02-09 19:59:33 -0800"
    # datetime.fromisoformat supports "+/-HH:MM" but not "+/-HHMM" without colon.
    # Replace trailing " -0800" with "-08:00"
    text = text.strip()
    if len(text) >= 6 and (text[-6] in ("+", "-")) and text[-3] == ":":
        return datetime.fromisoformat(text)
    if len(text) >= 5 and (text[-5] in ("+", "-")) and text[-3] != ":":
        # e.g., "-0800" → "-08:00"
        text = text[:-5] + text[-5:-2] + ":" + text[-2:]
    return datetime.fromisoformat(text)


def _load_sleep_records_json(path: Path) -> List[Dict]:
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logger.warning("Failed to read %s; proceeding with empty list", path)
        return []


def _extract_sleep_records_from_xml(export_xml: Path) -> List[Dict]:
    """Extract raw sleep Record entries from export.xml."""
    tree = ET.parse(export_xml)
    root = tree.getroot()

    samples: List[Dict] = []
    for record in root.findall(".//Record"):
        if record.get("type") != SLEEP_RECORD_TYPE:
            continue
        start = record.get("startDate")
        end = record.get("endDate")
        value = record.get("value")
        if not start or not end:
            continue
        try:
            s_dt = _parse_dt(start)
            e_dt = _parse_dt(end)
        except Exception:
            continue
        samples.append({"start": s_dt, "end": e_dt, "value": value})
    samples.sort(key=lambda r: r["start"])
    return samples


def _group_nights_coarse(samples: List[Dict], gap_hours: float = 3.0) -> List[List[Dict]]:
    """Group sleep samples into coarse nights by gap threshold."""
    if not samples:
        return []
    sessions: List[List[Dict]] = []
    current: List[Dict] = []
    for rec in samples:
        if not current:
            current = [rec]
            continue
        gap = (rec["start"] - current[-1]["end"]).total_seconds() / 3600.0
        if gap > gap_hours:
            sessions.append(current)
            current = [rec]
        else:
            current.append(rec)
    if current:
        sessions.append(current)
    return sessions


def _choose_date_for_session(first_start: datetime) -> str:
    """Choose a display date per plan: if hour < 6, roll to next day."""
    if first_start.hour < 6:
        return (first_start + timedelta(days=1)).date().isoformat()
    return first_start.date().isoformat()


def _build_coarse_record(session: List[Dict]) -> Optional[Dict]:
    if not session:
        return None
    start_time = min(s["start"] for s in session)
    end_time = max(s["end"] for s in session)
    total_minutes = (end_time - start_time).total_seconds() / 60.0
    if total_minutes < 60:  # discard very short sessions
        return None

    asleep_minutes = 0.0
    for s in session:
        if s["value"] in ASLEEP_LIKE_VALUES:
            asleep_minutes += (s["end"] - s["start"]).total_seconds() / 60.0

    # Compute metrics with graceful degradation
    duration_hours = asleep_minutes / 60.0 if asleep_minutes > 0 else total_minutes / 60.0
    time_in_bed_hours = total_minutes / 60.0
    sleep_eff = (asleep_minutes / total_minutes * 100.0) if total_minutes > 0 and asleep_minutes > 0 else None

    record = {
        "date": _choose_date_for_session(start_time),
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_hours": round(duration_hours, 2),
        "time_in_bed_hours": round(time_in_bed_hours, 2),
        "sleep_efficiency": round(sleep_eff, 1) if sleep_eff is not None else None,
        # optional fields absent
        "deep_sleep_percent": None,
        "rem_sleep_percent": None,
        "hrv_rmssd_sleep": None,
        "bedtime_consistency_sd": None,
        "days_for_consistency": 0,
        "waso_minutes": None,
        "sol_minutes": None,
        "avg_respiratory_rate": None,
        "record_quality": "staged" if asleep_minutes > 0 else "in_bed_only",
    }

    score = calculate_sleep_score(record)
    record["sleep_score"] = score["sleep_score"]
    record["sleep_score_version"] = score["sleep_score_version"]
    record["metadata"] = {"sleep_components": score["components"]}

    return record


def build_sleep_last_20(
    export_xml: Path,
    staged_sleep_json: Path,
    output_path: Path,
) -> Path:
    """Combine staged nights with coarse nights to produce last 20 distinct dates."""
    staged = _load_sleep_records_json(staged_sleep_json)
    by_date: Dict[str, Dict] = {}
    for r in staged:
        d = r.get("date")
        if not d:
            continue
        by_date[d] = r

    # If fewer than 20 dates, augment with coarse parsing
    if len(by_date) < 20:
        samples = _extract_sleep_records_from_xml(export_xml)
        sessions = _group_nights_coarse(samples, gap_hours=3.0)
        coarse_records: List[Dict] = []
        for sess in sessions:
            rec = _build_coarse_record(sess)
            if rec:
                coarse_records.append(rec)
        # Merge, prefer staged over coarse for the same date
        for rec in coarse_records:
            d = rec["date"]
            if d not in by_date:
                by_date[d] = rec

    # Select last 20 dates (most recent first)
    dates_sorted = sorted(by_date.keys())
    last20 = [by_date[d] for d in dates_sorted[-20:]]
    out_dir = ensure_directory(output_path.parent)
    output_path.write_text(json.dumps(last20, indent=2), encoding="utf-8")
    logger.info("Wrote %s with %s nights", output_path, len(last20))
    return output_path


def build_workouts_last_20(workouts_json: Path, output_path: Path) -> Path:
    """Slice workouts.json to last 20 distinct dates by start_time date."""
    if not workouts_json.exists():
        output_path.write_text("[]", encoding="utf-8")
        logger.info("No workouts.json found; wrote empty %s", output_path)
        return output_path
    rows = json.loads(workouts_json.read_text(encoding="utf-8"))
    # Build by date dict (most recent wins)
    rows_sorted = sorted(rows, key=lambda r: r.get("start_time", ""))
    by_date: Dict[str, Dict] = {}
    for r in rows_sorted:
        ts = r.get("start_time")
        if not ts:
            continue
        try:
            dt = _parse_dt(ts)
        except Exception:
            continue
        by_date[dt.date().isoformat()] = r
    dates_sorted = sorted(by_date.keys())
    last20 = [by_date[d] for d in dates_sorted[-20:]]
    output_path.write_text(json.dumps(last20, indent=2), encoding="utf-8")
    logger.info("Wrote %s with %s workouts", output_path, len(last20))
    return output_path


