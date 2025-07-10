'use client'

import React from 'react'

export const LogoShowcase = ({ translations }: { translations: any }) => {
  const logos = ["Google", "NVIDIA", "Microsoft", "OpenAI", "Meta", "Amazon"]
  
  return (
    <div className="py-12">
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{translations.logosTitle}</p>
      <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
        {logos.map((logo) => (
          <span key={logo} className="text-2xl font-semibold text-gray-400 dark:text-gray-500">
            {logo}
          </span>
        ))}
      </div>
    </div>
  )
} 