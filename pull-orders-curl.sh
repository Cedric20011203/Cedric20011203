#!/bin/bash

# Get fresh admin token
echo "🔐 Getting fresh admin token..."
TOKEN=$(curl -k -s -X POST "https://licendi.com/rest/V1/integration/admin/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}' | tr -d '"')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get admin token"
  exit 1
fi

echo "✅ Token obtained (${#TOKEN} characters)"
echo ""

# Fetch last 4 orders
echo "📦 Fetching last 4 orders from Magento..."
echo ""

curl -k --globoff -s -X GET 'https://licendi.com/rest/V1/orders?searchCriteria[pageSize]=4&searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | \
  node -e "
    const fs = require('fs');
    let data = '';
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (!response.items || response.items.length === 0) {
          console.log('❌ No orders found');
          process.exit(1);
        }

        console.log('✅ Successfully retrieved ' + response.items.length + ' orders');
        console.log('Total orders in store: ' + (response.total_count || response.items.length));
        console.log('');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');

        response.items.forEach((order, index) => {
          console.log('📋 Order ' + (index + 1) + ':');
          console.log('   Order ID: #' + order.increment_id + ' (Entity ID: ' + order.entity_id + ')');
          console.log('   Customer: ' + order.customer_email);
          console.log('   Name: ' + (order.customer_firstname || '') + ' ' + (order.customer_lastname || ''));
          console.log('   Status: ' + order.status);
          console.log('   Total: €' + order.grand_total.toFixed(2));
          console.log('   Currency: ' + order.order_currency_code);
          console.log('   Created: ' + order.created_at);
          console.log('   Store: ' + order.store_name.split('\\n').join(' > '));

          if (order.items && order.items.length > 0) {
            console.log('   Items: ' + order.items.filter(item => !item.parent_item_id).length + ' product(s)');
            order.items.filter(item => !item.parent_item_id).forEach((item, idx) => {
              console.log('     ' + (idx + 1) + '. ' + item.name);
              console.log('        SKU: ' + item.sku + ' | Qty: ' + item.qty_ordered + ' | Price: €' + (item.price || 0).toFixed(2));
            });
          }

          console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        console.log('✅ Order retrieval test completed successfully!');

      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.error('Raw data:', data.substring(0, 500));
        process.exit(1);
      }
    });
  "
