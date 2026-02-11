"""SQLAlchemy ORM models for Gatherlings."""

from sqlalchemy import (
    Boolean,
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSON

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    created_at = Column(Float, nullable=True)


class Session(Base):
    __tablename__ = "sessions"

    token = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(Float, nullable=True)


class Monster(Base):
    __tablename__ = "monsters"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=False, default="Buddy")
    level = Column(Integer, nullable=False, default=1)
    crystals = Column(Integer, nullable=False, default=0)
    coins = Column(Integer, nullable=False, default=0)
    evolution = Column(String, nullable=False, default="baby")
    monster_type = Column(Integer, nullable=False, default=1)
    collected_monsters = Column(JSON, nullable=False, default=list)  # List of collected monster type IDs
    selected_monster = Column(Integer, nullable=False, default=1)  # Currently active monster type
    traits = Column(JSON, nullable=False, default=list)
    quests_completed = Column(Integer, nullable=False, default=0)
    social_score = Column(Integer, nullable=False, default=0)
    preferred_quest_types = Column(JSON, nullable=False, default=dict)
    preferred_group_size = Column(String, nullable=False, default="small")


class Hub(Base):
    __tablename__ = "hubs"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)


class HubMember(Base):
    __tablename__ = "hub_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hub_id = Column(String, ForeignKey("hubs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    __table_args__ = (UniqueConstraint("hub_id", "user_id"),)


class QuestTemplate(Base):
    __tablename__ = "quest_templates"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=False)
    min_participants = Column(Integer, nullable=False)
    max_participants = Column(Integer, nullable=False)
    difficulty = Column(String, nullable=False)
    crystals = Column(Integer, nullable=False)
    icon = Column(String, nullable=True)
    type = Column(String, nullable=False)
    tags = Column(JSON, nullable=False, default=list)


class QuestInstance(Base):
    __tablename__ = "quest_instances"

    instance_id = Column(String, primary_key=True)
    template_id = Column(String, ForeignKey("quest_templates.id"), nullable=False)
    hub_id = Column(String, ForeignKey("hubs.id"), nullable=False)
    creator_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    current_participants = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    start_time = Column(String, nullable=True)
    location = Column(String, nullable=True)
    deadline = Column(Float, nullable=True)


class InstanceParticipant(Base):
    __tablename__ = "instance_participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    instance_id = Column(String, ForeignKey("quest_instances.instance_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)


class LobbyParticipant(Base):
    __tablename__ = "lobby_participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    instance_id = Column(String, ForeignKey("quest_instances.instance_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_ready = Column(Boolean, nullable=False, default=False)
    is_host = Column(Boolean, nullable=False, default=False)


class Connection(Base):
    __tablename__ = "connections"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    connected_user_id = Column(String, nullable=False)
    connected_user_name = Column(String, nullable=False)
    timestamp = Column(Float, nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, nullable=False, default=False)
    timestamp = Column(Float, nullable=False)
    type = Column(String, nullable=False, default="info")


class BelongingScore(Base):
    __tablename__ = "belonging_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    timestamp = Column(Float, nullable=False)


class QuestHistory(Base):
    __tablename__ = "quest_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    quest_id = Column(String, nullable=False)
    quest_type = Column(String, nullable=False)
    start_time = Column(Float, nullable=True)
    status = Column(String, nullable=False)
    group_size = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)
    end_time = Column(Float, nullable=True)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True)
    lobby_id = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(Float, nullable=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True)
    reporter_id = Column(String, ForeignKey("users.id"), nullable=False)
    target_id = Column(String, nullable=True)
    reason = Column(Text, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending")


class CheckinCode(Base):
    __tablename__ = "checkin_codes"

    code = Column(String, primary_key=True)
    quest_id = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(Float, nullable=False)


class QuestPhoto(Base):
    __tablename__ = "quest_photos"

    id = Column(String, primary_key=True)
    quest_id = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    image_data = Column(Text, nullable=False)  # base64 encoded image
    group_memory = Column(String, nullable=True)
    group_size = Column(Integer, nullable=False, default=1)
    timestamp = Column(Float, nullable=False)


class WordSelection(Base):
    __tablename__ = "word_selections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    quest_id = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    word = Column(String, nullable=False)
    timestamp = Column(Float, nullable=False)


class ReactionSelection(Base):
    __tablename__ = "reaction_selections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    quest_id = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    reaction = Column(String, nullable=False)
    attempt = Column(Integer, nullable=False, default=1)
    timestamp = Column(Float, nullable=False)
