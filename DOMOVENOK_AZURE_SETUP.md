# 🏠 Настройка Azure OpenAI для Домовёнка

Этот файл содержит инструкции по настройке Azure OpenAI ключей для вашего Домовёнка ИИ ассистента в Red.AI.

## 📋 Требуемые ключи

У вас есть следующие ключи:
- **AZURE_ENDPOINT_KEY** - Endpoint URL или дополнительный ключ Azure
- **AZURE_OPENAPI_KEY** - Основной API ключ Azure OpenAI

## 🔧 Инструкция по настройке

### Шаг 1: Создайте .env.local файл

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```bash
# ==================== Azure OpenAI для Домовёнка ====================
AZURE_OPENAI_API_KEY=AZURE_OPENAPI_KEY
AZURE_OPENAI_KEY=AZURE_OPENAPI_KEY
AZURE_OPENAI_ENDPOINT=AZURE_ENDPOINT_KEY
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-05-01-preview

# ==================== Domovenok Configuration ====================
DOMOVENOK_NAME=Домовёнок
DOMOVENOK_PERSONALITY=friendly
DOMOVENOK_SPECIALIZATION=realtor
DOMOVENOK_MAX_TOKENS=1800
DOMOVENOK_TEMPERATURE=0.7

# ==================== Development Settings ====================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==================== Rate Limiting ====================
RATE_LIMIT_REQUESTS_PER_MINUTE=50

# ==================== Debug ====================
DEBUG=true
LOG_LEVEL=DEBUG
```

### Шаг 2: Замените значения ключей

В созданном `.env.local` файле замените:
- `AZURE_OPENAPI_KEY` на ваш реальный Azure OpenAI API ключ
- `AZURE_ENDPOINT_KEY` на ваш реальный Azure Endpoint URL

**Важно**: Убедитесь, что endpoint URL имеет формат:
```
https://your-resource-name.openai.azure.com/
```

### Шаг 3: Настройте deployment name

Если у вас другое имя развертывания модели, измените:
```bash
AZURE_OPENAI_DEPLOYMENT_NAME=ваше-имя-модели
```

Распространенные варианты:
- `gpt-4`
- `gpt-4-turbo`
- `gpt-35-turbo`
- `gpt-4.1`

### Шаг 4: Перезапустите сервер

```bash
npm run dev
```

## 🧪 Тестирование настройки

### Способ 1: Через интерфейс
1. Откройте http://localhost:3000/dashboard
2. Найдите компонент "Домовёнок ИИ Ассистент"
3. Отправьте тестовое сообщение: "Привет, Домовёнок!"

### Способ 2: Через API
```bash
curl -X POST http://localhost:3000/api/azure-ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Привет, Домовёнок!"}],
    "useAzure": true,
    "assistantType": "domovenok"
  }'
```

## ✅ Проверка успешной настройки

Если всё настроено правильно, вы увидите:

1. **В интерфейсе**: Домовёнок отвечает дружелюбно с эмодзи
2. **В консоли**: Логи показывают "Azure OpenAI" как провайдер
3. **В ответе API**: Поле "assistant": "Домовёнок 🏠"

## 🚨 Устранение проблем

### Ошибка аутентификации (401/403)
```
🔑 Ошибка аутентификации. Проверьте Azure OpenAI ключи в настройках.
```
**Решение**: Проверьте правильность API ключа и endpoint URL

### Модель недоступна
```
🤖 Модель ИИ недоступна. Попробуйте позже.
```
**Решение**: Проверьте имя deployment модели в Azure

### Превышен лимит
```
⚠️ Превышен лимит запросов. Попробуйте через несколько минут.
```
**Решение**: Подождите или увеличьте квоту в Azure

## 🎛️ Дополнительные настройки

### Кастомизация личности домовенка

В `.env.local` можете изменить:
```bash
DOMOVENOK_PERSONALITY=professional  # friendly, professional, expert, casual
DOMOVENOK_SPECIALIZATION=designer   # realtor, designer, consultant
DOMOVENOK_MAX_TOKENS=2000          # Максимум токенов в ответе
DOMOVENOK_TEMPERATURE=0.8          # Креативность (0.0-1.0)
```

### Включение fallback на OpenAI

Добавьте в `.env.local`:
```bash
OPENAI_API_KEY=ваш_openai_ключ
```

## 🏠 Особенности Домовёнка

### Специальные возможности
- ✨ Дружелюбная личность с эмодзи
- 🏠 Экспертиза в недвижимости
- 🎨 Знания дизайна интерьера
- 🔨 Консультации по ремонту
- 💰 Инвестиционные советы

### Стили общения
- **Дружелюбный**: Теплое общение с эмодзи
- **Профессиональный**: Деловой стиль
- **Экспертный**: Технические детали
- **Простой**: Легкий для понимания

### Быстрые вопросы
Домовёнок предлагает готовые вопросы по категориям:
- Покупка квартиры
- Дизайн интерьера
- Ремонт и планирование
- Инвестиции

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в консоли браузера
2. Проверьте логи сервера в терминале
3. Убедитесь, что все переменные окружения установлены
4. Перезапустите сервер разработки

---

**Домовёнок готов помочь с любыми вопросами по недвижимости и дизайну! 🏠✨** 