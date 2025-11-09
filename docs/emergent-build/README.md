# Emergent Build Guide

This directory packages all specifications needed for Emergent’s agents to construct the FastAPI backend and frontend UI.

- `backend.md` – API contracts, endpoints, payload schemas.
- `ui.md` – Screen layouts, component requirements, copy points.
- `education.md` – Sleep/neuroplasticity educational content for in-app use.

## Data availability for Emergent
- Cleaned outputs are included in-repo under `data/processed/`:
  - Muse: `data/processed/muse/participant_*_{windows.parquet,session.json}`
  - Apple Health: `data/processed/apple_health/{sleep_records.json,workouts.json}`
  - Demo slices: `data/processed/apple_health/{sleep_last_20_days.json,workouts_last_20_days.json}`
- See `docs/data-pipeline/outputs.md` and `docs/data-pipeline/demo-timeline.md` for schemas and join rules.

