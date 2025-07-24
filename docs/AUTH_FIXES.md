# Исправления авторизации Clerk

## Проблемы, которые были исправлены

### 1. Ошибка "useUser can only be used within the <ClerkProvider /> component"

**Проблема:** В `app/layout.tsx` была условная логика, которая отключала ClerkProvider в development режиме.

**Решение:** Убрана условная логика, теперь ClerkProvider всегда активен.

### 2. Проблема с CAPTCHA

**Проблема:** CAPTCHA не инициализировалась корректно и вызывала ошибки.

**Решение:** Добавлены настройки в ClerkProvider для отключения CAPTCHA:

```typescript
appearance={{
  elements: {
    captcha: {
      display: 'none',
    },
  },
}}
```

### 3. Проблема "is unknown" в имени пользователя

**Проблема:** Когда пользователь вводил свое имя, отображалось "is unknown".

**Решение:** Создан компонент `UserDisplay` с правильной логикой fallback:

```typescript
const getDisplayName = () => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  if (user.username) {
    return user.username;
  }
  if (user.emailAddresses?.[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress.split('@')[0];
  }
  return 'User';
};
```

### 4. Отсутствие аналитики

**Проблема:** Не отслеживались действия пользователей.

**Решение:** Создана система аналитики с интеграцией в Clerk:

- **Сервис аналитики:** `lib/clerk-analytics.ts`
- **API endpoint:** `app/api/analytics/route.ts`
- **Отслеживание событий:**
  - Регистрация пользователя
  - Вход пользователя
  - Генерация изображений
  - Создание проектов

## Новые компоненты

### UserDisplay
Компонент для правильного отображения имени пользователя с fallback логикой.

**Использование:**
```typescript
<UserDisplay 
  className="w-full"
  showAvatar={true}
  showEmail={true}
/>
```

### ClerkAnalyticsService
Сервис для отслеживания аналитики с интеграцией в Google Analytics и Umami.

**Методы:**
- `trackEvent()` - отслеживание произвольного события
- `trackUserSignUp()` - отслеживание регистрации
- `trackUserSignIn()` - отслеживание входа
- `trackImageGeneration()` - отслеживание генерации изображений
- `trackProjectCreation()` - отслеживание создания проектов

## API Endpoints

### POST /api/analytics
Отправка события в аналитику.

**Параметры:**
```json
{
  "event": "string",
  "properties": {
    "key": "value"
  }
}
```

### GET /api/analytics?action=user-stats
Получение статистики пользователя.

## Интеграция аналитики

### В AuthForm
- Отслеживание входа через email
- Отслеживание регистрации
- Отслеживание попыток входа через Google

### В SSO Callback
- Отслеживание успешного входа через OAuth

### В API генерации
- Отслеживание начала генерации изображений

## Настройки Clerk

### В layout.tsx
```typescript
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  signInFallbackRedirectUrl="/dashboard"
  signUpFallbackRedirectUrl="/dashboard"
  signInUrl="/login"
  signUpUrl="/login"
  appearance={{
    elements: {
      captcha: {
        display: 'none',
      },
      userProfile: {
        display: 'block',
      },
    },
  }}
>
```

### В middleware.ts
Убрана условная логика для development, теперь аутентификация работает всегда.

## Переменные окружения

Убедитесь, что установлены следующие переменные:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Тестирование

1. **Регистрация:** Создайте нового пользователя через форму
2. **Вход:** Войдите с существующими данными
3. **Google OAuth:** Протестируйте вход через Google
4. **Аналитика:** Проверьте консоль браузера на наличие событий аналитики

## Мониторинг

Аналитика отправляется в:
- Google Analytics (GTM)
- Umami Analytics
- Локальные логи (консоль)

Все события логируются в консоль браузера для отладки. 