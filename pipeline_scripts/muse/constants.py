"""Constants and helper utilities for Muse EEG processing."""

from __future__ import annotations

BAND_PREFIXES = ["delta", "theta", "alpha", "beta", "gamma"]
CHANNELS = ["tp9", "af7", "af8", "tp10"]

BAND_COLUMNS = [f"{band}_{ch}".upper() for band in BAND_PREFIXES for ch in ["tp9", "af7", "af8", "tp10"]]
BAND_COLUMNS_LOWER = [col.lower() for col in BAND_COLUMNS]

HSI_COLUMNS = ["HSI_TP9", "HSI_AF7", "HSI_AF8", "HSI_TP10"]
HSI_COLUMNS_LOWER = [col.lower() for col in HSI_COLUMNS]

TIMESTAMP_COLUMN = "timestamp"

DERIVED_COLUMNS = [
    "theta_beta_ratio_tp9",
    "theta_beta_ratio_af7",
    "theta_beta_ratio_af8",
    "theta_beta_ratio_tp10",
    "beta_alpha_ratio_tp9",
    "beta_alpha_ratio_af7",
    "beta_alpha_ratio_af8",
    "beta_alpha_ratio_tp10",
    "frontal_theta_avg",
    "posterior_alpha_avg",
]

EXPECTED_SAMPLE_INTERVAL_SECONDS = 1.0
WINDOW_SIZE_SECONDS = 30
WINDOW_STEP_SECONDS = 15
MIN_WINDOW_COVERAGE = 0.8

DEFAULT_HSI_THRESHOLD = 2.5

