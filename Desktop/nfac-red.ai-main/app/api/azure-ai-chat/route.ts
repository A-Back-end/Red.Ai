import { NextRequest, NextResponse } from 'next/server'
import { AzureOpenAI } from 'openai'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

// Проверяем наличие переменных окружения
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || 
                   process.env.AZURE_OPENAI_KEY_1 || 
                   "FM1DHQMuPkCX1TKRnIVVprIoQ1RwI6yaPBNEJ0gx3kdRUNMpprAlJQQJ99BGACYeBjFXJ3w3AAABACOGLuJD"
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://neuroflow-hub.openai.azure.com/"
const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-04-01-preview"
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || process.env.DEPLOYMENT_NAME || "gpt-4.1"

// Fallback OpenAI клиент (инициализируется только при наличии ключа)
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder' 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Системные промпты для разных ролей домовенка
const DOMOVENOK_PROMPTS = {
  realtor: `Вы — Домовёнок 🏠, опытный риелтор и эксперт по недвижимости на платформе RED.AI.

Ваша роль:
- Помогаете в покупке, продаже и оценке недвижимости
- Анализируете рынок и районы
- Даете советы по выбору квартир и домов
- Объясняете юридические аспекты сделок

Стиль общения: дружелюбный, экспертный, с практическими советами`,

  interior_designer: `Вы — Домовёнок 🎨, профессиональный дизайнер интерьеров на платформе RED.AI.

Ваша роль:
- Создаете уютные и стильные интерьеры
- Подбираете цвета, мебель и декор
- Планируете зонирование пространства
- Следите за современными трендами

Стиль общения: креативный, вдохновляющий, с конкретными рекомендациями`,

  renovation_expert: `Вы — Домовёнок 🔨, эксперт по ремонту и строительству на платформе RED.AI.

Ваша роль:
- Планируете этапы ремонта
- Рассчитываете бюджеты и сроки
- Рекомендуете материалы и инструменты
- Решаете технические вопросы

Стиль общения: профессиональный, детальный, с пошаговыми инструкциями`,

  investment_advisor: `Вы — Домовёнок 💰, инвестиционный консультант по недвижимости на платформе RED.AI.

Ваша роль:
- Анализируете инвестиционную привлекательность
- Рассчитываете доходность и риски
- Советуете стратегии инвестирования
- Прогнозируете рынок недвижимости

Стиль общения: аналитический, обоснованный, с цифрами и фактами`,

  universal: `Вы — Домовёнок 🏆, универсальный AI-консультант по недвижимости и дизайну на платформе RED.AI.

Ваши возможности:
🏠 Риелтор — помощь в покупке/продаже недвижимости
🎨 Дизайнер — создание интерьеров и планировка
🔨 Эксперт по ремонту — планирование и бюджетирование
💰 Инвестиционный советник — анализ доходности

Стиль общения: дружелюбный, компетентный, адаптируется под запрос пользователя`
}

export async function POST(request: NextRequest) {
  console.log('🏠 Domovenok API called')
  console.log('OpenAI client initialized:', !!openai)
  
  try {
    const { 
      message, 
      personality = 'friendly',
      specialization = 'universal',
      conversationHistory = [],
      assistantName = 'Домовёнок',
      context = 'real_estate_design_assistant'
    } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Поле message обязательно' }, { status: 400 })
    }

    // Выбираем системный промпт по специализации
    const systemPrompt = DOMOVENOK_PROMPTS[specialization as keyof typeof DOMOVENOK_PROMPTS] || DOMOVENOK_PROMPTS.universal

    // Добавляем персонализацию по стилю общения
    let personalityAddition = ''
    switch (personality) {
      case 'friendly':
        personalityAddition = '\n\nОтвечайте тепло и дружелюбно, используйте эмодзи и простые объяснения.'
        break
      case 'professional':
        personalityAddition = '\n\nОтвечайте профессионально и деловито, четко структурируйте информацию.'
        break
      case 'expert':
        personalityAddition = '\n\nДавайте глубокие экспертные знания с техническими деталями и примерами.'
        break
      case 'casual':
        personalityAddition = '\n\nИспользуйте простой язык, избегайте сложных терминов, будьте понятными.'
        break
    }

    // Проверяем доступность OpenAI API key
    console.log('Checking OpenAI availability:', !openai)
    if (!openai) {
      console.log('Returning demo response')
      // Возвращаем mock ответ для демонстрации
      const mockResponse = `Привет! Меня зовут ${assistantName} 🏠

К сожалению, сейчас AI модели недоступны, но я могу показать как буду работать!

**${specialization === 'realtor' ? 'Как риелтор' : 
   specialization === 'interior_designer' ? 'Как дизайнер интерьера' :
   specialization === 'renovation_expert' ? 'Как эксперт по ремонту' :
   specialization === 'investment_advisor' ? 'Как инвестиционный консультант' :
   'Как универсальный консультант'}** я могу помочь вам с:

${specialization === 'realtor' ? '🏠 Выбором квартиры\n🏠 Оценкой недвижимости\n🏠 Юридическими вопросами\n🏠 Анализом районов' :
  specialization === 'interior_designer' ? '🎨 Планировкой интерьера\n🎨 Подбором цветов\n🎨 Выбором мебели\n🎨 Зонированием пространства' :
  specialization === 'renovation_expert' ? '🔨 Планированием ремонта\n🔨 Расчетом бюджета\n🔨 Выбором материалов\n🔨 Технические советы' :
  specialization === 'investment_advisor' ? '💰 Анализом доходности\n💰 Оценкой рисков\n💰 Инвестиционными стратегиями\n💰 Прогнозами рынка' :
  '🏠 Покупкой недвижимости\n🎨 Дизайном интерьера\n🔨 Планированием ремонта\n💰 Инвестициями в недвижимость'}

Для полной функциональности требуется настройка API ключей.

Ваш вопрос: "${message}"

*Это демо-ответ. Для настройки добавьте OPENAI_API_KEY в переменные окружения.*`

      return NextResponse.json({
        message: mockResponse,
        provider: 'Demo Mode',
        specialization,
        personality,
        assistantName,
        status: 'api_not_configured'
      })
    }

    // Формируем сообщения для API
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt + personalityAddition },
      ...conversationHistory.slice(-10), // Берем последние 10 сообщений
      { role: 'user', content: String(message) }
    ]

    // Используем OpenAI
    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1200,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json({ error: 'Не удалось получить ответ от AI' }, { status: 500 })
    }

    return NextResponse.json({
      message: response,
      provider: `OpenAI ${completion.model}`,
      specialization,
      personality,
      assistantName
    })

  } catch (error: any) {
    console.error('Domovenok AI Chat Error:', error)
    
    // Детальная обработка ошибок
    if (error?.status === 401) {
      return NextResponse.json({ 
        error: 'Неверный API ключ',
        suggestion: 'Проверьте OPENAI_API_KEY в переменных окружения'
      }, { status: 401 })
    } else if (error?.status === 429) {
      return NextResponse.json({ 
        error: 'Превышен лимит запросов',
        suggestion: 'Попробуйте позже'
      }, { status: 429 })
    }
    
    return NextResponse.json({ 
      error: error?.message || 'Ошибка AI сервиса',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
} 