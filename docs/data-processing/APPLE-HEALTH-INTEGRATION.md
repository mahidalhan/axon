# Apple Health Integration Guide
## Enhanced Sleep Metrics Extraction

**Version:** 2.0
**Date:** November 8, 2025
**Purpose:** Extract research-validated sleep metrics from Apple Health export.xml

---

## Overview

This guide explains how to extract enhanced sleep metrics from Apple Health data to calculate the research-validated Sleep Score (8 components). The enhanced extraction goes beyond basic sleep duration + efficiency to include HRV, consistency, WASO, SOL, respiratory rate, and deep sleep percentage.

---

## Data Source

**File:** `export.xml` from Apple Health export
**Location:** iPhone → Health app → Profile → Export Health Data
**Size:** Typically 50-500 MB (varies by usage history)

---

## Sleep-Related Record Types

### 1. Sleep Analysis Records

**Record Type:** `HKCategoryTypeIdentifierSleepAnalysis`

**Values:**
- `HKCategoryValueSleepAnalysisInBed` = In bed (not asleep)
- `HKCategoryValueSleepAnalysisAsleep` = General sleep (legacy)
- `HKCategoryValueSleepAnalysisAsleepCore` = Light/Core sleep
- `HKCategoryValueSleepAnalysisAsleepDeep` = Deep sleep (N3)
- `HKCategoryValueSleepAnalysisAsleepREM` = REM sleep
- `HKCategoryValueSleepAnalysisAwake` = Awake during sleep

**XML Example:**
```xml
<Record type="HKCategoryTypeIdentifierSleepAnalysis"
        sourceName="Apple Watch"
        value="HKCategoryValueSleepAnalysisAsleepDeep"
        startDate="2025-11-07 23:15:00 -0800"
        endDate="2025-11-08 00:32:00 -0800"/>

<Record type="HKCategoryTypeIdentifierSleepAnalysis"
        sourceName="Apple Watch"
        value="HKCategoryValueSleepAnalysisAsleepREM"
        startDate="2025-11-08 00:32:00 -0800"
        endDate="2025-11-08 01:45:00 -0800"/>

<Record type="HKCategoryTypeIdentifierSleepAnalysis"
        sourceName="Apple Watch"
        value="HKCategoryValueSleepAnalysisAwake"
        startDate="2025-11-08 01:45:00 -0800"
        endDate="2025-11-08 02:00:00 -0800"/>
```

**What to Extract:**
- Sleep start time = earliest "In Bed" or "Asleep" timestamp
- Sleep end time = latest "Awake" or "Asleep" timestamp
- Time in bed = "In Bed" start → final wake time
- Total sleep time = sum of all "Asleep*" durations
- Deep sleep minutes = sum of "AsleepDeep" durations
- REM sleep minutes = sum of "AsleepREM" durations
- Core sleep minutes = sum of "AsleepCore" durations
- Awake minutes = sum of "Awake" durations (during sleep period)

---

### 2. HRV Samples (Heart Rate Variability)

**Record Type:** `HKQuantityTypeIdentifierHeartRateVariabilitySDNN`

**XML Example:**
```xml
<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"
        sourceName="Apple Watch"
        unit="ms"
        value="65.2"
        startDate="2025-11-08 02:30:00 -0800"
        endDate="2025-11-08 02:30:00 -0800"/>

<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"
        sourceName="Apple Watch"
        unit="ms"
        value="72.8"
        startDate="2025-11-08 03:15:00 -0800"
        endDate="2025-11-08 03:15:00 -0800"/>
```

**What to Extract:**
- Filter HRV samples that fall within sleep window (sleep_start ≤ timestamp ≤ sleep_end)
- Calculate average RMSSD or SDNN during sleep
- Prefer RMSSD if available (more accurate for parasympathetic activity)
- **Note:** Apple Watch records HRV intermittently during sleep (~5-15 samples per night)

**Extraction Logic:**
```python
def extract_sleep_hrv(hrv_records, sleep_start, sleep_end):
    """Extract HRV samples that occurred during sleep window."""
    sleep_hrv = [
        r for r in hrv_records
        if sleep_start <= r['timestamp'] <= sleep_end
    ]

    # Prefer RMSSD, fallback to SDNN
    rmssd_samples = [r for r in sleep_hrv if 'RMSSD' in r['type']]
    if rmssd_samples:
        return np.mean([s['value'] for s in rmssd_samples])
    else:
        sdnn_samples = [r for r in sleep_hrv if 'SDNN' in r['type']]
        return np.mean([s['value'] for s in sdnn_samples]) if sdnn_samples else None
```

---

### 3. Respiratory Rate

**Record Type:** `HKQuantityTypeIdentifierRespiratoryRate`

**XML Example:**
```xml
<Record type="HKQuantityTypeIdentifierRespiratoryRate"
        sourceName="Apple Watch"
        unit="count/min"
        value="14.0"
        startDate="2025-11-08 03:00:00 -0800"
        endDate="2025-11-08 03:00:00 -0800"/>
```

**What to Extract:**
- Filter respiratory rate samples during sleep window
- Calculate average breaths per minute
- **Note:** Apple Watch samples respiratory rate less frequently than HRV

**Extraction Logic:**
```python
def extract_respiratory_rate(resp_records, sleep_start, sleep_end):
    """Average respiratory rate during sleep."""
    sleep_resp = [
        r['value'] for r in resp_records
        if sleep_start <= r['timestamp'] <= sleep_end
    ]
    return np.mean(sleep_resp) if sleep_resp else None
```

---

## Enhanced Sleep Record Model

### Data Structure

```python
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class EnhancedSleepRecord(BaseModel):
    """Extended sleep record with all metrics for sleep score."""

    # Identifiers
    date: str  # "2025-11-08"
    device_type: Optional[str] = "iphone"  # "iphone", "apple_watch", "oura"

    # Basic timing
    start_time: datetime
    end_time: datetime
    in_bed_time: datetime
    final_wake_time: datetime

    # Duration metrics
    duration_hours: float  # Total sleep time
    time_in_bed_hours: float
    sleep_efficiency: float  # (TST / TIB) × 100

    # Sleep stage breakdown (optional)
    deep_sleep_minutes: Optional[float] = None
    rem_sleep_minutes: Optional[float] = None
    core_sleep_minutes: Optional[float] = None
    awake_minutes: Optional[float] = None

    # Advanced metrics
    hrv_rmssd_sleep: Optional[float] = None  # Average HRV during sleep
    waso_minutes: Optional[float] = None  # Wake after sleep onset
    sol_minutes: Optional[float] = None  # Sleep onset latency
    avg_respiratory_rate: Optional[float] = None

    # Consistency (requires 7-day history)
    bedtime_consistency_sd: Optional[float] = None  # SD of bedtimes (minutes)

    # Computed percentages
    deep_sleep_percent: float  # (deep_minutes / duration) × 100
    rem_sleep_percent: Optional[float] = None
    core_sleep_percent: Optional[float] = None

    # Sleep score
    sleep_score: float  # 0-100 composite score
    sleep_score_version: str  # 'hrv_enabled' or 'base'

    # Metadata
    has_sleep_stages: bool = False
    has_hrv: bool = False
    days_for_consistency: int = 0  # How many nights used for consistency calc

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
```

---

## Extraction Pipeline

### Step 1: Parse XML and Group by Night

```python
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from collections import defaultdict

def parse_sleep_data(export_xml_path: str) -> List[EnhancedSleepRecord]:
    """Parse Apple Health export.xml and extract sleep records."""

    tree = ET.parse(export_xml_path)
    root = tree.getroot()

    # Extract all sleep analysis records
    sleep_records = []
    for record in root.findall(".//Record[@type='HKCategoryTypeIdentifierSleepAnalysis']"):
        sleep_records.append({
            'value': record.get('value'),
            'start_time': datetime.fromisoformat(record.get('startDate')),
            'end_time': datetime.fromisoformat(record.get('endDate')),
            'source': record.get('sourceName')
        })

    # Extract HRV records
    hrv_records = []
    for record in root.findall(".//Record[@type='HKQuantityTypeIdentifierHeartRateVariabilitySDNN']"):
        hrv_records.append({
            'timestamp': datetime.fromisoformat(record.get('startDate')),
            'value': float(record.get('value')),
            'type': 'SDNN'
        })

    # Extract respiratory rate records
    resp_records = []
    for record in root.findall(".//Record[@type='HKQuantityTypeIdentifierRespiratoryRate']"):
        resp_records.append({
            'timestamp': datetime.fromisoformat(record.get('startDate')),
            'value': float(record.get('value'))
        })

    # Group sleep records by night
    sleep_sessions = _group_into_sessions(sleep_records)

    # Process each session
    enhanced_records = []
    for session in sleep_sessions:
        enhanced_record = _process_sleep_session(
            session,
            hrv_records,
            resp_records
        )
        enhanced_records.append(enhanced_record)

    # Calculate consistency for last 7 days
    _add_consistency_scores(enhanced_records)

    return enhanced_records
```

---

### Step 2: Group Records into Sleep Sessions

```python
def _group_into_sessions(sleep_records: List[Dict]) -> List[Dict]:
    """Group sleep records into nightly sessions."""

    # Sort by start time
    sleep_records = sorted(sleep_records, key=lambda x: x['start_time'])

    sessions = []
    current_session = {'samples': [], 'start_time': None, 'end_time': None}

    for record in sleep_records:
        # New session if gap > 3 hours from last record
        if current_session['end_time']:
            gap = (record['start_time'] - current_session['end_time']).total_seconds() / 3600
            if gap > 3:
                # Save current session
                if current_session['samples']:
                    sessions.append(current_session)
                # Start new session
                current_session = {'samples': [], 'start_time': None, 'end_time': None}

        # Add to current session
        current_session['samples'].append(record)
        if not current_session['start_time']:
            current_session['start_time'] = record['start_time']
        current_session['end_time'] = record['end_time']

    # Add final session
    if current_session['samples']:
        sessions.append(current_session)

    # Filter: Only keep sessions >3 hours and starting between 6 PM - 2 AM
    filtered_sessions = []
    for session in sessions:
        duration_hours = (session['end_time'] - session['start_time']).total_seconds() / 3600
        start_hour = session['start_time'].hour

        if duration_hours >= 3 and (start_hour >= 18 or start_hour <= 2):
            filtered_sessions.append(session)

    return filtered_sessions
```

---

### Step 3: Process Each Sleep Session

```python
def _process_sleep_session(
    session: Dict,
    hrv_records: List[Dict],
    resp_records: List[Dict]
) -> EnhancedSleepRecord:
    """Calculate comprehensive sleep metrics for a single session."""

    # Determine device type
    sources = [s['source'] for s in session['samples']]
    device_type = 'apple_watch' if any('Watch' in s for s in sources) else 'iphone'

    # Extract sleep stages
    deep_samples = [s for s in session['samples']
                    if s['value'] == 'HKCategoryValueSleepAnalysisAsleepDeep']
    rem_samples = [s for s in session['samples']
                   if s['value'] == 'HKCategoryValueSleepAnalysisAsleepREM']
    core_samples = [s for s in session['samples']
                    if s['value'] == 'HKCategoryValueSleepAnalysisAsleepCore']
    awake_samples = [s for s in session['samples']
                     if s['value'] == 'HKCategoryValueSleepAnalysisAwake']
    in_bed_samples = [s for s in session['samples']
                      if s['value'] == 'HKCategoryValueSleepAnalysisInBed']

    # Calculate durations
    deep_minutes = sum(_duration_minutes(s) for s in deep_samples)
    rem_minutes = sum(_duration_minutes(s) for s in rem_samples)
    core_minutes = sum(_duration_minutes(s) for s in core_samples)
    awake_minutes = sum(_duration_minutes(s) for s in awake_samples)

    total_sleep_minutes = deep_minutes + rem_minutes + core_minutes
    duration_hours = total_sleep_minutes / 60

    # Time in bed
    in_bed_time = min(s['start_time'] for s in session['samples'])
    final_wake_time = max(s['end_time'] for s in session['samples'])
    time_in_bed_minutes = (final_wake_time - in_bed_time).total_seconds() / 60
    time_in_bed_hours = time_in_bed_minutes / 60

    # Sleep efficiency
    sleep_efficiency = (total_sleep_minutes / time_in_bed_minutes) * 100 if time_in_bed_minutes > 0 else 0

    # WASO (wake after sleep onset)
    first_sleep = min(
        s['start_time'] for s in session['samples']
        if 'Asleep' in s['value']
    )
    waso_samples = [s for s in awake_samples if s['start_time'] >= first_sleep]
    waso_minutes = sum(_duration_minutes(s) for s in waso_samples)

    # Sleep Onset Latency
    sol_minutes = (first_sleep - in_bed_time).total_seconds() / 60

    # HRV during sleep
    hrv_sleep = _extract_sleep_hrv(hrv_records, session['start_time'], session['end_time'])

    # Respiratory rate during sleep
    resp_rate = _extract_respiratory_rate(resp_records, session['start_time'], session['end_time'])

    # Deep sleep percentage
    deep_sleep_percent = (deep_minutes / total_sleep_minutes * 100) if total_sleep_minutes > 0 else 0

    # Determine if we have sleep stages
    has_sleep_stages = (deep_minutes > 0 or rem_minutes > 0 or core_minutes > 0)

    # Calculate sleep score (placeholder - actual calculation in sleep_calculator.py)
    from backend.scores.sleep_calculator import calculate_sleep_score

    sleep_score_data = calculate_sleep_score({
        'duration_hours': duration_hours,
        'efficiency': sleep_efficiency,
        'deep_percent': deep_sleep_percent,
        'waso_minutes': waso_minutes,
        'sol_minutes': sol_minutes,
        'hrv_rmssd': hrv_sleep,
        'resp_rate': resp_rate
    }, has_hrv=(hrv_sleep is not None))

    return EnhancedSleepRecord(
        date=session['start_time'].date().isoformat(),
        device_type=device_type,
        start_time=first_sleep,
        end_time=session['end_time'],
        in_bed_time=in_bed_time,
        final_wake_time=final_wake_time,

        duration_hours=round(duration_hours, 2),
        time_in_bed_hours=round(time_in_bed_hours, 2),
        sleep_efficiency=round(sleep_efficiency, 1),

        deep_sleep_minutes=round(deep_minutes, 1) if has_sleep_stages else None,
        rem_sleep_minutes=round(rem_minutes, 1) if has_sleep_stages else None,
        core_sleep_minutes=round(core_minutes, 1) if has_sleep_stages else None,
        awake_minutes=round(awake_minutes, 1),

        waso_minutes=round(waso_minutes, 1),
        sol_minutes=round(sol_minutes, 1),
        hrv_rmssd_sleep=round(hrv_sleep, 1) if hrv_sleep else None,
        avg_respiratory_rate=round(resp_rate, 1) if resp_rate else None,

        deep_sleep_percent=round(deep_sleep_percent, 1),

        sleep_score=sleep_score_data['sleep_score'],
        sleep_score_version=sleep_score_data['formula_version'],

        has_sleep_stages=has_sleep_stages,
        has_hrv=(hrv_sleep is not None)
    )


def _duration_minutes(sample: Dict) -> float:
    """Calculate duration of a sample in minutes."""
    return (sample['end_time'] - sample['start_time']).total_seconds() / 60


def _extract_sleep_hrv(hrv_records: List[Dict], sleep_start: datetime, sleep_end: datetime) -> Optional[float]:
    """Extract average HRV during sleep window."""
    sleep_hrv = [
        r['value'] for r in hrv_records
        if sleep_start <= r['timestamp'] <= sleep_end
    ]
    return np.mean(sleep_hrv) if sleep_hrv else None


def _extract_respiratory_rate(resp_records: List[Dict], sleep_start: datetime, sleep_end: datetime) -> Optional[float]:
    """Extract average respiratory rate during sleep."""
    sleep_resp = [
        r['value'] for r in resp_records
        if sleep_start <= r['timestamp'] <= sleep_end
    ]
    return np.mean(sleep_resp) if sleep_resp else None
```

---

### Step 4: Calculate Consistency

```python
def _add_consistency_scores(sleep_records: List[EnhancedSleepRecord]) -> None:
    """Add bedtime consistency scores to sleep records (7-day rolling window)."""

    # Sort by date
    sleep_records.sort(key=lambda x: x.date)

    for i, record in enumerate(sleep_records):
        # Get last 7 nights (including current)
        start_idx = max(0, i - 6)
        recent_nights = sleep_records[start_idx:i+1]

        if len(recent_nights) >= 3:
            # Extract bedtimes as minutes from midnight
            bedtime_minutes = []
            for night in recent_nights:
                bt = night.start_time
                mins = bt.hour * 60 + bt.minute

                # Normalize for day wrap (11 PM = -60, 1 AM = 60)
                if mins < 360:  # Before 6 AM = late night
                    mins += 1440
                bedtime_minutes.append(mins)

            # Calculate standard deviation
            consistency_sd = np.std(bedtime_minutes)

            record.bedtime_consistency_sd = round(consistency_sd, 1)
            record.days_for_consistency = len(recent_nights)
        else:
            record.bedtime_consistency_sd = None
            record.days_for_consistency = len(recent_nights)
```

---

## Implementation in Parser

**File:** `backend/parsers/apple_health_parser.py`

**Key Method:** `parse_sleep_records()`

See example implementation in `backend/parsers/apple_health_parser.py:250-400`

---

## Edge Cases

### 1. Missing Sleep Stages

**Scenario:** iPhone-only users without Apple Watch
**Solution:**
- Extract basic sleep (start/end times)
- Set `deep_sleep_minutes`, `rem_sleep_minutes`, `core_sleep_minutes` to `None`
- Use base formula (no deep sleep % component)
- Flag: `has_sleep_stages = False`

### 2. No HRV Device

**Scenario:** User has iPhone but no Apple Watch
**Solution:**
- Set `hrv_rmssd_sleep` to `None`
- Use base formula (redistributes HRV weight)
- Flag: `has_hrv = False`

### 3. Insufficient History for Consistency

**Scenario:** User has <7 nights of sleep data
**Solution:**
- Use available nights (minimum 3 required)
- Flag: `days_for_consistency = {actual_count}`
- If <3 nights: Set `bedtime_consistency_sd = None`, use neutral score

### 4. Naps

**Scenario:** Daytime sleep sessions appear in data
**Solution:**
- Filter: Only count sessions >3 hours starting between 6 PM - 2 AM
- Reject sessions starting 6 AM - 6 PM (daytime naps)

### 5. Multiple Devices

**Scenario:** User has both iPhone and Apple Watch
**Solution:**
- Prefer Apple Watch data (more accurate sleep stages)
- Check `sourceName` attribute in XML
- Deduplicate overlapping records (keep Apple Watch version)

---

## Testing

### Unit Test Example

```python
def test_sleep_extraction():
    """Test complete sleep extraction pipeline."""

    # Sample export.xml data
    export_path = 'tests/fixtures/apple_health_export.xml'

    sleep_records = parse_sleep_data(export_path)

    assert len(sleep_records) > 0

    # Check first record
    record = sleep_records[0]
    assert record.duration_hours > 0
    assert 0 <= record.sleep_efficiency <= 100
    assert record.sleep_score is not None
    assert record.sleep_score_version in ['hrv_enabled', 'base']

    # Check consistency calculation (if 7+ nights)
    if len(sleep_records) >= 7:
        last_record = sleep_records[-1]
        assert last_record.bedtime_consistency_sd is not None
        assert last_record.days_for_consistency == 7
```

---

## Output Format

### JSON Export

```json
{
  "date": "2025-11-08",
  "device_type": "apple_watch",
  "start_time": "2025-11-07T22:45:00",
  "end_time": "2025-11-08T06:15:00",
  "in_bed_time": "2025-11-07T22:30:00",
  "final_wake_time": "2025-11-08T06:15:00",

  "duration_hours": 7.5,
  "time_in_bed_hours": 7.75,
  "sleep_efficiency": 88.4,

  "deep_sleep_minutes": 78.0,
  "rem_sleep_minutes": 112.0,
  "core_sleep_minutes": 260.0,
  "awake_minutes": 22.0,

  "waso_minutes": 22.0,
  "sol_minutes": 15.0,
  "hrv_rmssd_sleep": 58.3,
  "avg_respiratory_rate": 14.2,

  "bedtime_consistency_sd": 18.5,
  "days_for_consistency": 7,

  "deep_sleep_percent": 17.3,

  "sleep_score": 82.3,
  "sleep_score_version": "hrv_enabled",

  "has_sleep_stages": true,
  "has_hrv": true
}
```

---

## Next Steps

1. Implement `parse_sleep_data()` in `backend/parsers/apple_health_parser.py`
2. Add sleep score calculation in `backend/scores/sleep_calculator.py`
3. Test with real Apple Health export.xml files
4. Validate extraction accuracy against Apple Health app display
5. Handle edge cases (missing data, multiple devices, naps)

---

## References

- See `/docs/algorithm/SLEEP-METRICS-SPECIFICATION.md` for sleep score formulas
- See `/docs/data-processing/SLEEP-SCORE-CALCULATION.md` for scoring implementation
- Apple HealthKit documentation: https://developer.apple.com/documentation/healthkit

---

**End of Apple Health Integration Guide**

Last Updated: November 8, 2025
