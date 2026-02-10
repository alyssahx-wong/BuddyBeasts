#!/bin/bash
# Quest API Examples for Gatherlings
# Make sure your backend is running on http://localhost:8000

BASE_URL="http://localhost:8000"

echo "🎮 Gatherlings Quest API Examples"
echo "=================================="
echo ""

# 1. CREATE A QUEST TEMPLATE
echo "1️⃣  Creating a new quest template..."
curl -X POST "$BASE_URL/api/quests/templates" \
  -H "Content-Type: application/json" \
  -d '{
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
    "tags": ["indoor", "social", "evening", "entertainment"]
  }'
echo -e "\n\n"

# 2. LIST ALL QUEST TEMPLATES
echo "2️⃣  Listing all quest templates..."
curl -X GET "$BASE_URL/api/quests/templates"
echo -e "\n\n"

# 3. CREATE A QUEST INSTANCE (requires authentication)
# First, login to get a token
echo "3️⃣  Logging in to get auth token..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/demo" \
  -H "Content-Type: application/json" \
  -d '{"name": "Quest Creator"}')

TOKEN=$(echo $AUTH_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo "✅ Logged in successfully"
  echo ""
  
  echo "4️⃣  Creating a quest instance..."
  curl -X POST "$BASE_URL/api/quests/instances" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "templateId": "coffee_chat",
      "hubId": "hub_campus_main",
      "location": "Campus Café"
    }'
  echo -e "\n\n"
  
  # 5. LIST ACTIVE QUEST INSTANCES
  echo "5️⃣  Listing active quest instances..."
  curl -X GET "$BASE_URL/api/quests/instances"
  echo -e "\n\n"
  
  # 6. LIST INSTANCES FOR SPECIFIC HUB
  echo "6️⃣  Listing quests for specific hub..."
  curl -X GET "$BASE_URL/api/quests/instances?hub_id=hub_campus_main"
  echo -e "\n\n"
else
  echo "❌ Login failed - skipping authenticated endpoints"
fi

echo "=================================="
echo "✨ Done!"
echo ""
echo "💡 View interactive API docs at: $BASE_URL/docs"
