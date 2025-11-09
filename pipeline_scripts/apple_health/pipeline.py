"""High-level Apple Health sleep pipeline."""

from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import Dict, Optional

import pandas as pd

from pipeline_scripts.apple_health.constants import SleepPipelineConfig
from pipeline_scripts.apple_health.parser import parse_apple_health_export, parse_workouts
from pipeline_scripts.utils import ensure_directory, load_config, get_logger

logger = get_logger(__name__)


def process_apple_health_export(
    export_xml: Path,
    output_dir: Path,
    config_path: Optional[Path] = None,
) -> Dict[str, Path]:
    config = load_config(config_path)
    sleep_cfg = SleepPipelineConfig(
        min_session_hours=float(config.apple_health.get("min_session_hours", 3)),
        start_hour_min=int(config.apple_health.get("session_start_hour_min", 18)),
        start_hour_max=int(config.apple_health.get("session_start_hour_max", 2)),
        consistency_window_days=int(config.apple_health.get("consistency_window_days", 7)),
    )

    records = parse_apple_health_export(export_xml, sleep_cfg)
    if not records:
        raise ValueError("No qualifying sleep sessions found in export.")

    output_dir = ensure_directory(Path(output_dir))

    parquet_path = output_dir / "sleep_records.parquet"
    json_path = output_dir / "sleep_records.json"

    df = pd.DataFrame([r.to_dict() for r in records])
    df.to_parquet(parquet_path, index=False)
    json_path.write_text(json.dumps(df.to_dict(orient="records"), indent=2), encoding="utf-8")

    logger.info("Processed %s sleep records", len(records))

    # Workouts (optional)
    workouts = parse_workouts(export_xml)
    workouts_parquet = output_dir / "workouts.parquet"
    workouts_json = output_dir / "workouts.json"
    if workouts:
        wdf = pd.DataFrame([w.to_dict() for w in workouts])
        wdf.to_parquet(workouts_parquet, index=False)
        workouts_json.write_text(json.dumps(wdf.to_dict(orient="records"), indent=2), encoding="utf-8")
        logger.info("Processed %s workouts", len(workouts))
    else:
        # Ensure empty files exist for consistent downstream behavior
        pd.DataFrame([]).to_parquet(workouts_parquet, index=False)
        workouts_json.write_text("[]", encoding="utf-8")
        logger.info("No workouts found in export.")

    return {
        "parquet": parquet_path,
        "json": json_path,
        "workouts_parquet": workouts_parquet,
        "workouts_json": workouts_json,
    }

