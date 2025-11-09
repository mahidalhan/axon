# Pipeline Output Formats

## Directory Structure
```
data/
  raw/
    muse/
      participant_00.csv
      ...
    apple_health/
      export.xml
  processed/
    muse/
      participant_00_windows.parquet
      participant_00_session.json
    apple_health/
      sleep_records.parquet
      sleep_records.json
      workouts.parquet
      workouts.json
    manifest.json
```

## File Details

### participant_<id>_windows.parquet
- Schema:
  - `window_start`, `window_end`
  - Band averages: `delta_tp9`, `theta_af7`, ...
  - Derived ratios: `theta_beta_ratio`, `beta_alpha_ratio`
  - LRI components: `alertness`, `focus`, `arousal_balance`
  - `lri`, `base_lri`, `post_exercise_multiplier`

### participant_<id>_session.json
- Follows `docs/shared/session-analysis-example.md`
- Fields: `session_score`, `optimal_windows`, `time_in_state`, `component_scores`, etc.

### sleep_records.parquet / sleep_records.json
- Columns/fields:
  - `date`, `duration_hours`, `time_in_bed_hours`, `sleep_efficiency`
  - Stage metrics (`deep_sleep_minutes`, `rem_sleep_minutes`, `deep_sleep_percent`, ...)
  - HRV/respiratory metrics
  - `sleep_score`, `sleep_score_version`, component scores if included
  - Consistency metadata (`bedtime_consistency_sd`, `days_for_consistency`)

### workouts.parquet / workouts.json
- Columns/fields:
  - `workout_type`, `start_time`, `end_time`, `duration_minutes`, `is_high_intensity`
  - Optional: `avg_heart_rate`, `max_heart_rate`, `source`

> Note: Demo-only slices live separately:
> - `data/processed/apple_health/sleep_last_20_days.json`
> - `data/processed/apple_health/workouts_last_20_days.json`
> See `docs/data-pipeline/demo-timeline.md` for usage and join rules.

## Handoff Notes
- Run both pipelines together:
  ```bash
  python -m pipeline_scripts.run_pipelines \
    --muse-dir data/raw/muse \
    --apple-export data/raw/apple_health/export.xml \
    --output-root data/processed
  ```
- Provide sample rows/files alongside scripts to Emergent engineering team.
- Ensure timestamps are ISO 8601 (UTC) and numeric fields use consistent units.
- Document any optional fields that may be null when source data is absent (e.g., HRV, REM).

