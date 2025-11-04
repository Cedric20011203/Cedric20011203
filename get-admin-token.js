#!/usr/bin/env node

/**
 * Get admin token using admin credentials
 */

import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function getAdminToken() {
  console.log('🔐 Magento Admin Token Generator\n');

  const baseUrl = await question('Enter your Magento base URL (e.g., https://licendi.com): ');
  const username = await question('Enter your admin username: ');
  const password = await question('Enter your admin password: ');

  rl.close();

  console.log('\n🔄 Attempting to get admin token...\n');

  try {
    const response = await axios.post(
      `${baseUrl.trim()}/rest/V1/integration/admin/token`,
      {
        username: username.trim(),
        password: password.trim()
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const token = response.data;

    console.log('✅ SUCCESS! Admin token obtained:\n');
    console.log(token);
    console.log('\n📝 Add this to your .env file:');
    console.log(`MAGENTO_ACCESS_TOKEN=${token}`);
    console.log('\nThis token will expire after 4 hours by default.');

  } catch (error) {
    console.error('❌ Failed to get admin token');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

getAdminToken();
