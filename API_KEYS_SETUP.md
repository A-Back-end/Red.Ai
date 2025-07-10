# 🔑 Red.AI API Keys Setup Guide

## Обязательные API ключи для полной работы

### 1. 🔐 Clerk Authentication (Уже настроено)
- **Статус**: ✅ Настроено
- **Что делает**: Аутентификация пользователей, Google Sign-In
- **Получить**: [Clerk Dashboard](https://dashboard.clerk.com/)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 🤖 OpenAI API (Основной AI сервис)
- **Что делает**: Чат-ассистент, анализ изображений, текстовая генерация
- **Получить**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Цена**: $20-50/месяц для активного использования

```env
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_ORG_ID=org-your-org-id-here
```

### 3. ⚡ Azure OpenAI (Премиум AI)
- **Что делает**: Более стабильные модели GPT-4, DALL-E 3
- **Получить**: [Azure Portal](https://portal.azure.com) → Create OpenAI Resource
- **Цена**: По использованию, часто дешевле OpenAI

```env
AZURE_OPENAI_API_KEY=your-azure-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_DALLE_DEPLOYMENT_NAME=dall-e-3
```

### 4. 🖼️ Hugging Face (Генерация изображений)
- **Что делает**: Stable Diffusion, дизайн интерьеров
- **Получить**: [Hugging Face Settings](https://huggingface.co/settings/tokens)
- **Цена**: Бесплатно до 1000 запросов/месяц

```env
HF_TOKEN=hf_your-token-here
HUGGINGFACE_API_KEY=hf_your-token-here
```

### 5. 🎨 Replicate (Альтернативная генерация)
- **Что делает**: Stable Diffusion XL, улучшение изображений
- **Получить**: [Replicate Account](https://replicate.com/account/api-tokens)
- **Цена**: $0.001-0.01 за изображение

```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Дополнительные сервисы (Опционально)

### 6. 🧠 Anthropic Claude
- **Что делает**: Альтернативный AI ассистент
- **Получить**: [Anthropic Console](https://console.anthropic.com/)

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 7. 🎭 Stability AI
- **Что делает**: Профессиональная генерация изображений
- **Получить**: [Stability AI Platform](https://platform.stability.ai/)

```env
STABILITY_API_KEY=sk-your-stability-key-here
```

### 8. 🔥 Firebase (Хранение и аналитика)
- **Что делает**: Хранение изображений, аналитика
- **Получить**: [Firebase Console](https://console.firebase.google.com/)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... остальные Firebase ключи
```

### 9. 🛡️ Google reCAPTCHA
- **Что делает**: Защита от спама
- **Получить**: [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxx
```

## 📋 Шаги для настройки

### Шаг 1: Скопируйте .env.local
Файл уже создан, нужно только заменить ключи:

```bash
# Файл уже создан в корне проекта
cat .env.local
```

### Шаг 2: Получите обязательные ключи

1. **OpenAI API** (самый важный):
   - Перейдите на https://platform.openai.com/api-keys
   - Создайте новый ключ
   - Замените `OPENAI_API_KEY=sk-your-openai-key-here`

2. **Hugging Face** (для генерации изображений):
   - Перейдите на https://huggingface.co/settings/tokens
   - Создайте Read токен
   - Замените `HF_TOKEN=hf_your-token-here`

### Шаг 3: Настройте дополнительные сервисы
- Azure OpenAI для лучшего качества
- Replicate для Stable Diffusion XL
- Firebase для хранения

### Шаг 4: Перезапустите сервер
```bash
# Остановите текущий сервер (Ctrl+C)
# Запустите заново
npm run dev
```

## 💰 Бюджет на API ключи

### Минимальный набор (для тестирования):
- **OpenAI**: $5-20/месяц
- **Hugging Face**: Бесплатно
- **Clerk**: Бесплатно (до 10,000 пользователей)
- **Итого**: $5-20/месяц

### Полный набор (для продакшена):
- **OpenAI**: $20-50/месяц
- **Azure OpenAI**: $30-70/месяц
- **Replicate**: $10-30/месяц  
- **Firebase**: $10-25/месяц
- **Итого**: $70-175/месяц

## 🚀 Проверка работы

После настройки ключей проверьте:

1. **Главная страница**: http://localhost:3000
2. **Авторизация**: Попробуйте войти через Google
3. **Dashboard**: Проверьте AI-ассистента
4. **Генерация изображений**: Загрузите фото комнаты

## ❗ Безопасность

- ✅ Никогда не комитьте .env.local в Git
- ✅ Используйте разные ключи для dev/prod
- ✅ Настройте rate limiting для API
- ✅ Регулярно ротируйте ключи

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте .env.local на опечатки
2. Убедитесь, что ключи активны
3. Проверьте баланс аккаунтов
4. Перезапустите сервер

---

**Red.AI готов к использованию со всеми настроенными API! 🎉** 