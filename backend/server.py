"""FastAPI Backend for Brain Score App."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import json
import pandas as pd
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
                    optimal_windows.append({
                        "start": window_rows.iloc[0]['window_start'],
                        "end": window_rows.iloc[-1]['window_end'],
                        "duration_minutes": len(window_rows) * 2.5,  # 2.5 min windows
                        "avg_lri": float(window_rows['lri'].mean()),
                        "quality": "excellent" if window_rows['lri'].mean() >= 85 else "very_good" if window_rows['lri'].mean() >= 75 else "good"
                    })
                    in_window = False
        
        # Close last window if still open
        if in_window:
            window_rows = windows_df.loc[window_start_idx:]
            optimal_windows.append({
                "start": window_rows.iloc[0]['window_start'],
                "end": window_rows.iloc[-1]['window_end'],
                "duration_minutes": len(window_rows) * 2.5,
                "avg_lri": float(window_rows['lri'].mean()),
                "quality": "excellent" if window_rows['lri'].mean() >= 85 else "very_good" if window_rows['lri'].mean() >= 75 else "good"
            })
        
        # Calculate time in state
        optimal_minutes = len(windows_df[windows_df['lri'] >= 70]) * 2.5
        moderate_minutes = len(windows_df[(windows_df['lri'] >= 40) & (windows_df['lri'] < 70)]) * 2.5
        low_minutes = len(windows_df[windows_df['lri'] < 40]) * 2.5
        
        # Component scores
        component_scores = {
            "alertness": float(windows_df['alertness'].mean()) if 'alertness' in windows_df.columns else 65.0,
            "focus": float(windows_df['focus'].mean()) if 'focus' in windows_df.columns else 58.0,
            "arousal_balance": float(windows_df['arousal_balance'].mean()) if 'arousal_balance' in windows_df.columns else 42.0
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
        
        return {
            "session_duration_minutes": session_data.get('session_duration_minutes', 0),
            "peak_lri": float(peak_row['lri']),
            "peak_timestamp": peak_row['window_start'],
            "avg_lri": float(windows_df['lri'].mean()),
            "median_lri": float(windows_df['lri'].median()),
            "std_dev": float(windows_df['lri'].std()),
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
            "lri_timeline": windows_df[['window_start', 'lri']].to_dict('records')[:50]  # First 50 points for chart
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sleep/last20")
async def get_sleep_last_20():
    """Get last 20 days of sleep data."""
    try:
        sleep_file = APPLE_HEALTH_DIR / "sleep_last_20_days.json"
        data = load_json(sleep_file)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workouts/last20")
async def get_workouts_last_20():
    """Get last 20 days of workout data."""
    try:
        workouts_file = APPLE_HEALTH_DIR / "workouts_last_20_days.json"
        data = load_json(workouts_file)
        return data
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
            
            return {
                "has_window": True,
                "window_start": latest_optimal['window_start'],
                "window_end": latest_optimal['window_end'],
                "quality": quality,
                "current_lri": float(latest_optimal['lri'])
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
            "peak_time": peak_time,
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
        
        return {
            "alertness": float(windows_df['alertness'].mean()) if 'alertness' in windows_df.columns else 65,
            "focus": float(windows_df['focus'].mean()) if 'focus' in windows_df.columns else 58,
            "arousal_balance": float(windows_df['arousal_balance'].mean()) if 'arousal_balance' in windows_df.columns else 42,
            "sparkline_data": {
                "alertness": recent_df['alertness'].tolist() if 'alertness' in recent_df.columns else [65] * 20,
                "focus": recent_df['focus'].tolist() if 'focus' in recent_df.columns else [58] * 20,
                "arousal": recent_df['arousal_balance'].tolist() if 'arousal_balance' in recent_df.columns else [42] * 20
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
        
        # Calculate components
        optimal_minutes = len(windows_df[windows_df['lri'] >= 70]) * 2.5
        total_minutes = len(windows_df) * 2.5
        neural_state = (optimal_minutes / total_minutes * 100) if total_minutes > 0 else 0
        
        sleep_score = latest_sleep.get('sleep_score', 75)
        consolidation = sleep_score
        
        behavior_alignment = 76  # Simplified
        
        brain_score = (neural_state * 0.4 + consolidation * 0.4 + behavior_alignment * 0.2)
        
        return {
            "brain_score": round(brain_score, 1),
            "components": {
                "neural_state": round(neural_state, 1),
                "consolidation": round(consolidation, 1),
                "behavior_alignment": round(behavior_alignment, 1)
            },
            "supporting_metrics": {
                "best_session_id": f"sess_{datetime.now().strftime('%Y-%m-%d')}_morning",
                "sleep_score": {"value": sleep_score, "version": "hrv_enabled"},
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
        return data[:days] if len(data) > days else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sleep/recent")
async def get_recent_sleep(days: int = 7):
    """Get recent sleep records."""
    try:
        sleep_file = APPLE_HEALTH_DIR / "sleep_last_20_days.json"
        data = load_json(sleep_file)
        return {"sleep_records": data[:days] if len(data) > days else data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
