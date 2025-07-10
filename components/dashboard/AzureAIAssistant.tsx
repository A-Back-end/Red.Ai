'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { 
  MessageCircle, Send, Bot, User, Maximize2, Minimize2, 
  Settings, Sparkles, Zap, Heart, Brain, Eye, Shield,
  Home, Palette, TrendingUp, Loader2, Cloud
} from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { useTranslations } from '../../lib/translations'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AzureAIAssistantProps {
  userId: string
  onClose?: () => void
}

const PERSONALITIES = {
  polite: { name: 'polite', icon: '🎩', color: 'bg-blue-500' },
  friendly: { name: 'friendly', icon: '😊', color: 'bg-green-500' },
  professional: { name: 'professional', icon: '💼', color: 'bg-gray-500' },
  creative: { name: 'creative', icon: '🎨', color: 'bg-purple-500' },
  direct: { name: 'direct', icon: '⚡', color: 'bg-red-500' },
  calm: { name: 'calm', icon: '🧘', color: 'bg-indigo-500' }
}

const SPECIALIZATIONS = {
  realtor: { name: 'realtor', icon: Home, color: 'bg-orange-500' },
  designer: { name: 'designer', icon: Palette, color: 'bg-pink-500' },
  consultant: { name: 'consultant', icon: TrendingUp, color: 'bg-cyan-500' }
}

export default function AzureAIAssistant({ userId, onClose }: AzureAIAssistantProps) {
  const { t } = useTranslations()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [personality, setPersonality] = useState('professional')
  const [specialization, setSpecialization] = useState('consultant')
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
        content: `Привет! 👋 Я ваш персональный AI ассистент от RED AI на базе **Azure OpenAI GPT-4.1**. 

🏠 **Как я могу помочь:**
• **Недвижимость** - оценка, покупка, инвестиции в России
• **Дизайн интерьера** - планировка, стили, материалы  
• **Ремонт** - планирование, бюджетирование, российский рынок
• **Экспертные консультации** - комплексный подход к вашим задачам

Я использую самые современные возможности Azure OpenAI для максимально точных и полезных ответов! 🚀

Расскажите о вашем проекте или задайте любой вопрос! 💬`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/azure-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          personality,
          specialization,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
      console.error('Azure Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Извините, произошла ошибка: ${error.message}\n\n🔧 Возможные причины:\n• Проблемы с Azure OpenAI API\n• Неверные настройки ключей\n• Превышен лимит запросов\n\nПроверьте настройки в разделе Settings или попробуйте позже.`,
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
    // Добавляем приветственное сообщение обратно
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Чат очищен! 🧹✨\n\nЯ готов помочь вам с новыми вопросами по недвижимости и дизайну используя Azure OpenAI GPT-4.1. \n\n🏠 Что вас интересует?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  const currentPersonality = PERSONALITIES[personality as keyof typeof PERSONALITIES]
  const currentSpecialization = SPECIALIZATIONS[specialization as keyof typeof SPECIALIZATIONS]
  const SpecializationIcon = currentSpecialization.icon

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'max-w-6xl mx-auto'} ${isFullscreen ? 'bg-slate-900' : ''}`}>
      <div className={`${isFullscreen ? 'h-screen' : 'h-[600px]'} flex flex-col`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-blue-700/50 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Azure {t('ai_assistant')}</span>
                <span className="text-xs bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-normal">
                  GPT-4.1
                </span>
              </h1>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${currentPersonality.color} text-white`}>
                  {currentPersonality.icon} {t(currentPersonality.name)}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${currentSpecialization.color} text-white`}>
                  <SpecializationIcon className="h-3 w-3 mr-1" />
                  {t(currentSpecialization.name)}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white">
                  <Cloud className="h-3 w-3 mr-1" />
                  Azure
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="text-slate-400 hover:text-white border-blue-600/50 hover:border-blue-500"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={clearChat}
              variant="outline"
              size="sm"
              className="text-slate-400 hover:text-white border-blue-600/50 hover:border-blue-500"
            >
              🧹 {t('clear_chat')}
            </Button>
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              size="sm"
              className="text-slate-400 hover:text-white border-blue-600/50 hover:border-blue-500"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="text-slate-400 hover:text-white border-blue-600/50 hover:border-blue-500"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-blue-900/80 border-b border-blue-700/50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  🎭 {t('personality')} ассистента
                </label>
                <select
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="w-full bg-blue-800 border border-blue-600 rounded-lg px-3 py-2 text-white"
                >
                  {Object.entries(PERSONALITIES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.icon} {t(value.name)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  🎯 {t('specialization')}
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-blue-800 border border-blue-600 rounded-lg px-3 py-2 text-white"
                >
                  {Object.entries(SPECIALIZATIONS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {t(value.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-800/50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-200">
                <Cloud className="h-4 w-4" />
                <span className="text-sm font-medium">Azure OpenAI Status:</span>
                <span className="text-green-400 text-sm">✅ Connected</span>
              </div>
              <p className="text-xs text-blue-300 mt-1">
                Используется Azure OpenAI GPT-4.1 для максимально точных ответов
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Cloud className="h-4 w-4 text-white" />
                )}
              </div>
              
              <div className={`flex-1 max-w-4xl ${
                message.role === 'user' ? 'text-right' : ''
              }`}>
                <div className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/70 text-white border border-blue-600/50'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Cloud className="h-4 w-4 text-white" />
              </div>
              <div className="bg-slate-700/70 text-white border border-blue-600/50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm">{t('thinking')}</span>
                  <span className="text-xs text-blue-400">Azure GPT-4.1</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-blue-700/50 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('ask_question')}
                className="resize-none bg-blue-800/50 border-blue-600/50 text-white placeholder-blue-300 min-h-[60px] max-h-[120px]"
                disabled={isLoading}
              />
              <div className="text-xs text-blue-300 mt-1 flex items-center justify-between">
                <span>💡 {t('shift_enter')}</span>
                <span className="flex items-center space-x-2">
                  <span>{inputMessage.length}/2000</span>
                  <Cloud className="h-3 w-3 text-blue-400" />
                  <span className="text-blue-400">Azure</span>
                </span>
              </div>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 px-6 py-3 h-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 