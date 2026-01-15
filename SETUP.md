# Magento 2 Integration Setup Guide

## Important: Integration Permissions

Your MCP server has been built successfully, but the Magento 2 integration needs proper configuration to work correctly.

## Step 1: Configure Integration Permissions

The token `nbip5nzrpk01cpdf7hu19m8ww7592m91` is valid, but needs proper API permissions set up in your Magento admin.

### In Magento Admin:

1. **Log in to Magento Admin Panel**
   - URL: https://licendi.com/admin

2. **Navigate to Integrations**
   - Go to: **System → Extensions → Integrations**

3. **Find or Create Your Integration**
   - Look for an integration with the access token you provided
   - Or create a new one: Click **"Add New Integration"**

4. **Set API Permissions**
   - Go to the **API** tab
   - Under **"Resource Access"**, select **"All"** for full access
   - Or select specific resources:
     - ✅ Catalog (Products, Categories)
     - ✅ Sales (Orders)
     - ✅ Customers
     - ✅ CMS (Pages)
     - ✅ Stores (Configuration)
     - ✅ Inventory

5. **Save and Activate**
   - Click **Save**
   - Click **Activate** (if not already active)
   - Click **Allow** in the popup

## Step 2: Enable Bearer Token Authentication

Magento 2.4.4+ disables integration tokens as Bearer tokens by default. You MUST enable this:

### Option A: Via Admin Panel

1. Go to: **Stores → Configuration → Services → OAuth**
2. Expand **"Consumer Settings"**
3. Set **"Allow OAuth Access Tokens to be used as standalone Bearer tokens"** to **Yes**
4. Click **Save Config**
5. Flush caches: **System → Cache Management → Flush Magento Cache**

### Option B: Via Command Line (on your Magento server)

```bash
# SSH into your Magento server, then run:
cd /var/www/licendi.com  # or your Magento root directory
bin/magento config:set oauth/consumer/enable_integration_as_bearer 1
bin/magento cache:flush
```

## Step 3: Verify API Access

After configuring permissions and enabling Bearer tokens, test the API:

```bash
curl -H "Authorization: Bearer nbip5nzrpk01cpdf7hu19m8ww7592m91" \
     "https://licendi.com/rest/V1/products?searchCriteria[pageSize]=3"
```

You should see a JSON response with product data.

## Step 4: Start Using the MCP Server

Once the integration is properly configured, you can use the MCP server:

### With Claude Desktop

Add to your config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "magento": {
      "command": "node",
      "args": ["/absolute/path/to/Cedric20011203/build/index.js"],
      "env": {
        "MAGENTO_BASE_URL": "https://licendi.com",
        "MAGENTO_ACCESS_TOKEN": "nbip5nzrpk01cpdf7hu19m8ww7592m91"
      }
    }
  }
}
```

Restart Claude Desktop and start using it!

## Common Issues

### 401 Unauthorized Error
**Cause**: Integration not activated or Bearer tokens not enabled
**Fix**: Follow Step 2 above to enable Bearer token authentication

### 403 Forbidden / "consumer isn't authorized" Error
**Cause**: Integration doesn't have permissions for the requested resource
**Fix**: Follow Step 1 and grant "All" resource access

### Timeout / Connection Issues
**Cause**: Large product catalogs or slow server response
**Fix**:
- Increase `API_TIMEOUT` in `.env` file (default: 30000ms)
- Use smaller page sizes in queries
- Optimize Magento indexing and caching

### 503 Service Unavailable
**Cause**: Magento in maintenance mode or server issues
**Fix**: Check Magento status and server logs

## Testing Checklist

Before using the MCP server, verify:

- [ ] Integration exists and is **Active** in Magento Admin
- [ ] Integration has **"All"** resource access (or specific resources needed)
- [ ] Bearer token authentication is **enabled** (Step 2)
- [ ] Magento cache is **flushed** after configuration changes
- [ ] API test curl command returns valid JSON data
- [ ] Claude Desktop config file is updated with correct paths
- [ ] Claude Desktop has been **restarted**

## Current Status

✅ **MCP Server Code**: Complete and built
✅ **Dependencies**: Installed
✅ **Configuration**: Token configured in `.env`
⚠️ **Integration Permissions**: Needs configuration in Magento Admin
⚠️ **Bearer Token Auth**: Must be enabled in Magento

**Next Action Required**: Configure the integration permissions in your Magento admin panel following Steps 1 and 2 above.

## Need Help?

If you don't have access to the Magento admin panel:
1. Contact your Magento administrator
2. Share this guide with them
3. Request they configure the integration with the necessary permissions

Once configured, your MCP server will provide 18 powerful tools for managing your Magento store through natural language with Claude!
