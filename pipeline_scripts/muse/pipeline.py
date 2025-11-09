"""High-level orchestration for Muse EEG pipeline."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Optional

import pandas as pd

from pipeline_scripts.utils import ensure_directory, get_logger, load_config
from pipeline_scripts.muse.loader import load_clean_data
from pipeline_scripts.muse.windowing import generate_windows
from pipeline_scripts.muse.lri import LRICalculator
from pipeline_scripts.muse.session import SessionAnalyzer

logger = get_logger(__name__)


def process_muse_csv(
    csv_path: Path,
    output_dir: Path,
    config_path: Optional[Path] = None,
) -> Dict[str, Path]:
    config = load_config(config_path)

    muse_cfg = config.muse
    cleaned_df = load_clean_data(
        csv_path,
        hsi_threshold=float(muse_cfg.get("hsi_threshold", 2.5)),
    )

    windows_df = generate_windows(
        cleaned_df,
        window_size_seconds=int(muse_cfg.get("window_size_seconds", 30)),
        step_seconds=int(muse_cfg.get("window_overlap_seconds", 15)),
        min_coverage=float(muse_cfg.get("min_window_coverage", 0.8)),
    )

    lri_calc = LRICalculator()
    lri_metrics = windows_df.apply(
        lambda row: lri_calc.calculate(row.to_dict()),
        axis=1,
        result_type="expand",
    )
    windows_df = pd.concat([windows_df, lri_metrics], axis=1)

    analyzer = SessionAnalyzer(lri_calc)
    session_summary = analyzer.analyse(windows_df)

    output_dir = ensure_directory(Path(output_dir))
    participant_id = csv_path.stem.split("_")[-1]

    windows_path = output_dir / f"participant_{participant_id}_windows.parquet"
    session_path = output_dir / f"participant_{participant_id}_session.json"

    windows_df.to_parquet(windows_path, index=False)
    session_path.write_text(json.dumps(session_summary, indent=2), encoding="utf-8")

    logger.info("Processed Muse session written to %s", output_dir)

    return {
        "windows": windows_path,
        "session": session_path,
    }

