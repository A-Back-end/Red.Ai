# Umami Analytics Setup for Red.AI

Umami Analytics настроен для отслеживания пользовательского поведения и аналитики на сайте Red.AI. Umami ID: `18af50fe-7e10-4228-aaa5-9f3232c35043`

## 🎯 Преимущества Umami

- **Приватность**: Не использует cookies, GDPR-совместим
- **Простота**: Легкий и быстрый
- **Открытый исходный код**: Можно развернуть самостоятельно
- **Бесплатный**: Облачная версия бесплатна

## 📊 Основной код Umami

### 1. Скрипт в HTML

Umami код добавлен в следующие файлы:
- `app/layout.tsx` - основной layout Next.js
- `public/index.html` - статическая страница
- `public/html/index-root.html` - корневая страница
- `public/html/auth.html` - страница авторизации
- `public/html/test-input.html` - тестовая страница

```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="18af50fe-7e10-4228-aaa5-9f3232c35043"></script>
```

### 2. React интеграция

Созданы утилиты для удобного использования Umami:

- `lib/umami.ts` - основные функции для отправки событий
- `lib/useUmami.ts` - React хуки для компонентов

## 🔧 Использование в компонентах

### Базовое использование

```tsx
import { useUmami } from '@/lib/useUmami'

function MyComponent() {
  const { trackInteraction, trackAI, trackCustom } = useUmami()
  
  const handleClick = () => {
    trackInteraction('click', 'button', 'cta_button')
  }
  
  return <button onClick={handleClick}>Click me</button>
}
```

### Специализированные хуки

```tsx
import { useUmamiButton, useUmamiForm, useUmamiAI } from '@/lib/useUmami'

function MyComponent() {
  const { trackClick } = useUmamiButton('cta')
  const { trackSubmit, trackFieldFocus } = useUmamiForm('contact')
  const { trackStart, trackComplete, trackError } = useUmamiAI('design_generation')
  
  // Использование
  trackClick('main_cta', 'hero_section')
  trackSubmit('contact_form', 'success')
  trackStart({ design_type: 'modern' })
}
```

## 📈 Отслеживаемые события

### Автоматические события
- **Page Views** - автоматически отслеживаются при навигации
- **Session Duration** - время сессии
- **Bounce Rate** - показатель отказов

### Пользовательские события

```tsx
// Взаимодействия пользователя
trackInteraction('click', 'button', 'cta_button')
trackInteraction('submit', 'form', 'contact_form')

// AI функции
trackAI('dalle_generation', 'start', { style: 'modern' })
trackAI('furniture_finder', 'complete', { items_found: 5 })

// Дизайн
trackDesign('interior_design', { room_type: 'living_room' })
trackDesign('renovation_plan', { budget: 'medium' })

// Регистрация и проекты
trackRegistration('google')
trackProject('interior_design', { complexity: 'high' })

// Использование кредитов
trackCredits('image_generation', 1)
```

## 🎯 Консольные логи

Все события логируются в консоль для отладки:

```
📊 Umami Event sent: user_interaction {action: "click", category: "button"}
📊 Umami Page View: /dashboard
📊 Umami Event sent: ai_feature_usage {feature: "dalle_generation", action: "start"}
```

## 🔍 Просмотр аналитики

1. Войдите в [Umami Cloud](https://cloud.umami.is)
2. Выберите ваш сайт Red.AI
3. Просматривайте:
   - **Realtime** - активные пользователи
   - **Analytics** - общая статистика
   - **Events** - пользовательские события

## 🚀 Миграция с GTM

### Замененные файлы
- `lib/gtm.ts` → `lib/umami.ts`
- `lib/useGTM.ts` → `lib/useUmami.ts`

### Обновленные импорты
```tsx
// Было
import { useGTM } from '@/lib/useGTM'

// Стало
import { useUmami } from '@/lib/useUmami'
```

### Совместимость API
Все методы GTM имеют аналоги в Umami:
- `trackInteraction()` - одинаковый API
- `trackAI()` - одинаковый API
- `trackDesign()` - одинаковый API
- `trackCustom()` - одинаковый API

## 🔧 Настройка окружения

### Переменные окружения
```env
# Umami Website ID (уже настроен)
NEXT_PUBLIC_UMAMI_WEBSITE_ID=18af50fe-7e10-4228-aaa5-9f3232c35043
```

### Отключение в разработке
```tsx
// В компонентах можно добавить проверку
const isDevelopment = process.env.NODE_ENV === 'development'
if (!isDevelopment) {
  trackInteraction('click', 'button')
}
```

## 📊 Основные метрики

### Автоматически отслеживаемые
- **Page Views** - просмотры страниц
- **Unique Visitors** - уникальные посетители
- **Session Duration** - время сессии
- **Bounce Rate** - показатель отказов
- **Referrers** - источники трафика

### Пользовательские события
- **AI Feature Usage** - использование AI функций
- **Design Generation** - генерация дизайнов
- **User Registration** - регистрация пользователей
- **Project Creation** - создание проектов
- **Credit Usage** - использование кредитов

## 🎨 Интеграция с дизайном

Umami автоматически отслеживает:
- **Device Type** - тип устройства
- **Browser** - браузер
- **Country** - страна (если разрешено)
- **Screen Size** - размер экрана

## 🔒 Приватность

Umami соблюдает GDPR и не использует:
- Cookies для отслеживания
- Персональные данные
- Cross-site tracking

Все данные анонимны и не содержат личной информации пользователей. 