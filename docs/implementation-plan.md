# Brain Score Implementation Plan
**Hackathon Edition: Data Pipeline + Mobile App**

**Version:** 1.0
**Date:** January 8, 2025
**Timeline:** 2-3 Days
**Scope:** Backend data processing → JSON outputs → Emergent.sh mobile UI

---

## Executive Summary

Build a complete neuroplasticity data pipeline that processes Muse EEG data and Apple Health sleep data to generate JSON metrics for a Whoop-inspired mobile app. **No frontend code** - pure data processing and algorithm implementation.

### Deliverables
1. **Python data pipeline**: Muse EEG → LRI/DNOS/Brain Score calculations
2. **JSON API outputs**: Structured data files for mobile app consumption
3. **28-day demo dataset**: Realistic user journey with all metrics
4. **Emergent.sh prompt**: Complete specification for Whoop-inspired UI

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  INPUT LAYER                                             │
│  ├─ Muse EEG Dataset (20 participants, 4.4GB)          │
│  │  └─ Band power: Delta, Theta, Alpha, Beta, Gamma    │
│  ├─ Apple Health Sleep Export (XML)                    │
│  │  └─ Sleep stages: Deep, REM, Core, Awake            │
│  └─ Exercise Events (manual timestamps)                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PROCESSING LAYER (Python Scripts)                      │
│  ├─ Data Loader & Preprocessor                         │
│  ├─ Feature Extraction (band power → scores)           │
│  ├─ LRI Calculator (Alertness + Focus + Arousal)       │
│  ├─ Sleep Consolidation Analyzer                       │
│  ├─ DNOS Calculator (daily integration)                │
│  └─ Brain Score Calculator (28-day rolling)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  OUTPUT LAYER (JSON Files)                              │
│  ├─ lri_realtime.json        (30s intervals)           │
│  ├─ dnos_daily.json          (daily summaries)         │
│  ├─ brain_score_28day.json   (rolling metric)          │
│  ├─ sleep_reports.json       (nightly analysis)        │
│  └─ insights.json            (mechanism explanations)   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  MOBILE APP (Built on Emergent.sh)                      │
│  └─ Whoop-inspired UI consuming JSON data              │
└─────────────────────────────────────────────────────────┘
```

---

## Day 1: Foundation & LRI Algorithm

### 1.1 Project Setup (30 minutes)

**Initialize repository:**
```bash
cd /Users/mahidalhan/code/brain_score
git init
git add .
git commit -m "Initial commit: Documentation and dataset"
```

**Create Python environment:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Create requirements.txt:**
```
pandas>=2.0.0
numpy>=1.24.0
scipy>=1.10.0
matplotlib>=3.7.0
seaborn>=0.12.0
scikit-learn>=1.3.0
mne>=1.4.0
plotly>=5.14.0
```

**Directory structure:**
```
brain_score/
├── src/
│   ├── __init__.py
│   ├── data/
│   │   ├── __init__.py
│   │   ├── loader.py           # Load Muse CSV files
│   │   ├── apple_health.py     # Parse Apple Health XML
│   │   └── preprocessor.py     # Clean & normalize data
│   ├── features/
│   │   ├── __init__.py
│   │   └── band_power.py       # Extract/validate band power
│   ├── scores/
│   │   ├── __init__.py
│   │   ├── lri.py              # Learning Readiness Index
│   │   ├── sleep.py            # Sleep Consolidation Score
│   │   ├── dnos.py             # Daily Neuroplasticity Score
│   │   └── brain_score.py      # 28-day Brain Score
│   └── api/
│       ├── __init__.py
│       └── formatters.py       # JSON output formatters
├── outputs/
│   ├── metrics/                # JSON files for mobile app
│   └── validation/             # Debug plots (optional)
├── data/                       # Symlink to dataset
├── demo.py                     # End-to-end pipeline demo
├── requirements.txt
└── README.md
```

### 1.2 Data Loading Pipeline (2 hours)

**`src/data/loader.py`:**
```python
"""
Load and validate Muse EEG data from CSV files.
Handles 20 participants with pre-computed band power.
"""

import pandas as pd
from pathlib import Path
from typing import Dict, List

class MuseDataLoader:
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.muse_path = self.dataset_path / "Muse"
        self.local_path = self.dataset_path / "Local"

    def load_participant(self, participant_id: int) -> pd.DataFrame:
        """Load EEG data for one participant."""
        file_path = self.muse_path / f"museData{participant_id}.csv"
        df = pd.read_csv(file_path)

        # Validate required columns
        required = ['TimeStamp', 'Delta_TP9', 'Theta_TP9', 'Alpha_TP9',
                   'Beta_TP9', 'Gamma_TP9', 'Delta_AF7', 'Theta_AF7',
                   'Alpha_AF7', 'Beta_AF7', 'Gamma_AF7']

        assert all(col in df.columns for col in required), \
               f"Missing columns in participant {participant_id}"

        # Parse timestamps
        df['TimeStamp'] = pd.to_datetime(df['TimeStamp'])

        return df

    def load_all_participants(self) -> Dict[int, pd.DataFrame]:
        """Load all 20 participants."""
        participants = {}
        for i in range(20):
            try:
                participants[i] = self.load_participant(i)
                print(f"✓ Loaded participant {i}: {len(participants[i])} samples")
            except Exception as e:
                print(f"✗ Failed to load participant {i}: {e}")
        return participants

    def validate_quality(self, df: pd.DataFrame, threshold: float = 2.0) -> pd.DataFrame:
        """Filter samples with poor signal quality (HSI > threshold)."""
        quality_cols = ['HSI_TP9', 'HSI_AF7', 'HSI_AF8', 'HSI_TP10']

        # HSI closer to 1 = better quality
        # Remove samples where any electrode HSI > threshold
        mask = (df[quality_cols] < threshold).all(axis=1)

        clean_df = df[mask].copy()
        print(f"Quality filter: {len(df)} → {len(clean_df)} samples "
              f"({100*len(clean_df)/len(df):.1f}% retained)")

        return clean_df
```

**`src/data/apple_health.py`:**
```python
"""
Parse Apple Health sleep data from exported XML.
Extract sleep stages (deep, REM, core, awake) and duration.
"""

import xml.etree.ElementTree as ET
import pandas as pd
from datetime import datetime
from typing import List, Dict

class AppleHealthParser:
    def __init__(self, export_path: str):
        self.export_path = export_path

    def parse_sleep_analysis(self) -> pd.DataFrame:
        """Extract sleep analysis records from Apple Health export."""
        tree = ET.parse(self.export_path)
        root = tree.getroot()

        sleep_records = []

        for record in root.findall('.//Record[@type="HKCategoryTypeIdentifierSleepAnalysis"]'):
            start = datetime.fromisoformat(record.get('startDate').replace('Z', '+00:00'))
            end = datetime.fromisoformat(record.get('endDate').replace('Z', '+00:00'))
            value = record.get('value')

            # Map Apple Health sleep values to stages
            stage_mapping = {
                'HKCategoryValueSleepAnalysisAsleepDeep': 'deep',
                'HKCategoryValueSleepAnalysisAsleepREM': 'rem',
                'HKCategoryValueSleepAnalysisAsleepCore': 'core',
                'HKCategoryValueSleepAnalysisAwake': 'awake',
                'HKCategoryValueSleepAnalysisInBed': 'in_bed'
            }

            stage = stage_mapping.get(value, 'unknown')
            duration_min = (end - start).total_seconds() / 60

            sleep_records.append({
                'date': start.date(),
                'start_time': start,
                'end_time': end,
                'stage': stage,
                'duration_minutes': duration_min
            })

        df = pd.DataFrame(sleep_records)
        return df

    def get_nightly_summary(self, date: datetime.date) -> Dict:
        """Get sleep summary for a specific night."""
        df = self.parse_sleep_analysis()
        night_data = df[df['date'] == date]

        if len(night_data) == 0:
            return None

        summary = {
            'date': date,
            'total_sleep_min': night_data[night_data['stage'] != 'awake']['duration_minutes'].sum(),
            'deep_sleep_min': night_data[night_data['stage'] == 'deep']['duration_minutes'].sum(),
            'rem_sleep_min': night_data[night_data['stage'] == 'rem']['duration_minutes'].sum(),
            'core_sleep_min': night_data[night_data['stage'] == 'core']['duration_minutes'].sum(),
            'awake_min': night_data[night_data['stage'] == 'awake']['duration_minutes'].sum(),
            'time_in_bed_min': night_data['duration_minutes'].sum()
        }

        # Calculate percentages
        if summary['total_sleep_min'] > 0:
            summary['deep_sleep_pct'] = 100 * summary['deep_sleep_min'] / summary['total_sleep_min']
            summary['rem_sleep_pct'] = 100 * summary['rem_sleep_min'] / summary['total_sleep_min']
            summary['efficiency'] = 100 * summary['total_sleep_min'] / summary['time_in_bed_min']

        return summary
```

**`src/data/preprocessor.py`:**
```python
"""
Preprocess EEG data: artifact rejection, normalization, windowing.
"""

import numpy as np
import pandas as pd
from scipy import signal

class EEGPreprocessor:
    def __init__(self, sampling_rate: float = 256.0):
        self.sampling_rate = sampling_rate

    def remove_artifacts(self, df: pd.DataFrame,
                        amplitude_threshold: float = 100.0) -> pd.DataFrame:
        """Remove samples with amplitude spikes (muscle artifacts, eye blinks)."""
        raw_cols = ['RAW_TP9', 'RAW_AF7', 'RAW_AF8', 'RAW_TP10']

        # Remove extreme amplitudes
        mask = (df[raw_cols].abs() < amplitude_threshold).all(axis=1)

        return df[mask].copy()

    def normalize_band_power(self, df: pd.DataFrame,
                            baseline_window: int = 1000) -> pd.DataFrame:
        """Z-score normalize band power against rolling baseline."""
        band_cols = [col for col in df.columns if any(
            band in col for band in ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma']
        )]

        df_norm = df.copy()

        for col in band_cols:
            # Rolling mean and std
            rolling_mean = df[col].rolling(window=baseline_window, min_periods=1).mean()
            rolling_std = df[col].rolling(window=baseline_window, min_periods=1).std()

            # Z-score normalization
            df_norm[f"{col}_zscore"] = (df[col] - rolling_mean) / (rolling_std + 1e-6)

        return df_norm

    def create_windows(self, df: pd.DataFrame,
                      window_seconds: int = 30,
                      overlap: float = 0.5) -> List[pd.DataFrame]:
        """Create overlapping time windows for LRI calculation."""
        window_samples = int(window_seconds * self.sampling_rate)
        step_samples = int(window_samples * (1 - overlap))

        windows = []
        for i in range(0, len(df) - window_samples, step_samples):
            window = df.iloc[i:i+window_samples].copy()
            windows.append(window)

        return windows
```

### 1.3 LRI Algorithm Implementation (4 hours)

**`src/scores/lri.py`:**
```python
"""
Learning Readiness Index (LRI) Calculator.
Combines Alertness + Focus + Arousal Balance → 0-100 score.
"""

import numpy as np
import pandas as pd
from typing import Dict

class LRICalculator:
    def __init__(self):
        self.optimal_beta_alpha_ratio = 1.5  # Empirically determined

    def calculate_alertness(self, window: pd.DataFrame) -> float:
        """
        Alertness Score (0-100) based on beta power and theta/beta ratio.
        High beta + low theta/beta ratio = high alertness.
        """
        # Average beta power across all electrodes
        beta_cols = ['Beta_TP9', 'Beta_AF7', 'Beta_AF8', 'Beta_TP10']
        theta_cols = ['Theta_TP9', 'Theta_AF7', 'Theta_AF8', 'Theta_TP10']
        alpha_cols = ['Alpha_TP9', 'Alpha_AF7', 'Alpha_AF8', 'Alpha_TP10']

        beta_avg = window[beta_cols].mean().mean()
        theta_avg = window[theta_cols].mean().mean()
        alpha_avg = window[alpha_cols].mean().mean()

        # Component 1: Beta power (normalized to 0-100)
        beta_score = self._normalize(beta_avg, min_val=0.1, max_val=2.0)

        # Component 2: Inverse theta/beta ratio (lower = more alert)
        theta_beta_ratio = theta_avg / (beta_avg + 1e-6)
        theta_beta_score = 100 - self._normalize(theta_beta_ratio, min_val=0.5, max_val=2.0)

        # Component 3: Alpha suppression (task vs rest comparison)
        # For real-time, use absolute alpha level (lower = more engaged)
        alpha_suppression_score = 100 - self._normalize(alpha_avg, min_val=0.2, max_val=1.5)

        # Weighted combination (from neuro-PRD.md)
        alertness = (0.4 * beta_score +
                    0.3 * theta_beta_score +
                    0.3 * alpha_suppression_score)

        return np.clip(alertness, 0, 100)

    def calculate_focus(self, window: pd.DataFrame) -> float:
        """
        Focus Score (0-100) based on frontal theta and alpha modulation.
        High frontal theta + sustained attention = high focus.
        """
        # Frontal electrodes for focus detection
        frontal_theta = window[['Theta_AF7', 'Theta_AF8']].mean().mean()
        frontal_alpha = window[['Alpha_AF7', 'Alpha_AF8']].mean().mean()
        frontal_gamma = window[['Gamma_AF7', 'Gamma_AF8']].mean().mean()

        # Component 1: Frontal theta power (working memory engagement)
        theta_score = self._normalize(frontal_theta, min_val=0.3, max_val=1.5)

        # Component 2: Alpha modulation (attention control)
        alpha_mod_score = self._normalize(frontal_alpha, min_val=0.2, max_val=1.2)

        # Component 3: Gamma bursts (cognitive processing)
        gamma_score = self._normalize(frontal_gamma, min_val=0.05, max_val=0.3)

        # Weighted combination
        focus = (0.5 * theta_score +
                0.3 * alpha_mod_score +
                0.2 * gamma_score)

        return np.clip(focus, 0, 100)

    def calculate_arousal_balance(self, window: pd.DataFrame) -> float:
        """
        Arousal Balance (0-100) using Yerkes-Dodson inverted-U function.
        Optimal zone: not too drowsy, not too anxious.
        """
        beta_cols = ['Beta_TP9', 'Beta_AF7', 'Beta_AF8', 'Beta_TP10']
        alpha_cols = ['Alpha_TP9', 'Alpha_AF7', 'Alpha_AF8', 'Alpha_TP10']

        beta_avg = window[beta_cols].mean().mean()
        alpha_avg = window[alpha_cols].mean().mean()

        beta_alpha_ratio = beta_avg / (alpha_avg + 1e-6)

        # Gaussian curve centered at optimal ratio
        deviation = abs(beta_alpha_ratio - self.optimal_beta_alpha_ratio)
        score = 100 * np.exp(-0.5 * (deviation / 0.5)**2)

        return np.clip(score, 0, 100)

    def calculate_lri(self, window: pd.DataFrame,
                     post_exercise_multiplier: float = 1.0) -> Dict:
        """
        Calculate Learning Readiness Index (LRI) for a time window.

        Returns:
            {
                'lri': float (0-100),
                'alertness': float (0-100),
                'focus': float (0-100),
                'arousal_balance': float (0-100),
                'timestamp': datetime
            }
        """
        alertness = self.calculate_alertness(window)
        focus = self.calculate_focus(window)
        arousal = self.calculate_arousal_balance(window)

        # Weighted LRI (from neuro-PRD.md)
        base_lri = (0.4 * alertness +
                   0.4 * focus +
                   0.2 * arousal)

        # Apply post-exercise multiplier
        lri = base_lri * post_exercise_multiplier

        return {
            'lri': np.clip(lri, 0, 100),
            'alertness': alertness,
            'focus': focus,
            'arousal_balance': arousal,
            'timestamp': window['TimeStamp'].iloc[0],
            'status': self._get_status(lri)
        }

    def _get_status(self, lri: float) -> str:
        """Classify LRI into status categories."""
        if lri >= 70:
            return 'optimal'
        elif lri >= 40:
            return 'moderate'
        else:
            return 'low'

    def _normalize(self, value: float, min_val: float, max_val: float) -> float:
        """Normalize value to 0-100 scale."""
        normalized = ((value - min_val) / (max_val - min_val)) * 100
        return np.clip(normalized, 0, 100)
```

### 1.4 Validation (2 hours)

**Quick validation script:**
```python
# test_lri.py
from src.data.loader import MuseDataLoader
from src.data.preprocessor import EEGPreprocessor
from src.scores.lri import LRICalculator

# Load sample participant
loader = MuseDataLoader("Muse EEG Subconscious Decisions Dataset")
df = loader.load_participant(0)
df_clean = loader.validate_quality(df)

# Preprocess
preprocessor = EEGPreprocessor()
windows = preprocessor.create_windows(df_clean, window_seconds=30)

# Calculate LRI for each window
calculator = LRICalculator()
lri_results = []

for window in windows[:10]:  # Test first 10 windows
    result = calculator.calculate_lri(window)
    lri_results.append(result)
    print(f"{result['timestamp']}: LRI={result['lri']:.1f} "
          f"(Alertness={result['alertness']:.1f}, "
          f"Focus={result['focus']:.1f}, "
          f"Status={result['status']})")
```

**Expected output:**
```
2023-XX-XX 10:15:30: LRI=72.3 (Alertness=68.5, Focus=78.2, Status=optimal)
2023-XX-XX 10:16:00: LRI=75.8 (Alertness=71.2, Focus=81.3, Status=optimal)
...
```

---

## Day 2: Sleep, DNOS & Brain Score

### 2.1 Sleep Consolidation Score (2 hours)

**`src/scores/sleep.py`:**
```python
"""
Sleep Consolidation Score Calculator.
Based on Apple Health sleep stages → 0-100 score.
"""

import pandas as pd
from typing import Dict
from datetime import date

class SleepConsolidationCalculator:
    def __init__(self):
        # Target ranges (from brain-score-spec.md)
        self.target_deep_pct = 22.0  # % of total sleep
        self.target_rem_pct = 20.0
        self.target_efficiency = 90.0

    def calculate_sleep_score(self, sleep_summary: Dict) -> Dict:
        """
        Calculate Sleep Consolidation Score (0-100).

        Input: sleep_summary from AppleHealthParser.get_nightly_summary()
        Output: {
            'sleep_score': float (0-100),
            'components': {...},
            'date': date
        }
        """
        if sleep_summary is None:
            return None

        # Component 1: Slow-Wave Sleep (Deep Sleep) Quality
        deep_pct = sleep_summary.get('deep_sleep_pct', 0)
        sws_score = self._score_deep_sleep(deep_pct)

        # Component 2: REM Percentage
        rem_pct = sleep_summary.get('rem_sleep_pct', 0)
        rem_score = self._score_rem(rem_pct)

        # Component 3: Sleep Efficiency
        efficiency = sleep_summary.get('efficiency', 0)
        efficiency_score = self._score_efficiency(efficiency)

        # Component 4: Total Sleep Duration
        total_min = sleep_summary.get('total_sleep_min', 0)
        duration_score = self._score_duration(total_min)

        # Weighted consolidation score (from neuro-PRD.md)
        sleep_score = (0.4 * sws_score +
                      0.3 * rem_score +
                      0.2 * efficiency_score +
                      0.1 * duration_score)

        return {
            'date': sleep_summary['date'],
            'sleep_score': round(sleep_score, 1),
            'components': {
                'sws_quality': round(sws_score, 1),
                'rem_quality': round(rem_score, 1),
                'efficiency': round(efficiency_score, 1),
                'duration': round(duration_score, 1)
            },
            'metrics': {
                'deep_sleep_pct': round(deep_pct, 1),
                'deep_sleep_min': sleep_summary.get('deep_sleep_min', 0),
                'rem_pct': round(rem_pct, 1),
                'rem_min': sleep_summary.get('rem_sleep_min', 0),
                'efficiency_pct': round(efficiency, 1),
                'total_sleep_min': total_min
            }
        }

    def _score_deep_sleep(self, deep_pct: float) -> float:
        """Score deep sleep percentage (optimal: 20-25%)."""
        if deep_pct >= 20 and deep_pct <= 25:
            return 100
        elif deep_pct >= 15:
            return 70 + (deep_pct - 15) * 6  # Linear scaling
        elif deep_pct >= 10:
            return 40 + (deep_pct - 10) * 6
        else:
            return deep_pct * 4  # Below 10% is poor

    def _score_rem(self, rem_pct: float) -> float:
        """Score REM percentage (optimal: 18-25%)."""
        if rem_pct >= 18 and rem_pct <= 25:
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
        if total_min >= 420 and total_min <= 540:
            return 100
        elif total_min >= 360:
            return 60 + (total_min - 360) * 0.67
        elif total_min >= 540:
            return 100 - (total_min - 540) * 0.5  # Penalize oversleeping
        else:
            return total_min * 0.17
```

### 2.2 DNOS Implementation (3 hours)

**`src/scores/dnos.py`:**
```python
"""
Daily Neuroplasticity Opportunity Score (DNOS).
Integrates LRI, optimal window utilization, and sleep consolidation.
"""

import numpy as np
import pandas as pd
from typing import List, Dict
from datetime import date, datetime, timedelta

class DNOSCalculator:
    def __init__(self):
        self.optimal_window_hours = 3  # 1-4h post-exercise = 3h window

    def calculate_dnos(self,
                      lri_samples: List[Dict],
                      sleep_score: float,
                      exercise_time: datetime = None) -> Dict:
        """
        Calculate Daily Neuroplasticity Opportunity Score.

        Args:
            lri_samples: List of LRI calculations throughout the day
            sleep_score: Previous night's sleep consolidation score
            exercise_time: Timestamp of morning exercise (if any)

        Returns:
            {
                'dnos': float (0-100),
                'date': date,
                'components': {...}
            }
        """
        if len(lri_samples) == 0:
            return None

        # Component 1: Average LRI during active learning hours
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
            window_util = 0  # No exercise = no optimal window

        # Component 3: Previous night sleep consolidation
        sleep_component = sleep_score if sleep_score else 50

        # Weighted DNOS (from neuro-PRD.md)
        dnos = (0.50 * avg_lri +
                0.30 * window_util +
                0.20 * sleep_component)

        return {
            'dnos': round(dnos, 1),
            'date': lri_samples[0]['timestamp'].date(),
            'components': {
                'avg_lri': round(avg_lri, 1),
                'optimal_window_utilization': round(window_util, 1),
                'sleep_consolidation': round(sleep_component, 1)
            },
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

        # Samples within optimal window
        window_samples = [
            s for s in lri_samples
            if window_start <= s['timestamp'] <= window_end
        ]

        if len(window_samples) == 0:
            return 0

        # % of window samples with LRI >= 60 (engaged learning)
        high_lri_count = sum(1 for s in window_samples if s['lri'] >= 60)
        utilization_pct = 100 * high_lri_count / len(window_samples)

        return utilization_pct

    def _generate_insights(self, avg_lri: float,
                          window_util: float,
                          sleep_score: float) -> List[str]:
        """Generate human-readable insights about the day."""
        insights = []

        if avg_lri >= 70:
            insights.append("Strong learning readiness maintained throughout day")
        elif avg_lri < 50:
            insights.append("Low baseline alertness detected - consider earlier sleep or exercise")

        if window_util >= 60:
            insights.append(f"Excellent post-exercise window capture ({window_util:.0f}%)")
        elif window_util > 0:
            insights.append(f"Missed opportunities in post-exercise window ({window_util:.0f}% utilized)")

        if sleep_score >= 80:
            insights.append("Previous night's sleep quality supports consolidation")
        elif sleep_score < 60:
            insights.append("Poor sleep quality may limit neuroplasticity outcomes")

        return insights
```

### 2.3 Brain Score (28-day) Implementation (4 hours)

**`src/scores/brain_score.py`:**
```python
"""
Brain Score: 28-day rolling neuroplasticity health metric.
Combines cycle completion, baseline capacity, efficiency trend, and vagus health.
"""

import numpy as np
import pandas as pd
from typing import List, Dict
from datetime import date, timedelta
from scipy.stats import linregress

class BrainScoreCalculator:
    def __init__(self):
        self.window_days = 28

    def calculate_brain_score(self,
                             dnos_history: List[Dict],
                             lri_history: List[Dict],
                             sleep_history: List[Dict]) -> Dict:
        """
        Calculate 28-day Brain Score.

        Args:
            dnos_history: 28 days of DNOS scores
            lri_history: 28 days of LRI samples
            sleep_history: 28 days of sleep scores

        Returns:
            Complete Brain Score breakdown with components
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
            'period_start': dnos_history[0]['date'],
            'period_end': dnos_history[-1]['date'],
            'components': {
                'cycle_completion': cycle_completion,
                'baseline_capacity': baseline_capacity,
                'efficiency_trend': efficiency_trend,
                'vagus_health': vagus_health
            },
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
        Count complete neuroplasticity cycles (trigger + signal + consolidation).

        Complete cycle = LRI >= 70 for >= 60 min + learning session + sleep >= 70
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
            ) * 0.5  # Assuming 30s intervals = 0.5 min each

            trigger_met = high_lri_minutes >= 60

            # Check consolidation: Sleep score >= 70
            day_sleep = next(
                (s for s in sleep_history if s['date'] == day_date),
                None
            )
            consolidation_met = day_sleep and day_sleep['sleep_score'] >= 70

            # Signal assumed if DNOS components indicate learning activity
            signal_met = day_dnos['components']['avg_lri'] >= 60

            if trigger_met and signal_met and consolidation_met:
                complete_cycles += 1

        # Score: (complete_cycles / 28) * 100
        score = (complete_cycles / self.window_days) * 100

        return {
            'score': round(score, 1),
            'complete_cycles': complete_cycles,
            'total_days': self.window_days,
            'completion_rate': f"{complete_cycles}/{self.window_days}"
        }

    def _calculate_baseline_capacity(self, lri_history: List[Dict]) -> Dict:
        """
        Measure resting-state brain health and readiness for neuroplasticity.
        Based on morning LRI baseline (first hour after waking).
        """
        morning_lri_scores = []

        # Extract morning LRI (assume 7-9 AM)
        for sample in lri_history:
            if sample['timestamp'].hour in [7, 8]:
                morning_lri_scores.append(sample['lri'])

        if len(morning_lri_scores) == 0:
            return {'score': 50, 'morning_lri_avg': 50}

        avg_morning_lri = np.mean(morning_lri_scores)

        # Higher baseline = better foundational readiness
        # Normalize to 0-100 (assume 40-80 range for morning LRI)
        score = np.clip((avg_morning_lri - 40) * 2.5, 0, 100)

        return {
            'score': round(score, 1),
            'morning_lri_avg': round(avg_morning_lri, 1),
            'samples': len(morning_lri_scores)
        }

    def _calculate_efficiency_trend(self, dnos_history: List[Dict]) -> Dict:
        """
        Measure whether neuroplasticity is improving (meta-plasticity).
        Compare weeks 1-2 vs weeks 3-4.
        """
        if len(dnos_history) < 28:
            return {'score': 50, 'trend': 'insufficient_data'}

        week_1_2 = dnos_history[0:14]
        week_3_4 = dnos_history[14:28]

        avg_early = np.mean([d['dnos'] for d in week_1_2])
        avg_recent = np.mean([d['dnos'] for d in week_3_4])

        percent_change = (avg_recent - avg_early) / avg_early

        # Score: 50 + (30 × improvement) - (30 × decline)
        score = 50 + (30 * percent_change)
        score = np.clip(score, 0, 100)

        return {
            'score': round(score, 1),
            'week_1_2_avg': round(avg_early, 1),
            'week_3_4_avg': round(avg_recent, 1),
            'improvement_pct': round(percent_change * 100, 1),
            'trend': 'improving' if percent_change > 0 else 'declining'
        }

    def _calculate_vagus_health(self, lri_history: List[Dict]) -> Dict:
        """
        Measure effectiveness of vagus → NTS → LC/NB pathway.
        Simulated based on exercise frequency and LRI response.
        """
        # For MVP: Use exercise frequency as proxy
        # In production: Measure actual LRI boost post-exercise

        # Assume exercise on days with morning LRI spikes
        exercise_days = set()

        # Group by date
        lri_by_date = {}
        for sample in lri_history:
            day = sample['timestamp'].date()
            if day not in lri_by_date:
                lri_by_date[day] = []
            lri_by_date[day].append(sample)

        # Detect exercise days (morning LRI spike > afternoon)
        for day, samples in lri_by_date.items():
            morning_samples = [s for s in samples if s['timestamp'].hour in [7, 8, 9]]
            afternoon_samples = [s for s in samples if s['timestamp'].hour in [14, 15, 16]]

            if morning_samples and afternoon_samples:
                morning_avg = np.mean([s['lri'] for s in morning_samples])
                afternoon_avg = np.mean([s['lri'] for s in afternoon_samples])

                if afternoon_avg > morning_avg + 15:  # 15-point boost
                    exercise_days.add(day)

        exercise_frequency = len(exercise_days)

        # Score: (days_with_exercise / 28) * 100
        # Optimal: 20-24 days (5-6 days/week)
        score = (exercise_frequency / 22) * 100  # Target 22 days
        score = np.clip(score, 0, 100)

        return {
            'score': round(score, 1),
            'exercise_days': exercise_frequency,
            'exercise_frequency_pct': round((exercise_frequency / 28) * 100, 1)
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

        if efficiency['trend'] == 'declining':
            recs.append("Efficiency declining - review sleep quality and stress management")

        if vagus['score'] < 60:
            recs.append("Add regular exercise (5-6 days/week) to activate vagus nerve pathway")

        if len(recs) == 0:
            recs.append("Excellent performance - maintain current protocols")

        return recs
```

### 2.4 Synthetic 28-Day Dataset Generation (2 hours)

**`src/data/synthetic_journey.py`:**
```python
"""
Generate realistic 28-day user journey from 20 participant snapshots.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict

class SyntheticJourneyGenerator:
    def __init__(self, participants_data: List[pd.DataFrame]):
        self.participants_data = participants_data

    def generate_28_day_journey(self,
                               start_date: datetime,
                               improvement_trend: bool = True) -> Dict:
        """
        Generate synthetic 28-day user journey.

        Uses real participant data as daily snapshots, adds temporal trends.
        """
        journey = {
            'lri_samples': [],
            'dnos_scores': [],
            'sleep_scores': []
        }

        for day_offset in range(28):
            current_date = start_date + timedelta(days=day_offset)

            # Use different participant each day (cycling)
            participant_idx = day_offset % 20
            day_data = self.participants_data[participant_idx]

            # Add improvement trend (gradual increase in baseline)
            if improvement_trend:
                trend_multiplier = 1.0 + (day_offset / 28) * 0.15  # 15% improvement
            else:
                trend_multiplier = 1.0

            # Simulate exercise on 75% of days (morning routine)
            has_exercise = np.random.random() < 0.75
            exercise_time = current_date.replace(hour=7, minute=30) if has_exercise else None

            # Generate LRI samples for the day (simplified)
            # In reality, would process full participant data
            day_lri_samples = self._generate_day_lri(
                current_date, day_data, trend_multiplier, exercise_time
            )

            journey['lri_samples'].extend(day_lri_samples)

            # Generate sleep score (realistic distribution)
            sleep_score = self._generate_sleep_score(day_offset, improvement_trend)
            journey['sleep_scores'].append({
                'date': current_date.date(),
                'sleep_score': sleep_score
            })

        return journey

    def _generate_day_lri(self, date: datetime, participant_data: pd.DataFrame,
                         multiplier: float, exercise_time: datetime) -> List[Dict]:
        """Generate LRI samples for one day."""
        # Simplified: use participant's average band power
        # In production: process full timeseries

        samples = []

        # Morning samples (7-9 AM)
        for hour in [7, 8]:
            samples.append({
                'timestamp': date.replace(hour=hour, minute=30),
                'lri': np.clip(60 * multiplier, 0, 100),
                'alertness': 58,
                'focus': 62,
                'arousal_balance': 65,
                'status': 'moderate'
            })

        # Post-exercise peak (if exercise occurred)
        if exercise_time:
            for hours_after in [1, 2, 3]:
                peak_time = exercise_time + timedelta(hours=hours_after)
                samples.append({
                    'timestamp': peak_time,
                    'lri': np.clip(75 * multiplier * 1.3, 0, 100),  # 1.3x multiplier
                    'alertness': 78,
                    'focus': 82,
                    'arousal_balance': 75,
                    'status': 'optimal'
                })

        # Afternoon samples (14-17)
        for hour in [14, 15, 16, 17]:
            samples.append({
                'timestamp': date.replace(hour=hour, minute=30),
                'lri': np.clip(65 * multiplier, 0, 100),
                'alertness': 62,
                'focus': 68,
                'arousal_balance': 70,
                'status': 'moderate'
            })

        return samples

    def _generate_sleep_score(self, day_offset: int, improvement: bool) -> float:
        """Generate realistic sleep score with optional trend."""
        base_score = np.random.normal(75, 10)  # Mean 75, std 10

        if improvement:
            trend = (day_offset / 28) * 10  # +10 points over 28 days
            base_score += trend

        return np.clip(base_score, 0, 100)
```

---

## Day 3: JSON API & Demo

### 3.1 JSON Output Formatters (3 hours)

**`src/api/formatters.py`:**
```python
"""
Format calculated metrics as JSON for mobile app consumption.
"""

import json
from datetime import datetime, date
from typing import Dict, List
import numpy as np

class JSONFormatter:
    @staticmethod
    def _serialize_datetime(obj):
        """JSON serializer for datetime objects."""
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        raise TypeError(f"Type {type(obj)} not serializable")

    @staticmethod
    def format_realtime_lri(lri_result: Dict) -> Dict:
        """
        Format real-time LRI for mobile app.

        Output structure:
        {
            "lri": 84,
            "timestamp": "2025-01-15T14:30:00",
            "components": {...},
            "status": "optimal",
            "post_exercise_window": true,
            "window_remaining_minutes": 135
        }
        """
        return {
            "lri": round(lri_result['lri'], 1),
            "timestamp": lri_result['timestamp'].isoformat(),
            "components": {
                "alertness": round(lri_result['alertness'], 1),
                "focus": round(lri_result['focus'], 1),
                "arousal_balance": round(lri_result['arousal_balance'], 1)
            },
            "status": lri_result['status'],
            "post_exercise_window": lri_result.get('post_exercise_window', False),
            "window_remaining_minutes": lri_result.get('window_remaining_minutes', 0)
        }

    @staticmethod
    def format_daily_summary(dnos_result: Dict,
                            sleep_result: Dict,
                            trend_7day: List[float]) -> Dict:
        """
        Format daily summary (DNOS) for mobile app.
        """
        return {
            "date": dnos_result['date'].isoformat(),
            "dnos": round(dnos_result['dnos'], 1),
            "components": {
                "avg_lri": round(dnos_result['components']['avg_lri'], 1),
                "optimal_window_utilization": round(
                    dnos_result['components']['optimal_window_utilization'], 1
                ),
                "sleep_consolidation": round(
                    dnos_result['components']['sleep_consolidation'], 1
                )
            },
            "sleep_details": {
                "sleep_score": round(sleep_result['sleep_score'], 1),
                "deep_sleep_pct": round(sleep_result['metrics']['deep_sleep_pct'], 1),
                "rem_pct": round(sleep_result['metrics']['rem_pct'], 1),
                "efficiency": round(sleep_result['metrics']['efficiency_pct'], 1)
            },
            "trend_7day": [round(v, 1) for v in trend_7day],
            "insights": dnos_result['insights']
        }

    @staticmethod
    def format_brain_score(brain_score_result: Dict) -> Dict:
        """
        Format 28-day Brain Score for mobile app.
        """
        return {
            "brain_score": round(brain_score_result['brain_score'], 1),
            "period": {
                "start": brain_score_result['period_start'].isoformat(),
                "end": brain_score_result['period_end'].isoformat()
            },
            "interpretation": brain_score_result['interpretation'],
            "components": {
                "cycle_completion": {
                    "score": brain_score_result['components']['cycle_completion']['score'],
                    "complete_cycles": brain_score_result['components']['cycle_completion']['complete_cycles'],
                    "completion_rate": brain_score_result['components']['cycle_completion']['completion_rate']
                },
                "baseline_capacity": {
                    "score": brain_score_result['components']['baseline_capacity']['score'],
                    "morning_lri_avg": brain_score_result['components']['baseline_capacity']['morning_lri_avg']
                },
                "efficiency_trend": {
                    "score": brain_score_result['components']['efficiency_trend']['score'],
                    "improvement_pct": brain_score_result['components']['efficiency_trend']['improvement_pct'],
                    "trend": brain_score_result['components']['efficiency_trend']['trend']
                },
                "vagus_health": {
                    "score": brain_score_result['components']['vagus_health']['score'],
                    "exercise_days": brain_score_result['components']['vagus_health']['exercise_days']
                }
            },
            "recommendations": brain_score_result['recommendations']
        }

    @staticmethod
    def save_json(data: Dict, filepath: str):
        """Save formatted data to JSON file."""
        with open(filepath, 'w') as f:
            json.dump(data, f, default=JSONFormatter._serialize_datetime, indent=2)
```

### 3.2 End-to-End Demo Script (2 hours)

**`demo.py`:**
```python
"""
End-to-end demo: Process Muse EEG → Calculate all metrics → Output JSON.
"""

from datetime import datetime, timedelta
from pathlib import Path

from src.data.loader import MuseDataLoader
from src.data.preprocessor import EEGPreprocessor
from src.data.synthetic_journey import SyntheticJourneyGenerator
from src.scores.lri import LRICalculator
from src.scores.sleep import SleepConsolidationCalculator
from src.scores.dnos import DNOSCalculator
from src.scores.brain_score import BrainScoreCalculator
from src.api.formatters import JSONFormatter

def main():
    print("=" * 60)
    print("BRAIN SCORE DEMO: 28-DAY NEUROPLASTICITY JOURNEY")
    print("=" * 60)

    # 1. Load all participant data
    print("\n[1/6] Loading Muse EEG dataset...")
    loader = MuseDataLoader("Muse EEG Subconscious Decisions Dataset")
    participants = loader.load_all_participants()
    print(f"✓ Loaded {len(participants)} participants")

    # 2. Generate synthetic 28-day journey
    print("\n[2/6] Generating 28-day synthetic journey...")
    generator = SyntheticJourneyGenerator(list(participants.values()))
    start_date = datetime(2025, 1, 1, 7, 0, 0)
    journey = generator.generate_28_day_journey(start_date, improvement_trend=True)
    print(f"✓ Generated {len(journey['lri_samples'])} LRI samples")
    print(f"✓ Generated {len(journey['sleep_scores'])} sleep scores")

    # 3. Calculate DNOS for each day
    print("\n[3/6] Calculating daily DNOS scores...")
    dnos_calc = DNOSCalculator()
    dnos_results = []

    for day_offset in range(28):
        current_date = (start_date + timedelta(days=day_offset)).date()

        day_lri_samples = [
            s for s in journey['lri_samples']
            if s['timestamp'].date() == current_date
        ]

        day_sleep = next(
            (s for s in journey['sleep_scores'] if s['date'] == current_date),
            {'sleep_score': 75}
        )

        # Assume exercise at 7:30 AM on 75% of days
        exercise_time = None
        if day_offset % 4 != 0:  # 75% of days
            exercise_time = datetime.combine(current_date, datetime.min.time()).replace(hour=7, minute=30)

        dnos = dnos_calc.calculate_dnos(
            day_lri_samples,
            day_sleep['sleep_score'],
            exercise_time
        )

        if dnos:
            dnos_results.append(dnos)

    print(f"✓ Calculated DNOS for {len(dnos_results)} days")
    print(f"  Average DNOS: {sum(d['dnos'] for d in dnos_results) / len(dnos_results):.1f}")

    # 4. Calculate Brain Score
    print("\n[4/6] Calculating 28-day Brain Score...")
    brain_score_calc = BrainScoreCalculator()
    brain_score = brain_score_calc.calculate_brain_score(
        dnos_results,
        journey['lri_samples'],
        journey['sleep_scores']
    )

    print(f"✓ Brain Score: {brain_score['brain_score']}/100")
    print(f"  Interpretation: {brain_score['interpretation']}")
    print(f"  Components:")
    print(f"    • Cycle Completion: {brain_score['components']['cycle_completion']['score']}/100")
    print(f"    • Baseline Capacity: {brain_score['components']['baseline_capacity']['score']}/100")
    print(f"    • Efficiency Trend: {brain_score['components']['efficiency_trend']['score']}/100")
    print(f"    • Vagus Health: {brain_score['components']['vagus_health']['score']}/100")

    # 5. Format outputs as JSON
    print("\n[5/6] Generating JSON outputs for mobile app...")
    output_dir = Path("outputs/metrics")
    output_dir.mkdir(parents=True, exist_ok=True)

    formatter = JSONFormatter()

    # Real-time LRI samples (last 10)
    lri_realtime = [
        formatter.format_realtime_lri(sample)
        for sample in journey['lri_samples'][-10:]
    ]
    formatter.save_json(lri_realtime, output_dir / "lri_realtime.json")

    # Daily summaries (last 7 days for demo)
    daily_summaries = []
    for i, dnos in enumerate(dnos_results[-7:]):
        trend_7day = [d['dnos'] for d in dnos_results[max(0, i-6):i+1]]
        sleep = journey['sleep_scores'][i]

        summary = formatter.format_daily_summary(dnos, sleep, trend_7day)
        daily_summaries.append(summary)

    formatter.save_json(daily_summaries, output_dir / "dnos_daily.json")

    # Brain Score
    brain_score_json = formatter.format_brain_score(brain_score)
    formatter.save_json(brain_score_json, output_dir / "brain_score_28day.json")

    print(f"✓ Saved JSON files to {output_dir}/")
    print(f"  • lri_realtime.json (10 samples)")
    print(f"  • dnos_daily.json (7 days)")
    print(f"  • brain_score_28day.json (full 28-day metric)")

    # 6. Display recommendations
    print("\n[6/6] Recommendations:")
    for rec in brain_score['recommendations']:
        print(f"  • {rec}")

    print("\n" + "=" * 60)
    print("DEMO COMPLETE - JSON files ready for mobile app")
    print("=" * 60)

if __name__ == "__main__":
    main()
```

### 3.3 Documentation (1 hour)

**`README.md`:**
```markdown
# Brain Score: Neuroplasticity Optimization System

Real-time learning readiness detection using EEG band power analysis.

## Overview

Brain Score processes Muse EEG data to calculate:
- **LRI** (Learning Readiness Index): Real-time alertness + focus score
- **DNOS** (Daily Neuroplasticity Opportunity Score): Daily learning capacity
- **Brain Score**: 28-day rolling neuroplasticity health metric

## Setup

```bash
# Clone repository
git clone <repo-url>
cd brain_score

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run demo
python demo.py
```

## Outputs

JSON files are generated in `outputs/metrics/`:
- `lri_realtime.json`: Real-time LRI samples (30s intervals)
- `dnos_daily.json`: Daily scores with components
- `brain_score_28day.json`: 28-day rolling metric

## Mobile App Integration

Use the JSON outputs to build a Whoop-inspired mobile app. See `docs/emergent-prompt.md` for complete UI specification.

## Architecture

```
Muse EEG → Band Power → LRI → DNOS → Brain Score → JSON → Mobile App
```

## Scientific Foundation

Based on Huberman Lab neuroplasticity framework:
1. **Trigger**: Alertness (norepinephrine) + Focus (acetylcholine)
2. **Signal**: Incremental learning during optimal windows
3. **Consolidation**: Deep sleep (synaptic strengthening)

See `docs/neuro-PRD.md` for full specification.
```

---

## Emergent.sh Mobile App Prompt

**Save as `docs/emergent-prompt.md`:**

```markdown
# Emergent.sh Prompt: Brain Score Mobile App

Build a **Whoop-inspired neuroplasticity tracking app** with dark mode aesthetic and real-time brain state monitoring.

## Data Source

All data loaded from JSON files in `outputs/metrics/`:
- `lri_realtime.json`: Real-time LRI updates
- `dnos_daily.json`: Daily summaries
- `brain_score_28day.json`: 28-day metric

## Screens

### 1. HOME SCREEN (Primary)

**Layout:**
- Large circular gauge (center): Current LRI (0-100)
  - Color gradient:
    - 0-40: Red (#FF4444)
    - 40-70: Yellow (#FFD700)
    - 70-100: Green (#00FF88)
- Status text below gauge: "Optimal" | "Moderate" | "Low"
- Post-exercise countdown (if active):
  - "🔥 PEAK WINDOW: 2h 15m remaining"
  - Pulsing orange border
- Today's DNOS card:
  - Large number: "78/100"
  - 7-day sparkline trend below
  - Micro-insights: "↑ +5 vs yesterday"

**Interactions:**
- Tap gauge → Navigate to Focus Mode
- Tap DNOS → Navigate to Daily Summary
- Pull down → Refresh real-time data

### 2. FOCUS MODE (Real-time Monitoring)

**Layout:**
- Real-time LRI meter (top): Live updating number with smooth animations
- Component bars (horizontal):
  - Alertness: 0-100 bar (blue gradient)
  - Focus: 0-100 bar (purple gradient)
  - Arousal Balance: Inverted-U curve with position indicator
- Session timer: "45 min in optimal state" (green if LRI > 70)
- Haptic feedback: Gentle vibration when LRI drops below 60

**Data Updates:**
- Poll `lri_realtime.json` every 30 seconds
- Smooth transitions between states

### 3. BRAIN SCORE TAB (28-day Metric)

**Layout:**
- Hero number (top): "78/100" with trend arrow (↑ +3)
- Interpretation badge: "Good Neuroplasticity Health"
- Component breakdown (4 bars):
  - 🔄 Cycle Completion: 82/100
  - 🧠 Baseline Capacity: 75/100
  - 📈 Efficiency Trend: 76/100
  - ⚡ Vagus Health: 79/100
- 28-day trend chart (line graph)
- Insight card:
  - "Vagus activation improved 18% this month"
  - "Post-exercise LRI peaks avg 84/100"
- Recommendation card:
  - "Maintain exercise timing"
  - "Focus on sleep quality (current SWS: 18%, target: 22%)"

**Data Source:**
- Load from `brain_score_28day.json`

### 4. DAILY SUMMARY (DNOS)

**Layout:**
- DNOS score (hero): "78/100"
- Component breakdown:
  - Avg LRI: 72/100
  - Window Utilization: 65%
  - Sleep Consolidation: 81/100
- Sleep details:
  - Deep sleep: 22% (1h 45m)
  - REM: 18% (1h 25m)
  - Efficiency: 92%
- Top drivers list:
  - "Morning exercise → 1.5x multiplier activated"
  - "Low alpha during study → high engagement detected"
- 7-day trend sparkline

**Data Source:**
- Load from `dnos_daily.json`

### 5. SLEEP TAB

**Layout:**
- Sleep Consolidation Score (hero): "81/100"
- Hypnogram (if available): Sleep stages over night
- Key metrics:
  - Deep sleep: 22% (green if > 20%)
  - REM: 18%
  - Efficiency: 92%
- Insight: "Deep sleep increased 15% vs 7-day average"

**Data Source:**
- Extract from `dnos_daily.json` → `sleep_details`

## Design System

**Colors:**
- Background: #0A0A0A (dark mode)
- Cards: #1A1A1A
- Text Primary: #FFFFFF
- Text Secondary: #AAAAAA
- Accent: #00FF88 (optimal)
- Warning: #FFD700 (moderate)
- Alert: #FF4444 (low)

**Typography:**
- Hero numbers: 48pt, bold, monospace
- Section headers: 18pt, semibold
- Body text: 14pt, regular
- Insights: 12pt, italic

**Animations:**
- LRI updates: 0.5s ease-in-out
- Bar transitions: 0.3s ease
- Haptic feedback: gentle pulse (100ms)

## Technical Requirements

- **Framework**: React Native
- **State Management**: Context API or Redux
- **Charts**: react-native-svg-charts or Victory Native
- **Data Loading**: Fetch JSON files from local storage or API endpoint
- **Refresh Rate**:
  - LRI: 30 seconds
  - DNOS: Once per day (midnight)
  - Brain Score: Once per day

## Sample JSON Structures

**lri_realtime.json:**
```json
[
  {
    "lri": 84,
    "timestamp": "2025-01-15T14:30:00",
    "components": {
      "alertness": 78,
      "focus": 88,
      "arousal_balance": 85
    },
    "status": "optimal",
    "post_exercise_window": true,
    "window_remaining_minutes": 135
  }
]
```

**dnos_daily.json:**
```json
[
  {
    "date": "2025-01-15",
    "dnos": 78,
    "components": {
      "avg_lri": 72,
      "optimal_window_utilization": 65,
      "sleep_consolidation": 81
    },
    "sleep_details": {
      "sleep_score": 81,
      "deep_sleep_pct": 22,
      "rem_pct": 18,
      "efficiency": 92
    },
    "trend_7day": [65, 68, 72, 70, 75, 76, 78],
    "insights": [
      "Post-exercise LRI peaks show strongest acetylcholine response (avg 84/100)",
      "Sleep quality improved 15% vs 7-day average"
    ]
  }
]
```

**brain_score_28day.json:**
```json
{
  "brain_score": 78,
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-28"
  },
  "interpretation": "Good Neuroplasticity Health",
  "components": {
    "cycle_completion": {
      "score": 82,
      "complete_cycles": 23,
      "completion_rate": "23/28"
    },
    "baseline_capacity": {
      "score": 75,
      "morning_lri_avg": 68
    },
    "efficiency_trend": {
      "score": 76,
      "improvement_pct": 10.8,
      "trend": "improving"
    },
    "vagus_health": {
      "score": 79,
      "exercise_days": 21
    }
  },
  "recommendations": [
    "Maintain exercise timing",
    "Focus on sleep quality to boost consolidation (current SWS: 18%, target: 22%)"
  ]
}
```

## Build Instructions

1. Import JSON files into app data directory
2. Create React Native screens matching above specs
3. Implement real-time polling for LRI updates
4. Add haptic feedback for focus mode
5. Test with provided sample data

**Goal**: Whoop-level polish with neuroscience-backed insights.
```

---

## Final Checklist

### Day 1 Deliverables
- [ ] Project structure created
- [ ] Data loaders working (Muse + Apple Health)
- [ ] LRI algorithm implemented
- [ ] Validation on 5 participants

### Day 2 Deliverables
- [ ] Sleep Consolidation Score calculator
- [ ] DNOS calculator
- [ ] Brain Score (28-day) calculator
- [ ] Synthetic journey generator

### Day 3 Deliverables
- [ ] JSON formatters for all metrics
- [ ] End-to-end demo script
- [ ] Sample JSON outputs
- [ ] README documentation
- [ ] Emergent.sh prompt complete

---

## Success Metrics

**Algorithm Performance:**
- LRI processes 20 participants without errors
- Realistic score distributions (mean ~70, std ~15)
- Cycle completion correlates with DNOS (r > 0.6)

**Output Quality:**
- Valid JSON for all 28 days
- Insights are actionable and mechanism-based
- Trends show realistic improvement (if enabled)

**Documentation:**
- README covers setup in < 5 minutes
- Emergent.sh prompt is copy-paste ready
- Sample outputs demonstrate all features

---

## Next Steps (Post-Hackathon)

1. **Real-time streaming**: Bluetooth integration with Muse headband
2. **HRV integration**: Add chest strap or Apple Watch HRV data
3. **Backend API**: Deploy scoring engine to cloud
4. **Clinical validation**: N=100 user study
5. **Production hardware**: Custom behind-ear EEG device

---

**END OF IMPLEMENTATION PLAN**
