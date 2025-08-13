# RED AI Backend API

## Quick Start

This backend provides AI-powered interior design services using Azure OpenAI.

## Azure OpenAI Configuration

### Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Azure OpenAI Configuration - REQUIRED
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Optional: Backup API key for failover
AZURE_OPENAI_API_KEY_2=your-backup-azure-openai-api-key

# Optional: Azure AD Authentication (set to true to use Azure AD instead of API keys)
USE_AZURE_AD=false
```

### Alternative Environment Variable Names

For compatibility, these alternative names are also supported:

```bash
AZURE_OPENAI_KEY=your-azure-openai-api-key-here
AZURE_ENDPOINT_KEY=https://your-resource-name.openai.azure.com/
OPENAI_API_VERSION=2024-02-01
```

### Getting Azure OpenAI Credentials

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource
3. Go to "Keys and Endpoint" section
4. Copy the endpoint URL and one of the API keys
5. Make sure you have a GPT-4 deployment created in the "Model deployments" section

### Configuration Validation

The service will validate your configuration on startup and show:
- ✅ Green checkmarks for properly configured items
- ❌ Red X marks for missing or invalid configuration
- ⚠️  Yellow warnings for optional items

### Troubleshooting

**Error: "AttributeError: 'NoneType' object has no attribute 'endswith'"**
- This means your `AZURE_OPENAI_ENDPOINT` is not set
- Check your `.env` file and ensure the endpoint is properly configured

**Error: "KeyError: 'dalle_deployment'"**
- This has been fixed in the latest version
- The service now uses the main deployment for all operations

**Error: "Azure OpenAI API key not configured"**
- Set `AZURE_OPENAI_API_KEY` or `AZURE_OPENAI_KEY` in your `.env` file
- Make sure the key doesn't start with "AZURE_" (which indicates a placeholder)

## Installation and Running

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables (copy from template)
cp .env.example .env
# Edit .env with your actual Azure OpenAI credentials

# Run the service
python main.py
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Interior Design Analysis
```bash
POST /analyze-room
Content-Type: multipart/form-data

# Upload an image for room analysis
```

### AI Chat Assistant
```bash
POST /ai-chat
Content-Type: application/json

{
  "message": "Help me design my living room",
  "context": "modern style"
}
```

## Docker Support

```bash
# Build image
docker build -t redai-backend .

# Run container
docker run -p 8000:8000 --env-file .env redai-backend
```

## Development

The service uses FastAPI and provides automatic API documentation at `/docs` when running. 