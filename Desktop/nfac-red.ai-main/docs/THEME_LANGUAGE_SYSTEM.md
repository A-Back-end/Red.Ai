# Система тем и языков RED AI

## Обзор

Реализована полноценная система переключения тем (светлая/темная) и языков (русский/английский) для всего приложения RED AI.

## Архитектура

### ThemeProvider (`lib/theme-context.tsx`)

Центральный контекст для управления темами и переводами:

```typescript
interface ThemeContextType {
  theme: Theme                // 'light' | 'dark'
  language: Language          // 'en' | 'ru'
  toggleTheme: () => void     // Переключение темы
  toggleLanguage: () => void  // Переключение языка
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
}
```

### Хуки

- `useTheme()` - Управление темой и языком
- `useTranslation()` - Получение переводов

## Переводы

### Структура переводов

```typescript
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    aiAssistant: 'AI Assistant',
    designStudio: 'Design Studio',
    // ... остальные переводы
  },
  ru: {
    // Navigation  
    dashboard: 'Панель управления',
    aiAssistant: 'ИИ Ассистент',
    designStudio: 'Дизайн Студия',
    // ... остальные переводы
  }
}
```

### Использование

```typescript
const { t } = useTranslation()

// В компоненте
<h1>{t('designStudio')}</h1>
```

## Темы

### Поддерживаемые темы

- **Dark Theme** (по умолчанию): Темная тема с градиентами slate-900 → blue-900
- **Light Theme**: Светлая тема с градиентами slate-50 → blue-50

### Применение тем

Темы применяются через:
1. CSS классы `dark` и `light` на `document.documentElement`
2. Tailwind CSS модификаторы `dark:` и `light:`
3. Градиентные фоны для различных секций

## Обновленные компоненты

### 1. Design Studio (`components/dashboard/FluxDesigner.tsx`)

**Изменения:**
- ✅ Обновлен фон: `from-slate-900 via-blue-900 to-slate-900`
- ✅ Убрана ссылка на YouTube, заменена на общую ссылку
- ✅ Заменен "Inspiration Weight" на "Design"
- ✅ Кнопки: 3D, SketchUp, Rooming (вместо Low/Medium/High)
- ✅ Полная поддержка русского/английского языков

**Этапы:**
1. **Загрузка основного изображения** - Drag & drop с предпросмотром
2. **Добавление 2D элементов** - Множественная загрузка файлов  
3. **Настройки генерации** - Полный набор настроек с переводами

### 2. Dashboard (`components/dashboard/AuthenticatedDashboard.tsx`)

**Изменения:**
- ✅ Градиентный фон как у верхней панели
- ✅ Кнопки переключения темы и языка в топ-баре
- ✅ Переведены все навигационные элементы
- ✅ Поддержка светлой/темной темы для sidebar и всех панелей

### 3. AI Assistant (`components/dashboard/AdvancedAIAssistant.tsx`)

**Изменения:**
- ✅ Переведены приветственные сообщения
- ✅ Локализованы ошибки и системные сообщения
- ✅ Обновлен placeholder для поля ввода

## Переключение тем и языков

### Кнопки управления

В правом верхнем углу dashboard:

```typescript
// Кнопка языка
<Button onClick={toggleLanguage}>
  {language === 'en' ? 'RU' : 'EN'}
</Button>

// Кнопка темы  
<Button onClick={toggleTheme}>
  {theme === 'dark' ? <Sun /> : <Moon />}
</Button>
```

### Сохранение настроек

Настройки сохраняются в `localStorage`:
- `theme` - текущая тема
- `language` - текущий язык

## Дизайн-система

### Цветовая палитра

**Темная тема:**
```css
/* Фоны */
bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
bg-slate-900/50  /* Полупрозрачные панели */
bg-slate-800/50  /* Карточки */

/* Границы */
border-slate-700/50

/* Текст */
text-white       /* Основной */
text-gray-400    /* Вторичный */
text-gray-500    /* Приглушенный */
```

**Светлая тема:**
```css
/* Фоны */
bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50
bg-white         /* Панели */
bg-slate-50      /* Карточки */

/* Границы */
border-slate-200

/* Текст */
text-slate-900   /* Основной */
text-slate-600   /* Вторичный */
text-slate-500   /* Приглушенный */
```

### Акцентные цвета

Остаются неизменными для обеих тем:
- **Cyan**: `from-cyan-500 to-blue-600` (Design Studio)
- **Purple**: `from-purple-500 to-pink-600` (2D Elements)  
- **Emerald**: `from-emerald-500 to-teal-600` (Settings)

## Использование

### Инициализация

В `app/layout.tsx` приложение обернуто в `ThemeProvider`:

```typescript
<ThemeProvider>
  {children}
</ThemeProvider>
```

### В компонентах

```typescript
import { useTheme, useTranslation } from '@/lib/theme-context'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  
  return (
    <div className="bg-white dark:bg-slate-900">
      <h1>{t('myTitle')}</h1>
      <button onClick={toggleTheme}>
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </div>
  )
}
```

## Будущие улучшения

- [ ] Добавить больше языков (китайский, испанский)
- [ ] Создать автоматическое определение языка браузера
- [ ] Добавить анимации переходов между темами
- [ ] Реализовать кастомные цветовые схемы
- [ ] Добавить высококонтрастную тему для доступности 