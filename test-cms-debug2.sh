#!/bin/bash

echo "🔍 Testing CMS Page Creation - Try 2"
echo ""

# Get token
TOKEN=$(curl -s -X POST "https://licendi.com/rest/V1/integration/admin/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}' | tr -d '"')

echo "Token obtained"
echo ""

# Try different payload structures
echo "Test 1: Without store_id field"
PAYLOAD1='{
  "page": {
    "title": "MCP Test Blog Post",
    "identifier": "mcp-test-blog-v1",
    "content": "<h1>Test Blog Post</h1><p>This is a test created via MCP API.</p>",
    "active": true,
    "page_layout": "1column"
  }
}'

echo "Sending..."
RESPONSE1=$(curl -s -X POST "https://licendi.com/rest/V1/cmsPage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD1")

echo "Response 1:"
echo "$RESPONSE1" | python3 -m json.tool 2>&1
echo ""
echo "---"
echo ""

# Try with stores array
echo "Test 2: With stores array"
PAYLOAD2='{
  "page": {
    "title": "MCP Test Blog Post V2",
    "identifier": "mcp-test-blog-v2",
    "content": "<h1>Test Blog Post</h1><p>This is a test created via MCP API.</p>",
    "active": true,
    "page_layout": "1column",
    "stores": [0]
  }
}'

echo "Sending..."
RESPONSE2=$(curl -s -X POST "https://licendi.com/rest/V1/cmsPage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD2")

echo "Response 2:"
echo "$RESPONSE2" | python3 -m json.tool 2>&1
echo ""
