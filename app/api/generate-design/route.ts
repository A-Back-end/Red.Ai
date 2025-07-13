// File: app/api/generate-design/route.ts
import { NextResponse } from 'next/server';

// Helper to optimize image base64 if needed
const optimizeImageBase64 = async (base64: string): Promise<string> => {
  // If the image is too large, we could implement optimization here
  // For now, we'll just return the original
  return base64;
};

export async function POST(request: Request) {
  console.log('[Generate API] Received new generation request.');
  try {
    const body = await request.json();
    const { prompt, imageBase64 } = body;

    if (!prompt) {
      return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
    }

    const bflApiUrl = "https://api.bfl.ai/v1/flux-kontext-pro";
    const apiKey = process.env.BFL_API_KEY;
  
    if (!apiKey) {
      throw new Error("BFL_API_KEY is not configured on the server.");
    }

    // Optimize the image if needed
    const optimizedImage = await optimizeImageBase64(imageBase64);

    // Prepare optimized payload
    const payload = {
      prompt: prompt.trim(),
      input_image: optimizedImage,
      // Add optional parameters for faster generation
      priority: "high",
      webhook_url: process.env.WEBHOOK_URL, // Optional: for faster status updates
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    console.log('[Generate API] Sending request to BFL.ai...');
    const bflResponse = await fetch(bflApiUrl, {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json', 
        'x-key': apiKey,
        'x-priority': 'high' // Request higher priority processing
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await bflResponse.json();
    
    if (!bflResponse.ok) {
      console.error('[Generate API] Error from BFL.ai:', responseData);
      return NextResponse.json({ message: responseData.error || 'Failed to start generation at BFL.ai' }, { status: bflResponse.status });
    }
    
    console.log('[Generate API] Successfully started generation. Polling URL:', responseData.polling_url);
    return NextResponse.json(responseData);

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Generate API] Request to BFL.ai timed out.');
      return NextResponse.json({ message: 'The request to the design service timed out. Please try again.' }, { status: 504 });
    }
    console.error('[Generate API] A critical error occurred:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
} 