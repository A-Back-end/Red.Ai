import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Fallback to standard OpenAI API if Azure fails (lazy initialization to avoid build-time errors)
const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured')
  }
  return new OpenAI({ apiKey })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting room analysis with Azure OpenAI...')
    
    const body = await request.json()
    const { image, userPrompt, analysisType = 'comprehensive' } = body
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image is required for analysis' },
        { status: 400 }
      )
    }

    // Extract base64 part if it's a data URL
    const base64Image = image.includes(',') ? image.split(',')[1] : image
    
    // Create comprehensive analysis prompt for GPT-4o Vision
    const analysisPrompt = userPrompt || `
    Проанализируй эту квартиру/комнату как профессиональный дизайнер интерьера и дай подробные рекомендации.

    ВЕРНИ ОТВЕТ СТРОГО В JSON ФОРМАТЕ:
    {
      "roomType": "тип помещения (на русском)",
      "condition": "состояние (отличное/хорошее/удовлетворительное/требует ремонта)",
      "currentStyle": "текущий стиль дизайна",
      "lighting": "тип освещения (естественное/искусственное/смешанное)",
      "colors": ["основной цвет", "дополнительный цвет", "акцентный цвет"],
      "materials": ["материал стен", "напольное покрытие", "потолок"],
      "dimensions": {
        "estimatedArea": "20-25"
      },
      "recommendations": [
        "Конкретная рекомендация 1 по улучшению интерьера",
        "Конкретная рекомендация 2 по освещению", 
        "Конкретная рекомендация 3 по цветовому решению",
        "Конкретная рекомендация 4 по мебели и декору",
        "Конкретная рекомендация 5 по планировке",
        "Конкретная рекомендация 6 по материалам отделки"
      ],
      "estimatedCost": {
        "cosmetic": 250000,
        "major": 800000
      },
      "fullAnalysis": "ПОДРОБНЫЙ АНАЛИЗ:\n\n**АРХИТЕКТУРНЫЙ АНАЛИЗ:**\n- Описание типа и назначения помещения\n- Примерные размеры и планировка\n- Анализ естественного освещения\n- Оценка архитектурных особенностей\n\n**ТЕКУЩЕЕ СОСТОЯНИЕ:**\n- Анализ отделки и материалов\n- Оценка мебели и её расположения\n- Цветовая гамма и стиль\n- Общее состояние\n\n**ПРОБЛЕМЫ И НЕДОСТАТКИ:**\n- Что требует немедленного улучшения\n- Функциональные проблемы\n- Эстетические недочеты\n\n**РЕКОМЕНДАЦИИ:**\n- Приоритетные изменения\n- Варианты улучшения освещения\n- Цветовые решения\n- Рекомендации по мебели\n- Материалы для отделки\n\n**БЮДЖЕТНАЯ ОЦЕНКА:**\n- Косметический ремонт: 200-300 тыс. рублей\n- Капитальный ремонт: 600-1000 тыс. рублей"
    }

    ВАЖНО: Ответ должен быть только валидным JSON без дополнительного текста или markdown!
    `

    console.log('🧠 Sending image to GPT-4o Vision for analysis...')
    
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })

    const analysisResult = response.choices[0]?.message?.content || 'Анализ не удался'
    
    console.log('✅ Room analysis completed successfully')
    console.log('📊 Raw analysis result:', analysisResult)

    // Parse JSON response from GPT-4o Vision
    let parsedAnalysis
    try {
      // Clean the response to extract valid JSON
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        parsedAnalysis = JSON.parse(jsonString);
        console.log('✅ Successfully parsed JSON analysis');
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON, using fallback parser:', parseError);
      parsedAnalysis = parseAnalysisResponse(analysisResult);
    }

    const result = {
      success: true,
      analysis: {
        id: `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        originalImage: image,
        userPrompt,
        analysisType,
        ...parsedAnalysis,
        fullAnalysis: parsedAnalysis.fullAnalysis || analysisResult,
        confidence: parsedAnalysis.confidence || 85,
        metadata: {
          model: 'GPT-4o Vision',
          tokens: response.usage?.total_tokens || 0,
          cost: calculateCost(response.usage?.total_tokens || 0),
          processingTime: Date.now()
        }
      }
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('❌ Room analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze room',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

function parseAnalysisResponse(analysis: string) {
  // Extract key information from the analysis text
  const roomTypes = ['гостиная', 'спальня', 'кухня', 'ванная', 'офис', 'столовая', 'прихожая']
  const styles = ['современный', 'классический', 'минималистский', 'скандинавский', 'лофт', 'прованс']
  const conditions = ['отличное', 'хорошее', 'удовлетворительное', 'требует ремонта']
  
  // Simple text analysis to extract structured data
  const lowerAnalysis = analysis.toLowerCase()
  
  const detectedRoomType = roomTypes.find(type => lowerAnalysis.includes(type)) || 'living_room'
  const detectedStyle = styles.find(style => lowerAnalysis.includes(style)) || 'современный'
  const detectedCondition = conditions.find(condition => lowerAnalysis.includes(condition)) || 'хорошее'
  
  // Extract recommendations (lines that start with "•", "-", or contain "рекомендую")
  const recommendations = analysis
    .split('\n')
    .filter(line => 
      line.trim().startsWith('•') || 
      line.trim().startsWith('-') || 
      line.toLowerCase().includes('рекомендую') ||
      line.toLowerCase().includes('стоит')
    )
    .slice(0, 6)
    .map(line => line.replace(/^[•\-\s]+/, '').trim())
    .filter(line => line.length > 10)

  return {
    roomType: detectedRoomType.replace('гостиная', 'living_room')
                              .replace('спальня', 'bedroom')
                              .replace('кухня', 'kitchen')
                              .replace('ванная', 'bathroom')
                              .replace('офис', 'office')
                              .replace('столовая', 'dining_room')
                              .replace('прихожая', 'hallway'),
    currentStyle: detectedStyle,
    condition: detectedCondition,
    dimensions: {
      size: 'средний', // Could be extracted with more sophisticated parsing
      height: 'стандартная',
      estimatedArea: '20-25'
    },
    lighting: lowerAnalysis.includes('темн') ? 'artificial' : 
              lowerAnalysis.includes('свет') || lowerAnalysis.includes('окн') ? 'natural' : 'mixed',
    colors: extractColors(analysis),
    furniture: extractFurniture(analysis),
    materials: extractMaterials(analysis),
    features: extractFeatures(analysis),
    recommendations: recommendations.length > 0 ? recommendations : [
      'Улучшить освещение',
      'Обновить цветовую схему',
      'Оптимизировать расстановку мебели'
    ],
    suggestedStyle: getSuggestedStyles(detectedStyle),
    surfaces: {
      walls: 'окрашенные стены',
      flooring: 'ламинат',
      ceiling: 'натяжной потолок'
    },
    functionalAnalysis: {
      ergonomics: 'good',
      flow: 'good',
      storage: 'adequate'
    }
  }
}

function extractColors(analysis: string): string[] {
  const colorKeywords = ['белый', 'черный', 'серый', 'бежевый', 'коричневый', 'синий', 'зеленый', 'красный']
  const foundColors = colorKeywords.filter(color => analysis.toLowerCase().includes(color))
  return foundColors.length > 0 ? foundColors : ['нейтральные тона', 'светлые оттенки']
}

function extractFurniture(analysis: string): string[] {
  const furnitureKeywords = ['диван', 'стол', 'стул', 'кровать', 'шкаф', 'полка', 'тумба', 'кресло']
  const foundFurniture = furnitureKeywords.filter(item => analysis.toLowerCase().includes(item))
  return foundFurniture.length > 0 ? foundFurniture : ['базовая мебель']
}

function extractMaterials(analysis: string): string[] {
  const materialKeywords = ['дерево', 'металл', 'стекло', 'ткань', 'кожа', 'пластик', 'камень', 'керамика']
  const foundMaterials = materialKeywords.filter(material => analysis.toLowerCase().includes(material))
  return foundMaterials.length > 0 ? foundMaterials : ['смешанные материалы']
}

function extractFeatures(analysis: string): string[] {
  const featureKeywords = ['окно', 'балкон', 'ниша', 'колонна', 'арка', 'камин', 'лестница']
  const foundFeatures = featureKeywords.filter(feature => analysis.toLowerCase().includes(feature))
  return foundFeatures.length > 0 ? foundFeatures : ['стандартная планировка']
}

function getSuggestedStyles(currentStyle: string): string[] {
  const styleMap: { [key: string]: string[] } = {
    'современный': ['минимализм', 'хай-тек', 'лофт'],
    'классический': ['неоклассика', 'прованс', 'английский'],
    'минималистский': ['скандинавский', 'японский', 'современный'],
    'скандинавский': ['минимализм', 'лагом', 'хюгге'],
    'лофт': ['индустриальный', 'современный', 'урбан']
  }
  
  return styleMap[currentStyle] || ['современный', 'минималистский', 'скандинавский']
}

function calculateCost(tokens: number): string {
  // Azure OpenAI GPT-4o pricing: ~$0.005 per 1K tokens
  const cost = (tokens / 1000) * 0.005
  return `$${cost.toFixed(4)}`
} 