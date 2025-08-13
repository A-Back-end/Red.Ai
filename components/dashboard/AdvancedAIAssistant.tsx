'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  MessageCircle, Send, Bot, User, Maximize2, Minimize2, X,
  Settings, Sparkles, Zap, Heart, Brain, Eye, Shield,
  Home, Palette, TrendingUp, Loader2, Copy, ThumbsUp, ThumbsDown
} from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Loading } from '../ui/loading'
import { useTranslations } from '@/lib/translations'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AdvancedAIAssistantProps {
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

export default function AdvancedAIAssistant({ userId, onClose }: AdvancedAIAssistantProps) {
  const { t } = useTranslations()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
        content: t('welcomeMessage'),
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
      const response = await fetch('/api/ai-chat', {
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
        throw new Error(data.error || 'Server error')
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **${t('errorOccurred')}**: ${error.message}

${t('tryAgain')}`,
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
      content: t('chatCleared'),
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const currentPersonality = PERSONALITIES[personality as keyof typeof PERSONALITIES]
  const currentSpecialization = SPECIALIZATIONS[specialization as keyof typeof SPECIALIZATIONS]
  const SpecializationIcon = currentSpecialization.icon

  return (
    <div className="h-full w-full">
      <div className="h-full flex flex-col bg-slate-900">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm rounded-none border-t-0">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Personality
                  </label>
                  <select
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white"
                  >
                    {Object.entries(PERSONALITIES).map(([key, { name, icon }]) => (
                      <option key={key} value={key}>
                        {icon} {name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Specialization
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white"
                  >
                    {Object.entries(SPECIALIZATIONS).map(([key, { name }]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-slate-900/50">
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : 'bg-gradient-to-br from-purple-500 to-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>
                  
                  {/* Message */}
                  <div className={`rounded-xl px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                      : 'bg-slate-800/50 text-white border border-slate-700/50'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className={`text-xs ${message.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => copyMessage(message.content)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {message.role === 'assistant' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-green-400"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-red-400"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                    <Loading variant="dots" size="sm" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-slate-800/50 border border-slate-700/50 border-t-0 rounded-b-xl p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('aiChatPlaceholder')}
                className="min-h-[60px] max-h-32 bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-3 h-[60px]"
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