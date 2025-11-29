'use client'

import React from 'react'
import { Star } from 'lucide-react'

export const Testimonials = ({ translations }: { translations: any }) => {
  const testimonials = [
    {
      name: "Alexey Smirnov",
      title: "Architect",
      text: translations.testimonial1,
      image: "/img/img-1.jpg"
    },
    {
      name: "Elena Petrova",
      title: "Interior Designer",
      text: translations.testimonial2,
      image: "/img/img-2.jpg"
    },
    {
        name: "Dmitry Ivanov",
        title: "Homeowner",
        text: translations.testimonial3,
        image: "/img/img-3.jpg"
    }
  ]

  return (
    <div className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">{translations.testimonialsTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white/5 dark:bg-black/10 p-6 rounded-lg shadow-md backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.title}</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">&quot;{testimonial.text}&quot;</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 