import { NextRequest, NextResponse } from 'next/server'

// Mock Pinterest API (в продакшене это была бы настоящая интеграция)
const PINTEREST_MOCK_DATA = {
  living_room: [
    {
      id: 'pin_1',
      title: 'Современная гостиная с камином',
      description: 'Стильное решение для уютного вечера',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600',
      sourceUrl: 'https://pinterest.com/pin/12345',
      tags: ['modern', 'fireplace', 'cozy', 'neutral'],
      price: null
    },
    {
      id: 'pin_2', 
      title: 'Минималистичная мебель',
      description: 'Чистые линии и функциональность',
      imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=600',
      sourceUrl: 'https://pinterest.com/pin/67890',
      tags: ['minimalist', 'furniture', 'clean'],
      price: null
    },
    {
      id: 'pin_3',
      title: 'Растения в интерьере',
      description: 'Живые акценты для дома',
      imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?w=400&h=600',
      sourceUrl: 'https://pinterest.com/pin/11111',
      tags: ['plants', 'green', 'natural', 'decor'],
      price: null
    }
  ],
  bedroom: [
    {
      id: 'pin_4',
      title: 'Уютная спальня в скандинавском стиле',
      description: 'Теплые тона и натуральные материалы',
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=600',
      sourceUrl: 'https://pinterest.com/pin/22222',
      tags: ['scandinavian', 'bedroom', 'cozy', 'wood'],
      price: null
    }
  ],
  kitchen: [
    {
      id: 'pin_5',
      title: 'Современная кухня с островом',
      description: 'Функциональное и красивое решение',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600',
      sourceUrl: 'https://pinterest.com/pin/33333',
      tags: ['modern', 'kitchen', 'island', 'functional'],
      price: null
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomType = searchParams.get('roomType') || 'living_room'
    const style = searchParams.get('style') || 'modern'
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('Fetching Pinterest ideas for:', { roomType, style, limit })

    // В продакшене здесь был бы запрос к Pinterest API
    const roomIdeas = PINTEREST_MOCK_DATA[roomType as keyof typeof PINTEREST_MOCK_DATA] || PINTEREST_MOCK_DATA.living_room
    
    // Фильтруем по стилю
    const filteredIdeas = roomIdeas.filter(idea => 
      idea.tags.some(tag => tag.toLowerCase().includes(style.toLowerCase()))
    )

    // Если нет идей по стилю, возвращаем все для комнаты
    const finalIdeas = filteredIdeas.length > 0 ? filteredIdeas : roomIdeas

    // Ограничиваем количество
    const limitedIdeas = finalIdeas.slice(0, limit)

    // Добавляем дополнительные метаданные
    const enrichedIdeas = limitedIdeas.map(idea => ({
      ...idea,
      relevanceScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
      category: getCategoryFromTags(idea.tags),
      estimatedPrice: getEstimatedPrice(idea.tags)
    }))

    return NextResponse.json({
      success: true,
      ideas: enrichedIdeas,
      metadata: {
        roomType,
        style,
        totalFound: enrichedIdeas.length,
        searchTimestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Pinterest ideas error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch Pinterest ideas', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, roomType, budget, style } = await request.json()
    
    console.log('Custom Pinterest search:', { query, roomType, budget, style })

    // Генерируем кастомные результаты на основе поискового запроса
    const customIdeas = generateCustomIdeas(query, roomType, style, budget)

    return NextResponse.json({
      success: true,
      ideas: customIdeas,
      searchQuery: query,
      metadata: {
        roomType,
        style,
        budget,
        searchTimestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Custom Pinterest search error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform custom search', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

function getCategoryFromTags(tags: string[]): string {
  if (tags.includes('furniture')) return 'Мебель'
  if (tags.includes('decor')) return 'Декор'
  if (tags.includes('plants')) return 'Растения'
  if (tags.includes('lighting')) return 'Освещение'
  return 'Общее'
}

function getEstimatedPrice(tags: string[]): { min: number, max: number } | null {
  if (tags.includes('furniture')) return { min: 10000, max: 80000 }
  if (tags.includes('decor')) return { min: 1000, max: 15000 }
  if (tags.includes('plants')) return { min: 500, max: 5000 }
  if (tags.includes('lighting')) return { min: 3000, max: 25000 }
  return null
}

function generateCustomIdeas(query: string, roomType: string, style: string, budget?: { min: number, max: number }) {
  const baseIdeas = [
    {
      id: `custom_${Date.now()}_1`,
      title: `${query} в стиле ${style}`,
      description: `Индивидуальное решение для ${roomType}`,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600',
      sourceUrl: 'https://pinterest.com/search',
      tags: [style, roomType, query.toLowerCase()],
      relevanceScore: 0.95,
      category: 'Кастомное решение',
      estimatedPrice: budget || { min: 15000, max: 50000 }
    },
    {
      id: `custom_${Date.now()}_2`,
      title: `Альтернативное решение: ${query}`,
      description: `Креативный подход к ${query.toLowerCase()}`,
      imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=600',
      sourceUrl: 'https://pinterest.com/search',
      tags: [style, roomType, 'alternative'],
      relevanceScore: 0.88,
      category: 'Альтернатива',
      estimatedPrice: budget || { min: 8000, max: 30000 }
    }
  ]

  return baseIdeas
} 