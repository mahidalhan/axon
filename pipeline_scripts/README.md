# Data Pipeline Scripts

## Setup
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
pip install -r pipeline_scripts/requirements.txt
```

## Configuration
- Default settings live in `config/pipeline.yaml`.
- Override directories with environment variables:
  - `PIPELINE_RAW_DIR`
  - `PIPELINE_PROCESSED_DIR`

## CLI Entrypoints
- Muse EEG: `python -m pipeline_scripts.muse.cli process data/raw/muse/museData0.csv`
- Apple Health: `python -m pipeline_scripts.apple_health.cli process data/raw/apple_health/export.xml`
- Combined run: `python -m pipeline_scripts.run_pipelines run-all --muse-dir data/raw/muse --apple-export data/raw/apple_health/export.xml`

Functionality will be implemented in subsequent steps per `docs/data-pipeline/`.

