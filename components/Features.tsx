'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export default function Features() {
  const features = [
    {
      title: 'AI-Powered Design',
      description: 'Generate stunning interior designs using advanced AI algorithms',
      icon: '🎨',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Smart Room Analysis',
      description: 'Analyze room layouts and suggest optimal furniture arrangements',
      icon: '🔍',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Real-time 3D Visualization',
      description: 'See your designs come to life with interactive 3D previews',
      icon: '🏠',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Cost Estimation',
      description: 'Get accurate renovation costs and budget planning',
      icon: '💰',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Style Recommendations',
      description: 'Discover design styles that match your preferences',
      icon: '✨',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Export & Share',
      description: 'Export designs and share with contractors or friends',
      icon: '📤',
      color: 'from-pink-500 to-rose-500'
    }
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to transform your space with AI-powered design tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 