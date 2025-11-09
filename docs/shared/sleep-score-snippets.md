# Sleep Score Snippets

Canonical formulas and code fragments shared across documentation and implementation.

## HRV-Enabled Formula
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

## Base Formula (No HRV Device)
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

## Component Function Example
```python
def score_duration(hours: float) -> float:
    """Score sleep duration based on optimal 7-9 hour range."""
    if 7 <= hours <= 9:
        return 100
    elif 6 <= hours < 7:
        return 80 - (7 - hours) * 40
    elif 9 < hours <= 10:
        return 80 - (hours - 9) * 40
    else:
        return max(40, 100 - abs(hours - 8) * 15)
```

> Keep this file up to date when formula weights change. All other documentation should reference this source instead of duplicating the equations.

