#!/usr/bin/env python3
"""
Remove demo users from quest instances.
This cleans up 'demo_*' participants from all quests.
"""

import requests
import sys

BASE_URL = "http://localhost:8000"

def main():
    print("🧹 Cleaning up Quest Creator demo users\n")
    print("=" * 50)
    
    # Check backend
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except:
        print("❌ Backend not running!")
        return
    
    print("✅ Backend is running\n")
    
    # Get all quest instances
    print("📋 Fetching quest instances...")
    try:
        response = requests.get(f"{BASE_URL}/api/quests/instances")
        quests = response.json()
        print(f"✅ Found {len(quests)} quest instances\n")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Find quests with demo users
    demo_quests = []
    for quest in quests:
        demo_participants = [p for p in quest.get('participants', []) if 'demo_' in p]
        if demo_participants:
            demo_quests.append({
                'id': quest['instanceId'],
                'title': quest['title'],
                'demo_users': demo_participants,
                'all_participants': quest['participants']
            })
    
    if not demo_quests:
        print("✨ No demo users found in quests!")
        return
    
    print(f"🔍 Found {len(demo_quests)} quests with demo users:")
    for q in demo_quests:
        print(f"  - {q['title']}: {len(q['demo_users'])} demo users")
    
    print("\n⚠️  This requires direct database access.")
    print("Option 1: Delete these quest instances (they'll be recreated)")
    print("Option 2: Manually update the database")
    print("\nTo delete quest instances with demo users, use SQL:")
    print("DELETE FROM instance_participants WHERE user_id LIKE 'demo_%';")
    print("UPDATE quest_instances SET current_participants = (")
    print("  SELECT COUNT(*) FROM instance_participants")
    print("  WHERE instance_id = quest_instances.instance_id")
    print(");")

if __name__ == "__main__":
    main()
