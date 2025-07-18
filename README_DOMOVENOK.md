# 🏠 Домовёнок ИИ Ассистент - Быстрый старт

## 🚀 Настройка Azure ключей (2 минуты)

### 1. Создайте .env.local файл
```bash
cp azure-config-example.env .env.local
```

### 2. Замените ключи в .env.local
```bash
# Замените эти значения на ваши реальные ключи:
AZURE_OPENAI_API_KEY=ваш_реальный_azure_ключ
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
```

**Примеры:**
- API Key: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- Endpoint: `https://mycompany-openai.openai.azure.com/`

### 3. Запустите сервер
```bash
npm run dev
```

### 4. Протестируйте домовенка
```bash
node test-domovenok-azure.js
```

## 🎯 Быстрый тест в браузере

1. Откройте: http://localhost:3000/dashboard
2. Найдите компонент "Домовёнок ИИ Ассистент"
3. Отправьте: "Привет, Домовёнок!"

## ✅ Признаки успешной настройки

- ✅ Домовёнок отвечает дружелюбно с эмодзи 🏠
- ✅ В консоли: "Azure OpenAI" как провайдер
- ✅ Нет ошибок аутентификации

## 🚨 Решение проблем

**Ошибка 401/403:** Проверьте API ключ
**Модель недоступна:** Проверьте deployment name
**Сервер не запущен:** Выполните `npm run dev`

## 📖 Подробная документация

- [DOMOVENOK_AZURE_SETUP.md](DOMOVENOK_AZURE_SETUP.md) - Полная инструкция
- [azure-config-example.env](azure-config-example.env) - Пример конфигурации

---

**Домовёнок готов помочь с недвижимостью и дизайном! 🏠✨** 