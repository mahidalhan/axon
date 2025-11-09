# Demo Timeline (Hackathon Synthesizer)

This guide explains how to produce a lightweight demo timeline by mapping processed Muse sessions to consecutive “days,” and attaching Apple Health sleep/workout context.

## Inputs
- Muse sessions (cleaning outputs):
  - `data/processed/muse/participant_<id>_session.json`
  - `data/processed/muse/participant_<id>_windows.parquet`
- Apple Health demo slices:
  - `data/processed/apple_health/sleep_last_20_days.json`
  - `data/processed/apple_health/workouts_last_20_days.json`
- Optional: `data/processed/muse/demo_mapping.json` (day → session mapping) if you want reproducibility across runs.

## Join Rules
- Sleep: use the previous-night rule.
  - For a demo “day D”, attach sleep with `date == D-1`. If not found, default `sleep_score = 50`.
- Workouts: attach the most recent workout on the same calendar day as “day D”, if any. Expose the 1–4h post-exercise window as `post_ex_window_start` and `post_ex_window_end` in the UI layer.

## Disclaimers (per Implementation Plan)
- Multi-subject Muse sessions are repurposed as a single user’s daily sessions for demo visualization only. Do not infer within-person longitudinal change.
- Numbers may change after full backend integration (workout context, sleep alignment, and live runs).

## Artifacts (for demo only)
- Suggested outputs a demo synthesizer might write:
  - `demo_mapping.json` — day → source session file mapping
  - `daily_sessions.json` — per-day session summary (peak_lri, avg_lri, optimal_windows, session_score)
  - `timeline.json` — `{ date, session_score, brain_score (optional), sleep_score }`

Note: these are not core cleaning outputs and should not be mixed into `docs/data-pipeline/outputs.md`. Keep demo artifacts documented here to preserve modularity.


