'use client'

import React from 'react'
import { Card, CardContent } from '../ui/card'
import { MessageCircle, Send, Bot, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { useTranslations } from '../../lib/translations'

interface RenovationAssistantProps {
  userId: string
  onClose: () => void
}

export default function RenovationAssistant({ userId, onClose }: RenovationAssistantProps) {
  const { t } = useTranslations()
  const [message, setMessage] = React.useState('')

  const popularQuestions = [
    `🏠 ${t('raw_apartment')}`,
    `🎨 ${t('choose_style')}`,
    `💰 ${t('calculate_budget')}`,
    `📏 ${t('best_materials')}`,
    `🏗️ ${t('layout_zoning')}`,
    `💡 ${t('investment_potential')}`
  ]

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
                             <h1 className="text-2xl font-bold text-white">{t('ai_assistant')}</h1>
               <p className="text-slate-400">{t('consultation')}</p>
              <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded mt-1">
                GPT-4o
              </span>
            </div>
          </div>

          {/* Popular Questions */}
          <div className="mb-6">
                         <h3 className="text-lg font-medium text-white mb-3">💡 {t('popular_questions')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {popularQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="text-left p-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Assistant Message */}
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                                 <p className="text-blue-400 font-medium text-sm mb-1">{t('ai_assistant')}</p>
                 <div className="text-white space-y-2">
                   <p>👋 {t('hello_assistant')}</p>
                   <p><strong>🔧 {t('how_can_help')}</strong></p>
                   <ul className="text-sm text-slate-300 space-y-1">
                     <li>• {t('interior_design_help')}</li>
                     <li>• {t('renovation_planning')}</li>
                     <li>• {t('budgeting_help')}</li>
                     <li>• {t('real_estate_consulting')}</li>
                     <li>• {t('technical_help')}</li>
                   </ul>
                   <p className="text-blue-400">{t('tell_about_apartment')}</p>
                 </div>
                <p className="text-xs text-slate-500 mt-2">General</p>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-4">
                         <Textarea
               placeholder={t('ask_question')}
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               className="min-h-[100px] bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 resize-none"
             />
             <div className="flex items-center justify-between">
               <p className="text-xs text-slate-500">
                 💡 {t('tip_describe')}
               </p>
               <Button
                 onClick={handleSend}
                 disabled={!message.trim()}
                 className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Send className="h-4 w-4 mr-2" />
                 {t('send')}
               </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 