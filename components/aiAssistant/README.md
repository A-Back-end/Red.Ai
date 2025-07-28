# Interactive AI Assistant Component

## 📋 Описание

Интерактивный веб-компонент AI-ассистента с поддержкой двух языков (английский и русский). Компонент предоставляет современный интерфейс чата с автоматическим определением языка и панелью быстрых команд.

## ✨ Основные функции

### 🌐 Выбор языка
- **Начальный экран**: При первой загрузке показывается экран выбора языка
- **Двуязычность**: Поддержка английского и русского языков
- **Автоприветствие**: После выбора языка ассистент отправляет приветственное сообщение

### 💬 Чат-интерфейс
- **История сообщений**: Сохранение и отображение всей переписки
- **Автоскролл**: Автоматическая прокрутка к новым сообщениям
- **Индикатор загрузки**: Анимированный индикатор при обработке запроса
- **Временные метки**: Отображение времени для каждого сообщения

### ⚡ Быстрые команды
- **Панель команд**: 5 предустановленных команд на английском языке:
  - "Explain this code"
  - "Refactor this function"
  - "Find potential bugs"
  - "Write documentation for this"
  - "Generate unit tests"
- **Быстрый ввод**: Клик по команде автоматически отправляет ее в чат

### 🧠 Умное определение языка
- **Автоматическое определение**: Анализ языка входящих сообщений
- **Адаптивные ответы**: Ответы на том же языке, что и запрос пользователя

## 🛠 Технические характеристики

### Технологии
- **React 18** с TypeScript
- **Tailwind CSS** для стилизации
- **Lucide Icons** для иконок
- **Next.js** совместимость

### Структура состояния
```typescript
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type Language = 'en' | 'ru' | null;

// Основные состояния
const [languageSelected, setLanguageSelected] = useState<boolean>(false);
const [currentLanguage, setCurrentLanguage] = useState<Language>(null);
const [messages, setMessages] = useState<Message[]>([]);
const [inputText, setInputText] = useState<string>('');
const [isLoading, setIsLoading] = useState<boolean>(false);
```

### Архитектура компонентов
1. **InteractiveAIAssistant** (основной компонент)
   - **LanguageSelector** (экран выбора языка)
   - **ChatInterface** (интерфейс чата)

## 📱 Пользовательский опыт (UX)

### Сценарий использования
1. **Запуск**: Пользователь видит экран выбора языка
2. **Выбор языка**: Клик на "English" или "Русский"
3. **Приветствие**: Ассистент отправляет приветственное сообщение
4. **Взаимодействие**: Пользователь может:
   - Печатать сообщения и отправлять их кнопкой или Enter
   - Использовать быстрые команды
   - Получать ответы на выбранном языке

### Адаптивность
- **Мобильные устройства**: Responsive дизайн для всех экранов
- **Доступность**: Поддержка клавиатурной навигации
- **Производительность**: Оптимизированные ре-рендеры и состояние

## 🚀 Использование

### Импорт компонента
```tsx
import InteractiveAIAssistant from '@/components/aiAssistant/InteractiveAIAssistant';

export default function MyPage() {
  return (
    <div className="w-full h-screen">
      <InteractiveAIAssistant />
    </div>
  );
}
```

### Демо-страница
Для тестирования компонента доступна демо-страница: `/ai-assistant-demo`

## 🔧 Настройка и расширение

### Добавление новых быстрых команд
```typescript
const QUICK_COMMANDS = [
  "Explain this code",
  "Refactor this function", 
  "Find potential bugs",
  "Write documentation for this",
  "Generate unit tests",
  // Добавьте свои команды здесь
  "Your custom command"
];
```

### Подключение реального AI API
Замените функцию `generateAIResponse` на реальный API:

```typescript
const generateAIResponse = async (userMessage: string, detectedLang: 'en' | 'ru'): Promise<string> => {
  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: userMessage, 
      language: detectedLang 
    })
  });
  
  const data = await response.json();
  return data.response;
};
```

### Кастомизация стилей
Компонент использует Tailwind CSS классы. Основные цветовые схемы:
- **Синий** (`blue-600`): Основной цвет интерфейса
- **Красный** (`red-600`): Кнопка русского языка
- **Серый** (`gray-*`): Нейтральные элементы

## 📋 TODO / Возможные улучшения

- [ ] Интеграция с реальным AI API (OpenAI, Azure AI, и т.д.)
- [ ] Сохранение истории чата в localStorage
- [ ] Поддержка markdown в сообщениях
- [ ] Загрузка файлов и изображений
- [ ] Голосовой ввод и вывод
- [ ] Темная тема
- [ ] Больше языков (испанский, французский, и т.д.)
- [ ] Настраиваемые аватары для пользователя и ассистента
- [ ] Экспорт истории чата

## 🐛 Известные ограничения

1. **Симуляция AI**: В данный момент используется симуляция ответов
2. **Простое определение языка**: Базовая эвристика по кириллице
3. **Отсутствие персистентности**: История чата не сохраняется между сессиями

## 📄 Лицензия

Компонент создан в рамках проекта Red.AI и следует общей лицензии проекта. 