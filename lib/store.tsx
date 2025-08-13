'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Language } from './translations'

// Типы для проекта
export interface Project {
  id: string
  name: string
  description: string
  imageUrl?: string
  roomAnalysis?: any
  designRecommendation?: any
  budget: {
    min: number
    max: number
  }
  createdAt: Date
  updatedAt: Date
}

// Интерфейс состояния приложения
interface AppState {
  // Theme and language
  theme: 'light' | 'dark'
  language: Language
  
  // User preferences
  openaiApiKey: string
  darkMode: boolean
  
  // Projects
  projects: Project[]
  currentProject: Project | null
  
  // Chat and AI
  totalTokensUsed: number
  totalCost: number
  
  // Actions для theme и language
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: Language) => void
  
  // Actions для API key
  setOpenaiApiKey: (key: string) => void
  setDarkMode: (darkMode: boolean) => void
  
  // Actions для projects
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (project: Project | null) => void
  
  // Actions для usage tracking
  addTokenUsage: (tokens: number, cost: number) => void
  resetTokenUsage: () => void
  clearChatHistory: () => void
}

// Создаем store с persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'dark',
      language: 'en',
      openaiApiKey: '',
      darkMode: true,
      projects: [],
      currentProject: null,
      totalTokensUsed: 0,
      totalCost: 0,
      
      // Theme and language actions
      setTheme: (theme) => {
        set({ theme, darkMode: theme === 'dark' })
        
        // Update DOM classes
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement
          root.classList.remove('light', 'dark')
          root.classList.add(theme)
          localStorage.setItem('theme', theme)
        }
      },
      
      setLanguage: (language) => {
        set({ language })
        
        // Update document language
        if (typeof window !== 'undefined') {
          document.documentElement.lang = language
          localStorage.setItem('language', language)
        }
      },
      
      // API key actions
      setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
      setDarkMode: (darkMode) => {
        set({ darkMode, theme: darkMode ? 'dark' : 'light' })
        
        // Update DOM classes
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement
          const theme = darkMode ? 'dark' : 'light'
          root.classList.remove('light', 'dark')
          root.classList.add(theme)
          localStorage.setItem('theme', theme)
        }
      },
      
      // Project actions
      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, project]
        }))
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id 
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          )
        }))
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id)
        }))
      },
      
      setCurrentProject: (project) => {
        set({ currentProject: project })
      },
      
      // Usage tracking actions
      addTokenUsage: (tokens, cost) => {
        set((state) => ({
          totalTokensUsed: state.totalTokensUsed + tokens,
          totalCost: state.totalCost + cost
        }))
      },
      
      resetTokenUsage: () => {
        set({ totalTokensUsed: 0, totalCost: 0 })
      },
      
      clearChatHistory: () => {
        // This would clear chat messages if we had them in the store
        console.log('Chat history cleared')
      }
    }),
    {
      name: 'red-ai-store', // Уникальное имя для localStorage
      partialize: (state) => ({
        // Сохраняем только нужные поля
        theme: state.theme,
        language: state.language,
        openaiApiKey: state.openaiApiKey,
        darkMode: state.darkMode,
        projects: state.projects,
        totalTokensUsed: state.totalTokensUsed,
        totalCost: state.totalCost,
      }),
    }
  )
) 