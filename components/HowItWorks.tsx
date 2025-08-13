'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Upload Your Space',
      description: 'Take photos of your room or upload floor plans to get started',
      icon: '📸',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Our AI analyzes your space, lighting, and existing elements',
      icon: '🧠',
      color: 'from-purple-500 to-pink-500'
    },
    {
      step: '03',
      title: 'Design Generation',
      description: 'Get multiple design options tailored to your style and budget',
      icon: '✨',
      color: 'from-green-500 to-teal-500'
    },
    {
      step: '04',
      title: 'Customize & Export',
      description: 'Fine-tune designs and export detailed plans for implementation',
      icon: '🎯',
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your space in four simple steps with our AI-powered platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="relative mx-auto mb-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-2xl mx-auto`}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {step.description}
                </CardDescription>
              </CardContent>

              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"></div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 