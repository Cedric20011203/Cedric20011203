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

def create_draft_blog(token):
    """Create a draft blog post"""

    blog_content = """
<div class="blog-post">
    <h2>5 Reasons to Choose Microsoft Visio 2021 Professional</h2>

    <p>Microsoft Visio 2021 Professional is the ultimate diagramming tool for businesses and professionals. Whether you're creating flowcharts, organizational charts, or network diagrams, Visio provides the tools you need.</p>

    <h3>1. Professional Diagrams Made Easy</h3>
    <p>Create professional-quality diagrams with thousands of built-in templates and shapes. From simple flowcharts to complex network diagrams, Visio has you covered.</p>

    <h3>2. One-Time Purchase, Lifetime Access</h3>
    <p>Unlike subscription-based services, Visio 2021 Professional is a one-time purchase. Pay once and use it forever without recurring monthly fees.</p>

    <h3>3. Seamless Integration with Microsoft Office</h3>
    <p>Visio integrates perfectly with Word, Excel, PowerPoint, and other Microsoft Office applications. Easily import and export data between applications.</p>

    <h3>4. Collaboration Features</h3>
    <p>Share your diagrams with team members and collaborate in real-time. Visio supports co-authoring and commenting features for better teamwork.</p>

    <h3>5. Advanced Data Visualization</h3>
    <p>Connect your diagrams to real-time data sources. Visio can automatically update diagrams based on data changes, making it perfect for dynamic business processes.</p>

    <h3>Who Should Use Visio 2021?</h3>
    <ul>
        <li><strong>Business Analysts:</strong> Create process flows and business models</li>
        <li><strong>IT Professionals:</strong> Design network and infrastructure diagrams</li>
        <li><strong>Project Managers:</strong> Visualize project timelines and workflows</li>
        <li><strong>Engineers:</strong> Create technical drawings and schematics</li>
        <li><strong>Organizations:</strong> Build organizational charts and hierarchy structures</li>
    </ul>

    <p class="cta"><strong>Ready to start creating professional diagrams? Get Microsoft Visio 2021 Professional today!</strong></p>
</div>
    """.strip()

    # Create page data - DRAFT (active=false)
    page_data = {
        "title": "5 Reasons to Choose Microsoft Visio 2021 Professional",
        "identifier": "visio-2021-professional-benefits",
        "content": blog_content,
        "active": False,  # DRAFT MODE
        "page_layout": "1column",
        "meta_title": "Microsoft Visio 2021 Professional - Top 5 Benefits",
        "meta_keywords": "microsoft visio, visio 2021, professional diagramming, flowcharts, business diagrams",
        "meta_description": "Discover the top 5 reasons why Microsoft Visio 2021 Professional is the best choice for creating professional diagrams and flowcharts."
    }

    payload = json.dumps({"page": page_data})

    url = 'https://licendi.com/rest/V1/cmsPage'

    cmd = [
        'curl', '-s', '-X', 'POST', url,
        '-H', f'Authorization: Bearer {token}',
        '-H', 'Content-Type: application/json',
        '-d', payload
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    # Handle empty or error responses
    if not result.stdout or result.stdout.strip() == '':
        return {'error': 'Empty response from server'}

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {'error': 'Invalid JSON response', 'raw': result.stdout}

def main():
    print('📝 Creating Draft Blog Post for Magento Store')
    print('='*70)
    print()

    # Get token
    print('🔐 Getting authentication token...')
    token = get_token()
    print(f'✅ Token obtained ({len(token)} characters)')
    print()

    # Create draft blog
    print('📄 Creating DRAFT blog post about Microsoft Visio 2021...')
    print()

    result = create_draft_blog(token)

    if 'error' in result:
        print(f'❌ Error: {result["error"]}')
        if 'raw' in result:
            print(f'Raw response: {result["raw"][:500]}')
    elif 'message' in result:
        print(f'⚠️  API returned message: {result["message"]}')
        if 'parameters' in result:
            print(f'   Parameters: {result["parameters"]}')
        print()
        print('This might be a field validation error. Checking Magento logs may help.')
    elif 'id' in result:
        print('✅ SUCCESS! Draft blog post created!')
        print()
        print('Blog Post Details:')
        print(f'   Page ID: {result.get("id")}')
        print(f'   Title: {result.get("title")}')
        print(f'   URL Key: {result.get("identifier")}')
        print(f'   Status: {"🟢 Published" if result.get("active") else "🟡 DRAFT"}')
        print(f'   Created: {result.get("creation_time", "N/A")}')
        print()
        print(f'   Preview URL (when published): https://licendi.com/{result.get("identifier")}')
        print()
        print('To publish this draft:')
        print(f'   - Go to Magento Admin > Content > Pages')
        print(f'   - Find page ID {result.get("id")}')
        print(f'   - Set "Enable Page" to Yes')
        print('   - Or use magento_update_cms_page with active=true')
        print()
        print('='*70)
        print('✅ Draft blog post ready for review in Magento admin!')
    else:
        print('⚠️  Unexpected response format:')
        print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()
