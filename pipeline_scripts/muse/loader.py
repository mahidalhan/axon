"""Functions for loading and cleaning Muse EEG CSV data."""

from __future__ import annotations

import pandas as pd
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from pipeline_scripts.utils import get_logger
from pipeline_scripts.muse.constants import (
    BAND_COLUMNS,
    BAND_COLUMNS_LOWER,
    HSI_COLUMNS,
    HSI_COLUMNS_LOWER,
    TIMESTAMP_COLUMN,
    DEFAULT_HSI_THRESHOLD,
)

logger = get_logger(__name__)


def _standardise_columns(columns: Iterable[str]) -> Dict[str, str]:
    mapping = {}
    for col in columns:
        lower = col.lower()
        if lower in BAND_COLUMNS_LOWER:
            mapping[col] = lower
        elif lower in HSI_COLUMNS_LOWER:
            mapping[col] = lower
        elif lower == "timestamp":
            mapping[col] = TIMESTAMP_COLUMN
        else:
            mapping[col] = lower
    return mapping


def load_clean_data(
    csv_path: Path,
    hsi_threshold: float = DEFAULT_HSI_THRESHOLD,
    chunk_size: int = 100_000,
) -> pd.DataFrame:
    """Load Muse CSV and apply cleaning filters."""
    csv_path = Path(csv_path)
    if not csv_path.is_file():
        raise FileNotFoundError(f"Muse CSV not found: {csv_path}")

    parts: List[pd.DataFrame] = []

    for chunk in pd.read_csv(csv_path, chunksize=chunk_size):
        chunk = chunk.rename(columns=_standardise_columns(chunk.columns))

        if TIMESTAMP_COLUMN not in chunk.columns:
            raise ValueError("Timestamp column required in Muse CSV data.")

        chunk[TIMESTAMP_COLUMN] = pd.to_datetime(chunk[TIMESTAMP_COLUMN], errors="coerce")
        chunk = chunk.dropna(subset=[TIMESTAMP_COLUMN])
        chunk = chunk.sort_values(TIMESTAMP_COLUMN)

        # Drop warmup rows (all band powers zero)
        band_cols_present = [col for col in BAND_COLUMNS_LOWER if col in chunk.columns]
        if band_cols_present:
            band_zero_mask = (chunk[band_cols_present].abs().sum(axis=1) == 0)
            chunk = chunk.loc[~band_zero_mask]

        # HSI filtering
        hsi_cols_present = [col for col in HSI_COLUMNS_LOWER if col in chunk.columns]
        if hsi_cols_present:
            hsi_mask = (chunk[hsi_cols_present] <= hsi_threshold).all(axis=1)
            chunk = chunk.loc[hsi_mask]

        if not chunk.empty:
            parts.append(chunk)

    if not parts:
        raise ValueError("No data left after cleaning filters.")

    df = pd.concat(parts, ignore_index=True)
    df = df.set_index(TIMESTAMP_COLUMN).sort_index()

    logger.info(
        "Loaded %s rows for %s after cleaning",
        len(df),
        csv_path.name,
    )

    return df

