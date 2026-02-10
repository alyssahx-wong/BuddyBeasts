#!/usr/bin/env python3
"""
Create quest instances for all templates in all hubs.
This makes quests available for users to join.
"""

import requests
import sys

BASE_URL = "http://localhost:8000"

def main():
    print("🎮 Creating Quest Instances\n")
    print("=" * 50)
    
    # Check backend
    try:
        health = requests.get(f"{BASE_URL}/health", timeout=2)
        if health.status_code != 200:
            print("❌ Backend not responding properly")
            return
    except:
        print("❌ Backend not running! Start it with:")
        print("   cd backend && python main.py")
        return
    
    print("✅ Backend is running\n")
    
    # Login to get auth token
    print("🔐 Logging in...")
    try:
        auth_response = requests.post(f"{BASE_URL}/api/auth/demo", json={
            "name": "Quest Creator"
        })
        if auth_response.status_code != 200:
            print("❌ Login failed")
            return
        
        token = auth_response.json()["token"]
        print("✅ Logged in successfully\n")
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    # Get all hubs
    print("📍 Fetching hubs...")
    try:
        hubs_response = requests.get(f"{BASE_URL}/api/hubs")
        hubs = hubs_response.json()
        print(f"✅ Found {len(hubs)} hubs\n")
    except Exception as e:
        print(f"❌ Could not fetch hubs: {e}")
        return
    
    # Get all templates
    print("📋 Fetching quest templates...")
    try:
        templates_response = requests.get(f"{BASE_URL}/api/quests/templates")
        templates = templates_response.json()
        print(f"✅ Found {len(templates)} quest templates\n")
    except Exception as e:
        print(f"❌ Could not fetch templates: {e}")
        return
    
    if not templates:
        print("⚠️  No quest templates found!")
        print("   Run: python backend/add_new_quests.py")
        return
    
    # Create instances - 2 different quests per hub
    print("🎯 Creating quest instances...")
    print("-" * 50)
    
    created = 0
    failed = 0
    
    for hub in hubs:
        # Create 2-3 different quest instances per hub
        for i, template in enumerate(templates[:3]):
            try:
                response = requests.post(
                    f"{BASE_URL}/api/quests/instances",
                    headers=headers,
                    json={
                        "templateId": template["id"],
                        "hubId": hub["id"],
                        "location": hub["location"]
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ {hub['name']}: {template['title']}")
                    created += 1
                else:
                    print(f"❌ Failed to create {template['title']} at {hub['name']}: {response.text}")
                    failed += 1
            except Exception as e:
                print(f"❌ Error creating quest: {e}")
                failed += 1
    
    print("\n" + "=" * 50)
    print(f"\n📊 Results: {created} created, {failed} failed")
    
    if created > 0:
        print("\n✨ Quest instances created successfully!")
        print("🎮 Refresh your Quest Board to see available quests!")
    else:
        print("\n⚠️  No quest instances were created.")

if __name__ == "__main__":
    main()
