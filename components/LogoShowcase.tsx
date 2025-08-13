'use client'

import React from 'react'

export default function LogoShowcase() {
  const logos = [
    { name: 'AI Powered', icon: '🤖' },
    { name: 'Design Ready', icon: '🎨' },
    { name: 'Real Estate', icon: '🏡' },
    { name: 'Smart Tech', icon: '⚡' },
    { name: 'Innovation', icon: '💡' },
    { name: 'Future Ready', icon: '🚀' },
  ]

  return (
    <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-lg font-medium text-gray-600 dark:text-gray-300 mb-8">
          Trusted by innovative companies
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/80 dark:bg-gray-700/80 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {logo.icon}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 