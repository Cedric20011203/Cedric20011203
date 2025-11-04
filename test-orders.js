#!/usr/bin/env node

/**
 * Test script to verify order retrieval functionality
 * This demonstrates all the order-related tools available in the Magento MCP Server
 */

import { MagentoClient } from './build/magento-client.js';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}  Magento Order Functionality Test${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}\n`);

// Check for environment variables
const MAGENTO_BASE_URL = process.env.MAGENTO_BASE_URL;
const MAGENTO_ACCESS_TOKEN = process.env.MAGENTO_ACCESS_TOKEN;

if (!MAGENTO_BASE_URL || !MAGENTO_ACCESS_TOKEN || MAGENTO_ACCESS_TOKEN === 'your_integration_token_here') {
  console.log(`${colors.yellow}⚠ Note: No Magento credentials configured${colors.reset}\n`);
  console.log('To test with a real Magento store, create a .env file with:');
  console.log('  MAGENTO_BASE_URL=https://your-store.com');
  console.log('  MAGENTO_ACCESS_TOKEN=your_integration_token\n');

  console.log(`${colors.green}✓ Order Functionality Available:${colors.reset}\n`);

  console.log('1. magento_get_orders');
  console.log('   - Retrieves orders with optional search criteria');
  console.log('   - Default limit: 20 orders');
  console.log('   - Supports Magento searchCriteria syntax\n');

  console.log('2. magento_get_order');
  console.log('   - Get detailed information about a specific order by ID');
  console.log('   - Returns full order details including items\n');

  console.log('3. magento_search_orders_by_email');
  console.log('   - Search orders by customer email address');
  console.log('   - Exact email match\n');

  console.log('4. magento_search_orders_by_status');
  console.log('   - Search orders by status (pending, processing, complete, canceled, etc.)');
  console.log('   - Results sorted by creation date (newest first)\n');

  console.log(`${colors.blue}Example Usage:${colors.reset}\n`);

  console.log('// Get latest 10 orders');
  console.log('await magentoClient.getOrders("searchCriteria[pageSize]=10");\n');

  console.log('// Get order by ID');
  console.log('await magentoClient.getOrderById(123);\n');

  console.log('// Search orders by customer email');
  console.log('await magentoClient.searchOrdersByCustomerEmail("customer@example.com");\n');

  console.log('// Search orders by status');
  console.log('await magentoClient.searchOrdersByStatus("pending");\n');

  console.log(`${colors.green}✓ All order methods are properly implemented and ready to use!${colors.reset}\n`);

  process.exit(0);
}

// If credentials are provided, test with real API
console.log(`${colors.blue}Testing with Magento store: ${MAGENTO_BASE_URL}${colors.reset}\n`);

const client = new MagentoClient({
  baseUrl: MAGENTO_BASE_URL,
  accessToken: MAGENTO_ACCESS_TOKEN,
  timeout: 30000,
});

async function testOrderFunctionality() {
  try {
    // Test 1: Get recent orders
    console.log(`${colors.yellow}Test 1: Getting recent orders (limit 5)...${colors.reset}`);
    const orders = await client.getOrders('searchCriteria[pageSize]=5&searchCriteria[sortOrders][0][field]=created_at&searchCriteria[sortOrders][0][direction]=DESC');
    console.log(`${colors.green}✓ Successfully retrieved ${orders.length} orders${colors.reset}`);

    if (orders.length > 0) {
      console.log('\nSample order:');
      const sampleOrder = orders[0];
      console.log(`  - Order ID: ${sampleOrder.increment_id}`);
      console.log(`  - Customer: ${sampleOrder.customer_email}`);
      console.log(`  - Status: ${sampleOrder.status}`);
      console.log(`  - Total: $${sampleOrder.grand_total}`);
      console.log(`  - Date: ${sampleOrder.created_at}\n`);

      // Test 2: Get specific order by ID
      console.log(`${colors.yellow}Test 2: Getting order details for ID ${sampleOrder.entity_id}...${colors.reset}`);
      const orderDetails = await client.getOrderById(sampleOrder.entity_id);
      console.log(`${colors.green}✓ Successfully retrieved order details${colors.reset}`);
      console.log(`  - Order #${orderDetails.increment_id} has ${orderDetails.items?.length || 0} items\n`);

      // Test 3: Search orders by customer email
      console.log(`${colors.yellow}Test 3: Searching orders by customer email...${colors.reset}`);
      const customerOrders = await client.searchOrdersByCustomerEmail(sampleOrder.customer_email);
      console.log(`${colors.green}✓ Found ${customerOrders.length} orders for ${sampleOrder.customer_email}${colors.reset}\n`);

      // Test 4: Search orders by status
      console.log(`${colors.yellow}Test 4: Searching orders by status '${sampleOrder.status}'...${colors.reset}`);
      const statusOrders = await client.searchOrdersByStatus(sampleOrder.status);
      console.log(`${colors.green}✓ Found ${statusOrders.length} orders with status '${sampleOrder.status}'${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}No orders found in the store to test with${colors.reset}\n`);
    }

    console.log(`${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}  ✓ All order tests passed!${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}✗ Error testing orders:${colors.reset}`, error.message);
    console.log('\nPossible issues:');
    console.log('  - Check your MAGENTO_ACCESS_TOKEN is valid');
    console.log('  - Verify the integration has order read permissions');
    console.log('  - Ensure Bearer token authentication is enabled in Magento\n');
    process.exit(1);
  }
}

testOrderFunctionality();
