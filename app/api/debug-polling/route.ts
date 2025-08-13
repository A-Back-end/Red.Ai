// File: app/api/debug-polling/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pollingUrl } = body;

    console.log('[Debug Polling API] Received request:', {
      pollingUrl,
      type: typeof pollingUrl,
      length: pollingUrl?.length
    });

    if (!pollingUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'No polling URL provided' 
      }, { status: 400 });
    }

    if (typeof pollingUrl !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Polling URL must be a string',
        receivedType: typeof pollingUrl
      }, { status: 400 });
    }

    // Test the URL format
    const urlValidation = {
      isString: typeof pollingUrl === 'string',
      length: pollingUrl.length,
      startsWithHttp: pollingUrl.startsWith('http'),
      includesBfl: pollingUrl.includes('bfl.ai'),
      includesIp: pollingUrl.includes('13.107.246.45'),
      hasValidFormat: /^https?:\/\/[^\s]+$/.test(pollingUrl)
    };

    console.log('[Debug Polling API] URL validation:', urlValidation);

    // Try to make a request to check-status API
    try {
      const checkStatusResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/check-status?url=${encodeURIComponent(pollingUrl)}`);
      const checkStatusData = await checkStatusResponse.json();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Polling URL debug completed',
        urlValidation,
        checkStatusResponse: {
          ok: checkStatusResponse.ok,
          status: checkStatusResponse.status,
          data: checkStatusData
        }
      });
    } catch (error: any) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to test polling URL',
        details: error.message,
        urlValidation
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[Debug Polling API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
} 