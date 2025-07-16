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
const getBflApiKey = (): string | null => {
  // const envKey = process.env.BFL_API_KEY;
  
  // Return null if not configured properly (no hardcoded fallbacks)
  // if (!envKey || envKey === '501cf430-f9d9-445b-9b60-1949650f352a' || envKey.trim() === '') {
  //   return null;
  // }
  
  return "501cf430-f9d9-445b-9b60-1949650f352a";
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
      console.error('[Generate API] BFL_API_KEY environment variable is missing or invalid');
      return NextResponse.json({ 
        message: 'BFL API key is not configured. Please set BFL_API_KEY environment variable.' 
      }, { status: 500 });
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

    // Retry logic with shorter timeouts
    const maxRetries = 2;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
    const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Reduced to 15-second timeout

        console.log(`[Generate API] Sending request to BFL.ai (attempt ${attempt + 1}/${maxRetries + 1})...`);
        console.log(`[Generate API] Prompt length: ${optimizedPrompt.length} characters`);

    const bflResponse = await fetch(bflApiUrl, {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json', 
            'x-key': apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

        if (!bflResponse.ok) {
          const errorText = await bflResponse.text();
          console.error(`[Generate API] HTTP ${bflResponse.status} from BFL.ai:`, errorText);
          
          // Don't retry on client errors (4xx)
          if (bflResponse.status >= 400 && bflResponse.status < 500) {
            return NextResponse.json({ 
              message: `BFL.ai error: ${errorText || 'Invalid request'}` 
            }, { status: bflResponse.status });
          }
          
          // Retry on server errors (5xx)
          lastError = new Error(`HTTP ${bflResponse.status}: ${errorText}`);
          continue;
        }

    const responseData = await bflResponse.json();
        console.log('[Generate API] Successfully started generation. Response:', responseData);
        console.log('[Generate API] Polling URL received:', responseData.polling_url);
        
        // Validate polling URL
        if (!responseData.polling_url) {
          console.error('[Generate API] Warning: No polling URL in response');
        } else if (!responseData.polling_url.startsWith('http')) {
          console.error('[Generate API] Warning: Invalid polling URL format:', responseData.polling_url);
        }
        
    return NextResponse.json(responseData);

  } catch (error: any) {
        lastError = error;
        
    if (error.name === 'AbortError') {
          console.warn(`[Generate API] Request ${attempt + 1} timed out after 15 seconds`);
        } else {
          console.warn(`[Generate API] Request ${attempt + 1} failed:`, error.message);
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) break;
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        console.log(`[Generate API] Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // All attempts failed
    if (lastError?.name === 'AbortError') {
      console.error('[Generate API] All requests to BFL.ai timed out');
      return NextResponse.json({ 
        message: 'The design service is currently slow to respond. Please try again in a few minutes.' 
      }, { status: 504 });
    }
    
    console.error('[Generate API] All attempts failed. Last error:', lastError);
    return NextResponse.json({ 
      message: 'The design service is temporarily unavailable. Please try again later.',
      error: lastError?.message 
    }, { status: 503 });

  } catch (error: any) {
    // This catch handles any unexpected errors outside the retry loop
    console.error('[Generate API] Unexpected error occurred:', error);
    return NextResponse.json({ 
      message: 'An unexpected error occurred. Please try again.', 
      error: error.message 
    }, { status: 500 });
  }
} 