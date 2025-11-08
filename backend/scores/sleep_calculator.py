"""
Sleep Consolidation Score Calculator.
Based on sleep stages → 0-100 score.
"""

import numpy as np
from typing import Dict


class SleepConsolidationCalculator:
    def __init__(self):
        self.target_deep_pct = 22.0
        self.target_rem_pct = 20.0
        self.target_efficiency = 90.0

    def calculate_sleep_score(self, sleep_data: Dict) -> Dict:
        """
        Calculate Sleep Consolidation Score (0-100).
        """
        deep_pct = sleep_data.get('deep_sleep_pct', 0)
        rem_pct = sleep_data.get('rem_sleep_pct', 0)
        efficiency = sleep_data.get('efficiency', 0)
        total_min = sleep_data.get('total_sleep_min', 0)

        # Component scores
        sws_score = self._score_deep_sleep(deep_pct)
        rem_score = self._score_rem(rem_pct)
        efficiency_score = self._score_efficiency(efficiency)
        duration_score = self._score_duration(total_min)

        # Weighted consolidation score
        sleep_score = (0.4 * sws_score +
                      0.3 * rem_score +
                      0.2 * efficiency_score +
                      0.1 * duration_score)

        return {
            'sleep_score': round(sleep_score, 1),
            'components': {
                'sws_quality': round(sws_score, 1),
                'rem_quality': round(rem_score, 1),
                'efficiency': round(efficiency_score, 1),
                'duration': round(duration_score, 1)
            }
        }

    def _score_deep_sleep(self, deep_pct: float) -> float:
        """Score deep sleep percentage (optimal: 20-25%)."""
        if 20 <= deep_pct <= 25:
            return 100
        elif deep_pct >= 15:
            return 70 + (deep_pct - 15) * 6
        elif deep_pct >= 10:
            return 40 + (deep_pct - 10) * 6
        else:
            return deep_pct * 4

    def _score_rem(self, rem_pct: float) -> float:
        """Score REM percentage (optimal: 18-25%)."""
        if 18 <= rem_pct <= 25:
            return 100
        elif rem_pct >= 12:
            return 60 + (rem_pct - 12) * 6.67
        else:
            return rem_pct * 5

    def _score_efficiency(self, efficiency: float) -> float:
        """Score sleep efficiency (optimal: >85%)."""
        if efficiency >= 85:
            return 100
        elif efficiency >= 70:
            return 50 + (efficiency - 70) * 3.33
        else:
            return efficiency * 0.71

    def _score_duration(self, total_min: float) -> float:
        """Score total sleep duration (optimal: 420-540 min / 7-9 hours)."""
        if 420 <= total_min <= 540:
            return 100
        elif total_min >= 360:
            return 60 + (total_min - 360) * 0.67
        elif total_min >= 540:
            return 100 - (total_min - 540) * 0.5
        else:
            return total_min * 0.17
