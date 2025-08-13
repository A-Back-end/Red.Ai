'use client'

import React from 'react'

export const CTA = ({ translations }: { translations: any }) => {
  return (
    <div className="text-center py-20">
      <h2 className="text-4xl font-extrabold mb-4 text-gray-800 dark:text-white">{translations.ctaTitle}</h2>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{translations.ctaSubtitle}</p>
      <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-700 transition-colors">
        {translations.ctaButton}
      </button>
    </div>
  )
} 