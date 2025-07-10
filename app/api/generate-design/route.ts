import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { AzureOpenAI } from 'openai';

const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT, // Corrected property
});

// Ensure fetch is available globally
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch');
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
  console.log('🎨 Generating image with Azure DALL-E 3...');
  
  if (!process.env.AZURE_OPENAI_API_KEY) {
    throw new Error('Azure OpenAI API key not configured');
  }

  const deploymentName = process.env.AZURE_DALLE_DEPLOYMENT_NAME || 'dall-e-3';

  console.log('📝 Azure DALL-E Request:', { 
    prompt: prompt.substring(0, 100) + '...',
    quality,
    deployment: deploymentName,
  });

  try {
    // Corrected call to openai.images.generate
    const result = await openai.images.generate({
      model: deploymentName,
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: quality === 'hd' ? 'hd' : 'standard',
      style: "vivid",
    });

    if (!result.data || result.data.length === 0 || !result.data[0].url) {
      throw new Error('No image generated by Azure DALL-E 3');
    }

    console.log('✅ Azure DALL-E 3 response received successfully');
    return {
      imageUrl: result.data[0].url,
      revisedPrompt: result.data[0].revised_prompt || prompt
    };
  } catch (fetchError) {
    console.error('💥 Fetch error details:', fetchError);
    throw new Error(`Azure DALL-E 3 request failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'}`);
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
    { name: "Классический дизайн", description: "Элегантность и изысканные детали", image: "/img/style-classic.jpg" },
    { name: "Богемный шик", description: "Яркие цвета и эклектичные узоры", image: "/img/style-bohemian.jpg" }
  ]
  return styles.slice(0, 3)
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    const body: DesignGenerationRequest = await request.json()
    const { 
      prompt, 
      apartmentStyle = 'Modern', 
      roomType = 'Living Room', 
      budgetLevel = 'medium',
      quality = 'standard',
      mode = 'generate',
      designNew
    } = body

    // Free mode: return mock data
    if (mode !== 'edit' && budgetLevel === 'low') {
      const mockAnalysis: RoomAnalysis = {
        roomType,
        style: apartmentStyle,
        description: "Анализ для бесплатного тарифа",
        suggestions: ["Использовать светлые тона", "Добавить зеркала"]
      }
      const freeResponse = generateFreeDesignRecommendation(mockAnalysis, body)
      return NextResponse.json(freeResponse)
    }

    // Premium mode: generate design with DALL-E
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const dallePrompt = createPremiumInteriorPrompt(prompt, apartmentStyle, roomType, budgetLevel, designNew, body.budget)
    
    const { imageUrl, revisedPrompt } = await generateWithAzureDalle(dallePrompt, quality)
    
    // Save generated image locally
    const timestamp = new Date().getTime()
    const filename = `design-${timestamp}.png`
    const localImageUrl = await saveImageToFile(imageUrl, filename)
    
    // Generate furniture and style recommendations
    const furniture = generatePremiumFurniture(apartmentStyle, roomType, budgetLevel, revisedPrompt)
    const pinterestStyles = generateIntelligentPinterestStyles(apartmentStyle, revisedPrompt)

    return NextResponse.json({
      imageUrl: localImageUrl,
      revisedPrompt,
      furniture,
      pinterestStyles,
      analysis: {
        roomType,
        style: apartmentStyle,
        budget: budgetLevel,
        prompt: dallePrompt
      }
    })

  } catch (error) {
    console.error('Error in generate-design endpoint:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: 'Failed to generate design', details: errorMessage }, { status: 500 })
  }
} 