// File: app/api/check-status/route.ts
import { NextResponse } from 'next/server';
import { checkStatus, getBflApiKey } from '@/utils/bflApiClient';

// Validate BFL.ai URL format
const isValidBflUrl = (url: string): boolean => {
  try {
    // First, check if it's a valid URL
    const urlObj = new URL(url);
    
    // Accept both EU and global endpoints, plus the IP-based endpoint
    const validHosts = ['api.bfl.ai', 'api.eu1.bfl.ai', 'api.eu4.bfl.ai', 'api.us1.bfl.ai', '13.107.246.45'];
    const isValidHost = validHosts.includes(urlObj.hostname);
    
    // Check for valid paths - BFL.ai endpoints
    const isValidBflPath = urlObj.pathname.includes('/v1/get_result') || 
                           urlObj.pathname.includes('/flux-') ||
                           urlObj.pathname.includes('/v1/flux-');
    
    // Check for ID parameter or path-based ID
    const hasId = urlObj.searchParams.has('id') || 
                  urlObj.pathname.includes('/') ||
                  !!urlObj.pathname.match(/\/[a-zA-Z0-9_-]+$/);
    
    console.log('[Check Status API] URL validation:', {
      url,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      isValidHost,
      isValidBflPath,
      hasId,
      searchParams: Object.fromEntries(urlObj.searchParams)
    });
    
    return isValidHost && (isValidBflPath || hasId);
  } catch (error) {
    console.error('[Check Status API] URL validation failed:', error);
    return false;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pollingUrl = searchParams.get('url');

  console.log('[Check Status API] Received request with URL:', pollingUrl);
  console.log('[Check Status API] URL type:', typeof pollingUrl);
  console.log('[Check Status API] URL length:', pollingUrl?.length);

  if (!pollingUrl) {
    console.error('[Check Status API] No URL parameter provided');
    return NextResponse.json({ 
      message: 'Polling URL parameter is required',
      error: 'Missing url parameter'
    }, { status: 400 });
  }

  if (typeof pollingUrl !== 'string') {
    console.error('[Check Status API] URL parameter is not a string:', typeof pollingUrl);
    return NextResponse.json({ 
      message: 'Polling URL parameter must be a string',
      error: 'Invalid url parameter type',
      receivedType: typeof pollingUrl
    }, { status: 400 });
  }

  // Validate URL format
  if (!isValidBflUrl(pollingUrl)) {
    console.error('[Check Status API] Invalid URL format:', pollingUrl);
    console.error('[Check Status API] URL validation failed. Details:', {
      url: pollingUrl,
      type: typeof pollingUrl,
      length: pollingUrl.length,
      startsWithHttp: pollingUrl.startsWith('http'),
      includesBfl: pollingUrl.includes('bfl.ai'),
      includesIp: pollingUrl.includes('13.107.246.45')
    });
    return NextResponse.json({ 
      message: 'Invalid polling URL format',
      error: 'URL must be a valid BFL.ai polling endpoint',
      receivedUrl: pollingUrl,
      validationDetails: {
        type: typeof pollingUrl,
        length: pollingUrl.length,
        startsWithHttp: pollingUrl.startsWith('http'),
        includesBfl: pollingUrl.includes('bfl.ai'),
        includesIp: pollingUrl.includes('13.107.246.45')
      }
    }, { status: 400 });
  }

  const apiKey = getBflApiKey();
  if (!apiKey) {
    console.error('[Check Status API] BFL_API_KEY environment variable is missing or invalid');
    return NextResponse.json({ 
      message: 'BFL API key is not configured. Please set BFL_API_KEY environment variable.',
      error: 'API key missing'
    }, { status: 500 });
  }

  console.log('[Check Status API] Checking status at:', pollingUrl);

  // Retry logic for status checking
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Check Status API] Attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const responseData = await checkStatus(pollingUrl);
      
      console.log('[Check Status API] Status response:', responseData.status || 'no status field');
      
      // Forward the exact response from BFL.ai to our frontend
      return NextResponse.json(responseData);

    } catch (error: any) {
      lastError = error;
      
      console.warn(`[Check Status API] Request ${attempt + 1} failed:`, error.message);
      
      // If it's a 404, it might mean the generation is still processing
      if (error.response && error.response.status === 404) {
        console.log('[Check Status API] 404 received - generation might still be processing');
        // Return a "still processing" status instead of error
        return NextResponse.json({
          status: 'Processing',
          message: 'Generation is still in progress'
        });
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
  console.error('[Check Status API] All attempts failed. Last error:', lastError);
  return NextResponse.json({ 
    message: 'Unable to check generation status. Please try again.',
    error: lastError?.message || 'Unknown error'
  }, { status: 503 });
} 