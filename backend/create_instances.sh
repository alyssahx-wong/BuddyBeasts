#!/bin/bash
# Create quest instances for all templates in Main Campus Hub

BASE_URL="http://localhost:8000"
HUB_ID="hub_campus_main"

echo "🎮 Creating Quest Instances"
echo "=================================="

# Login first
echo "🔐 Logging in..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/demo" \
  -H "Content-Type: application/json" \
  -d '{"name": "Quest Creator"}')

TOKEN=$(echo $AUTH_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Get templates
echo "📋 Fetching templates..."
TEMPLATES=$(curl -s "$BASE_URL/api/quests/templates")
echo "✅ Templates fetched"
echo ""

# Create instances for Main Campus Hub
echo "🎯 Creating quest instances for Main Campus Hub..."
echo ""

QUEST_IDS=("coffee_chat" "study_jam" "sunset_walk" "lunch_crew" "game_night" "morning_workout" "art_cafe" "board_game_night" "cooking_together" "photo_walk")

for QUEST_ID in "${QUEST_IDS[@]}"; do
  echo "Creating: $QUEST_ID"
  curl -s -X POST "$BASE_URL/api/quests/instances" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"templateId\": \"$QUEST_ID\",
      \"hubId\": \"$HUB_ID\",
      \"location\": \"University Campus\"
    }" > /dev/null
  
  if [ $? -eq 0 ]; then
    echo "  ✅ Created $QUEST_ID"
  else
    echo "  ⚠️  Skipped $QUEST_ID (may already exist or template not found)"
  fi
done

echo ""
echo "=================================="
echo "✨ Done! Check your Quest Board"
