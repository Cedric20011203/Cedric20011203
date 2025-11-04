#!/usr/bin/env node

/**
 * Test MCP server using curl-based client instead of axios
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Testing Magento Order Retrieval via Curl\n');

async function getToken() {
  console.log('🔐 Getting fresh admin token...');
  const { stdout } = await execAsync(
    `curl -s -X POST "https://licendi.com/rest/V1/integration/admin/token" \
     -H "Content-Type: application/json" \
     -d '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}' | tr -d '"'`
  );
  const token = stdout.trim();
  console.log(`✅ Token obtained (${token.length} characters)\n`);
  return token;
}

async function getOrders(token) {
  console.log('📦 Fetching last 4 orders via curl...\n');

  const { stdout } = await execAsync(
    `curl --globoff -s -X GET "https://licendi.com/rest/V1/orders?searchCriteria%5BpageSize%5D=4&searchCriteria%5BsortOrders%5D%5B0%5D%5Bfield%5D=created_at&searchCriteria%5BsortOrders%5D%5B0%5D%5Bdirection%5D=DESC" \
     -H "Authorization: Bearer ${token}" \
     -H "Content-Type: application/json"`
  );

  return JSON.parse(stdout);
}

async function main() {
  try {
    const token = await getToken();
    const response = await getOrders(token);

    if (!response.items || response.items.length === 0) {
      console.log('❌ No orders found');
      return;
    }

    console.log(`✅ Successfully retrieved ${response.items.length} orders!\n`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    response.items.forEach((order, idx) => {
      console.log(`📋 Order ${idx + 1}: #${order.increment_id}`);
      console.log(`   Customer: ${order.customer_email}`);
      console.log(`   Total: €${order.grand_total.toFixed(2)}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Date: ${order.created_at}`);

      if (order.items) {
        const mainItems = order.items.filter(item => !item.parent_item_id);
        console.log(`   Products: ${mainItems.length}`);
        mainItems.forEach((item, i) => {
          console.log(`     ${i + 1}. ${item.name} (${item.sku}) - €${item.price.toFixed(2)}`);
        });
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ CONFIRMED: Order data successfully pulled via curl!');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
