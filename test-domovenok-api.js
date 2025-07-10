#!/usr/bin/env node

// Тест API домовенка
const API_URL = 'http://localhost:3000/api/azure-ai-chat'

const testRequests = [
  {
    name: 'Универсальный консультант',
    payload: {
      message: 'Привет! Расскажи о своих возможностях',
      specialization: 'universal',
      personality: 'friendly',
      assistantName: 'Домовёнок'
    }
  },
  {
    name: 'Риелтор',
    payload: {
      message: 'Как выбрать квартиру для покупки?',
      specialization: 'realtor',
      personality: 'professional',
      assistantName: 'Домовёнок'
    }
  },
  {
    name: 'Дизайнер интерьера',
    payload: {
      message: 'Как создать уютный интерьер в маленькой квартире?',
      specialization: 'interior_designer',
      personality: 'friendly',
      assistantName: 'Домовёнок'
    }
  }
]

async function testDomovenokAPI() {
  console.log('🏠 Тестирование API Домовёнка...\n')

  for (const test of testRequests) {
    console.log(`📋 Тест: ${test.name}`)
    console.log(`❓ Вопрос: ${test.payload.message}`)
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      })

      const data = await response.json()

      if (response.ok) {
        console.log(`✅ Статус: ${response.status}`)
        console.log(`🤖 Провайдер: ${data.provider || 'Unknown'}`)
        console.log(`💬 Ответ: ${data.message?.substring(0, 200)}${data.message?.length > 200 ? '...' : ''}`)
        
        if (data.status === 'api_not_configured') {
          console.log(`⚠️  Режим: Демо (API ключи не настроены)`)
        }
      } else {
        console.log(`❌ Ошибка: ${response.status}`)
        console.log(`📝 Детали: ${data.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.log(`💥 Ошибка сети: ${error.message}`)
    }
    
    console.log('─'.repeat(80))
    console.log('')
  }
}

// Запуск тестов
testDomovenokAPI().catch(console.error) 