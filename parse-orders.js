#!/usr/bin/env node

import fs from 'fs';

const data = `[PASTE_JSON_HERE]`;
const json = JSON.parse(data);

console.log('\n📦 LATEST ORDERS FROM LICENDI.COM\n');
console.log('='.repeat(80));

json.items.forEach((order, index) => {
  const date = new Date(order.created_at);
  const products = order.items
    .filter(item => item.product_type !== 'license' || !item.parent_item_id)
    .map(item => item.name)
    .join(', ');

  console.log(`\n${index + 1}. ORDER #${order.increment_id}`);
  console.log(`   📅 Date: ${date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`);
  console.log(`   👤 Customer: ${order.customer_firstname} ${order.customer_lastname}`);
  console.log(`   📧 Email: ${order.customer_email}`);
  console.log(`   🏪 Store: ${order.store_name.split('\n')[2] || 'English'}`);
  console.log(`   💰 Total: €${order.grand_total.toFixed(2)}`);
  console.log(`   📊 Status: ${order.status.toUpperCase()}`);
  console.log(`   🛍️  Products: ${products}`);
  console.log(`   💳 Payment: ${order.payment.method}`);
});

console.log('\n' + '='.repeat(80));
console.log(`\nTotal: ${json.items.length} orders displayed\n`);
