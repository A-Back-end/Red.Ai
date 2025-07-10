/**
 * Domovenok AI Assistant Configuration
 * Настройки и конфигурация для AI-ассистента Домовёнок
 */

export interface DomovenokConfig {
  // Основные настройки
  assistantName: string
  defaultRole: string
  defaultStyle: string
  maxMessageLength: number
  
  // API настройки
  apiEndpoint: string
  maxTokens: number
  temperature: number
  
  // UI настройки
  showQuickQuestions: boolean
  enableFullscreen: boolean
  enableSettings: boolean
  enableRating: boolean
  
  // Функциональность
  enableMessageHistory: boolean
  enableMessageExport: boolean
  enableVoiceInput: boolean
  
  // Темы и стили
  theme: 'light' | 'dark' | 'auto'
  accentColor: string
  
  // Локализация
  language: 'ru' | 'en' | 'auto'
  
  // Лимиты
  maxHistoryLength: number
  rateLimitPerMinute: number
}

// Конфигурация по умолчанию
export const DEFAULT_CONFIG: DomovenokConfig = {
  // Основные настройки
  assistantName: 'Домовёнок',
  defaultRole: 'universal',
  defaultStyle: 'friendly',
  maxMessageLength: 4000,
  
  // API настройки
  apiEndpoint: '/api/azure-ai-chat',
  maxTokens: 1200,
  temperature: 0.7,
  
  // UI настройки
  showQuickQuestions: true,
  enableFullscreen: true,
  enableSettings: true,
  enableRating: true,
  
  // Функциональность
  enableMessageHistory: true,
  enableMessageExport: false,
  enableVoiceInput: false,
  
  // Темы и стили
  theme: 'auto',
  accentColor: 'purple',
  
  // Локализация
  language: 'ru',
  
  // Лимиты
  maxHistoryLength: 50,
  rateLimitPerMinute: 30
}

// Настройки для разных ролей
export const ROLE_CONFIGS = {
  realtor: {
    name: 'Риелтор',
    emoji: '🏠',
    color: 'blue',
    specialization: 'realtor',
    description: 'Эксперт по покупке, продаже и оценке недвижимости',
    suggestedQuestions: [
      'Как выбрать квартиру для покупки?',
      'На что обратить внимание при просмотре?',
      'Как оценить справедливую стоимость?',
      'Какие документы нужны для сделки?'
    ]
  },
  
  interior_designer: {
    name: 'Дизайнер интерьера',
    emoji: '🎨',
    color: 'purple',
    specialization: 'designer',
    description: 'Профессиональный дизайнер для создания уютных интерьеров',
    suggestedQuestions: [
      'Как создать уютный интерьер в маленькой квартире?',
      'Какие цвета выбрать для спальни?',
      'Как правильно зонировать студию?',
      'Современные тренды в дизайне интерьера'
    ]
  },
  
  renovation_expert: {
    name: 'Эксперт по ремонту',
    emoji: '🔨',
    color: 'orange',
    specialization: 'consultant',
    description: 'Специалист по планированию и бюджетированию ремонта',
    suggestedQuestions: [
      'Как составить бюджет на ремонт?',
      'С чего начать ремонт квартиры?',
      'Какие материалы лучше выбрать?',
      'Как планировать этапы ремонта?'
    ]
  },
  
  investment_advisor: {
    name: 'Инвестиционный консультант',
    emoji: '💰',
    color: 'green',
    specialization: 'consultant',
    description: 'Советник по инвестициям в недвижимость',
    suggestedQuestions: [
      'Стоит ли покупать квартиру для сдачи в аренду?',
      'Как выбрать районы для инвестиций?',
      'Какая доходность от аренды квартир?',
      'Риски инвестиций в недвижимость'
    ]
  },
  
  universal: {
    name: 'Универсальный консультант',
    emoji: '🏆',
    color: 'gradient',
    specialization: 'consultant',
    description: 'Все в одном: риелтор + дизайнер + консультант',
    suggestedQuestions: [
      'Как выбрать квартиру для покупки?',
      'Как создать уютный интерьер?',
      'Как спланировать ремонт?',
      'Стоит ли инвестировать в недвижимость?'
    ]
  }
}

// Настройки стилей общения
export const COMMUNICATION_STYLES = {
  friendly: {
    name: 'Дружелюбный',
    emoji: '😊',
    description: 'Теплое, неформальное общение с эмодзи',
    tone: 'casual',
    useEmoji: true,
    formalAddress: false
  },
  
  professional: {
    name: 'Профессиональный',
    emoji: '💼',
    description: 'Деловой, четкий стиль общения',
    tone: 'formal',
    useEmoji: false,
    formalAddress: true
  },
  
  expert: {
    name: 'Экспертный',
    emoji: '🎓',
    description: 'Глубокие знания с техническими деталями',
    tone: 'technical',
    useEmoji: false,
    formalAddress: true
  },
  
  casual: {
    name: 'Простой',
    emoji: '👋',
    description: 'Простой язык, легкий для понимания',
    tone: 'simple',
    useEmoji: true,
    formalAddress: false
  }
}

// Настройки цветовых тем
export const COLOR_THEMES = {
  purple: {
    primary: 'from-purple-500 to-blue-600',
    secondary: 'purple-500',
    accent: 'purple-100',
    dark: 'purple-900'
  },
  
  blue: {
    primary: 'from-blue-500 to-cyan-600',
    secondary: 'blue-500',
    accent: 'blue-100',
    dark: 'blue-900'
  },
  
  green: {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'green-500',
    accent: 'green-100',
    dark: 'green-900'
  },
  
  orange: {
    primary: 'from-orange-500 to-red-600',
    secondary: 'orange-500',
    accent: 'orange-100',
    dark: 'orange-900'
  }
}

// Настройки локализации
export const LOCALIZATION = {
  ru: {
    welcome: 'Привет! Меня зовут Домовёнок 🏠',
    placeholder: 'Спросите Домовёнка о недвижимости, дизайне или ремонте...',
    thinking: 'Домовёнок думает...',
    error: 'Произошла ошибка. Попробуйте ещё раз.',
    clearChat: 'Очистить чат',
    settings: 'Настройки',
    role: 'Роль ассистента',
    style: 'Стиль общения',
    quickQuestions: 'Популярные вопросы'
  },
  
  en: {
    welcome: 'Hello! My name is Domovenok 🏠',
    placeholder: 'Ask Domovenok about real estate, design or renovation...',
    thinking: 'Domovenok is thinking...',
    error: 'An error occurred. Please try again.',
    clearChat: 'Clear chat',
    settings: 'Settings',
    role: 'Assistant role',
    style: 'Communication style',
    quickQuestions: 'Popular questions'
  }
}

// Функции для работы с конфигурацией
export class DomovenokConfigManager {
  private config: DomovenokConfig
  
  constructor(customConfig?: Partial<DomovenokConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig }
  }
  
  // Получить текущую конфигурацию
  getConfig(): DomovenokConfig {
    return this.config
  }
  
  // Обновить конфигурацию
  updateConfig(updates: Partial<DomovenokConfig>): void {
    this.config = { ...this.config, ...updates }
  }
  
  // Получить конфигурацию роли
  getRoleConfig(roleId: string) {
    return ROLE_CONFIGS[roleId as keyof typeof ROLE_CONFIGS]
  }
  
  // Получить конфигурацию стиля
  getStyleConfig(styleId: string) {
    return COMMUNICATION_STYLES[styleId as keyof typeof COMMUNICATION_STYLES]
  }
  
  // Получить цветовую тему
  getColorTheme(themeId: string) {
    return COLOR_THEMES[themeId as keyof typeof COLOR_THEMES]
  }
  
  // Получить локализацию
  getLocalization(lang: string) {
    return LOCALIZATION[lang as keyof typeof LOCALIZATION]
  }
  
  // Валидация конфигурации
  validateConfig(): boolean {
    return (
      this.config.maxMessageLength > 0 &&
      this.config.maxTokens > 0 &&
      this.config.temperature >= 0 &&
      this.config.temperature <= 2 &&
      this.config.maxHistoryLength > 0 &&
      this.config.rateLimitPerMinute > 0
    )
  }
  
  // Сохранить конфигурацию в localStorage
  saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('domovenok-config', JSON.stringify(this.config))
    }
  }
  
  // Загрузить конфигурацию из localStorage
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('domovenok-config')
      if (saved) {
        try {
          const parsedConfig = JSON.parse(saved)
          this.config = { ...DEFAULT_CONFIG, ...parsedConfig }
        } catch (error) {
          console.error('Failed to load Domovenok config:', error)
        }
      }
    }
  }
  
  // Сбросить конфигурацию к значениям по умолчанию
  resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG }
  }
}

export default DomovenokConfigManager 