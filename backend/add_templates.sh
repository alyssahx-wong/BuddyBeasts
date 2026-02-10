#!/bin/bash
BASE_URL="http://localhost:8000"

echo "Adding new quest templates..."

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"poetry_slam","title":"Poetry Slam","description":"Share poems and creative writing with the group","duration":75,"minParticipants":3,"maxParticipants":10,"difficulty":"easy","crystals":95,"icon":"📝","type":"poetry","tags":["indoor","creative","social","art"]}' && echo "✓ poetry_slam"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"bike_ride","title":"Group Bike Ride","description":"Explore the city on two wheels together","duration":90,"minParticipants":3,"maxParticipants":8,"difficulty":"medium","crystals":115,"icon":"🚴","type":"biking","tags":["outdoor","active","exploration","fitness"]}' && echo "✓ bike_ride"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"picnic_park","title":"Picnic in the Park","description":"Bring snacks and enjoy outdoor time together","duration":90,"minParticipants":3,"maxParticipants":10,"difficulty":"easy","crystals":85,"icon":"🧺","type":"picnic","tags":["outdoor","social","food","relaxing"]}' && echo "✓ picnic_park"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"skill_swap","title":"Skill Swap Workshop","description":"Teach and learn new skills from each other","duration":60,"minParticipants":3,"maxParticipants":6,"difficulty":"medium","crystals":105,"icon":"💡","type":"learning","tags":["indoor","skill-building","collaborative","educational"]}' && echo "✓ skill_swap"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"farmers_market","title":"Farmers Market Visit","description":"Explore the local farmers market and support local vendors","duration":60,"minParticipants":2,"maxParticipants":6,"difficulty":"easy","crystals":70,"icon":"🥬","type":"exploration","tags":["outdoor","social","food","community"]}' && echo "✓ farmers_market"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"meditation_circle","title":"Meditation Circle","description":"Practice mindfulness together in a peaceful setting","duration":45,"minParticipants":3,"maxParticipants":12,"difficulty":"easy","crystals":75,"icon":"🧘‍♀️","type":"wellness","tags":["outdoor","wellness","relaxing","mindfulness"]}' && echo "✓ meditation_circle"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"dance_class","title":"Dance Class","description":"Learn new dance moves and have fun moving together","duration":75,"minParticipants":4,"maxParticipants":12,"difficulty":"medium","crystals":110,"icon":"💃","type":"dance","tags":["indoor","active","fun","fitness"]}' && echo "✓ dance_class"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"star_gazing","title":"Star Gazing Night","description":"Watch the night sky and learn about constellations","duration":90,"minParticipants":2,"maxParticipants":8,"difficulty":"easy","crystals":80,"icon":"✨","type":"stargazing","tags":["outdoor","evening","educational","nature"]}' && echo "✓ star_gazing"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"volunteering","title":"Community Volunteering","description":"Give back to the community through volunteer work","duration":120,"minParticipants":4,"maxParticipants":15,"difficulty":"medium","crystals":160,"icon":"❤️","type":"volunteer","tags":["outdoor","volunteer","community","meaningful"]}' && echo "✓ volunteering"

curl -s -X POST "$BASE_URL/api/quests/templates" -H "Content-Type: application/json" -d '{"id":"pottery_class","title":"Pottery Workshop","description":"Get hands-on with clay and create pottery together","duration":120,"minParticipants":3,"maxParticipants":8,"difficulty":"medium","crystals":135,"icon":"🫔","type":"pottery","tags":["indoor","creative","art","skill-building"]}' && echo "✓ pottery_class"

echo ""
echo "Done adding templates!"
