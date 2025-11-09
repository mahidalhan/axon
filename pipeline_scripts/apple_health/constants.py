"""Constants for Apple Health sleep processing."""

from __future__ import annotations

from dataclasses import dataclass

SLEEP_RECORD_TYPE = "HKCategoryTypeIdentifierSleepAnalysis"
HRV_RECORD_TYPE = "HKQuantityTypeIdentifierHeartRateVariabilitySDNN"
RESP_RECORD_TYPE = "HKQuantityTypeIdentifierRespiratoryRate"
WORKOUT_ELEMENT = "Workout"

SLEEP_VALUES_IN_BED = {
    "HKCategoryValueSleepAnalysisInBed",
}

SLEEP_VALUES_ASLEEP = {
    "HKCategoryValueSleepAnalysisAsleep",
    "HKCategoryValueSleepAnalysisAsleepCore",
    "HKCategoryValueSleepAnalysisAsleepDeep",
    "HKCategoryValueSleepAnalysisAsleepREM",
}

SLEEP_VALUES_STAGE_MAP = {
    "HKCategoryValueSleepAnalysisAsleepDeep": "deep",
    "HKCategoryValueSleepAnalysisAsleepREM": "rem",
    "HKCategoryValueSleepAnalysisAsleepCore": "core",
    "HKCategoryValueSleepAnalysisAsleep": "core",
}

SLEEP_VALUE_AWAKE = "HKCategoryValueSleepAnalysisAwake"

# High-intensity workouts (used to flag post-exercise windows)
HIGH_INTENSITY_WORKOUTS = {
    "HKWorkoutActivityTypeRunning",
    "HKWorkoutActivityTypeCycling",
    "HKWorkoutActivityTypeHighIntensityIntervalTraining",
    "HKWorkoutActivityTypeTraditionalStrengthTraining",
    "HKWorkoutActivityTypeFunctionalStrengthTraining",
    "HKWorkoutActivityTypeRowing",
    "HKWorkoutActivityTypeSwimming",
}


@dataclass(frozen=True)
class SleepPipelineConfig:
    min_session_hours: float = 3.0
    start_hour_min: int = 18  # inclusive -> 6pm
    start_hour_max: int = 2   # inclusive -> 2am next day
    consistency_window_days: int = 7

