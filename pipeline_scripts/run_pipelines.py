"""Top-level runner for Muse EEG and Apple Health pipelines."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional

import typer
import pandas as pd

from pipeline_scripts.muse.pipeline import process_muse_csv
from pipeline_scripts.apple_health.pipeline import process_apple_health_export
from pipeline_scripts.utils import ensure_directory, load_config, get_logger

logger = get_logger(__name__)

app = typer.Typer(help="Execute Muse EEG and Apple Health data pipelines.")


@app.command()
def run_all(
    muse_dir: Path = typer.Option(
        Path("data/raw/muse"),
        help="Directory containing Muse CSV files.",
    ),
    apple_export: Optional[Path] = typer.Option(
        None,
        help="Path to Apple Health export.xml (optional).",
    ),
    output_root: Path = typer.Option(
        Path("data/processed"),
        help="Directory to store processed outputs.",
    ),
    config: Optional[Path] = typer.Option(
        None,
        "--config",
        "-c",
        help="Optional pipeline config YAML.",
    ),
) -> None:
    """Run Muse EEG pipeline for all CSVs and Apple Health pipeline (if provided)."""

    config_path = config
    manifest: Dict[str, List[Dict[str, str]]] = {"muse": [], "apple_health": []}

    muse_output_dir = ensure_directory(output_root / "muse")
    muse_csvs = sorted(Path(muse_dir).glob("*.csv")) if muse_dir.exists() else []

    for csv_path in muse_csvs:
        logger.info("Processing Muse CSV: %s", csv_path)
        outputs = process_muse_csv(csv_path=csv_path, output_dir=muse_output_dir, config_path=config_path)
        manifest["muse"].append({k: str(v) for k, v in outputs.items()})
        _validate_parquet(outputs["windows"], required_columns=["window_start", "lri", "alertness", "focus"])

    apple_outputs = None
    if apple_export and apple_export.exists():
        logger.info("Processing Apple Health export: %s", apple_export)
        apple_output_dir = ensure_directory(output_root / "apple_health")
        apple_outputs = process_apple_health_export(
            export_xml=apple_export,
            output_dir=apple_output_dir,
            config_path=config_path,
        )
        manifest["apple_health"].append({k: str(v) for k, v in apple_outputs.items()})
        _validate_parquet(apple_outputs["parquet"], required_columns=["date", "sleep_score", "sleep_efficiency"])

    manifest_path = output_root / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    typer.echo(f"Pipeline run complete. Manifest written to {manifest_path}")


def _validate_parquet(path: Path, required_columns: List[str]) -> None:
    df = pd.read_parquet(path)
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in {path}: {missing}")


if __name__ == "__main__":
    app()

