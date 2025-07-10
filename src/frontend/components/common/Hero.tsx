'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wand2, Palette, Home, Sparkles } from 'lucide-react'

export default function Hero() {
  const [isGenerating, setIsGenerating] = useState(false)

  const startGeneration = () => {
    setIsGenerating(true)
    // Перенаправление на дашборд или генератор
    setTimeout(() => {
      setIsGenerating(false)
      // router.push('/dashboard')
    }, 2000)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Фоновая анимация */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-10 animate-ping"></div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 mr-4">
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white">
              Red<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500">.AI</span>
            </h1>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-4">
            Революция в дизайне интерьеров
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Создавайте потрясающие дизайны с помощью искусственного интеллекта. 
            Просто опишите свою мечту — мы воплотим её в реальность.
          </p>
        </div>

        {/* Преимущества */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Wand2 className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI Генерация</h3>
            <p className="text-gray-300 text-sm">
              Передовые алгоритмы создают уникальные дизайны за секунды
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Palette className="h-12 w-12 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Стили и Цвета</h3>
            <p className="text-gray-300 text-sm">
              Множество стилей от минимализма до классики
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Home className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Любые Помещения</h3>
            <p className="text-gray-300 text-sm">
              Гостиные, спальни, кухни, офисы — без ограничений
            </p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={startGeneration}
            disabled={isGenerating}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Создаём магию...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Создать дизайн
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-8 py-3 rounded-lg text-lg font-semibold transition-all"
          >
            Посмотреть примеры
          </Button>
        </div>

        {/* Статистика */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">10K+</div>
            <div className="text-sm text-gray-300">Дизайнов создано</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">500+</div>
            <div className="text-sm text-gray-300">Довольных клиентов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">50+</div>
            <div className="text-sm text-gray-300">Стилей дизайна</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-gray-300">Поддержка AI</div>
          </div>
        </div>
      </div>
    </div>
  )
} 