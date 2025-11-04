#!/bin/bash

echo "🔍 Searching for orders from hjs-ber@web.de"
echo ""

# Get token
TOKEN=$(curl -s -X POST "https://licendi.com/rest/V1/integration/admin/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}' | tr -d '"')

echo "✅ Token obtained"
echo ""

# Search for orders - using URL encoding for the email search
curl --globoff -s "https://licendi.com/rest/V1/orders?searchCriteria[filterGroups][0][filters][0][field]=customer_email&searchCriteria[filterGroups][0][filters][0][value]=hjs-ber@web.de&searchCriteria[filterGroups][0][filters][0][conditionType]=eq" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | \
  python3 -c "
import sys, json

try:
    data = json.load(sys.stdin)

    if 'items' not in data or len(data['items']) == 0:
        print('❌ No orders found for hjs-ber@web.de')
        sys.exit(0)

    print(f\"✅ Found {len(data['items'])} order(s)\\n\")

    for idx, order in enumerate(data['items'], 1):
        print(f\"📋 Order {idx}: #{order['increment_id']}\")
        print(f\"   Date: {order['created_at']}\")
        print(f\"   Status: {order['status']}\")
        print(f\"   Total: €{order['grand_total']:.2f}\")
        print(f\"   Products:\")

        if 'items' in order and order['items']:
            for item in order['items']:
                # Skip child items
                if 'parent_item_id' in item and item['parent_item_id']:
                    continue

                print(f\"     ✓ {item['name']}\")
                print(f\"       SKU: {item['sku']}\")
                print(f\"       Qty: {item.get('qty_ordered', 0)} x €{item.get('price', 0):.2f}\")

                # Highlight Visio products
                if 'visio' in item['name'].lower():
                    print(f\"       ⭐ THIS IS THE VISIO PRODUCT ⭐\")

        print()

except json.JSONDecodeError as e:
    print(f'❌ Error parsing JSON: {e}')
    sys.exit(1)
"
