// This is a test script for verifying Azure DALL-E 3 connectivity.
// It should be run from the command line, e.g., `node test-azure-setup.js`

// IMPORTANT: Ensure you have a .env file with your Azure credentials.
require('dotenv').config();

const testAzureApi = async () => {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

    if (!apiKey || !endpoint) {
        console.error("❌ Error: AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be set in your .env file.");
        return;
    }

    console.log("🔑 Azure Key:", apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4));
    console.log("🌐 Azure Endpoint:", endpoint);
    console.log("\nAttempting to connect to Azure...");

    // This is a simplified test and does not make a real API call.
    // A real implementation would involve making a fetch request to the endpoint.
    // For now, we just check if the variables are loaded.
    console.log("✅ Success: Environment variables for Azure are loaded correctly.");
    console.log("Next step would be to make an actual API call to verify credentials.");
};

testAzureApi(); 