# FastAPI Backend Specification

## Overview
Emergent backend should expose endpoints aligning with the session-first Brain Score MVP. All payloads assume cleaned data produced according to `docs/data-pipeline/`.

## Endpoints

### POST `/api/session/analyze`
- **Description:** Analyze a processed Muse EEG session.
- **Request:**
  ```json
  {
    "participant_id": 0,
    "max_hours": 1.0
  }
  ```
- **Response:** `session_analysis` object identical to `docs/shared/session-analysis-example.md`.

### GET `/api/sleep/last20`
- Returns the demo slice from `data/processed/apple_health/sleep_last_20_days.json`
- Response: array of `SleepNight` (see `docs/shared/data-schemas.md`)

### GET `/api/workouts/last20`
- Returns the demo slice from `data/processed/apple_health/workouts_last_20_days.json`
- Response: array of `WorkoutSession` (see `docs/shared/data-schemas.md`)

### GET `/api/session/optimal-window-status`
- **Description:** Lightweight status for whether there is an active optimal window right now and its quality.
- **Response:**
  ```json
  {
    "has_window": true,
    "window_start": "2025-11-09T09:15:00Z",
    "window_end": "2025-11-09T09:45:00Z",
    "quality": "excellent"
  }
  ```
  - `has_window`: boolean indicating active optimal window
  - `quality`: one of `excellent|very_good|good|moderate`
  - Timestamps ISO-8601 (UTC). UI can poll this endpoint or derive from `session_analysis`.

### GET `/api/session/today-summary`
- Returns daily summary:
  ```json
  {
    "date": "2025-11-08",
    "peak_lri": 84,
    "peak_time": "09:15:00",
    "optimal_minutes": 32,
    "optimal_percentage": 45,
    "session_score": 72,
    "has_session_data": true
  }
  ```

### GET `/api/session/current-metrics`
- Live metrics:
  ```json
  {
    "alertness": 65,
    "focus": 58,
    "arousal_balance": 42,
    "sparkline_data": {
      "alertness": [...],
      "focus": [...],
      "arousal": [...]
    }
  }
  ```

### GET `/api/brain-score/today`
- Daily Brain Score composite:
  ```json
  {
    "brain_score": 78.4,
    "components": {
      "neural_state": 82.0,
      "consolidation": 74.0,
      "behavior_alignment": 76.0
    },
    "supporting_metrics": {
      "best_session_id": "sess_2025-11-08_morning",
      "sleep_score": { "value": 82, "version": "hrv_enabled" },
      "workout_hits": 1
    },
    "insight": "Schedule deep work in the 2h window after your run."
  }
  ```

### GET `/api/workouts/recent?days=7`
- Returns list of workouts with window utilization flags.

### GET `/api/sleep/recent?days=7`
- Returns array of sleep records from Apple Health pipeline:
  ```json
  {
    "sleep_records": [
      {
        "date": "2025-11-08",
        "duration_hours": 7.5,
        "sleep_efficiency": 88.0,
        "sleep_score": 82,
        "sleep_score_version": "hrv_enabled",
        "deep_sleep_percent": 17.3,
        "hrv_rmssd_sleep": 58.3,
        "bedtime_consistency_sd": 18.5
      }
    ]
  }
  ```

### POST `/api/health/import`
- Accepts Apple Health `export.xml`, kicks off parsing pipeline, returns counts of ingested workouts and sleep records.

## Data Sources
- Use processed outputs from `data/processed/muse/` and `data/processed/apple_health/`.
- Demo-only slices live at:
  - `data/processed/apple_health/sleep_last_20_days.json`
  - `data/processed/apple_health/workouts_last_20_days.json`
- Daily Brain Score computed per `docs/shared/brain-score-proposal.md`.

## Authentication & Deployment
- For hackathon MVP: simple local deployment, unauthenticated endpoints acceptable. Emergent can extend with auth if required later.

