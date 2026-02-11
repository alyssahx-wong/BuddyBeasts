"""
BuddyBeasts / Gatherlings — FastAPI Backend
==========================================
PostgreSQL-backed (Neon) backend that mirrors every feature of the React frontend.
Run:  python main.py          → http://localhost:8000/docs
"""

from __future__ import annotations

import math
import random
import secrets
import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models


# ── Seed Data ────────────────────────────────────────────────────────────────

SEED_HUBS = [
    {
        "id": "hub_campus_main",
        "name": "Main Campus Hub",
        "location": "University Campus",
        "lat": 43.6532,
        "lng": -79.3832,
    },
    {
        "id": "hub_downtown",
        "name": "Downtown Community",
        "location": "Downtown Core",
        "lat": 43.6426,
        "lng": -79.3871,
    },
    {
        "id": "hub_eastside",
        "name": "East Side Neighborhood",
        "location": "East Toronto",
        "lat": 43.6629,
        "lng": -79.3506,
    },
    {
        "id": "hub_westend",
        "name": "West End Village",
        "location": "West Toronto",
        "lat": 43.6476,
        "lng": -79.4163,
    },
]

SEED_TEMPLATES = [
    {
        "id": "coffee_chat",
        "title": "Coffee Chat",
        "description": "Meet for a casual 20-min coffee conversation",
        "duration": 20,
        "min_participants": 2,
        "max_participants": 3,
        "difficulty": "easy",
        "crystals": 50,
        "icon": "\u2615",
        "type": "coffee_chat",
        "tags": ["casual", "short", "indoor"],
    },
    {
        "id": "study_jam",
        "title": "Study Jam",
        "description": "Group study session with focused work time",
        "duration": 60,
        "min_participants": 3,
        "max_participants": 5,
        "difficulty": "medium",
        "crystals": 100,
        "icon": "\U0001F4DA",
        "type": "study_jam",
        "tags": ["productive", "medium", "indoor"],
    },
    {
        "id": "sunset_walk",
        "title": "Sunset Walk",
        "description": "Evening stroll around the neighborhood",
        "duration": 30,
        "min_participants": 2,
        "max_participants": 4,
        "difficulty": "easy",
        "crystals": 75,
        "icon": "\U0001F305",
        "type": "sunset_walk",
        "tags": ["outdoor", "relaxing", "evening"],
    },
    {
        "id": "help_neighbor",
        "title": "Help a Neighbor",
        "description": "Quick task helping someone in the community",
        "duration": 15,
        "min_participants": 2,
        "max_participants": 2,
        "difficulty": "easy",
        "crystals": 60,
        "icon": "\U0001F91D",
        "type": "help_neighbor",
        "tags": ["volunteer", "short", "community"],
    },
    {
        "id": "lunch_crew",
        "title": "Lunch Crew",
        "description": "Grab lunch together and share stories",
        "duration": 45,
        "min_participants": 3,
        "max_participants": 6,
        "difficulty": "easy",
        "crystals": 80,
        "icon": "\U0001F371",
        "type": "lunch_crew",
        "tags": ["food", "social", "medium"],
    },
    {
        "id": "game_night",
        "title": "Game Night Setup",
        "description": "Organize a board game or video game session",
        "duration": 90,
        "min_participants": 4,
        "max_participants": 8,
        "difficulty": "hard",
        "crystals": 150,
        "icon": "\U0001F3AE",
        "type": "game_night",
        "tags": ["fun", "long", "indoor"],
    },
    {
        "id": "morning_workout",
        "title": "Morning Workout",
        "description": "Start the day with group exercise",
        "duration": 40,
        "min_participants": 2,
        "max_participants": 6,
        "difficulty": "medium",
        "crystals": 90,
        "icon": "\U0001F4AA",
        "type": "morning_workout",
        "tags": ["fitness", "morning", "outdoor"],
    },
    {
        "id": "art_cafe",
        "title": "Art Caf\u00e9",
        "description": "Creative session with drawing or crafts",
        "duration": 60,
        "min_participants": 3,
        "max_participants": 5,
        "difficulty": "medium",
        "crystals": 110,
        "icon": "\U0001F3A8",
        "type": "art_cafe",
        "tags": ["creative", "indoor", "relaxing"],
    },
    {
        "id": "board_game_night",
        "title": "Board Game Night",
        "description": "Gather for a fun evening of board games and snacks",
        "duration": 120,
        "min_participants": 3,
        "max_participants": 6,
        "difficulty": "easy",
        "crystals": 150,
        "icon": "\U0001F3B2",
        "type": "board_game",
        "tags": ["indoor", "social", "evening", "games"],
    },
    {
        "id": "cooking_together",
        "title": "Cooking Together",
        "description": "Learn to cook a new recipe and share a meal together",
        "duration": 90,
        "min_participants": 2,
        "max_participants": 4,
        "difficulty": "medium",
        "crystals": 125,
        "icon": "\U0001F468\u200D\U0001F373",
        "type": "cooking",
        "tags": ["indoor", "creative", "food", "skill-building"],
    },
    {
        "id": "photo_walk",
        "title": "Photography Walk",
        "description": "Explore the neighborhood and practice photography skills",
        "duration": 60,
        "min_participants": 2,
        "max_participants": 5,
        "difficulty": "easy",
        "crystals": 80,
        "icon": "\U0001F4F8",
        "type": "photo_walk",
        "tags": ["outdoor", "creative", "exploration", "art"],
    },
    {
        "id": "karaoke_session",
        "title": "Karaoke Session",
        "description": "Sing your heart out with friends at a karaoke spot",
        "duration": 90,
        "min_participants": 3,
        "max_participants": 8,
        "difficulty": "easy",
        "crystals": 110,
        "icon": "\U0001F3A4",
        "type": "karaoke",
        "tags": ["indoor", "social", "music", "fun"],
    },
    {
        "id": "hiking_adventure",
        "title": "Hiking Adventure",
        "description": "Challenge yourselves with a scenic hiking trail",
        "duration": 180,
        "min_participants": 3,
        "max_participants": 8,
        "difficulty": "hard",
        "crystals": 200,
        "icon": "\u26F0\uFE0F",
        "type": "hiking",
        "tags": ["outdoor", "active", "nature", "adventure"],
    },
    {
        "id": "book_club",
        "title": "Book Club Meeting",
        "description": "Discuss the latest book club selection over tea",
        "duration": 75,
        "min_participants": 3,
        "max_participants": 8,
        "difficulty": "easy",
        "crystals": 95,
        "icon": "\U0001F4D6",
        "type": "book_club",
        "tags": ["indoor", "intellectual", "social", "reading"],
    },
    {
        "id": "movie_night",
        "title": "Movie Night",
        "description": "Watch a movie together and discuss afterwards",
        "duration": 150,
        "min_participants": 3,
        "max_participants": 10,
        "difficulty": "easy",
        "crystals": 90,
        "icon": "\U0001F3AC",
        "type": "movie",
        "tags": ["indoor", "social", "evening", "entertainment"],
    },
    {
        "id": "beach_cleanup",
        "title": "Beach Cleanup",
        "description": "Help clean up the local beach and protect the environment",
        "duration": 90,
        "min_participants": 4,
        "max_participants": 12,
        "difficulty": "medium",
        "crystals": 140,
        "icon": "\U0001F3D6\uFE0F",
        "type": "volunteer",
        "tags": ["outdoor", "volunteer", "environment", "community"],
    },
    {
        "id": "yoga_session",
        "title": "Group Yoga",
        "description": "Relaxing group yoga session in the park",
        "duration": 60,
        "min_participants": 3,
        "max_participants": 10,
        "difficulty": "easy",
        "crystals": 85,
        "icon": "\U0001F9D8",
        "type": "fitness",
        "tags": ["outdoor", "wellness", "relaxing", "health"],
    },
    {
        "id": "trivia_night",
        "title": "Trivia Night",
        "description": "Test your knowledge at a local trivia competition",
        "duration": 120,
        "min_participants": 3,
        "max_participants": 6,
        "difficulty": "medium",
        "crystals": 130,
        "icon": "\U0001F9E0",
        "type": "trivia",
        "tags": ["indoor", "social", "intellectual", "competitive"],
    },
    {
        "id": "poetry_slam",
        "title": "Poetry Slam",
        "description": "Share poems and creative writing with the group",
        "duration": 75,
        "min_participants": 3,
        "max_participants": 10,
        "difficulty": "easy",
        "crystals": 95,
        "icon": "\U0001F4DD",
        "type": "poetry",
        "tags": ["indoor", "creative", "social", "art"],
    },
    {
        "id": "bike_ride",
        "title": "Group Bike Ride",
        "description": "Explore the city on two wheels together",
        "duration": 90,
        "min_participants": 3,
        "max_participants": 8,
        "difficulty": "medium",
        "crystals": 115,
        "icon": "\U0001F6B4",
        "type": "biking",
        "tags": ["outdoor", "active", "exploration", "fitness"],
    },
    {
        "id": "picnic_park",
        "title": "Picnic in the Park",
        "description": "Bring snacks and enjoy outdoor time together",
        "duration": 90,
        "min_participants": 3,
        "max_participants": 10,
        "difficulty": "easy",
        "crystals": 85,
        "icon": "\U0001F9FA",
        "type": "picnic",
        "tags": ["outdoor", "social", "food", "relaxing"],
    },
    {
        "id": "skill_swap",
        "title": "Skill Swap Workshop",
        "description": "Teach and learn new skills from each other",
        "duration": 60,
        "min_participants": 3,
        "max_participants": 6,
        "difficulty": "medium",
        "crystals": 105,
        "icon": "\U0001F4A1",
        "type": "learning",
        "tags": ["indoor", "skill-building", "collaborative", "educational"],
    },
    {
        "id": "farmers_market",
        "title": "Farmers Market Visit",
        "description": "Explore the local farmers market and support local vendors",
        "duration": 60,
        "min_participants": 2,
        "max_participants": 6,
        "difficulty": "easy",
        "crystals": 70,
        "icon": "\U0001F96C",
        "type": "exploration",
        "tags": ["outdoor", "social", "food", "community"],
    },
    {
        "id": "meditation_circle",
        "title": "Meditation Circle",
        "description": "Practice mindfulness together in a peaceful setting",
        "duration": 45,
        "min_participants": 3,
        "max_participants": 12,
        "difficulty": "easy",
        "crystals": 75,
        "icon": "\U0001F9D8\u200D\u2640\uFE0F",
        "type": "wellness",
        "tags": ["outdoor", "wellness", "relaxing", "mindfulness"],
    },
    {
        "id": "dance_class",
        "title": "Dance Class",
        "description": "Learn new dance moves and have fun moving together",
        "duration": 75,
        "min_participants": 4,
        "max_participants": 12,
        "difficulty": "medium",
        "crystals": 110,
        "icon": "\U0001F483",
        "type": "dance",
        "tags": ["indoor", "active", "fun", "fitness"],
    },
    {
        "id": "star_gazing",
        "title": "Star Gazing Night",
        "description": "Watch the night sky and learn about constellations",
        "duration": 90,
        "min_participants": 2,
        "max_participants": 8,
        "difficulty": "easy",
        "crystals": 80,
        "icon": "\u2728",
        "type": "stargazing",
        "tags": ["outdoor", "evening", "educational", "nature"],
    },
    {
        "id": "volunteering",
        "title": "Community Volunteering",
        "description": "Give back to the community through volunteer work",
        "duration": 120,
        "min_participants": 4,
        "max_participants": 15,
        "difficulty": "medium",
        "crystals": 160,
        "icon": "\u2764\uFE0F",
        "type": "volunteer",
        "tags": ["outdoor", "volunteer", "community", "meaningful"],
    },
    {
        "id": "pottery_class",
        "title": "Pottery Workshop",
        "description": "Get hands-on with clay and create pottery together",
        "duration": 120,
        "min_participants": 3,
        "max_participants": 8,
        "difficulty": "medium",
        "crystals": 135,
        "icon": "\U0001FAB4",
        "type": "pottery",
        "tags": ["indoor", "creative", "art", "skill-building"],
    },
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return distance in km between two lat/lng points."""
    R = 6371.0
    rlat1, rlng1, rlat2, rlng2 = (
        math.radians(lat1),
        math.radians(lng1),
        math.radians(lat2),
        math.radians(lng2),
    )
    dlat = rlat2 - rlat1
    dlng = rlng2 - rlng1
    a = math.sin(dlat / 2) ** 2 + math.cos(rlat1) * math.cos(rlat2) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def compute_level(crystals: int) -> int:
    return math.floor(crystals / 100) + 1


def make_token() -> str:
    return secrets.token_urlsafe(32)


def monster_to_dict(m: models.Monster) -> dict:
    """Convert a Monster ORM object to the API dict shape."""
    return {
        "id": m.user_id,
        "name": m.name,
        "level": m.level,
        "crystals": m.crystals,
        "evolution": m.evolution,
        "monsterType": m.selected_monster,
        "collectedMonsters": m.collected_monsters or [],
        "traits": m.traits or [],
        "questsCompleted": m.quests_completed,
        "socialScore": m.social_score,
        "preferredQuestTypes": m.preferred_quest_types or {},
        "preferredGroupSize": m.preferred_group_size,
    }


def user_to_dict(u: models.User) -> dict:
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "picture": u.picture,
    }


def hub_to_dict(h: models.Hub, active_users: int = 0, distance: float = 0.0) -> dict:
    return {
        "id": h.id,
        "name": h.name,
        "location": h.location,
        "distance": distance,
        "activeUsers": active_users,
        "coordinates": {"lat": h.lat, "lng": h.lng},
    }


def template_to_dict(t: models.QuestTemplate) -> dict:
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "duration": t.duration,
        "minParticipants": t.min_participants,
        "maxParticipants": t.max_participants,
        "difficulty": t.difficulty,
        "crystals": t.crystals,
        "icon": t.icon,
        "type": t.type,
        "tags": t.tags or [],
    }


def instance_to_dict(inst: models.QuestInstance, tpl: models.QuestTemplate, participant_ids: list[str], creator_name: str = None) -> dict:
    return {
        "instanceId": inst.instance_id,
        "templateId": inst.template_id,
        "title": tpl.title,
        "description": tpl.description,
        "duration": tpl.duration,
        "minParticipants": tpl.min_participants,
        "maxParticipants": tpl.max_participants,
        "difficulty": tpl.difficulty,
        "crystals": tpl.crystals,
        "icon": tpl.icon,
        "type": tpl.type,
        "tags": tpl.tags or [],
        "hubId": inst.hub_id,
        "creatorUserId": inst.creator_user_id,
        "creatorName": creator_name,
        "currentParticipants": inst.current_participants,
        "participants": participant_ids,
        "isActive": inst.is_active,
        "startTime": inst.start_time,
        "location": inst.location or "",
        "deadline": inst.deadline,
    }


def ensure_user_stores(db: Session, user_id: str) -> None:
    """Ensure the user has a monster row."""
    existing = db.query(models.Monster).filter(models.Monster.user_id == user_id).first()
    if not existing:
        # Assign a random starting monster type from 1-9
        starting_type = random.randint(1, 9)
        m = models.Monster(
            id=user_id,
            user_id=user_id,
            name="Buddy",
            level=compute_level(1000),
            crystals=1000,
            evolution="baby",
            monster_type=starting_type,
            selected_monster=starting_type,
            collected_monsters=[starting_type],  # Start with one collected monster
            traits=[],
            quests_completed=0,
            social_score=0,
            preferred_quest_types={},
            preferred_group_size="small",
        )
        db.add(m)
        db.commit()


# ── Auth Dependency ──────────────────────────────────────────────────────────

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    session = db.query(models.Session).filter(models.Session.token == token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    user = db.query(models.User).filter(models.User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    return user_to_dict(user)


# ── Lifespan (create tables + seed) ─────────────────────────────────────────

def _seed_data() -> None:
    Base.metadata.create_all(engine)
    db = Session(bind=engine)
    try:
        # Seed hubs if empty
        if db.query(models.Hub).count() == 0:
            for h in SEED_HUBS:
                db.add(models.Hub(**h))
            db.commit()

        # Seed quest templates if empty
        if db.query(models.QuestTemplate).count() == 0:
            for t in SEED_TEMPLATES:
                db.add(models.QuestTemplate(**t))
            db.commit()

        # Seed multiple quest instances per hub if empty
        if db.query(models.QuestInstance).count() == 0:
            hubs_list = db.query(models.Hub).all()
            templates_list = db.query(models.QuestTemplate).all()
            
            # Create more quest instances per hub
            for hub in hubs_list:
                # Main Campus Hub gets more quests (12), others get 6
                num_quests = 12 if hub.id == "hub_campus_main" else 6
                num_quests = min(num_quests, len(templates_list))
                
                for i in range(num_quests):
                    tpl = templates_list[i % len(templates_list)]
                    inst_id = f"inst_{hub.id}_{tpl.id}_{i}"
                    db.add(models.QuestInstance(
                        instance_id=inst_id,
                        template_id=tpl.id,
                        hub_id=hub.id,
                        current_participants=0,
                        is_active=True,
                        start_time=None,
                        location=hub.location,
                        deadline=time.time() + tpl.duration * 60,
                    ))
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    _seed_data()
    yield


# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Gatherlings API",
    version="1.0.0",
    description="Backend API for the BuddyBeasts / Gatherlings community-building platform.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Models ─────────────────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    token: str

class DemoAuthRequest(BaseModel):
    name: str = "Demo User"

class AuthResponse(BaseModel):
    user: dict
    token: str

class Coordinates(BaseModel):
    lat: float
    lng: float

class HubSchema(BaseModel):
    id: str
    name: str
    location: str
    distance: float = 0.0
    activeUsers: int = 0
    coordinates: Coordinates

class QuestTemplateSchema(BaseModel):
    id: str
    title: str
    description: str
    duration: int
    minParticipants: int
    maxParticipants: int
    difficulty: str
    crystals: int
    icon: str
    type: str
    tags: list[str]

class QuestInstanceSchema(BaseModel):
    instanceId: str
    templateId: str
    title: str
    description: str
    duration: int
    minParticipants: int
    maxParticipants: int
    difficulty: str
    crystals: int
    icon: str
    type: str
    tags: list[str]
    hubId: str
    currentParticipants: int = 0
    participants: list[str] = Field(default_factory=list)
    isActive: bool = True
    startTime: Optional[str] = None
    location: str = ""
    deadline: Optional[float] = None

class CreateTemplateRequest(BaseModel):
    id: str
    title: str
    description: str
    duration: int
    minParticipants: int
    maxParticipants: int
    difficulty: str
    crystals: int
    icon: str = "🎯"
    type: str
    tags: list[str] = Field(default_factory=list)

class CreateInstanceRequest(BaseModel):
    templateId: str
    hubId: str
    location: str = ""
    startTime: Optional[str] = None

class JoinInstanceRequest(BaseModel):
    pass

class Participant(BaseModel):
    id: str
    name: str
    monster: dict
    isReady: bool = False
    isHost: bool = False

class LobbyState(BaseModel):
    instanceId: str
    quest: dict
    participants: list[Participant]
    allReady: bool = False
    countdown: Optional[int] = None

class EmoteRequest(BaseModel):
    emote: str

class CheckInCodeResponse(BaseModel):
    code: str
    questId: str

class VerifyCheckInRequest(BaseModel):
    code: str

class ConfirmCheckInRequest(BaseModel):
    participantCount: int = 1

class CheckInResult(BaseModel):
    questCompleted: bool
    crystalsEarned: int
    questName: str
    connections: int
    xp: int = 10

class UploadPhotoRequest(BaseModel):
    questId: str
    imageData: str  # base64 encoded
    groupMemory: Optional[str] = None
    groupSize: int = 1

class WordSelectionRequest(BaseModel):
    questId: str
    word: str

class ReactionSelectionRequest(BaseModel):
    questId: str
    reaction: str
    attempt: int = 1

class MonsterSchema(BaseModel):
    id: Optional[str] = None
    name: str = "Buddy"
    level: int = 1
    crystals: int = 0
    evolution: str = "baby"
    traits: list[str] = Field(default_factory=list)
    questsCompleted: int = 0
    socialScore: int = 0
    preferredQuestTypes: dict = Field(default_factory=dict)
    preferredGroupSize: str = "small"

class RenameRequest(BaseModel):
    name: str

class AddCrystalsRequest(BaseModel):
    amount: int

class EvolveRequest(BaseModel):
    evolution: str
    traits: list[str] = Field(default_factory=list)

class CompleteQuestRequest(BaseModel):
    questType: str
    isGroup: bool = False

class Profile(BaseModel):
    user: dict
    monster: MonsterSchema
    stats: dict

class ConnectionSchema(BaseModel):
    id: str
    userId: str
    connectedUserId: str
    connectedUserName: str
    timestamp: float

class AddConnectionRequest(BaseModel):
    connectedUserId: str
    connectedUserName: str

class NotificationSchema(BaseModel):
    id: str
    userId: str
    message: str
    read: bool = False
    timestamp: float
    type: str = "info"

class BelongingSubmit(BaseModel):
    score: int = Field(ge=1, le=10)

class BelongingEntry(BaseModel):
    score: int
    timestamp: float

class ChatMessageSchema(BaseModel):
    id: str
    lobbyId: str
    userId: str
    userName: str
    content: str
    timestamp: float

class SendMessageRequest(BaseModel):
    content: str

class SafetyReport(BaseModel):
    reporterId: str = ""
    targetId: Optional[str] = None
    reason: str
    details: str = ""

class Recommendations(BaseModel):
    recommendedTypes: list[str]
    recommendedGroupSize: str
    bestTimeOfDay: str


# ═══════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

# ── Utility ──────────────────────────────────────────────────────────────────

@app.get("/", tags=["Utility"])
def root():
    return {
        "name": "Gatherlings API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Utility"])
def health():
    return {"status": "ok", "timestamp": time.time()}


@app.delete("/api/admin/cleanup-demo-users", tags=["Utility"])
def cleanup_demo_users(db: Session = Depends(get_db)):
    """Remove all demo users (demo_*) from quest instances."""
    # Delete demo user participants
    demo_participants = db.query(models.InstanceParticipant).filter(
        models.InstanceParticipant.user_id.like('demo_%')
    ).all()
    
    affected_instances = set()
    for p in demo_participants:
        affected_instances.add(p.instance_id)
        db.delete(p)
    
    # Update participant counts
    for instance_id in affected_instances:
        inst = db.query(models.QuestInstance).filter(
            models.QuestInstance.instance_id == instance_id
        ).first()
        if inst:
            count = db.query(models.InstanceParticipant).filter(
                models.InstanceParticipant.instance_id == instance_id
            ).count()
            inst.current_participants = count
    
    db.commit()
    
    return {
        "removed": len(demo_participants),
        "affected_quests": len(affected_instances)
    }


@app.delete("/api/admin/cleanup-all-participants", tags=["Utility"])
def cleanup_all_participants(db: Session = Depends(get_db)):
    """Remove ALL participants from ALL quest instances (fresh start)."""
    # Delete all participants
    all_participants = db.query(models.InstanceParticipant).all()
    
    affected_instances = set()
    for p in all_participants:
        affected_instances.add(p.instance_id)
        db.delete(p)
    
    # Reset all participant counts to 0
    for instance_id in affected_instances:
        inst = db.query(models.QuestInstance).filter(
            models.QuestInstance.instance_id == instance_id
        ).first()
        if inst:
            inst.current_participants = 0
    
    # Also clean up lobby participants
    db.query(models.LobbyParticipant).delete()
    
    db.commit()
    
    return {
        "removed": len(all_participants),
        "affected_quests": len(affected_instances),
        "message": "All quest participants cleared"
    }


# ── Auth ─────────────────────────────────────────────────────────────────────

@app.post("/api/auth/google", response_model=AuthResponse, tags=["Auth"])
async def auth_google(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    from jose import jwt as jose_jwt

    try:
        decoded = jose_jwt.get_unverified_claims(body.token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    user_id = decoded.get("sub", str(uuid.uuid4()))
    existing = db.query(models.User).filter(models.User.id == user_id).first()
    if existing:
        existing.name = decoded.get("name", "Google User")
        existing.email = decoded.get("email", "")
        existing.picture = decoded.get("picture")
    else:
        db.add(models.User(
            id=user_id,
            name=decoded.get("name", "Google User"),
            email=decoded.get("email", ""),
            picture=decoded.get("picture"),
            created_at=time.time(),
        ))
    db.commit()
    ensure_user_stores(db, user_id)

    user_obj = db.query(models.User).filter(models.User.id == user_id).first()
    token = make_token()
    db.add(models.Session(token=token, user_id=user_id, created_at=time.time()))
    db.commit()
    return {"user": user_to_dict(user_obj), "token": token}


@app.post("/api/auth/demo", response_model=AuthResponse, tags=["Auth"])
def auth_demo(body: DemoAuthRequest = None, db: Session = Depends(get_db)):
    if body is None:
        body = DemoAuthRequest()
    user_id = f"demo_{uuid.uuid4().hex[:8]}"
    user = models.User(
        id=user_id,
        name=body.name,
        email=f"{user_id}@demo.local",
        picture=None,
        created_at=time.time(),
    )
    db.add(user)
    db.commit()
    ensure_user_stores(db, user_id)

    token = make_token()
    db.add(models.Session(token=token, user_id=user_id, created_at=time.time()))
    db.commit()
    return {"user": user_to_dict(user), "token": token}


@app.post("/api/auth/logout", tags=["Auth"])
def auth_logout(user: dict = Depends(get_current_user), authorization: str = Header(None), db: Session = Depends(get_db)):
    token = authorization.split(" ", 1)[1]
    session = db.query(models.Session).filter(models.Session.token == token).first()
    if session:
        db.delete(session)
        db.commit()
    return {"ok": True}


# ── Hubs ─────────────────────────────────────────────────────────────────────

@app.get("/api/hubs", tags=["Hubs"])
def list_hubs(lat: Optional[float] = Query(None), lng: Optional[float] = Query(None), db: Session = Depends(get_db)):
    all_hubs = db.query(models.Hub).all()
    result = []
    for h in all_hubs:
        active_count = db.query(models.HubMember).filter(models.HubMember.hub_id == h.id).count()
        distance = 0.0
        if lat is not None and lng is not None:
            distance = round(haversine(lat, lng, h.lat, h.lng), 2)
        result.append(hub_to_dict(h, active_users=active_count, distance=distance))
    if lat is not None and lng is not None:
        result.sort(key=lambda x: x["distance"])
    return result


@app.get("/api/hubs/{hub_id}", tags=["Hubs"])
def get_hub(hub_id: str, db: Session = Depends(get_db)):
    h = db.query(models.Hub).filter(models.Hub.id == hub_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hub not found")
    active_count = db.query(models.HubMember).filter(models.HubMember.hub_id == hub_id).count()
    return hub_to_dict(h, active_users=active_count)


@app.post("/api/hubs/{hub_id}/join", tags=["Hubs"])
def join_hub(hub_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    h = db.query(models.Hub).filter(models.Hub.id == hub_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hub not found")
    # Remove from all other hubs
    db.query(models.HubMember).filter(models.HubMember.user_id == user["id"]).delete()
    db.add(models.HubMember(hub_id=hub_id, user_id=user["id"]))
    db.commit()
    return {"ok": True, "hubId": hub_id}


@app.get("/api/hubs/{hub_id}/users", tags=["Hubs"])
def hub_online_users(hub_id: str, db: Session = Depends(get_db)):
    h = db.query(models.Hub).filter(models.Hub.id == hub_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hub not found")
    members = db.query(models.HubMember).filter(models.HubMember.hub_id == hub_id).all()
    result = []
    for mem in members:
        u = db.query(models.User).filter(models.User.id == mem.user_id).first()
        m = db.query(models.Monster).filter(models.Monster.user_id == mem.user_id).first()
        result.append({
            "id": mem.user_id,
            "name": u.name if u else "Unknown",
            "monster": {
                "evolution": m.evolution if m else "baby",
                "level": m.level if m else 1,
                "monsterType": m.selected_monster if m else 1,
                "position": {
                    "x": hash(mem.user_id) % 100,
                    "y": hash(mem.user_id + "y") % 100,
                },
            },
        })
    return result


# ── Quests ───────────────────────────────────────────────────────────────────

@app.get("/api/quests/templates", tags=["Quests"])
def list_quest_templates(db: Session = Depends(get_db)):
    templates = db.query(models.QuestTemplate).all()
    return [template_to_dict(t) for t in templates]


@app.post("/api/quests/templates", tags=["Quests"])
def create_quest_template(body: CreateTemplateRequest, db: Session = Depends(get_db)):
    """Create a new quest template."""
    # Check if template with this ID already exists
    existing = db.query(models.QuestTemplate).filter(models.QuestTemplate.id == body.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Template with this ID already exists")
    
    # Validate difficulty
    if body.difficulty not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Difficulty must be 'easy', 'medium', or 'hard'")
    
    # Validate participants
    if body.minParticipants < 1 or body.maxParticipants < body.minParticipants:
        raise HTTPException(status_code=400, detail="Invalid participant range")
    
    # Create the template
    template = models.QuestTemplate(
        id=body.id,
        title=body.title,
        description=body.description,
        duration=body.duration,
        min_participants=body.minParticipants,
        max_participants=body.maxParticipants,
        difficulty=body.difficulty,
        crystals=body.crystals,
        icon=body.icon,
        type=body.type,
        tags=body.tags,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return template_to_dict(template)


@app.get("/api/quests/instances", tags=["Quests"])
def list_quest_instances(hub_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(models.QuestInstance).filter(models.QuestInstance.is_active == True)
    if hub_id:
        q = q.filter(models.QuestInstance.hub_id == hub_id)
    instances = q.all()
    now = time.time()
    result = []
    for inst in instances:
        # Auto-expire quests past their deadline
        if inst.deadline and now > inst.deadline:
            inst.is_active = False
            continue

        # Auto-delete quests past start_time with no participants
        if inst.start_time and inst.current_participants == 0:
            try:
                from datetime import datetime
                start_dt = datetime.fromisoformat(inst.start_time)
                if datetime.now() > start_dt:
                    inst.is_active = False
                    continue
            except:
                pass  # Invalid date format, skip auto-deletion

        tpl = db.query(models.QuestTemplate).filter(models.QuestTemplate.id == inst.template_id).first()
        if not tpl:
            continue
        pids = [p.user_id for p in db.query(models.InstanceParticipant).filter(
            models.InstanceParticipant.instance_id == inst.instance_id).all()]

        # Get creator name
        creator_name = None
        if inst.creator_user_id:
            creator = db.query(models.User).filter(models.User.id == inst.creator_user_id).first()
            if creator:
                creator_name = creator.name

        result.append(instance_to_dict(inst, tpl, pids, creator_name))
    db.commit()  # Persist any deadline-based deactivations
    return result


@app.post("/api/quests/instances", tags=["Quests"])
def create_quest_instance(body: CreateInstanceRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    tpl = db.query(models.QuestTemplate).filter(models.QuestTemplate.id == body.templateId).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    hub = db.query(models.Hub).filter(models.Hub.id == body.hubId).first()
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")

    inst_id = f"inst_{uuid.uuid4().hex[:8]}"
    deadline = time.time() + tpl.duration * 60
    inst = models.QuestInstance(
        instance_id=inst_id,
        template_id=tpl.id,
        hub_id=body.hubId,
        creator_user_id=user["id"],
        current_participants=1,
        is_active=True,
        start_time=body.startTime,
        location=body.location or hub.location,
        deadline=deadline,
    )
    db.add(inst)
    db.flush()  # Flush parent row before inserting FK-dependent children
    db.add(models.InstanceParticipant(instance_id=inst_id, user_id=user["id"]))
    # Auto-create lobby entry (host)
    db.add(models.LobbyParticipant(instance_id=inst_id, user_id=user["id"], is_ready=False, is_host=True))
    db.commit()

    pids = [user["id"]]
    return instance_to_dict(inst, tpl, pids, user["name"])


@app.delete("/api/quests/instances/{instance_id}", tags=["Quests"])
def delete_quest_instance(instance_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a quest instance. Only the creator can delete it."""
    inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id == instance_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Quest not found")

    # Check if user is the creator
    if inst.creator_user_id != user["id"]:
        raise HTTPException(status_code=403, detail="Only the quest creator can delete this quest")

    # Delete related records
    db.query(models.InstanceParticipant).filter(models.InstanceParticipant.instance_id == instance_id).delete()
    db.query(models.LobbyParticipant).filter(models.LobbyParticipant.instance_id == instance_id).delete()
    db.delete(inst)
    db.commit()

    return {"ok": True, "message": "Quest deleted successfully"}


@app.post("/api/quests/instances/{instance_id}/join", tags=["Quests"])
def join_quest_instance(instance_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id == instance_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instance not found")
    if not inst.is_active:
        raise HTTPException(status_code=400, detail="Quest is no longer active")
    if inst.deadline and time.time() > inst.deadline:
        inst.is_active = False
        db.commit()
        raise HTTPException(status_code=400, detail="Quest has expired")

    tpl = db.query(models.QuestTemplate).filter(models.QuestTemplate.id == inst.template_id).first()
    pids = [p.user_id for p in db.query(models.InstanceParticipant).filter(
        models.InstanceParticipant.instance_id == instance_id).all()]

    # Get creator name
    creator_name = None
    if inst.creator_user_id:
        creator = db.query(models.User).filter(models.User.id == inst.creator_user_id).first()
        if creator:
            creator_name = creator.name

    if user["id"] in pids:
        return instance_to_dict(inst, tpl, pids, creator_name)

    if inst.current_participants >= tpl.max_participants:
        raise HTTPException(status_code=400, detail="Quest is full")

    db.add(models.InstanceParticipant(instance_id=instance_id, user_id=user["id"]))
    inst.current_participants = inst.current_participants + 1
    # Add to lobby
    existing_lobby = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == instance_id,
        models.LobbyParticipant.user_id == user["id"],
    ).first()
    if not existing_lobby:
        db.add(models.LobbyParticipant(instance_id=instance_id, user_id=user["id"], is_ready=False, is_host=False))
    db.commit()

    pids.append(user["id"])
    return instance_to_dict(inst, tpl, pids, creator_name)


# ── Lobby ────────────────────────────────────────────────────────────────────

def _build_lobby_state(db: Session, instance_id: str) -> dict:
    inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id == instance_id).first()
    if not inst:
        return None
    tpl = db.query(models.QuestTemplate).filter(models.QuestTemplate.id == inst.template_id).first()
    pids = [p.user_id for p in db.query(models.InstanceParticipant).filter(
        models.InstanceParticipant.instance_id == instance_id).all()]

    # Get creator name
    creator_name = None
    if inst.creator_user_id:
        creator = db.query(models.User).filter(models.User.id == inst.creator_user_id).first()
        if creator:
            creator_name = creator.name

    quest_dict = instance_to_dict(inst, tpl, pids, creator_name)

    lobby_parts = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == instance_id).all()
    participants = []
    for lp in lobby_parts:
        u = db.query(models.User).filter(models.User.id == lp.user_id).first()
        m = db.query(models.Monster).filter(models.Monster.user_id == lp.user_id).first()
        participants.append({
            "id": lp.user_id,
            "name": u.name if u else "Unknown",
            "monster": monster_to_dict(m) if m else {},
            "isReady": lp.is_ready,
            "isHost": lp.is_host,
        })

    all_ready = (
        len(participants) >= 1  # For development: allow solo testing (change to tpl.min_participants for production)
        and all(p["isReady"] for p in participants)
    ) if participants else False

    return {
        "instanceId": instance_id,
        "quest": quest_dict,
        "participants": participants,
        "allReady": all_ready,
        "countdown": 5 if all_ready else None,
    }


@app.get("/api/lobbies/{instance_id}", tags=["Lobby"])
def get_lobby(instance_id: str, _user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    lobby = _build_lobby_state(db, instance_id)
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return lobby


@app.post("/api/lobbies/{instance_id}/join", tags=["Lobby"])
def join_lobby(instance_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id == instance_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instance not found")

    # Ensure quest is joined first
    existing_p = db.query(models.InstanceParticipant).filter(
        models.InstanceParticipant.instance_id == instance_id,
        models.InstanceParticipant.user_id == user["id"],
    ).first()
    if not existing_p:
        tpl = db.query(models.QuestTemplate).filter(models.QuestTemplate.id == inst.template_id).first()
        if inst.current_participants >= tpl.max_participants:
            raise HTTPException(status_code=400, detail="Quest is full")
        db.add(models.InstanceParticipant(instance_id=instance_id, user_id=user["id"]))
        inst.current_participants = inst.current_participants + 1

    # Add to lobby if not present
    existing_lobby = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == instance_id,
        models.LobbyParticipant.user_id == user["id"],
    ).first()
    if not existing_lobby:
        db.add(models.LobbyParticipant(instance_id=instance_id, user_id=user["id"], is_ready=False, is_host=False))
    db.commit()

    lobby = _build_lobby_state(db, instance_id)
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return lobby


@app.put("/api/lobbies/{instance_id}/ready", tags=["Lobby"])
def toggle_ready(instance_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    lp = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == instance_id,
        models.LobbyParticipant.user_id == user["id"],
    ).first()
    if not lp:
        raise HTTPException(status_code=400, detail="Not in this lobby")
    lp.is_ready = not lp.is_ready
    db.commit()

    lobby = _build_lobby_state(db, instance_id)
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return lobby


@app.post("/api/lobbies/{instance_id}/emote", tags=["Lobby"])
def send_emote(instance_id: str, body: EmoteRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id == instance_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return {
        "ok": True,
        "emote": body.emote,
        "userId": user["id"],
        "userName": user["name"],
    }


@app.delete("/api/lobbies/{instance_id}/leave", tags=["Lobby"])
def leave_lobby(instance_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # Remove from lobby
    db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == instance_id,
        models.LobbyParticipant.user_id == user["id"],
    ).delete()
    # Remove from instance participants
    db.query(models.InstanceParticipant).filter(
        models.InstanceParticipant.instance_id == instance_id,
        models.InstanceParticipant.user_id == user["id"],
    ).delete()
    # Update participant count
    inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id == instance_id).first()
    if inst:
        count = db.query(models.InstanceParticipant).filter(
            models.InstanceParticipant.instance_id == instance_id).count()
        inst.current_participants = count
    db.commit()
    return {"ok": True}


# ── Check-in ─────────────────────────────────────────────────────────────────

@app.get("/api/checkin/{quest_id}/code", tags=["Check-in"])
def generate_checkin_code(quest_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    code = f"BUDDY_{quest_id}_{int(time.time() * 1000)}"
    db.add(models.CheckinCode(code=code, quest_id=quest_id, user_id=user["id"], timestamp=time.time()))
    db.commit()
    return {"code": code, "questId": quest_id}


@app.post("/api/checkin/verify", tags=["Check-in"])
def verify_checkin(body: VerifyCheckInRequest, _user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = db.query(models.CheckinCode).filter(models.CheckinCode.code == body.code).first()
    if not entry:
        raise HTTPException(status_code=400, detail="Invalid check-in code")
    if time.time() - entry.timestamp > 600:
        raise HTTPException(status_code=400, detail="Check-in code has expired")
    return {"valid": True, "questId": entry.quest_id}


@app.post("/api/checkin/{quest_id}/confirm", response_model=CheckInResult, tags=["Check-in"])
def confirm_checkin(
    quest_id: str,
    body: ConfirmCheckInRequest,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id == quest_id).first()
    if not inst:
        # Try matching by pattern
        inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id.contains(quest_id)).first()

    tpl = None
    quest_name = "Unknown Quest"
    quest_type = "unknown"
    duration = 0
    if inst:
        tpl = db.query(models.QuestTemplate).filter(models.QuestTemplate.id == inst.template_id).first()
        if tpl:
            quest_name = tpl.title
            quest_type = tpl.type
            duration = tpl.duration

    is_group = body.participantCount > 1
    crystals_earned = 200

    # Update monster
    m = db.query(models.Monster).filter(models.Monster.user_id == user["id"]).first()
    if m:
        m.crystals = m.crystals + crystals_earned
        m.level = compute_level(m.crystals)
        m.quests_completed = m.quests_completed + 1
        m.social_score = m.social_score + (10 if is_group else 3)
        pqt = dict(m.preferred_quest_types or {})
        pqt[quest_type] = pqt.get(quest_type, 0) + 1
        m.preferred_quest_types = pqt

    # Record in quest history
    db.add(models.QuestHistory(
        user_id=user["id"],
        quest_id=quest_id,
        quest_type=quest_type,
        start_time=time.time() * 1000,
        status="completed",
        group_size=body.participantCount,
        duration=duration,
        end_time=time.time() * 1000,
    ))

    # Mark instance inactive
    if inst:
        inst.is_active = False

    db.commit()

    connections_made = max(0, body.participantCount - 1)
    return {
        "questCompleted": True,
        "crystalsEarned": crystals_earned,
        "questName": quest_name,
        "connections": connections_made,
        "xp": 10,
    }


@app.post("/api/quests/photos/upload", tags=["Quest Photos"])
def upload_quest_photo(
    body: UploadPhotoRequest,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a group photo after completing a quest."""
    photo_id = f"photo_{uuid.uuid4().hex[:12]}"
    
    db.add(models.QuestPhoto(
        id=photo_id,
        quest_id=body.questId,
        user_id=user["id"],
        image_data=body.imageData,
        group_memory=body.groupMemory,
        group_size=body.groupSize,
        timestamp=time.time() * 1000,
    ))
    db.commit()
    
    return {
        "success": True,
        "photoId": photo_id,
        "message": "Photo saved to gallery"
    }


@app.get("/api/quests/photos/gallery", tags=["Quest Photos"])
def get_gallery_photos(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all gallery photos for the current user."""
    photos = db.query(models.QuestPhoto).filter(
        models.QuestPhoto.user_id == user["id"]
    ).order_by(models.QuestPhoto.timestamp.desc()).all()
    
    result = []
    for photo in photos:
        result.append({
            "id": photo.id,
            "questId": photo.quest_id,
            "imageData": photo.image_data,
            "groupMemory": photo.group_memory,
            "groupSize": photo.group_size,
            "timestamp": photo.timestamp,
        })
    
    return {"photos": result}


@app.get("/api/quests/{quest_id}/group-photo", tags=["Quest Photos"])
def get_group_photo(
    quest_id: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the group photo for a quest (uploaded by any participant)."""
    photo = db.query(models.QuestPhoto).filter(
        models.QuestPhoto.quest_id == quest_id
    ).order_by(models.QuestPhoto.timestamp.desc()).first()
    
    if photo:
        return {
            "photoData": photo.image_data,
            "uploadedBy": db.query(models.User).filter(models.User.id == photo.user_id).first().name,
            "groupMemory": photo.group_memory,
            "timestamp": photo.timestamp,
        }
    
    return {"photoData": None}


@app.post("/api/quests/word-selection", tags=["Quest Photos"])
def submit_word_selection(
    body: WordSelectionRequest,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a word selection for group memory verification."""
    # Remove any previous selection by this user for this quest
    db.query(models.WordSelection).filter(
        models.WordSelection.quest_id == body.questId,
        models.WordSelection.user_id == user["id"]
    ).delete()
    
    # Add new selection
    db.add(models.WordSelection(
        quest_id=body.questId,
        user_id=user["id"],
        word=body.word,
        timestamp=time.time() * 1000,
    ))
    db.commit()
    
    # Check if all participants selected the same word
    selections = db.query(models.WordSelection).filter(
        models.WordSelection.quest_id == body.questId
    ).all()
    
    # Get participant count
    participants = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == body.questId
    ).all()
    
    all_selected = len(selections) == len(participants)
    all_same_word = all_selected and len(set(s.word for s in selections)) == 1
    
    return {
        "success": True,
        "allSelected": all_selected,
        "allSameWord": all_same_word,
        "selectedWord": body.word,
        "totalSelections": len(selections),
        "totalParticipants": len(participants),
    }


@app.get("/api/quests/{quest_id}/word-status", tags=["Quest Photos"])
def get_word_selection_status(
    quest_id: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current status of word selections for a quest."""
    selections = db.query(models.WordSelection).filter(
        models.WordSelection.quest_id == quest_id
    ).all()

    participants = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == quest_id
    ).all()

    all_selected = len(selections) == len(participants)
    all_same_word = all_selected and len(set(s.word for s in selections)) == 1
    chosen_word = selections[0].word if selections and all_same_word else None

    return {
        "allSelected": all_selected,
        "allSameWord": all_same_word,
        "chosenWord": chosen_word,
        "totalSelections": len(selections),
        "totalParticipants": len(participants),
    }


@app.post("/api/quests/reaction-selection", tags=["Quest Completion"])
def submit_reaction_selection(
    body: ReactionSelectionRequest,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a reaction selection for group reaction verification."""
    # Remove any previous selection by this user for this quest and attempt
    db.query(models.ReactionSelection).filter(
        models.ReactionSelection.quest_id == body.questId,
        models.ReactionSelection.user_id == user["id"],
        models.ReactionSelection.attempt == body.attempt
    ).delete()

    # Add new selection
    db.add(models.ReactionSelection(
        quest_id=body.questId,
        user_id=user["id"],
        reaction=body.reaction,
        attempt=body.attempt,
        timestamp=time.time() * 1000,
    ))
    db.commit()

    # Check if all participants selected the same reaction for this attempt
    selections = db.query(models.ReactionSelection).filter(
        models.ReactionSelection.quest_id == body.questId,
        models.ReactionSelection.attempt == body.attempt
    ).all()

    # Get participant count
    participants = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == body.questId
    ).all()

    all_selected = len(selections) == len(participants)
    all_same_reaction = all_selected and len(set(s.reaction for s in selections)) == 1

    return {
        "success": True,
        "allSelected": all_selected,
        "allSameReaction": all_same_reaction,
        "selectedReaction": body.reaction,
        "totalSelections": len(selections),
        "totalParticipants": len(participants),
        "attempt": body.attempt,
    }


@app.get("/api/quests/{quest_id}/reaction-status", tags=["Quest Completion"])
def get_reaction_selection_status(
    quest_id: str,
    attempt: int = Query(1),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current status of reaction selections for a quest."""
    selections = db.query(models.ReactionSelection).filter(
        models.ReactionSelection.quest_id == quest_id,
        models.ReactionSelection.attempt == attempt
    ).all()

    participants = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == quest_id
    ).all()

    all_selected = len(selections) == len(participants)
    all_same_reaction = all_selected and len(set(s.reaction for s in selections)) == 1
    chosen_reaction = selections[0].reaction if selections and all_same_reaction else None

    return {
        "allSelected": all_selected,
        "allSameReaction": all_same_reaction,
        "chosenReaction": chosen_reaction,
        "totalSelections": len(selections),
        "totalParticipants": len(participants),
        "attempt": attempt,
    }


@app.post("/api/quests/{quest_id}/complete-with-reaction", tags=["Quest Completion"])
def complete_quest_with_reaction(
    quest_id: str,
    attempt: int = Query(3),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Complete quest after reaction verification. Give crystals if matched, delete quest if failed."""
    inst = db.query(models.QuestInstance).filter(models.QuestInstance.instance_id == quest_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Quest not found")

    # Check if all reactions matched
    selections = db.query(models.ReactionSelection).filter(
        models.ReactionSelection.quest_id == quest_id,
        models.ReactionSelection.attempt == attempt
    ).all()

    participants = db.query(models.LobbyParticipant).filter(
        models.LobbyParticipant.instance_id == quest_id
    ).all()

    all_selected = len(selections) == len(participants)
    all_same_reaction = all_selected and len(set(s.reaction for s in selections)) == 1

    tpl = db.query(models.QuestTemplate).filter(models.QuestTemplate.id == inst.template_id).first()
    quest_name = tpl.title if tpl else "Unknown Quest"
    quest_type = tpl.type if tpl else "unknown"
    duration = tpl.duration if tpl else 0

    if all_same_reaction:
        # SUCCESS: Give crystals to all participants
        crystals_earned = 200
        participant_ids = [p.user_id for p in participants]

        for participant_id in participant_ids:
            m = db.query(models.Monster).filter(models.Monster.user_id == participant_id).first()
            if m:
                m.crystals = m.crystals + crystals_earned
                m.level = compute_level(m.crystals)
                m.quests_completed = m.quests_completed + 1
                m.social_score = m.social_score + 10
                pqt = dict(m.preferred_quest_types or {})
                pqt[quest_type] = pqt.get(quest_type, 0) + 1
                m.preferred_quest_types = pqt

            # Record in quest history
            db.add(models.QuestHistory(
                user_id=participant_id,
                quest_id=quest_id,
                quest_type=quest_type,
                start_time=time.time() * 1000,
                status="completed",
                group_size=len(participants),
                duration=duration,
                end_time=time.time() * 1000,
            ))

        # Mark instance inactive
        inst.is_active = False
        db.commit()

        return {
            "success": True,
            "matched": True,
            "crystalsEarned": crystals_earned,
            "questName": quest_name,
            "connections": len(participants) - 1,
            "message": "Quest completed successfully!",
        }
    else:
        # FAILURE: Delete quest, no crystals
        # Delete related records
        db.query(models.ReactionSelection).filter(models.ReactionSelection.quest_id == quest_id).delete()
        db.query(models.WordSelection).filter(models.WordSelection.quest_id == quest_id).delete()
        db.query(models.InstanceParticipant).filter(models.InstanceParticipant.instance_id == quest_id).delete()
        db.query(models.LobbyParticipant).filter(models.LobbyParticipant.instance_id == quest_id).delete()
        db.query(models.QuestPhoto).filter(models.QuestPhoto.quest_id == quest_id).delete()
        db.query(models.CheckinCode).filter(models.CheckinCode.quest_id == quest_id).delete()
        db.delete(inst)
        db.commit()

        return {
            "success": True,
            "matched": False,
            "crystalsEarned": 0,
            "questName": quest_name,
            "connections": 0,
            "message": "Reactions did not match. Quest deleted.",
        }


# ── Monster ──────────────────────────────────────────────────────────────────

@app.get("/api/monsters/me", tags=["Monster"])
def get_my_monster(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    m = db.query(models.Monster).filter(models.Monster.user_id == user["id"]).first()
    return monster_to_dict(m) if m else {}


@app.put("/api/monsters/me/name", tags=["Monster"])
def rename_monster(body: RenameRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    m = db.query(models.Monster).filter(models.Monster.user_id == user["id"]).first()
    if not m:
        raise HTTPException(status_code=404, detail="Monster not found")
    m.name = body.name
    db.commit()
    return monster_to_dict(m)


@app.post("/api/monsters/me/crystals", tags=["Monster"])
def add_crystals(body: AddCrystalsRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    m = db.query(models.Monster).filter(models.Monster.user_id == user["id"]).first()
    if not m:
        raise HTTPException(status_code=404, detail="Monster not found")
    m.crystals = m.crystals + body.amount
    m.level = compute_level(m.crystals)
    db.commit()
    return monster_to_dict(m)


@app.post("/api/monsters/me/evolve", tags=["Monster"])
def evolve_monster(body: EvolveRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    m = db.query(models.Monster).filter(models.Monster.user_id == user["id"]).first()
    if not m:
        raise HTTPException(status_code=404, detail="Monster not found")

    valid_evolutions = {
        "baby": ["teen"],
        "teen": ["adult", "leader", "support"],
    }
    allowed = valid_evolutions.get(m.evolution, [])
    if body.evolution not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot evolve from {m.evolution} to {body.evolution}",
        )

    level_req = 10 if m.evolution == "baby" else 20
    if m.level < level_req:
        raise HTTPException(
            status_code=400,
            detail=f"Level {level_req} required for this evolution (current: {m.level})",
        )


@app.post("/api/monsters/me/select", tags=["Monster"])
def select_monster(body: dict, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Change the currently displayed monster character."""
    m = db.query(models.Monster).filter(models.Monster.user_id == user["id"]).first()
    if not m:
        raise HTTPException(status_code=404, detail="Monster not found")
    
    monster_type = body.get("monsterType")
    if not monster_type or monster_type not in (m.collected_monsters or []):
        raise HTTPException(status_code=400, detail="Monster not collected yet")
    
    m.selected_monster = monster_type
    db.commit()
    return monster_to_dict(m)

    m.evolution = body.evolution
    m.traits = body.traits if body.traits else m.traits
    db.commit()
    return monster_to_dict(m)


@app.post("/api/monsters/me/complete-quest", tags=["Monster"])
def complete_quest_monster(body: CompleteQuestRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    m = db.query(models.Monster).filter(models.Monster.user_id == user["id"]).first()
    if not m:
        raise HTTPException(status_code=404, detail="Monster not found")
    m.quests_completed = m.quests_completed + 1
    m.social_score = m.social_score + (10 if body.isGroup else 3)
    pqt = dict(m.preferred_quest_types or {})
    pqt[body.questType] = pqt.get(body.questType, 0) + 1
    m.preferred_quest_types = pqt
    db.commit()
    return monster_to_dict(m)


# ── Profile & Stats ─────────────────────────────────────────────────────────

@app.get("/api/profile/me", tags=["Profile"])
def get_profile(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    m = db.query(models.Monster).filter(models.Monster.user_id == user["id"]).first()
    m_dict = monster_to_dict(m) if m else {}

    completed_count = db.query(models.QuestHistory).filter(
        models.QuestHistory.user_id == user["id"],
        models.QuestHistory.status == "completed",
    ).count()

    scores = db.query(models.BelongingScore).filter(
        models.BelongingScore.user_id == user["id"]).all()
    avg_belonging = (
        round(sum(s.score for s in scores) / len(scores), 1) if scores else None
    )

    conn_count = db.query(models.Connection).filter(
        models.Connection.user_id == user["id"]).count()

    return {
        "user": user,
        "monster": m_dict,
        "stats": {
            "questsCompleted": completed_count,
            "totalCrystals": m.crystals if m else 0,
            "level": m.level if m else 1,
            "socialScore": m.social_score if m else 0,
            "connectionsCount": conn_count,
            "averageBelonging": avg_belonging,
        },
    }


@app.get("/api/profile/me/history", tags=["Profile"])
def get_quest_history(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.QuestHistory).filter(
        models.QuestHistory.user_id == user["id"]).all()
    return [
        {
            "questId": r.quest_id,
            "questType": r.quest_type,
            "startTime": r.start_time,
            "status": r.status,
            "groupSize": r.group_size,
            "duration": r.duration,
            "endTime": r.end_time,
        }
        for r in rows
    ]


@app.get("/api/profile/me/belonging", tags=["Profile"])
def get_belonging_trend(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.BelongingScore).filter(
        models.BelongingScore.user_id == user["id"]).all()
    return [{"score": r.score, "timestamp": r.timestamp} for r in rows]


# ── Connections ──────────────────────────────────────────────────────────────

@app.get("/api/connections", tags=["Connections"])
def list_connections(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.Connection).filter(models.Connection.user_id == user["id"]).all()
    return [
        {
            "id": r.id,
            "userId": r.user_id,
            "connectedUserId": r.connected_user_id,
            "connectedUserName": r.connected_user_name,
            "timestamp": r.timestamp,
        }
        for r in rows
    ]


@app.post("/api/connections", tags=["Connections"])
def add_connection(body: AddConnectionRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    conn = models.Connection(
        id=f"conn_{uuid.uuid4().hex[:8]}",
        user_id=user["id"],
        connected_user_id=body.connectedUserId,
        connected_user_name=body.connectedUserName,
        timestamp=time.time(),
    )
    db.add(conn)
    db.commit()
    return {
        "id": conn.id,
        "userId": conn.user_id,
        "connectedUserId": conn.connected_user_id,
        "connectedUserName": conn.connected_user_name,
        "timestamp": conn.timestamp,
    }


# ── Notifications ────────────────────────────────────────────────────────────

@app.get("/api/notifications", tags=["Notifications"])
def list_notifications(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.Notification).filter(models.Notification.user_id == user["id"]).all()
    return [
        {
            "id": r.id,
            "userId": r.user_id,
            "message": r.message,
            "read": r.read,
            "timestamp": r.timestamp,
            "type": r.type,
        }
        for r in rows
    ]


@app.put("/api/notifications/{notification_id}/read", tags=["Notifications"])
def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == user["id"],
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.read = True
    db.commit()
    return {
        "id": n.id,
        "userId": n.user_id,
        "message": n.message,
        "read": n.read,
        "timestamp": n.timestamp,
        "type": n.type,
    }


# ── Belonging Survey ─────────────────────────────────────────────────────────

@app.post("/api/belonging", tags=["Belonging"])
def submit_belonging(body: BelongingSubmit, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = models.BelongingScore(
        user_id=user["id"],
        score=body.score,
        timestamp=time.time(),
    )
    db.add(entry)
    db.commit()
    return {"score": entry.score, "timestamp": entry.timestamp}


@app.get("/api/belonging/trend", tags=["Belonging"])
def belonging_trend(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.BelongingScore).filter(
        models.BelongingScore.user_id == user["id"]).all()
    scores_list = [{"score": r.score, "timestamp": r.timestamp} for r in rows]
    avg = round(sum(r.score for r in rows) / len(rows), 1) if rows else None
    return {"scores": scores_list, "average": avg, "count": len(rows)}


# ── Chat ─────────────────────────────────────────────────────────────────────

@app.get("/api/chat/{lobby_id}", tags=["Chat"])
def get_chat_messages(lobby_id: str, _user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.ChatMessage).filter(models.ChatMessage.lobby_id == lobby_id).all()
    return [
        {
            "id": r.id,
            "lobbyId": r.lobby_id,
            "userId": r.user_id,
            "userName": r.user_name,
            "content": r.content,
            "timestamp": r.timestamp,
        }
        for r in rows
    ]


@app.post("/api/chat/{lobby_id}", tags=["Chat"])
def send_chat_message(lobby_id: str, body: SendMessageRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = models.ChatMessage(
        id=f"msg_{uuid.uuid4().hex[:8]}",
        lobby_id=lobby_id,
        user_id=user["id"],
        user_name=user["name"],
        content=body.content,
        timestamp=time.time(),
    )
    db.add(msg)
    db.commit()
    return {
        "id": msg.id,
        "lobbyId": msg.lobby_id,
        "userId": msg.user_id,
        "userName": msg.user_name,
        "content": msg.content,
        "timestamp": msg.timestamp,
    }


# ── Safety ───────────────────────────────────────────────────────────────────

@app.post("/api/reports", tags=["Safety"])
def submit_report(body: SafetyReport, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    report = models.Report(
        id=f"report_{uuid.uuid4().hex[:8]}",
        reporter_id=user["id"],
        target_id=body.targetId,
        reason=body.reason,
        details=body.details,
        timestamp=time.time(),
        status="pending",
    )
    db.add(report)
    db.commit()
    return {
        "id": report.id,
        "reporterId": report.reporter_id,
        "targetId": report.target_id,
        "reason": report.reason,
        "details": report.details,
        "timestamp": report.timestamp,
        "status": report.status,
    }


# ── Recommendations ──────────────────────────────────────────────────────────

@app.get("/api/recommendations", response_model=Recommendations, tags=["Recommendations"])
def get_recommendations(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(models.QuestHistory).filter(
        models.QuestHistory.user_id == user["id"],
        models.QuestHistory.status == "completed",
    ).all()

    if not rows:
        return {
            "recommendedTypes": ["coffee_chat", "study_jam", "sunset_walk"],
            "recommendedGroupSize": "small",
            "bestTimeOfDay": "afternoon",
        }

    # Preferred quest types
    type_count: dict[str, int] = {}
    for q in rows:
        type_count[q.quest_type] = type_count.get(q.quest_type, 0) + 1
    recommended_types = [
        t for t, _ in sorted(type_count.items(), key=lambda x: x[1], reverse=True)
    ][:3]

    # Preferred group size
    avg_group = sum(q.group_size or 2 for q in rows) / len(rows)
    if avg_group <= 2:
        group_size = "1-1"
    elif avg_group <= 4:
        group_size = "small"
    else:
        group_size = "large"

    # Best time of day
    hour_counts: dict[str, int] = {}
    for q in rows:
        ts = q.start_time
        if ts:
            hour = datetime.fromtimestamp(ts / 1000).hour
            period = "morning" if hour < 12 else ("afternoon" if hour < 17 else "evening")
            hour_counts[period] = hour_counts.get(period, 0) + 1
    best_time = "afternoon"
    if hour_counts:
        best_time = max(hour_counts, key=hour_counts.get)

    return {
        "recommendedTypes": recommended_types,
        "recommendedGroupSize": group_size,
        "bestTimeOfDay": best_time,
    }


# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
