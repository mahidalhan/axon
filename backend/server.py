"""
Brain Score FastAPI Server
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, date
from typing import List, Optional
import os
from dotenv import load_dotenv

from models import User, LRIScore, SleepRecord, DNOSScore, BrainScore
from processors.synthetic_generator import SyntheticJourneyGenerator

load_dotenv()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/brain_score")
db_client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global db_client, db
    db_client = AsyncIOMotorClient(MONGO_URL)
    db = db_client.get_database()
    print(f"✓ Connected to MongoDB: {MONGO_URL}")
    
    # Create default user if not exists
    existing_user = await db.users.find_one({"email": "demo@brainscore.app"})
    if not existing_user:
        demo_user = User(
            email="demo@brainscore.app",
            name="Demo User"
        )
        await db.users.insert_one(demo_user.model_dump(by_alias=True))
        print("✓ Created demo user")
    
    yield
    
    # Shutdown
    if db_client:
        db_client.close()
        print("✓ Closed MongoDB connection")

app = FastAPI(title="Brain Score API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to get demo user
async def get_demo_user():
    user = await db.users.find_one({"email": "demo@brainscore.app"})
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found")
    return user


@app.get("/")
async def root():
    return {
        "message": "Brain Score API",
        "version": "1.0.0",
        "endpoints": {
            "demo": "/api/demo/generate",
            "lri": "/api/lri/current",
            "dnos": "/api/dnos/today",
            "brain_score": "/api/brain-score/current",
            "sleep": "/api/sleep/recent"
        }
    }


@app.post("/api/demo/generate")
async def generate_demo_data():
    """
    Generate 28 days of synthetic data for demo user.
    """
    try:
        user = await get_demo_user()
        user_id = user["_id"]
        
        # Clear existing data
        await db.lri_scores.delete_many({"user_id": user_id})
        await db.sleep_records.delete_many({"user_id": user_id})
        await db.dnos_scores.delete_many({"user_id": user_id})
        await db.brain_scores.delete_many({"user_id": user_id})
        
        # Generate synthetic journey
        generator = SyntheticJourneyGenerator(user_id)
        journey = generator.generate_28_day_journey(improvement_trend=True)
        
        # Insert LRI samples
        lri_docs = []
        for sample in journey['lri_samples']:
            doc = LRIScore(
                user_id=user_id,
                timestamp=sample['timestamp'],
                lri=sample['lri'],
                alertness=sample['alertness'],
                focus=sample['focus'],
                arousal_balance=sample['arousal_balance'],
                status=sample['status'],
                post_exercise_window=sample.get('post_exercise_window', False),
                window_remaining_minutes=sample.get('window_remaining_minutes', 0)
            )
            lri_docs.append(doc.model_dump(by_alias=True))
        
        if lri_docs:
            await db.lri_scores.insert_many(lri_docs)
        
        # Insert sleep records
        sleep_docs = []
        for record in journey['sleep_records']:
            doc = SleepRecord(
                user_id=user_id,
                date=record['date'],
                sleep_score=record['sleep_score'],
                total_sleep_min=record['total_sleep_min'],
                deep_sleep_min=record['deep_sleep_min'],
                deep_sleep_pct=record['deep_sleep_pct'],
                rem_sleep_min=record['rem_sleep_min'],
                rem_sleep_pct=record['rem_sleep_pct'],
                core_sleep_min=record['core_sleep_min'],
                efficiency=record['efficiency'],
                awake_min=record['awake_min'],
                components=record['components']
            )
            sleep_docs.append(doc.model_dump(by_alias=True))
        
        if sleep_docs:
            await db.sleep_records.insert_many(sleep_docs)
        
        # Insert DNOS scores
        dnos_docs = []
        for dnos in journey['dnos_scores']:
            doc = DNOSScore(
                user_id=user_id,
                date=dnos['date'],
                dnos=dnos['dnos'],
                avg_lri=dnos['avg_lri'],
                optimal_window_utilization=dnos['optimal_window_utilization'],
                sleep_consolidation=dnos['sleep_consolidation'],
                insights=dnos['insights']
            )
            dnos_docs.append(doc.model_dump(by_alias=True))
        
        if dnos_docs:
            await db.dnos_scores.insert_many(dnos_docs)
        
        # Insert Brain Score
        bs = journey['brain_score']
        brain_score_doc = BrainScore(
            user_id=user_id,
            period_start=bs['period_start'],
            period_end=bs['period_end'],
            brain_score=bs['brain_score'],
            cycle_completion_score=bs['cycle_completion_score'],
            complete_cycles=bs['complete_cycles'],
            baseline_capacity_score=bs['baseline_capacity_score'],
            morning_lri_avg=bs['morning_lri_avg'],
            efficiency_trend_score=bs['efficiency_trend_score'],
            improvement_pct=bs['improvement_pct'],
            vagus_health_score=bs['vagus_health_score'],
            exercise_days=bs['exercise_days'],
            interpretation=bs['interpretation'],
            recommendations=bs['recommendations']
        )
        await db.brain_scores.insert_one(brain_score_doc.model_dump(by_alias=True))
        
        return {
            "success": True,
            "message": "28-day synthetic journey generated",
            "stats": {
                "lri_samples": len(lri_docs),
                "sleep_records": len(sleep_docs),
                "dnos_scores": len(dnos_docs),
                "brain_score": bs['brain_score']
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/lri/current")
async def get_current_lri():
    """
    Get the most recent LRI score.
    """
    try:
        user = await get_demo_user()
        user_id = user["_id"]
        
        lri = await db.lri_scores.find_one(
            {"user_id": user_id},
            sort=[("timestamp", -1)]
        )
        
        if not lri:
            raise HTTPException(status_code=404, detail="No LRI data found")
        
        return {
            "lri": lri["lri"],
            "timestamp": lri["timestamp"].isoformat(),
            "components": {
                "alertness": lri["alertness"],
                "focus": lri["focus"],
                "arousal_balance": lri["arousal_balance"]
            },
            "status": lri["status"],
            "post_exercise_window": lri.get("post_exercise_window", False),
            "window_remaining_minutes": lri.get("window_remaining_minutes", 0)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/lri/recent")
async def get_recent_lri(hours: int = 12):
    """
    Get LRI samples from the last N hours.
    """
    try:
        user = await get_demo_user()
        user_id = user["_id"]
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        cursor = db.lri_scores.find(
            {"user_id": user_id, "timestamp": {"$gte": cutoff_time}},
            sort=[("timestamp", 1)]
        )
        
        samples = []
        async for lri in cursor:
            samples.append({
                "lri": lri["lri"],
                "timestamp": lri["timestamp"].isoformat(),
                "components": {
                    "alertness": lri["alertness"],
                    "focus": lri["focus"],
                    "arousal_balance": lri["arousal_balance"]
                },
                "status": lri["status"]
            })
        
        return {"samples": samples, "count": len(samples)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dnos/today")
async def get_today_dnos():
    """
    Get today's DNOS score.
    """
    try:
        user = await get_demo_user()
        user_id = user["_id"]
        
        # Get most recent DNOS
        dnos = await db.dnos_scores.find_one(
            {"user_id": user_id},
            sort=[("date", -1)]
        )
        
        if not dnos:
            raise HTTPException(status_code=404, detail="No DNOS data found")
        
        # Get corresponding sleep data
        sleep = await db.sleep_records.find_one(
            {"user_id": user_id, "date": dnos["date"]}
        )
        
        return {
            "date": dnos["date"].isoformat(),
            "dnos": dnos["dnos"],
            "components": {
                "avg_lri": dnos["avg_lri"],
                "optimal_window_utilization": dnos["optimal_window_utilization"],
                "sleep_consolidation": dnos["sleep_consolidation"]
            },
            "sleep_details": {
                "sleep_score": sleep["sleep_score"] if sleep else 0,
                "deep_sleep_pct": sleep["deep_sleep_pct"] if sleep else 0,
                "rem_pct": sleep["rem_sleep_pct"] if sleep else 0,
                "efficiency": sleep["efficiency"] if sleep else 0
            } if sleep else None,
            "insights": dnos.get("insights", [])
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dnos/history")
async def get_dnos_history(days: int = 7):
    """
    Get DNOS history for the last N days.
    """
    try:
        user = await get_demo_user()
        user_id = user["_id"]
        
        cursor = db.dnos_scores.find(
            {"user_id": user_id},
            sort=[("date", -1)],
            limit=days
        )
        
        history = []
        async for dnos in cursor:
            history.append({
                "date": dnos["date"].isoformat(),
                "dnos": dnos["dnos"],
                "avg_lri": dnos["avg_lri"],
                "insights": dnos.get("insights", [])
            })
        
        history.reverse()  # Oldest to newest
        return {"history": history, "count": len(history)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/brain-score/current")
async def get_current_brain_score():
    """
    Get the current 28-day Brain Score.
    """
    try:
        user = await get_demo_user()
        user_id = user["_id"]
        
        brain_score = await db.brain_scores.find_one(
            {"user_id": user_id},
            sort=[("period_end", -1)]
        )
        
        if not brain_score:
            raise HTTPException(status_code=404, detail="No Brain Score data found")
        
        return {
            "brain_score": brain_score["brain_score"],
            "period": {
                "start": brain_score["period_start"].isoformat(),
                "end": brain_score["period_end"].isoformat()
            },
            "interpretation": brain_score["interpretation"],
            "components": {
                "cycle_completion": {
                    "score": brain_score["cycle_completion_score"],
                    "complete_cycles": brain_score["complete_cycles"]
                },
                "baseline_capacity": {
                    "score": brain_score["baseline_capacity_score"],
                    "morning_lri_avg": brain_score["morning_lri_avg"]
                },
                "efficiency_trend": {
                    "score": brain_score["efficiency_trend_score"],
                    "improvement_pct": brain_score["improvement_pct"]
                },
                "vagus_health": {
                    "score": brain_score["vagus_health_score"],
                    "exercise_days": brain_score["exercise_days"]
                }
            },
            "recommendations": brain_score["recommendations"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sleep/recent")
async def get_recent_sleep(days: int = 7):
    """
    Get sleep records for the last N days.
    """
    try:
        user = await get_demo_user()
        user_id = user["_id"]
        
        cursor = db.sleep_records.find(
            {"user_id": user_id},
            sort=[("date", -1)],
            limit=days
        )
        
        records = []
        async for sleep in cursor:
            records.append({
                "date": sleep["date"].isoformat(),
                "sleep_score": sleep["sleep_score"],
                "total_sleep_min": sleep["total_sleep_min"],
                "deep_sleep_pct": sleep["deep_sleep_pct"],
                "deep_sleep_min": sleep["deep_sleep_min"],
                "rem_pct": sleep["rem_sleep_pct"],
                "rem_min": sleep["rem_sleep_min"],
                "efficiency": sleep["efficiency"]
            })
        
        records.reverse()  # Oldest to newest
        return {"records": records, "count": len(records)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
