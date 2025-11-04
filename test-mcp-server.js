#!/usr/bin/env node

/**
 * Test the MCP server by sending it tool call requests
 * This simulates what Claude Desktop would do
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('🚀 Testing Magento MCP Server\n');
console.log('Starting MCP server process...\n');

// Start the MCP server
const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    MAGENTO_BASE_URL: 'https://licendi.com',
    MAGENTO_ACCESS_TOKEN: 'eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjExLCJ1dHlwaWQiOjIsImlhdCI6MTc2MjI0MjUxNywiZXhwIjoxNzYyMjQ2MTE3fQ.C3_TvSWcX9KAOCDDnsp1l4G-wtDdlEt0krYuSkrhFfg'
  }
});

let responseData = '';
let errorData = '';

server.stdout.on('data', (data) => {
  responseData += data.toString();
});

server.stderr.on('data', (data) => {
  const message = data.toString();
  errorData += message;
  if (message.includes('running on stdio')) {
    console.log('✅ MCP server started successfully\n');
  }
});

// Wait for server to start
await setTimeout(2000);

console.log('📤 Sending initialize request...\n');

// Send initialize request
const initializeRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

server.stdin.write(JSON.stringify(initializeRequest) + '\n');

await setTimeout(1000);

console.log('📤 Sending tools/list request...\n');

// Request list of tools
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
};

server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

await setTimeout(1000);

console.log('📤 Sending tools/call request for magento_get_orders...\n');

// Call the magento_get_orders tool
const callToolRequest = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'magento_get_orders',
    arguments: {
      limit: 4
    }
  }
};

server.stdin.write(JSON.stringify(callToolRequest) + '\n');

// Wait for responses
await setTimeout(5000);

// Close server
server.stdin.end();
server.kill();

// Parse and display responses
console.log('\n' + '═'.repeat(60));
console.log('MCP SERVER RESPONSES');
console.log('═'.repeat(60) + '\n');

if (errorData) {
  console.log('Server stderr output:');
  console.log(errorData);
  console.log('');
}

if (responseData) {
  console.log('Server stdout output:');
  const lines = responseData.trim().split('\n');

  lines.forEach((line, index) => {
    try {
      const response = JSON.parse(line);
      console.log(`\nResponse ${index + 1}:`);
      console.log(JSON.stringify(response, null, 2));

      // If this is the order data response
      if (response.result && response.result.content) {
        console.log('\n' + '─'.repeat(60));
        console.log('📦 ORDER DATA RECEIVED FROM MCP SERVER:');
        console.log('─'.repeat(60));

        const content = response.result.content[0];
        if (content.type === 'text') {
          try {
            const orders = JSON.parse(content.text);
            console.log(`\n✅ Retrieved ${orders.length} orders through MCP!\n`);

            orders.forEach((order, idx) => {
              console.log(`Order ${idx + 1}: #${order.increment_id}`);
              console.log(`  Customer: ${order.customer_email}`);
              console.log(`  Total: €${order.grand_total}`);
              console.log(`  Status: ${order.status}`);
              console.log(`  Date: ${order.created_at}`);
              console.log('');
            });
          } catch (e) {
            console.log('Content:', content.text.substring(0, 500));
          }
        }
      }
    } catch (e) {
      console.log(`Line ${index + 1} (not JSON): ${line}`);
    }
  });
}

console.log('\n' + '═'.repeat(60));
console.log('✅ MCP SERVER TEST COMPLETED');
console.log('═'.repeat(60));
