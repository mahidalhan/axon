"""
Preprocess EEG data: windowing, normalization, artifact handling.
"""

import numpy as np
import pandas as pd
from typing import List, Optional
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class EEGPreprocessor:
    """Preprocessor for Muse EEG data with windowing and normalization."""

    def __init__(self, sampling_rate: float = 256.0):
        """
        Initialize preprocessor.

        Args:
            sampling_rate: Muse sampling rate in Hz (default: 256 Hz)
        """
        self.sampling_rate = sampling_rate

    def create_windows(self,
                      df: pd.DataFrame,
                      window_seconds: int = 30,
                      overlap: float = 0.5,
                      min_samples: Optional[int] = None) -> List[pd.DataFrame]:
        """
        Create overlapping time windows for LRI calculation.

        Args:
            df: DataFrame with TimeStamp column and band power data
            window_seconds: Window size in seconds (default: 30s per implementation plan)
            overlap: Overlap fraction (0.5 = 50% overlap)
            min_samples: Minimum samples per window (default: 50% of expected)

        Returns:
            List of windowed DataFrames
        """
        if len(df) == 0:
            return []

        # Expected samples per window
        expected_samples = int(window_seconds * self.sampling_rate)

        # Minimum samples (default to 50% of expected)
        if min_samples is None:
            min_samples = int(expected_samples * 0.5)

        # Step size in samples
        step_samples = int(expected_samples * (1 - overlap))

        windows = []
        window_count = 0

        # Create windows by sample count
        for i in range(0, len(df) - min_samples, step_samples):
            window_end = min(i + expected_samples, len(df))
            window = df.iloc[i:window_end].copy()

            # Only include windows with sufficient data
            if len(window) >= min_samples:
                windows.append(window)
                window_count += 1

        logger.info(f"Created {len(windows)} windows "
                   f"(window={window_seconds}s, overlap={overlap*100}%, "
                   f"avg_samples={np.mean([len(w) for w in windows]):.0f})")

        return windows

    def create_time_based_windows(self,
                                  df: pd.DataFrame,
                                  window_minutes: int = 30,
                                  step_minutes: int = 5) -> List[pd.DataFrame]:
        """
        Create fixed time-based windows (alternative to sample-based).

        Useful for creating consistent time periods regardless of sampling gaps.

        Args:
            df: DataFrame with TimeStamp column
            window_minutes: Window size in minutes
            step_minutes: Step between windows in minutes

        Returns:
            List of windowed DataFrames
        """
        if len(df) == 0 or 'TimeStamp' not in df.columns:
            return []

        start_time = df['TimeStamp'].min()
        end_time = df['TimeStamp'].max()

        window_delta = timedelta(minutes=window_minutes)
        step_delta = timedelta(minutes=step_minutes)

        windows = []
        current_start = start_time

        while current_start + window_delta <= end_time:
            window_end = current_start + window_delta

            # Select data in this time window
            mask = (df['TimeStamp'] >= current_start) & (df['TimeStamp'] < window_end)
            window = df[mask].copy()

            if len(window) > 0:
                windows.append(window)

            current_start += step_delta

        logger.info(f"Created {len(windows)} time-based windows "
                   f"(window={window_minutes}min, step={step_minutes}min)")

        return windows

    def normalize_band_power(self,
                            df: pd.DataFrame,
                            method: str = 'zscore',
                            baseline_window: int = 1000) -> pd.DataFrame:
        """
        Normalize band power values.

        Args:
            df: DataFrame with band power columns
            method: Normalization method ('zscore', 'minmax', 'none')
            baseline_window: Rolling window size for z-score normalization

        Returns:
            DataFrame with normalized values (original + _norm columns)
        """
        band_cols = [col for col in df.columns if any(
            band in col for band in ['Delta_', 'Theta_', 'Alpha_', 'Beta_', 'Gamma_']
        )]

        df_norm = df.copy()

        if method == 'zscore':
            for col in band_cols:
                # Rolling z-score normalization
                rolling_mean = df[col].rolling(
                    window=baseline_window,
                    min_periods=1,
                    center=False
                ).mean()

                rolling_std = df[col].rolling(
                    window=baseline_window,
                    min_periods=1,
                    center=False
                ).std()

                # Z-score: (x - mean) / std
                df_norm[f"{col}_norm"] = (df[col] - rolling_mean) / (rolling_std + 1e-6)

            logger.info(f"Applied z-score normalization to {len(band_cols)} band power columns")

        elif method == 'minmax':
            for col in band_cols:
                # Min-max normalization to 0-1 range
                col_min = df[col].min()
                col_max = df[col].max()

                if col_max > col_min:
                    df_norm[f"{col}_norm"] = (df[col] - col_min) / (col_max - col_min)
                else:
                    df_norm[f"{col}_norm"] = 0.0

            logger.info(f"Applied min-max normalization to {len(band_cols)} band power columns")

        elif method == 'none':
            logger.info("No normalization applied")

        else:
            raise ValueError(f"Unknown normalization method: {method}")

        return df_norm

    def remove_artifacts(self,
                        df: pd.DataFrame,
                        amplitude_threshold: float = 100.0) -> pd.DataFrame:
        """
        Remove samples with extreme amplitude artifacts.

        Args:
            df: DataFrame with RAW electrode columns
            amplitude_threshold: Maximum absolute amplitude (microvolts)

        Returns:
            DataFrame with artifacts removed
        """
        raw_cols = [col for col in df.columns if col.startswith('RAW_')]

        if not raw_cols:
            logger.warning("No RAW columns found, skipping artifact removal")
            return df

        # Remove extreme amplitudes (muscle artifacts, eye blinks)
        mask = (df[raw_cols].abs() < amplitude_threshold).all(axis=1)

        df_clean = df[mask].copy()

        logger.info(f"Artifact removal: {len(df)} → {len(df_clean)} samples "
                   f"({100*len(df_clean)/len(df):.1f}% retained)")

        return df_clean

    def compute_derived_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute derived metrics useful for LRI calculation.

        Adds columns:
        - theta_beta_ratio: Theta/Beta ratio (drowsiness indicator)
        - beta_alpha_ratio: Beta/Alpha ratio (arousal indicator)
        - frontal_theta: Average frontal theta (AF7, AF8)
        - frontal_alpha: Average frontal alpha
        - temporal_beta: Average temporal beta (TP9, TP10)

        Args:
            df: DataFrame with band power columns

        Returns:
            DataFrame with additional derived columns
        """
        df_derived = df.copy()

        # Average across electrodes for each band
        for band in ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma']:
            band_cols = [col for col in df.columns if col.startswith(f'{band}_')]
            if band_cols:
                df_derived[f'{band}_avg'] = df[band_cols].mean(axis=1)

        # Theta/Beta ratio (high = drowsy, low = alert)
        if 'Theta_avg' in df_derived.columns and 'Beta_avg' in df_derived.columns:
            df_derived['theta_beta_ratio'] = df_derived['Theta_avg'] / (df_derived['Beta_avg'] + 1e-6)

        # Beta/Alpha ratio (arousal indicator)
        if 'Beta_avg' in df_derived.columns and 'Alpha_avg' in df_derived.columns:
            df_derived['beta_alpha_ratio'] = df_derived['Beta_avg'] / (df_derived['Alpha_avg'] + 1e-6)

        # Frontal activity (focus/attention)
        frontal_theta_cols = ['Theta_AF7', 'Theta_AF8']
        if all(col in df.columns for col in frontal_theta_cols):
            df_derived['frontal_theta'] = df[frontal_theta_cols].mean(axis=1)

        frontal_alpha_cols = ['Alpha_AF7', 'Alpha_AF8']
        if all(col in df.columns for col in frontal_alpha_cols):
            df_derived['frontal_alpha'] = df[frontal_alpha_cols].mean(axis=1)

        # Temporal activity
        temporal_beta_cols = [col for col in df.columns if 'Beta_TP' in col]
        if temporal_beta_cols:
            df_derived['temporal_beta'] = df[temporal_beta_cols].mean(axis=1)

        logger.info(f"Computed {len(df_derived.columns) - len(df.columns)} derived metrics")

        return df_derived

    def get_window_summary(self, window: pd.DataFrame) -> dict:
        """
        Get summary statistics for a window.

        Args:
            window: Windowed DataFrame

        Returns:
            Dictionary with summary stats
        """
        if len(window) == 0:
            return {}

        summary = {
            'n_samples': len(window),
            'start_time': window['TimeStamp'].iloc[0].isoformat() if 'TimeStamp' in window.columns else None,
            'end_time': window['TimeStamp'].iloc[-1].isoformat() if 'TimeStamp' in window.columns else None,
            'duration_seconds': (window['TimeStamp'].iloc[-1] - window['TimeStamp'].iloc[0]).total_seconds()
            if 'TimeStamp' in window.columns else None
        }

        # Average band power
        for band in ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma']:
            band_cols = [col for col in window.columns if col.startswith(f'{band}_')]
            if band_cols:
                summary[f'{band.lower()}_avg'] = float(window[band_cols].mean().mean())

        return summary
