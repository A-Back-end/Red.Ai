'use client'

import React from 'react'
import ReactBeforeSliderComponent from 'react-before-after-slider-component'
import 'react-before-after-slider-component/dist/build.css'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = ''
}) => {

  // Объекты изображений для библиотеки
  const beforeImageObj = {
    imageUrl: beforeImage
  }
  
  const afterImageObj = {
    imageUrl: afterImage
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Лейблы */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
          {beforeLabel}
        </div>
        <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
          {afterLabel}
        </div>
      </div>

      {/* Before/After Slider */}
      <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl">
        <ReactBeforeSliderComponent
          firstImage={beforeImageObj}
          secondImage={afterImageObj}
          delimiterColor="rgba(255, 255, 255, 0.8)"
          delimiterIconStyles={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            cursor: 'ew-resize'
          }}
        />
      </div>

      {/* Инструкция */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-black/60 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm">
          ← Drag to compare →
        </div>
      </div>
    </div>
  )
}

export default BeforeAfterSlider 