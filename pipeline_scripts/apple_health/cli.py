"""Command-line interface for Apple Health sleep pipeline."""

from pathlib import Path
from typing import Optional

import typer

from pipeline_scripts.apple_health.pipeline import process_apple_health_export

app = typer.Typer(help="Apple Health sleep data processing pipeline")


@app.command()
def process(
    export_xml: Path = typer.Argument(..., exists=True, readable=True, help="Path to Apple Health export.xml"),
    output_dir: Path = typer.Option(Path("data/processed/apple_health"), help="Directory for processed outputs"),
    config: Optional[Path] = typer.Option(None, "--config", "-c", help="Optional pipeline config YAML"),
) -> None:
    """Process Apple Health export and emit cleaned sleep records."""

    outputs = process_apple_health_export(
        export_xml=export_xml,
        output_dir=output_dir,
        config_path=config,
    )

    typer.echo("Apple Health processing complete:")
    for key, path in outputs.items():
        typer.echo(f"  {key}: {path}")

