from pathlib import Path
import json

import pandas as pd

from pipeline_scripts.apple_health.pipeline import process_apple_health_export


FIXTURE_XML = Path("tests/fixtures/apple_health/sample_export.xml")


def test_process_apple_health_export(tmp_path):
    outputs = process_apple_health_export(
        export_xml=FIXTURE_XML,
        output_dir=tmp_path,
    )

    parquet_path = outputs["parquet"]
    json_path = outputs["json"]

    assert parquet_path.exists()
    assert json_path.exists()

    df = pd.read_parquet(parquet_path)
    assert len(df) == 2
    for column in [
        "date",
        "duration_hours",
        "sleep_efficiency",
        "sleep_score",
        "sleep_score_version",
    ]:
        assert column in df.columns

    json_data = json.loads(json_path.read_text())
    assert len(json_data) == 2
    assert all("sleep_score" in record for record in json_data)

