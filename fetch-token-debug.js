#!/usr/bin/env node

/**
 * Debug token fetch with redirect handling
 */

import axios from 'axios';

const username = 'Cedric.licendi';
const password = 'guptip-reWwav-9kawwa';

console.log('🔍 Debugging Magento API connection\n');

async function tryDifferentEndpoints() {
  const urls = [
    'https://licendi.com/rest/V1/integration/admin/token',
    'https://licendi.com/index.php/rest/V1/integration/admin/token',
    'https://www.licendi.com/rest/V1/integration/admin/token',
    'https://www.licendi.com/index.php/rest/V1/integration/admin/token',
  ];

  for (const url of urls) {
    console.log('='.repeat(60));
    console.log('Trying:', url);
    console.log('='.repeat(60));

    try {
      const response = await axios.post(
        url,
        {
          username: username,
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 30000,
          maxRedirects: 0, // Don't follow redirects
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept 2xx and 3xx
          }
        }
      );

      if (response.status >= 300 && response.status < 400) {
        console.log(`⚠️  Got redirect (${response.status})`);
        console.log('Location:', response.headers.location);
        continue;
      }

      const token = response.data;
      console.log('✅ SUCCESS!\n');
      console.log('Token:', token);
      console.log('\nLength:', token.length, 'characters');

      // Update .env file
      console.log('\n📝 Updating .env file...');
      return { token, url };

    } catch (error) {
      if (error.response) {
        if (error.response.status >= 300 && error.response.status < 400) {
          console.log(`⚠️  Redirect to: ${error.response.headers.location}`);
        } else {
          console.log(`❌ Error ${error.response.status}:`, error.response.data);
        }
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    console.log('');
  }

  console.log('\n❌ All endpoints failed');
  console.log('\nTrying to check if the store is accessible...');

  try {
    const response = await axios.get('https://licendi.com', {
      timeout: 10000,
      maxRedirects: 5
    });
    console.log('✅ Store homepage is accessible');
    console.log('Final URL:', response.request.res.responseUrl || 'N/A');
  } catch (error) {
    console.log('❌ Store homepage not accessible:', error.message);
  }
}

tryDifferentEndpoints();
