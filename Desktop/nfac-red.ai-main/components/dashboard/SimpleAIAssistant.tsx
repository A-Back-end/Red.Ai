'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Sparkles, Image, MessageCircle, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'error' | 'success'
  content: string
  timestamp: Date
}

export default function SimpleAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Привет! Я AI Assistant от RED.AI. Пока Azure Chat модели недоступны, но я могу помочь с генерацией изображений через DALL-E 3. Опишите дизайн интерьера, который хотите создать!',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = (type: Message['type'], content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const generateWithDALLE = async (prompt: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dalle-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Interior design: ${prompt}. Modern, stylish, photorealistic`,
          size: '1024x1024',
          quality: 'standard'
        })
      })

      const data = await response.json()

      if (response.ok && data.image_url) {
        addMessage('assistant', `✅ Дизайн готов! Вот ваш интерьер: 

![Дизайн интерьера](${data.image_url})

**Описание:** ${prompt}
**Модель:** Azure DALL-E 3
**Качество:** Стандартное`)
        addMessage('success', '🎨 Изображение успешно создано!')
      } else {
        addMessage('error', `❌ Ошибка генерации: ${data.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      addMessage('error', `❌ Ошибка подключения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
    setIsLoading(false)
  }

  const testAzureChat = async (message: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/azure-ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      const data = await response.json()

      if (data.suggestions) {
        addMessage('assistant', `ℹ️ ${data.message}

**Альтернативы:**
🎨 DALL-E генерация: Доступна
🤖 OpenAI Fallback: Требует настройки
⚙️ Azure Setup: ${data.suggestions.azure_setup}`)
      } else {
        addMessage('error', `❌ Azure Chat: ${data.error}`)
      }
    } catch (error) {
      addMessage('error', `❌ Ошибка тестирования: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
    setIsLoading(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addMessage('user', userMessage)

    // Проверяем тип запроса
    if (userMessage.toLowerCase().includes('генер') || 
        userMessage.toLowerCase().includes('создай') || 
        userMessage.toLowerCase().includes('дизайн') ||
        userMessage.toLowerCase().includes('комнат') ||
        userMessage.toLowerCase().includes('интерьер')) {
      // Запрос на генерацию изображения
      await generateWithDALLE(userMessage)
    } else if (userMessage.toLowerCase().includes('тест') || 
               userMessage.toLowerCase().includes('проверь')) {
      // Тест Azure Chat
      await testAzureChat(userMessage)
    } else {
      // Обычное сообщение - показываем статус
      addMessage('assistant', `📝 Сообщение получено: "${userMessage}"

**Доступные команды:**
• Попросите создать дизайн → DALL-E генерация
• Напишите "тест" → Проверка Azure Chat
• Опишите интерьер → Автоматическая генерация

**Статус сервисов:**
🎨 DALL-E 3: ✅ Работает
💬 Azure Chat: ❌ Недоступен
🔧 Настройка: В процессе`)
    }
  }

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'user': return <MessageCircle className="h-4 w-4" />
      case 'assistant': return <Sparkles className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'success': return <CheckCircle className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getMessageColors = (type: Message['type']) => {
    switch (type) {
      case 'user': return 'bg-blue-500 text-white'
      case 'assistant': return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
      case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'success': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          RED.AI Assistant
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
            DALL-E Ready
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${getMessageColors(message.type)}`}>
                <div className="flex items-start gap-2">
                  {getMessageIcon(message.type)}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInputValue('Создай современный дизайн гостиной')
              handleSendMessage()
            }}
            disabled={isLoading}
            className="text-xs"
          >
            <Image className="h-3 w-3 mr-1" />
            Дизайн гостиной
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInputValue('Тест Azure Chat')
              handleSendMessage()
            }}
            disabled={isLoading}
            className="text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Тест чата
          </Button>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Опишите дизайн интерьера или задайте вопрос..."
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Status */}
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          🎨 DALL-E 3 доступен • 💬 Azure Chat в разработке • 🔧 OpenAI Fallback настраивается
        </div>
      </CardContent>
    </div>
  )
} 