#!/usr/bin/env python3
"""
Example script showing how to add quests to the Gatherlings backend.

Usage:
    python add_quest_example.py

This script demonstrates:
1. Creating a quest template (reusable quest type)
2. Creating a quest instance (active quest users can join)
"""

import requests
import json

# Backend URL (adjust if needed)
BASE_URL = "http://localhost:8000"

# You'll need a valid auth token - get this from login
# For demo purposes, you can use the demo auth endpoint
AUTH_TOKEN = None  # Will be set by demo_login()


def demo_login():
    """Get an auth token using demo login."""
    response = requests.post(f"{BASE_URL}/api/auth/demo", json={
        "name": "Quest Creator"
    })
    if response.status_code == 200:
        data = response.json()
        return data["token"]
    else:
        print(f"Login failed: {response.text}")
        return None


def create_quest_template(template_data):
    """
    Create a new quest template.
    
    Args:
        template_data: Dictionary with quest template fields
    """
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(
        f"{BASE_URL}/api/quests/templates",
        headers=headers,
        json=template_data
    )
    
    if response.status_code == 200:
        print(f"✅ Quest template created: {template_data['title']}")
        return response.json()
    else:
        print(f"❌ Failed to create template: {response.text}")
        return None


def create_quest_instance(template_id, hub_id, location="", auth_token=None):
    """
    Create a quest instance (active quest).
    
    Args:
        template_id: ID of the quest template to use
        hub_id: ID of the hub where quest takes place
        location: Optional specific location
        auth_token: User authentication token
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}" if auth_token else ""
    }
    
    response = requests.post(
        f"{BASE_URL}/api/quests/instances",
        headers=headers,
        json={
            "templateId": template_id,
            "hubId": hub_id,
            "location": location
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Quest instance created!")
        return response.json()
    else:
        print(f"❌ Failed to create instance: {response.text}")
        return None


def list_templates():
    """List all available quest templates."""
    response = requests.get(f"{BASE_URL}/api/quests/templates")
    if response.status_code == 200:
        templates = response.json()
        print(f"\n📋 Available Templates ({len(templates)}):")
        for t in templates:
            print(f"  - {t['id']}: {t['title']} ({t['duration']}min, {t['crystals']}💎)")
        return templates
    return []


def list_instances(hub_id=None):
    """List active quest instances."""
    url = f"{BASE_URL}/api/quests/instances"
    if hub_id:
        url += f"?hub_id={hub_id}"
    
    response = requests.get(url)
    if response.status_code == 200:
        instances = response.json()
        print(f"\n🎯 Active Quests ({len(instances)}):")
        for q in instances:
            print(f"  - {q['title']}: {q['currentParticipants']}/{q['maxParticipants']} participants")
        return instances
    return []


# ── Example Quest Templates ──────────────────────────────────────────────────

EXAMPLE_QUESTS = [
    {
        "id": "board_game_night",
        "title": "Board Game Night",
        "description": "Gather for a fun evening of board games and snacks",
        "duration": 120,
        "minParticipants": 3,
        "maxParticipants": 6,
        "difficulty": "easy",
        "crystals": 150,
        "icon": "🎲",
        "type": "board_game",
        "tags": ["indoor", "social", "evening", "games"]
    },
    {
        "id": "morning_workout",
        "title": "Morning Workout",
        "description": "Start your day with an energizing group workout session",
        "duration": 45,
        "minParticipants": 2,
        "maxParticipants": 8,
        "difficulty": "medium",
        "crystals": 100,
        "icon": "💪",
        "type": "fitness",
        "tags": ["outdoor", "active", "morning", "health"]
    },
    {
        "id": "cooking_together",
        "title": "Cooking Together",
        "description": "Learn to cook a new recipe and share a meal together",
        "duration": 90,
        "minParticipants": 2,
        "maxParticipants": 4,
        "difficulty": "medium",
        "crystals": 125,
        "icon": "👨‍🍳",
        "type": "cooking",
        "tags": ["indoor", "creative", "food", "skill-building"]
    },
    {
        "id": "photo_walk",
        "title": "Photography Walk",
        "description": "Explore the neighborhood and practice photography skills",
        "duration": 60,
        "minParticipants": 2,
        "maxParticipants": 5,
        "difficulty": "easy",
        "crystals": 80,
        "icon": "📸",
        "type": "photo_walk",
        "tags": ["outdoor", "creative", "exploration", "art"]
    },
    {
        "id": "karaoke_session",
        "title": "Karaoke Session",
        "description": "Sing your heart out with friends at a karaoke spot",
        "duration": 90,
        "minParticipants": 3,
        "maxParticipants": 8,
        "difficulty": "easy",
        "crystals": 110,
        "icon": "🎤",
        "type": "karaoke",
        "tags": ["indoor", "social", "music", "fun"]
    },
    {
        "id": "hiking_adventure",
        "title": "Hiking Adventure",
        "description": "Challenge yourselves with a scenic hiking trail",
        "duration": 180,
        "minParticipants": 3,
        "maxParticipants": 8,
        "difficulty": "hard",
        "crystals": 200,
        "icon": "⛰️",
        "type": "hiking",
        "tags": ["outdoor", "active", "nature", "adventure"]
    },
]


# ── Main Script ──────────────────────────────────────────────────────────────

def main():
    print("🎮 Gatherlings Quest Manager\n")
    print("=" * 50)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("❌ Backend is not responding. Make sure it's running on port 8000.")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running:")
        print("   cd backend && python main.py")
        return
    
    print("✅ Connected to backend\n")
    
    # Option 1: Create quest templates
    print("\n📝 Creating Example Quest Templates...")
    print("-" * 50)
    for quest in EXAMPLE_QUESTS:
        create_quest_template(quest)
    
    # List all templates
    list_templates()
    
    # Option 2: Create a quest instance (requires login)
    print("\n\n🎯 Creating Quest Instance Example...")
    print("-" * 50)
    
    # Login first
    token = demo_login()
    if token:
        print(f"✅ Logged in successfully")
        
        # Create an instance of the first quest
        instance = create_quest_instance(
            template_id="board_game_night",
            hub_id="hub_campus_main",  # Use an existing hub ID
            location="Student Center Game Room",
            auth_token=token
        )
        
        if instance:
            print(f"   Instance ID: {instance['instanceId']}")
            print(f"   Location: {instance['location']}")
            print(f"   Participants: {instance['currentParticipants']}/{instance['maxParticipants']}")
        
        # List active instances
        list_instances()
    else:
        print("⚠️  Skipping instance creation (login required)")
    
    print("\n" + "=" * 50)
    print("\n✨ Done! You can now view these quests in your app.")
    print("\n💡 Tips:")
    print("   - Quest templates are reusable quest types")
    print("   - Quest instances are active quests users can join")
    print("   - View API docs at: http://localhost:8000/docs")


if __name__ == "__main__":
    main()
