# Muse EEG Data Pipeline - Simple Explanation

## Overview: CSV → Session Analysis in 5 Steps

```
Raw CSV → Clean Data → Windows → LRI Scores → Session Analysis
(600K)     (375K)       (97)      (97)         (1 Session Report)
```

---

## Step 1: Raw Data Structure

**File:** `museData0.csv` (220 MB, ~600K rows)

```
TimeStamp           Delta_TP9  Theta_AF7  Alpha_AF8  Beta_TP10  HSI_TP9  HSI_AF7
2023-05-01 18:00:43   0.241      0.160      0.172      0.119      2.0      1.0
2023-05-01 18:00:44   0.242      0.161      0.173      0.118      2.1      1.1
2023-05-01 18:00:45   0.000      0.000      0.000      0.000      1.0      1.0  ← Zero (warmup)
2023-05-01 18:00:46   0.240      0.159      0.171      4.532      4.5      3.8  ← Bad HSI
```

**What we have:**
- 20 band power columns (5 bands × 4 electrodes)
- Pre-computed by Muse headband
- HSI = quality metric (lower is better)
- 256 samples per second

---

## Step 2: Cleaning (loader.py)

**Problem:** Raw data has noise, artifacts, and poor-quality samples

**Solution:** Filter in 4 steps

```
600,494 rows (raw)
    ↓ Remove invalid timestamps
600,494 rows
    ↓ Remove event markers (blinks, jaw clenches)
598,123 rows (-0.4%)
    ↓ Remove zero-power warmup periods
596,847 rows (-0.2%)
    ↓ Keep only HSI ≤ 2.5 on ALL 4 electrodes
375,863 rows (62.4% retained) ✓
```

**HSI Filtering Example:**

```
Sample A:  TP9=2.0  AF7=1.0  AF8=1.5  TP10=2.3  → KEEP ✓ (all ≤ 2.5)
Sample B:  TP9=1.5  AF7=1.2  AF8=3.5  TP10=2.1  → DROP ✗ (AF8 too high)
Sample C:  TP9=2.5  AF7=2.4  AF8=2.5  TP10=4.0  → DROP ✗ (TP10 too high)
```

**Result:** 375,863 clean samples (~0.4 hours of high-quality EEG)

---

## Step 3: Windowing (preprocessor.py)

**Problem:** Need to analyze EEG in chunks, not sample-by-sample

**Solution:** Create 30-second windows with 50% overlap

```
Continuous EEG timeline:
|-------|-------|-------|-------|-------|-------|
0s     15s     30s     45s     60s     75s     90s

Window 1: [0s -------- 30s]
Window 2:      [15s -------- 45s]
Window 3:            [30s -------- 60s]
Window 4:                  [45s -------- 75s]
```

**Math:**
- Window size: 30 seconds
- Samples per window: 30s × 256 Hz = 7,680 samples
- Overlap: 50% → New window every 15 seconds
- Total windows: 97

**Why overlap?** Better temporal resolution without losing data between windows.

---

## Step 4: LRI Calculation (lri_calculator.py)

**Problem:** Band power numbers are meaningless to users

**Solution:** Convert to 0-100 "Learning Readiness" score

### For each window:

**Input:** 7,680 samples × 20 band power columns

```
Delta_TP9  Delta_AF7  Theta_TP9  Beta_AF8  ...
0.241      0.238      0.159      0.118
0.242      0.240      0.160      0.119
0.243      0.239      0.161      0.117
... (7,680 rows)
```

**Step 1:** Average each column

```python
{
  'delta_tp9': 0.241,
  'theta_tp9': 0.160,
  'alpha_tp9': 0.172,
  'beta_tp9': 0.119,
  'gamma_tp9': 0.045,
  ... (20 values total)
}
```

**Step 2:** Calculate 3 components

```
1. Alertness (0-100)
   - High beta = awake, engaged
   - Low theta/beta ratio = not drowsy
   - Low alpha = eyes open, active
   → Score: 52.3

2. Focus (0-100)
   - Frontal theta = working memory
   - Frontal gamma = attention binding
   → Score: 45.8

3. Arousal Balance (0-100)
   - Beta/Alpha ratio close to 1.5 = optimal
   - Too low = drowsy, too high = anxious
   → Score: 38.9
```

**Step 3:** Weighted average

```
LRI = (52.3 × 0.4) + (45.8 × 0.3) + (38.9 × 0.3) = 46.3
```

**Output:** One LRI score per window (97 total)

---

## Step 5: Session Analysis → Optimal Windows

**Input:** 97 LRI scores from 40-minute session

**Process:**
1. Find consecutive windows where LRI >= 70
2. Calculate window statistics (duration, avg LRI)
3. Detect post-exercise boost (if workout data available)
4. Generate session quality score (0-100)

**Example:**
```
Session: 2023-05-01 18:00-18:40 (40 minutes)

Optimal Windows Found:
1. 18:15:00 - 18:27:30 (12.5 min, avg LRI: 76.2) ⭐⭐⭐
2. 18:35:00 - 18:38:00 (3.0 min, avg LRI: 72.1) ⭐⭐

Session Score: 72/100
- Peak LRI: 84 at 18:15:30
- Optimal minutes: 15.5 (39% of session)
- Post-exercise boost: Yes (1.3x multiplier, 2h after workout)
```

**Output:** Session Analysis Report
- Peak LRI + timestamp
- Optimal windows list
- Session quality score
- Recommendations

---

## Step 6: Post-Exercise Context Matching

**If workout data available from Apple Health:**

Match session timing to workout completion:
```
Workout: Morning Run at 7:00 AM
Session: 9:15 AM (2h 15m after workout)

Post-Exercise Window:
- Within optimal window? YES (1-4h window)
- Multiplier applied: 1.3x
- Peak detected during window? YES ✓
```

**Output:**
- Workout context (type, time, duration)
- Hours since workout
- Post-exercise multiplier applied
- Confirmation: "Peak occurred during optimal window"

---

## Complete Flow Summary

```
[Raw CSV File: museData0.csv]
        |
        | load_participant()
        | - Parse timestamps
        | - Remove artifacts
        | - Filter HSI > 2.5
        ↓
[Clean DataFrame: 375,863 rows]
        |
        | create_windows()
        | - 30s windows
        | - 50% overlap
        ↓
[97 Windows: 7,680 samples each]
        |
        | _extract_band_power()
        | - Average each column
        ↓
[97 Band Power Dicts: 20 values each]
        |
        | calculate_lri()
        | - Alertness + Focus + Arousal Balance
        ↓
[97 LRI Scores: 0-100 range]
        |
        | SessionAnalyzer
        ↓
[Session Analysis Report]
        |
        | JSON API
        ↓
[Frontend displays session chart + optimal windows]
```

---

## Why Each Step Matters

| Step | Without It | With It |
|------|-----------|---------|
| **HSI Filtering** | Noisy data → unreliable LRI scores | Clean signal → accurate metrics |
| **Windowing** | Too granular (256 samples/sec) | Meaningful chunks (30s intervals) |
| **LRI Formula** | Raw numbers (0.241, 0.160) | Intuitive score (46.3/100) |
| **Session Analysis** | No actionable timing recommendations | Know WHEN to schedule deep work |

---

## Key Metrics at Each Stage

```
Stage               Count      Size           Format
────────────────────────────────────────────────────────
Raw CSV            600,494     220 MB         CSV rows
Clean Data         375,863     ~120 MB        DataFrame
Windows                 97     ~7,680/each    DataFrame
Band Power Dicts        97     20 values      Python dict
LRI Scores              97     1 value        Float 0-100
Session Analysis         1     Full report    JSON object
```

---

## Files Involved

```
backend/
├── data/
│   ├── loader.py           → Step 2: Cleaning
│   └── preprocessor.py     → Step 3: Windowing
├── scores/
│   ├── lri_calculator.py   → Step 4: LRI calculation
│   └── session_analyzer.py → Step 5: Session analysis
├── parsers/
│   └── apple_health_parser.py → Step 6: Workout/sleep import
└── api/
    └── session_routes.py   → API endpoints
```

---

## Common Questions

**Q: Why 63% data loss after cleaning?**
A: Quality matters more than quantity. HSI > 2.5 means poor electrode contact (sweat, hair, movement). Better to have less data that's accurate.

**Q: Why 30-second windows?**
A: Balance between:
- Too short (1s) = noisy, unreliable
- Too long (5min) = misses rapid changes
- 30s = standard in neuroscience research

**Q: What if TP10 electrode is missing?**
A: Defaults to 0.0. LRI still works with 3 electrodes (TP9, AF7, AF8).

**Q: Why overlap windows?**
A: Catch changes that happen between window boundaries. 50% overlap means nothing is missed.

---

## Performance

```
Operation                Time          Notes
────────────────────────────────────────────────
Load 600K rows          ~1 second     Pandas read_csv
Clean + filter          ~0.3 seconds  HSI filtering
Create 97 windows       ~0.1 seconds  Simple slicing
Calculate 97 LRIs       ~0.04 seconds Numpy math
Total pipeline          ~2 seconds    For 0.4 hours EEG
```

Scales linearly: 24 hours of EEG ≈ 20 seconds processing time.
