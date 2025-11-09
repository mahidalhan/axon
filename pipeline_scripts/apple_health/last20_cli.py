"""CLI to produce last-20-day slices for sleep and workouts."""

from __future__ import annotations

from pathlib import Path
import typer

from pipeline_scripts.apple_health.postprocess import (
    build_sleep_last_20,
    build_workouts_last_20,
)

app = typer.Typer(help="Produce last-20 sleep/workout slices from Apple Health outputs.")


@app.command()
def sleep(
    export_xml: Path = typer.Argument(..., exists=True, readable=True, help="Path to Apple Health export.xml"),
    staged_sleep_json: Path = typer.Option(
        Path("data/processed/apple_health/sleep_records.json"),
        "--staged",
        help="Path to staged sleep_records.json (if available).",
    ),
    output_path: Path = typer.Option(
        Path("data/processed/apple_health/sleep_last_20_days.json"),
        "--out",
        help="Output path for last-20 sleep JSON.",
    ),
) -> None:
    build_sleep_last_20(export_xml, staged_sleep_json, output_path)
    typer.echo(f"Wrote {output_path}")


@app.command()
def workouts(
    workouts_json: Path = typer.Argument(
        Path("data/processed/apple_health/workouts.json"),
        exists=True,
        readable=True,
        help="Path to workouts.json produced by Apple Health pipeline.",
    ),
    output_path: Path = typer.Option(
        Path("data/processed/apple_health/workouts_last_20_days.json"),
        "--out",
        help="Output path for last-20 workouts JSON.",
    ),
) -> None:
    build_workouts_last_20(workouts_json, output_path)
    typer.echo(f"Wrote {output_path}")


@app.command()
def both(
    export_xml: Path = typer.Argument(..., exists=True, readable=True, help="Path to Apple Health export.xml"),
    staged_sleep_json: Path = typer.Option(
        Path("data/processed/apple_health/sleep_records.json"),
        "--staged",
        help="Path to staged sleep_records.json (if available).",
    ),
    workouts_json: Path = typer.Option(
        Path("data/processed/apple_health/workouts.json"),
        "--workouts",
        help="Path to workouts.json produced by Apple Health pipeline.",
    ),
    sleep_out: Path = typer.Option(
        Path("data/processed/apple_health/sleep_last_20_days.json"),
        "--sleep-out",
        help="Output path for last-20 sleep JSON.",
    ),
    workouts_out: Path = typer.Option(
        Path("data/processed/apple_health/workouts_last_20_days.json"),
        "--workouts-out",
        help="Output path for last-20 workouts JSON.",
    ),
) -> None:
    build_sleep_last_20(export_xml, staged_sleep_json, sleep_out)
    build_workouts_last_20(workouts_json, workouts_out)
    typer.echo(f"Wrote {sleep_out} and {workouts_out}")


if __name__ == "__main__":
    app()


