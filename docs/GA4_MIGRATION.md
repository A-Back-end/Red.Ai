# Миграция с GTM на Google Analytics GA4

## Обзор изменений

Проект Red.AI успешно мигрирован с Google Tag Manager (GTM) на Google Analytics GA4. Все функции трекинга обновлены для работы с новым API.

## Основные изменения

### 1. Скрипты аналитики

**Было (GTM):**
```html
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KMRVH2GD');</script>
```

**Стало (GA4):**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KPN11Z30WN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-KPN11Z30WN');
</script>
```

### 2. API функций

**Было (GTM):**
```typescript
import { sendGTMEvent } from '@/lib/gtm';
sendGTMEvent('custom_event', { param: 'value' });
```

**Стало (GA4):**
```typescript
import { sendGAEvent } from '@/lib/gtm';
sendGAEvent('custom_event', { param: 'value' });
```

### 3. Отслеживание событий

**Было (GTM):**
```typescript
// Отправка в dataLayer
window.dataLayer.push({
  event: 'custom_event',
  param: 'value'
});
```

**Стало (GA4):**
```typescript
// Отправка через gtag
window.gtag('event', 'custom_event', {
  param: 'value'
});
```

## Обновленные файлы

### Основные файлы
- `app/layout.tsx` - обновлены скрипты GA4
- `lib/gtm.ts` - переименованы функции для GA4
- `lib/useGTM.ts` - обновлены импорты и комментарии
- `public/index.html` - заменен GTM на GA4 скрипт

### Тестовые файлы
- `test-gtm.html` → `test-ga4.html` - переименован и обновлен
- `docs/GTM_SETUP.md` → обновлена документация

## Обратная совместимость

Для плавной миграции сохранены старые функции:

```typescript
// Старые функции все еще работают
import { sendGTMEvent, GTM_EVENTS } from '@/lib/gtm';

// Но теперь используют GA4 под капотом
sendGTMEvent('custom_event', { param: 'value' });
```

## Проверка работы

### 1. Консоль браузера
Откройте консоль и проверьте сообщения:
```
📊 GA4 Event sent: page_view {page_path: "/dashboard"}
```

### 2. Тестовая страница
Откройте `test-ga4.html` для проверки всех функций:
- Проверка загрузки GA4
- Тестирование событий
- Отладочная информация

### 3. Google Analytics
1. Войдите в [Google Analytics](https://analytics.google.com/)
2. Перейдите в Real-time отчеты
3. Проверьте, что события поступают

## Преимущества GA4

1. **Улучшенная производительность** - меньше JavaScript кода
2. **Лучшая интеграция** - прямой API без промежуточного слоя
3. **Расширенные возможности** - больше параметров событий
4. **Упрощенная настройка** - меньше конфигурации

## Настройка в Google Analytics

1. Создайте новый ресурс GA4
2. Получите Measurement ID: `G-KPN11Z30WN`
3. Настройте события в Admin → Events
4. Создайте пользовательские отчеты

## Отслеживаемые события

Все события Red.AI теперь отправляются в GA4:

- `page_view` - просмотры страниц
- `user_interaction` - взаимодействия пользователя
- `ai_feature_usage` - использование AI функций
- `design_generation` - генерация дизайнов
- `user_registration` - регистрация пользователей
- `project_creation` - создание проектов
- `credit_usage` - использование кредитов

## Миграция завершена ✅

Все компоненты Red.AI успешно обновлены для работы с Google Analytics GA4. Старые функции сохранены для обратной совместимости. 