#!/usr/bin/env node

/**
 * Pull the last 4 orders from Magento store
 */

import { config } from 'dotenv';
import { MagentoClient } from './build/magento-client.js';

// Load environment variables
config();

const MAGENTO_BASE_URL = process.env.MAGENTO_BASE_URL;
const MAGENTO_ACCESS_TOKEN = process.env.MAGENTO_ACCESS_TOKEN;

console.log('🔍 Connecting to Magento store:', MAGENTO_BASE_URL);
console.log('');

const client = new MagentoClient({
  baseUrl: MAGENTO_BASE_URL,
  accessToken: MAGENTO_ACCESS_TOKEN,
  timeout: 30000,
});

async function pullLastFourOrders() {
  try {
    console.log('📦 Fetching last 4 orders...\n');

    // Get last 4 orders sorted by creation date (newest first)
    const searchCriteria = 'searchCriteria[pageSize]=4&searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC';
    const orders = await client.getOrders(searchCriteria);

    console.log(`✅ Successfully retrieved ${orders.length} orders\n`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (orders.length === 0) {
      console.log('No orders found in the store.');
      return;
    }

    // Display each order
    orders.forEach((order, index) => {
      console.log(`📋 Order ${index + 1}:`);
      console.log(`   Order ID: #${order.increment_id} (Entity ID: ${order.entity_id})`);
      console.log(`   Customer: ${order.customer_email}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: $${order.grand_total.toFixed(2)}`);
      console.log(`   Created: ${order.created_at}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════\n');

    // Get detailed info for the first order
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log(`📄 Fetching detailed information for Order #${firstOrder.increment_id}...\n`);

      const orderDetails = await client.getOrderById(firstOrder.entity_id);
      console.log(`✅ Order Details Retrieved:`);
      console.log(`   Order #${orderDetails.increment_id}`);
      console.log(`   Customer: ${orderDetails.customer_email}`);
      console.log(`   Status: ${orderDetails.status}`);
      console.log(`   Items: ${orderDetails.items?.length || 0} product(s)`);
      console.log(`   Grand Total: $${orderDetails.grand_total.toFixed(2)}`);

      if (orderDetails.items && orderDetails.items.length > 0) {
        console.log('\n   Order Items:');
        orderDetails.items.forEach((item, idx) => {
          console.log(`     ${idx + 1}. ${item.name}`);
          console.log(`        SKU: ${item.sku}`);
          console.log(`        Qty: ${item.qty_ordered} x $${item.price?.toFixed(2) || '0.00'}`);
        });
      }
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error pulling orders:', error.message);

    if (error.message.includes('401')) {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   - Your access token is correct');
      console.log('   - The integration is activated in Magento admin');
      console.log('   - Bearer token authentication is enabled');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Permission denied. Please check:');
      console.log('   - The integration has order read permissions');
      console.log('   - The API resources are properly configured');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Connection failed. Please check:');
      console.log('   - The MAGENTO_BASE_URL is correct');
      console.log('   - The store is accessible');
      console.log('   - Your network connection');
    }

    process.exit(1);
  }
}

pullLastFourOrders();
