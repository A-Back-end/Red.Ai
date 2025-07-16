# 🚀 BFL.ai API Optimization - Исправление проблемы с длинными промптами

## ❌ Проблема
При генерации дизайна через BFL.ai API происходили ошибки:
- `TypeError: fetch failed` с причиной `other side closed`
- Запросы выполнялись 7+ секунд и затем обрывались
- Слишком длинные и подробные промпты (500+ символов)

## ✅ Решения

### 1. Оптимизация промптов (utils/promptGenerator.ts)

#### ❌ Было (длинный промпт):
```
Create a photorealistic render in SketchUp style with characteristic clean lines...

STYLE: Contemporary modern style with clean geometric lines...
USER REQUEST: "Сделай мне ремонт"
BUDGET CONSTRAINT ($5000): Хороший функциональный дизайн...
- Materials: качественная краска, акцентные обои...
- Furniture level: полный набор мебели...
FUNCTIONAL REQUIREMENTS: comfortable seating arrangement...
VISUAL QUALITY REQUIREMENTS:
- Photorealistic rendering with accurate lighting...
TECHNICAL SPECIFICATIONS:
- High resolution, professional quality...
BUDGET COMPLIANCE:
- All furniture and materials must be appropriate...
```
**Длина: ~1500+ символов**

#### ✅ Стало (краткий промпт):
```
Photorealistic SketchUp-style render of living-room in modern style. Сделай мне ремонт. Budget: $5000 (mid-range). Professional quality, realistic lighting, clean composition.
```
**Длина: ~150 символов (в 10 раз короче!)**

### 2. Улучшенная обработка ошибок (app/api/generate-design/route.ts)

#### Добавлено:
- ✅ **Retry логика** - до 3 попыток с экспоненциальной задержкой
- ✅ **Короткие тайм-ауты** - 15 секунд вместо 30
- ✅ **Логирование длины промпта** для мониторинга
- ✅ **Различная обработка 4xx и 5xx ошибок**
- ✅ **Понятные сообщения об ошибках** для пользователей

#### Логика retry:
```typescript
for (let attempt = 0; attempt <= maxRetries; attempt++) {
  try {
    // Попытка запроса с тайм-аутом 15 секунд
    // Если успех - возвращаем результат
    // Если 4xx ошибка - не повторяем
    // Если 5xx ошибка или тайм-аут - повторяем
  } catch (error) {
    // Экспоненциальная задержка: 1s, 2s, 4s
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
  }
}
```

### 3. Новые функции

#### Краткие описания:
- `getShortVisualizationType()` - короткие типы визуализации
- `getBudgetLevel()` - краткие уровни бюджета (basic, mid-range, premium, luxury)
- `generateDetailedPrompt()` - альтернативная функция для случаев, когда нужно больше деталей

## 🧪 Тестирование

### Сравнение длины промптов:
| Параметры | Старый промпт | Новый промпт | Сокращение |
|-----------|---------------|--------------|------------|
| "Сделай ремонт", modern, $5000 | ~1500 символов | ~150 символов | **90%** |
| "Спальня в скандинавском стиле", $10000 | ~1600 символов | ~160 символов | **90%** |

### Что тестировать:
1. ✅ Короткие промпты работают быстрее
2. ✅ Retry логика при тайм-аутах
3. ✅ Понятные сообщения об ошибках
4. ✅ Логирование в консоли для отладки

## 🔧 Мониторинг

### Лог-сообщения для отслеживания:
```
[Generate API] Prompt length: 150 characters  // Мониторинг длины
[Generate API] Sending request to BFL.ai (attempt 1/3)...  // Попытки
[Generate API] Request 1 timed out after 15 seconds  // Тайм-ауты
[Generate API] Retrying in 2000ms...  // Retry логика
```

### Ожидаемые улучшения:
- ⚡ **Скорость**: Запросы выполняются за 2-5 секунд вместо 7+
- 🔄 **Надежность**: Retry при временных сбоях BFL.ai
- 📊 **Мониторинг**: Детальные логи для отладки
- 👥 **UX**: Понятные сообщения об ошибках

## 🚀 Следующие шаги

1. Протестируйте новую генерацию дизайна
2. Мониторьте логи на предмет тайм-аутов  
3. При необходимости можно использовать `generateDetailedPrompt()` для особых случаев
4. Рассмотрите возможность кеширования успешных результатов

Теперь BFL.ai API должен работать стабильно и быстро! 🎉 