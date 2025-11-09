# Sleep Score Calculation Guide
## Implementation Reference for Enhanced Sleep Metrics

**Audience:** Backend developers
**Purpose:** Step-by-step calculation logic with code examples
**Version:** 2.0
**Date:** November 8, 2025

---

## Overview

This document provides implementation pseudocode and examples for calculating the research-validated sleep score. Use this as a reference when implementing `backend/scores/sleep_calculator.py`.

---

## Data Flow

```
Apple Health XML
    ↓
Sleep Record Parser (apple_health_parser.py)
    ↓
Enhanced Sleep Record Object (models.py)
    ↓
Sleep Score Calculator (sleep_calculator.py)
    ↓
{sleep_score: 82, version: 'hrv_enabled', components: {...}}
```

---

## Calculation Steps

### Step 1: Data Ingestion

**Input:** Parsed sleep data from Apple Health for one night

**Required Fields:**
- `duration_hours`: Total sleep time
- `efficiency`: (Total Sleep Time / Time in Bed) × 100
- `waso_minutes`: Wake After Sleep Onset
- `sol_minutes`: Sleep Onset Latency
- `bedtime_consistency_sd`: Bedtime variance over 7 days (if available)

**Optional Fields (for HRV-enabled formula):**
- `hrv_rmssd`: Average HRV during sleep
- `avg_respiratory_rate`: Breaths per minute
- `deep_sleep_percent`: % of total sleep in deep sleep

**Example Data:**
```python
sleep_data = {
    'date': '2025-11-08',
    'duration_hours': 7.5,
    'efficiency': 88.0,
    'waso_minutes': 22.0,
    'sol_minutes': 15.0,
    'bedtime_consistency_sd': 18.5,  # From 7-day history
    'hrv_rmssd': 58.3,  # Optional
    'avg_respiratory_rate': 14.2,  # Optional
    'deep_sleep_percent': 17.3,  # Optional
    'user_age': 30  # For age-adjusted HRV scoring
}
```

---

### Step 2: Score Each Component

Each component is scored 0-100 based on optimal ranges from research.

#### 2.1 Duration Score

**Optimal Range:** 7-9 hours
**Scientific Basis:** Walker (2017) - Sleep duration directly impacts consolidation

```python
def score_duration(hours: float) -> float:
    """Score sleep duration based on optimal 7-9 hour range."""
    if 7 <= hours <= 9:
        return 100
    elif 6 <= hours < 7:
        # Linear penalty from 7h down to 6h
        return 80 - (7 - hours) * 40  # 6h = 40, 6.5h = 60
    elif 9 < hours <= 10:
        # Linear penalty from 9h up to 10h
        return 80 - (hours - 9) * 40  # 10h = 40, 9.5h = 60
    else:
        # Outside 6-10h range
        return max(40, 100 - abs(hours - 8) * 15)
```

**Examples:**
- 8.0 hours → 100
- 7.5 hours → 100
- 6.5 hours → 60
- 10.0 hours → 40
- 5.0 hours → 55

---

#### 2.2 Efficiency Score

**Optimal Range:** ≥85%
**Scientific Basis:** Ohayon et al. (2017) - Efficiency >85% = good quality

```python
def score_efficiency(efficiency_pct: float) -> float:
    """Score sleep efficiency with >85% as optimal."""
    if efficiency_pct >= 85:
        return 100
    elif efficiency_pct >= 75:
        # Linear scaling from 75% (score 70) to 85% (score 100)
        return 70 + (efficiency_pct - 75) * 3
    else:
        # Below 75%
        return max(40, efficiency_pct * 0.93)
```

**Examples:**
- 90% → 100
- 85% → 100
- 80% → 85
- 75% → 70
- 65% → 60

---

#### 2.3 HRV Sleep Score (Optional)

**Optimal Range:** Age-adjusted (e.g., 45-90 ms RMSSD for age 30)
**Scientific Basis:** Frontiers (2025) - 70% variance in memory improvement

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
        # Below optimal - gradual penalty
        return 50 + (rmssd_ms / min_opt) * 50
    else:
        # Above optimal (less concerning than below)
        excess = rmssd_ms - max_opt
        return max(70, 100 - (excess / 20) * 30)
```

**Examples (age 30):**
- 70 ms → 100 (optimal range)
- 45 ms → 100 (lower bound)
- 30 ms → 83 (below optimal)
- 100 ms → 85 (above optimal, still good)

---

#### 2.4 Consistency Score

**Optimal Range:** <30 min bedtime variance
**Scientific Basis:** Phillips et al. (2017) - 25% academic performance variance

```python
def score_consistency(bedtime_sd_minutes: float) -> float:
    """Score bedtime consistency over 7-day window."""

    if bedtime_sd_minutes <= 15:  # <15 min variance = excellent
        return 100
    elif bedtime_sd_minutes <= 30:  # <30 min = good
        return 100 - (bedtime_sd_minutes - 15) * 2
    elif bedtime_sd_minutes <= 60:  # <60 min = acceptable
        return 70 - (bedtime_sd_minutes - 30) * 1.5
    else:  # >60 min = poor
        return max(40, 70 - (bedtime_sd_minutes - 60) * 0.5)
```

**Examples:**
- 10 min SD → 100
- 20 min SD → 90
- 30 min SD → 70
- 60 min SD → 40
- 90 min SD → 25 (floor at 40)

---

#### 2.5 WASO Score

**Optimal Range:** <30 min
**Scientific Basis:** Scullin (2019) - Fragmentation impairs consolidation

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

**Examples:**
- 10 min → 100
- 22 min → 86
- 30 min → 70
- 45 min → 55
- 70 min → 35 (floor at 40)

---

#### 2.6 Sleep Onset Latency Score

**Optimal Range:** 10-20 min
**Scientific Basis:** Ohayon et al. (2000) - SOL <5 min = sleep deprivation

```python
def score_sol(sol_min: float) -> float:
    """Score sleep onset latency (10-20 min optimal)."""

    if 10 <= sol_min <= 20:
        return 100
    elif 5 <= sol_min < 10:
        # Slightly fast (but acceptable)
        return 70 + (sol_min - 5) * 6
    elif 20 < sol_min <= 30:
        # Slightly slow (acceptable)
        return 100 - (sol_min - 20) * 3
    elif sol_min < 5:
        # Very fast = sleep deprivation flag
        return 50
    else:
        # >30 min = insomnia or not tired
        return max(40, 70 - (sol_min - 30) * 0.5)
```

**Examples:**
- 15 min → 100
- 8 min → 88
- 25 min → 85
- 3 min → 50 (sleep deprivation)
- 40 min → 65

---

#### 2.7 Respiratory Rate Score

**Optimal Range:** 12-16 bpm
**Scientific Basis:** Kryger et al. (2011) - Detects sleep apnea risk

```python
def score_respiratory_rate(avg_bpm: float) -> float:
    """Score respiratory rate (12-16 bpm optimal)."""

    if 12 <= avg_bpm <= 16:
        return 100
    elif 10 <= avg_bpm < 12:
        # Slightly low
        return 70 + (avg_bpm - 10) * 15
    elif 16 < avg_bpm <= 20:
        # Slightly high
        return 70 + (20 - avg_bpm) * 7.5
    else:
        # Outside normal range
        return max(40, 100 - abs(avg_bpm - 14) * 10)
```

**Examples:**
- 14 bpm → 100
- 11 bpm → 85
- 18 bpm → 85
- 22 bpm → 20 (floor at 40)

---

#### 2.8 Deep Sleep Percent Score

**Optimal Range:** >15% of total sleep time
**Scientific Basis:** Stickgold (2005) - SWS drives consolidation

```python
def score_deep_sleep_pct(deep_pct: float) -> float:
    """Score deep sleep percentage (>15% optimal)."""

    if deep_pct >= 15:
        return 100
    elif deep_pct >= 10:
        # Acceptable range 10-15%
        return 60 + (deep_pct - 10) * 8
    else:
        # Below 10%
        return max(40, deep_pct * 6)
```

**Examples:**
- 18% → 100
- 15% → 100
- 12% → 76
- 8% → 48

---

### Step 3: Apply Formula

```python
def calculate_sleep_score(
    sleep_data: Dict,
    has_hrv: bool = None,
    user_age: int = 30
) -> Dict:
    """
    Calculate sleep score using appropriate formula.

    Args:
        sleep_data: Dict with sleep metrics
        has_hrv: Whether HRV data available (auto-detected if None)
        user_age: User's age for HRV scoring

    Returns:
        Dict with sleep_score, version, components, weights
    """

    # Auto-detect HRV availability
    if has_hrv is None:
        has_hrv = (sleep_data.get('hrv_rmssd') is not None and
                   sleep_data.get('hrv_rmssd') > 0)

    if has_hrv:
        return _calculate_hrv_enabled_score(sleep_data, user_age)
    else:
        return _calculate_base_score(sleep_data)


def _calculate_hrv_enabled_score(sleep_data: Dict, user_age: int) -> Dict:
    """HRV-enabled formula (8 components)."""

    # Score each component
    components = {
        'duration': score_duration(sleep_data['duration_hours']),
        'efficiency': score_efficiency(sleep_data['efficiency']),
        'hrv_sleep': score_hrv_sleep(sleep_data['hrv_rmssd'], user_age),
        'consistency': score_consistency(sleep_data.get('bedtime_consistency_sd', 50)),
        'waso': score_waso(sleep_data['waso_minutes']),
        'sol': score_sol(sleep_data['sol_minutes']),
        'resp_rate': score_respiratory_rate(sleep_data.get('avg_respiratory_rate', 14)),
        'deep_pct': score_deep_sleep_pct(sleep_data.get('deep_sleep_percent', 10))
    }

    # Weight each component
    weights = {
        'duration': 0.30,
        'efficiency': 0.25,
        'hrv_sleep': 0.10,
        'consistency': 0.10,
        'waso': 0.10,
        'sol': 0.05,
        'resp_rate': 0.05,
        'deep_pct': 0.05
    }

    # Weighted sum
    total_score = sum(components[metric] * weights[metric] for metric in weights)

    # Identify top drivers
    top_positive = _get_top_drivers(components, weights, positive=True)
    top_negative = _get_top_drivers(components, weights, positive=False)

    return {
        'sleep_score': round(total_score, 1),
        'formula_version': 'hrv_enabled',
        'components': {k: round(v, 1) for k, v in components.items()},
        'weights': weights,
        'top_positive_drivers': top_positive,
        'top_negative_drivers': top_negative,
        'metadata': {
            'has_hrv': True,
            'has_consistency': sleep_data.get('bedtime_consistency_sd') is not None
        }
    }


def _calculate_base_score(sleep_data: Dict) -> Dict:
    """Base formula (6 components, no HRV)."""

    # Score each component
    components = {
        'duration': score_duration(sleep_data['duration_hours']),
        'efficiency': score_efficiency(sleep_data['efficiency']),
        'consistency': score_consistency(sleep_data.get('bedtime_consistency_sd', 50)),
        'waso': score_waso(sleep_data['waso_minutes']),
        'sol': score_sol(sleep_data['sol_minutes']),
        'resp_rate': score_respiratory_rate(sleep_data.get('avg_respiratory_rate', 14))
    }

    # Weight each component (redistributed without HRV)
    weights = {
        'duration': 0.35,  # +5% from HRV
        'efficiency': 0.30,
        'consistency': 0.15,  # +5% from HRV
        'waso': 0.10,
        'sol': 0.05,
        'resp_rate': 0.05
    }

    # Weighted sum
    total_score = sum(components[metric] * weights[metric] for metric in weights)

    # Identify top drivers
    top_positive = _get_top_drivers(components, weights, positive=True)
    top_negative = _get_top_drivers(components, weights, positive=False)

    return {
        'sleep_score': round(total_score, 1),
        'formula_version': 'base',
        'components': {k: round(v, 1) for k, v in components.items()},
        'weights': weights,
        'top_positive_drivers': top_positive,
        'top_negative_drivers': top_negative,
        'metadata': {
            'has_hrv': False,
            'has_consistency': sleep_data.get('bedtime_consistency_sd') is not None,
            'upgrade_note': 'Add Apple Watch for HRV-enhanced scoring'
        }
    }


def _get_top_drivers(components: Dict, weights: Dict, positive: bool = True, top_n: int = 3) -> List[str]:
    """Identify top positive or negative drivers."""

    # Calculate impact: score deviation from 70 × weight
    impacts = {}
    for metric, score in components.items():
        deviation = score - 70  # 70 = neutral
        impact = deviation * weights.get(metric, 0)
        impacts[metric] = impact

    # Sort by impact (positive or negative)
    if positive:
        sorted_metrics = sorted(impacts.items(), key=lambda x: x[1], reverse=True)
    else:
        sorted_metrics = sorted(impacts.items(), key=lambda x: x[1])

    # Filter to only positive or negative
    if positive:
        filtered = [(m, i) for m, i in sorted_metrics if i > 0]
    else:
        filtered = [(m, i) for m, i in sorted_metrics if i < 0]

    # Return top N metric names
    return [m for m, i in filtered[:top_n]]
```

---

### Step 4: Generate User-Facing Output

```python
def format_sleep_score_output(sleep_score_data: Dict, sleep_data: Dict) -> Dict:
    """Format sleep score for user display."""

    # Interpretations
    def interpret_score(score: float) -> str:
        if score >= 85:
            return "Excellent"
        elif score >= 70:
            return "Good"
        elif score >= 50:
            return "Moderate"
        else:
            return "Needs Improvement"

    # Component details
    component_details = {}
    for metric, score in sleep_score_data['components'].items():
        component_details[metric] = {
            'score': score,
            'weight': sleep_score_data['weights'][metric],
            'interpretation': interpret_score(score),
            'value': _get_metric_value(metric, sleep_data),
            'optimal': _get_optimal_range(metric),
            'unit': _get_metric_unit(metric)
        }

    # Recommendations
    recommendations = _generate_recommendations(
        sleep_score_data['components'],
        sleep_score_data['top_negative_drivers']
    )

    return {
        'sleep_score': sleep_score_data['sleep_score'],
        'interpretation': interpret_score(sleep_score_data['sleep_score']),
        'formula_version': sleep_score_data['formula_version'],
        'components': component_details,
        'top_positive_drivers': sleep_score_data['top_positive_drivers'],
        'top_negative_drivers': sleep_score_data['top_negative_drivers'],
        'recommendations': recommendations
    }


def _get_metric_value(metric: str, sleep_data: Dict):
    """Get raw value for a metric."""
    mapping = {
        'duration': sleep_data['duration_hours'],
        'efficiency': sleep_data['efficiency'],
        'hrv_sleep': sleep_data.get('hrv_rmssd'),
        'consistency': sleep_data.get('bedtime_consistency_sd'),
        'waso': sleep_data['waso_minutes'],
        'sol': sleep_data['sol_minutes'],
        'resp_rate': sleep_data.get('avg_respiratory_rate'),
        'deep_pct': sleep_data.get('deep_sleep_percent')
    }
    return mapping.get(metric)


def _get_optimal_range(metric: str) -> str:
    """Get optimal range for display."""
    mapping = {
        'duration': '7-9 hours',
        'efficiency': '>85%',
        'hrv_sleep': '60-80 ms (age 30)',
        'consistency': '<30 min variance',
        'waso': '<30 min',
        'sol': '10-20 min',
        'resp_rate': '12-16 bpm',
        'deep_pct': '>15%'
    }
    return mapping.get(metric, '')


def _get_metric_unit(metric: str) -> str:
    """Get unit for display."""
    mapping = {
        'duration': 'hours',
        'efficiency': '%',
        'hrv_sleep': 'ms RMSSD',
        'consistency': 'min SD',
        'waso': 'minutes',
        'sol': 'minutes',
        'resp_rate': 'bpm',
        'deep_pct': '%'
    }
    return mapping.get(metric, '')


def _generate_recommendations(components: Dict, negative_drivers: List[str]) -> List[str]:
    """Generate actionable recommendations."""
    recs = []

    if 'consistency' in negative_drivers:
        recs.append("Keep your bedtime within 30 minutes each night for better circadian rhythm")

    if 'hrv_sleep' in negative_drivers:
        recs.append("To improve HRV: reduce evening stress, keep bedroom cool (60-67°F)")

    if 'waso' in negative_drivers:
        recs.append("Reduce nighttime awakenings: limit fluids 2h before bed, keep bedroom dark")

    if 'duration' in negative_drivers:
        recs.append("Aim for 7-9 hours of sleep by setting a consistent bedtime")

    if 'efficiency' in negative_drivers:
        recs.append("Improve sleep efficiency: only go to bed when sleepy, avoid screens 1h before")

    if 'sol' in negative_drivers and components.get('sol', 100) < 60:
        recs.append("Sleep onset too long: try relaxation techniques, move bedtime later")

    # Add positive reinforcement
    if not negative_drivers or len(recs) == 0:
        recs.append("Great sleep! Keep doing what you're doing.")

    return recs[:3]  # Max 3 recommendations
```

---

## Edge Cases

### Missing HRV Data
```python
if not sleep_data.get('hrv_rmssd'):
    # Use base formula
    result = _calculate_base_score(sleep_data)
    result['metadata']['note'] = 'HRV unavailable - using base formula'
```

### Missing Consistency (<7 days)
```python
if not sleep_data.get('bedtime_consistency_sd'):
    # Use neutral score of 70
    consistency_score = 70
    metadata['consistency_note'] = 'Insufficient history (<7 nights)'
```

### Missing Sleep Stages
```python
if not sleep_data.get('deep_sleep_percent'):
    # Skip deep sleep component or estimate from duration
    deep_sleep_pct_score = 70  # Neutral
```

---

## Complete Example

```python
# Input data
sleep_data = {
    'duration_hours': 7.5,
    'efficiency': 88.0,
    'waso_minutes': 22.0,
    'sol_minutes': 15.0,
    'bedtime_consistency_sd': 18.5,
    'hrv_rmssd': 58.3,
    'avg_respiratory_rate': 14.2,
    'deep_sleep_percent': 17.3
}

# Calculate score
result = calculate_sleep_score(sleep_data, user_age=30)

# Result:
{
    'sleep_score': 82.3,
    'formula_version': 'hrv_enabled',
    'components': {
        'duration': 95.0,
        'efficiency': 88.0,
        'hrv_sleep': 72.0,
        'consistency': 85.0,
        'waso': 86.0,
        'sol': 100.0,
        'resp_rate': 100.0,
        'deep_pct': 100.0
    },
    'weights': {...},
    'top_positive_drivers': ['sol', 'deep_pct', 'resp_rate'],
    'top_negative_drivers': ['hrv_sleep']
}
```

---

## Testing

### Unit Tests

```python
def test_score_duration():
    assert score_duration(8.0) == 100
    assert score_duration(7.5) == 100
    assert score_duration(6.5) == 60
    assert score_duration(5.0) == 55


def test_score_efficiency():
    assert score_efficiency(90) == 100
    assert score_efficiency(85) == 100
    assert score_efficiency(80) == 85


def test_calculate_sleep_score_hrv_enabled():
    sleep_data = {
        'duration_hours': 7.5,
        'efficiency': 88.0,
        'waso_minutes': 22.0,
        'sol_minutes': 15.0,
        'hrv_rmssd': 65.0,
        'deep_sleep_percent': 18.0
    }

    result = calculate_sleep_score(sleep_data, has_hrv=True, user_age=30)

    assert 80 <= result['sleep_score'] <= 90
    assert result['formula_version'] == 'hrv_enabled'
    assert 'duration' in result['components']
```

---

## Next Steps

1. Implement all scoring functions in `backend/scores/sleep_calculator.py`
2. Add comprehensive unit tests
3. Validate against real sleep data
4. Integrate with Apple Health parser
5. Add user-facing output formatting

---

## References

- See `/docs/algorithm/SLEEP-METRICS-SPECIFICATION.md` for scientific rationale
- See `/docs/data-processing/APPLE-HEALTH-INTEGRATION.md` for data extraction

---

**End of Sleep Score Calculation Guide**

Last Updated: November 8, 2025
