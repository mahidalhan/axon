# Brain Score Specification

**Version:** 1.0
**Date:** November 7, 2025
**Status:** Design Specification
**Grounding:** Huberman Lab Neuroplasticity Framework

---

## Overview

**Brain Score** is a 28-day rolling metric that measures overall neuroplasticity capacity and brain health. It complements real-time (LRI) and daily (DNOS) metrics by capturing longitudinal neuroplasticity system performance.

### Metric Comparison

| Metric | Time Scale | Purpose |
|--------|------------|---------|
| **LRI** | Real-time (30s) | "Should I study now?" |
| **DNOS** | Daily | "How well did I use today's opportunities?" |
| **Brain Score** | 28-day rolling | "How healthy is my brain's learning system?" |

---

## Scientific Foundation

### Huberman 3-Phase Neuroplasticity Model

Adult neuroplasticity requires completing a full cycle:

1. **Trigger Phase**
   - Alertness: Norepinephrine from locus coeruleus
   - Focus: Acetylcholine from nucleus basalis
   - Pathway: Vagus → NTS → LC/NB activation

2. **Signal Phase**
   - Incremental learning with struggle/friction
   - Active engagement during optimal windows

3. **Consolidation Phase**
   - Deep sleep (slow-wave sleep)
   - REM sleep (actual neural rewiring)

**Key Insight:** *"Plasticity is triggered during learning but executed during sleep"* - both phases are required.

---

## Brain Score Formula

**28-Day Rolling Average (0-100 scale)**

```python
Brain_Score = 0.35 × Cycle_Completion_Rate +
              0.25 × Baseline_Capacity +
              0.25 × Neuroplasticity_Efficiency_Trend +
              0.15 × Vagus_Activation_Health
```

---

## Component Specifications

### 1. Cycle Completion Rate (35% weight)

**Purpose:** Measures how often the full neuroplasticity cycle is completed.

**Grounding:** Huberman emphasizes that both trigger AND consolidation phases are required for plasticity.

```python
Cycle_Completion_Rate = (complete_cycles / 28) × 100

# Complete Cycle Definition:
complete_cycle = {
    'trigger': LRI >= 70 for >= 60 minutes,
    'signal': logged_learning_session during optimal_window,
    'consolidation': Sleep_Consolidation_Score >= 70 same_night
}
```

**Scoring:**
- 25/28 complete cycles → 89/100
- 20/28 complete cycles → 71/100
- 15/28 complete cycles → 54/100

---

### 2. Baseline Capacity (25% weight)

**Purpose:** Measures resting-state brain health and readiness for neuroplasticity.

**Grounding:** Vagus nerve stimulates nucleus basalis to "open the opportunity for neuroplasticity."

```python
Baseline_Capacity = 0.40 × EEG_Baseline_Health +
                    0.35 × Morning_LRI_Baseline +
                    0.25 × HRV_Vagus_Health
```

#### Sub-components:

**EEG Baseline Health (0-100)**
```python
EEG_Baseline_Health = 0.40 × normalized_alpha_power +
                      0.35 × normalized_beta_readiness +
                      0.25 × theta_regulation

# Measured during morning 30s resting state calibration
# Z-scored against 28-day personal baseline
```

**Morning LRI Baseline (0-100)**
```python
Morning_LRI_Baseline = avg(morning_resting_LRI) over 28 days

# Higher baseline = better foundational readiness
```

**HRV Vagus Health (0-100)**
```python
HRV_Vagus_Health = normalized_HRV_score

# Measured via:
# - Chest strap HRM
# - Apple Watch HRV
# - Muse/EEG-derived cardiac signal
# Higher HRV = better vagus nerve function
```

---

### 3. Neuroplasticity Efficiency Trend (25% weight)

**Purpose:** Measures whether the brain is getting better at neuroplasticity (meta-plasticity).

**Grounding:** *"You can actually get better at focusing by working on focus just the same way you would on any skill."*

```python
Neuroplasticity_Efficiency_Trend = trend_comparison(weeks_1_2, weeks_3_4)

# Compare early vs. recent performance
score = 50 + (30 × percent_improvement) - (30 × percent_decline)
score = clamp(score, 0, 100)
```

#### Measured by:

1. **LRI Improvement Rate**
   - Are you reaching high LRI states faster/more frequently?

2. **Optimal Window Capture Rate**
   - Are you utilizing post-exercise windows better?

3. **Sleep Consolidation Trend**
   - Is sleep quality improving?

**Example Calculation:**
```python
# Week 1-2 avg DNOS: 65
# Week 3-4 avg DNOS: 72
# Improvement: +10.8%
score = 50 + (30 × 0.108) = 53.2

# If improving +20%: score = 56.0
# If declining -10%: score = 47.0
```

---

### 4. Vagus Activation Health (15% weight)

**Purpose:** Measures effectiveness of the vagus → NTS → LC/NB pathway.

**Grounding:** *"High-intensity exercise triggers the vagus nerve, increasing alertness and opening plasticity windows."*

```python
Vagus_Activation_Health = 0.40 × Post_Exercise_LRI_Response +
                          0.35 × HRV_Trend +
                          0.25 × Exercise_Frequency_Score
```

#### Sub-components:

**Post-Exercise LRI Response (0-100)**
```python
# Measure LRI boost in 1-4h window post-exercise
actual_boost = avg_LRI_post_exercise - baseline_LRI
expected_boost = 25  # points

response_score = (actual_boost / expected_boost) × 100
response_score = clamp(response_score, 0, 100)

# Strong response: 30+ points → 100+
# Normal response: 25 points → 100
# Weak response: 15 points → 60
```

**HRV Trend (0-100)**
```python
# Is HRV improving over 28 days?
HRV_trend = linear_regression_slope(HRV_daily_values)
score = 50 + (normalize(HRV_trend) × 50)
```

**Exercise Frequency Score (0-100)**
```python
Exercise_Frequency_Score = (days_with_exercise / 28) × 100

# Huberman recommends regular vagus activation
# Optimal: 5-6 days/week → 75-85 score
```

---

## Scoring Interpretation

### 90-100: Elite Neuroplasticity Health
- ✅ Consistently completing full cycles (25+/28 days)
- ✅ Strong baseline capacity
- ✅ Improving efficiency over time
- ✅ Excellent vagus activation response

**Profile:** High performer, optimal learning system health

---

### 70-89: Good Neuroplasticity Health
- ✅ Frequently completing cycles (18-24/28 days)
- ✅ Decent baseline with room for improvement
- ✅ Stable or slightly improving

**Profile:** Healthy learning capacity, minor optimizations available

---

### 50-69: Moderate Neuroplasticity Health
- ⚠️ Inconsistent cycle completion (10-17/28 days)
- ⚠️ Below-optimal baseline
- ⚠️ Stagnant or declining trend

**Profile:** Learning system functional but underperforming

**Recommendations:**
- Increase post-exercise learning window utilization
- Improve sleep consolidation quality
- Add morning exercise routine

---

### Below 50: Poor Neuroplasticity Health
- ❌ Rarely completing full cycles (<10/28 days)
- ❌ Weak baseline capacity
- ❌ Declining trend or poor vagus function

**Profile:** Learning system compromised

**Action Required:**
- Focus on foundational sleep hygiene
- Establish consistent exercise routine
- Reduce stress/improve HRV
- Consider professional health assessment

---

## Huberman-Grounded Insights

When displaying Brain Score, provide mechanism-specific feedback:

### Vagus-Locus Coeruleus Pathway
```
"Post-exercise alertness boost: +28 points (strong)"
"Vagus nerve responsiveness: 85/100"
"Norepinephrine pathway: Highly functional"
```

### Acetylcholine-Focus Connection
```
"Nucleus basalis activation detected: 22/28 days"
"Focus capacity after exercise: 88/100"
"Acetylcholine pathway: Optimal"
```

### Sleep Consolidation Effectiveness
```
"Slow-wave density trend: ↑15% this month"
"Plasticity consolidation: Excellent"
"Sleep spindle density: Above baseline"
```

### Optimal Window Capture
```
"Post-exercise window utilization: 68% (↑ from 52%)"
"Best learning windows: 1.5-3h after morning exercise"
"Peak LRI consistently achieved during windows"
```

---

## UI/UX Specifications

### Brain Score Dashboard

```
┌────────────────────────────────────────────┐
│  BRAIN SCORE                                │
│                                             │
│         ╭───────────╮                      │
│         │    78     │  [28-day avg]        │
│         │   /100    │  ↑ +3 vs last month  │
│         ╰───────────╯                      │
│                                             │
│  Components:                                │
│  🔄 Cycle Completion        82/100         │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░                   │
│                                             │
│  🧠 Baseline Capacity       75/100         │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░                   │
│                                             │
│  📈 Efficiency Trend        76/100         │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░                   │
│                                             │
│  ⚡ Vagus Health            79/100         │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░                   │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│                                             │
│  🔬 Mechanism Insight:                     │
│  "Vagus activation improved 18% this month. │
│   Post-exercise LRI peaks show strongest    │
│   acetylcholine response (avg 84/100)."     │
│                                             │
│  💡 Recommendation:                        │
│  "Maintain exercise timing. Focus on sleep  │
│   quality to boost consolidation (current   │
│   SWS density: 18%, target: 22%)."         │
└────────────────────────────────────────────┘
```

### Trend Visualization

```
Brain Score - 28 Day Trend
100 ┤                           ╭─╮
 90 ┤                       ╭───╯ ╰╮
 80 ┤                   ╭───╯      ╰─╮
 70 ┤               ╭───╯             ╰─
 60 ┤           ╭───╯
 50 ┤       ╭───╯
    └────────────────────────────────────
     Week 1    Week 2    Week 3    Week 4

Key Events:
📍 Day 8:  Started morning exercise routine
📍 Day 15: Sleep quality improved (new mattress)
📍 Day 22: Consistent 2h post-exercise study sessions
```

---

## Implementation Roadmap

### MVP (Hackathon)
**Simplified Brain Score:**
```python
Brain_Score_MVP = 0.50 × Cycle_Completion_Rate +
                  0.30 × Morning_LRI_Trend +
                  0.20 × DNOS_7day_Trend

# Use 7-day window instead of 28-day
# No HRV integration yet
# Manual exercise logging
```

### Beta (Months 1-3)
**Add:**
- HRV integration (via Muse or chest strap)
- Full 28-day rolling calculation
- Automated exercise detection (accelerometer)
- Enhanced trend analysis

### Production (Months 4-6)
**Add:**
- Personalized baseline calibration
- Predictive recommendations
- Comparative analytics ("Your brain score vs. age group")
- Integration with learning platforms (Anki, Notion, etc.)

---

## Validation Metrics

### Phase 1: Algorithm Validation
- [ ] Brain Score correlates with DNOS (r > 0.7)
- [ ] Brain Score shows lower variance than DNOS (more stable)
- [ ] Cycle Completion Rate predicts next-week learning outcomes

### Phase 2: User Testing (N=10)
- [ ] Users with Brain Score > 80 report higher learning satisfaction
- [ ] Brain Score improvements correlate with skill acquisition rate
- [ ] Vagus Activation Health predicts post-exercise LRI boost (r > 0.6)

### Phase 3: Clinical Validation (N=100)
- [ ] Brain Score correlates with standardized cognitive assessments
- [ ] Improvement in Brain Score correlates with neuroplasticity outcomes
- [ ] Sleep consolidation component predicts memory retention

---

## Key Differentiators

### 1. Complete Cycle Emphasis
Unlike other health metrics that measure individual components, Brain Score captures:
> "Did you trigger neuroplasticity (high LRI) AND consolidate it (sleep)?"

### 2. Mechanism-Based Scoring
Components map directly to neurobiological pathways:
- Vagus → NTS → LC (alertness)
- Vagus → NTS → NB (focus/acetylcholine)
- Sleep consolidation (synaptic strengthening)

### 3. Actionable Longitudinal Feedback
Not just a score, but a system health indicator that guides:
- When to exercise for optimal learning windows
- Sleep quality targets for consolidation
- Progress tracking on neuroplasticity capacity

---

## References

1. Huberman, A. (2024). "Vagus Nerve Stimulation & Neuroplasticity" - Huberman Lab Podcast
2. Merzenich, M. et al. (2014). "Nucleus basalis stimulation enhances cortical plasticity" - Nature
3. Walker, M. (2017). "Why We Sleep" - Sleep consolidation mechanisms
4. Yerkes, R.M. & Dodson, J.D. (1908). "Optimal arousal theory"
5. McGaugh, J.L. (2000). "Memory consolidation and the amygdala" - PNAS

---

## Appendix: Formula Reference

### Normalization Functions

```python
def normalize(value, min_val, max_val):
    """Normalize value to 0-100 scale"""
    return ((value - min_val) / (max_val - min_val)) * 100

def clamp(value, min_val=0, max_val=100):
    """Clamp value to range"""
    return max(min_val, min(max_val, value))

def z_score_normalize(value, mean, std):
    """Z-score normalization"""
    return (value - mean) / std
```

### Trend Calculation

```python
def calculate_trend(data_week_1_2, data_week_3_4):
    """Calculate improvement/decline trend"""
    avg_early = mean(data_week_1_2)
    avg_recent = mean(data_week_3_4)

    percent_change = (avg_recent - avg_early) / avg_early

    score = 50 + (30 * percent_change)
    return clamp(score, 0, 100)
```

### Cycle Detection

```python
def is_complete_cycle(day_data):
    """Check if day has complete neuroplasticity cycle"""
    return all([
        day_data['max_LRI'] >= 70,
        day_data['high_LRI_duration_minutes'] >= 60,
        day_data['learning_session_logged'] == True,
        day_data['sleep_consolidation_score'] >= 70
    ])
```

---

**End of Brain Score Specification**
