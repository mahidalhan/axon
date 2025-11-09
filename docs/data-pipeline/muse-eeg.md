# Muse EEG Cleaning Pipeline

## Dataset
- Source: [Muse EEG Subconscious Decisions Dataset](https://zenodo.org/records/8429740)
- Format: CSV files per participant (~220 MB each, ~600K rows)
- Columns: band power (Delta/Theta/Alpha/Beta/Gamma × TP9/AF7/AF8/TP10), raw EEG, accelerometer, gyroscope, HSI metrics, device telemetry.

## Processing Steps
1. **Stage CSV**
   - Store raw CSVs under `data/raw/muse/participant_<id>.csv`.

2. **Quality Filtering**
   - Drop rows with invalid timestamps.
   - Remove “warmup” rows where band power is zero.
   - Filter rows with HSI > 2.5 on any electrode.
   - Optional: remove artifact markers (blinks/jaw clenches) if present.

3. **Windowing**
   - Use 30-second windows with 50% overlap (new window every 15s).
   - Expected samples per window: 7,680 (256 Hz × 30s).
   - Compute mean band power per channel per window.

4. **Derived Features**
   - Theta/Beta ratio, Beta/Alpha ratio, frontal theta averages.
   - Store in windowed DataFrame for downstream LRI calculation.

5. **Learning Readiness Index (LRI)**
   - Apply `LRICalculator` formula: weighted alertness, focus, arousal balance with post-exercise multiplier (if workout context available).
   - Output per window: `lri`, `base_lri`, component scores, multiplier.

6. **Session Analysis**
   - Feed LRI windows into Session Analyzer to produce:
     - `session_score`
     - `optimal_windows`
     - `time_in_state`
     - `component_scores`
     - `workout_context` (if workout data provided)

7. **Daily Brain Score (Optional Aggregation)**
   - Combine best session score of the day with sleep consolidation and behavior alignment (see `docs/shared/brain-score-proposal.md`).

## Output Files
- `data/processed/muse/participant_<id>_windows.parquet`
  - One row per 30s window with band averages + derived metrics.
- `data/processed/muse/participant_<id>_session.json`
  - SessionAnalyzer JSON output (see `docs/shared/session-analysis-example.md`).
- Demo-only artifacts (e.g., `daily_brain_scores.csv`) are documented in `docs/data-pipeline/demo-timeline.md` and are not emitted by the cleaning pipeline.

## Tools & Scripts
- Recommended: Python (pandas, numpy), stored in `/pipeline_scripts/muse/`.
- Ensure scripts accept input/output paths for integration with Emergent workflow.

