#!/bin/bash

# Helper script to create users in the dashboard
# Usage: ./scripts/create-user.sh

PROD_URL="https://ultimate-report-dashboard-main-otxe5dvdm.vercel.app"

echo "🔧 User Creation Tool"
echo "===================="
echo ""

read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""
read -p "Role (admin/client): " ROLE

if [ "$ROLE" = "client" ]; then
    read -p "Client Slug (or leave empty for admin): " CLIENT_ID
else
    CLIENT_ID=""
fi

echo ""
echo "Creating user..."

if [ -n "$CLIENT_ID" ]; then
    PAYLOAD="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"$ROLE\",\"clientId\":\"$CLIENT_ID\"}"
else
    PAYLOAD="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"$ROLE\"}"
fi

curl -X POST "$PROD_URL/api/admin/add-user" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  | python3 -m json.tool

echo ""
echo "✅ User creation complete!"
echo ""
echo "Login at: $PROD_URL/login"
echo "Email: $EMAIL"
