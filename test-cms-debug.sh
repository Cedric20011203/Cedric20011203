#!/bin/bash

echo "🔍 Testing CMS Page Creation (Debug Mode)"
echo ""

# Get token
echo "Getting token..."
TOKEN=$(curl -s -X POST "https://licendi.com/rest/V1/integration/admin/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}' | tr -d '"')

echo "Token: ${TOKEN:0:50}..."
echo ""

# Try to create a simple CMS page
echo "Creating CMS page..."

PAYLOAD='{
  "page": {
    "title": "MCP Test Blog Post",
    "identifier": "mcp-test-post-simple",
    "content": "<h1>Test Blog Post</h1><p>This is a test post created via MCP.</p>",
    "active": true,
    "page_layout": "1column",
    "store_id": [0]
  }
}'

echo "Payload:"
echo "$PAYLOAD" | python3 -m json.tool
echo ""

echo "Sending request..."
RESPONSE=$(curl -s -X POST "https://licendi.com/rest/V1/cmsPage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "Response:"
echo "$RESPONSE"
echo ""

if [ -z "$RESPONSE" ]; then
  echo "❌ Empty response received"
else
  echo "Response length: ${#RESPONSE} characters"
  echo ""
  echo "Trying to parse as JSON..."
  echo "$RESPONSE" | python3 -m json.tool 2>&1 || echo "Not valid JSON"
fi
