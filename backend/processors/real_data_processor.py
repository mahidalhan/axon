"""
Process real Muse EEG data to generate LRI, DNOS, and Brain Score metrics.
"""

import numpy as np
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional
import logging

from data.loader import MuseDataLoader
from data.preprocessor import EEGPreprocessor
from scores.lri_calculator import LRICalculator
from scores.sleep_calculator import SleepConsolidationCalculator
from scores.dnos_calculator import DNOSCalculator
from scores.brain_score_calculator import BrainScoreCalculator

logger = logging.getLogger(__name__)


class RealDataProcessor:
    """Process real Muse EEG data through the full pipeline."""

    def __init__(self, dataset_path: str = "Muse EEG Subconscious Decisions Dataset"):
        """
        Initialize processor with dataset path.

        Args:
            dataset_path: Path to Muse EEG dataset
        """
        self.loader = MuseDataLoader(dataset_path)
        self.preprocessor = EEGPreprocessor(sampling_rate=256.0)
        self.lri_calc = LRICalculator()
        self.sleep_calc = SleepConsolidationCalculator()
        self.dnos_calc = DNOSCalculator()
        self.brain_score_calc = BrainScoreCalculator()

    def process_participant_sample(self,
                                   participant_id: int,
                                   max_hours: float = 24.0,
                                   window_seconds: int = 30) -> Dict:
        """
        Process a sample of participant data to generate all metrics.

        Args:
            participant_id: Participant ID (0-19)
            max_hours: Maximum hours of data to process
            window_seconds: Window size for LRI calculation

        Returns:
            Dictionary with all calculated metrics
        """
        logger.info(f"Processing participant {participant_id} (max {max_hours} hours)")

        # Load participant data
        # Limit to reasonable number of rows for demo
        max_rows = int(max_hours * 3600 * 256)  # hours * seconds * sampling_rate
        df = self.loader.load_participant(
            participant_id,
            quality_filter=True,
            max_rows=max_rows
        )

        if len(df) == 0:
            raise ValueError(f"No valid data for participant {participant_id}")

        logger.info(f"Loaded {len(df)} samples ({len(df)/256/3600:.1f} hours)")

        # Create windows for LRI calculation
        windows = self.preprocessor.create_windows(
            df,
            window_seconds=window_seconds,
            overlap=0.5
        )

        if len(windows) == 0:
            raise ValueError("No valid windows created from data")

        logger.info(f"Created {len(windows)} windows for LRI calculation")

        # Calculate LRI for each window
        lri_samples = []
        for i, window in enumerate(windows):
            try:
                # Extract band power from window
                band_power = self._extract_band_power(window)

                # Add timestamp from window
                timestamp = window['TimeStamp'].iloc[0] if 'TimeStamp' in window.columns else datetime.now()

                # Calculate LRI
                lri_result = self.lri_calc.calculate_lri(band_power)

                # Add timestamp to result
                lri_result['timestamp'] = timestamp

                lri_samples.append(lri_result)

                if i % 100 == 0:
                    logger.debug(f"Processed window {i}/{len(windows)}: LRI={lri_result['lri']:.1f}")

            except Exception as e:
                logger.warning(f"Failed to calculate LRI for window {i}: {e}")
                continue

        logger.info(f"Calculated LRI for {len(lri_samples)} windows")

        if len(lri_samples) == 0:
            raise ValueError("No valid LRI samples calculated")

        # Group by date for daily metrics
        lri_by_date = self._group_lri_by_date(lri_samples)

        # Generate synthetic sleep scores (since we don't have real sleep data)
        sleep_scores = self._generate_synthetic_sleep(lri_by_date.keys())

        # Calculate DNOS for each day
        dnos_scores = []
        for day_date, day_lri_samples in lri_by_date.items():
            # Assume exercise at 7:30 AM on 75% of days
            has_exercise = np.random.random() < 0.75
            exercise_time = datetime.combine(day_date, datetime.min.time()).replace(
                hour=7, minute=30
            ) if has_exercise else None

            # Get sleep score for this day
            sleep_score = sleep_scores.get(day_date, 75.0)

            # Calculate DNOS
            try:
                dnos = self.dnos_calc.calculate_dnos(
                    day_lri_samples,
                    sleep_score,
                    exercise_time
                )

                if dnos:
                    dnos['date'] = day_date
                    dnos_scores.append(dnos)

            except Exception as e:
                logger.warning(f"Failed to calculate DNOS for {day_date}: {e}")
                continue

        logger.info(f"Calculated DNOS for {len(dnos_scores)} days")

        # Calculate Brain Score if we have enough days
        brain_score = None
        if len(dnos_scores) >= 7:  # At least a week of data
            try:
                sleep_records = [
                    {'date': d, 'sleep_score': sleep_scores.get(d, 75.0)}
                    for d in lri_by_date.keys()
                ]

                brain_score = self.brain_score_calc.calculate_brain_score(
                    dnos_scores,
                    lri_samples,
                    sleep_records
                )

                brain_score['period_start'] = min(lri_by_date.keys())
                brain_score['period_end'] = max(lri_by_date.keys())

                logger.info(f"Calculated Brain Score: {brain_score['brain_score']:.1f}")

            except Exception as e:
                logger.warning(f"Failed to calculate Brain Score: {e}")

        return {
            'participant_id': participant_id,
            'lri_samples': lri_samples,
            'dnos_scores': dnos_scores,
            'sleep_scores': sleep_scores,
            'brain_score': brain_score,
            'summary': {
                'total_samples': len(lri_samples),
                'days_processed': len(lri_by_date),
                'avg_lri': np.mean([s['lri'] for s in lri_samples]),
                'avg_dnos': np.mean([d['dnos'] for d in dnos_scores]) if dnos_scores else None,
                'data_duration_hours': len(df) / 256 / 3600
            }
        }

    def _extract_band_power(self, window) -> Dict[str, float]:
        """
        Extract average band power from window DataFrame.

        Converts DataFrame columns to lowercase dict keys expected by LRI calculator.
        """
        import pandas as pd

        band_power = {}

        # Map DataFrame columns to lowercase keys
        for band in ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma']:
            for electrode in ['TP9', 'AF7', 'AF8', 'TP10']:
                col_name = f'{band}_{electrode}'
                key_name = f'{band.lower()}_{electrode.lower()}'

                if col_name in window.columns:
                    band_power[key_name] = float(window[col_name].mean())
                else:
                    band_power[key_name] = 0.0

        return band_power

    def _group_lri_by_date(self, lri_samples: List[Dict]) -> Dict[date, List[Dict]]:
        """Group LRI samples by date."""
        lri_by_date = {}

        for sample in lri_samples:
            day = sample['timestamp'].date()
            if day not in lri_by_date:
                lri_by_date[day] = []
            lri_by_date[day].append(sample)

        return lri_by_date

    def _generate_synthetic_sleep(self, dates: List[date]) -> Dict[date, float]:
        """
        Generate synthetic sleep scores for dates.

        TODO: Replace with real Apple Health sleep data parser.
        """
        sleep_scores = {}

        for day in dates:
            # Realistic sleep score distribution (mean=75, std=10)
            score = np.clip(np.random.normal(75, 10), 0, 100)
            sleep_scores[day] = round(score, 1)

        return sleep_scores

    def process_multi_participant_journey(self,
                                         participant_ids: List[int],
                                         hours_per_participant: float = 12.0) -> Dict:
        """
        Create a multi-day journey by stitching together multiple participants.

        Each participant provides ~12 hours of data, creating a realistic 28-day journey.

        Args:
            participant_ids: List of participant IDs to process
            hours_per_participant: Hours to sample from each participant

        Returns:
            Combined journey data
        """
        logger.info(f"Creating multi-participant journey from {len(participant_ids)} participants")

        all_lri_samples = []
        all_dnos_scores = []
        all_sleep_scores = {}

        start_date = datetime.now() - timedelta(days=len(participant_ids) - 1)

        for day_offset, participant_id in enumerate(participant_ids):
            try:
                # Process participant
                result = self.process_participant_sample(
                    participant_id,
                    max_hours=hours_per_participant,
                    window_seconds=30
                )

                # Shift timestamps to current day
                current_date = start_date + timedelta(days=day_offset)

                for sample in result['lri_samples']:
                    # Preserve time of day but change date
                    original_time = sample['timestamp'].time()
                    new_timestamp = datetime.combine(current_date.date(), original_time)
                    sample['timestamp'] = new_timestamp
                    all_lri_samples.append(sample)

                # Add DNOS for this day
                if result['dnos_scores']:
                    dnos = result['dnos_scores'][0]  # Take first day
                    dnos['date'] = current_date.date()
                    all_dnos_scores.append(dnos)

                # Add sleep score
                all_sleep_scores[current_date.date()] = list(result['sleep_scores'].values())[0]

                logger.info(f"Day {day_offset + 1}: Processed participant {participant_id}")

            except Exception as e:
                logger.error(f"Failed to process participant {participant_id}: {e}")
                continue

        # Calculate Brain Score
        brain_score = None
        if len(all_dnos_scores) >= 7:
            sleep_records = [
                {'date': d, 'sleep_score': s}
                for d, s in all_sleep_scores.items()
            ]

            brain_score = self.brain_score_calc.calculate_brain_score(
                all_dnos_scores,
                all_lri_samples,
                sleep_records
            )

            brain_score['period_start'] = start_date.date()
            brain_score['period_end'] = (start_date + timedelta(days=len(participant_ids) - 1)).date()

        return {
            'lri_samples': all_lri_samples,
            'dnos_scores': all_dnos_scores,
            'sleep_scores': all_sleep_scores,
            'brain_score': brain_score,
            'summary': {
                'participants_used': participant_ids,
                'total_days': len(participant_ids),
                'total_lri_samples': len(all_lri_samples),
                'avg_lri': np.mean([s['lri'] for s in all_lri_samples]),
                'avg_dnos': np.mean([d['dnos'] for d in all_dnos_scores]) if all_dnos_scores else None
            }
        }
