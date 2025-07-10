# 🔵 Azure OpenAI DALL-E 3 Integration Guide

## Overview

RED AI теперь поддерживает Azure OpenAI для генерации изображений с помощью DALL-E 3. Эта интеграция обеспечивает более стабильную работу, enterprise-grade безопасность и лучшую производительность для корпоративных клиентов.

## ✨ Features

- **Azure OpenAI DALL-E 3**: Полная интеграция с Azure OpenAI Service
- **HD Quality**: Поддержка как standard, так и HD качества
- **Smart Prompts**: Автоматическое улучшение промптов для интерьерного дизайна
- **Multiple Styles**: Поддержка различных стилей интерьера
- **Cost Tracking**: Отслеживание стоимости генерации
- **File Management**: Автоматическое сохранение изображений

## 🔧 Configuration

### Environment Variables

Добавьте следующие переменные в ваш `.env` файл:

```env
# === Azure OpenAI (Primary - for DALL-E 3) ===
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-04-01-preview
AZURE_DEPLOYMENT_NAME=dall-e-3
```

### Current Configuration

```
Endpoint: https://neuroflow-hub.openai.azure.com/
API Version: 2024-04-01-preview
Deployment: dall-e-3
Provider: Azure OpenAI Service
```

## 🚀 Usage

### API Endpoint

**POST** `/api/stable-diffusion-generator`

### Request Body

```typescript
interface AzureDalleRequest {
  prompt: string                    // Описание дизайна (обязательно)
  style?: string                   // Стиль интерьера
  roomType?: string               // Тип помещения
  budgetLevel?: string            // Уровень бюджета
  quality?: 'standard' | 'hd'     // Качество изображения
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  dalleStyle?: 'vivid' | 'natural' // Стиль DALL-E
}
```

### Example Request

```javascript
const response = await fetch('/api/stable-diffusion-generator', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: "Modern Scandinavian living room with natural light",
    style: "scandinavian",
    roomType: "living-room",
    budgetLevel: "medium",
    quality: "hd",
    size: "1024x1024",
    dalleStyle: "natural"
  }),
});
```

### Response Format

```typescript
interface AzureDalleResponse {
  success: boolean
  imageUrl: string
  base64Image: string
  metadata: {
    model: string
    deployment: string
    size: string
    quality: string
    style: string
    revisedPrompt: string
    timestamp: string
    endpoint: string
    enhancedPrompt: string
    originalPrompt: string
    settings: {
      style: string
      roomType: string
      budgetLevel: string
      quality: string
      size: string
      dalleStyle: string
    }
  }
  cost: {
    estimated: string
    model: string
    quality: string
  }
  timestamp: string
}
```

## 🎨 Supported Styles

| Style | Description |
|-------|-------------|
| `modern` | Sleek contemporary design with clean lines |
| `minimalist` | Clean simple design with neutral colors |
| `scandinavian` | Light woods, white walls, cozy textiles |
| `industrial` | Exposed brick walls, steel elements |
| `classic` | Timeless elegance, traditional furniture |
| `loft` | Open space, high ceilings, industrial elements |

## 🏠 Room Types

- `living-room` - Comfortable living space
- `bedroom` - Peaceful sleeping area
- `kitchen` - Functional cooking space
- `bathroom` - Spa-like modern fixtures
- `office` - Productive home office

## 💰 Budget Levels

- `low` - $500-$10,000 (budget-friendly furnishings)
- `medium` - $10,000-$20,000 (quality mid-range furniture)
- `high` - $20,000+ (luxury materials, premium designer furniture)

## 🔍 Quality Options

- `standard` - Standard quality ($0.04 per image)
- `hd` - High definition ($0.08 per image)

## 📊 Pricing

Azure OpenAI DALL-E 3 pricing:
- **Standard Quality**: $0.04 per image
- **HD Quality**: $0.08 per image

## 🧪 Testing

### 1. Web Interface

Откройте `/public/test-azure-dalle.html` для интерактивного тестирования:

```
http://localhost:3000/test-azure-dalle.html
```

### 2. API Testing

```bash
curl -X POST http://localhost:3000/api/stable-diffusion-generator \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Modern living room with natural light",
    "style": "modern",
    "roomType": "living-room",
    "budgetLevel": "medium",
    "quality": "hd"
  }'
```

### 3. Health Check

```bash
curl http://localhost:3000/api/stable-diffusion-generator
```

## 📁 File Structure

```
app/
├── api/
│   └── stable-diffusion-generator/
│       └── route.ts              # Stable Diffusion XL endpoint
public/
├── generated-images/             # Saved images
└── test-azure-dalle.html        # Test interface
```

## 🔄 Integration Points

### Design Studio

```typescript
// components/design-studio/DesignStudio.tsx
const response = await fetch('/api/stable-diffusion-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(designData)
});
```

### Dashboard

```typescript
// components/dashboard/FluxDesigner.tsx
const response = await fetch('/api/stable-diffusion-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(designData)
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Error**
   ```
   Error: Invalid API key
   ```
   **Solution**: Проверьте `AZURE_OPENAI_API_KEY` в `.env`

2. **Deployment Not Found**
   ```
   Error: Deployment 'dall-e-3' not found
   ```
   **Solution**: Убедитесь, что deployment существует в Azure OpenAI

3. **Content Policy**
   ```
   Error: Content policy violation
   ```
   **Solution**: Проверьте prompt на соответствие политикам Azure

4. **Rate Limiting**
   ```
   Error: Too many requests
   ```
   **Solution**: Подождите и повторите запрос

### Debug Mode

Включите debug logging для диагностики:

```typescript
console.log('🔵 Azure OpenAI Request:', requestData);
console.log('📝 Enhanced Prompt:', enhancedPrompt);
console.log('✅ Response:', response);
```

## 🔐 Security

### Best Practices

1. **Environment Variables**: Никогда не храните API ключи в коде
2. **HTTPS**: Используйте HTTPS для production
3. **Rate Limiting**: Implement rate limiting for public endpoints
4. **Input Validation**: Validate all user inputs
5. **Error Handling**: Don't expose sensitive information in errors

### Azure Security Features

- **Managed Identity**: Поддержка Azure AD authentication
- **Private Endpoints**: Secure network connectivity
- **Content Filtering**: Built-in content safety
- **Audit Logging**: Complete audit trail

## 📈 Monitoring

### Metrics to Track

- Generation success rate
- Average generation time
- API response times
- Error rates by type
- Cost per generation
- User engagement

### Logging

```typescript
console.log('🔵 Starting Azure OpenAI DALL-E generation...');
console.log('🎨 Generating image with Azure OpenAI DALL-E 3...');
console.log('✅ Azure DALL-E 3 generation completed successfully!');
console.log('❌ Azure DALL-E 3 generation failed:', error);
```

## 🚀 Performance Tips

1. **Caching**: Cache generated images to avoid regeneration
2. **Background Processing**: Use background jobs for large batches
3. **CDN**: Use CDN for image delivery
4. **Compression**: Optimize image sizes
5. **Preloading**: Preload common design templates

## 🔄 Migration from OpenAI

Если мигрируете с обычного OpenAI API:

1. Update endpoint from `/api/dalle-generator` to `/api/azure-dalle-generator`
2. Add Azure environment variables
3. Update import statements to use `AzureOpenAI`
4. Test with new endpoint

## 📚 Resources

- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [DALL-E 3 API Reference](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/reference#image-generation)
- [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)

## 🆘 Support

Если у вас возникли проблемы:

1. Проверьте `.env` файл
2. Убедитесь, что deployment активен в Azure
3. Проверьте лимиты Azure OpenAI
4. Посмотрите логи в консоли браузера
5. Протестируйте с помощью `test-azure-dalle.html` 