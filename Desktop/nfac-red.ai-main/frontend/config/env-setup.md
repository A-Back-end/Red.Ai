# Environment Variables Setup

## OpenAI API Configuration

To enable AI design generation functionality, you need to set up your OpenAI API key:

### Step 1: Get your OpenAI API key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or log in
3. Generate a new API key

### Step 2: Create .env.local file
Create a file named `.env.local` in the root directory with:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 3: Replace the placeholder
Replace `your_actual_api_key_here` with your real OpenAI API key.

**Example:**
```bash
OPENAI_API_KEY=your_actual_api_key_here
```

### Important Notes:
- Never commit your `.env.local` file to version control
- Keep your API key secure and private
- The API key should start with `sk-`
- Restart your development server after adding the key

### Testing
Once configured, you can:
1. Upload a floor plan image
2. Select design parameters
3. Click "Generate AI Design"
4. View the generated design and furniture recommendations 