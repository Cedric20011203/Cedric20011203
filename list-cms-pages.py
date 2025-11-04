#!/usr/bin/env python3

import subprocess
import json

def get_token():
    cmd = [
        'curl', '-s', '-X', 'POST',
        'https://licendi.com/rest/V1/integration/admin/token',
        '-H', 'Content-Type: application/json',
        '-d', '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip().replace('"', '')

def list_cms_pages(token):
    cmd = [
        'curl', '--globoff', '-s', '-X', 'GET',
        'https://licendi.com/rest/V1/cmsPage/search?searchCriteria[pageSize]=10',
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

print('📄 Listing CMS Pages from Magento\n')

token = get_token()
print(f'✅ Token obtained\n')

pages_data = list_cms_pages(token)

if 'items' in pages_data and len(pages_data['items']) > 0:
    print(f'Found {len(pages_data["items"])} CMS pages:\n')
    for idx, page in enumerate(pages_data['items'], 1):
        print(f'{idx}. {page.get("title")}')
        print(f'   ID: {page.get("id")}')
        print(f'   URL: {page.get("identifier")}')
        print(f'   Status: {"Active" if page.get("active") else "Inactive"}')
        print(f'   Created: {page.get("creation_time", "N/A")}')
        print()
else:
    print('No CMS pages found or error occurred')
    print(json.dumps(pages_data, indent=2))
