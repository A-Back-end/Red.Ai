import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// Ensure fetch is available globally
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

// Azure DALL-E 3 Configuration - using provided credentials
const AZURE_CONFIG = {
  apiKey: 'FM1DHQMuPkCX1TKRnIVVprIoQ1RwI6yaPBNEJ0gx3kdRUNMpprAlJQQJ99BGACYeBjFXJ3w3AAABACOGLuJD',
  endpoint: 'https://neuroflow-hub.openai.azure.com',
  apiVersion: '2024-04-01-preview',
  deploymentName: 'dall-e-3'
}

// Room Analysis Interface (Free tier functionality)
interface RoomAnalysis {
  roomType: string
  style: string
  description: string
  suggestions: string[]
}

interface DesignGenerationRequest {
  prompt: string
  referenceImages?: string[]
  apartmentStyle?: string
  roomType?: string
  design?: string
  designNew?: string
  budgetLevel?: string
  budget?: number
  quality?: 'standard' | 'hd'
  mode?: 'generate' | 'edit'
}

// Generate free design recommendation
function generateFreeDesignRecommendation(roomAnalysis: RoomAnalysis, preferences: any): any {
  const freeRecommendations = {
    colors: ["Нейтральные тона", "Белый и бежевый", "Светло-серый"],
    furniture: ["Многофункциональная мебель", "Складные столы", "Модульные системы хранения"],
    budget: ["DIY решения", "Вторичный рынок", "Бюджетные бренды"],
    tips: ["Используйте зеркала для визуального расширения", "Добавьте растения для уюта", "Максимизируйте естественное освещение"]
  }
  
  return {
    analysis: roomAnalysis,
    recommendations: freeRecommendations,
    estimated_cost: "15,000 - 50,000₽",
    timeline: "2-4 недели"
  }
}

// Create comprehensive DALL-E prompt using the specified template
function createPremiumInteriorPrompt(
  userPrompt: string, 
  apartmentStyle: string, 
  roomType: string, 
  budgetLevel: string,
  designNew?: string,
  budget?: number
): string {
  // Map apartment styles to descriptive text
  const styleDescriptions: Record<string, string> = {
    'Modern': 'sleek contemporary design with clean lines, premium materials, and minimalist aesthetic',
    'Scandinavian': 'cozy Nordic design with natural wood, white tones, and hygge atmosphere',
    'Industrial': 'urban loft design with exposed brick, metal fixtures, and raw materials',
    'Classic': 'timeless elegant design with refined details and sophisticated elements',
    'Minimalist': 'ultra-clean design with essential elements only and maximum functionality',
    'Bohemian': 'eclectic design with vibrant colors, mixed patterns, and artistic elements',
    'Luxury': 'high-end design with premium materials, elegant finishes, and sophisticated details'
  }

  // Map room types to descriptive text
  const roomDescriptions: Record<string, string> = {
    'Living Room': 'living room with comfortable seating area and entertainment space',
    'Bedroom': 'bedroom with restful sleeping area and personal sanctuary',
    'Kitchen': 'kitchen with functional cooking space and dining area',
    'Bathroom': 'bathroom with spa-like atmosphere and modern fixtures',
    'Dining Room': 'dining room with elegant table setting and entertaining space',
    'Home Office': 'home office with productive workspace and storage solutions',
    'Children Room': 'children room with playful design and safe environment'
  }

  // Map budget levels to ranges
  const budgetRanges: Record<string, string> = {
    'low': '$4,000 and $12,000',
    'medium': '$12,000 and $25,000', 
    'high': '$25,000 and $50,000',
    'luxury': '$50,000 and $100,000'
  }

  const roomDesc = roomDescriptions[roomType] || 'living space'
  const styleDesc = styleDescriptions[apartmentStyle] || 'modern contemporary design'
  const budgetRange = budgetRanges[budgetLevel] || '$12,000 and $25,000'
  const designElement = designNew && designNew !== 'No Design' ? designNew : 'functional and aesthetically pleasing elements'

  // Use the exact template structure provided by the user
  const dallePrompt = `Generate a high-quality, professional interior design image of a ${roomDesc} in a ${styleDesc} aesthetic. The design should incorporate ${designElement}. The overall ambiance should align with a budget between ${budgetRange}, reflecting realistic choices for this price range.

${userPrompt} Ensure the design is 3D/photorealistic based on selection. Consider modern interior design principles and create an inspiring space. Focus on professional lighting, realistic textures, and cohesive color palette. The final image should be well-lit, visually appealing, and inspiring for a renovation project.`

  return dallePrompt
}

// Generate image using Azure DALL-E 3
async function generateWithAzureDalle(prompt: string, quality: string = 'standard'): Promise<{imageUrl: string, revisedPrompt: string}> {
  console.log('🎨 Generating image with Azure DALL-E 3...')
  
  if (!AZURE_CONFIG.apiKey) {
    throw new Error('Azure OpenAI API key not configured')
  }

  const requestBody = {
    prompt: prompt,
    style: "vivid",
    quality: quality,
    size: "1024x1024",
    n: 1
  }

  // Fix the endpoint URL format
  const endpoint = `${AZURE_CONFIG.endpoint}/openai/deployments/${AZURE_CONFIG.deploymentName}/images/generations?api-version=${AZURE_CONFIG.apiVersion}`

  console.log('📝 Azure DALL-E Request:', { 
    prompt: prompt.substring(0, 100) + '...',
    quality,
    deployment: AZURE_CONFIG.deploymentName,
    endpoint: endpoint
  })

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api-key': AZURE_CONFIG.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📊 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Azure DALL-E 3 API error response:', errorText)
      throw new Error(`Azure DALL-E 3 API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.data || result.data.length === 0) {
      throw new Error('No image generated by Azure DALL-E 3')
    }

    console.log('✅ Azure DALL-E 3 response received successfully')
    return {
      imageUrl: result.data[0].url,
      revisedPrompt: result.data[0].revised_prompt || prompt
    }
  } catch (fetchError) {
    console.error('💥 Fetch error details:', fetchError)
    throw new Error(`Azure DALL-E 3 request failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'}`)
  }
}

// Save image from URL to local file system
async function saveImageToFile(imageUrl: string, filename: string): Promise<string> {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'generated-images')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    
    // Fetch image from URL
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    const filePath = path.join(publicDir, filename)
    
    await fs.promises.writeFile(filePath, Buffer.from(imageBuffer))
    
    return `/generated-images/${filename}`
  } catch (error) {
    console.error('Error saving image:', error)
    throw new Error('Failed to save image')
  }
}

// Generate furniture recommendations based on generated design
function generatePremiumFurniture(style: string, roomType: string, budgetLevel: string, prompt: string) {
  const furnitureDatabase: Record<string, Record<string, any[]>> = {
    Modern: {
      'Living Room': [
        { name: "Модульный диван", price: "от 85,000₽", description: "Трансформируемая мебель для гостиной", category: "seating" },
        { name: "Журнальный стол", price: "от 25,000₽", description: "Стеклянная столешница с металлическими ножками", category: "tables" },
        { name: "ТВ-тумба", price: "от 40,000₽", description: "Подвесная тумба с LED-подсветкой", category: "storage" }
      ],
      'Bedroom': [
        { name: "Кровать-платформа", price: "от 60,000₽", description: "Современная кровать с минималистичным дизайном", category: "beds" },
        { name: "Прикроватные тумбы", price: "от 15,000₽", description: "Парящие тумбы с LED-подсветкой", category: "storage" },
        { name: "Гардеробная система", price: "от 120,000₽", description: "Встроенная система хранения", category: "wardrobes" }
      ],
      'Kitchen': [
        { name: "Кухонный гарнитур", price: "от 150,000₽", description: "Современная кухня с островом", category: "kitchen" },
        { name: "Барные стулья", price: "от 20,000₽", description: "Дизайнерские стулья для острова", category: "seating" },
        { name: "Обеденный стол", price: "от 35,000₽", description: "Стол из натурального дерева", category: "tables" }
      ]
    },
    Scandinavian: {
      'Living Room': [
        { name: "Деревянный диван", price: "от 70,000₽", description: "Светлое дерево, уютные подушки", category: "seating" },
        { name: "Кофейный столик", price: "от 18,000₽", description: "Натуральное дерево, простые формы", category: "tables" },
        { name: "Текстильные аксессуары", price: "от 10,000₽", description: "Пледы, подушки, ковры", category: "textiles" }
      ],
      'Bedroom': [
        { name: "Деревянная кровать", price: "от 50,000₽", description: "Светлая древесина, уютный стиль", category: "beds" },
        { name: "Комод", price: "от 25,000₽", description: "Функциональное хранение", category: "storage" }
      ],
      'Kitchen': [
        { name: "Деревянная кухня", price: "от 120,000₽", description: "Светлые оттенки, натуральные материалы", category: "kitchen" },
        { name: "Обеденная группа", price: "от 40,000₽", description: "Стол и стулья из дерева", category: "dining" }
      ]
    }
  }

  const roomFurniture = furnitureDatabase[style]?.[roomType] || furnitureDatabase.Modern['Living Room']
  return roomFurniture
}

// Generate Pinterest-style design ideas
function generateIntelligentPinterestStyles(style: string, prompt: string) {
  const styles = [
    { name: "Современный минимализм", description: "Чистые линии и нейтральные цвета", image: "/img/style-modern-minimalism.jpg" },
    { name: "Скандинавский уют", description: "Светлые оттенки и натуральные материалы", image: "/img/style-scandinavian.jpg" },
    { name: "Индустриальный лофт", description: "Кирпич, металл и винтажные элементы", image: "/img/style-industrial.jpg" },
    { name: "Классическая элегантность", description: "Изысканные формы и благородные материалы", image: "/img/style-classic.jpg" }
  ]
  
  return styles.slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Starting AI interior design generation...')
    
    const body = await request.json() as DesignGenerationRequest
    const { 
      prompt, 
      referenceImages = [],
      apartmentStyle = 'Modern',
      roomType = 'Living Room',
      design = '3D',
      designNew = 'No Design',
      budgetLevel = 'medium',
      budget = 15000,
      quality = 'standard',
      mode = 'generate'
    } = body
    
    console.log('📝 Request details:', { 
      promptLength: prompt?.length,
      originalUserPrompt: prompt?.substring(0, 50) + '...',
      hasReferenceImages: referenceImages.length > 0,
      apartmentStyle,
      roomType,
      design,
      designNew,
      budgetLevel,
      budget,
      quality,
      mode
    })
    
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Design description is required' },
        { status: 400 }
      )
    }

    let generatedImageUrl = ''
    let imageMetadata: any = {}

    // Create comprehensive DALL-E prompt using user's template
    const enhancedPrompt = createPremiumInteriorPrompt(prompt, apartmentStyle, roomType, budgetLevel, designNew, budget)
    console.log('🚀 Using comprehensive DALL-E prompt (first 300 chars):', enhancedPrompt.substring(0, 300) + '...')

    try {
      // Generate image with Azure DALL-E 3
      const result = await generateWithAzureDalle(enhancedPrompt, quality)
      
      // Save image to local file system
      const timestamp = Date.now()
      const filename = `dalle3-${apartmentStyle.toLowerCase()}-${roomType.toLowerCase().replace(' ', '-')}-${timestamp}.png`
      
      const savedImageUrl = await saveImageToFile(result.imageUrl, filename)
      generatedImageUrl = savedImageUrl
      
      imageMetadata = {
        model: "azure-dall-e-3",
        mode: "generate",
        revisedPrompt: result.revisedPrompt,
        size: "1024x1024",
        quality: quality,
        style: "vivid",
        originalUrl: result.imageUrl
      }
      
      console.log('✅ Image generation completed successfully!')
      console.log('📄 Revised prompt (first 100 chars):', result.revisedPrompt?.substring(0, 100) + '...')
      
    } catch (generateError) {
      console.error('❌ Azure DALL-E 3 generation failed:', generateError)
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to generate image with Azure DALL-E 3', 
          details: generateError instanceof Error ? generateError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Generate additional content
    const furniture = generatePremiumFurniture(apartmentStyle, roomType, budgetLevel, prompt)
    const pinterestStyles = generateIntelligentPinterestStyles(apartmentStyle, prompt)

    // Calculate estimated cost
    const estimatedCost = quality === 'hd' ? '$0.08' : '$0.04'

    const response = {
      success: true,
      imageUrl: generatedImageUrl,
      furniture,
      pinterestStyles,
      threeDModel: null,
      metadata: {
        apartmentStyle,
        roomType,
        budgetLevel,
        quality,
        enhancedPrompt: enhancedPrompt.substring(0, 200) + '...',
        imageAnalysis: 'Professional interior design generated with Azure DALL-E 3',
        timestamp: new Date().toISOString(),
        hasReferenceImage: referenceImages.length > 0,
        originalPrompt: prompt,
        estimatedCost: estimatedCost,
        generationMode: 'azure-dalle3-generate',
        model: 'azure-dall-e-3',
        ...imageMetadata
      }
    }

    console.log('🎉 Design generation completed successfully!')
    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 Error in design generation:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate design', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 