"""
Synthetic 28-day journey generator for demo purposes.
"""

import numpy as np
from datetime import datetime, timedelta, date
from typing import List, Dict
from scores.lri_calculator import LRICalculator
from scores.sleep_calculator import SleepConsolidationCalculator
from scores.dnos_calculator import DNOSCalculator
from scores.brain_score_calculator import BrainScoreCalculator


class SyntheticJourneyGenerator:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.lri_calc = LRICalculator()
        self.sleep_calc = SleepConsolidationCalculator()
        self.dnos_calc = DNOSCalculator()
        self.brain_score_calc = BrainScoreCalculator()

    def generate_28_day_journey(self, improvement_trend: bool = True) -> Dict:
        """
        Generate realistic 28-day user journey with all metrics.
        """
        start_date = datetime.now() - timedelta(days=27)
        
        journey = {
            'lri_samples': [],
            'sleep_records': [],
            'dnos_scores': [],
            'brain_score': None
        }

        all_lri_for_brain_score = []
        all_sleep_for_brain_score = []

        for day_offset in range(28):
            current_date = start_date + timedelta(days=day_offset)
            
            # Improvement trend
            if improvement_trend:
                trend_multiplier = 1.0 + (day_offset / 28) * 0.15
            else:
                trend_multiplier = 1.0

            # Exercise on 75% of days
            has_exercise = np.random.random() < 0.75
            exercise_time = current_date.replace(hour=7, minute=30) if has_exercise else None

            # Generate LRI samples for the day
            day_lri_samples = self._generate_day_lri(
                current_date, trend_multiplier, exercise_time
            )
            journey['lri_samples'].extend(day_lri_samples)
            all_lri_for_brain_score.extend(day_lri_samples)

            # Generate sleep score
            sleep_record = self._generate_sleep_record(
                current_date.date(), day_offset, improvement_trend
            )
            journey['sleep_records'].append(sleep_record)
            all_sleep_for_brain_score.append({
                'date': sleep_record['date'],
                'sleep_score': sleep_record['sleep_score']
            })

            # Calculate DNOS
            dnos = self.dnos_calc.calculate_dnos(
                day_lri_samples,
                sleep_record['sleep_score'],
                exercise_time
            )
            
            if dnos:
                dnos['date'] = current_date.date()
                journey['dnos_scores'].append(dnos)

        # Calculate Brain Score
        brain_score = self.brain_score_calc.calculate_brain_score(
            journey['dnos_scores'],
            all_lri_for_brain_score,
            all_sleep_for_brain_score
        )
        
        brain_score['period_start'] = start_date.date()
        brain_score['period_end'] = (start_date + timedelta(days=27)).date()
        journey['brain_score'] = brain_score

        return journey

    def _generate_day_lri(self, date: datetime, multiplier: float, 
                         exercise_time: datetime) -> List[Dict]:
        """Generate LRI samples for one day."""
        samples = []

        # Morning samples (7-9 AM) - 4 samples
        for hour in [7, 8]:
            for minute in [0, 30]:
                timestamp = date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                band_power = self._generate_band_power(base_level='moderate')
                lri_result = self.lri_calc.calculate_lri(band_power)
                
                # Apply trend
                lri_result['lri'] = min(100, lri_result['lri'] * multiplier)
                lri_result['timestamp'] = timestamp
                samples.append(lri_result)

        # Post-exercise peak (if exercise occurred) - 9-12 PM
        if exercise_time:
            for hours_after in [1.5, 2, 2.5, 3, 3.5]:
                peak_time = exercise_time + timedelta(hours=hours_after)
                band_power = self._generate_band_power(base_level='high')
                lri_result = self.lri_calc.calculate_lri(band_power, post_exercise_multiplier=1.3)
                
                lri_result['lri'] = min(100, lri_result['lri'] * multiplier)
                lri_result['timestamp'] = peak_time
                lri_result['post_exercise_window'] = True
                
                # Calculate remaining minutes in window
                window_end = exercise_time + timedelta(hours=4)
                remaining = (window_end - peak_time).total_seconds() / 60
                lri_result['window_remaining_minutes'] = int(max(0, remaining))
                
                samples.append(lri_result)

        # Afternoon samples (14-18) - 8 samples
        for hour in [14, 15, 16, 17]:
            for minute in [0, 30]:
                timestamp = date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                band_power = self._generate_band_power(base_level='moderate')
                lri_result = self.lri_calc.calculate_lri(band_power)
                
                lri_result['lri'] = min(100, lri_result['lri'] * multiplier * 0.95)  # Slight afternoon dip
                lri_result['timestamp'] = timestamp
                samples.append(lri_result)

        return samples

    def _generate_band_power(self, base_level: str = 'moderate') -> Dict[str, float]:
        """Generate synthetic EEG band power data."""
        if base_level == 'high':
            base_multiplier = 1.3
        elif base_level == 'low':
            base_multiplier = 0.7
        else:
            base_multiplier = 1.0

        # Add random variation
        noise = np.random.normal(1.0, 0.1)
        multiplier = base_multiplier * noise

        return {
            'delta_tp9': 0.5 * multiplier,
            'theta_tp9': 0.8 * multiplier,
            'alpha_tp9': 0.6 * multiplier,
            'beta_tp9': 1.2 * multiplier,
            'gamma_tp9': 0.15 * multiplier,
            'delta_af7': 0.5 * multiplier,
            'theta_af7': 0.85 * multiplier,
            'alpha_af7': 0.65 * multiplier,
            'beta_af7': 1.15 * multiplier,
            'gamma_af7': 0.14 * multiplier,
            'delta_af8': 0.48 * multiplier,
            'theta_af8': 0.82 * multiplier,
            'alpha_af8': 0.62 * multiplier,
            'beta_af8': 1.18 * multiplier,
            'gamma_af8': 0.16 * multiplier,
            'delta_tp10': 0.52 * multiplier,
            'theta_tp10': 0.79 * multiplier,
            'alpha_tp10': 0.63 * multiplier,
            'beta_tp10': 1.22 * multiplier,
            'gamma_tp10': 0.15 * multiplier,
        }

    def _generate_sleep_record(self, sleep_date: date, day_offset: int, 
                              improvement: bool) -> Dict:
        """Generate realistic sleep record."""
        base_score = np.random.normal(75, 8)
        
        if improvement:
            trend = (day_offset / 28) * 10
            base_score += trend

        base_score = np.clip(base_score, 40, 98)

        # Generate sleep metrics
        total_sleep_min = np.random.normal(450, 30)  # ~7.5 hours
        deep_sleep_pct = np.random.normal(21, 3)
        rem_sleep_pct = np.random.normal(19, 3)
        core_sleep_pct = 100 - deep_sleep_pct - rem_sleep_pct - np.random.uniform(8, 12)
        efficiency = np.random.normal(88, 5)

        deep_sleep_min = (deep_sleep_pct / 100) * total_sleep_min
        rem_sleep_min = (rem_sleep_pct / 100) * total_sleep_min
        core_sleep_min = (core_sleep_pct / 100) * total_sleep_min
        awake_min = total_sleep_min * (1 - efficiency/100)

        sleep_data = {
            'deep_sleep_pct': deep_sleep_pct,
            'rem_sleep_pct': rem_sleep_pct,
            'efficiency': efficiency,
            'total_sleep_min': total_sleep_min
        }

        result = self.sleep_calc.calculate_sleep_score(sleep_data)

        return {
            'date': sleep_date,
            'sleep_score': result['sleep_score'],
            'total_sleep_min': round(total_sleep_min, 1),
            'deep_sleep_min': round(deep_sleep_min, 1),
            'deep_sleep_pct': round(deep_sleep_pct, 1),
            'rem_sleep_min': round(rem_sleep_min, 1),
            'rem_sleep_pct': round(rem_sleep_pct, 1),
            'core_sleep_min': round(core_sleep_min, 1),
            'efficiency': round(efficiency, 1),
            'awake_min': round(awake_min, 1),
            'components': result['components']
        }
