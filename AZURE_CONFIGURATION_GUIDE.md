# Azure OpenAI Configuration Guide for Red.AI

## Overview

This guide helps you properly configure Azure OpenAI for Red.AI to resolve common configuration errors.

## Common Errors and Solutions

### 1. AttributeError: 'NoneType' object has no attribute 'endswith'

**Problem**: The Azure OpenAI endpoint is not configured
**Solution**: Set the `AZURE_OPENAI_ENDPOINT` environment variable

```bash
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
```

### 2. KeyError: 'dalle_deployment'

**Problem**: Service info missing DALL-E deployment information
**Solution**: This has been fixed in the latest update. The service now uses the main deployment for all operations.

### 3. Azure OpenAI API key not configured

**Problem**: API key is missing or contains placeholder values
**Solution**: Set a valid Azure OpenAI API key

```bash
AZURE_OPENAI_API_KEY=your-actual-api-key-here
```

## Step-by-Step Configuration

### Step 1: Get Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create or navigate to your Azure OpenAI resource
3. Note down the resource name (it will be in the endpoint URL)

### Step 2: Get Credentials

1. In your Azure OpenAI resource, go to "Keys and Endpoint"
2. Copy the endpoint URL (looks like: `https://your-resource.openai.azure.com/`)
3. Copy either KEY 1 or KEY 2

### Step 3: Set Up Model Deployment

1. Go to "Model deployments" in your Azure OpenAI resource
2. Create a new deployment with:
   - Model: GPT-4 or GPT-3.5-turbo
   - Deployment name: `gpt-4` (or your preferred name)
3. Note the deployment name for configuration

### Step 4: Configure Environment Variables

Create a `.env` file in your backend directory:

```bash
# Required Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-from-azure-portal
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Optional: Backup for high availability
AZURE_OPENAI_API_KEY_2=your-backup-api-key
```

### Step 5: Verify Configuration

Run the backend service and check for these messages:

```
✅ Azure OpenAI Service initialized
   Endpoint: https://your-resource.openai.azure.com/
   Authentication: API Key
   API Version: 2024-02-01
   Deployment Model: gpt-4
```

## Alternative Configuration Methods

### Method 1: azure_settings.py

Create `backend/azure_settings.py`:

```python
AZURE_CONFIG = {
    "endpoint": "https://your-resource.openai.azure.com/",
    "api_key": "your-api-key",
    "backup_key": "your-backup-key",  # Optional
    "api_version": "2024-02-01",
    "gpt_deployment": "gpt-4"
}
```

### Method 2: Docker Environment

In your `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
      - AZURE_OPENAI_API_KEY=your-api-key
      - AZURE_OPENAI_API_VERSION=2024-02-01
      - AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

## Configuration Validation

The service performs these checks on startup:

- ✅ **API Key**: Must be set and not be a placeholder
- ✅ **Endpoint**: Must be a valid Azure OpenAI URL
- ✅ **API Version**: Must be specified (defaults to 2024-02-01)
- ✅ **Deployment**: Must specify the model deployment name

## Troubleshooting Tips

### Check Environment Variables

```bash
# In your terminal, verify variables are set
echo $AZURE_OPENAI_ENDPOINT
echo $AZURE_OPENAI_API_KEY
```

### Test Azure OpenAI Connection

```bash
# Test with curl
curl -X POST "https://your-resource.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2024-02-01" \
  -H "Content-Type: application/json" \
  -H "api-key: your-api-key" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

### Common Issues

1. **Endpoint doesn't end with '/'**: The service automatically adds this
2. **Wrong API version**: Use `2024-02-01` or later
3. **Deployment not found**: Ensure your deployment name matches exactly
4. **Rate limits**: Azure OpenAI has rate limits per deployment

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use separate keys** for development and production
3. **Rotate keys regularly** in Azure Portal
4. **Use Azure AD authentication** for production (set `USE_AZURE_AD=true`)

## Getting Help

If you continue having issues:

1. Check the Azure Portal for service health
2. Verify your Azure OpenAI quota and limits
3. Review the Red.AI logs for specific error messages
4. Ensure your Azure subscription has access to Azure OpenAI services 