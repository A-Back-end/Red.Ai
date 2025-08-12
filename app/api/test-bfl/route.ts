// File: app/api/test-bfl/route.ts
import { NextResponse } from 'next/server';
import { testConnection, getBflApiKey } from '@/utils/bflApiClient';

export async function GET() {
  try {
    console.log('[Test BFL API] Starting connection test...');
    
    const apiKey = getBflApiKey();
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'BFL_API_KEY environment variable is missing or invalid',
        hasApiKey: false
      }, { status: 500 });
    }

    console.log('[Test BFL API] API key found:', apiKey.substring(0, 10) + '...');

    // Test the connection
    const result = await testConnection();
    
    console.log('[Test BFL API] Connection test successful:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'BFL API connection test successful',
      result,
      hasApiKey: true
    });

  } catch (error: any) {
    console.error('[Test BFL API] Connection test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred',
      hasApiKey: !!getBflApiKey()
    }, { status: 500 });
  }
} 