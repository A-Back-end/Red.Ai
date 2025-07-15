'use client'

import { Language } from './translations'

export type Theme = 'light' | 'dark'

/**
 * Инициализация глобальной системы синхронизации тем
 */
export function initThemeSync(): void {
  if (typeof window === 'undefined') return

  // Загружаем сохраненные настройки
  const savedTheme = getSavedTheme()
  const savedLanguage = getSavedLanguage()

  // Применяем тему к DOM
  applyThemeToDOM(savedTheme)
  
  // Применяем язык к DOM
  applyLanguageToDOM(savedLanguage)

  console.log('🎨 Theme sync system initialized', { 
    theme: savedTheme, 
    language: savedLanguage 
  })
}

/**
 * Получить сохраненную тему из localStorage
 */
export function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  
  const saved = localStorage.getItem('theme') as Theme | null
  if (saved && (saved === 'light' || saved === 'dark')) {
    return saved
  }

  // Определяем системную тему
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light'
  
  return systemTheme
}

/**
 * Получить сохраненный язык из localStorage
 */
export function getSavedLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  
  const saved = localStorage.getItem('language') as Language | null
  if (saved && (saved === 'en' || saved === 'ru')) {
    return saved
  }

  // Определяем язык браузера
  const browserLanguage = navigator.language.toLowerCase()
  return browserLanguage.includes('ru') ? 'ru' : 'en'
}

/**
 * Установить глобальную тему
 */
export function setGlobalTheme(theme: Theme): void {
  if (typeof window === 'undefined') return

  // Сохраняем в localStorage
  localStorage.setItem('theme', theme)
  
  // Применяем к DOM
  applyThemeToDOM(theme)
  
  // Отправляем событие для синхронизации
  emitThemeChangeEvent(theme)
}

/**
 * Установить глобальный язык
 */
export function setGlobalLanguage(language: Language): void {
  if (typeof window === 'undefined') return

  // Сохраняем в localStorage
  localStorage.setItem('language', language)
  
  // Применяем к DOM
  applyLanguageToDOM(language)
  
  // Отправляем событие для синхронизации
  emitLanguageChangeEvent(language)
}

/**
 * Применить тему к DOM элементам
 */
function applyThemeToDOM(theme: Theme): void {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  const body = document.body

  // Обновляем классы на root элементе
  root.classList.remove('light', 'dark')
  root.classList.add(theme)

  // Обновляем data-theme атрибут на body
  body.setAttribute('data-theme', theme)
}

/**
 * Применить язык к DOM элементам
 */
function applyLanguageToDOM(language: Language): void {
  if (typeof window === 'undefined') return

  // Обновляем lang атрибут документа
  document.documentElement.lang = language
}

/**
 * Отправить событие изменения темы
 */
function emitThemeChangeEvent(theme: Theme): void {
  if (typeof window === 'undefined') return

  const event = new CustomEvent('redai-theme-change', {
    detail: { theme }
  })
  
  window.dispatchEvent(event)
}

/**
 * Отправить событие изменения языка
 */
function emitLanguageChangeEvent(language: Language): void {
  if (typeof window === 'undefined') return

  const event = new CustomEvent('redai-language-change', {
    detail: { language }
  })
  
  window.dispatchEvent(event)
}

/**
 * Подписаться на изменения темы
 */
export function subscribeToThemeChanges(callback: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = (event: CustomEvent) => {
    callback(event.detail.theme)
  }

  window.addEventListener('redai-theme-change', handler as EventListener)
  
  return () => {
    window.removeEventListener('redai-theme-change', handler as EventListener)
  }
}

/**
 * Подписаться на изменения языка
 */
export function subscribeToLanguageChanges(callback: (language: Language) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = (event: CustomEvent) => {
    callback(event.detail.language)
  }

  window.addEventListener('redai-language-change', handler as EventListener)
  
  return () => {
    window.removeEventListener('redai-language-change', handler as EventListener)
  }
}

/**
 * Переключить тему
 */
export function toggleGlobalTheme(): void {
  const currentTheme = getSavedTheme()
  const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark'
  setGlobalTheme(newTheme)
}

/**
 * Переключить язык
 */
export function toggleGlobalLanguage(): void {
  const currentLanguage = getSavedLanguage()
  const newLanguage: Language = currentLanguage === 'en' ? 'ru' : 'en'
  setGlobalLanguage(newLanguage)
} 