#!/usr/bin/env node

/**
 * Azure OpenAI Connection Test Script
 * Tests the newly configured Azure OpenAI setup
 */

const { AzureOpenAI } = require('openai');

// Configuration (same as in your app)
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || 
                   "FM1DHQMuPkCX1TKRnIVVprIoQ1RwI6yaPBNEJ0gx3kdRUNMpprAlJQQJ99BGACYeBjFXJ3w3AAABACOGLuJD";
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 
                     "https://neuroflow-hub.openai.azure.com/";
const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || 
                       "2024-04-01-preview";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 
                  process.env.DEPLOYMENT_NAME || 
                  "gpt-4.1";

console.log('🔧 Azure OpenAI Configuration Test');
console.log('=====================================');
console.log(`API Key: ${azureApiKey ? azureApiKey.substring(0, 8) + '...' + azureApiKey.slice(-8) : 'Not Set'}`);
console.log(`Endpoint: ${azureEndpoint}`);
console.log(`API Version: ${azureApiVersion}`);
console.log(`Deployment: ${deployment}`);
console.log('=====================================\n');

async function testAzureOpenAI() {
  try {
    console.log('🚀 Initializing Azure OpenAI client...');
    
    const client = new AzureOpenAI({
      apiKey: azureApiKey,
      endpoint: azureEndpoint,
      apiVersion: azureApiVersion,
    });

    console.log('✅ Client initialized successfully');
    console.log('🧪 Testing chat completion...');

    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant for RED.AI platform.' },
        { role: 'user', content: 'Hello! Test message from RED.AI. Please confirm you are working correctly.' }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content;

    if (response) {
      console.log('✅ SUCCESS! Azure OpenAI is working correctly');
      console.log('📝 Response:', response);
      console.log('📊 Usage:', completion.usage);
      console.log('🤖 Model:', completion.model);
      console.log('\n🎉 Azure OpenAI setup is COMPLETE and WORKING!');
      console.log('💡 You can now run: npm run dev');
    } else {
      console.error('❌ No response received from Azure OpenAI');
    }

  } catch (error) {
    console.error('\n❌ Azure OpenAI Test Failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n🔧 SOLUTION: Check your endpoint URL');
      console.error('✅ Correct: https://neuroflow-hub.openai.azure.com/');
      console.error('❌ Wrong: https://your-resource.openai.azure.com/');
    } else if (error.message.includes('401')) {
      console.error('\n🔧 SOLUTION: Check your API key');
      console.error('Get it from: https://portal.azure.com → Your Resource → Keys and Endpoint');
    } else if (error.message.includes('404')) {
      console.error('\n🔧 SOLUTION: Check your deployment name');
      console.error('Available deployments: gpt-4.1, dall-e-3');
      console.error('Check in Azure Portal → Your Resource → Deployments');
    }
  }
}

// Run the test
testAzureOpenAI(); 