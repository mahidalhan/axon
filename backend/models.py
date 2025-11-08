"""
MongoDB models for Brain Score application.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, date
from uuid import uuid4


def generate_uuid():
    return str(uuid4())


class User(BaseModel):
    id: str = Field(default_factory=generate_uuid, alias="_id")
    email: str
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class LRIScore(BaseModel):
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    timestamp: datetime
    lri: float  # 0-100
    alertness: float
    focus: float
    arousal_balance: float
    status: str  # 'optimal', 'moderate', 'low'
    post_exercise_window: bool = False
    window_remaining_minutes: int = 0

    class Config:
        populate_by_name = True


class SleepRecord(BaseModel):
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    date: date
    sleep_score: float  # 0-100
    total_sleep_min: float
    deep_sleep_min: float
    deep_sleep_pct: float
    rem_sleep_min: float
    rem_sleep_pct: float
    core_sleep_min: float
    efficiency: float
    awake_min: float
    components: Dict[str, float]

    class Config:
        populate_by_name = True
        json_encoders = {date: lambda v: v.isoformat()}


class DNOSScore(BaseModel):
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    date: date
    dnos: float  # 0-100
    avg_lri: float
    optimal_window_utilization: float
    sleep_consolidation: float
    insights: List[str]

    class Config:
        populate_by_name = True
        json_encoders = {date: lambda v: v.isoformat()}


class BrainScore(BaseModel):
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    period_start: date
    period_end: date
    brain_score: float  # 0-100
    cycle_completion_score: float
    complete_cycles: int
    baseline_capacity_score: float
    morning_lri_avg: float
    efficiency_trend_score: float
    improvement_pct: float
    vagus_health_score: float
    exercise_days: int
    interpretation: str
    recommendations: List[str]

    class Config:
        populate_by_name = True
        json_encoders = {date: lambda v: v.isoformat()}
