#!/usr/bin/env python3
"""Add more quest instances to Main Campus Hub."""

import requests
import time

BASE_URL = "http://localhost:8000"

# Get auth token
auth_response = requests.post(f"{BASE_URL}/api/auth/demo", json={"name": "Quest Admin"})
token = auth_response.json()["token"]

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

# New quest template IDs to add
new_quests = [
    "poetry_slam",
    "bike_ride", 
    "picnic_park",
    "skill_swap",
    "farmers_market",
    "meditation_circle",
    "dance_class",
    "star_gazing",
    "volunteering",
    "pottery_class",
]

# Create instances for each new quest template
for quest_id in new_quests:
    try:
        response = requests.post(
            f"{BASE_URL}/api/quests/instances",
            headers=headers,
            json={
                "templateId": quest_id,
                "hubId": "hub_campus_main",
                "startTime": "2026-02-12T15:00:00",
                "location": "University Campus"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Created {quest_id}: {result.get('instanceId')}")
        else:
            print(f"✗ Failed to create {quest_id}: {response.status_code} - {response.text}")
            
        time.sleep(0.2)  # Small delay between requests
    except Exception as e:
        print(f"✗ Error creating {quest_id}: {e}")

print("\n✓ Done! Added more quests to Main Campus Hub")
