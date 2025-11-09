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
      daily_brain_scores.csv
    apple_health/
      sleep_records.parquet
      sleep_records.json
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

### daily_brain_scores.csv
- Columns: `date`, `brain_score`, `neural_state`, `consolidation`, `behavior_alignment`, `best_session_id`

### sleep_records.parquet / sleep_records.json
- Columns/fields:
  - `date`, `duration_hours`, `time_in_bed_hours`, `sleep_efficiency`
  - Stage metrics (`deep_sleep_minutes`, `rem_sleep_minutes`, `deep_sleep_percent`, ...)
  - HRV/respiratory metrics
  - `sleep_score`, `sleep_score_version`, component scores if included
  - Consistency metadata (`bedtime_consistency_sd`, `days_for_consistency`)

## Handoff Notes
- Provide sample rows/files alongside scripts to Emergent engineering team.
- Ensure timestamps are ISO 8601 (UTC) and numeric fields use consistent units.
- Document any optional fields that may be null when source data is absent (e.g., HRV, REM).

