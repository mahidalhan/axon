# Axon MVP Implementation Plan - Session-Focused with Apple Health Integration

**Version:** 2.0 (ULTRATHINK Revision)
**Date:** November 8, 2025
**Scope:** Hackathon MVP - Scientifically Honest, Data-Constrained Approach

---

## Executive Summary

**What Changed:**
- **PIVOT:** From 28-day neuroplasticity tracking → Single-session optimal window detection
- **ADD:** Apple Health integration for workouts AND sleep
- **ADD:** Supplement tracking (UI only, no algorithm changes)
- **REPLACE:** 28-day Brain Score → Daily Brain Score (session + sleep composite)
- **DELETE:** Multi-participant stitching (scientifically dishonest)

**Why:**
- We have 40 minutes of EEG per participant, not 28 days
- Cannot measure plasticity improvement across different people
- CAN measure optimal learning windows within a session
- CAN show post-exercise boost effects (Huberman framework)

---

## User Decisions

✅ **Full Apple Health XML parser** (export.xml upload)
✅ **Supplement tracking UI only** (creatine + nootropics, no algorithm integration)
✅ **In-app notifications** (no push notifications for MVP)
✅ **Pivot to session-focused** (scientifically honest approach)

---

## Part 1: File Structure Changes

### Files to CREATE

```
docs/app/
├── UI-COMPONENTS.md ✅ CREATED
├── API-CONTRACTS.md
├── SCREEN-FLOWS.md
└── DESIGN-SPECS.md

docs/algorithm/
├── SESSION-ANALYSIS.md (NEW - explain session analyzer)
└── POST-EXERCISE-WINDOWS.md (NEW - Huberman framework)

docs/data-processing/
├── APPLE-HEALTH-INTEGRATION.md (NEW)
└── SLEEP-SCORE-CALCULATION.md (NEW)

backend/parsers/
└── apple_health_parser.py (NEW - XML parser)

backend/scores/
├── session_analyzer.py (NEW - optimal window detection)
└── session_score_calculator.py (RENAMED from dnos_calculator.py)

backend/api/
├── workout_routes.py (NEW)
├── sleep_routes.py (NEW)
├── supplement_routes.py (NEW)
└── session_routes.py (NEW)

backend/notifications/
└── in_app_alerts.py (NEW)

backend/models.py (UPDATE - add WorkoutRecord, SleepRecord, SupplementLog)
```

### Files to DELETE

```
❌ backend/scores/brain_score_calculator.py
❌ backend/processors/synthetic_generator.py (28-day journey logic)
```

### Files to UPDATE

```
🔄 backend/scores/lri_calculator.py (add post-exercise multipliers)
🔄 backend/scores/dnos_calculator.py → session_score_calculator.py (rename + simplify)
🔄 backend/processors/real_data_processor.py (remove multi-participant stitching)
🔄 backend/server.py (add new routes)
🔄 docs/algorithm/neuro-PRD.md (update scope)
🔄 docs/data-processing/PIPELINE_EXPLAINED.md (remove 28-day references)
🔄 docs/data-processing/REAL_DATA_INTEGRATION.md (update approach)
```

---

## Part 2: Algorithm Changes

### 2.1 REPLACE: Brain Score (Daily Composite)

**File:** `backend/scores/brain_score_calculator.py`

**Reason:** The legacy 28-day implementation assumed longitudinal data from one participant. The MVP now uses daily session data + sleep consolidation, so we need a replacement algorithm rather than deletion.

**Action:** Implement the daily Brain Score formula defined in `docs/shared/brain-score-proposal.md`:

```
brain_score = (
    0.55 × neural_state_score +
    0.25 × consolidation_score +
    0.20 × behavior_alignment
)
```

- `neural_state_score`: best `session_score` of the day with diminishing returns from optimal window utilisation.
- `consolidation_score`: prior-night Neuroplasticity Sleep Score (HRV-enabled when available).
- `behavior_alignment`: post-exercise window usage + circadian alignment bonus.

Update API payloads so the daily brain score and its components are returned alongside session summaries.

---

### 2.2 CREATE: Session Analyzer

**File:** `backend/scores/session_analyzer.py`

**Purpose:** Analyze a single 40-minute EEG session to identify optimal learning windows.

**Class Structure:**

```python
class SessionAnalyzer:
    """
    Analyze EEG session to find optimal learning windows.
    Based on Huberman Lab neuroplasticity framework.
    """

    def analyze_session(self, lri_samples: List[Dict],
                       workout_time: Optional[datetime] = None,
                       sleep_score: Optional[float] = None) -> Dict:
        """
        Main analysis function.

        Returns:
            Dict summary of session analysis. See `docs/shared/session-analysis-example.md`
            for the canonical payload structure used across docs and API responses.
        """

    def find_optimal_windows(self, lri_samples: List[Dict],
                            threshold: int = 70) -> List[Dict]:
        """
        Find consecutive time periods where LRI >= threshold.

        Algorithm:
        1. Scan through lri_samples sequentially
        2. When LRI crosses threshold, start new window
        3. Continue until LRI drops below threshold
        4. Calculate window stats (duration, avg LRI, quality)
        """

    def calculate_post_exercise_boost(self, lri_samples: List[Dict],
                                      workout_time: datetime) -> Dict:
        """
        Detect if LRI spike occurred during post-exercise window (1-4h).

        Returns:
        {
            "boost_detected": true,
            "boost_magnitude": 1.3,
            "peak_occurred_at": "09:15:00",
            "hours_after_workout": 2.25,
            "in_optimal_window": true
        }
        """

    def _calculate_session_score(self, lri_samples: List[Dict],
                                 optimal_windows: List[Dict],
                                 workout_boost: float,
                                 sleep_score: Optional[float]) -> float:
        """
        Calculate overall session quality score (0-100).

        Formula:
        Session_Score = (
            0.40 × avg_lri +
            0.30 × optimal_window_percentage +
            0.20 × post_exercise_bonus +
            0.10 × sleep_quality_bonus
        )
        """

    def _generate_insights(self, analysis_results: Dict) -> List[str]:
        """Generate natural language insights from analysis."""

    def _generate_recommendations(self, analysis_results: Dict) -> List[str]:
        """Generate actionable recommendations."""
```

**Algorithm Details:**

**Optimal Window Detection:**
```python
def find_optimal_windows(self, lri_samples, threshold=70):
    windows = []
    current_window = None

    for i, sample in enumerate(lri_samples):
        if sample['lri'] >= threshold:
            if current_window is None:
                # Start new window
                current_window = {
                    'start': sample['timestamp'],
                    'samples': [sample]
                }
            else:
                # Continue current window
                current_window['samples'].append(sample)
        else:
            if current_window is not None:
                # Close current window
                current_window['end'] = current_window['samples'][-1]['timestamp']
                current_window['duration_minutes'] = len(current_window['samples']) * 0.5
                current_window['avg_lri'] = np.mean([s['lri'] for s in current_window['samples']])
                current_window['quality'] = self._classify_quality(current_window['avg_lri'])

                windows.append(current_window)
                current_window = None

    return windows
```

**Quality Classification:**
```python
def _classify_quality(self, avg_lri):
    if avg_lri >= 85:
        return "excellent"  # ⭐⭐⭐
    elif avg_lri >= 75:
        return "very_good"  # ⭐⭐½
    elif avg_lri >= 70:
        return "good"       # ⭐⭐
    else:
        return "moderate"   # ⭐
```

---

### 2.3 UPDATE: LRI Calculator (Add Post-Exercise Multipliers)

**File:** `backend/scores/lri_calculator.py`

**Changes:**

```python
class LRICalculator:
    def __init__(self):
        self.optimal_beta_alpha_ratio = 1.5
        # NEW: Post-exercise window multipliers (Huberman framework)
        self.post_exercise_multipliers = {
            (0, 1): 1.5,   # 0-1h: Peak adrenaline/acetylcholine
            (1, 2): 1.3,   # 1-2h: Sustained elevation
            (2, 4): 1.1,   # 2-4h: Gradual decline
        }

    def calculate_lri(self, band_power: Dict[str, float],
                     workout_time: Optional[datetime] = None,
                     current_time: Optional[datetime] = None) -> Dict:
        """
        Calculate Learning Readiness Index with optional post-exercise boost.
        """
        alertness = self.calculate_alertness(band_power)
        focus = self.calculate_focus(band_power)
        arousal = self.calculate_arousal_balance(band_power)

        # Base LRI
        base_lri = (0.4 * alertness + 0.4 * focus + 0.2 * arousal)

        # Apply post-exercise multiplier if workout detected
        multiplier = self._get_post_exercise_multiplier(workout_time, current_time)
        lri = base_lri * multiplier

        return {
            'lri': float(np.clip(lri, 0, 100)),
            'base_lri': float(base_lri),
            'post_exercise_multiplier': float(multiplier),
            'alertness': float(alertness),
            'focus': float(focus),
            'arousal_balance': float(arousal),
            'status': self._get_status(lri)
        }

    def _get_post_exercise_multiplier(self, workout_time: Optional[datetime],
                                      current_time: Optional[datetime]) -> float:
        """
        Calculate post-exercise window multiplier based on Huberman framework.

        Multipliers:
        - 0-1h post-exercise: 1.5x (peak norepinephrine + acetylcholine)
        - 1-2h post-exercise: 1.3x (sustained elevation)
        - 2-4h post-exercise: 1.1x (gradual decline)
        - 4+h post-exercise: 1.0x (baseline)
        """
        if workout_time is None or current_time is None:
            return 1.0

        hours_elapsed = (current_time - workout_time).total_seconds() / 3600

        for (min_h, max_h), multiplier in self.post_exercise_multipliers.items():
            if min_h <= hours_elapsed < max_h:
                return multiplier

        return 1.0  # Default (no boost)
```

**No changes to:**
- `calculate_alertness()` ✅ Already correct
- `calculate_focus()` ✅ Already correct
- `calculate_arousal_balance()` ✅ Already correct

---

### 2.4 SIMPLIFY: DNOS → Session Score

**File:** `backend/scores/dnos_calculator.py` → **RENAME TO** `backend/scores/session_score_calculator.py`

**Changes:**

```python
class SessionScoreCalculator:
    """
    Calculate session quality score (0-100) for a single EEG session.

    Replaces DNOS (Daily Neuroplasticity Opportunity Score) which required
    full-day tracking. Session score focuses on single-session analysis.
    """

    def calculate_session_score(self,
                                lri_samples: List[Dict],
                                workout_time: Optional[datetime] = None,
                                sleep_score: Optional[float] = None) -> Dict:
        """
        Calculate session quality score.

        Formula:
        Session_Score = (
            0.40 × avg_lri +
            0.30 × optimal_window_percentage +
            0.20 × post_exercise_bonus +
            0.10 × sleep_quality_bonus
        )
        """
        # Component 1: Average LRI (40%)
        avg_lri = np.mean([s['lri'] for s in lri_samples])
        avg_lri_component = (avg_lri / 100) * 100  # Normalize to 0-100

        # Component 2: Optimal window utilization (30%)
        optimal_percentage = self._calculate_optimal_percentage(lri_samples)

        # Component 3: Post-exercise bonus (20%)
        post_exercise_bonus = self._calculate_post_exercise_bonus(
            lri_samples, workout_time
        )

        # Component 4: Sleep quality bonus (10%)
        sleep_bonus = self._calculate_sleep_bonus(sleep_score)

        # Weighted session score
        session_score = (
            0.40 * avg_lri_component +
            0.30 * optimal_percentage +
            0.20 * post_exercise_bonus +
            0.10 * sleep_bonus
        )

        return {
            'session_score': round(session_score, 1),
            'avg_lri': round(avg_lri, 1),
            'optimal_percentage': round(optimal_percentage, 1),
            'post_exercise_bonus': round(post_exercise_bonus, 1),
            'sleep_bonus': round(sleep_bonus, 1),
            'interpretation': self._get_interpretation(session_score)
        }

    def _calculate_optimal_percentage(self, lri_samples: List[Dict],
                                     threshold: int = 70) -> float:
        """
        Calculate percentage of session spent in optimal state (LRI >= threshold).
        """
        optimal_count = sum(1 for s in lri_samples if s['lri'] >= threshold)
        return (optimal_count / len(lri_samples)) * 100

    def _calculate_post_exercise_bonus(self, lri_samples: List[Dict],
                                       workout_time: Optional[datetime]) -> float:
        """
        Bonus if peak LRI occurred during post-exercise window (1-4h).

        Returns 0-100 score:
        - 100 if peak occurred 1-2h post-exercise (optimal window)
        - 80 if peak occurred 2-4h post-exercise (extended window)
        - 50 if peak occurred 0-1h post-exercise (too early, still warming up)
        - 0 if no workout or peak outside window
        """
        if workout_time is None:
            return 0

        # Find peak LRI
        peak_sample = max(lri_samples, key=lambda s: s['lri'])
        peak_time = peak_sample['timestamp']

        hours_after_workout = (peak_time - workout_time).total_seconds() / 3600

        if 1 <= hours_after_workout < 2:
            return 100  # Perfect timing
        elif 2 <= hours_after_workout < 4:
            return 80   # Good timing
        elif 0 <= hours_after_workout < 1:
            return 50   # Too early
        else:
            return 0    # Outside window

    def _calculate_sleep_bonus(self, sleep_score: Optional[float]) -> float:
        """
        Bonus based on previous night's sleep quality.

        High sleep score → better baseline brain state → higher session score
        """
        if sleep_score is None:
            return 50  # Neutral (assume average sleep)

        # Sleep score already 0-100, just return it
        return sleep_score

    def _get_interpretation(self, score: float) -> str:
        if score >= 85:
            return "Excellent session - peak neuroplasticity conditions"
        elif score >= 70:
            return "Good session - strong learning readiness"
        elif score >= 50:
            return "Moderate session - acceptable learning state"
        else:
            return "Low quality session - consider rescheduling deep work"
```

**DELETE from original DNOS calculator:**
- ❌ `_calculate_window_utilization()` (was for full-day tracking)
- ❌ Daily aggregation logic
- ❌ Multi-day comparisons

---

## Part 3: Apple Health Integration

### 3.1 CREATE: Apple Health XML Parser

**File:** `backend/parsers/apple_health_parser.py`

```python
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class AppleHealthParser:
    """
    Parse Apple Health export.xml to extract workouts and sleep data.
    """

    # Workout types that trigger neuroplasticity window
    HIGH_INTENSITY_WORKOUTS = [
        'HKWorkoutActivityTypeRunning',
        'HKWorkoutActivityTypeCycling',
        'HKWorkoutActivityTypeHighIntensityIntervalTraining',
        'HKWorkoutActivityTypeTraditionalStrengthTraining',
        'HKWorkoutActivityTypeFunctionalStrengthTraining',
        'HKWorkoutActivityTypeRowing',
        'HKWorkoutActivityTypeSwimming',
    ]

    def parse_export_xml(self, xml_path: str) -> Dict:
        """
        Parse Apple Health export.xml file.

        Returns:
        {
            "workouts": [...],
            "sleep_records": [...],
            "summary": {...}
        }
        """
        tree = ET.parse(xml_path)
        root = tree.getroot()

        workouts = self._extract_workouts(root)
        sleep_records = self._extract_sleep(root)

        return {
            'workouts': workouts,
            'sleep_records': sleep_records,
            'summary': {
                'workouts_found': len(workouts),
                'sleep_records_found': len(sleep_records),
                'date_range': self._get_date_range(workouts, sleep_records)
            }
        }

    def _extract_workouts(self, root) -> List[Dict]:
        """
        Extract <Workout> elements from XML.
        """
        workouts = []

        for workout in root.findall('Workout'):
            workout_type = workout.get('workoutActivityType')

            # Filter for high-intensity workouts only
            if workout_type not in self.HIGH_INTENSITY_WORKOUTS:
                continue

            # Extract workout stats
            workout_data = {
                'workout_type': self._format_workout_type(workout_type),
                'start_time': self._parse_datetime(workout.get('startDate')),
                'end_time': self._parse_datetime(workout.get('endDate')),
                'duration_minutes': float(workout.get('duration', 0)),
                'total_distance': float(workout.get('totalDistance', 0)),
                'total_energy_burned': float(workout.get('totalEnergyBurned', 0)),
                'source': workout.get('sourceName', 'Unknown'),
            }

            # Extract heart rate stats if available
            hr_stats = workout.find("WorkoutStatistics[@type='HKQuantityTypeIdentifierHeartRate']")
            if hr_stats is not None:
                workout_data['avg_heart_rate'] = float(hr_stats.get('average', 0))
                workout_data['max_heart_rate'] = float(hr_stats.get('maximum', 0))
                workout_data['min_heart_rate'] = float(hr_stats.get('minimum', 0))

            workouts.append(workout_data)

        logger.info(f"Extracted {len(workouts)} high-intensity workouts")
        return workouts

    def _extract_sleep(self, root) -> List[Dict]:
        """
        Extract sleep records from Apple Health.

        Sleep is stored as HKCategoryTypeIdentifierSleepAnalysis records.
        """
        sleep_records = []
        sleep_samples = []

        # Find all sleep analysis records
        for record in root.findall("Record[@type='HKCategoryTypeIdentifierSleepAnalysis']"):
            value = record.get('value')
            start_time = self._parse_datetime(record.get('startDate'))
            end_time = self._parse_datetime(record.get('endDate'))

            # value meanings:
            # HKCategoryValueSleepAnalysisInBed = 0
            # HKCategoryValueSleepAnalysisAsleep = 1
            # HKCategoryValueSleepAnalysisAwake = 2

            sleep_samples.append({
                'value': value,
                'start_time': start_time,
                'end_time': end_time,
                'duration_minutes': (end_time - start_time).total_seconds() / 60
            })

        # Group by night (aggregate samples into sleep sessions)
        sleep_records = self._aggregate_sleep_sessions(sleep_samples)

        logger.info(f"Extracted {len(sleep_records)} sleep sessions")
        return sleep_records

    def _aggregate_sleep_sessions(self, samples: List[Dict]) -> List[Dict]:
        """
        Aggregate individual sleep samples into nightly sleep sessions.
        """
        if not samples:
            return []

        # Sort by start time
        samples.sort(key=lambda x: x['start_time'])

        sessions = []
        current_session = None

        for sample in samples:
            # Start new session if gap > 2 hours from last sample
            if current_session is None or \
               (sample['start_time'] - current_session['end_time']).total_seconds() > 7200:

                if current_session is not None:
                    sessions.append(self._finalize_sleep_session(current_session))

                current_session = {
                    'start_time': sample['start_time'],
                    'end_time': sample['end_time'],
                    'samples': [sample]
                }
            else:
                # Continue current session
                current_session['end_time'] = sample['end_time']
                current_session['samples'].append(sample)

        # Add final session
        if current_session is not None:
            sessions.append(self._finalize_sleep_session(current_session))

        return sessions

    def _finalize_sleep_session(self, session: Dict) -> Dict:
        """
        Calculate sleep metrics for a session.
        """
        asleep_samples = [s for s in session['samples'] if s['value'] == 'HKCategoryValueSleepAnalysisAsleep']
        in_bed_samples = session['samples']

        total_asleep = sum(s['duration_minutes'] for s in asleep_samples)
        total_in_bed = sum(s['duration_minutes'] for s in in_bed_samples)

        # Calculate sleep efficiency
        sleep_efficiency = (total_asleep / total_in_bed * 100) if total_in_bed > 0 else 0

        # Simple sleep score (0-100)
        # Based on: duration (7-9h optimal) + efficiency (>85% good)
        duration_score = self._score_sleep_duration(total_asleep)
        efficiency_score = sleep_efficiency

        sleep_score = (0.6 * duration_score + 0.4 * efficiency_score)

        return {
            'date': session['start_time'].date(),
            'start_time': session['start_time'],
            'end_time': session['end_time'],
            'duration_hours': round(total_asleep / 60, 2),
            'time_in_bed_hours': round(total_in_bed / 60, 2),
            'sleep_efficiency': round(sleep_efficiency, 1),
            'sleep_score': round(sleep_score, 1)
        }

    def _score_sleep_duration(self, minutes: float) -> float:
        """
        Score sleep duration on 0-100 scale.
        Optimal: 7-9 hours
        """
        hours = minutes / 60

        if 7 <= hours <= 9:
            return 100  # Optimal
        elif 6 <= hours < 7 or 9 < hours <= 10:
            return 80   # Acceptable
        elif 5 <= hours < 6 or 10 < hours <= 11:
            return 60   # Suboptimal
        else:
            return 40   # Poor

    def _format_workout_type(self, raw_type: str) -> str:
        """Convert HKWorkoutActivityType to readable name."""
        mapping = {
            'HKWorkoutActivityTypeRunning': 'Running',
            'HKWorkoutActivityTypeCycling': 'Cycling',
            'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'HIIT',
            'HKWorkoutActivityTypeTraditionalStrengthTraining': 'Strength Training',
            'HKWorkoutActivityTypeFunctionalStrengthTraining': 'Functional Training',
            'HKWorkoutActivityTypeRowing': 'Rowing',
            'HKWorkoutActivityTypeSwimming': 'Swimming',
        }
        return mapping.get(raw_type, raw_type.replace('HKWorkoutActivityType', ''))

    def _parse_datetime(self, dt_str: str) -> datetime:
        """Parse ISO 8601 datetime string."""
        return datetime.fromisoformat(dt_str.replace(' +', '+').replace(' -', '-'))

    def _get_date_range(self, workouts: List, sleep_records: List) -> Dict:
        """Get date range from all records."""
        all_dates = []

        for w in workouts:
            all_dates.append(w['start_time'])

        for s in sleep_records:
            all_dates.append(s['start_time'])

        if not all_dates:
            return {'start': None, 'end': None}

        return {
            'start': min(all_dates).date().isoformat(),
            'end': max(all_dates).date().isoformat()
        }
```

---

### 3.2 CREATE: Data Models

**File:** `backend/models.py` (UPDATE)

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ... existing models ...

class WorkoutRecord(BaseModel):
    """Apple Health workout record."""
    id: str
    user_id: str
    workout_type: str  # "Running", "Cycling", "HIIT", etc.
    start_time: datetime
    end_time: datetime
    duration_minutes: float
    total_distance: Optional[float] = None
    total_energy_burned: Optional[float] = None
    avg_heart_rate: Optional[float] = None
    max_heart_rate: Optional[float] = None
    source: str  # "Apple Watch", "iPhone", etc.
    created_at: datetime

class SleepRecord(BaseModel):
    """Apple Health sleep session record."""
    id: str
    user_id: str
    date: str  # ISO date (YYYY-MM-DD)
    start_time: datetime
    end_time: datetime
    duration_hours: float
    time_in_bed_hours: float
    sleep_efficiency: float  # Percentage (0-100)
    sleep_score: float  # 0-100
    created_at: datetime

class SupplementLog(BaseModel):
    """User supplement intake log (UI only, not used in algorithm)."""
    id: str
    user_id: str
    supplement_name: str  # "Creatine", "Alpha-GPC", "Huperzine-A", etc.
    dosage: str  # "5g", "300mg", etc.
    taken_at: datetime
    notes: Optional[str] = None
    created_at: datetime
```

---

### 3.3 CREATE: API Routes

**File:** `backend/api/workout_routes.py`

```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.parsers.apple_health_parser import AppleHealthParser
from backend.models import WorkoutRecord
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


@router.post("/import")
async def import_apple_health(file: UploadFile = File(...)):
    """
    Upload and parse Apple Health export.xml file.

    Returns:
    - workouts_imported: int
    - sleep_records_imported: int
    - date_range: {start, end}
    """
    if not file.filename.endswith('.xml'):
        raise HTTPException(400, "File must be export.xml")

    # Save uploaded file temporarily
    temp_path = f"/tmp/{uuid.uuid4()}.xml"
    with open(temp_path, 'wb') as f:
        contents = await file.read()
        f.write(contents)

    # Parse XML
    parser = AppleHealthParser()
    result = parser.parse_export_xml(temp_path)

    # TODO: Store workouts and sleep records in MongoDB
    # For now, return summary

    return {
        "success": True,
        "workouts_imported": len(result['workouts']),
        "sleep_records_imported": len(result['sleep_records']),
        "date_range": result['summary']['date_range']
    }


@router.get("/recent")
async def get_recent_workouts(days: int = 7):
    """
    Get workouts from past N days.

    Returns list of WorkoutRecord objects.
    """
    # TODO: Query MongoDB for workouts in date range
    # For now, return mock data

    return {
        "workouts": [
            {
                "id": "w123",
                "workout_type": "Running",
                "start_time": (datetime.now() - timedelta(hours=2)).isoformat(),
                "duration_minutes": 30.5,
                "avg_heart_rate": 145,
                "source": "Apple Watch"
            }
        ]
    }


@router.get("/optimal-window")
async def get_current_optimal_window():
    """
    Check if user is currently in post-exercise optimal window.

    Returns:
    - in_window: bool
    - hours_since_workout: float
    - hours_remaining: float
    - workout_time: datetime
    - post_exercise_multiplier: float
    """
    # TODO: Query most recent workout, calculate window status

    return {
        "in_optimal_window": True,
        "hours_since_workout": 1.5,
        "hours_remaining": 2.5,
        "workout_time": (datetime.now() - timedelta(hours=1.5)).isoformat(),
        "post_exercise_multiplier": 1.3,
        "message": "Peak neuroplasticity window - optimal time for deep learning"
    }
```

**File:** `backend/api/sleep_routes.py`

```python
from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/sleep", tags=["sleep"])


@router.get("/recent")
async def get_recent_sleep(days: int = 7):
    """
    Get sleep records from past N days.

    Returns list of SleepRecord objects.
    """
    # TODO: Query MongoDB for sleep records

    return {
        "sleep_records": [
            {
                "id": "s123",
                "date": datetime.now().date().isoformat(),
                "duration_hours": 7.5,
                "sleep_efficiency": 88,
                "sleep_score": 82
            }
        ]
    }


@router.get("/last-night")
async def get_last_night_sleep():
    """Get previous night's sleep score."""
    # TODO: Query MongoDB for most recent sleep record

    return {
        "date": (datetime.now() - timedelta(days=1)).date().isoformat(),
        "duration_hours": 7.5,
        "sleep_score": 82
    }
```

**File:** `backend/api/supplement_routes.py`

```python
from fastapi import APIRouter
from backend.models import SupplementLog
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/supplements", tags=["supplements"])


@router.post("/log")
async def log_supplement(supplement_name: str,
                        dosage: str,
                        taken_at: str,
                        notes: str = None):
    """
    Log supplement intake (storage only, not used in algorithm).
    """
    # TODO: Store in MongoDB

    supplement_log = SupplementLog(
        id=str(uuid.uuid4()),
        user_id="demo_user",
        supplement_name=supplement_name,
        dosage=dosage,
        taken_at=datetime.fromisoformat(taken_at),
        notes=notes,
        created_at=datetime.now()
    )

    return {
        "success": True,
        "supplement_log": supplement_log.dict()
    }


@router.get("/history")
async def get_supplement_history(days: int = 30):
    """Retrieve supplement log history."""
    # TODO: Query MongoDB

    return {
        "supplements": [
            {
                "id": "s123",
                "supplement_name": "Creatine",
                "dosage": "5g",
                "taken_at": datetime.now().isoformat(),
                "notes": "Before workout"
            }
        ]
    }
```

**File:** `backend/api/session_routes.py`

```python
from fastapi import APIRouter
from backend.scores.session_analyzer import SessionAnalyzer
from backend.processors.real_data_processor import RealDataProcessor
from datetime import datetime

router = APIRouter(prefix="/api/session", tags=["session"])


@router.post("/analyze")
async def analyze_session(participant_id: int = 0, max_hours: float = 1.0):
    """
    Analyze single EEG session from real Muse data.

    Returns:
    - SessionAnalyzer output
    - Workout context (if available)
    - Sleep context (if available)
    """
    # Process EEG data
    processor = RealDataProcessor()
    result = processor.process_participant_sample(
        participant_id=participant_id,
        max_hours=max_hours
    )

    # Get workout context (TODO: query from MongoDB)
    workout_time = None  # datetime.now() - timedelta(hours=2)

    # Get sleep score (TODO: query from MongoDB)
    sleep_score = None  # 82

    # Analyze session
    analyzer = SessionAnalyzer()
    analysis = analyzer.analyze_session(
        lri_samples=result['lri_samples'],
        workout_time=workout_time,
        sleep_score=sleep_score
    )

    return {"session_analysis": analysis}


@router.get("/optimal-window-status")
async def get_optimal_window_status():
    """
    Real-time check: Are we in a post-exercise optimal window?
    Used for in-app notifications.
    """
    # TODO: Query most recent workout from MongoDB
    # Calculate if current time is within 1-4h window

    return {
        "in_optimal_window": False,
        "message": "No recent workout detected"
    }
```

---

## Part 4: Documentation Updates

### 4.1 UPDATE: neuro-PRD.md

**File:** `docs/algorithm/neuro-PRD.md`

**Changes to make:**

1. **Section "Daily Neuroplasticity Opportunity Score (DNOS)"**
   - RENAME to "Session Quality Score"
   - UPDATE formula to focus on single-session analysis
   - REMOVE daily aggregation references

2. **Section "Brain Score: 28-day rolling neuroplasticity health metric"**
   - RENAME to "Brain Score (Daily Composite)"
   - Summarize the MVP formula and link to `docs/shared/brain-score-proposal.md`
   - Clarify future work: reintroduce 28-day trends once longitudinal data exists

3. **Section "Data Requirements"**
   - UPDATE: Remove "28-day baseline calibration" requirement
   - UPDATE: Add Apple Health export.xml as data source
   - ADD: Sleep score calculation from Apple Health

4. **Section "MVP Feature Scope (Hackathon)"**
   - UPDATE In Scope:
     - ✅ Real-time LRI calculation
     - ✅ Session-level optimal window detection
     - ✅ Post-exercise window tracking (Apple Health)
     - ✅ Sleep score from Apple Health

     - ✅ Daily Brain Score composite
     - ✅ Supplement logging (UI only)
   - UPDATE Out of Scope:
     - ❌ 28-day Brain Score trendline (requires longitudinal data)
     - ❌ Personalized z-score baselines (need 28 days from one person)
     - ❌ Push notifications (in-app only for MVP)

**Add new section:**
```markdown
### Session Analysis: Optimal Window Detection

**Goal:** Identify the specific minutes within a session when brain is in peak learning state.

**Method:**
1. Calculate LRI every 30 seconds during session
2. Find consecutive periods where LRI >= 70 (optimal threshold)
3. Classify window quality based on average LRI
4. Match optimal windows to post-exercise timing (1-4h window)

**Output:**
- Peak LRI score + timestamp
- Total minutes in optimal state
- List of optimal time windows
- Actionable recommendation: "Schedule deep work at 9:15 AM daily"

**Scientific Basis:**
Per Huberman: "organizing your bouts of learning... to come in the two to three hours, maybe even four hours, but certainly in the 1 to two hours after you do some sort of exercise"
```

---

### 4.2 UPDATE: PIPELINE_EXPLAINED.md

**File:** `docs/data-processing/PIPELINE_EXPLAINED.md`

**Changes:**

1. **Step 5: "Daily Aggregation → Brain Score"**
   - RENAME to "Step 5: Session Analysis"
   - UPDATE flow to show session-level output, not 28-day

**New Step 5:**
```markdown
## Step 5: Session Analysis → Optimal Windows

**Input:** 97 LRI scores from 40-minute session

**Process:**
1. Find consecutive windows where LRI >= 70
2. Calculate window statistics (duration, avg LRI)
3. Detect post-exercise boost (if workout data available)
4. Generate session score (0-100)

**Output:** Session Analysis Report

Example:
```json
{
  "peak_lri": 84,
  "peak_time": "09:15:00",
  "optimal_windows": [
    {
      "start": "09:15:00",
      "end": "09:27:30",
      "duration_minutes": 12.5,
      "avg_lri": 76.2
    }
  ],
  "session_score": 72
}
```

**Why This Matters:**
- Tells user WHEN to learn (not just that they should learn more)
- Actionable: "Schedule deep work at 9:15 AM tomorrow"
- Grounded in real data (not fake 28-day trends)
```

**UPDATE:**
- Replace "28-Day Brain Score" mentions with "Daily Brain Score (MVP)"
- Remove instructions describing multi-day aggregation
- Emphasize session analysis outputs feeding the daily score

---

### 4.3 CREATE: New Documentation Files

**File:** `docs/algorithm/SESSION-ANALYSIS.md`

```markdown
# Session Analysis Algorithm

## Overview

The Session Analyzer identifies optimal learning windows within a single EEG session (typically 40 minutes).

## Core Algorithm

### 1. Optimal Window Detection

**Input:** List of LRI samples (30-second intervals)

**Process:**
```
FOR each sample in session:
  IF lri >= 70 (optimal threshold):
    IF no current window:
      START new window
    ELSE:
      CONTINUE current window
  ELSE:
    IF current window exists:
      CLOSE window
      CALCULATE window stats
      ADD to optimal_windows list
```

**Output:** List of optimal time windows

### 2. Post-Exercise Boost Detection

**Scientific Basis (Huberman):**
> "organizing your bouts of learning... to come in the two to three hours, maybe even four hours, but certainly in the 1 to two hours after you do some sort of exercise"

**Implementation:**
```python
def detect_post_exercise_boost(lri_samples, workout_time):
    peak_sample = max(lri_samples, key=lambda s: s['lri'])
    hours_after_workout = (peak_sample['timestamp'] - workout_time).hours

    if 1 <= hours_after_workout <= 2:
        return {"boost_detected": True, "multiplier": 1.3}
    elif 2 < hours_after_workout <= 4:
        return {"boost_detected": True, "multiplier": 1.1}
    else:
        return {"boost_detected": False, "multiplier": 1.0}
```

### 3. Session Score Calculation

**Formula:**
```
Session_Score = (
    0.40 × avg_lri +
    0.30 × optimal_window_percentage +
    0.20 × post_exercise_bonus +
    0.10 × sleep_quality_bonus
)
```

**Components:**
1. **avg_lri (40%):** Overall session quality
2. **optimal_window_percentage (30%):** Time spent in high-readiness state
3. **post_exercise_bonus (20%):** Did peak occur during optimal window?
4. **sleep_quality_bonus (10%):** Previous night's sleep score

## Example Session Analysis

**Input:**
- 40-minute EEG session (97 LRI samples)
- Workout: 7:00 AM running (30 min)
- Sleep: 7.5h (score 82/100)
- Current time: 9:00-9:40 AM

**Processing:**
1. Calculate LRI every 30 seconds
2. Detect optimal windows (LRI >= 70)
3. Check post-exercise timing (2h after workout)
4. Calculate session score

**Output:**
```json
{
  "peak_lri": 84,
  "peak_time": "09:15:00",
  "avg_lri": 47,
  "optimal_windows": [
    {
      "start": "09:15:00",
      "end": "09:27:30",
      "duration_minutes": 12.5,
      "avg_lri": 76
    }
  ],
  "time_in_state": {
    "optimal": 12.5,
    "moderate": 22.7,
    "low": 4.8
  },
  "post_exercise_boost": {
    "detected": true,
    "multiplier": 1.3,
    "hours_since_workout": 2.25
  },
  "session_score": 72,
  "insights": [
    "Peak occurred 15 min into session",
    "Post-exercise boost detected (1.3x)",
    "Optimal state maintained for 31% of session"
  ],
  "recommendations": [
    "Schedule deep work at 9:15 AM daily",
    "Morning workout → 2h later = optimal timing"
  ]
}
```

## Interpretation Guide

### Session Score Ranges

| Score | Interpretation | Action |
|-------|----------------|--------|
| 85-100 | Excellent | Perfect time for deep learning |
| 70-84 | Good | Strong learning state, proceed |
| 50-69 | Moderate | Acceptable for lighter tasks |
| 0-49 | Poor | Reschedule deep work if possible |

### Optimal Window Quality

| Avg LRI | Quality | Stars |
|---------|---------|-------|
| 85-100 | Excellent | ⭐⭐⭐ |
| 75-84 | Very Good | ⭐⭐½ |
| 70-74 | Good | ⭐⭐ |
| 60-69 | Moderate | ⭐ |
```

---

**File:** `docs/data-processing/APPLE-HEALTH-INTEGRATION.md`

```markdown
# Apple Health Integration Guide

## Overview

Import workout and sleep data from Apple Health to provide context for EEG sessions.

## Data Sources

### 1. Workouts

**Relevant Types:**
- Running
- Cycling
- HIIT
- Strength Training
- Rowing
- Swimming

**Extracted Fields:**
- `workoutActivityType`
- `startDate`, `endDate`
- `duration`
- `totalEnergyBurned`
- `WorkoutStatistics` (heart rate)

**Why Workouts Matter:**
Per Huberman: High-intensity exercise triggers vagus nerve activation → locus coeruleus (norepinephrine) + nucleus basalis (acetylcholine) → 1-4 hour window of enhanced learning capacity.

### 2. Sleep

**Source:** `HKCategoryTypeIdentifierSleepAnalysis` records

**Extracted Metrics:**
- Total sleep duration
- Time in bed
- Sleep efficiency (asleep / in bed)
- Sleep score (0-100)

**Sleep Score Formula:**
```
duration_score = score_sleep_duration(hours)  # 7-9h = 100
efficiency_score = sleep_efficiency  # >85% = good

sleep_score = (0.6 × duration_score) + (0.4 × efficiency_score)
```

**Why Sleep Matters:**
Per Huberman: "you need to get great sleep that night and in subsequent nights in order to actually allow the plasticity to occur. Plasticity... actually takes place in sleep"

## Export Process

### Step 1: Export from iPhone

1. Open **Health** app
2. Tap profile picture (top right)
3. Scroll down → **Export All Health Data**
4. Tap **Export**
5. Wait for processing (can take 1-2 minutes)
6. Share `export.zip` to computer via AirDrop/email

### Step 2: Extract XML

1. Unzip `export.zip`
2. Locate `export.xml` (largest file, ~100-500MB)

### Step 3: Upload to Axon

1. Open Axon app
2. Navigate to **Apple Health Import** screen
3. Select `export.xml` file
4. Wait for processing (30-60 seconds)

## XML Structure

### Workout Example
```xml
<Workout workoutActivityType="HKWorkoutActivityTypeRunning"
         duration="30.5"
         durationUnit="min"
         totalEnergyBurned="350"
         sourceName="Apple Watch"
         startDate="2025-11-08 07:00:00 -0800"
         endDate="2025-11-08 07:30:30 -0800">

  <WorkoutStatistics type="HKQuantityTypeIdentifierHeartRate"
                    average="145"
                    minimum="120"
                    maximum="165"
                    unit="count/min"/>
</Workout>
```

### Sleep Example
```xml
<Record type="HKCategoryTypeIdentifierSleepAnalysis"
        value="HKCategoryValueSleepAnalysisAsleep"
        startDate="2025-11-07 22:30:00 -0800"
        endDate="2025-11-08 06:00:00 -0800"/>
```

## Processing Logic

### Workout Classification

**High-Intensity Filter:**
Only workouts that trigger neuroplasticity window are imported.

**Criteria:**
- `workoutActivityType` in [Running, Cycling, HIIT, Strength, etc.]
- OR `avg_heart_rate` > 70% max heart rate (age-based calculation)

**Low-Intensity Excluded:**
- Yoga (unless labeled as "Power Yoga")
- Walking
- Mindfulness/Meditation

### Sleep Aggregation

**Challenge:** Apple Health stores sleep as many small records (each time you roll over, wake briefly, etc.)

**Solution:** Aggregate samples into nightly sessions
```python
def aggregate_sleep_sessions(samples):
    sessions = []
    current_session = None

    for sample in sorted_samples:
        if gap_from_last_sample > 2_hours:
            # Start new session
            sessions.append(current_session)
            current_session = new_session(sample)
        else:
            # Continue session
            current_session.add(sample)

    return sessions
```

## Privacy & Security

**Data Storage:**
- Workouts and sleep records stored locally in MongoDB
- No data sent to external servers
- User can delete import anytime

**File Handling:**
- `export.xml` uploaded via HTTPS
- Temporarily stored in `/tmp/` during processing
- Deleted after parsing complete
- Original file never permanently stored

## Troubleshooting

### "No workouts found"
- Check that you have workouts recorded in Apple Health
- Ensure workouts are high-intensity types (Running, HIIT, etc.)
- Verify export.xml is from correct date range

### "Sleep data incomplete"
- Enable sleep tracking in Apple Health
- Use Apple Watch or manual sleep logging
- Check that `export.xml` includes sleep records

### "File too large"
- `export.xml` can be 100-500MB for years of data
- Processing may take 1-2 minutes
- Consider exporting shorter date range if timeout occurs
```

---

## Part 5: Implementation Summary

### What Gets Deleted
```
❌ backend/scores/brain_score_calculator.py
❌ backend/processors/synthetic_generator.py (28-day logic)
❌ All "28-day" references from documentation
❌ Multi-participant stitching logic
```

### What Gets Created
```
✅ docs/app/ (UI-COMPONENTS.md, API-CONTRACTS.md, etc.)
✅ docs/algorithm/SESSION-ANALYSIS.md
✅ docs/data-processing/APPLE-HEALTH-INTEGRATION.md
✅ backend/parsers/apple_health_parser.py
✅ backend/scores/session_analyzer.py
✅ backend/api/ (workout, sleep, supplement, session routes)
✅ backend/notifications/in_app_alerts.py
```

### What Gets Updated
```
🔄 backend/scores/lri_calculator.py (+ post-exercise multipliers)
🔄 backend/scores/dnos_calculator.py → session_score_calculator.py
🔄 backend/models.py (+ WorkoutRecord, SleepRecord, SupplementLog)
🔄 backend/server.py (+ new API routes)
🔄 docs/algorithm/neuro-PRD.md (pivot to session-focused)
🔄 docs/data-processing/PIPELINE_EXPLAINED.md
```

---

## Part 6: Metrics Available for UI

### Session Analysis
```json
{
  "session_duration_minutes": 40.2,
  "peak_lri": 84.3,
  "peak_timestamp": "09:15:30",
  "avg_lri": 46.8,
  "optimal_minutes": 12.5,
  "optimal_percentage": 31.1,
  "session_score": 72.3,

  "lri_timeline": [  // For chart
    {"timestamp": "09:00:00", "lri": 42},
    {"timestamp": "09:00:30", "lri": 43},
    // ... 97 total
  ],

  "optimal_windows": [
    {
      "start": "09:15:00",
      "end": "09:27:30",
      "duration_minutes": 12.5,
      "avg_lri": 76.2,
      "quality": "excellent"
    }
  ],

  "component_scores": {
    "alertness": 65.3,
    "focus": 58.2,
    "arousal_balance": 42.1
  },

  "workout_context": {
    "workout_type": "Running",
    "hours_since_workout": 2.25,
    "post_exercise_multiplier": 1.3
  },

  "sleep_context": {
    "previous_night_score": 82,
    "sleep_duration_hours": 7.5
  }
}
```

### Optimal Window Status (Real-time)
```json
{
  "in_optimal_window": true,
  "current_lri": 78,
  "hours_since_workout": 1.5,
  "hours_remaining": 2.5,
  "post_exercise_multiplier": 1.3,
  "message": "Peak neuroplasticity window NOW"
}
```

### Workout List
```json
{
  "workouts": [
    {
      "id": "w123",
      "workout_type": "Running",
      "start_time": "2025-11-08T07:00:00",
      "duration_minutes": 30.5,
      "avg_heart_rate": 145,
      "window_utilized": true,
      "peak_lri_during_window": 84
    }
  ]
}
```

### Sleep History
```json
{
  "sleep_records": [
    {
      "date": "2025-11-08",
      "duration_hours": 7.5,
      "sleep_efficiency": 88,
      "sleep_score": 82
    }
  ]
}
```

---

## Part 7: Next Steps

### For You (UI Development)
1. Read `docs/app/UI-COMPONENTS.md`
2. Build screens using API contracts
3. Integrate charts (Recharts/Victory)
4. Test with mock data first

### For Me (Backend Implementation)
1. Create Apple Health parser
2. Implement SessionAnalyzer
3. Add workout/sleep API routes
4. Update algorithm documentation
5. Implement Daily Brain Score calculator & expose API payload
6. Test end-to-end flow

---

**End of Implementation Plan**
