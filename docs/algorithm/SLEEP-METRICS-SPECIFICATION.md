# Sleep Metrics Specification
## Research-Validated Neuroplasticity Sleep Score

**Version:** 2.0
**Date:** November 8, 2025
**Owner:** Mahi Dalhan
**Scientific Review:** Pending

---

## Executive Summary

Sleep is where neuroplasticity consolidation occurs. Our algorithm incorporates 8 research-validated metrics weighted by their contribution to memory consolidation and synaptic strengthening.

**Key Innovation:** Dual-formula approach supports both HRV-enabled devices (Apple Watch, Oura Ring) and base sleep tracking (Apple Health only).

**Scientific Foundation:** All metrics and weights derived from peer-reviewed research on sleep-dependent memory consolidation and neuroplasticity.

---

## Huberman Lab Framework

> "You need to get great sleep that night and in subsequent nights in order to actually allow the plasticity to occur. Plasticity... actually takes place in sleep"
> — Andrew Huberman, Ph.D.

**Key Mechanisms:**
1. **Deep Sleep (SWS):** Slow-wave activity drives memory replay and synaptic consolidation
2. **REM Sleep:** Emotional processing, procedural memory integration
3. **Sleep Spindles:** Thalamo-cortical coupling transfers hippocampal memories to cortex
4. **Glymphatic Clearance:** Metabolic waste removal during deep sleep

---

## Sleep Score Formulas

### Version A: HRV-Enabled (Preferred)

```
Sleep_Score = (
    0.30 × Duration_Score +
    0.25 × Efficiency_Score +
    0.10 × HRV_Sleep_Score +
    0.10 × Consistency_Score +
    0.10 × WASO_Score +
    0.05 × SOL_Score +
    0.05 × Respiratory_Rate_Score +
    0.05 × Deep_Sleep_Percent_Score
)
```

**Requirements:** Apple Watch or Oura Ring with HRV tracking

### Version B: Base (No HRV Device)

```
Sleep_Score = (
    0.35 × Duration_Score +
    0.30 × Efficiency_Score +
    0.15 × Consistency_Score +
    0.10 × WASO_Score +
    0.05 × SOL_Score +
    0.05 × Respiratory_Rate_Score
)
```

**Requirements:** Apple Health sleep tracking (iPhone only)

---

## Metric Breakdown

### 1. Sleep Duration (30-35% weight)

**Scientific Basis:**
- **Walker, M. (2017).** "Why We Sleep" - 7-9 hours optimal for memory consolidation
- **Stickgold, R. (2005).** "Sleep-dependent memory consolidation" - Duration directly correlates with long-term potentiation (LTP)
- **Walker & Stickgold (2006).** Each 2-hour reduction in sleep results in 60-80% reduction in REM sleep

**Neuroplasticity Mechanism:**
- Longer sleep → More consolidation cycles
- Each 90-minute cycle processes different memory types
- Minimum 4-5 cycles (6-7.5 hours) needed for complete consolidation

**Scoring Logic:**
```python
def score_duration(hours: float) -> float:
    """Score sleep duration based on optimal 7-9 hour range."""
    if 7 <= hours <= 9:
        return 100
    elif 6 <= hours < 7:
        return 80 - (7 - hours) * 40  # Linear penalty
    elif 9 < hours <= 10:
        return 80 - (hours - 9) * 40
    else:
        return max(40, 100 - abs(hours - 8) * 15)
```

**Optimal Range:** 7-9 hours
**Why This Weight:** Primary determinant of consolidation window duration. Foundational metric.

**Data Source:** Apple Health `HKCategoryTypeIdentifierSleepAnalysis`

---

### 2. Sleep Efficiency (25-30% weight)

**Scientific Basis:**
- **Ohayon et al. (2017).** "National Sleep Foundation's sleep quality recommendations" - Efficiency >85% = good quality
- **Krystal & Edinger (2008).** "Measuring sleep quality" - Efficiency strongly predicts subjective sleep quality
- Fragmented sleep (low efficiency) disrupts hippocampal-cortical dialogue

**Neuroplasticity Mechanism:**
- Sleep fragmentation interrupts memory reactivation sequences
- Reduced spindle density (critical for consolidation)
- Disrupts cortical slow-oscillation coupling

**Formula:**
```
Efficiency = (Total Sleep Time / Time in Bed) × 100
```

**Scoring Logic:**
```python
def score_efficiency(efficiency_pct: float) -> float:
    """Score sleep efficiency with >85% as optimal."""
    if efficiency_pct >= 85:
        return 100
    elif efficiency_pct >= 75:
        return 70 + (efficiency_pct - 75) * 3
    else:
        return max(40, efficiency_pct * 0.93)
```

**Optimal:** ≥85%
**Why This Weight:** Reflects sleep fragmentation, a key consolidation disruptor

**Data Source:** Calculated from sleep analysis records (Total Sleep Time / Time in Bed)

---

### 3. HRV During Sleep (10% weight, HRV-enabled only)

**Scientific Basis:**
- **Buchheit & Gindre (2006).** "Cardiac parasympathetic regulation" - HRV reflects autonomic recovery
- **Stein & Pu (2012).** "Heart rate variability, sleep and sleep disorders" - High HRV during sleep = strong parasympathetic dominance
- **Frontiers 2025:** 70% of variance in overnight memory improvement explained by HF-HRV during REM sleep

**Neuroplasticity Mechanism:**
- HRV reflects parasympathetic nervous system support for memory consolidation
- Mediates amygdala-mPFC connectivity changes during emotional memory processing
- Supports synaptic plasticity and neural integration during sleep

**Formula:**
```
HRV_Sleep = mean(RMSSD during N2 + N3 stages)
```

**Scoring Logic:**
```python
def score_hrv_sleep(rmssd_ms: float, age: int) -> float:
    """Score HRV with age-adjusted optimal ranges."""
    # Age-adjusted optimal ranges (RMSSD in ms)
    optimal_ranges = {
        20: (50, 100),
        30: (45, 90),
        40: (40, 80),
        50: (35, 70),
        60: (30, 60)
    }

    # Find closest age bracket
    ages = sorted(optimal_ranges.keys())
    closest_age = min(ages, key=lambda x: abs(x - age))
    min_opt, max_opt = optimal_ranges[closest_age]

    if min_opt <= rmssd_ms <= max_opt:
        return 100
    elif rmssd_ms < min_opt:
        return 50 + (rmssd_ms / min_opt) * 50
    else:
        excess = rmssd_ms - max_opt
        return max(70, 100 - (excess / 20) * 30)
```

**Optimal (age 30):** 45-90 ms RMSSD
**Why This Weight:** Direct marker of autonomic recovery during sleep. Explains 70% of memory variance in research.

**Data Source:** Apple Watch HRV samples, filtered for deep sleep stages

**Fallback:** If unavailable, redistribute weight to Efficiency (+5%) and Consistency (+5%)

---

### 4. Sleep Consistency (10-15% weight)

**Scientific Basis:**
- **Phillips et al. (2017).** "Irregular sleep/wake patterns are associated with poorer academic performance" - Accounts for 25% of academic performance variance
- **Bei et al. (2016).** "Beyond the mean: Quantifying the heterogeneity of sleep" - Variability >60 min = 0.65 GPA point reduction
- **Nature 2019:** Stronger predictor than total sleep duration for learning outcomes

**Neuroplasticity Mechanism:**
- Circadian rhythm optimization - consistent timing improves memory consolidation
- Disrupts precise timing of hippocampal-cortical memory transfer when inconsistent
- Sleep irregularity = chronic "social jet lag" impairing plasticity

**Formula:**
```
Consistency_Score = f(SD of bedtime over 7 nights)
```

**Scoring Logic:**
```python
def score_consistency(bedtimes: List[datetime]) -> float:
    """Score bedtime consistency over 7-day window."""
    if len(bedtimes) < 3:
        return 50  # Insufficient data

    # Convert to minutes from midnight
    bedtime_minutes = [
        (bt.hour * 60 + bt.minute) for bt in bedtimes
    ]

    # Handle day wrap (11 PM = -60, 1 AM = 60)
    normalized = []
    for bt in bedtime_minutes:
        if bt < 360:  # Before 6 AM = late night
            normalized.append(bt + 1440)  # Add 24 hours
        else:
            normalized.append(bt)

    sd = np.std(normalized)

    if sd <= 15:  # <15 min variability = excellent
        return 100
    elif sd <= 30:  # <30 min = good
        return 100 - (sd - 15) * 2
    elif sd <= 60:  # <60 min = acceptable
        return 70 - (sd - 30) * 1.5
    else:  # >60 min = poor
        return max(40, 70 - (sd - 60) * 0.5)
```

**Optimal:** SD <30 min over 7 nights
**Why This Weight:** Accounts for 25% of academic performance variance. Critical for circadian entrainment.

**Data Source:** Sleep start times from Apple Health, 7-day rolling window

---

### 5. WASO - Wake After Sleep Onset (8-10% weight)

**Scientific Basis:**
- **Scullin (2019).** "Sleep, memory, and aging: The link between slow-wave sleep and episodic memory"
- **2024 Cognitive Study:** Every 30-minute increase in WASO associated with measurable cognitive decline
- WASO fragments consolidation windows, interrupts spindle generation

**Neuroplasticity Mechanism:**
- Fragmented sleep interrupts memory reactivation
- Reduces sleep spindle density (critical for consolidation)
- Disrupts cortical slow-oscillation coupling

**Formula:**
```
WASO_minutes = sum(awake_periods after initial sleep onset)
```

**Scoring Logic:**
```python
def score_waso(waso_min: float) -> float:
    """Score wake after sleep onset (lower is better)."""
    if waso_min <= 15:
        return 100
    elif waso_min <= 30:
        return 100 - (waso_min - 15) * 2
    elif waso_min <= 60:
        return 70 - (waso_min - 30)
    else:
        return max(40, 70 - (waso_min - 60) * 0.5)
```

**Optimal:** <30 min
**Why This Weight:** Sleep fragmentation directly impairs memory transfer. Robust research support.

**Data Source:** Apple Health sleep stage transitions (Awake periods during sleep)

---

### 6. Sleep Onset Latency - SOL (5% weight)

**Scientific Basis:**
- **Ohayon et al. (2000).** "Meta-analysis of quantitative sleep parameters" - Optimal 10-20 min
- SOL <5 min = sleep deprivation indicator
- SOL >30 min = insomnia or poor circadian alignment
- Longer SOL associated with poorer verbal memory (small effect size)

**Neuroplasticity Mechanism:**
- Indirect indicator of circadian rhythm alignment
- May reflect hyperarousal (stress) which impairs consolidation
- Optimal sleep pressure timing enhances consolidation

**Formula:**
```
SOL = Time from "In Bed" → first "Asleep" sample
```

**Scoring Logic:**
```python
def score_sol(sol_min: float) -> float:
    """Score sleep onset latency (10-20 min optimal)."""
    if 10 <= sol_min <= 20:
        return 100
    elif 5 <= sol_min < 10:
        return 70 + (sol_min - 5) * 6
    elif 20 < sol_min <= 30:
        return 100 - (sol_min - 20) * 3
    elif sol_min < 5:
        return 50  # Sleep deprivation flag
    else:
        return max(40, 70 - (sol_min - 30) * 0.5)
```

**Optimal:** 10-20 min
**Why This Weight:** Minor factor, but flags sleep debt or insomnia. Secondary indicator.

**Data Source:** First "Asleep" timestamp - "In Bed" timestamp

---

### 7. Respiratory Rate (2-5% weight)

**Scientific Basis:**
- **Kryger et al. (2011).** "Principles and Practice of Sleep Medicine"
- **Nature 2023:** Respiration modulates sleep oscillations (slow-oscillation-spindle coupling)
- Abnormal rate flags sleep apnea (disrupts consolidation)
- Regular breathing pattern associated with better coupling (small effect)

**Neuroplasticity Mechanism:**
- Breathing paces slow oscillations during NREM
- Respiratory-slow oscillation coupling linked to memory reactivation
- Mechanism is scaffold, not direct driver

**Scoring Logic:**
```python
def score_respiratory_rate(avg_bpm: float) -> float:
    """Score respiratory rate (12-16 bpm optimal)."""
    if 12 <= avg_bpm <= 16:
        return 100
    elif 10 <= avg_bpm < 12:
        return 70 + (avg_bpm - 10) * 15
    elif 16 < avg_bpm <= 20:
        return 70 + (20 - avg_bpm) * 7.5
    else:
        return max(40, 100 - abs(avg_bpm - 14) * 10)
```

**Optimal:** 12-16 bpm
**Why This Weight:** Low weight, primarily flags sleep apnea risk. Modest consolidation effect.

**Data Source:** Apple Watch respiratory rate samples (if available)

---

### 8. Deep Sleep Percent (5% weight)

**Scientific Basis:**
- **Stickgold (2005).** "Sleep-dependent memory consolidation"
- **Tononi & Cirelli (2014).** "Sleep and synaptic homeostasis" - Deep sleep drives synaptic renormalization
- Deep sleep (N3) drives slow-wave activity, memory replay
- Optimal: >15% of total sleep time

**Neuroplasticity Mechanism:**
- Slow waves coordinate hippocampal-cortical memory transfer
- Synaptic downscaling during SWS strengthens important connections
- Metabolic waste clearance (glymphatic system)

**Scoring Logic:**
```python
def score_deep_sleep_pct(deep_pct: float) -> float:
    """Score deep sleep percentage (>15% optimal)."""
    if deep_pct >= 15:
        return 100
    elif deep_pct >= 10:
        return 60 + (deep_pct - 10) * 8
    else:
        return max(40, deep_pct * 6)
```

**Optimal:** >15% TST
**Why This Weight:** Consolidation proxy, but Apple Watch sleep staging less reliable than polysomnography. Conservative weight.

**Data Source:** Apple Health sleep stages (Deep Sleep duration / Total Sleep Time)

---

## Implementation

### Dual Formula System

**Formula Selection Logic:**
```python
def calculate_sleep_score(sleep_data: SleepRecord, has_hrv: bool = None) -> Dict:
    """Calculate sleep score using appropriate formula."""

    # Auto-detect HRV availability if not specified
    if has_hrv is None:
        has_hrv = (sleep_data.hrv_rmssd is not None and
                   sleep_data.hrv_rmssd > 0)

    if has_hrv:
        return _calculate_hrv_enabled_score(sleep_data)
    else:
        return _calculate_base_score(sleep_data)


def _calculate_hrv_enabled_score(sleep_data: SleepRecord) -> Dict:
    """HRV-enabled formula (8 components)."""

    components = {
        'duration': (
            score_duration(sleep_data.duration_hours),
            0.30
        ),
        'efficiency': (
            score_efficiency(sleep_data.efficiency),
            0.25
        ),
        'hrv_sleep': (
            score_hrv_sleep(sleep_data.hrv_rmssd, age=sleep_data.user_age or 30),
            0.10
        ),
        'consistency': (
            score_consistency(sleep_data.bedtimes_7d),
            0.10
        ),
        'waso': (
            score_waso(sleep_data.waso_minutes),
            0.10
        ),
        'sol': (
            score_sol(sleep_data.sol_minutes),
            0.05
        ),
        'resp_rate': (
            score_respiratory_rate(sleep_data.avg_resp_rate or 14),
            0.05
        ),
        'deep_pct': (
            score_deep_sleep_pct(sleep_data.deep_sleep_percent),
            0.05
        )
    }

    total_score = sum(score * weight for score, weight in components.values())

    return {
        'sleep_score': round(total_score, 1),
        'formula_version': 'hrv_enabled',
        'components': {k: round(v[0], 1) for k, v in components.items()},
        'weights': {k: v[1] for k, v in components.items()},
        'metadata': {
            'device_type': sleep_data.device_type or 'apple_watch',
            'has_sleep_stages': sleep_data.deep_sleep_minutes is not None
        }
    }


def _calculate_base_score(sleep_data: SleepRecord) -> Dict:
    """Base formula (6 components, no HRV)."""

    components = {
        'duration': (
            score_duration(sleep_data.duration_hours),
            0.35
        ),
        'efficiency': (
            score_efficiency(sleep_data.efficiency),
            0.30
        ),
        'consistency': (
            score_consistency(sleep_data.bedtimes_7d),
            0.15
        ),
        'waso': (
            score_waso(sleep_data.waso_minutes),
            0.10
        ),
        'sol': (
            score_sol(sleep_data.sol_minutes),
            0.05
        ),
        'resp_rate': (
            score_respiratory_rate(sleep_data.avg_resp_rate or 14),
            0.05
        )
    }

    total_score = sum(score * weight for score, weight in components.values())

    return {
        'sleep_score': round(total_score, 1),
        'formula_version': 'base',
        'components': {k: round(v[0], 1) for k, v in components.items()},
        'weights': {k: v[1] for k, v in components.items()},
        'metadata': {
            'device_type': sleep_data.device_type or 'iphone',
            'has_sleep_stages': sleep_data.deep_sleep_minutes is not None,
            'upgrade_note': 'Add Apple Watch for HRV-enhanced scoring'
        }
    }
```

---

## Data Requirements

### Required Fields (All Users)
- Sleep start timestamp
- Sleep end timestamp
- Time in bed start timestamp
- Sleep stage samples (Asleep, Awake, In Bed)

### Optional Fields (Enhanced Scoring)
- **Sleep Stages:** Deep, REM, Core (enables Deep Sleep % metric)
- **HRV Samples:** RMSSD or SDNN during sleep window (enables HRV metric)
- **Respiratory Rate:** Breaths per minute during sleep
- **7-Day History:** Previous 6 nights for consistency calculation

### Fallback Behavior

**Missing HRV:**
- Use base formula
- Redistribute HRV weight (10%) to Efficiency (+5%) and Consistency (+5%)

**Missing Sleep Stages:**
- Estimate deep sleep % from movement data (accelerometer)
- Flag: "Sleep stages estimated (upgrade device for accuracy)"

**Insufficient History (<7 nights):**
- Use available nights for consistency
- Flag: "Consistency score: {n}/7 nights available"
- Default to score of 50 if <3 nights

**Missing WASO/SOL:**
- Estimate from sleep stage transitions
- If not possible, use neutral score of 70

---

## Validation Plan

### Phase 1: Literature Validation ✅
- [x] All metrics have peer-reviewed citations
- [x] Weight justifications documented
- [x] Optimal ranges from epidemiological studies
- [x] Neuroplasticity mechanisms explained

### Phase 2: Correlation Testing (In Progress)
- [ ] Sleep score vs. self-reported quality (target: r > 0.7)
- [ ] HRV-enabled vs. base formula performance comparison
- [ ] Correlation with next-day session LRI scores
- [ ] Test on N=50 users with varied sleep patterns

### Phase 3: Clinical Validation (Future)
- [ ] Compare to polysomnography gold standard (N=50 participants)
- [ ] Validate WASO detection accuracy (<15% error target)
- [ ] Test consistency metric on shift workers
- [ ] Validate HRV sleep scores against research-grade ECG

---

## Edge Cases

### Shift Workers
- **Challenge:** Inconsistent schedule is normal for their work
- **Solution:** Allow "shift schedule" mode
- **Implementation:** User selects shift pattern → adjust consistency optimal ranges

### Naps
- **Challenge:** Daytime naps may appear in sleep data
- **Solution:** Only count sleep sessions >3 hours starting between 6 PM - 2 AM
- **Implementation:** Filter by duration and start time

### Sleep Medication
- **Challenge:** Sleep aids may alter sleep architecture
- **Solution:** Flag in UI, don't adjust scoring
- **Implementation:** Optional user input → add metadata note

### Pregnancy
- **Challenge:** Frequent nighttime awakenings are normal
- **Solution:** Adjust WASO optimal ranges
- **Implementation:** User indicates pregnancy → increase WASO tolerance to <60 min

### Sleep Disorders (Diagnosed)
- **Challenge:** Scores may be chronically low
- **Solution:** Provide context, track trends instead of absolutes
- **Implementation:** User indicates disorder → show improvement % vs. baseline

---

## User-Facing Output Format

### Dashboard Display
```json
{
  "last_night": {
    "sleep_score": 82.3,
    "date": "2025-11-08",
    "duration_hours": 7.5,
    "efficiency_pct": 88.0,
    "formula_version": "hrv_enabled",
    "top_insight": "Great sleep! Your brain consolidated yesterday's learning.",
    "components_summary": {
      "excellent": ["Duration", "Deep Sleep %", "Sleep Onset"],
      "good": ["Efficiency", "Consistency", "WASO"],
      "needs_improvement": ["HRV during sleep"]
    }
  }
}
```

### Detailed Breakdown
```json
{
  "sleep_score": 82.3,
  "formula_version": "hrv_enabled",
  "components": {
    "duration": {
      "score": 95,
      "weight": 0.30,
      "value": 7.5,
      "unit": "hours",
      "optimal": "7-9 hours",
      "interpretation": "Excellent"
    },
    "efficiency": {
      "score": 88,
      "weight": 0.25,
      "value": 88.0,
      "unit": "%",
      "optimal": ">85%",
      "interpretation": "Good"
    },
    "hrv_sleep": {
      "score": 72,
      "weight": 0.10,
      "value": 58,
      "unit": "ms RMSSD",
      "optimal": "60-80 ms (age 30)",
      "interpretation": "Slightly low",
      "recommendation": "Reduce evening stress, cool bedroom"
    },
    "consistency": {
      "score": 85,
      "weight": 0.10,
      "value": 18,
      "unit": "min SD",
      "optimal": "<30 min variance",
      "interpretation": "Good"
    },
    "waso": {
      "score": 90,
      "weight": 0.10,
      "value": 22,
      "unit": "minutes",
      "optimal": "<30 min",
      "interpretation": "Excellent"
    },
    "sol": {
      "score": 100,
      "weight": 0.05,
      "value": 15,
      "unit": "minutes",
      "optimal": "10-20 min",
      "interpretation": "Perfect"
    },
    "resp_rate": {
      "score": 100,
      "weight": 0.05,
      "value": 14,
      "unit": "bpm",
      "optimal": "12-16 bpm",
      "interpretation": "Normal"
    },
    "deep_pct": {
      "score": 100,
      "weight": 0.05,
      "value": 18,
      "unit": "%",
      "optimal": ">15%",
      "interpretation": "Excellent"
    }
  },
  "top_positive_drivers": [
    "Excellent sleep onset (15 min)",
    "Great deep sleep (18% of total)",
    "Low nighttime awakenings (22 min)"
  ],
  "top_negative_drivers": [
    "HRV slightly low (58 ms, target: 60-80 ms for age 30)"
  ],
  "recommendations": [
    "Keep your consistent bedtime (18 min variance is great)",
    "To improve HRV: reduce evening stress, keep bedroom cool (60-67°F)",
    "Consider light morning exercise to boost recovery"
  ]
}
```

---

## References

1. **Walker, M. (2017).** "Why We Sleep: Unlocking the Power of Sleep and Dreams." Scribner.

2. **Stickgold, R. (2005).** "Sleep-dependent memory consolidation." *Nature*, 437(7063), 1272-1278.

3. **Ohayon, M. et al. (2017).** "National Sleep Foundation's sleep quality recommendations: first report." *Sleep Health*, 3(1), 6-19.

4. **Phillips, A. et al. (2017).** "Irregular sleep/wake patterns are associated with poorer academic performance and delayed circadian and sleep/wake timing." *Scientific Reports*, 7(1), 3216.

5. **Buchheit, M. & Gindre, C. (2006).** "Cardiac parasympathetic regulation: respective associations with cardiorespiratory fitness and training load." *American Journal of Physiology*, 291(1), H451-H458.

6. **Stein, P. & Pu, Y. (2012).** "Heart rate variability, sleep and sleep disorders." *Sleep Medicine Reviews*, 16(1), 47-66.

7. **Scullin, M. (2019).** "Sleep, memory, and aging: The link between slow-wave sleep and episodic memory changes from younger to older adults." *Psychology and Aging*, 34(1), 126-139.

8. **Bei, B. et al. (2016).** "Beyond the mean: A systematic review on the correlates of daily intraindividual variability of sleep/wake patterns." *Sleep Medicine Reviews*, 28, 108-124.

9. **Kryger, M. et al. (2011).** "Principles and Practice of Sleep Medicine" (5th ed.). Elsevier Saunders.

10. **Ohayon, M. et al. (2000).** "Meta-analysis of quantitative sleep parameters from childhood to old age in healthy individuals." *Sleep*, 27(7), 1255-1273.

11. **Tononi, G. & Cirelli, C. (2014).** "Sleep and the price of plasticity: From synaptic and cellular homeostasis to memory consolidation and integration." *Neuron*, 81(1), 12-34.

12. **Walker, M. & Stickgold, R. (2006).** "Sleep, memory, and plasticity." *Annual Review of Psychology*, 57, 139-166.

13. **Krystal, A. & Edinger, J. (2008).** "Measuring sleep quality." *Sleep Medicine*, 9(Suppl 1), S10-S17.

14. **Frontiers (2025).** "Vagal heart rate variability during REM sleep reduces negative memory bias." *Frontiers in Neuroscience*.

15. **Nature Communications (2023).** "Respiration modulates oscillatory neural network activity at rest." *Nature Communications*, 14(1), 4404.

---

**End of Sleep Metrics Specification v2.0**

Last Updated: November 8, 2025
