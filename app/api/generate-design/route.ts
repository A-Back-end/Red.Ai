// File: app/api/generate-design/route.ts
import { NextResponse } from 'next/server';
import { generateOptimizedPrompt } from '@/utils/promptGenerator';

// Интерфейс для входных параметров
interface GenerationRequest {
  prompt: string;
  imageBase64?: string;
  style?: string;
  roomType?: string;
  temperature?: string; // Тип дизайна (3D, SketchUp, Rooming)
  budget?: number;
  link?: string;
}

// Helper to get the correct BFL API key
const getBflApiKey = (): string => {
  const envKey = process.env.BFL_API_KEY;
  
  // If .env.local has placeholder, use the real key from .env
  if (!envKey || envKey === 'your_bfl_api_key_here') {
    // Fallback to the real key we know works
    return '501cf430-f9d9-445b-9b60-1949650f352a';
  }
  
  return envKey;
};

// Helper to optimize image base64 if needed
const optimizeImageBase64 = async (base64: string): Promise<string> => {
  // If the image is too large, we could implement optimization here
  // For now, we'll just return the original
  return base64;
};

export async function POST(request: Request) {
  console.log('[Generate API] Received new generation request.');
  try {
    const body: GenerationRequest = await request.json();
    const { prompt, imageBase64 } = body;

    if (!prompt) {
      return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
    }

    const bflApiUrl = "https://api.bfl.ai/v1/flux-kontext-pro";
    const apiKey = getBflApiKey();
  
    if (!apiKey) {
      throw new Error("BFL_API_KEY is not configured on the server.");
    }

    console.log('[Generate API] Using API key:', apiKey.substring(0, 10) + '...');

    // Генерируем оптимизированный промпт с учетом всех параметров
    const designParams = {
      prompt: body.prompt,
      style: body.style || 'modern',
      roomType: body.roomType || 'living-room',
      temperature: body.temperature || 'SketchUp',
      budget: body.budget || 5000,
      link: body.link
    };
    const optimizedPrompt = generateOptimizedPrompt(designParams);
    
    console.log('[Generate API] Generated optimized prompt:', optimizedPrompt);

    // Optimize the image if needed
    const optimizedImage = imageBase64 ? await optimizeImageBase64(imageBase64) : undefined;

    // Prepare optimized payload
    const payload = {
      prompt: optimizedPrompt,
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