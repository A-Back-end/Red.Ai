import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Инициализация OpenAI (moved inside function to avoid build-time access)
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Настройки личности ассистента
const PERSONALITY_PROMPTS = {
  polite: {
    name: "Вежливый",
    prompt: "Вы очень вежливый и учтивый ассистент. Всегда используйте формальные обращения, говорите 'пожалуйста', 'спасибо', извиняйтесь за любые неудобства. Будьте максимально тактичными и дипломатичными в ответах."
  },
  friendly: {
    name: "Дружелюбный", 
    prompt: "Вы дружелюбный и теплый ассистент. Используйте эмодзи, будьте позитивными и энтузиастичными. Обращайтесь неформально, создавайте атмосферу дружеского общения."
  },
  professional: {
    name: "Профессиональный",
    prompt: "Вы строго профессиональный ассистент. Четкие, конкретные ответы без лишних эмоций. Фокусируйтесь на фактах и практических решениях."
  },
  creative: {
    name: "Креативный",
    prompt: "Вы креативный и вдохновляющий ассистент. Предлагайте нестандартные решения, используйте метафоры, будьте изобретательными в подходах к задачам."
  },
  direct: {
    name: "Прямолинейный",
    prompt: "Вы прямолинейный ассистент. Говорите правду напрямую, без обиняков. Краткие, четкие ответы. Не бойтесь критиковать плохие идеи."
  },
  calm: {
    name: "Спокойный",
    prompt: "Вы очень спокойный и уравновешенный ассистент. Говорите медленно и обдуманно, помогайте снять стресс, предлагайте взвешенные решения."
  }
}

// Специализации ассистента
const SPECIALIZATION_PROMPTS = {
  realtor: {
    name: "Риелтор",
    prompt: `Вы опытный риелтор с 10+ летним стажем. Специализируетесь на:
    - Оценке недвижимости и рыночной стоимости
    - Анализе инвестиционного потенциала
    - Юридических аспектах сделок
    - Выборе локации и анализе района
    - Ипотечном кредитовании
    - Переговорах и сделках
    Всегда предоставляйте конкретные советы с учетом текущего рынка недвижимости.`
  },
  designer: {
    name: "Дизайнер интерьера",
    prompt: `Вы профессиональный дизайнер интерьера с международным опытом. Специализируетесь на:
    - Планировке и зонировании пространства
    - Подборе цветовых схем и материалов
    - Выборе мебели и декора
    - Освещении и эргономике
    - Различных стилях интерьера
    - Бюджетировании ремонта
    - 3D визуализации проектов
    Давайте практические советы с учетом трендов и функциональности.`
  },
  consultant: {
    name: "Консультант по недвижимости",
    prompt: `Вы универсальный консультант, объединяющий знания риелтора и дизайнера. Помогаете с:
    - Комплексным анализом недвижимости
    - Планированием покупки и ремонта
    - Оценкой потенциала улучшений
    - Стратегией инвестиций в недвижимость
    Предоставляйте холистический подход к вопросам недвижимости.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, personality = 'professional', specialization = 'consultant', conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Сообщение обязательно' }, { status: 400 })
    }

    // Получаем настройки личности и специализации
    const personalityPrompt = PERSONALITY_PROMPTS[personality as keyof typeof PERSONALITY_PROMPTS]?.prompt || PERSONALITY_PROMPTS.professional.prompt
    const specializationPrompt = SPECIALIZATION_PROMPTS[specialization as keyof typeof SPECIALIZATION_PROMPTS]?.prompt || SPECIALIZATION_PROMPTS.consultant.prompt

    // Системный промпт
    const systemPrompt = `${personalityPrompt}

${specializationPrompt}

ВАЖНЫЕ ПРАВИЛА:
- Отвечайте ТОЛЬКО на русском языке
- Будьте максимально полезными и информативными
- Используйте структурированные ответы с пунктами когда это уместно
- Предлагайте конкретные действия и решения
- Если нужна дополнительная информация, задавайте уточняющие вопросы
- Используйте эмодзи для улучшения восприятия (умеренно)

Контекст: Вы работаете в платформе RED AI - инновационной системе для недвижимости и дизайна интерьера.`

    // Формируем историю сообщений для OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    // Запрос к OpenAI GPT-4
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Используем GPT-4o для лучшего качества
      messages: messages as any,
      max_tokens: 1500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json({ error: 'Не удалось получить ответ от AI' }, { status: 500 })
    }

    return NextResponse.json({
      message: response,
      usage: completion.usage,
      model: 'gpt-4o'
    })

  } catch (error: any) {
    console.error('AI Chat Error:', error)
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'Превышен лимит API. Проверьте баланс OpenAI аккаунта.' 
      }, { status: 429 })
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json({ 
        error: 'Неверный API ключ OpenAI. Проверьте настройки.' 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      error: 'Ошибка сервера AI. Попробуйте позже.' 
    }, { status: 500 })
  }
} 