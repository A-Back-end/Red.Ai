import { User } from '@clerk/nextjs/server';

// Типы для аналитики
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface UserAnalytics {
  userId: string;
  email: string;
  name: string;
  signUpDate: Date;
  lastSignIn: Date;
  totalGenerations: number;
  totalProjects: number;
  subscription: 'free' | 'pro' | 'enterprise';
}

// Сервис для работы с аналитикой Clerk
export class ClerkAnalyticsService {
  private static instance: ClerkAnalyticsService;
  
  private constructor() {}
  
  public static getInstance(): ClerkAnalyticsService {
    if (!ClerkAnalyticsService.instance) {
      ClerkAnalyticsService.instance = new ClerkAnalyticsService();
    }
    return ClerkAnalyticsService.instance;
  }

  // Отправка события в аналитику
  public async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Отправляем в Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.event, {
          user_id: event.userId,
          custom_parameters: event.properties,
        });
      }

      // Отправляем в Umami
      if (typeof window !== 'undefined' && (window as any).umami) {
        (window as any).umami.track(event.event, {
          userId: event.userId,
          userEmail: event.userEmail,
          userName: event.userName,
          ...event.properties,
        });
      }

      // Логируем локально для отладки
      console.log('📊 Analytics Event:', {
        ...event,
        timestamp: event.timestamp || new Date(),
      });

      // Здесь можно добавить отправку в собственную БД
      await this.saveEventToDatabase(event);
      
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  // Отслеживание регистрации пользователя
  public async trackUserSignUp(user: User): Promise<void> {
    await this.trackEvent({
      event: 'user_sign_up',
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      properties: {
        signUpMethod: user.externalAccounts.length > 0 ? 'oauth' : 'email',
        provider: user.externalAccounts[0]?.provider || 'email',
      },
    });
  }

  // Отслеживание входа пользователя
  public async trackUserSignIn(user: User): Promise<void> {
    await this.trackEvent({
      event: 'user_sign_in',
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      properties: {
        signInMethod: user.externalAccounts.length > 0 ? 'oauth' : 'email',
        provider: user.externalAccounts[0]?.provider || 'email',
      },
    });
  }

  // Отслеживание генерации изображения
  public async trackImageGeneration(user: User, prompt: string, model: string): Promise<void> {
    await this.trackEvent({
      event: 'image_generation',
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      properties: {
        prompt: prompt.substring(0, 100), // Ограничиваем длину
        model,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Отслеживание создания проекта
  public async trackProjectCreation(user: User, projectType: string): Promise<void> {
    await this.trackEvent({
      event: 'project_creation',
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      properties: {
        projectType,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Сохранение события в базу данных
  private async saveEventToDatabase(event: AnalyticsEvent): Promise<void> {
    try {
      // Здесь можно добавить сохранение в PostgreSQL, MongoDB или другую БД
      // Пример для PostgreSQL:
      /*
      const query = `
        INSERT INTO analytics_events (event, user_id, user_email, user_name, properties, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await db.query(query, [
        event.event,
        event.userId,
        event.userEmail,
        event.userName,
        JSON.stringify(event.properties),
        event.timestamp || new Date(),
      ]);
      */
      
      // Пока просто логируем
      console.log('💾 Event saved to database:', event);
    } catch (error) {
      console.error('Failed to save event to database:', error);
    }
  }

  // Получение статистики пользователя
  public async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    try {
      // Здесь можно добавить запрос к БД для получения статистики
      // Пока возвращаем заглушку
      return {
        userId,
        email: 'user@example.com',
        name: 'User',
        signUpDate: new Date(),
        lastSignIn: new Date(),
        totalGenerations: 0,
        totalProjects: 0,
        subscription: 'free',
      };
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return null;
    }
  }
}

// Экспортируем singleton
export const clerkAnalytics = ClerkAnalyticsService.getInstance(); 