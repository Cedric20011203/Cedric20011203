#!/usr/bin/env node

/**
 * Get admin token using provided credentials
 */

import axios from 'axios';

const baseUrl = 'https://licendi.com';
const username = 'Cedric.licendi';
const password = 'guptip-reWwav-9kawwa';

console.log('🔐 Getting admin token from Magento...\n');
console.log('Base URL:', baseUrl);
console.log('Username:', username);
console.log('');

async function getAdminToken() {
  try {
    const response = await axios.post(
      `${baseUrl}/rest/V1/integration/admin/token`,
      {
        username: username,
        password: password
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const token = response.data;

    console.log('✅ SUCCESS! Admin token obtained:\n');
    console.log(token);
    console.log('\n' + '='.repeat(60));
    console.log('Token length:', token.length, 'characters');
    console.log('='.repeat(60));

    return token;

  } catch (error) {
    console.error('❌ Failed to get admin token\n');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    process.exit(1);
  }
}

getAdminToken();
