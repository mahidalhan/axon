# Brain Score (MVP) Proposal

## Purpose
Provide a daily neuroplasticity readiness score that combines on-session EEG evidence with sleep-based consolidation and behavioural alignment, without requiring longitudinal datasets.

## Formula
```
brain_score = (
    0.55 × neural_state_score +
    0.25 × consolidation_score +
    0.20 × behavior_alignment
)
```

### Components
- **Neural State Score (55%)**  
  - Input: highest `session_score` recorded in the day.  
  - Adjustment: apply a soft ceiling at 92 to respect the inverted-U relationship between arousal and performance (Yerkes & Dodson, 1908).  
  - Rationale: EEG markers (beta, frontal theta) driven by post-exercise catecholamines represent the “trigger” phase of neuroplasticity (Huberman Lab, 2021; Aston-Jones & Cohen, 2005).

- **Consolidation Score (25%)**  
  - Input: Neuroplasticity Sleep Score (HRV-enabled when available).  
  - Emphasis: deep sleep %, REM %, and nocturnal HRV which underpin synaptic consolidation (Walker, 2017; Pugin et al., 2020; Frontiers in Neuroscience, 2025).  
  - If HRV is missing, down-weight to 0.9 × sleep score to reflect reduced certainty.

- **Behavior Alignment (20%)**  
  - Inputs: Whether a session occurred 1–4 hours post-exercise, minutes spent in optimal windows, circadian alignment flag.  
  - Scoring: start from 50, add +10 per session that leverages post-exercise window (Lally et al., 2010 on habit consistency) and +5 per workout whose window was used; subtract 10 if the primary session was outside habitual focus hours. Clamp between 20 and 95.  
  - Rationale: repeated practice during neuromodulatory up-states amplifies consolidation.

## Output Payload
Return both the composite and component breakdown to support explanation in UI:
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
    "sleep_score": {
      "value": 82,
      "version": "hrv_enabled"
    },
    "workout_hits": 1
  }
}
```

## Implementation Notes
- Compute the daily score after syncing Apple Health data and EEG sessions.
- Persist historical brain scores for future longitudinal analytics while acknowledging that trendlines are **not** yet scientifically validated.
- Document all multipliers and thresholds in `backend/scores/brain_score_calculator.py` docstrings.
- Update `docs/app/UI-COMPONENTS.md` and `docs/app/SLEEP-EDUCATION.md` to surface the new components transparently.

## Future Enhancements
1. Incorporate 28-day moving averages once same-participant datasets are collected (see `post-mvp/dataset-upgrade-plan.md`).
2. Tune weightings using pilot data to correlate against external learning outcomes (>0.6 target correlation).
3. Add confidence intervals when sleep HRV or workout context is missing.

