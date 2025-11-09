from pathlib import Path

import json
import pandas as pd

from pipeline_scripts.muse.pipeline import process_muse_csv


FIXTURE_CSV = Path("tests/fixtures/muse/sample_muse.csv")


def test_process_muse_csv(tmp_path):
    outputs = process_muse_csv(
        csv_path=FIXTURE_CSV,
        output_dir=tmp_path,
    )

    windows_path = outputs["windows"]
    session_path = outputs["session"]

    assert windows_path.exists()
    assert session_path.exists()

    windows_df = pd.read_parquet(windows_path)
    assert "lri" in windows_df.columns
    assert len(windows_df) > 0

    session = json.loads(session_path.read_text())
    assert "session_score" in session
    assert session["peak_lri"] >= session["avg_lri"]

