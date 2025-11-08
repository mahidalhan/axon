"""
Brain Score: 28-day rolling neuroplasticity health metric.
"""

import numpy as np
from typing import List, Dict
from datetime import date


class BrainScoreCalculator:
    def __init__(self):
        self.window_days = 28

    def calculate_brain_score(self,
                             dnos_history: List[Dict],
                             lri_history: List[Dict],
                             sleep_history: List[Dict]) -> Dict:
        """
        Calculate 28-day Brain Score.
        """
        # Component 1: Cycle Completion Rate (35%)
        cycle_completion = self._calculate_cycle_completion(
            dnos_history, lri_history, sleep_history
        )

        # Component 2: Baseline Capacity (25%)
        baseline_capacity = self._calculate_baseline_capacity(lri_history)

        # Component 3: Efficiency Trend (25%)
        efficiency_trend = self._calculate_efficiency_trend(dnos_history)

        # Component 4: Vagus Activation Health (15%)
        vagus_health = self._calculate_vagus_health(lri_history)

        # Weighted Brain Score
        brain_score = (0.35 * cycle_completion['score'] +
                      0.25 * baseline_capacity['score'] +
                      0.25 * efficiency_trend['score'] +
                      0.15 * vagus_health['score'])

        return {
            'brain_score': round(brain_score, 1),
            'cycle_completion_score': cycle_completion['score'],
            'complete_cycles': cycle_completion['complete_cycles'],
            'baseline_capacity_score': baseline_capacity['score'],
            'morning_lri_avg': baseline_capacity['morning_lri_avg'],
            'efficiency_trend_score': efficiency_trend['score'],
            'improvement_pct': efficiency_trend['improvement_pct'],
            'vagus_health_score': vagus_health['score'],
            'exercise_days': vagus_health['exercise_days'],
            'interpretation': self._get_interpretation(brain_score),
            'recommendations': self._get_recommendations(
                cycle_completion, baseline_capacity, efficiency_trend, vagus_health
            )
        }

    def _calculate_cycle_completion(self,
                                   dnos_history: List[Dict],
                                   lri_history: List[Dict],
                                   sleep_history: List[Dict]) -> Dict:
        """
        Count complete neuroplasticity cycles.
        """
        complete_cycles = 0

        for day_dnos in dnos_history:
            day_date = day_dnos['date']

            # Check trigger: High LRI for sustained period
            day_lri_samples = [
                s for s in lri_history
                if s['timestamp'].date() == day_date
            ]
            high_lri_minutes = sum(
                1 for s in day_lri_samples if s['lri'] >= 70
            ) * 0.5

            trigger_met = high_lri_minutes >= 60

            # Check consolidation: Sleep score >= 70
            day_sleep = next(
                (s for s in sleep_history if s['date'] == day_date),
                None
            )
            consolidation_met = day_sleep and day_sleep['sleep_score'] >= 70

            # Signal: learning activity
            signal_met = day_dnos['avg_lri'] >= 60

            if trigger_met and signal_met and consolidation_met:
                complete_cycles += 1

        score = (complete_cycles / self.window_days) * 100

        return {
            'score': round(score, 1),
            'complete_cycles': complete_cycles,
        }

    def _calculate_baseline_capacity(self, lri_history: List[Dict]) -> Dict:
        """
        Measure resting-state brain health.
        """
        morning_lri_scores = [
            sample['lri'] for sample in lri_history
            if sample['timestamp'].hour in [7, 8]
        ]

        if len(morning_lri_scores) == 0:
            return {'score': 50, 'morning_lri_avg': 50}

        avg_morning_lri = np.mean(morning_lri_scores)
        score = np.clip((avg_morning_lri - 40) * 2.5, 0, 100)

        return {
            'score': round(score, 1),
            'morning_lri_avg': round(avg_morning_lri, 1),
        }

    def _calculate_efficiency_trend(self, dnos_history: List[Dict]) -> Dict:
        """
        Measure whether neuroplasticity is improving.
        """
        if len(dnos_history) < 28:
            return {'score': 50, 'improvement_pct': 0}

        week_1_2 = dnos_history[0:14]
        week_3_4 = dnos_history[14:28]

        avg_early = np.mean([d['dnos'] for d in week_1_2])
        avg_recent = np.mean([d['dnos'] for d in week_3_4])

        percent_change = ((avg_recent - avg_early) / avg_early) * 100

        score = 50 + (30 * (percent_change / 100))
        score = np.clip(score, 0, 100)

        return {
            'score': round(score, 1),
            'improvement_pct': round(percent_change, 1),
        }

    def _calculate_vagus_health(self, lri_history: List[Dict]) -> Dict:
        """
        Measure vagus nerve pathway effectiveness.
        """
        # Group by date
        lri_by_date = {}
        for sample in lri_history:
            day = sample['timestamp'].date()
            if day not in lri_by_date:
                lri_by_date[day] = []
            lri_by_date[day].append(sample)

        exercise_days = set()

        # Detect exercise days (afternoon LRI boost)
        for day, samples in lri_by_date.items():
            morning_samples = [s for s in samples if s['timestamp'].hour in [7, 8, 9]]
            afternoon_samples = [s for s in samples if s['timestamp'].hour in [14, 15, 16]]

            if morning_samples and afternoon_samples:
                morning_avg = np.mean([s['lri'] for s in morning_samples])
                afternoon_avg = np.mean([s['lri'] for s in afternoon_samples])

                if afternoon_avg > morning_avg + 15:
                    exercise_days.add(day)

        exercise_frequency = len(exercise_days)
        score = (exercise_frequency / 22) * 100
        score = np.clip(score, 0, 100)

        return {
            'score': round(score, 1),
            'exercise_days': exercise_frequency,
        }

    def _get_interpretation(self, score: float) -> str:
        """Get interpretation category."""
        if score >= 90:
            return "Elite Neuroplasticity Health"
        elif score >= 70:
            return "Good Neuroplasticity Health"
        elif score >= 50:
            return "Moderate Neuroplasticity Health"
        else:
            return "Poor Neuroplasticity Health"

    def _get_recommendations(self, cycle_comp, baseline, efficiency, vagus) -> List[str]:
        """Generate actionable recommendations."""
        recs = []

        if cycle_comp['score'] < 70:
            recs.append("Increase complete cycle frequency - focus on pairing high LRI days with quality sleep")

        if baseline['score'] < 60:
            recs.append("Improve morning baseline with consistent wake time and morning exercise routine")

        if efficiency['score'] < 50:
            recs.append("Efficiency declining - review sleep quality and stress management")

        if vagus['score'] < 60:
            recs.append("Add regular exercise (5-6 days/week) to activate vagus nerve pathway")

        if len(recs) == 0:
            recs.append("Excellent performance - maintain current protocols")

        return recs
