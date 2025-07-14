# BeforeAfterSlider Component

Компонент для сравнения изображений "до" и "после" с интерактивным слайдером.

## Описание

BeforeAfterSlider использует библиотеку `react-before-after-slider-component` для создания интерактивного слайдера сравнения изображений. Идеально подходит для демонстрации результатов генерации дизайна интерьера.

## Установка

```bash
npm install react-before-after-slider-component
```

## Использование

```jsx
import BeforeAfterSlider from './components/design-studio/BeforeAfterSlider'

function MyComponent() {
  return (
    <div className="w-full h-96">
      <BeforeAfterSlider 
        beforeImage="/path/to/before-image.jpg"
        afterImage="/path/to/after-image.jpg"
        beforeLabel="Original"
        afterLabel="Generated"
        className="rounded-lg"
      />
    </div>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `beforeImage` | string | - | URL исходного изображения |
| `afterImage` | string | - | URL результирующего изображения |
| `beforeLabel` | string | "Before" | Подпись для исходного изображения |
| `afterLabel` | string | "After" | Подпись для результирующего изображения |
| `className` | string | "" | Дополнительные CSS классы |

## Особенности

- ✅ Поддержка drag & drop слайдера
- ✅ Responsive дизайн
- ✅ Тёмная и светлая темы
- ✅ Плавные анимации
- ✅ Сенсорный интерфейс для мобильных устройств
- ✅ Красивые лейблы с backdrop-blur эффектом
- ✅ Инструкции для пользователя

## Интеграция с FluxDesigner

Компонент автоматически интегрируется в FluxDesigner:

1. При загрузке основного изображения создается URL
2. После генерации дизайна показывается BeforeAfterSlider
3. Пользователь может сравнить оригинал и результат
4. Fallback на простое изображение если нет оригинала

## Стилизация

Дополнительные стили определены в `app/globals.css`:

- Кастомные стили для slider-delimiter
- Hover эффекты для лучшего UX
- Поддержка тёмной темы
- Адаптивность для разных размеров экрана

## Примеры использования

### Базовое использование
```jsx
<BeforeAfterSlider 
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
/>
```

### С кастомными подписями
```jsx
<BeforeAfterSlider 
  beforeImage="/original-room.jpg"
  afterImage="/designed-room.jpg"
  beforeLabel="Оригинал"
  afterLabel="Дизайн"
/>
```

### С дополнительными стилями
```jsx
<BeforeAfterSlider 
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
  className="rounded-2xl shadow-2xl"
/>
```

## Технические детали

- Использует `react-before-after-slider-component` v1.3.0+
- Совместим с Next.js 13+ App Router
- Поддерживает TypeScript
- Оптимизирован для производительности
- Автоматическая очистка URL объектов

## Поддержка браузеров

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Мобильные браузеры (iOS Safari, Chrome Mobile)

## Лицензия

MIT License - используется в рамках проекта Red.AI 