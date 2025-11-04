#!/usr/bin/env node

/**
 * Diagnostic script to test Magento API authentication
 */

import { config } from 'dotenv';
import axios from 'axios';

config();

const MAGENTO_BASE_URL = process.env.MAGENTO_BASE_URL;
const MAGENTO_ACCESS_TOKEN = process.env.MAGENTO_ACCESS_TOKEN;

console.log('🔍 Magento API Authentication Diagnostics\n');
console.log('Base URL:', MAGENTO_BASE_URL);
console.log('Token length:', MAGENTO_ACCESS_TOKEN?.length, 'characters');
console.log('Token format:', MAGENTO_ACCESS_TOKEN?.substring(0, 10) + '...\n');

async function testAuthentication() {
  const tests = [
    {
      name: 'Test 1: Bearer Token (Integration)',
      headers: {
        'Authorization': `Bearer ${MAGENTO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    },
    {
      name: 'Test 2: Direct Token Header',
      headers: {
        'Authorization': MAGENTO_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      }
    },
    {
      name: 'Test 3: Admin Token',
      headers: {
        'Authorization': `Bearer ${MAGENTO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    }
  ];

  // Try a simple endpoint first - store config
  const endpoint = `${MAGENTO_BASE_URL}/rest/V1/store/storeConfigs`;

  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${test.name}`);
    console.log('='.repeat(60));

    try {
      const response = await axios.get(endpoint, {
        headers: test.headers,
        timeout: 10000,
      });

      console.log('✅ SUCCESS!');
      console.log('Status:', response.status);
      console.log('Data received:', Array.isArray(response.data) ? `${response.data.length} items` : 'object');
      console.log('\nThis authentication method works! ✓');

      // Now try orders endpoint
      console.log('\nTesting orders endpoint...');
      const ordersResponse = await axios.get(
        `${MAGENTO_BASE_URL}/rest/V1/orders?searchCriteria[pageSize]=1`,
        {
          headers: test.headers,
          timeout: 10000,
        }
      );
      console.log('✅ Orders endpoint also works!');
      console.log('Orders available:', ordersResponse.data.total_count || 0);

      return test.headers;

    } catch (error) {
      console.log('❌ FAILED');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('Error:', error.message);
      }
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('All authentication methods failed.');
  console.log('='.repeat(60));
  console.log('\nPossible issues:');
  console.log('1. The token might be for a customer, not admin/integration');
  console.log('2. The token might be expired or invalid');
  console.log('3. The integration might not be activated');
  console.log('4. API access might be restricted');
  console.log('\nPlease verify:');
  console.log('- Is this an Integration token or Admin token?');
  console.log('- Where did you get this token from?');
  console.log('- Can you try regenerating the token?');

  return null;
}

testAuthentication();
