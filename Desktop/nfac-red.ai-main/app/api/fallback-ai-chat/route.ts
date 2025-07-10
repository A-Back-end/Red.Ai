import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Создаем OpenAI клиент (fallback для Azure)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-placeholder-key-here-get-from-openai-platform'
})

const systemPrompt = `Вы — AI помощник платформы RED.AI для дизайна интерьеров и недвижимости. 

Ваши возможности:
- Анализ планировок квартир и домов
- Советы по дизайну интерьера
- Подбор мебели и декора
- Оценка ремонта и перепланировки
- Помощь в выборе недвижимости

Отвечайте на русском языке, структурированно и дружелюбно. Давайте практические советы с конкретными рекомендациями.`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Поле message обязательно' }, { status: 400 })
    }

    // Проверяем OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-proj-placeholder-key-here-get-from-openai-platform') {
      return NextResponse.json({ 
        error: 'OpenAI API key не настроен. Используйте Azure AI Chat вместо этого.',
        suggestion: 'Получите ключ на https://platform.openai.com/api-keys'
      }, { status: 500 })
    }

    // Запрос к OpenAI GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: String(message) }
      ],
      max_tokens: 1200,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json({ error: 'Не удалось получить ответ от OpenAI' }, { status: 500 })
    }

    return NextResponse.json({
      message: response,
      usage: completion.usage,
      model: `OpenAI ${completion.model}`,
      provider: 'OpenAI'
    })

  } catch (error: any) {
    console.error('OpenAI Chat Error:', error)
    
    // Обработка разных типов ошибок
    if (error?.status === 401) {
      return NextResponse.json({ 
        error: 'Неверный OpenAI API ключ',
        suggestion: 'Проверьте OPENAI_API_KEY в .env.local'
      }, { status: 401 })
    } else if (error?.status === 429) {
      return NextResponse.json({ 
        error: 'Превышен лимит запросов OpenAI',
        suggestion: 'Попробуйте позже или обновите план'
      }, { status: 429 })
    }
    
    return NextResponse.json({ 
      error: error?.message || 'Ошибка OpenAI API',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
} 