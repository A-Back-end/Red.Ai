# 🔧 Azure OpenAI Troubleshooting Guide

## Overview

This guide helps you resolve common Azure OpenAI configuration and authentication issues in RED AI.

## ✅ Configuration Status Check

### Current Configuration
The Azure OpenAI service is now properly configured with:
- ✅ Configuration validation
- ✅ Error handling and fallbacks  
- ✅ Proper service initialization
- ✅ Missing function implementations

### Configuration Files Fixed
- ✅ `backend/azure_openai_service.py` - Enhanced with proper validation
- ✅ `backend/main.py` - Fixed imports and error handling
- ✅ Missing `generate_image_with_azure_dalle()` function added

## 🔑 Authentication Issues

### Error: 401 - Access Denied

**Cause:** Invalid or expired Azure OpenAI API keys

**Solution:**
1. **Check your Azure OpenAI resource:**
   - Log in to [Azure Portal](https://portal.azure.com)
   - Navigate to your Azure OpenAI resource
   - Go to "Keys and Endpoint" section
   - Copy the current active API key

2. **Update configuration:**
   ```bash
   # Option 1: Create .env.local file (if not blocked)
   AZURE_OPENAI_API_KEY=your_new_api_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   
   # Option 2: Update environment variables directly
   export AZURE_OPENAI_API_KEY="your_new_api_key_here"
   export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
   ```

3. **Update hardcoded fallback:**
   Edit `backend/azure_openai_service.py` line 48-51:
   ```python
   if not self.azure_keys[0]:
       self.azure_keys[0] = "YOUR_NEW_API_KEY_HERE"
   ```

### Error: 403 - Access Forbidden

**Cause:** Insufficient permissions or quota exceeded

**Solutions:**
- Check your Azure subscription status
- Verify OpenAI service quotas in Azure portal
- Ensure your account has proper permissions

### Error: 429 - Rate Limit Exceeded

**Cause:** Too many requests or quota limits

**Solutions:**
- Reduce request frequency
- Check quota limits in Azure portal
- Consider upgrading your subscription

## 🛠️ Testing Your Configuration

### Method 1: Direct Service Test
```bash
cd backend
python azure_openai_service.py
```

### Method 2: API Health Check
```bash
curl http://localhost:8000/health
```

Expected response should show:
```json
{
  "azure_openai": {
    "configured": true,
    "has_api_key": true,
    "has_endpoint": true
  }
}
```

## 🔧 Manual Configuration

### Step 1: Get Azure OpenAI Credentials
1. Go to [Azure Portal](https://portal.azure.com)
2. Find your Azure OpenAI resource
3. Copy:
   - API Key
   - Endpoint URL
   - Deployment names

### Step 2: Update Service Configuration
Edit `backend/azure_openai_service.py` with your credentials:

```python
def __init__(self, use_azure_ad: bool = False):
    self.endpoint = "https://YOUR-RESOURCE.openai.azure.com/"
    self.api_version = "2024-05-01-preview"
    self.deployment_name = "YOUR-GPT-DEPLOYMENT"
    self.dalle_deployment = "YOUR-DALLE-DEPLOYMENT"
    
    self.azure_keys = [
        "YOUR-PRIMARY-API-KEY",
        "YOUR-SECONDARY-API-KEY"  # Optional backup
    ]
```

### Step 3: Verify Deployment Names
Common deployment names:
- GPT-4: `gpt-4`, `gpt-4-turbo`, `gpt-4.1`
- DALL-E: `dall-e-3`

Check your actual deployment names in Azure portal.

## 🚨 Common Issues

### Issue: Service Not Configured
**Error:** "Azure OpenAI service not configured properly"

**Fix:** Update configuration as described above

### Issue: Wrong Endpoint Format
**Error:** Authentication errors despite valid key

**Fix:** Ensure endpoint ends with `/`:
```
✅ https://your-resource.openai.azure.com/
❌ https://your-resource.openai.azure.com
```

### Issue: Deployment Not Found
**Error:** Model deployment not found

**Fix:** Verify deployment names match exactly what's in Azure portal

## 📝 Current Default Configuration

The service currently uses these defaults:
```
Endpoint: https://neuroflow-hub.openai.azure.com/
API Version: 2024-05-01-preview
GPT Model: gpt-4.1
DALL-E Model: dall-e-3
```

## ✅ Status: FIXED

**Issues Resolved:**
- ✅ Missing configuration validation
- ✅ Missing error handling  
- ✅ Missing function implementation
- ✅ Improved authentication errors
- ✅ Better fallback mechanisms

**Next Steps:**
1. Update API keys with current valid ones
2. Test the service
3. Deploy and verify functionality

The Azure OpenAI service is now properly configured and should work correctly once valid API keys are provided. 