"""Command-line interface for Muse EEG pipeline."""

from pathlib import Path
from typing import Optional

import typer

from pipeline_scripts.muse.pipeline import process_muse_csv

app = typer.Typer(help="Muse EEG data processing pipeline")


@app.command()
def process(
    input_path: Path = typer.Argument(..., exists=True, readable=True, help="Path to Muse CSV file"),
    output_dir: Path = typer.Option(Path("data/processed/muse"), help="Directory for processed outputs"),
    config: Optional[Path] = typer.Option(None, "--config", "-c", help="Optional pipeline config YAML"),
) -> None:
    """Process a Muse CSV file and emit Parquet/JSON outputs."""

    outputs = process_muse_csv(
        csv_path=input_path,
        output_dir=output_dir,
        config_path=config,
    )

    typer.echo("Muse EEG processing complete:")
    for key, path in outputs.items():
        typer.echo(f"  {key}: {path}")

