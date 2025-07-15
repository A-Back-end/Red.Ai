'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type Language = 'en' | 'ru';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');

  // Функция для получения темы из URL параметров или localStorage
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    
    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme') as Theme;
    if (urlTheme && ['light', 'dark'].includes(urlTheme)) {
      return urlTheme;
    }
    
    // Проверяем localStorage
    const savedTheme = localStorage.getItem('redai-theme') as Theme;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    
    return 'dark';
  };

  // Функция для получения языка из URL параметров или localStorage
  const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'en';
    
    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Language;
    if (urlLang && ['en', 'ru'].includes(urlLang)) {
      return urlLang;
    }
    
    // Проверяем localStorage
    const savedLang = localStorage.getItem('redai-language') as Language;
    if (savedLang && ['en', 'ru'].includes(savedLang)) {
      return savedLang;
    }
    
    return 'en';
  };

  // Функция для применения темы
  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    const body = document.body;
    
    // Удаляем старые классы
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Добавляем новые классы
    root.classList.add(newTheme);
    body.classList.add(newTheme);
    
    // Устанавливаем data-theme атрибут
    root.setAttribute('data-theme', newTheme);
    body.setAttribute('data-theme', newTheme);
    
    // Сохраняем в localStorage
    localStorage.setItem('redai-theme', newTheme);
    
    // Уведомляем landing page о смене темы
    window.dispatchEvent(new CustomEvent('redai-theme-change', {
      detail: { theme: newTheme }
    }));
    
    console.log(`🎨 Theme changed to: ${newTheme}`);
  };

  // Функция для применения языка
  const applyLanguage = (newLanguage: Language) => {
    if (typeof window === 'undefined') return;
    
    // Сохраняем в localStorage
    localStorage.setItem('redai-language', newLanguage);
    
    // Уведомляем landing page о смене языка
    window.dispatchEvent(new CustomEvent('redai-language-change', {
      detail: { language: newLanguage }
    }));
    
    console.log(`🌍 Language changed to: ${newLanguage}`);
  };

  // Инициализация при загрузке
  useEffect(() => {
    const initialTheme = getInitialTheme();
    const initialLanguage = getInitialLanguage();
    
    setTheme(initialTheme);
    setLanguage(initialLanguage);
    
    applyTheme(initialTheme);
    applyLanguage(initialLanguage);
  }, []);

  // Обработчики изменений
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    applyLanguage(newLanguage);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    handleSetTheme(newTheme);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ru' : 'en';
    handleSetLanguage(newLanguage);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      language,
      setTheme: handleSetTheme,
      setLanguage: handleSetLanguage,
      toggleTheme,
      toggleLanguage
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 