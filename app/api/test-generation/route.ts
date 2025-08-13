// File: app/api/test-generation/route.ts
import { NextResponse } from 'next/server';
import { generateDesign, checkStatus, getBflApiKey } from '@/utils/bflApiClient';

export async function POST() {
  try {
    console.log('[Test Generation API] Starting full generation test...');
    
    const apiKey = getBflApiKey();
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'BFL_API_KEY environment variable is missing or invalid',
        hasApiKey: false
      }, { status: 500 });
    }

    console.log('[Test Generation API] API key found:', apiKey.substring(0, 10) + '...');

    // Test payload
    const testPayload = {
      prompt: "Simple test room design for debugging",
      priority: "high"
    };

    console.log('[Test Generation API] Sending generation request...');
    
    // Step 1: Start generation
    const generationResult = await generateDesign(testPayload);
    
    console.log('[Test Generation API] Generation started:', generationResult);
    
    if (!generationResult.polling_url) {
      return NextResponse.json({ 
        success: false, 
        error: 'No polling URL received from generation',
        generationResult
      }, { status: 500 });
    }

    // Step 2: Check status
    console.log('[Test Generation API] Checking status at:', generationResult.polling_url);
    
    const statusResult = await checkStatus(generationResult.polling_url);
    
    console.log('[Test Generation API] Status check result:', statusResult);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Full generation test completed',
      generation: generationResult,
      status: statusResult,
      hasApiKey: true
    });

  } catch (error: any) {
    console.error('[Test Generation API] Test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred',
      hasApiKey: !!getBflApiKey()
    }, { status: 500 });
  }
} 