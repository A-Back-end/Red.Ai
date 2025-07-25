# Google Analytics GA4 Setup Guide

Google Analytics GA4 настроен для отслеживания пользовательского поведения и аналитики на сайте Red.AI. GA4 ID: `G-KPN11Z30WN`

## Установка

### 1. Основной скрипт GA4

Добавьте следующий код в секцию `<head>` вашего HTML:

```html
<!-- Google Analytics GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KPN11Z30WN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-KPN11Z30WN');
</script>
<!-- End Google Analytics GA4 -->
```

### 2. Next.js интеграция

В файле `app/layout.tsx` используется Next.js Script компонент:

```tsx
{/* Google Analytics GA4 */}
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-KPN11Z30WN"
  strategy="afterInteractive"
/>
<Script id="ga4-script" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-KPN11Z30WN');
  `}
</Script>
{/* End Google Analytics GA4 */}
```

## Использование в коде

### Импорт функций

```typescript
import { 
  sendGAEvent, 
  trackPageView, 
  trackUserInteraction, 
  trackAIFeature,
  trackDesignGeneration,
  trackUserRegistration,
  trackProjectCreation,
  trackCreditUsage,
  GA_EVENTS 
} from '@/lib/gtm';
```

### Отслеживание событий

```typescript
// Отслеживание просмотра страницы
trackPageView('/dashboard', 'Dashboard');

// Отслеживание взаимодействия пользователя
trackUserInteraction('click', 'button', 'generate_design', 1);

// Отслеживание использования AI функций
trackAIFeature('design_generator', 'generate', { style: 'modern' });

// Отслеживание генерации дизайна
trackDesignGeneration('interior', { room_type: 'living_room' });

// Отслеживание регистрации пользователя
trackUserRegistration('google');

// Отслеживание создания проекта
trackProjectCreation('interior_design', { complexity: 'advanced' });

// Отслеживание использования кредитов
trackCreditUsage('image_generation', 5);
```

### Пользовательские события

```typescript
// Отправка пользовательского события
sendGAEvent('custom_event', {
  category: 'user_action',
  action: 'button_click',
  label: 'cta_button',
  value: 1
});
```

## Предопределенные события

```typescript
export const GA_EVENTS = {
  // Взаимодействия со страницами
  PAGE_VIEW: 'page_view',
  USER_INTERACTION: 'user_interaction',
  
  // AI функции
  AI_FEATURE_USAGE: 'ai_feature_usage',
  DESIGN_GENERATION: 'design_generation',
  FURNITURE_FINDER: 'furniture_finder',
  RENOVATION_ASSISTANT: 'renovation_assistant',
  
  // Действия пользователя
  USER_REGISTRATION: 'user_registration',
  USER_LOGIN: 'user_login',
  PROJECT_CREATION: 'project_creation',
  PROJECT_SAVE: 'project_save',
  
  // Бизнес метрики
  CREDIT_USAGE: 'credit_usage',
  CREDIT_PURCHASE: 'credit_purchase',
  
  // Дизайн студия
  DESIGN_STUDIO_START: 'design_studio_start',
  DESIGN_STUDIO_COMPLETE: 'design_studio_complete',
  IMAGE_UPLOAD: 'image_upload',
  IMAGE_GENERATION: 'image_generation',
} as const;
```

## Проверка работы

1. Откройте консоль браузера
2. Перейдите на любую страницу сайта
3. Вы должны увидеть сообщения вида: `📊 GA4 Event sent: page_view`
4. Проверьте в Google Analytics Console, что события поступают

## Миграция с GTM

Если вы мигрируете с Google Tag Manager, старые функции все еще доступны для обратной совместимости:

```typescript
// Старые функции (для обратной совместимости)
import { sendGTMEvent, GTM_EVENTS } from '@/lib/gtm';

// Эти функции теперь используют GA4 под капотом
sendGTMEvent('custom_event', { param: 'value' });
```

## Настройка в Google Analytics

1. Войдите в [Google Analytics](https://analytics.google.com/)
2. Выберите свой аккаунт и ресурс
3. Перейдите в Admin → Data Streams
4. Убедитесь, что веб-поток настроен правильно
5. Проверьте, что события поступают в Real-time отчеты 