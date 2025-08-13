'use client'

import React from 'react'
import { Zap, Bot, ImageIcon, Palette } from 'lucide-react'

export const Features = ({ translations }: { translations: any }) => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: translations.feature1Title,
      description: translations.feature1Desc,
    },
    {
      icon: <Bot className="w-8 h-8 text-blue-400" />,
      title: translations.feature2Title,
      description: translations.feature2Desc,
    },
    {
      icon: <ImageIcon className="w-8 h-8 text-green-400" />,
      title: translations.feature3Title,
      description: translations.feature3Desc,
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-400" />,
      title: translations.feature4Title,
      description: translations.feature4Desc,
    },
  ]

  return (
    <div className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">{translations.featuresTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="text-center p-6 bg-white/5 dark:bg-black/10 rounded-lg shadow-md backdrop-blur-sm">
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 