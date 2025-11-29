'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Bot, 
  User, 
  Palette, 
  Camera, 
  Lightbulb, 
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
  suggestions?: string[]
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Привет! Я AI-помощник по дизайну интерьеров. Расскажите мне о своих идеях, и я помогу их воплотить. Какое помещение вы хотите обновить?',
      timestamp: new Date(),
      suggestions: [
        'Хочу обновить гостиную',
        'Нужен дизайн спальни',
        'Планирую ремонт кухни',
        'Дизайн детской комнаты'
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Имитация API запроса
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages
        })
      })

      // Имитация ответа
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: generateResponse(input),
          timestamp: new Date(),
          suggestions: generateSuggestions(input)
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
      }, 1500)

    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      setIsTyping(false)
    }
  }

  const generateResponse = (userInput: string): string => {
    const responses = [
      'Отличная идея! Для современного дизайна я рекомендую использовать нейтральные цвета с яркими акцентами. Какой стиль вам ближе - минимализм, скандинавский или современный?',
      'Интересно! Расскажите больше о размерах помещения и ваших предпочтениях по цветам. Это поможет мне создать более точные рекомендации.',
      'Замечательно! Я вижу много возможностей для этого проекта. Можете загрузить фото текущего состояния комнаты, чтобы я мог дать более персонализированные советы?',
      'Прекрасно! Давайте начнем с планировки. Какие функциональные зоны вы хотели бы выделить в этом помещении?'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const generateSuggestions = (userInput: string): string[] => {
    const suggestions = [
      ['Показать примеры в этом стиле', 'Подобрать цветовую палитру', 'Рассчитать бюджет'],
      ['Загрузить фото комнаты', 'Выбрать мебель', 'Создать 3D визуализацию'],
      ['Найти похожие проекты', 'Получить список покупок', 'Сохранить в проект'],
      ['Изменить планировку', 'Добавить освещение', 'Выбрать материалы']
    ]
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Консультант по дизайну
        </CardTitle>
        <CardDescription>
          Получите персональные рекомендации по дизайну интерьера
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'assistant' && (
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyMessage(message.content)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {/* Предложения */}
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestion(suggestion)}
                        className="w-full text-left justify-start text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Индикатор набора текста */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Быстрые действия */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Camera className="h-3 w-3" />
              Анализ фото
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Palette className="h-3 w-3" />
              Подбор цветов
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Lightbulb className="h-3 w-3" />
              Идеи
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RotateCcw className="h-3 w-3" />
              Очистить
            </Button>
          </div>
        </div>

        {/* Поле ввода */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Опишите свои идеи для дизайна..."
            className="flex-1 min-h-0 resize-none"
            rows={2}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 