"""Read-only demo API to serve hackathon artifacts from data/processed/muse."""

from __future__ import annotations

from pathlib import Path
from typing import List, Dict, Any
import csv
import json

from fastapi import FastAPI, HTTPException


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "processed" / "muse"

app = FastAPI(title="Axon Demo API", version="0.1.0")


def _read_json(path: Path) -> Any:
    if not path.is_file():
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _read_csv_as_dicts(path: Path) -> List[Dict[str, str]]:
    if not path.is_file():
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


@app.get("/demo/timeline")
def get_timeline() -> Any:
    return _read_json(DATA_DIR / "timeline.json")


@app.get("/demo/daily-sessions")
def get_daily_sessions() -> Any:
    return _read_json(DATA_DIR / "daily_sessions.json")


@app.get("/demo/daily-brain-scores")
def get_daily_brain_scores() -> Dict[str, Any]:
    rows = _read_csv_as_dicts(DATA_DIR / "daily_brain_scores.csv")
    return {"rows": rows}


# To run:
# uvicorn pipeline_scripts.api_demo:app --reload


