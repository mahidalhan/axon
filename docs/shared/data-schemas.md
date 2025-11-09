# Shared Data Schemas (MVP)

Authoritative minimal schemas used by the MVP pipelines and Emergent build.

## SleepNight (nightly aggregate)
```json
{
  "date": "YYYY-MM-DD",
  "start_time": "ISO-8601",
  "end_time": "ISO-8601",
  "duration_hours": 7.4,
  "time_in_bed_hours": 7.9,
  "sleep_efficiency": 93.3,
  "sleep_score": 82.0,
  "sleep_score_version": "base|hrv_enabled",
  "deep_sleep_percent": 17.3,
  "rem_sleep_percent": 12.0,
  "hrv_rmssd_sleep": 42.0,
  "bedtime_consistency_sd": 38.5,
  "days_for_consistency": 6
}
```
Notes:
- Optional fields may be null when absent in Apple Health export. Consumers must handle nulls.

## WorkoutSession (per workout)
```json
{
  "workout_type": "HKWorkoutActivityTypeRunning",
  "start_time": "ISO-8601",
  "end_time": "ISO-8601",
  "duration_minutes": 32.5,
  "is_high_intensity": true,
  "avg_heart_rate": 148,
  "max_heart_rate": 168,
  "source": "Apple Watch"
}
```
Derived (frontend/backends may compute on the fly):
- `post_ex_window_start = start_time + 1h`
- `post_ex_window_end = start_time + 4h`

## SessionSummary (Muse per-session)
```json
{
  "session_start": "ISO-8601",
  "session_end": "ISO-8601",
  "session_duration_minutes": 40.2,
  "peak_lri": 84.3,
  "peak_timestamp": "ISO-8601",
  "avg_lri": 46.8,
  "optimal_windows": [
    {
      "start": "ISO-8601",
      "end": "ISO-8601",
      "duration_minutes": 12.5,
      "avg_lri": 76.2,
      "quality": "excellent|very_good|good|moderate"
    }
  ],
  "time_in_state": {
    "optimal_minutes": 12.5,
    "moderate_minutes": 22.7,
    "low_minutes": 4.8
  },
  "session_score": 72.3,
  "component_scores": {
    "alertness": 65.3,
    "focus": 58.2,
    "arousal_balance": 42.1
  }
}
```


