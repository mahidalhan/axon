"""FastAPI Backend for Brain Score App."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import json
import pandas as pd
import math
from pathlib import Path
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Brain Score API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data paths
DATA_DIR = Path("/app/data/processed")
MUSE_DIR = DATA_DIR / "muse"
APPLE_HEALTH_DIR = DATA_DIR / "apple_health"

# Request models
class SessionAnalyzeRequest(BaseModel):
    participant_id: int = 0
    max_hours: float = 1.0

# Helper functions
def load_json(file_path: Path) -> Any:
    """Load JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)

def load_parquet(file_path: Path) -> pd.DataFrame:
    """Load Parquet file."""
    return pd.read_parquet(file_path)

def get_muse_session_data(participant_id: int) -> Dict:
    """Get Muse session data for a participant."""
    session_file = MUSE_DIR / f"participant_museData{participant_id}_session.json"
    if not session_file.exists():
        raise HTTPException(status_code=404, detail=f"Participant {participant_id} not found")
    return load_json(session_file)

def get_muse_windows_data(participant_id: int) -> pd.DataFrame:
    """Get Muse windows data for a participant."""
    windows_file = MUSE_DIR / f"participant_museData{participant_id}_windows.parquet"
    if not windows_file.exists():
        raise HTTPException(status_code=404, detail=f"Windows data for participant {participant_id} not found")
    return load_parquet(windows_file)

# Endpoints

@app.get("/")
async def root():
    return {"message": "Brain Score API", "status": "running"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/session/analyze")
async def analyze_session(request: SessionAnalyzeRequest):
    """Analyze a Muse EEG session."""
    try:
        session_data = get_muse_session_data(request.participant_id)
        windows_df = get_muse_windows_data(request.participant_id)
        
        # Calculate session metrics from windows data
        if len(windows_df) == 0:
            raise HTTPException(status_code=400, detail="No windows data available")
        
        # Get LRI values
        lri_values = windows_df['lri'].values
        
        # Find optimal windows (LRI >= 70)
        optimal_threshold = 70
        optimal_windows = []
        
        in_window = False
        window_start_idx = 0
        
        for idx, row in windows_df.iterrows():
            if row['lri'] >= optimal_threshold:
                if not in_window:
                    window_start_idx = idx
                    in_window = True
            else:
                if in_window:
                    window_rows = windows_df.loc[window_start_idx:idx-1]
                    start_time = window_rows.iloc[0]['window_start']
                    end_time = window_rows.iloc[-1]['window_end']
                    optimal_windows.append({
                        "start": start_time.isoformat() if hasattr(start_time, 'isoformat') else str(start_time),
                        "end": end_time.isoformat() if hasattr(end_time, 'isoformat') else str(end_time),
                        "duration_minutes": len(window_rows) * 2.5,  # 2.5 min windows
                        "avg_lri": float(window_rows['lri'].mean()),
                        "quality": "excellent" if window_rows['lri'].mean() >= 85 else "very_good" if window_rows['lri'].mean() >= 75 else "good"
                    })
                    in_window = False
        
        # Close last window if still open
        if in_window:
            window_rows = windows_df.loc[window_start_idx:]
            start_time = window_rows.iloc[0]['window_start']
            end_time = window_rows.iloc[-1]['window_end']
            optimal_windows.append({
                "start": start_time.isoformat() if hasattr(start_time, 'isoformat') else str(start_time),
                "end": end_time.isoformat() if hasattr(end_time, 'isoformat') else str(end_time),
                "duration_minutes": len(window_rows) * 2.5,
                "avg_lri": float(window_rows['lri'].mean()),
                "quality": "excellent" if window_rows['lri'].mean() >= 85 else "very_good" if window_rows['lri'].mean() >= 75 else "good"
            })
        
        # Calculate time in state
        optimal_minutes = len(windows_df[windows_df['lri'] >= 70]) * 2.5
        moderate_minutes = len(windows_df[(windows_df['lri'] >= 40) & (windows_df['lri'] < 70)]) * 2.5
        low_minutes = len(windows_df[windows_df['lri'] < 40]) * 2.5
        
        # Component scores - handle NaN values
        def safe_mean(series, default):
            if series.empty:
                return default
            mean_val = series.mean()
            return float(mean_val) if not pd.isna(mean_val) else default
        
        component_scores = {
            "alertness": safe_mean(windows_df.get('alertness', pd.Series()), 65.0),
            "focus": safe_mean(windows_df.get('focus', pd.Series()), 58.0),
            "arousal_balance": safe_mean(windows_df.get('arousal_balance', pd.Series()), 42.0)
        }
        
        # Session score (weighted by time in optimal state)
        session_score = (optimal_minutes / (optimal_minutes + moderate_minutes + low_minutes) * 100) if (optimal_minutes + moderate_minutes + low_minutes) > 0 else 0
        
        peak_idx = windows_df['lri'].idxmax()
        peak_row = windows_df.loc[peak_idx]
        
        # Generate insights
        insights = [
            f"Peak LRI of {peak_row['lri']:.1f} reached",
            f"You maintained optimal state for {optimal_minutes:.0f} minutes ({(optimal_minutes/(optimal_minutes+moderate_minutes+low_minutes)*100):.0f}% of session)" if optimal_minutes > 0 else "Consider timing session after exercise for better results",
            "Your focus metrics are strong" if component_scores['focus'] > 60 else "Try reducing distractions during session"
        ]
        
        recommendations = [
            "Schedule deep work during optimal windows" if len(optimal_windows) > 0 else "Try measuring after morning workout",
            "Optimal windows typically occur 1-3 hours post-exercise"
        ]
        
        # Prepare timeline data with proper serialization
        timeline_data = []
        for _, row in windows_df[['window_start', 'lri']].head(50).iterrows():
            timeline_data.append({
                'window_start': row['window_start'].isoformat() if hasattr(row['window_start'], 'isoformat') else str(row['window_start']),
                'lri': float(row['lri']) if not pd.isna(row['lri']) else 0.0
            })
        
        return {
            "session_duration_minutes": session_data.get('session_duration_minutes', 0),
            "peak_lri": float(peak_row['lri']) if not pd.isna(peak_row['lri']) else 0.0,
            "peak_timestamp": peak_row['window_start'].isoformat() if hasattr(peak_row['window_start'], 'isoformat') else str(peak_row['window_start']),
            "avg_lri": float(windows_df['lri'].mean()) if not pd.isna(windows_df['lri'].mean()) else 0.0,
            "median_lri": float(windows_df['lri'].median()) if not pd.isna(windows_df['lri'].median()) else 0.0,
            "std_dev": float(windows_df['lri'].std()) if not pd.isna(windows_df['lri'].std()) else 0.0,
            "optimal_windows": optimal_windows,
            "time_in_state": {
                "optimal_minutes": round(optimal_minutes, 2),
                "moderate_minutes": round(moderate_minutes, 2),
                "low_minutes": round(low_minutes, 2)
            },
            "component_scores": component_scores,
            "session_score": round(session_score, 1),
            "insights": insights,
            "recommendations": recommendations,
            "lri_timeline": timeline_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sleep/last20")
async def get_sleep_last_20():
    """Get last 20 days of sleep data."""
    try:
        sleep_file = APPLE_HEALTH_DIR / "sleep_last_20_days.json"
        data = load_json(sleep_file)
        
        # Sanitize NaN values
        def sanitize(obj):
            if isinstance(obj, float):
                if pd.isna(obj) or not math.isfinite(obj):
                    return None
                return obj
            elif isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize(item) for item in obj]
            return obj
        
        return sanitize(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workouts/last20")
async def get_workouts_last_20():
    """Get last 20 days of workout data."""
    try:
        workouts_file = APPLE_HEALTH_DIR / "workouts_last_20_days.json"
        data = load_json(workouts_file)
        
        # Sanitize NaN values
        def sanitize(obj):
            if isinstance(obj, float):
                if pd.isna(obj) or not math.isfinite(obj):
                    return None
                return obj
            elif isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize(item) for item in obj]
            return obj
        
        return sanitize(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session/optimal-window-status")
async def get_optimal_window_status(participant_id: int = 0):
    """Get current optimal window status."""
    try:
        session_data = get_muse_session_data(participant_id)
        windows_df = get_muse_windows_data(participant_id)
        
        # For demo, return latest optimal window
        optimal_rows = windows_df[windows_df['lri'] >= 70]
        
        if len(optimal_rows) > 0:
            latest_optimal = optimal_rows.iloc[-1]
            quality = "excellent" if latest_optimal['lri'] >= 85 else "very_good" if latest_optimal['lri'] >= 75 else "good"
            
            window_start = latest_optimal['window_start']
            window_end = latest_optimal['window_end']
            
            return {
                "has_window": True,
                "window_start": window_start.isoformat() if hasattr(window_start, 'isoformat') else str(window_start),
                "window_end": window_end.isoformat() if hasattr(window_end, 'isoformat') else str(window_end),
                "quality": quality,
                "current_lri": float(latest_optimal['lri']) if not pd.isna(latest_optimal['lri']) else 0.0
            }
        
        return {
            "has_window": False,
            "quality": "none",
            "message": "No optimal window currently"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session/today-summary")
async def get_today_summary(participant_id: int = 0):
    """Get today's session summary."""
    try:
        windows_df = get_muse_windows_data(participant_id)
        
        peak_lri = float(windows_df['lri'].max())
        peak_idx = windows_df['lri'].idxmax()
        peak_time = windows_df.loc[peak_idx, 'window_start']
        
        optimal_minutes = len(windows_df[windows_df['lri'] >= 70]) * 2.5
        total_minutes = len(windows_df) * 2.5
        optimal_percentage = (optimal_minutes / total_minutes * 100) if total_minutes > 0 else 0
        
        session_score = optimal_percentage  # Simplified
        
        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "peak_lri": round(peak_lri, 1),
            "peak_time": peak_time.isoformat() if hasattr(peak_time, 'isoformat') else str(peak_time),
            "optimal_minutes": round(optimal_minutes, 1),
            "optimal_percentage": round(optimal_percentage, 1),
            "session_score": round(session_score, 1),
            "has_session_data": True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session/current-metrics")
async def get_current_metrics(participant_id: int = 0):
    """Get current session metrics."""
    try:
        windows_df = get_muse_windows_data(participant_id)
        
        # Get recent values (last 20 windows for sparkline)
        recent_df = windows_df.tail(20)
        
        def safe_mean(series, default):
            if series.empty:
                return default
            mean_val = series.mean()
            return float(mean_val) if not pd.isna(mean_val) else default
        
        def safe_list(series, default_val, count=20):
            if series.empty:
                return [default_val] * count
            result = []
            for val in series.tolist():
                result.append(float(val) if not pd.isna(val) else default_val)
            return result
        
        return {
            "alertness": safe_mean(windows_df.get('alertness', pd.Series()), 65),
            "focus": safe_mean(windows_df.get('focus', pd.Series()), 58),
            "arousal_balance": safe_mean(windows_df.get('arousal_balance', pd.Series()), 42),
            "sparkline_data": {
                "alertness": safe_list(recent_df.get('alertness', pd.Series()), 65),
                "focus": safe_list(recent_df.get('focus', pd.Series()), 58),
                "arousal": safe_list(recent_df.get('arousal_balance', pd.Series()), 42)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/brain-score/today")
async def get_brain_score_today(participant_id: int = 0):
    """Get today's brain score."""
    try:
        # Load session data
        windows_df = get_muse_windows_data(participant_id)
        
        # Load sleep data
        sleep_data = load_json(APPLE_HEALTH_DIR / "sleep_last_20_days.json")
        latest_sleep = sleep_data[0] if len(sleep_data) > 0 else {}
        
        # === 1. LEARNING READINESS (55%) - Session Score ===
        # Formula: 0.5 × avg_LRI + 0.3 × optimal_utilization + 0.2 × sleep_context
        
        avg_lri = float(windows_df['lri'].mean()) if not pd.isna(windows_df['lri'].mean()) else 0.0
        
        optimal_minutes = len(windows_df[windows_df['lri'] >= 70]) * 2.5
        total_minutes = len(windows_df) * 2.5
        optimal_utilization = (optimal_minutes / total_minutes * 100) if total_minutes > 0 else 0
        
        sleep_score_value = latest_sleep.get('sleep_score', 75)
        sleep_context = sleep_score_value  # Use sleep score as context
        
        # Session score calculation
        session_score = (
            0.50 * avg_lri +
            0.30 * optimal_utilization +
            0.20 * sleep_context
        )
        
        # Apply soft ceiling at 92 (Yerkes-Dodson inverted-U)
        learning_readiness = min(session_score, 92)
        
        # === 2. CONSOLIDATION (25%) - Sleep Score ===
        consolidation = sleep_score_value
        
        # === 3. BEHAVIOR ALIGNMENT (20%) ===
        # Baseline 50, +10 if post-exercise session, +5 per workout utilized
        # For demo: assume 1 workout, session was in optimal window
        behavior_alignment = 50 + 10 + 5  # = 65
        behavior_alignment = min(behavior_alignment, 95)  # Clamp
        
        # === BRAIN SCORE (NEUROPLASTICITY READINESS) ===
        brain_score = (
            learning_readiness * 0.55 +
            consolidation * 0.25 +
            behavior_alignment * 0.20
        )
        
        return {
            "brain_score": round(brain_score, 1),
            "components": {
                "learning_readiness": round(learning_readiness, 1),
                "consolidation": round(consolidation, 1),
                "behavior_alignment": round(behavior_alignment, 1)
            },
            "session_details": {
                "avg_lri": round(avg_lri, 1),
                "optimal_utilization": round(optimal_utilization, 1),
                "sleep_context": round(sleep_context, 1)
            },
            "supporting_metrics": {
                "best_session_id": f"sess_{datetime.now().strftime('%Y-%m-%d')}_morning",
                "sleep_score": {"value": sleep_score_value, "version": "hrv_enabled"},
                "workout_hits": 1
            },
            "insight": "Schedule deep work in the 2h window after your run."
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workouts/recent")
async def get_recent_workouts(days: int = 7):
    """Get recent workouts."""
    try:
        workouts_file = APPLE_HEALTH_DIR / "workouts_last_20_days.json"
        data = load_json(workouts_file)
        
        def sanitize(obj):
            if isinstance(obj, float):
                if pd.isna(obj) or not math.isfinite(obj):
                    return None
                return obj
            elif isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize(item) for item in obj]
            return obj
        
        result = data[:days] if len(data) > days else data
        return sanitize(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sleep/recent")
async def get_recent_sleep(days: int = 7):
    """Get recent sleep records."""
    try:
        sleep_file = APPLE_HEALTH_DIR / "sleep_last_20_days.json"
        data = load_json(sleep_file)
        
        def sanitize(obj):
            if isinstance(obj, float):
                if pd.isna(obj) or not math.isfinite(obj):
                    return None
                return obj
            elif isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize(item) for item in obj]
            return obj
        
        result = data[:days] if len(data) > days else data
        return {"sleep_records": sanitize(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session/context")
async def get_session_context(participant_id: int = 0):
    """Get contextual information about the session."""
    try:
        session_data = get_muse_session_data(participant_id)
        windows_df = get_muse_windows_data(participant_id)
        
        # Get workout data
        workout_data = load_json(APPLE_HEALTH_DIR / "workouts_last_20_days.json")
        latest_workout = workout_data[0] if len(workout_data) > 0 else None
        
        # Calculate post-exercise hours
        post_exercise_hours = None
        if latest_workout:
            session_start = datetime.fromisoformat(session_data['session_start'].replace('Z', '+00:00'))
            workout_end = datetime.fromisoformat(latest_workout['end_time'].replace('Z', '+00:00'))
            diff = session_start - workout_end
            post_exercise_hours = diff.total_seconds() / 3600
        
        # Count gamma peaks (LRI > 70)
        gamma_peaks = len(windows_df[windows_df['lri'] >= 70])
        
        # Calculate flow minutes
        flow_minutes = len(windows_df[windows_df['lri'] >= 70]) * 2.5
        
        # Determine circadian phase
        session_hour = datetime.fromisoformat(session_data['session_start'].replace('Z', '+00:00')).hour
        if 6 <= session_hour < 11:
            circadian_phase = 'morning_peak'
        elif 14 <= session_hour < 17:
            circadian_phase = 'afternoon_dip'
        elif 17 <= session_hour < 21:
            circadian_phase = 'evening_peak'
        else:
            circadian_phase = 'sleep'
        
        return {
            "participant_id": participant_id,
            "session_time": {
                "start": session_data['session_start'],
                "end": session_data['session_end'],
                "duration_minutes": session_data['session_duration_minutes']
            },
            "context": {
                "post_exercise_hours": round(post_exercise_hours, 1) if post_exercise_hours else None,
                "workout_type": latest_workout.get('workout_type', 'Unknown') if latest_workout else None,
                "circadian_phase": circadian_phase,
                "optimal_window": post_exercise_hours and 1 <= post_exercise_hours <= 4 if post_exercise_hours else False
            },
            "performance": {
                "peak_moments": gamma_peaks,
                "flow_minutes": round(flow_minutes, 1),
                "peak_lri": float(windows_df['lri'].max())
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session/daily-timeline")
async def get_daily_timeline(participant_id: int = 0):
    """Get full-day timeline data with circadian baseline."""
    try:
        session_data = get_muse_session_data(participant_id)
        windows_df = get_muse_windows_data(participant_id)
        
        # Get sleep data for wake/sleep times
        sleep_data = load_json(APPLE_HEALTH_DIR / "sleep_last_20_days.json")[0]
        workout_data = load_json(APPLE_HEALTH_DIR / "workouts_last_20_days.json")
        
        # Calculate circadian baseline (simplified)
        wake_time = 6.5  # 6:30 AM
        sleep_time = 22.0  # 10:00 PM
        
        baseline = []
        for h_idx in range(96):  # 15-min intervals for 24h
            h = h_idx * 0.25
            if h < wake_time or h > sleep_time:
                baseline.append(20)
            else:
                hours_awake = h - wake_time
                # Simplified circadian curve
                value = 40 + (30 * math.sin((hours_awake / 16) * math.pi))
                # Add morning boost
                if hours_awake < 4:
                    value += hours_awake * 8
                # Afternoon dip
                if 6 < hours_awake < 9:
                    value -= 15
                baseline.append(min(max(value, 30), 95))
        
        # Extract measured session data
        session_start = datetime.fromisoformat(session_data['session_start'].replace('Z', '+00:00'))
        start_hour = session_start.hour + session_start.minute / 60
        
        measured_lri = []
        for idx, row in windows_df.iterrows():
            measured_lri.append({
                "hour": start_hour + (idx * 2.5 / 60),  # 2.5 min windows
                "lri": float(row['lri']) if not pd.isna(row['lri']) else None
            })
        
        # Get gamma peaks
        peaks = []
        for idx, row in windows_df[windows_df['lri'] >= 70].iterrows():
            peaks.append({
                "hour": start_hour + (idx * 2.5 / 60),
                "lri": float(row['lri']),
                "duration_min": 2.5
            })
        
        # Events
        events = [
            {"hour": wake_time, "type": "wake", "icon": "😴", "label": "Wake"},
        ]
        
        if len(workout_data) > 0:
            workout_time = datetime.fromisoformat(workout_data[0]['start_time'].replace('Z', '+00:00'))
            events.append({
                "hour": workout_time.hour + workout_time.minute / 60,
                "type": "workout",
                "icon": "🏃",
                "label": "Run"
            })
        
        return {
            "date": session_start.strftime("%Y-%m-%d"),
            "user_schedule": {
                "wake_time": wake_time,
                "sleep_time": sleep_time
            },
            "circadian_baseline": baseline,
            "measured_session": {
                "start_hour": start_hour,
                "end_hour": start_hour + (session_data['session_duration_minutes'] / 60),
                "lri_values": measured_lri
            },
            "gamma_peaks": peaks,
            "events": events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
