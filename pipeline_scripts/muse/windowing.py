"""Windowing utilities for Muse EEG data."""

from __future__ import annotations

from datetime import timedelta
from typing import Dict, Iterable, List, Optional

import numpy as np
import pandas as pd

from pipeline_scripts.utils import get_logger
from pipeline_scripts.muse.constants import (
    BAND_COLUMNS_LOWER,
    WINDOW_SIZE_SECONDS,
    WINDOW_STEP_SECONDS,
    MIN_WINDOW_COVERAGE,
    EXPECTED_SAMPLE_INTERVAL_SECONDS,
)
from pipeline_scripts.muse.features import compute_window_features

logger = get_logger(__name__)


def infer_sampling_interval(df: pd.DataFrame) -> float:
    diffs = df.index.to_series().diff().dropna().dt.total_seconds()
    if diffs.empty:
        return EXPECTED_SAMPLE_INTERVAL_SECONDS
    # Ignore zero/near-zero gaps (duplicate timestamps) and take a robust median
    positive = diffs[diffs > 0]
    if positive.empty:
        return EXPECTED_SAMPLE_INTERVAL_SECONDS
    median_interval = float(positive.median())
    # Effective average interval over the whole recording (robust to local jitter)
    total_dur = (df.index[-1] - df.index[0]).total_seconds()
    avg_interval = float(total_dur / max(len(df), 1))
    # Use the larger of median and average to avoid unrealistically small intervals
    interval = max(median_interval, avg_interval)
    # Clamp to a reasonable range to avoid pathological inferences
    interval = float(np.clip(interval, 0.005, 2.0))  # 200 Hz .. 0.5 Hz
    return interval


def generate_windows(
    df: pd.DataFrame,
    window_size_seconds: int = WINDOW_SIZE_SECONDS,
    step_seconds: int = WINDOW_STEP_SECONDS,
    min_coverage: float = MIN_WINDOW_COVERAGE,
) -> pd.DataFrame:
    if df.empty:
        raise ValueError("Cannot window empty dataframe.")

    sampling_interval = infer_sampling_interval(df)
    window_samples = max(int(round(window_size_seconds / sampling_interval)), 1)
    step_samples = max(int(round(step_seconds / sampling_interval)), 1)
    min_samples = int(window_samples * min_coverage)

    band_cols = [col for col in BAND_COLUMNS_LOWER if col in df.columns]
    if not band_cols:
        raise ValueError("No band power columns detected in data frame.")

    rows: List[Dict] = []
    total_rows = len(df)

    # If sampling is very high or the dataset is short for a full window,
    # use time-based slicing to avoid overproducing windows.
    use_time_based = sampling_interval < 0.5 or window_samples > total_rows
    if use_time_based:
        session_start = df.index[0]
        session_end = df.index[-1]
        current = session_start
        w_delta = pd.to_timedelta(window_size_seconds, unit="s")
        s_delta = pd.to_timedelta(step_seconds, unit="s")
        while current + w_delta <= session_end:
            w_start = current
            w_end = current + w_delta
            window_df = df.loc[(df.index >= w_start) & (df.index <= w_end)]
            if len(window_df) >= min_samples:
                features = compute_window_features(window_df)
                row = {
                    "window_start": window_df.index[0],
                    "window_end": window_df.index[-1],
                    "num_samples": len(window_df),
                }
                row.update(features)
                rows.append(row)
            current = current + s_delta
    else:
        for start_idx in range(0, total_rows - min_samples + 1, step_samples):
            end_idx = start_idx + window_samples
            window_df = df.iloc[start_idx:end_idx]
            if len(window_df) < min_samples:
                continue

            start_time = window_df.index[0]
            end_time = window_df.index[-1]

            features = compute_window_features(window_df)
            row = {
                "window_start": start_time,
                "window_end": end_time,
                "num_samples": len(window_df),
            }
            row.update(features)
            rows.append(row)

    if not rows:
        raise ValueError("No windows produced; check sampling interval and filters.")

    windows_df = pd.DataFrame(rows)
    windows_df = windows_df.sort_values("window_start").reset_index(drop=True)
    logger.info("Generated %s windows", len(windows_df))
    return windows_df

