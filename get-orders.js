#!/usr/bin/env node

import dotenv from 'dotenv';
import { MagentoClient } from './build/magento-client.js';

dotenv.config();

const client = new MagentoClient({
  baseUrl: process.env.MAGENTO_BASE_URL,
  accessToken: process.env.MAGENTO_ACCESS_TOKEN,
  timeout: 30000,
});

console.log('📦 Fetching latest orders from Magento...\n');

try {
  const orders = await client.getOrders('searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC&searchCriteria[pageSize]=10');

  if (orders.length === 0) {
    console.log('No orders found.');
  } else {
    console.log(`Found ${orders.length} recent orders:\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.increment_id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Customer: ${order.customer_firstname || 'Guest'} ${order.customer_lastname || ''} (${order.customer_email})`);
      console.log(`   Total: €${order.grand_total.toFixed(2)}`);
      console.log(`   Date: ${new Date(order.created_at).toLocaleString()}`);
      console.log(`   Items: ${order.items ? order.items.length : order.total_item_count || 0} item(s)`);
      console.log('');
    });
  }
} catch (error) {
  console.error('❌ Error fetching orders:', error.message);
  process.exit(1);
}
