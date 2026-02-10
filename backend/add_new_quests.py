#!/usr/bin/env python3
"""Add new quest templates to existing database."""

import requests

BASE_URL = "http://localhost:8000"

NEW_QUESTS = [
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
        "tags": ["indoor", "social", "evening", "games"],
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
        "tags": ["indoor", "creative", "food", "skill-building"],
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
        "tags": ["outdoor", "creative", "exploration", "art"],
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
        "tags": ["indoor", "social", "music", "fun"],
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
        "tags": ["outdoor", "active", "nature", "adventure"],
    },
    {
        "id": "book_club",
        "title": "Book Club Meeting",
        "description": "Discuss the latest book club selection over tea",
        "duration": 75,
        "minParticipants": 3,
        "maxParticipants": 8,
        "difficulty": "easy",
        "crystals": 95,
        "icon": "📖",
        "type": "book_club",
        "tags": ["indoor", "intellectual", "social", "reading"],
    },
    {
        "id": "movie_night",
        "title": "Movie Night",
        "description": "Watch a movie together and discuss afterwards",
        "duration": 150,
        "minParticipants": 3,
        "maxParticipants": 10,
        "difficulty": "easy",
        "crystals": 90,
        "icon": "🎬",
        "type": "movie",
        "tags": ["indoor", "social", "evening", "entertainment"],
    },
    {
        "id": "beach_cleanup",
        "title": "Beach Cleanup",
        "description": "Help clean up the local beach and protect the environment",
        "duration": 90,
        "minParticipants": 4,
        "maxParticipants": 12,
        "difficulty": "medium",
        "crystals": 140,
        "icon": "🏖️",
        "type": "volunteer",
        "tags": ["outdoor", "volunteer", "environment", "community"],
    },
    {
        "id": "yoga_session",
        "title": "Group Yoga",
        "description": "Relaxing group yoga session in the park",
        "duration": 60,
        "minParticipants": 3,
        "maxParticipants": 10,
        "difficulty": "easy",
        "crystals": 85,
        "icon": "🧘",
        "type": "fitness",
        "tags": ["outdoor", "wellness", "relaxing", "health"],
    },
    {
        "id": "trivia_night",
        "title": "Trivia Night",
        "description": "Test your knowledge at a local trivia competition",
        "duration": 120,
        "minParticipants": 3,
        "maxParticipants": 6,
        "difficulty": "medium",
        "crystals": 130,
        "icon": "🧠",
        "type": "trivia",
        "tags": ["indoor", "social", "intellectual", "competitive"],
    },
]

def main():
    print("🎮 Adding New Quests to Gatherlings\n")
    print("=" * 50)
    
    # Check backend
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except:
        print("❌ Backend not running! Start it with:")
        print("   cd backend && python main.py")
        return
    
    print("✅ Backend is running\n")
    
    # Add each quest
    added = 0
    skipped = 0
    
    for quest in NEW_QUESTS:
        response = requests.post(
            f"{BASE_URL}/api/quests/templates",
            json=quest
        )
        
        if response.status_code == 200:
            print(f"✅ Added: {quest['title']}")
            added += 1
        elif response.status_code == 400 and "already exists" in response.text:
            print(f"⏭️  Skipped: {quest['title']} (already exists)")
            skipped += 1
        else:
            print(f"❌ Failed: {quest['title']} - {response.text}")
    
    print("\n" + "=" * 50)
    print(f"\n📊 Results: {added} added, {skipped} skipped")
    print("✨ Done! Refresh your quest board to see the new quests.")

if __name__ == "__main__":
    main()
