// File: app/api/check-status/route.ts
import { NextResponse } from 'next/server';

// Helper to get the correct BFL API key (same as in generate-design)
const getBflApiKey = (): string | null => {
  const envKey = process.env.BFL_API_KEY;
  
  // Return null if not configured properly (no hardcoded fallbacks)
  if (!envKey || envKey === 'your_bfl_api_key_here' || envKey === 'BFL_API_KEY' || envKey.trim() === '') {
    return null;
  }
  
  return envKey;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pollingUrl = searchParams.get('url');

  if (!pollingUrl) {
    return NextResponse.json({ message: 'Polling URL parameter is required' }, { status: 400 });
  }

  const apiKey = getBflApiKey();
  if (!apiKey) {
    console.error('[Check Status API] BFL_API_KEY environment variable is missing or invalid');
    return NextResponse.json({ 
      message: 'BFL API key is not configured. Please set BFL_API_KEY environment variable.' 
    }, { status: 500 });
  }

  console.log('[Check Status API] Checking status at:', pollingUrl);

  // Retry logic for status checking
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout for status checks

      console.log(`[Check Status API] Attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const bflResponse = await fetch(pollingUrl, {
        method: 'GET',
        headers: { 'x-key': apiKey },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!bflResponse.ok) {
        const errorText = await bflResponse.text();
        console.error(`[Check Status API] HTTP ${bflResponse.status} from BFL.ai:`, errorText);
        
        // Don't retry on client errors (4xx)
        if (bflResponse.status >= 400 && bflResponse.status < 500) {
          return NextResponse.json({ 
            message: `Status check failed: ${errorText || 'Invalid request'}` 
          }, { status: bflResponse.status });
        }
        
        // Retry on server errors (5xx)
        lastError = new Error(`HTTP ${bflResponse.status}: ${errorText}`);
        continue;
      }

      const responseData = await bflResponse.json();
      console.log('[Check Status API] Status response:', responseData.status || 'no status field');
      
      // Forward the exact response from BFL.ai to our frontend
      return NextResponse.json(responseData);

    } catch (error: any) {
      lastError = error;
      
      if (error.name === 'AbortError') {
        console.warn(`[Check Status API] Request ${attempt + 1} timed out after 10 seconds`);
      } else {
        console.warn(`[Check Status API] Request ${attempt + 1} failed:`, error.message);
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) break;
      
      // Wait before retry
      const waitTime = Math.pow(2, attempt) * 500; // 0.5s, 1s, 2s...
      console.log(`[Check Status API] Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // All attempts failed
  if (lastError?.name === 'AbortError') {
    console.error('[Check Status API] All status check requests timed out');
    return NextResponse.json({ 
      message: 'Status check timed out. The generation may still be in progress.' 
    }, { status: 504 });
  }
  
  console.error('[Check Status API] All attempts failed. Last error:', lastError);
  return NextResponse.json({ 
    message: 'Unable to check generation status. Please try again.',
    error: lastError?.message 
  }, { status: 503 });
} 