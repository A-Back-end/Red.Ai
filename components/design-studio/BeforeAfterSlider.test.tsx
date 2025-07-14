'use client'

import React from 'react'
import BeforeAfterSlider from './BeforeAfterSlider'

/**
 * Тестовый компонент для проверки BeforeAfterSlider
 * Использует тестовые изображения для демонстрации функциональности
 */
const BeforeAfterSliderTest = () => {
  // Тестовые изображения (можно заменить на реальные)
  const testBeforeImage = '/img/img-1.jpg'
  const testAfterImage = '/img/img-2.jpg'

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          BeforeAfterSlider Test
        </h1>
        
        <div className="space-y-12">
          {/* Тест 1: Базовое использование */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Базовое использование
            </h2>
            <div className="aspect-video w-full">
              <BeforeAfterSlider 
                beforeImage={testBeforeImage}
                afterImage={testAfterImage}
              />
            </div>
          </div>

          {/* Тест 2: С кастомными подписями */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              С кастомными подписями
            </h2>
            <div className="aspect-video w-full">
              <BeforeAfterSlider 
                beforeImage={testBeforeImage}
                afterImage={testAfterImage}
                beforeLabel="Оригинал"
                afterLabel="Дизайн"
              />
            </div>
          </div>

          {/* Тест 3: Разные размеры */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Компактный размер
            </h2>
            <div className="aspect-square w-full max-w-md mx-auto">
              <BeforeAfterSlider 
                beforeImage={testBeforeImage}
                afterImage={testAfterImage}
                beforeLabel="Before"
                afterLabel="After"
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Тест 4: Широкий формат */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Широкий формат
            </h2>
            <div className="h-64 w-full">
              <BeforeAfterSlider 
                beforeImage={testBeforeImage}
                afterImage={testAfterImage}
                beforeLabel="Original Room"
                afterLabel="AI Generated"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Перетаскивайте слайдер для сравнения изображений
          </p>
        </div>
      </div>
    </div>
  )
}

export default BeforeAfterSliderTest 