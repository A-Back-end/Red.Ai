import React, { useRef, useState, useEffect } from 'react';

/**
 * Компонент сравнения двух изображений (до/после) с draggable-слайдером.
 * Использование:
 * <BeforeAfterSlider beforeImage="/path/to/before.jpg" afterImage="/path/to/after.jpg" />
 */
interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'До',
  afterLabel = 'После',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50); // %
  const [dragging, setDragging] = useState(false);

  // Обработка перемещения слайдера
  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    let newPos = ((clientX - rect.left) / rect.width) * 100;
    newPos = Math.max(0, Math.min(100, newPos));
    setSliderPos(newPos);
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging(true);
    onDrag(e);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  };

  const stopDrag = () => {
    setDragging(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  useEffect(() => {
    if (!dragging) return;

    const moveHandler = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if ('touches' in e) {
        onDrag(e as any);
      } else {
        onDrag(e as any);
      }
    };

    const upHandler = () => stopDrag();

    window.addEventListener('mousemove', moveHandler, { passive: false });
    window.addEventListener('touchmove', moveHandler, { passive: false });
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchend', upHandler);

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      window.removeEventListener('touchend', upHandler);
    };
  }, [dragging]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Сравнение "До" и "После"
      </h3>
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] mx-auto overflow-hidden rounded-xl shadow-2xl select-none bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
        style={{ touchAction: 'none' }}
      >
        {/* Картинка "до" - основа */}
        <img
          src={beforeImage}
          alt="Оригинальное изображение"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          style={{ zIndex: 1 }}
        />

        {/* Контейнер для картинки "после" с маской */}
        <div
          className="absolute inset-0"
          style={{ 
            zIndex: 2,
            width: `${sliderPos}%`,
            overflow: 'hidden'
          }}
        >
                     <img
             src={afterImage}
             alt="Изображение после обработки"
             className="h-full object-cover"
             draggable={false}
             style={{
               width: containerRef.current ? `${(containerRef.current.offsetWidth / (sliderPos / 100))}px` : '100%',
               maxWidth: 'none'
             }}
           />
        </div>

        {/* Вертикальная разделительная линия */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ 
            left: `${sliderPos}%`, 
            zIndex: 4,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.5)'
          }}
        />

        {/* Слайдер - вертикальный ползунок */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
          style={{ 
            left: `calc(${sliderPos}% - 16px)`, 
            zIndex: 5,
            width: '32px'
          }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          {/* Ползунок */}
          <div className="relative">
            {/* Центральная круглая кнопка */}
            <div 
              className={`w-12 h-12 rounded-full bg-white border-2 border-gray-300 shadow-lg flex items-center justify-center transition-all duration-200 ${
                dragging ? 'scale-110 border-blue-500 shadow-xl' : 'hover:scale-105 hover:border-gray-400'
              }`}
              style={{ 
                boxShadow: dragging 
                  ? '0 4px 20px rgba(59, 130, 246, 0.4)' 
                  : '0 2px 10px rgba(0,0,0,0.2)' 
              }}
            >
              {/* Иконка двойных стрелок */}
              <svg 
                width="20" 
                height="20" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
                className="text-gray-600"
              >
                <path d="M8 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Верхняя стрелка */}
            <div 
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Нижняя стрелка */}
            <div 
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Подписи */}
        <div className="absolute left-4 top-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full z-10 font-medium">
          {beforeLabel}
        </div>
        <div className="absolute right-4 top-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full z-10 font-medium">
          {afterLabel}
        </div>

        {/* Подсказка для пользователя */}
        {!dragging && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full z-10 transition-opacity duration-300">
            ← Перетащите для сравнения →
          </div>
        )}
      </div>
    </div>
  );
};

export default BeforeAfterSlider; 