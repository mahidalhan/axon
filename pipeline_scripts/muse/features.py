"""Feature extraction for Muse EEG windows."""

from __future__ import annotations

import numpy as np
import pandas as pd
from typing import Dict, List

from pipeline_scripts.muse.constants import BAND_COLUMNS_LOWER, CHANNELS


def compute_window_features(window_df: pd.DataFrame) -> Dict:
    features: Dict[str, float] = {}

    for col in BAND_COLUMNS_LOWER:
        if col in window_df.columns:
            features[col] = float(window_df[col].mean())

    # Derived ratios per channel
    for ch in CHANNELS:
        theta_col = f"theta_{ch}"
        beta_col = f"beta_{ch}"
        alpha_col = f"alpha_{ch}"

        if theta_col in window_df and beta_col in window_df:
            ratio = window_df[theta_col].mean() / (window_df[beta_col].mean() + 1e-6)
            features[f"theta_beta_ratio_{ch}"] = float(ratio)

        if beta_col in window_df and alpha_col in window_df:
            ratio = window_df[beta_col].mean() / (window_df[alpha_col].mean() + 1e-6)
            features[f"beta_alpha_ratio_{ch}"] = float(ratio)

    frontal_theta_cols = [col for col in ["theta_af7", "theta_af8"] if col in window_df.columns]
    if frontal_theta_cols:
        features["frontal_theta_avg"] = float(window_df[frontal_theta_cols].mean().mean())

    posterior_alpha_cols = [col for col in ["alpha_tp9", "alpha_tp10"] if col in window_df.columns]
    if posterior_alpha_cols:
        features["posterior_alpha_avg"] = float(window_df[posterior_alpha_cols].mean().mean())

    features["hs_i_mean"] = float(window_df[[c for c in window_df.columns if c.startswith("hsi_")]].mean().mean())
    return features

