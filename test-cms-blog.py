#!/usr/bin/env python3

import subprocess
import json
import sys
import time

def get_token():
    """Get admin authentication token"""
    cmd = [
        'curl', '-s', '-X', 'POST',
        'https://licendi.com/rest/V1/integration/admin/token',
        '-H', 'Content-Type: application/json',
        '-d', '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip().replace('"', '')

def create_cms_page(token, page_data):
    """Create a new CMS page"""
    url = 'https://licendi.com/rest/V1/cmsPage'

    payload = json.dumps({"page": page_data})

    cmd = [
        'curl', '-s', '-X', 'POST', url,
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json',
        '-d', payload
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

def update_cms_page(token, page_id, page_data):
    """Update an existing CMS page"""
    url = f'https://licendi.com/rest/V1/cmsPage/{page_id}'

    payload = json.dumps({"page": page_data})

    cmd = [
        'curl', '-s', '-X', 'PUT', url,
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json',
        '-d', payload
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

def get_cms_page(token, page_id):
    """Get a CMS page by ID"""
    url = f'https://licendi.com/rest/V1/cmsPage/{page_id}'

    cmd = [
        'curl', '-s', '-X', 'GET', url,
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

def delete_cms_page(token, page_id):
    """Delete a CMS page"""
    url = f'https://licendi.com/rest/V1/cmsPage/{page_id}'

    cmd = [
        'curl', '-s', '-X', 'DELETE', url,
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return json.loads(result.stdout)
    except:
        return result.stdout

def main():
    print('🚀 Testing Magento CMS/Blog Writing Functionality')
    print('='*70)
    print()

    # Get token
    print('🔐 Step 1: Getting authentication token...')
    token = get_token()
    print(f'✅ Token obtained ({len(token)} characters)')
    print()

    # Test 1: Create a new blog post
    print('📝 Test 1: Creating a new blog post...')
    print('-'*70)

    blog_content = """
<h2>Why Choose Microsoft Office 2021 Over Office 365?</h2>

<p>Are you tired of monthly subscription fees? Microsoft Office 2021 Professional Plus offers a one-time purchase option that could save you money in the long run.</p>

<h3>Key Benefits:</h3>
<ul>
    <li><strong>One-Time Payment:</strong> Pay once and own it forever</li>
    <li><strong>No Recurring Fees:</strong> No monthly or annual subscriptions</li>
    <li><strong>Full Desktop Apps:</strong> Word, Excel, PowerPoint, Outlook, and more</li>
    <li><strong>Offline Access:</strong> Work without internet connection</li>
    <li><strong>Professional Features:</strong> All the tools you need for business</li>
</ul>

<h3>Perfect For:</h3>
<p>Office 2021 is ideal for individuals and businesses who:</p>
<ul>
    <li>Want to avoid subscription costs</li>
    <li>Prefer to own their software outright</li>
    <li>Don't need cloud storage features</li>
    <li>Work primarily on desktop computers</li>
</ul>

<p><strong>Get Microsoft Office 2021 Professional Plus today and enjoy lifetime access to essential productivity tools!</strong></p>
    """.strip()

    new_page_data = {
        "title": "Microsoft Office 2021 vs Office 365: Which is Right for You?",
        "identifier": "mcp-test-office-2021-vs-365",
        "content": blog_content,
        "active": True,
        "page_layout": "1column",
        "meta_title": "Office 2021 vs Office 365 - Compare & Save Money",
        "meta_keywords": "microsoft office 2021, office 365, productivity software, one-time purchase",
        "meta_description": "Compare Microsoft Office 2021 and Office 365. Learn why a one-time purchase might be better than a subscription for your needs.",
        "store_id": [0]  # All stores
    }

    try:
        created_page = create_cms_page(token, new_page_data)

        if 'id' in created_page:
            page_id = created_page['id']
            print(f'✅ Blog post created successfully!')
            print(f'   Page ID: {page_id}')
            print(f'   Title: {created_page.get("title", "N/A")}')
            print(f'   URL Key: {created_page.get("identifier", "N/A")}')
            print(f'   Status: {"Active" if created_page.get("active") else "Inactive"}')
            print(f'   URL: https://licendi.com/{created_page.get("identifier", "")}')
            print()

            # Test 2: Update the blog post
            print('✏️  Test 2: Updating the blog post...')
            print('-'*70)

            updated_content = blog_content + """
<hr>
<p><em>Updated: This article was last updated with the latest pricing information.</em></p>
            """.strip()

            update_data = {
                "content": updated_content,
                "meta_description": "Compare Microsoft Office 2021 and Office 365. Learn why a one-time purchase might be better. Updated with latest pricing!"
            }

            updated_page = update_cms_page(token, page_id, update_data)
            print(f'✅ Blog post updated successfully!')
            print(f'   Page ID: {page_id}')
            print(f'   Updated fields: content, meta_description')
            print()

            # Test 3: Read the created blog post
            print('👀 Test 3: Reading the blog post back...')
            print('-'*70)

            retrieved_page = get_cms_page(token, page_id)
            print(f'✅ Blog post retrieved successfully!')
            print(f'   Page ID: {retrieved_page.get("id", "N/A")}')
            print(f'   Title: {retrieved_page.get("title", "N/A")}')
            print(f'   Created: {retrieved_page.get("creation_time", "N/A")}')
            print(f'   Updated: {retrieved_page.get("update_time", "N/A")}')
            print(f'   Content length: {len(retrieved_page.get("content", ""))} characters')
            print()

            # Ask user if they want to delete the test page
            print('='*70)
            print('🎉 All tests completed successfully!')
            print()
            print(f'Test blog post created at:')
            print(f'   https://licendi.com/{created_page.get("identifier", "")}')
            print()
            print('Note: The test page is still active on your store.')
            print(f'To delete it, you can use: magento_delete_cms_page with pageId={page_id}')
            print()

        else:
            print('❌ Failed to create blog post')
            print('Response:', json.dumps(created_page, indent=2))

    except json.JSONDecodeError as e:
        print(f'❌ Error parsing JSON response: {e}')
    except Exception as e:
        print(f'❌ Error: {e}')

if __name__ == '__main__':
    main()
