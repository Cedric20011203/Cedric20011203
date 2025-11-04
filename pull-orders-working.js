#!/usr/bin/env node

/**
 * Pull last 4 orders from Magento using direct HTTP requests
 */

import https from 'https';
import http from 'http';

const BASE_URL = 'https://licendi.com';
const USERNAME = 'Cedric.licendi';
const PASSWORD = 'guptip-reWwav-9kawwa';

// Create agent that ignores SSL errors
const agent = new https.Agent({
  rejectUnauthorized: false
});

console.log('🔐 Step 1: Getting admin token from Magento...\n');

// Function to make POST request
function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      agent: agent,
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (e) {
            // Response might be a plain string (token)
            resolve(responseData.replace(/"/g, ''));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Function to make GET request
function makeGetRequest(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      agent: agent,
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    // Step 1: Get admin token
    const token = await makePostRequest(
      `${BASE_URL}/rest/V1/integration/admin/token`,
      { username: USERNAME, password: PASSWORD }
    );

    console.log('✅ Admin token obtained!');
    console.log(`   Token length: ${token.length} characters\n`);

    // Step 2: Fetch last 4 orders
    console.log('📦 Step 2: Fetching last 4 orders...\n');

    const ordersUrl = `${BASE_URL}/rest/V1/orders?searchCriteria[pageSize]=4&searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC`;
    const response = await makeGetRequest(ordersUrl, token);

    if (!response.items || response.items.length === 0) {
      console.log('❌ No orders found in the store');
      return;
    }

    console.log(`✅ Successfully retrieved ${response.items.length} orders`);
    console.log(`   Total orders in store: ${response.total_count || response.items.length}\n`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Display each order
    response.items.forEach((order, index) => {
      console.log(`📋 Order ${index + 1}:`);
      console.log(`   Order ID: #${order.increment_id} (Entity ID: ${order.entity_id})`);
      console.log(`   Customer: ${order.customer_email}`);
      console.log(`   Name: ${order.customer_firstname || ''} ${order.customer_lastname || ''}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: €${order.grand_total.toFixed(2)}`);
      console.log(`   Currency: ${order.order_currency_code}`);
      console.log(`   Created: ${order.created_at}`);

      if (order.store_name) {
        console.log(`   Store: ${order.store_name.split('\n').join(' > ')}`);
      }

      if (order.items && order.items.length > 0) {
        const mainItems = order.items.filter(item => !item.parent_item_id);
        console.log(`   Items: ${mainItems.length} product(s)`);
        mainItems.forEach((item, idx) => {
          console.log(`     ${idx + 1}. ${item.name}`);
          console.log(`        SKU: ${item.sku} | Qty: ${item.qty_ordered} | Price: €${(item.price || 0).toFixed(2)}`);
        });
      }

      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('✅ Order retrieval test completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
