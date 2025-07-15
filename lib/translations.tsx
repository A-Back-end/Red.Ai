'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Типы для языков
export type Language = 'en' | 'ru'

// Тип для ключей переводов
export type TranslationKey = keyof typeof translations.en

// Интерфейс контекста переводов
interface TranslationsContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  translations: typeof translations.en // or .ru, structure is the same
}

// Объект переводов
export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    aiAssistant: 'AI Assistant',
    designStudio: 'Design Studio',
    imageGenerator: 'Image Generator',
    myProjects: 'My Projects',
    settings: 'Settings',
    logout: 'Logout',
    nav_features: 'Features',
    nav_how_it_works: 'How It Works',
    nav_pricing: 'Pricing',
    nav_contact: 'Contact',
    nav_get_started: 'Get Started',
    
    // Hero section
    hero_badge: 'AI-Powered Platform',
    hero_title: 'The Future of Real Estate is Here',
    hero_subtitle: 'Smart AI platform for real estate search, floor plan analysis, and interior design.',
    hero_btn_primary: 'Get Started',
    hero_btn_secondary: 'Learn More',
    heroTitle: 'The Future of Real Estate is Here',
    heroSubtitle: 'Smart AI platform for real estate search, floor plan analysis, and interior design.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Features
    featuresTitle: 'Revolutionary Features',
    aiPowered: 'AI-Powered Analysis',
    smartDesign: 'Smart Design',
    instantResults: 'Instant Results',
    
    // Pricing
    pricingTitle: 'Choose Your Plan',
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
    
    // Dashboard
    welcome: 'Welcome',
    totalProjects: 'Total Projects',
    completedAnalyses: 'Completed Analyses',
    savedDesigns: 'Saved Designs',
    
    // AI Assistant
    assistant_greeting: 'Hello! I\'m your AI renovation assistant. How can I help you today?',
    prompt_raw_apartment: 'I have a raw apartment, where to start?',
    prompt_choose_style: 'Help me choose a design style',
    prompt_calculate_budget: 'Calculate renovation budget',
    prompt_best_materials: 'What are the best materials?',
    prompt_layout_zoning: 'Help with layout and zoning',
    prompt_investment_potential: 'Assess investment potential',
    
    // Categories
    category_general: 'General',
    category_design: 'Design',
    category_renovation: 'Renovation',
    category_budget: 'Budget',
    category_real_estate: 'Real Estate',
    
    // Common actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    upload: 'Upload',
    download: 'Download',
    
    // Theme and language
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    
    // Footer
    footer_resources: 'Resources',
    footer_documentation: 'Documentation',
    footer_help_center: 'Help Center',
    footer_blog: 'Blog',
    footer_community: 'Community',
    footer_rights: '© 2024 RED AI. All rights reserved.',
    
    // Settings page
    profile: 'Profile',
    appearance: 'Appearance',
    theme: 'Theme',
    apiSettings: 'API Settings',
    appSettings: 'App Settings',
    usage: 'Usage',
    notifications: 'Notifications',
    autoSave: 'Auto Save',
    highQuality: 'High Quality',
    projectsCreated: 'Projects Created',
    imagesGenerated: 'Images Generated',
    creditsUsed: 'Credits Used',
    apiKeySaved: 'API key saved successfully!',
    languageChanged: 'Language changed successfully!',
    apiKeyDescription: 'Your API key is stored locally and never shared',
    
    // FluxDesigner
    uploadMainImage: 'Upload Main Image',
    add2DElements: 'Add 2D Elements',
    generationSettings: 'Generation Settings',
    startByUploading: 'Start by uploading your main room image',
    uploadAdditionalElements: 'Upload additional 2D elements (furniture, decorations)',
    clickToChange: 'Click to change image',
    dragDrop: 'Drag & drop your files here',
    browseFiles: 'browse files',
    supports: 'Supports JPG, PNG, WebP up to 10MB',
    createStunning: 'Create stunning interior designs with AI',
    
    // Common
    saved: 'Saved',
    projects: 'Projects',
  },
  ru: {
    // Navigation
    dashboard: 'Панель управления',
    aiAssistant: 'ИИ Ассистент',
    designStudio: 'Дизайн Студия',
    imageGenerator: 'Генератор изображений',
    myProjects: 'Мои проекты',
    settings: 'Настройки',
    logout: 'Выйти',
    nav_features: 'Функции',
    nav_how_it_works: 'Как это работает',
    nav_pricing: 'Цены',
    nav_contact: 'Контакты',
    nav_get_started: 'Начать',
    
    // Hero section
    hero_badge: 'ИИ-Платформа',
    hero_title: 'Будущее недвижимости уже здесь',
    hero_subtitle: 'Умная ИИ платформа для поиска недвижимости, анализа планировок и дизайна интерьера.',
    hero_btn_primary: 'Начать',
    hero_btn_secondary: 'Узнать больше',
    heroTitle: 'Будущее недвижимости уже здесь',
    heroSubtitle: 'Умная ИИ платформа для поиска недвижимости, анализа планировок и дизайна интерьера.',
    getStarted: 'Начать',
    learnMore: 'Узнать больше',
    
    // Features
    featuresTitle: 'Революционные возможности',
    aiPowered: 'ИИ-анализ',
    smartDesign: 'Умный дизайн',
    instantResults: 'Мгновенные результаты',
    
    // Pricing
    pricingTitle: 'Выберите тариф',
    free: 'Бесплатно',
    pro: 'Про',
    enterprise: 'Корпоративный',
    
    // Dashboard
    welcome: 'Добро пожаловать',
    totalProjects: 'Всего проектов',
    completedAnalyses: 'Завершенных анализов',
    savedDesigns: 'Сохраненных дизайнов',
    
    // AI Assistant
    assistant_greeting: 'Привет! Я ваш ИИ-ассистент по ремонту. Как я могу помочь?',
    prompt_raw_apartment: 'У меня голая квартира, с чего начать?',
    prompt_choose_style: 'Помогите выбрать стиль дизайна',
    prompt_calculate_budget: 'Рассчитать бюджет ремонта',
    prompt_best_materials: 'Какие лучшие материалы?',
    prompt_layout_zoning: 'Помощь с планировкой и зонированием',
    prompt_investment_potential: 'Оценить инвестиционный потенциал',
    
    // Categories
    category_general: 'Общие',
    category_design: 'Дизайн',
    category_renovation: 'Ремонт',
    category_budget: 'Бюджет',
    category_real_estate: 'Недвижимость',
    
    // Common actions
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    upload: 'Загрузить',
    download: 'Скачать',
    
    // Theme and language
    darkMode: 'Темная тема',
    lightMode: 'Светлая тема',
    language: 'Язык',
    
    // Auth
    signIn: 'Войти',
    signUp: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Подтвердить пароль',
    firstName: 'Имя',
    lastName: 'Фамилия',
    
    // Footer
    footer_resources: 'Ресурсы',
    footer_documentation: 'Документация',
    footer_help_center: 'Центр поддержки',
    footer_blog: 'Блог',
    footer_community: 'Сообщество',
    footer_rights: '© 2024 RED AI. Все права защищены.',
    
    // Settings page
    profile: 'Профиль',
    appearance: 'Внешний вид',
    theme: 'Тема',
    apiSettings: 'Настройки API',
    appSettings: 'Настройки приложения',
    usage: 'Использование',
    notifications: 'Уведомления',
    autoSave: 'Автосохранение',
    highQuality: 'Высокое качество',
    projectsCreated: 'Создано проектов',
    imagesGenerated: 'Сгенерировано изображений',
    creditsUsed: 'Использовано кредитов',
    apiKeySaved: 'API ключ успешно сохранен!',
    languageChanged: 'Язык успешно изменен!',
    apiKeyDescription: 'Ваш API ключ хранится локально и не передается',
    
    // FluxDesigner
    uploadMainImage: 'Загрузить основное изображение',
    add2DElements: 'Добавить 2D элементы',
    generationSettings: 'Настройки генерации',
    startByUploading: 'Начните с загрузки изображения комнаты',
    uploadAdditionalElements: 'Загрузите дополнительные 2D элементы (мебель, декор)',
    clickToChange: 'Нажмите чтобы изменить',
    dragDrop: 'Перетащите файлы сюда',
    browseFiles: 'выбрать файлы',
    supports: 'Поддерживает JPG, PNG, WebP до 10МБ',
    createStunning: 'Создавайте потрясающие дизайны интерьера с ИИ',
    
    // Common
    saved: 'Сохраненные',
    projects: 'Проекты',
  }
}

// Создаем контекст
const TranslationsContext = createContext<TranslationsContextType | undefined>(undefined)

// Интерфейс пропсов для TranslationsProvider
interface TranslationsProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

// TranslationsProvider компонент
export function TranslationsProvider({ 
  children, 
  defaultLanguage = 'en' 
}: TranslationsProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)

  // Функция для установки языка
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    
    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage)
      
      // Обновляем lang атрибут документа
      document.documentElement.lang = newLanguage
    }
  }

  // Функция для получения перевода
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  // Инициализация языка при монтировании компонента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Проверяем сохраненный язык в localStorage
      const savedLanguage = localStorage.getItem('language') as Language | null
      
      // Если есть сохраненный язык, используем его
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
        setLanguage(savedLanguage)
      } else {
        // Иначе проверяем языковые настройки браузера
        const browserLanguage = navigator.language.toLowerCase()
        const detectedLanguage = browserLanguage.includes('ru') ? 'ru' : 'en'
        setLanguage(detectedLanguage)
      }
    }
  }, [])

  const value = {
    language,
    setLanguage,
    t,
    translations: translations[language]
  }

  return <TranslationsContext.Provider value={value}>{children}</TranslationsContext.Provider>
}

// Хук для использования переводов
export function useTranslations(): TranslationsContextType {
  const context = useContext(TranslationsContext)
  if (context === undefined) {
    throw new Error('useTranslations must be used within a TranslationsProvider')
  }
  return context
}

// Экспорт типов для использования в других компонентах
export type { TranslationsContextType } 