# Apple Health Sleep Pipeline

## Dataset
- Source: Apple Health export (`export.xml`) provided by user.
- Records: Sleep analysis categories, HRV samples, respiratory rate, other metrics.

## Parsing Steps
1. **Stage Export**
   - Place raw export at `data/raw/apple_health/export.xml`.

2. **XML Parsing**
   - Extract sleep analysis records (`HKCategoryTypeIdentifierSleepAnalysis`).
   - Extract HRV (`HKQuantityTypeIdentifierHeartRateVariabilitySDNN`) and respiratory (`HKQuantityTypeIdentifierRespiratoryRate`) samples.
   - Group records by night using `_group_into_sessions()` logic (gap >3h triggers new session; keep sessions ≥3h starting between 18:00–02:00).

3. **Enhanced Sleep Record Calculation**
   - For each session, compute:
     - Duration metrics (total sleep, time in bed, efficiency).
     - Stage minutes (deep, REM, core, awake), if available.
     - WASO, sleep onset latency, deep sleep %, rem %, etc.
     - HRV during sleep window (average of samples) and respiratory rate.
     - Bedtime consistency (7-day rolling SD, requires ≥3 nights).
   - Structure the record following `EnhancedSleepRecord` schema in `docs/data-processing/APPLE-HEALTH-INTEGRATION.md`.

4. **Sleep Score Calculation**
   - Invoke sleep calculator with extracted metrics to compute:
     - Neuroplasticity Sleep Score (`sleep_score`, `sleep_score_version`).
     - Component breakdown (rely on implementation referencing `docs/shared/sleep-score-snippets.md`).

## Output Files
- `data/processed/apple_health/sleep_records.parquet`
  - One row per night with enhanced metrics and sleep score.
- `data/processed/apple_health/sleep_records.json`
  - JSON array for direct API payloads.

## Tools & Scripts
- Recommended: Python (lxml or ElementTree, numpy, pandas) stored in `/pipeline_scripts/apple_health/`.
- Ensure scripts accept source XML path and output directory arguments for integration with Emergent backend workflow.

---

## Demo Slices (Last 20 Days)
- For the hackathon demo, we export lightweight slices:
  - `data/processed/apple_health/sleep_last_20_days.json`
  - `data/processed/apple_health/workouts_last_20_days.json`
- Sleep slice accepts “coarse nights” when staging is absent (in-bed only), scored via the base method. This ensures we always have up to 20 recent nights.
- See `pipeline_scripts/apple_health/last20_cli.py` for generating slices and `docs/data-pipeline/demo-timeline.md` for join rules.

