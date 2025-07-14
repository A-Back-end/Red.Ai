import React, { useRef, useState } from 'react';

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
    setDragging(true);
    onDrag(e);
    document.body.style.userSelect = 'none';
  };
  const stopDrag = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };

  React.useEffect(() => {
    if (!dragging) return;
    const moveHandler = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        onDrag(e as any);
      } else {
        onDrag(e as any);
      }
    };
    const upHandler = () => stopDrag();
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('touchmove', moveHandler);
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
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl aspect-video mx-auto overflow-hidden rounded-lg shadow-lg select-none bg-gray-200"
      style={{ touchAction: 'none' }}
    >
      {/* Картинка "до" */}
      <img
        src={beforeImage}
        alt="До"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        style={{ zIndex: 1 }}
      />
      {/* Картинка "после" */}
      <img
        src={afterImage}
        alt="После"
        className="absolute inset-0 h-full object-cover"
        draggable={false}
        style={{ width: `${sliderPos}%`, zIndex: 2, clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      />
      {/* Слайдер */}
      <div
        className="absolute top-0 left-0 h-full flex items-center"
        style={{ left: `calc(${sliderPos}% - 24px)`, zIndex: 3 }}
      >
        <button
          className="w-12 h-12 rounded-full bg-white border-2 border-gray-400 shadow flex items-center justify-center cursor-pointer focus:outline-none transition hover:scale-105"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          aria-label="Сдвинуть слайдер сравнения"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 12h8M12 8l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {/* Подписи */}
      <span className="absolute left-4 top-4 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">{beforeLabel}</span>
      <span className="absolute right-4 top-4 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">{afterLabel}</span>
    </div>
  );
};

export default BeforeAfterSlider; 