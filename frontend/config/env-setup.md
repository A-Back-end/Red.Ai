# Environment Variables Setup

## Azure OpenAI API Configuration

To enable AI design generation functionality, you need to set up your Azure OpenAI API key:

### Step 1: Get your Azure OpenAI API key
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure OpenAI Service
3. Get your endpoint and API key from "Keys and Endpoint"

### Step 2: Create .env.local file
Create a file named `.env.local` in the root directory with:

```bash
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-05-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4.1
```

### Step 3: Replace the placeholders
Replace the placeholders with your real Azure OpenAI configuration:
- `your_azure_openai_api_key_here` - with your actual API key
- `your-resource` - with your actual Azure resource name

**Example:**
```bash
AZURE_OPENAI_API_KEY=FM1DHQMuPkCX1TKRnIVVprIoQ1RwI6yaPBNEJ0gx3kdRUNMpprAlJQQJ99BGACYeBjFXJ3w3AAABACOGLuJD
AZURE_OPENAI_ENDPOINT=https://neuroflow-hub.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-05-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4.1
```

### Important Notes:
- Never commit your `.env.local` file to version control
- Keep your API key secure and private
- The API key should be from Azure Portal
- Restart your development server after adding the key

### Testing
Once configured, you can:
1. Upload a floor plan image
2. Select design parameters
3. Click "Generate AI Design"
4. View the generated design and furniture recommendations 