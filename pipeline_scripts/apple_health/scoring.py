"""Neuroplasticity Sleep Score calculation."""

from __future__ import annotations

from typing import Dict, Optional


def score_duration(hours: float) -> float:
    if hours is None:
        return 50.0
    if 7 <= hours <= 9:
        return 100.0
    if 6 <= hours < 7:
        return 80 - (7 - hours) * 40
    if 9 < hours <= 10:
        return 80 - (hours - 9) * 40
    return max(40.0, 100 - abs(hours - 8) * 15)


def score_efficiency(efficiency_pct: float) -> float:
    if efficiency_pct is None:
        return 50.0
    if efficiency_pct >= 85:
        return 100.0
    if efficiency_pct >= 75:
        return 70 + (efficiency_pct - 75) * 3.0
    return max(40.0, efficiency_pct * 0.93)


def score_waso(minutes: float) -> float:
    if minutes is None:
        return 60.0
    # Doc spec thresholds: 15, 30, 60 minutes
    if minutes <= 15:
        return 100.0
    if minutes <= 30:
        # 100 at 15 → 70 at 30 (slope -2 per min)
        return max(40.0, 100.0 - (minutes - 15.0) * 2.0)
    if minutes <= 60:
        # 70 at 30 → 40 at 60 (slope -1 per min)
        return max(40.0, 70.0 - (minutes - 30.0) * 1.0)
    # Beyond 60, clamp to floor
    return 40.0


def score_sol(minutes: float) -> float:
    if minutes is None:
        return 60.0
    # Doc spec: special handling for <5 min (sleep deprivation flag)
    if minutes < 5:
        return 50.0
    if minutes <= 15:
        return 100.0
    if minutes <= 20:
        # Still considered optimal up to 20
        return 100.0
    if minutes <= 30:
        # 20–30: 100 down by 3 per min → 70 at 30
        return 100.0 - (minutes - 20.0) * 3.0
    # >30: decay from 70 downward (e.g., -2 per min, floor 40)
    return max(40.0, 70.0 - (minutes - 30.0) * 2.0)


def score_consistency(sd_minutes: Optional[float]) -> float:
    if sd_minutes is None:
        return 60.0
    if sd_minutes <= 30:
        return 100.0
    if sd_minutes <= 60:
        return 80 - (sd_minutes - 30) * 0.7
    return max(40.0, 100 - (sd_minutes - 30) * 1.2)


def _hrv_optimal_range_for_age(age: int) -> (float, float):
    """
    Approximate age-adjusted optimal RMSSD ranges (ms), based on normative trends.
    Returns (low, high). Interpolated by decade.
    """
    # Anchor points by age (years): (low, high)
    anchors = {
        20: (55.0, 105.0),
        30: (45.0, 90.0),
        40: (38.0, 80.0),
        50: (30.0, 70.0),
        60: (25.0, 60.0),
        70: (20.0, 55.0),
    }
    if age <= 20:
        return anchors[20]
    if age >= 70:
        return anchors[70]
    # Linear interpolation between nearest decade anchors
    lower_decade = (age // 10) * 10
    upper_decade = lower_decade + 10
    low0, high0 = anchors.get(lower_decade, anchors[20])
    low1, high1 = anchors.get(upper_decade, anchors[70])
    t = (age - lower_decade) / 10.0
    low = low0 + (low1 - low0) * t
    high = high0 + (high1 - high0) * t
    return float(low), float(high)


def score_hrv(hrv_rmssd: Optional[float], age: Optional[int] = None) -> float:
    """
    Age-adjusted HRV (RMSSD) scoring.
    - If age provided: 100 inside age-adjusted optimal range; taper below/above.
    - If age missing: fallback thresholds similar to earlier implementation.
    """
    if hrv_rmssd is None:
        return 0.0
    if age is None:
        # Fallback to fixed thresholds
        if hrv_rmssd >= 80:
            return 100.0
        if hrv_rmssd >= 50:
            return 60.0 + (hrv_rmssd - 50.0) * 1.333
        return max(30.0, hrv_rmssd * 1.2)

    low, high = _hrv_optimal_range_for_age(int(age))
    if hrv_rmssd <= 0:
        return 30.0
    if hrv_rmssd < low:
        # Scale from 30 at 0 → 100 at low
        return max(30.0, 30.0 + 70.0 * (hrv_rmssd / low))
    if hrv_rmssd <= high:
        return 100.0
    # Above optimal: gentle taper down to 60 at 2×high
    excess_ratio = (hrv_rmssd - high) / max(high, 1e-6)
    return max(60.0, 100.0 - 40.0 * excess_ratio)


def score_respiratory_rate(rate: Optional[float]) -> float:
    if rate is None:
        return 60.0
    if 12 <= rate <= 16:
        return 100.0
    diff = abs(rate - 14)
    return max(40.0, 100 - diff * 10)


def score_deep_sleep_percent(percent: Optional[float]) -> float:
    if percent is None:
        return 60.0
    if 15 <= percent <= 25:
        return 100.0
    if percent < 15:
        return max(30.0, percent * 4)
    return max(50.0, 100 - (percent - 25) * 5)


def calculate_sleep_score(record: Dict) -> Dict:
    """Compute sleep score and components."""

    duration_score = score_duration(record.get("duration_hours"))
    efficiency_score = score_efficiency(record.get("sleep_efficiency"))
    consistency_score = score_consistency(record.get("bedtime_consistency_sd"))
    waso_score = score_waso(record.get("waso_minutes"))
    sol_score = score_sol(record.get("sol_minutes"))
    resp_score = score_respiratory_rate(record.get("avg_respiratory_rate"))
    deep_percent_score = score_deep_sleep_percent(record.get("deep_sleep_percent"))
    # Optional age-adjustment; fall back gracefully if age not provided
    user_age = record.get("age") or record.get("user_age")
    hrv_score = score_hrv(record.get("hrv_rmssd_sleep"), age=user_age)

    if record.get("hrv_rmssd_sleep") is not None:
        total_score = (
            0.30 * duration_score
            + 0.25 * efficiency_score
            + 0.10 * hrv_score
            + 0.10 * consistency_score
            + 0.10 * waso_score
            + 0.05 * sol_score
            + 0.05 * resp_score
            + 0.05 * deep_percent_score
        )
        version = "hrv_enabled"
    else:
        total_score = (
            0.35 * duration_score
            + 0.30 * efficiency_score
            + 0.15 * consistency_score
            + 0.10 * waso_score
            + 0.05 * sol_score
            + 0.05 * resp_score
        )
        version = "base"

    return {
        "sleep_score": round(total_score, 1),
        "sleep_score_version": version,
        "components": {
            "duration": round(duration_score, 1),
            "efficiency": round(efficiency_score, 1),
            "consistency": round(consistency_score, 1),
            "waso": round(waso_score, 1),
            "sol": round(sol_score, 1),
            "respiratory_rate": round(resp_score, 1),
            "deep_sleep_percent": round(deep_percent_score, 1),
            "hrv": round(hrv_score, 1),
        },
    }

