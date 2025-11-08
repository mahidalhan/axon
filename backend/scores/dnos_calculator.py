"""
Daily Neuroplasticity Opportunity Score (DNOS).
Integrates LRI, optimal window utilization, and sleep consolidation.
"""

import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta


class DNOSCalculator:
    def __init__(self):
        self.optimal_window_hours = 3

    def calculate_dnos(self,
                      lri_samples: List[Dict],
                      sleep_score: float,
                      exercise_time: datetime = None) -> Dict:
        """
        Calculate Daily Neuroplasticity Opportunity Score.
        """
        if len(lri_samples) == 0:
            return None

        # Component 1: Average LRI during active hours
        active_hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        active_samples = [
            s for s in lri_samples
            if s['timestamp'].hour in active_hours
        ]

        avg_lri = np.mean([s['lri'] for s in active_samples]) if active_samples else 50

        # Component 2: Optimal window utilization
        if exercise_time:
            window_util = self._calculate_window_utilization(
                lri_samples, exercise_time
            )
        else:
            window_util = 0

        # Component 3: Previous night sleep consolidation
        sleep_component = sleep_score if sleep_score else 50

        # Weighted DNOS
        dnos = (0.50 * avg_lri +
                0.30 * window_util +
                0.20 * sleep_component)

        return {
            'dnos': round(dnos, 1),
            'avg_lri': round(avg_lri, 1),
            'optimal_window_utilization': round(window_util, 1),
            'sleep_consolidation': round(sleep_component, 1),
            'insights': self._generate_insights(avg_lri, window_util, sleep_component)
        }

    def _calculate_window_utilization(self,
                                     lri_samples: List[Dict],
                                     exercise_time: datetime) -> float:
        """
        Calculate % of optimal window (1-4h post-exercise) with high LRI.
        """
        window_start = exercise_time + timedelta(hours=1)
        window_end = exercise_time + timedelta(hours=4)

        window_samples = [
            s for s in lri_samples
            if window_start <= s['timestamp'] <= window_end
        ]

        if len(window_samples) == 0:
            return 0

        high_lri_count = sum(1 for s in window_samples if s['lri'] >= 60)
        utilization_pct = 100 * high_lri_count / len(window_samples)

        return utilization_pct

    def _generate_insights(self, avg_lri: float,
                          window_util: float,
                          sleep_score: float) -> List[str]:
        """Generate human-readable insights."""
        insights = []

        if avg_lri >= 70:
            insights.append("Strong learning readiness maintained throughout day")
        elif avg_lri < 50:
            insights.append("Low baseline alertness - consider earlier sleep or exercise")

        if window_util >= 60:
            insights.append(f"Excellent post-exercise window capture ({window_util:.0f}%)")
        elif window_util > 0:
            insights.append(f"Missed opportunities in post-exercise window ({window_util:.0f}% utilized)")

        if sleep_score >= 80:
            insights.append("Previous night's sleep quality supports consolidation")
        elif sleep_score < 60:
            insights.append("Poor sleep quality may limit neuroplasticity outcomes")

        return insights
