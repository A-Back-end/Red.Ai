// File: app/api/generate-design/route.ts
import { NextResponse } from 'next/server';
import { generateOptimizedPrompt } from '@/utils/promptGenerator';
import { generateDesign, getBflApiKey } from '@/utils/bflApiClient';

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
        console.log(`[Generate API] Sending request to BFL.ai (attempt ${attempt + 1}/${maxRetries + 1})...`);
        console.log(`[Generate API] Prompt length: ${optimizedPrompt.length} characters`);

        const responseData = await generateDesign(payload);
        
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
        
        console.warn(`[Generate API] Request ${attempt + 1} failed:`, error.message);
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) break;
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        console.log(`[Generate API] Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // All attempts failed
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