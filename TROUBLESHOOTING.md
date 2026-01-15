# Integration Permissions Troubleshooting Guide

## ✅ What's Working

- Bearer token authentication is **ENABLED** ✓
- Your token is **VALID** ✓
- Magento API is **RESPONDING** ✓

## ❌ What's Not Working

The integration does **NOT** have permissions to access resources. Current errors:
- Cannot access `Magento_Catalog::categories`
- Cannot access `Magento_Backend::store`

## Step-by-Step Fix

### 1. Find Your Integration in Magento Admin

1. Log into: `https://licendi.com/admin`
2. Navigate to: **System → Extensions → Integrations**
3. **Important**: Look for the integration that has access token starting with: `nbip5nzrpk...`
4. Note the integration name

### 2. Edit Integration Permissions

1. Click **Edit** on the correct integration
2. Click on the **API** tab
3. **CRITICAL**: Under "Resource Access", you should see:
   - Radio button options:
     - ○ All
     - ○ Custom

4. **Select "All"** (NOT Custom!)
5. Click **Save**

### 3. Reactivate the Integration

After saving:
1. The integration status should show **Active**
2. If it shows **Inactive**, click **Activate**
3. When prompted, click **Allow**
4. **DO NOT** regenerate tokens - use existing tokens!

### 4. Clear Magento Cache

**Via Admin:**
- Go to: **System → Cache Management**
- Click **Flush Magento Cache**

**Via Command Line (on server):**
```bash
cd /var/www/licendi.com
bin/magento cache:flush
```

### 5. Verify the Fix

Run this test from your terminal:
```bash
npm test
```

## Common Mistakes

### ❌ Wrong: Setting Custom Permissions
If you selected "Custom" and manually checked boxes, you might have missed some. Use "All" instead.

### ❌ Wrong: Editing a Different Integration
Make sure you're editing the integration with token `nbip5nzrpk01cpdf7hu19m8ww7592m91`. You might have multiple integrations.

### ❌ Wrong: Not Activating After Save
After changing permissions, the integration must be **Activated** again.

### ❌ Wrong: Regenerating Tokens
Don't create new tokens - keep using the existing one: `nbip5nzrpk01cpdf7hu19m8ww7592m91`

### ❌ Wrong: Not Flushing Cache
Magento caches ACL (Access Control List) rules. You MUST flush cache after permission changes.

## Visual Checklist

In Magento Admin → System → Integrations, your integration should show:

```
Name: [Your Integration Name]
Status: ● Active (green dot)
Email: [your email]

[Edit] [Remove] [Activate] [Reauthorize]
```

When you click Edit → API tab:

```
Resource Access
  ⦿ All              ← THIS SHOULD BE SELECTED
  ○ Custom

[Save]
```

## Still Not Working?

If after following all steps it still doesn't work:

### Check Integration Logs
On your Magento server, check:
```bash
tail -f /var/www/licendi.com/var/log/system.log
tail -f /var/www/licendi.com/var/log/exception.log
```

Then run `npm test` and watch for errors.

### Verify OAuth Consumer Setting
Run on your Magento server:
```bash
bin/magento config:show oauth/consumer/enable_integration_as_bearer
```

Should output: `1`

If not:
```bash
bin/magento config:set oauth/consumer/enable_integration_as_bearer 1
bin/magento cache:flush
```

### Double-Check the Integration Token

The integration using token `nbip5nzrpk01cpdf7hu19m8ww7592m91` must be the one with "All" permissions.

In Magento database, you can verify:
```sql
SELECT * FROM oauth_token WHERE token = 'nbip5nzrpk01cpdf7hu19m8ww7592m91';
```

Note the `consumer_id`, then check:
```sql
SELECT * FROM oauth_consumer WHERE entity_id = [consumer_id];
```

This will show you which integration this token belongs to.

## Need Screenshot Help?

If you can take screenshots of:
1. System → Extensions → Integrations page
2. Your integration's Edit → API tab

This would help diagnose the issue further.

## Expected Success Output

When properly configured, `npm test` should show:

```
Testing Store Views... ✅ PASS
Testing Products... ✅ PASS
Testing Categories... ✅ PASS
Testing Customers... ✅ PASS
Testing Orders... ✅ PASS

==================================================
📊 Test Summary
==================================================
Total Tests: 5
✅ Passed: 5
❌ Failed: 0

🎉 All tests passed! Your Magento API is configured correctly.
```
