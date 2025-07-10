'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader } from './ui/card'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      image: '👩‍💼',
      content: 'Red AI transformed my living room completely. The AI suggestions were spot-on and saved me thousands on interior design fees.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Real Estate Agent',
      image: '👨‍💻',
      content: 'I use Red AI to stage properties for my clients. It helps them visualize the potential and sells homes 30% faster.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Interior Designer',
      image: '👩‍🎨',
      content: 'As a professional designer, Red AI helps me create initial concepts quickly. It\'s like having an AI assistant for brainstorming.',
      rating: 5
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Thousands of users trust Red AI to transform their spaces
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  {testimonial.image}
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4 italic">
                  "{testimonial.content}"
                </CardDescription>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 