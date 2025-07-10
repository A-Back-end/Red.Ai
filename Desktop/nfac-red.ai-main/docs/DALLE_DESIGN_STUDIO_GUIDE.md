# DALL-E Design Studio Integration Guide

## 🎨 Overview

Design Studio теперь интегрирован с DALL-E 3 для автоматической генерации интерьерных дизайнов на основе пользовательских промптов и настроек.

## ✨ Features

- **AI-Powered Generation**: Использует DALL-E 3 для создания высококачественных интерьерных дизайнов
- **Smart Prompts**: Автоматически улучшает пользовательские промпты для лучших результатов
- **Style Integration**: Учитывает стиль квартиры, тип комнаты и бюджет
- **High Quality**: Генерирует изображения в HD качестве (1024x1024)
- **Download & View**: Возможность просмотра в полном размере и скачивания

## 🚀 How to Use

### 1. Navigate to Design Studio
Откройте Design Studio через:
- Dashboard → Design Studio tab
- Или прямой переход на `/design-studio` страницу

### 2. Step-by-Step Process

#### Step 1: Upload Main Image
- Загрузите основное изображение интерьера
- Поддерживаемые форматы: JPG, PNG, WebP
- Drag & drop или выбор файла

#### Step 2: Add 2D Elements (Optional)
- Добавьте дополнительные элементы (мебель, растения)
- Множественный выбор файлов
- Предварительный просмотр и удаление

#### Step 3: Generation Settings
Заполните настройки генерации:

**Prompt*** (обязательно):
- Основное поле для описания дизайна
- Будьте конкретны в описании стиля, цветов, элементов
- Пример: "Modern living room with scandinavian furniture, bright colors, natural lighting"

**Inspiration Weight**:
- Low: Больше креативности AI
- Medium: Сбалансированный подход (рекомендуется)
- High: Строже следует промпту

**Design Type**:
- Professional Design
- Modern Design  
- Minimalist Design

**Apartment Style**:
- Modern, Minimalist, Classic, Loft

**Room Type**:
- Living Room, Bedroom, Kitchen, Bathroom

**Budget**:
- Влияет на качество и тип мебели в генерации
- $500 - $50,000 диапазон

### 3. Generate Design
- Нажмите "Finish & Generate"
- Ожидайте 10-30 секунд для генерации
- Результат появится снизу

## 🛠 API Configuration

### Environment Variables
Добавьте в `.env.local`:

```env
# OpenAI API Key for DALL-E 3
OPENAI_API_KEY=your_openai_api_key_here
```

### Get OpenAI API Key
1. Зайдите на [platform.openai.com](https://platform.openai.com)
2. Создайте аккаунт или войдите
3. Перейдите в API Keys section
4. Создайте новый ключ
5. Скопируйте и добавьте в `.env.local`

## 📂 File Structure

```
components/
├── design-studio/
│   ├── DesignStudio.tsx          # Основной компонент с генерацией
│   ├── Step1Upload.tsx           # Загрузка изображения
│   ├── Step2Elements.tsx         # Дополнительные элементы
│   ├── Step3Settings.tsx         # Настройки генерации
│   └── Stepper.tsx              # Прогресс бар
├── dashboard/
│   └── FluxDesigner.tsx         # Дашборд версия
└── ui/                          # UI компоненты

app/api/
└── dalle-generator/
    └── route.ts                 # DALL-E API endpoint

public/
└── generated-images/            # Сохраненные изображения
```

## 🎯 Features Details

### Enhanced Prompt Generation
API автоматически улучшает пользовательские промпты:

```typescript
// Пример улучшения промпта
Input: "modern living room"
Output: "Interior design: modern living room
Style: sleek contemporary design with clean lines, premium materials
Room: comfortable living room with seating area, entertainment space
Budget: quality mid-range furniture, balanced investment
Professional interior photography, high-quality realistic render..."
```

### Image Quality Settings
- **Quality**: HD (высокое качество)
- **Size**: 1024x1024 (квадратный формат)
- **Style**: Natural (естественный стиль)
- **Model**: DALL-E 3 (последняя версия)

### Budget Integration
Бюджет влияет на описание мебели:
- **Low** ($500-$10,000): Budget-friendly, affordable pieces
- **Medium** ($10,000-$20,000): Quality mid-range furniture
- **High** ($20,000+): Luxury materials, premium designer furniture

## 🔧 Troubleshooting

### Common Issues

**"OpenAI API key not configured"**
- Проверьте `.env.local` файл
- Убедитесь что OPENAI_API_KEY установлен
- Перезапустите сервер разработки

**"Failed to generate image"**
- Проверьте баланс OpenAI аккаунта
- Убедитесь что API ключ действителен
- Проверьте prompt на недопустимый контент

**"Failed to save image"**
- Убедитесь что папка `public/generated-images` существует
- Проверьте права доступа к файловой системе

### API Rate Limits
- DALL-E 3: 50 запросов в минуту
- HD качество: $0.080 за изображение
- Standard качество: $0.040 за изображение

## 🎨 Best Practices

### Writing Effective Prompts
1. **Be Specific**: "Scandinavian living room with white walls" лучше чем "nice room"
2. **Include Style**: Всегда указывайте стиль дизайна
3. **Mention Colors**: Укажите цветовую палитру
4. **Add Details**: Освещение, текстуры, материалы
5. **Room Function**: Опишите функциональность пространства

### Example Prompts

**Living Room**:
```
"Modern Scandinavian living room with white walls, light wood floors, 
minimal furniture, cozy textiles, large windows with natural light, 
green plants, neutral color palette with warm accents"
```

**Bedroom**:
```
"Minimalist bedroom with platform bed, white linens, wooden nightstands, 
soft ambient lighting, large mirror, organized closet space, 
calming neutral tones, modern design"
```

**Kitchen**:
```
"Contemporary kitchen with white cabinets, marble countertops, 
stainless steel appliances, subway tile backsplash, pendant lighting, 
kitchen island with bar stools, clean modern design"
```

## 📊 Usage Analytics

Generated images are saved with metadata:
- Generation timestamp
- Used settings (style, room type, budget)
- Original and enhanced prompts
- Model information

## 🚀 Future Enhancements

Планируемые улучшения:
- [ ] Множественная генерация (2-4 варианта)
- [ ] Интеграция с загруженными изображениями
- [ ] Больше стилей и настроек
- [ ] История генераций
- [ ] Сохранение в профиль пользователя
- [ ] Социальное разделение результатов

## 📱 Mobile Support

Design Studio полностью адаптирован для мобильных устройств:
- Responsive дизайн
- Touch-friendly интерфейс
- Optimized для всех размеров экранов

## 🔒 Security

- API ключи защищены server-side
- Изображения сохраняются локально
- Нет передачи персональных данных в OpenAI
- Rate limiting для предотвращения злоупотреблений

---

**Поддержка**: Если у вас есть вопросы или проблемы, создайте issue в репозитории или обратитесь к команде разработки. 