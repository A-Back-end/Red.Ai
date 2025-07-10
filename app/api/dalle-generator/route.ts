import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface DalleGenerationRequest {
  prompt: string
  style?: string
  roomType?: string
  budgetLevel?: string
  quality?: 'standard' | 'hd'
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  dalleStyle?: 'vivid' | 'natural'
}

// Enhanced prompt creation specifically for DALL-E
function createDalleInteriorPrompt(
  prompt: string, 
  style: string, 
  roomType: string, 
  budgetLevel: string
): string {
  const styleDescriptions: Record<string, string> = {
    modern: "sleek contemporary design with clean lines, premium materials, minimalist aesthetic, geometric forms",
    minimalist: "clean simple design with neutral colors, functional furniture, uncluttered space, zen-like atmosphere",
    scandinavian: "light woods, white walls, cozy textiles, hygge atmosphere, natural light, nordic simplicity",
    industrial: "exposed brick walls, steel elements, vintage furniture, urban loft style, raw materials",
    bohemian: "eclectic mix of patterns, rich warm colors, layered textiles, artistic elements, global influences",
    classic: "timeless elegance, traditional furniture, sophisticated color palette, refined details"
  }

  const roomDescriptions: Record<string, string> = {
    living: "comfortable living room with seating area, entertainment space, social gathering zone",
    bedroom: "peaceful bedroom with restful sleeping space, personal sanctuary, calming atmosphere", 
    kitchen: "functional kitchen with modern appliances, cooking space, dining area, family hub",
    bathroom: "spa-like bathroom with modern fixtures, relaxing ambiance, luxury finishes",
    office: "productive home office with organized workspace, storage solutions, professional environment",
    dining: "elegant dining room with entertaining area, sophisticated atmosphere, formal setting"
  }

  const budgetDescriptions: Record<string, string> = {
    low: "budget-friendly furnishings, smart design choices, affordable yet stylish pieces",
    medium: "quality mid-range furniture, balanced investment, good value designer pieces",
    high: "luxury materials, premium designer furniture, high-end finishes, exclusive pieces"
  }

  const enhancedPrompt = `Interior design: ${prompt}

Style: ${styleDescriptions[style] || styleDescriptions.modern}
Room: ${roomDescriptions[roomType] || roomDescriptions.living}  
Budget: ${budgetDescriptions[budgetLevel] || budgetDescriptions.medium}

Professional interior photography, high-quality realistic render, perfect lighting, detailed textures, architectural photography style, magazine quality, 8K resolution, photorealistic.`

  return enhancedPrompt
}

// Save base64 image to file system
async function saveImageToFile(base64String: string, filename: string): Promise<string> {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'generated-images')
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    
    const imageBuffer = Buffer.from(base64String, 'base64')
    const filePath = path.join(publicDir, filename)
    
    await fs.promises.writeFile(filePath, imageBuffer)
    
    return `/generated-images/${filename}`
  } catch (error) {
    console.error('Error saving image:', error)
    throw new Error('Failed to save image')
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Starting DALL-E image generation...')
    
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('❌ No OpenAI API key found')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }
    
    const body = await request.json() as DalleGenerationRequest
    const { 
      prompt, 
      style = 'modern', 
      roomType = 'living',
      budgetLevel = 'medium',
      quality = 'hd',
      size = '1024x1024',
      dalleStyle = 'natural'
    } = body
    
    console.log('📝 Request:', { 
      prompt: prompt?.substring(0, 100) + '...', 
      style,
      roomType,
      budgetLevel,
      quality,
      size,
      dalleStyle
    })
    
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Design description is required' },
        { status: 400 }
      )
    }

    // Create enhanced prompt for DALL-E
    const enhancedPrompt = createDalleInteriorPrompt(prompt, style, roomType, budgetLevel)
    console.log('🚀 Enhanced prompt:', enhancedPrompt.substring(0, 200) + '...')

    let generatedImageUrl = ''
    let generatedImageBase64 = ''
    let imageMetadata: any = {}

    try {
      // Generate image with DALL-E 3
      console.log('🎨 Generating image with DALL-E 3...')
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: quality,
        style: dalleStyle,
        response_format: "b64_json"
      })

      if (response.data && response.data[0] && response.data[0].b64_json) {
        generatedImageBase64 = response.data[0].b64_json
        
        // Save to file system
        const timestamp = Date.now()
        const filename = `dalle-${style}-${roomType}-${timestamp}.png`
        
        const savedImageUrl = await saveImageToFile(generatedImageBase64, filename)
        generatedImageUrl = savedImageUrl
        
        imageMetadata = {
          model: "dall-e-3",
          size: size,
          quality: quality,
          style: dalleStyle,
          revisedPrompt: response.data[0].revised_prompt || enhancedPrompt,
          timestamp: new Date().toISOString()
        }
        
        console.log('✅ DALL-E 3 image generation completed successfully!')
        console.log('📄 Revised prompt:', response.data[0].revised_prompt?.substring(0, 100) + '...')
      } else {
        throw new Error('No image data received from DALL-E 3')
      }
    } catch (generateError) {
      console.error('❌ DALL-E 3 generation failed:', generateError)
      
      // Return detailed error response
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to generate image with DALL-E 3', 
          details: generateError instanceof Error ? generateError.message : 'Unknown error',
          errorType: generateError instanceof Error ? generateError.constructor.name : 'UnknownError'
        },
        { status: 500 }
      )
    }

    // Calculate estimated cost
    const estimatedCost = quality === 'hd' ? '$0.080' : '$0.040'

    const response = {
      success: true,
      imageUrl: generatedImageUrl,
      base64Image: generatedImageBase64 ? `data:image/png;base64,${generatedImageBase64}` : null,
      metadata: {
        style,
        roomType,
        budgetLevel,
        quality,
        size,
        dalleStyle,
        enhancedPrompt: enhancedPrompt.substring(0, 200) + '...',
        originalPrompt: prompt,
        estimatedCost: estimatedCost,
        generationMode: 'dalle-3-direct',
        timestamp: new Date().toISOString(),
        ...imageMetadata
      }
    }

    console.log('🎉 DALL-E generation completed successfully!')
    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 Error in DALL-E generation:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate image with DALL-E', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'DALL-E Image Generation API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/dalle-generator - Generate images with DALL-E 3'
    },
    models: ['dall-e-3'],
    supportedSizes: ['1024x1024', '1792x1024', '1024x1792'],
    supportedQualities: ['standard', 'hd'],
    supportedStyles: ['vivid', 'natural']
  })
} 