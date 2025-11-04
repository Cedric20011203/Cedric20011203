#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function searchOrdersByEmail(email) {
  // Get token
  const { stdout: tokenOutput } = await execAsync(
    `curl -s -X POST "https://licendi.com/rest/V1/integration/admin/token" \
     -H "Content-Type: application/json" \
     -d '{"username":"Cedric.licendi","password":"guptip-reWwav-9kawwa"}'`
  );
  const token = tokenOutput.trim().replace(/"/g, '');

  // Search orders
  const { stdout } = await execAsync(
    `curl --globoff -s -X GET "https://licendi.com/rest/V1/orders?searchCriteria%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bfield%5D=customer_email&searchCriteria%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bvalue%5D=${email}&searchCriteria%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5BconditionType%5D=eq" \
     -H "Authorization: Bearer ${token}" \
     -H "Content-Type: application/json"`
  );

  return JSON.parse(stdout);
}

const email = 'hjs-ber@web.de';
console.log(`🔍 Searching orders for: ${email}\n`);

searchOrdersByEmail(email).then(response => {
  if (!response.items || response.items.length === 0) {
    console.log('❌ No orders found for this email');
    return;
  }

  console.log(`✅ Found ${response.items.length} order(s)\n`);

  response.items.forEach((order, idx) => {
    console.log(`📋 Order ${idx + 1}: #${order.increment_id}`);
    console.log(`   Date: ${order.created_at}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Total: €${order.grand_total.toFixed(2)}`);
    console.log(`   Products:`);

    if (order.items) {
      order.items.filter(item => !item.parent_item_id).forEach(item => {
        console.log(`     ✓ ${item.name}`);
        console.log(`       SKU: ${item.sku}`);
        console.log(`       Qty: ${item.qty_ordered} x €${(item.price || 0).toFixed(2)}`);

        // Highlight if it's a Visio product
        if (item.name.toLowerCase().includes('visio')) {
          console.log(`       ⭐ THIS IS THE VISIO PRODUCT ⭐`);
        }
      });
    }
    console.log('');
  });
}).catch(err => {
  console.error('❌ Error:', err.message);
});
