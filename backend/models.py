from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Supplement(BaseModel):
    name: str
    dosage: float
    unit: str
    time_taken: str
    category: str
    icon: str = "💊"

class DailySupplements(BaseModel):
    user_id: str = "demo_user"
    date: str
    supplements: List[Supplement]
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class SupplementLibraryItem(BaseModel):
    name: str
    icon: str
    dosage: float
    unit: str
    category: str
    timing: str
    benefits: List[str]

# Predefined supplement library
SUPPLEMENT_LIBRARY = [
    {
        "name": "Creatine",
        "icon": "💊",
        "dosage": 5,
        "unit": "g",
        "category": "performance",
        "timing": "Morning",
        "benefits": ["Cognitive energy", "Neuroprotection"]
    },
    {
        "name": "Alpha-GPC",
        "icon": "🧠",
        "dosage": 300,
        "unit": "mg",
        "category": "nootropic",
        "timing": "Morning",
        "benefits": ["Focus", "Acetylcholine boost"]
    },
    {
        "name": "L-Theanine",
        "icon": "🍵",
        "dosage": 200,
        "unit": "mg",
        "category": "nootropic",
        "timing": "As needed",
        "benefits": ["Calm focus", "Reduces anxiety"]
    },
    {
        "name": "Magnesium L-Threonate",
        "icon": "💤",
        "dosage": 144,
        "unit": "mg",
        "category": "recovery",
        "timing": "Evening",
        "benefits": ["Sleep quality", "Memory"]
    },
    {
        "name": "Omega-3",
        "icon": "🐟",
        "dosage": 1000,
        "unit": "mg",
        "category": "foundation",
        "timing": "With meals",
        "benefits": ["Brain structure", "Anti-inflammation"]
    },
    {
        "name": "Caffeine",
        "icon": "☕",
        "dosage": 100,
        "unit": "mg",
        "category": "performance",
        "timing": "Morning",
        "benefits": ["Alertness", "Focus boost"]
    },
]
