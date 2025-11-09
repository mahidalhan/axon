"""
Load and validate Muse EEG data from CSV files.
Handles 20 participants with pre-computed band power.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class MuseDataLoader:
    """Loader for Muse EEG dataset with 20 participants."""

    # Required columns for band power analysis
    REQUIRED_COLUMNS = [
        'TimeStamp',
        'Delta_TP9', 'Delta_AF7', 'Delta_AF8', 'Delta_TP10',
        'Theta_TP9', 'Theta_AF7', 'Theta_AF8', 'Theta_TP10',
        'Alpha_TP9', 'Alpha_AF7', 'Alpha_AF8', 'Alpha_TP10',
        'Beta_TP9', 'Beta_AF7', 'Beta_AF8', 'Beta_TP10',
        'Gamma_TP9', 'Gamma_AF7', 'Gamma_AF8', 'Gamma_TP10',
    ]

    # Quality indicator columns
    QUALITY_COLUMNS = ['HSI_TP9', 'HSI_AF7', 'HSI_AF8', 'HSI_TP10']

    def __init__(self, dataset_path: str = "Muse EEG Subconscious Decisions Dataset"):
        """
        Initialize loader with dataset path.

        Args:
            dataset_path: Path to the Muse EEG dataset directory
        """
        self.dataset_path = Path(dataset_path)
        self.muse_path = self.dataset_path / "Muse"
        self.local_path = self.dataset_path / "Local"

        if not self.muse_path.exists():
            raise FileNotFoundError(f"Muse data directory not found: {self.muse_path}")

    def load_participant(self, participant_id: int,
                        quality_filter: bool = True,
                        max_rows: Optional[int] = None) -> pd.DataFrame:
        """
        Load EEG data for one participant.

        Args:
            participant_id: Participant ID (0-19)
            quality_filter: Whether to apply HSI quality filtering
            max_rows: Maximum rows to load (for testing/demos)

        Returns:
            DataFrame with cleaned EEG data
        """
        if not 0 <= participant_id <= 19:
            raise ValueError(f"Participant ID must be 0-19, got {participant_id}")

        file_path = self.muse_path / f"museData{participant_id}.csv"

        if not file_path.exists():
            raise FileNotFoundError(f"Participant file not found: {file_path}")

        logger.info(f"Loading participant {participant_id} from {file_path}")

        # Load CSV
        if max_rows:
            df = pd.read_csv(file_path, nrows=max_rows)
        else:
            df = pd.read_csv(file_path)

        initial_rows = len(df)
        logger.info(f"Loaded {initial_rows} rows")

        # Validate required columns
        missing_cols = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")

        # Parse timestamps
        df['TimeStamp'] = pd.to_datetime(df['TimeStamp'], errors='coerce')

        # Remove rows with invalid timestamps
        df = df.dropna(subset=['TimeStamp'])

        # Remove rows that are event markers (Elements column contains paths)
        if 'Elements' in df.columns:
            df = df[df['Elements'].isna() | (df['Elements'] == '')]

        # Remove rows where all band powers are zero (initialization/warmup)
        band_power_cols = [col for col in df.columns if any(
            band in col for band in ['Delta_', 'Theta_', 'Alpha_', 'Beta_', 'Gamma_']
        )]
        df = df[(df[band_power_cols] != 0).any(axis=1)]

        # Apply quality filtering if requested
        if quality_filter and all(col in df.columns for col in self.QUALITY_COLUMNS):
            df = self._apply_quality_filter(df)

        # Sort by timestamp
        df = df.sort_values('TimeStamp').reset_index(drop=True)

        logger.info(f"Cleaned data: {len(df)} rows ({100*len(df)/initial_rows:.1f}% retained)")

        return df

    def _apply_quality_filter(self, df: pd.DataFrame,
                             hsi_threshold: float = 2.5) -> pd.DataFrame:
        """
        Filter samples with poor signal quality based on HSI.

        HSI (Headband Signal Index): Lower is better
        - 1.0 = Good quality
        - 2.0-3.0 = Moderate quality
        - >3.0 = Poor quality

        Args:
            df: DataFrame with HSI columns
            hsi_threshold: Maximum acceptable HSI value

        Returns:
            Filtered DataFrame
        """
        # Keep rows where ALL electrodes have good quality
        # Use lenient threshold since we want to preserve data
        mask = (df[self.QUALITY_COLUMNS] <= hsi_threshold).all(axis=1)

        filtered_df = df[mask].copy()

        logger.info(f"Quality filter: {len(df)} → {len(filtered_df)} samples "
                   f"({100*len(filtered_df)/len(df):.1f}% retained, HSI<={hsi_threshold})")

        return filtered_df

    def load_all_participants(self, quality_filter: bool = True,
                             max_rows_per_participant: Optional[int] = None) -> Dict[int, pd.DataFrame]:
        """
        Load all 20 participants.

        Args:
            quality_filter: Whether to apply HSI quality filtering
            max_rows_per_participant: Limit rows per participant (for testing)

        Returns:
            Dictionary mapping participant_id -> DataFrame
        """
        participants = {}

        for i in range(20):
            try:
                participants[i] = self.load_participant(
                    i,
                    quality_filter=quality_filter,
                    max_rows=max_rows_per_participant
                )
                logger.info(f"✓ Loaded participant {i}: {len(participants[i])} samples")
            except Exception as e:
                logger.error(f"✗ Failed to load participant {i}: {e}")

        return participants

    def get_participant_summary(self, participant_id: int) -> Dict:
        """
        Get summary statistics for a participant without loading full data.

        Args:
            participant_id: Participant ID (0-19)

        Returns:
            Dictionary with summary stats
        """
        file_path = self.muse_path / f"museData{participant_id}.csv"

        if not file_path.exists():
            raise FileNotFoundError(f"Participant file not found: {file_path}")

        # Read just first and last few rows for quick summary
        df_head = pd.read_csv(file_path, nrows=100)

        # Count total rows using wc -l (faster than loading full file)
        import subprocess
        result = subprocess.run(['wc', '-l', str(file_path)],
                              capture_output=True, text=True)
        total_rows = int(result.stdout.split()[0]) - 1  # Subtract header

        # Parse first timestamp
        df_head['TimeStamp'] = pd.to_datetime(df_head['TimeStamp'], errors='coerce')
        start_time = df_head['TimeStamp'].iloc[0]

        # Estimate duration (assuming ~256 Hz sampling)
        estimated_duration_minutes = total_rows / 256 / 60

        return {
            'participant_id': participant_id,
            'total_rows': total_rows,
            'estimated_duration_minutes': round(estimated_duration_minutes, 1),
            'start_time': start_time.isoformat() if pd.notna(start_time) else None,
            'file_path': str(file_path)
        }
