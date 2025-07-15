// Основные типы для Red.AI приложения

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profilePhoto?: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description: string
  imageUrl?: string
  originalImageUrl?: string  // Исходное изображение до обработки (для Before/After)
  userId?: string
  status?: string
  generatedImages?: string[]
  preferredStyles?: string[]
  restrictions?: string[]
  roomAnalysis?: RoomAnalysis
  designRecommendation?: DesignRecommendation
  threeDModel?: any
  pdfReport?: any
  shoppingList?: any
  budget: Budget
  createdAt: Date
  updatedAt: Date
}

export interface RoomAnalysis {
  roomType: string
  dimensions: {
    width: number
    height: number
    area: number
  }
  features: string[]
  lighting: string
  windows: number
  condition: string
  recommendations: string[]
}

export interface DesignRecommendation {
  style: string
  colorPalette: string[]
  furnitureItems: FurnitureItem[]
  layoutSuggestions: string[]
  materials: string[]
  estimatedCost: number
}

export interface FurnitureItem {
  id: string
  name: string
  category: string
  price: number
  imageUrl?: string
  description?: string
}

export interface Budget {
  min: number
  max: number
  currency: string
}

export interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  category?: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Theme and UI types
export type Theme = 'light' | 'dark'
export type Language = 'en' | 'ru'

export interface ThemeConfig {
  theme: Theme
  language: Language
}

// AI Service types
export interface AIGenerationRequest {
  prompt: string
  style?: string
  aspectRatio?: string
  model?: string
}

export interface AIGenerationResponse {
  imageUrl: string
  prompt: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Form types
export interface ContactForm {
  name: string
  email: string
  message: string
  subject?: string
}

export interface AuthForm {
  email: string
  password: string
  firstName?: string
  lastName?: string
  confirmPassword?: string
}

// API error types
export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
}

// Utility types
export type ViewType = 
  | 'dashboard' 
  | 'projects' 
  | 'ai-assistant' 
  | 'design-studio' 
  | 'image-generator' 
  | 'settings'
  | 'flux-designer'
  | 'my-projects'

export interface DashboardStats {
  totalProjects: number
  completedAnalyses: number
  savedDesigns: number
  totalBudget: number
} 