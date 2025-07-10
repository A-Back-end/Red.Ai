#!/usr/bin/env node

/**
 * Test script for Azure DALL-E 3 integration
 * Replaces the old Stable Diffusion testing
 */

const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_PROMPT = 'Modern minimalist living room with natural light, comfortable furniture, and clean aesthetic';

async function testDalleIntegration() {
  console.log('🧪 Testing Azure DALL-E 3 Integration');
  console.log('=====================================');
  
  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/generate-design`, {
      method: 'GET'
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed');
      console.log(`   Service: ${healthData.provider}`);
      console.log(`   Model: ${healthData.model}`);
      console.log(`   Version: ${healthData.version}`);
      console.log(`   Configured: ${healthData.apiKeyConfigured ? '✅' : '❌'}`);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
      return;
    }
    
    // Test 2: Design generation
    console.log('\n2️⃣ Testing design generation...');
    console.log(`   Prompt: ${TEST_PROMPT}`);
    
    const generateResponse = await fetch(`${BASE_URL}/api/generate-design`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: TEST_PROMPT,
        style: 'modern',
        roomType: 'living-room',
        budgetLevel: 'medium'
      })
    });
    
    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      
      if (generateData.success) {
        console.log('✅ Design generation successful!');
        console.log(`   Model: ${generateData.metadata?.model}`);
        console.log(`   Provider: ${generateData.metadata?.provider}`);
        console.log(`   Style: ${generateData.metadata?.style}`);
        console.log(`   Room: ${generateData.metadata?.roomType}`);
        console.log(`   Cost: ${generateData.metadata?.estimatedCost}`);
        console.log(`   Image saved: ${generateData.imageUrl ? '✅' : '❌'}`);
        
        if (generateData.metadata?.revisedPrompt) {
          console.log(`   Revised prompt: ${generateData.metadata.revisedPrompt.substring(0, 100)}...`);
        }
      } else {
        console.log('❌ Design generation failed:', generateData.error);
        console.log('   Details:', generateData.details);
      }
    } else {
      const errorData = await generateResponse.json().catch(() => null);
      console.log('❌ Request failed:', generateResponse.status);
      if (errorData) {
        console.log('   Error:', errorData.error);
        console.log('   Details:', errorData.details);
      }
    }
    
  } catch (error) {
    console.log('💥 Test failed with error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
  
  console.log('\n🏁 Test completed!');
}

// Check if we're running directly
if (require.main === module) {
  testDalleIntegration();
}

module.exports = { testDalleIntegration }; 