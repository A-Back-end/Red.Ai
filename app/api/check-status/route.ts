// File: app/api/check-status/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pollingUrl = searchParams.get('url');

  if (!pollingUrl) {
    return NextResponse.json({ message: 'Polling URL parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.BFL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: 'API key is not configured on the server' }, { status: 500 });
  }

  try {
    const bflResponse = await fetch(pollingUrl, {
      method: 'GET',
      headers: { 'x-key': apiKey },
    });

    const responseData = await bflResponse.json();
    console.log('[Check Status API] Response from BFL.ai:', responseData);
    // Forward the exact response and status from BFL.ai to our frontend
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('[Check Status API] A critical error occurred:', error);
    return NextResponse.json({ message: 'Failed to fetch status due to a server error.', error: error.message }, { status: 500 });
  }
} 