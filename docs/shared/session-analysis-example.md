# Session Analysis Example Payload

Canonical JSON output from `SessionAnalyzer.analyze_session` used across docs.

```json
{
  "session_duration_minutes": 40.2,
  "peak_lri": 84.3,
  "peak_timestamp": "2025-11-08T09:15:30",
  "avg_lri": 46.8,
  "median_lri": 45.2,
  "std_dev": 12.3,
  "optimal_windows": [
    {
      "start": "09:15:00",
      "end": "09:27:30",
      "duration_minutes": 12.5,
      "avg_lri": 76.2,
      "quality": "excellent"
    }
  ],
  "time_in_state": {
    "optimal_minutes": 19.5,
    "moderate_minutes": 15.7,
    "low_minutes": 5.0
  },
  "component_scores": {
    "alertness": 65.3,
    "focus": 58.2,
    "arousal_balance": 42.1
  },
  "workout_context": {
    "workout_detected": true,
    "hours_since_workout": 2.25,
    "post_exercise_multiplier": 1.3,
    "peak_in_optimal_window": true
  },
  "sleep_context": {
    "previous_night_score": 82,
    "sleep_impact": "positive"
  },
  "session_score": 72.3,
  "insights": [
    "Peak occurred 15 min into session",
    "You maintained optimal state for 48% of session",
    "Post-exercise boost detected (1.3x)"
  ],
  "recommendations": [
    "Schedule deep work at 9:15 AM daily",
    "Your optimal window appears 1-2h after morning workout"
  ]
}
```

Use this payload in docs and tests to keep examples consistent.

