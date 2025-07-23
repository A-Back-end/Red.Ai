# Google Tag Manager Setup для Red.AI

## Обзор

Google Tag Manager (GTM) настроен для отслеживания пользовательского поведения и аналитики на сайте Red.AI. GTM ID: `GTM-KMRVH2GD`

## Установка

### 1. Основной код GTM

GTM код добавлен в следующие файлы:

- `app/layout.tsx` - основной layout Next.js приложения
- `public/index.html` - статическая главная страница

### 2. Утилиты для трекинга

Созданы утилиты для удобного использования GTM:

- `lib/gtm.ts` - основные функции для отправки событий
- `lib/useGTM.ts` - React хуки для компонентов

## Отслеживаемые события

### Страницы и навигация
- `page_view` - просмотр страниц
- `user_interaction` - взаимодействия пользователя
- `navigation` - навигация по dashboard

### AI функции
- `ai_feature_usage` - использование AI функций
- `dalle_generation` - генерация изображений DALL-E
- `design_generation` - генерация дизайнов интерьера

### Пользовательские действия
- `user_registration` - регистрация пользователей
- `user_login` - вход в систему
- `project_creation` - создание проектов
- `project_save` - сохранение проектов

### Бизнес метрики
- `credit_usage` - использование кредитов
- `credit_purchase` - покупка кредитов

## Использование в компонентах

### Базовое использование

```typescript
import { useGTM } from '@/lib/useGTM'

export function MyComponent() {
  const { trackInteraction, trackAI, trackCustom } = useGTM()
  
  const handleClick = () => {
    trackInteraction('click', 'button', 'cta_button')
  }
  
  return <button onClick={handleClick}>Click me</button>
}
```

### Специализированные хуки

```typescript
import { useGTMButton, useGTMForm, useGTMAI } from '@/lib/useGTM'

// Для кнопок
const { trackClick } = useGTMButton('cta')
trackClick('primary', 'hero_section')

// Для форм
const { trackSubmit, trackFieldFocus } = useGTMForm('contact')
trackSubmit('success', 'lead_generation')

// Для AI функций
const { trackStart, trackComplete, trackError } = useGTMAI('design_generation')
trackStart({ room_type: 'living_room' })
```

## Настройка в GTM

### 1. Создание триггеров

Создайте триггеры для отслеживаемых событий:

- **Все события AI** - `ai_feature_usage`
- **Генерация дизайнов** - `design_generation`
- **Навигация** - `user_interaction` с category = 'navigation'
- **Формы** - `user_interaction` с category = 'form'

### 2. Создание тегов

Настройте теги для отправки данных в:

- **Google Analytics 4** - для основной аналитики
- **Google Ads** - для рекламных кампаний
- **Facebook Pixel** - для социальных сетей
- **Custom HTML** - для кастомных интеграций

### 3. Переменные

Создайте переменные для извлечения данных:

- `event` - название события
- `category` - категория действия
- `action` - тип действия
- `label` - дополнительная метка
- `value` - числовое значение

## Отслеживаемые компоненты

### Dashboard
- Навигация между разделами
- Выход из системы
- Переключение тем и языков

### Design Studio
- Загрузка изображений
- Настройка параметров дизайна
- Генерация дизайнов
- Сохранение проектов

### AI Assistant
- Отправка сообщений
- Генерация изображений DALL-E
- Ошибки генерации

### Проекты
- Создание новых проектов
- Просмотр сохраненных проектов
- Удаление проектов

## Отладка

### Проверка установки

1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Console
3. Введите: `window.dataLayer`
4. Должен вернуться массив с событиями

### Проверка событий

В консоли должны появляться сообщения вида:
```
📊 GTM Event sent: page_view {page_path: "/dashboard"}
📊 GTM Event sent: ai_feature_usage {feature: "dalle_generation", action: "start"}
```

### GTM Preview Mode

1. Войдите в GTM
2. Нажмите "Preview"
3. Введите URL сайта
4. Откройте сайт в новом окне
5. Выполните действия для тестирования

## Безопасность

- GTM код загружается асинхронно
- Noscript fallback для пользователей без JavaScript
- Все события отправляются только на клиенте
- Нет передачи персональных данных

## Производительность

- GTM загружается с `strategy="afterInteractive"`
- События отправляются без блокировки UI
- Минимальное влияние на скорость загрузки страниц

## Мониторинг

### Ключевые метрики для отслеживания:

1. **Конверсии**
   - Регистрация пользователей
   - Создание проектов
   - Генерация дизайнов

2. **Использование AI**
   - Количество генераций
   - Успешность генераций
   - Популярные типы дизайнов

3. **Пользовательское поведение**
   - Время на сайте
   - Пути пользователей
   - Популярные страницы

4. **Технические метрики**
   - Ошибки генерации
   - Время загрузки
   - Успешность API вызовов 