/**
 * Azure OpenAI Service for Domovenok AI Assistant
 * Handles communication with Azure OpenAI API
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  message: string
  personality?: string
  specialization?: string
  conversationHistory?: ChatMessage[]
  assistantName?: string
  context?: string
}

export interface ChatResponse {
  message: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
  provider: string
  error?: string
}

export class AzureOpenAIService {
  private static readonly API_ENDPOINT = '/api/azure-ai-chat'
  
  /**
   * Send chat request to Azure OpenAI through API
   */
  static async sendChatRequest(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: ChatResponse = await response.json()
      return data

    } catch (error) {
      console.error('Azure OpenAI Service Error:', error)
      throw error
    }
  }

  /**
   * Create specialized request for Domovenok assistant
   */
  static async sendDomovenokRequest(
    message: string,
    options: {
      role?: string
      style?: string
      history?: ChatMessage[]
    } = {}
  ): Promise<ChatResponse> {
    return this.sendChatRequest({
      message,
      personality: options.style || 'friendly',
      specialization: this.mapRoleToSpecialization(options.role || 'universal'),
      conversationHistory: options.history || [],
      assistantName: 'Домовёнок',
      context: 'real_estate_design_assistant'
    })
  }

  /**
   * Map UI role to API specialization
   */
  private static mapRoleToSpecialization(role: string): string {
    const roleMap: { [key: string]: string } = {
      'realtor': 'realtor',
      'interior_designer': 'designer',
      'renovation_expert': 'consultant',
      'investment_advisor': 'consultant',
      'universal': 'consultant'
    }
    return roleMap[role] || 'consultant'
  }

  /**
   * Get available Azure OpenAI models
   */
  static getAvailableModels(): string[] {
    return [
      'gpt-4.1',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ]
  }

  /**
   * Estimate token usage for a message
   */
  static estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for Russian text
    return Math.ceil(text.length / 4)
  }

  /**
   * Format error message for user display
   */
  static formatErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error
    }
    
    if (error.message) {
      return error.message
    }
    
    return 'Произошла неизвестная ошибка. Попробуйте ещё раз.'
  }
}

export default AzureOpenAIService 