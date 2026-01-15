#!/usr/bin/env node

/**
 * Magento 2 API Connection Test Script
 *
 * This script tests your Magento 2 API connection and integration token.
 * Run this before using the MCP server to verify everything is configured correctly.
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const MAGENTO_BASE_URL = process.env.MAGENTO_BASE_URL || 'https://licendi.com';
const MAGENTO_ACCESS_TOKEN = process.env.MAGENTO_ACCESS_TOKEN || '';

console.log('🔍 Magento 2 API Connection Test\n');
console.log('='.repeat(50));
console.log(`Base URL: ${MAGENTO_BASE_URL}`);
console.log(`Token: ${MAGENTO_ACCESS_TOKEN ? MAGENTO_ACCESS_TOKEN.substring(0, 10) + '...' : '(missing)'}`);
console.log('='.repeat(50));
console.log('');

if (!MAGENTO_ACCESS_TOKEN) {
  console.error('❌ Error: MAGENTO_ACCESS_TOKEN is not set in .env file');
  process.exit(1);
}

const client = axios.create({
  baseURL: `${MAGENTO_BASE_URL}/rest/V1`,
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${MAGENTO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    encode: (params) => params, // Don't encode brackets
  },
});

// Test endpoints in order of increasing permission requirements
const tests = [
  {
    name: 'Store Config',
    endpoint: '/store/storeConfigs',
    description: 'Basic store information',
  },
  {
    name: 'Categories',
    endpoint: '/categories/2',
    description: 'Category tree access',
  },
  {
    name: 'Products',
    url: `${MAGENTO_BASE_URL}/rest/V1/products?searchCriteria[pageSize]=3`,
    description: 'Product catalog access',
  },
  {
    name: 'Customers',
    url: `${MAGENTO_BASE_URL}/rest/V1/customers/search?searchCriteria[pageSize]=3`,
    description: 'Customer data access',
  },
  {
    name: 'Orders',
    url: `${MAGENTO_BASE_URL}/rest/V1/orders?searchCriteria[pageSize]=3`,
    description: 'Order data access',
  },
];

async function runTests() {
  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);

    try {
      const response = test.url
        ? await axios.get(test.url, {
            headers: {
              'Authorization': `Bearer ${MAGENTO_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          })
        : await client.get(test.endpoint);
      console.log('✅ PASS');
      passed++;
      results.push({ test: test.name, status: 'PASS', response: response.status });
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        if (status === 401) {
          console.log('❌ FAIL - Unauthorized (Bearer token not enabled)');
          results.push({
            test: test.name,
            status: 'FAIL',
            error: '401 Unauthorized - Enable Bearer tokens in Magento',
            fix: 'Run: bin/magento config:set oauth/consumer/enable_integration_as_bearer 1'
          });
        } else if (status === 403 || message.includes("isn't authorized")) {
          console.log('❌ FAIL - Forbidden (insufficient permissions)');
          results.push({
            test: test.name,
            status: 'FAIL',
            error: '403 Forbidden - Integration lacks permissions',
            fix: 'Set "Resource Access" to "All" in Magento Admin → System → Integrations'
          });
        } else {
          console.log(`❌ FAIL - ${status} ${message.substring(0, 50)}...`);
          results.push({ test: test.name, status: 'FAIL', error: `${status}: ${message}` });
        }
        failed++;
      } else {
        console.log(`❌ FAIL - ${error.message}`);
        results.push({ test: test.name, status: 'FAIL', error: error.message });
        failed++;
      }
    }
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('🔧 Fixes Required:\n');
    const fixes = [...new Set(results.filter(r => r.fix).map(r => r.fix))];
    fixes.forEach((fix, idx) => {
      console.log(`${idx + 1}. ${fix}`);
    });
    console.log('');
    console.log('📖 See SETUP.md for detailed configuration instructions');
    console.log('');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed! Your Magento API is configured correctly.');
    console.log('✨ You can now use the MCP server with Claude Desktop!');
    console.log('');
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error('');
  console.error('💥 Fatal error:', error.message);
  console.error('');
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    console.error('🔍 The Magento server could not be reached.');
    console.error('   Check that the MAGENTO_BASE_URL in .env is correct.');
  } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
    console.error('⏱️  The connection timed out.');
    console.error('   The Magento server may be slow or unresponsive.');
    console.error('   Try increasing API_TIMEOUT in .env file.');
  }
  console.error('');
  process.exit(1);
});
