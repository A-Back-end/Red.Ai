# ✅ Google Tag Manager - Проверка установки

## 🎯 Что сделано

1. **GTM код добавлен** в основные файлы:
   - `app/layout.tsx` - Next.js приложение
   - `public/index.html` - статическая страница

2. **Созданы утилиты** для трекинга:
   - `lib/gtm.ts` - основные функции
   - `lib/useGTM.ts` - React хуки

3. **Добавлен трекинг** в ключевые компоненты:
   - Dashboard навигация
   - Design Studio генерация
   - AI Assistant взаимодействия

4. **Создана документация**:
   - `docs/GTM_SETUP.md` - полная документация
   - `test-gtm.html` - тестовая страница

## 🧪 Как проверить работу

### 1. Проверка в браузере

1. Откройте сайт в браузере
2. Нажмите F12 (Developer Tools)
3. Перейдите на вкладку Console
4. Введите: `window.dataLayer`
5. Должен вернуться массив с событиями

### 2. Тестовая страница

1. Откройте `test-gtm.html` в браузере
2. Нажмите кнопки для тестирования событий
3. Проверьте консоль на наличие сообщений:
   ```
   📊 GTM Event sent: page_view {page_path: "/dashboard"}
   ```

### 3. GTM Preview Mode

1. Войдите в [Google Tag Manager](https://tagmanager.google.com/)
2. Выберите контейнер `GTM-KMRVH2GD`
3. Нажмите "Preview" (кнопка справа от "Submit")
4. Введите URL вашего сайта
5. Откройте сайт в новом окне
6. Выполните действия для тестирования

## 📊 Отслеживаемые события

### Автоматические
- `page_view` - при переходе между страницами
- `user_interaction` - при кликах и взаимодействиях

### Ручные (добавлены в компоненты)
- `ai_feature_usage` - использование AI функций
- `design_generation` - генерация дизайнов
- `user_registration` - регистрация пользователей
- `project_creation` - создание проектов
- `credit_usage` - использование кредитов

## 🔧 Настройка в GTM

### 1. Создание триггеров

Создайте триггеры для каждого типа событий:

```
Название: AI Feature Usage
Тип: Custom Event
Событие: ai_feature_usage

Название: Design Generation
Тип: Custom Event  
Событие: design_generation

Название: User Registration
Тип: Custom Event
Событие: user_registration
```

### 2. Создание тегов

Настройте теги для отправки данных:

```
Название: GA4 - AI Events
Тип: Google Analytics: GA4 Event
Триггер: AI Feature Usage
Параметры:
- event_name: ai_feature_usage
- feature: {{Event Parameter - feature}}
- action: {{Event Parameter - action}}
```

### 3. Переменные

Создайте переменные для извлечения данных:

```
Название: Event Parameter - feature
Тип: Event Parameter
Имя параметра: feature

Название: Event Parameter - action  
Тип: Event Parameter
Имя параметра: action
```

## 🚀 Следующие шаги

1. **Проверьте работу** используя тестовую страницу
2. **Настройте триггеры и теги** в GTM
3. **Подключите Google Analytics 4** для аналитики
4. **Настройте цели** для отслеживания конверсий
5. **Добавьте трекинг** в остальные компоненты при необходимости

## 📝 Примеры использования

### В компонентах React

```typescript
import { useGTM } from '@/lib/useGTM'

export function MyComponent() {
  const { trackInteraction, trackAI } = useGTM()
  
  const handleClick = () => {
    trackInteraction('click', 'button', 'cta_button')
  }
  
  const handleAIAction = () => {
    trackAI('feature_name', 'action_type', { param: 'value' })
  }
  
  return (
    <button onClick={handleClick}>
      Click me
    </button>
  )
}
```

### Прямая отправка событий

```typescript
import { sendGTMEvent } from '@/lib/gtm'

sendGTMEvent('custom_event', {
  category: 'test',
  action: 'click',
  label: 'button'
})
```

## 🔍 Отладка

### Проверка в консоли

```javascript
// Проверить dataLayer
console.log(window.dataLayer)

// Отправить тестовое событие
window.dataLayer.push({
  event: 'test_event',
  test_param: 'test_value'
})
```

### Проверка в GTM

1. Включите Preview Mode
2. Откройте сайт
3. Выполните действия
4. Проверьте события в GTM Debugger

## ✅ Готово к использованию

GTM полностью настроен и готов к работе! Все основные события отслеживаются, создана документация и тестовая страница для проверки. 