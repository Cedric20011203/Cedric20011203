#!/usr/bin/env python3

import subprocess
import json
import sys

def get_token():
    cmd = [
        'curl', '-s', '-X', 'POST',
        'https://licendi.com/rest/V1/integration/admin/token',
        '-H', 'Content-Type: application/json',
        '-d', '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip().replace('"', '')

def get_recent_orders(token, limit=50):
    url = f'https://licendi.com/rest/V1/orders?searchCriteria%5BpageSize%5D={limit}&searchCriteria%5BsortOrders%5D%5B0%5D%5Bfield%5D=created_at&searchCriteria%5BsortOrders%5D%5B0%5D%5Bdirection%5D=DESC'

    cmd = [
        'curl', '--globoff', '-s', '-X', 'GET', url,
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

def main():
    target_email = 'hjs-ber@web.de'

    print(f'🔍 Searching for orders from {target_email}')
    print()

    # Get token
    print('Getting authentication token...')
    token = get_token()
    print(f'✅ Token obtained ({len(token)} characters)')
    print()

    # Get recent orders
    print('Fetching recent orders...')
    data = get_recent_orders(token, 50)

    if 'items' not in data:
        print('❌ No orders data received')
        sys.exit(1)

    print(f'✅ Retrieved {len(data["items"])} recent orders')
    print()

    # Filter for the specific customer
    customer_orders = [o for o in data['items'] if o.get('customer_email', '').lower() == target_email.lower()]

    if not customer_orders:
        print(f'❌ No orders found for {target_email}')
        print(f'   Searched through {len(data["items"])} recent orders')
        sys.exit(0)

    print(f'✅ Found {len(customer_orders)} order(s) for {target_email}')
    print()
    print('='*70)
    print()

    for idx, order in enumerate(customer_orders, 1):
        print(f'📋 Order {idx}: #{order["increment_id"]}')
        print(f'   Date: {order["created_at"]}')
        print(f'   Status: {order["status"]}')
        print(f'   Total: €{order["grand_total"]:.2f}')

        if order.get('customer_firstname') or order.get('customer_lastname'):
            print(f'   Customer: {order.get("customer_firstname", "")} {order.get("customer_lastname", "")}')

        print(f'   Products:')

        if 'items' in order and order['items']:
            visio_found = False
            for item in order['items']:
                # Skip child items
                if item.get('parent_item_id'):
                    continue

                print(f'     ✓ {item["name"]}')
                print(f'       SKU: {item["sku"]}')
                print(f'       Qty: {item.get("qty_ordered", 0)} x €{item.get("price", 0):.2f}')

                # Highlight Visio products
                if 'visio' in item['name'].lower():
                    print(f'       🎯 ⭐ THIS IS THE VISIO PRODUCT ⭐ 🎯')
                    visio_found = True

        print()

        if not visio_found:
            print('   ⚠️  No VISIO product found in this order')
            print()

    print('='*70)

if __name__ == '__main__':
    main()
