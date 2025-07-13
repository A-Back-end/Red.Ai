'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, Send, User, Settings, Home, 
  Palette, TrendingUp, Loader2, Copy, ThumbsUp, ThumbsDown, X, Maximize2,
  Building, PaintBucket, Star, ChevronUp, ChevronDown, HelpCircle
} from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DomovenokAIAssistantProps {
  userId: string
  onClose?: () => void
}

// Роли ассистента
const ROLES = {
  realtor: { name: 'Риелтор', emoji: '🏠', icon: Building, color: 'bg-blue-500' },
  interior_designer: { name: 'Дизайнер интерьера', emoji: '🎨', icon: Palette, color: 'bg-purple-500' },
  renovation_expert: { name: 'Эксперт по ремонту', emoji: '🔨', icon: PaintBucket, color: 'bg-orange-500' },
  investment_advisor: { name: 'Инвестиционный консультант', emoji: '💰', icon: TrendingUp, color: 'bg-green-500' },
  universal: { name: 'Универсальный консультант', emoji: '🏆', icon: Star, color: 'bg-gradient-to-r from-purple-500 to-blue-500' }
}

// Стили общения
const STYLES = {
  friendly: { name: 'Дружелюбный', emoji: '😊' },
  professional: { name: 'Профессиональный', emoji: '💼' },
  expert: { name: 'Экспертный', emoji: '🎓' },
  casual: { name: 'Простой', emoji: '👋' }
}

// Быстрые вопросы
const QUICK_QUESTIONS = [
  {
    category: 'Покупка квартиры',
    icon: Home,
    questions: [
      'Как выбрать квартиру для покупки?',
      'На что обратить внимание при просмотре квартиры?',
      'Как оценить справедливую стоимость квартиры?',
      'Какие документы нужны для покупки?'
    ]
  },
  {
    category: 'Дизайн интерьера',
    icon: Palette,
    questions: [
      'Как создать уютный интерьер в маленькой квартире?',
      'Какие цвета выбрать для спальни?',
      'Как правильно зонировать студию?',
      'Современные тренды в дизайне интерьера'
    ]
  },
  {
    category: 'Ремонт и планирование',
    icon: PaintBucket,
    questions: [
      'Как составить бюджет на ремонт?',
      'С чего начать ремонт квартиры?',
      'Какие материалы лучше выбрать?',
      'Как планировать этапы ремонта?'
    ]
  },
  {
    category: 'Инвестиции',
    icon: TrendingUp,
    questions: [
      'Стоит ли покупать квартиру для сдачи в аренду?',
      'Как выбрать районы для инвестиций?',
      'Какая доходность от аренды квартир?',
      'Риски инвестиций в недвижимость'
    ]
  }
]

export default function DomovenokAIAssistant({ userId, onClose }: DomovenokAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showQuickQuestions, setShowQuickQuestions] = useState(false)
  const [selectedRole, setSelectedRole] = useState('universal')
  const [communicationStyle, setCommunicationStyle] = useState('friendly')
  const [isMaximized, setIsMaximized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Приветственное сообщение
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Привет! Меня зовут **Домовёнок** 🏠✨ 

Я ваш персональный AI-помощник по недвижимости и дизайну интерьера! 

**Как я могу помочь:**
🏠 **Консультации по недвижимости** - покупка, продажа, оценка
🎨 **Дизайн интерьера** - планировка, стили, цвета, мебель  
🔨 **Планирование ремонта** - бюджет, этапы, материалы
💰 **Инвестиционные советы** - анализ рынка, доходность

Выберите тему ниже или просто задайте свой вопрос! 👇`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [])

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputMessage
    if (!messageToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Prepare messages for the API in the correct format
      const conversationMessages = [
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: messageToSend
        }
      ]

      const response = await fetch('/api/azure-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationMessages,
          useAzure: true,
          data: {
            maxTokens: 1800,
            temperature: 0.7
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сервера')
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error('Ошибка чата:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Произошла ошибка**: ${error.message}

Попробуйте ещё раз или обратитесь к администратору.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Чат очищен! Готов помочь вам снова 🏠✨

Задайте любой вопрос по недвижимости или дизайну интерьера!`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }, 100)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const currentRole = ROLES[selectedRole as keyof typeof ROLES]
  const currentStyle = STYLES[communicationStyle as keyof typeof STYLES]

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Домовёнок</span>
                <span className="text-2xl">🏠</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentRole.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={`${currentRole.color} text-white border-0`}>
              <span className="mr-1">{currentRole.emoji}</span>
              {currentRole.name}
            </Badge>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsMaximized(!isMaximized)}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Роль ассистента
              </label>
              <div className="space-y-2">
                {Object.entries(ROLES).map(([key, role]) => {
                  const Icon = role.icon
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedRole(key)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        selectedRole === key
                          ? 'bg-slate-100 dark:bg-slate-800 border-2 border-purple-500/50'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {role.emoji} {role.name}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Стиль общения
              </label>
              <div className="space-y-2">
                {Object.entries(STYLES).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => setCommunicationStyle(key)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      communicationStyle === key
                        ? 'bg-slate-100 dark:bg-slate-800 border-2 border-purple-500/50'
                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl">{style.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {style.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div className={`flex-1 ${
              message.role === 'user' ? 'order-first' : ''
            }`}>
              <div className={`rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              }`}>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-1">
                    <Button
                      onClick={() => copyMessage(message.content)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-green-500"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Домовёнок думает...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Panel */}
      {showQuickQuestions && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                <HelpCircle className="h-4 w-4" />
                <span>Популярные вопросы</span>
              </h3>
              <Button
                onClick={() => setShowQuickQuestions(false)}
                variant="ghost"
                size="sm"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUICK_QUESTIONS.map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {category.category}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {category.questions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            sendMessage(question)
                            setShowQuickQuestions(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Спросите Домовёнка о недвижимости, дизайне или ремонте..."
              className="min-h-[44px] max-h-32 resize-none bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500/50 focus:ring-purple-500/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 pr-12"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-3 text-xs text-slate-400">
              Enter
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowQuickQuestions(!showQuickQuestions)}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-purple-500"
              disabled={isLoading}
              title="Показать быстрые вопросы"
            >
              {showQuickQuestions ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={clearChat}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-red-500"
              disabled={isLoading}
              title="Очистить чат"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white disabled:opacity-50"
              title="Отправить сообщение"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 