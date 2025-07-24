// Umami Analytics utilities for Red.AI
declare global {
  interface Window {
    umami: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
      trackView: (url: string) => void;
    };
  }
}

/**
 * Send custom events to Umami Analytics
 * @param eventName - Name of the event
 * @param eventData - Additional data for the event
 */
export const sendUmamiEvent = (eventName: string, eventData: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData);
    console.log('📊 Umami Event sent:', eventName, eventData);
  } else {
    console.log('📊 Umami Event queued (not loaded yet):', eventName, eventData);
  }
};

/**
 * Track page views
 * @param pagePath - Current page path
 * @param pageTitle - Page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.trackView(pagePath);
    console.log('📊 Umami Page View:', pagePath);
  }
};

/**
 * Track user interactions
 * @param action - Action performed (click, submit, etc.)
 * @param category - Category of the action
 * @param label - Additional label
 * @param value - Numeric value
 */
export const trackUserInteraction = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  sendUmamiEvent('user_interaction', {
    action,
    category,
    label,
    value,
  });
};

/**
 * Track AI feature usage
 * @param feature - AI feature name
 * @param action - Action performed
 * @param parameters - Additional parameters
 */
export const trackAIFeature = (
  feature: string,
  action: string,
  parameters: Record<string, any> = {}
) => {
  sendUmamiEvent('ai_feature_usage', {
    feature,
    action,
    ...parameters,
  });
};

/**
 * Track design generation
 * @param designType - Type of design generated
 * @param parameters - Design parameters
 */
export const trackDesignGeneration = (
  designType: string,
  parameters: Record<string, any> = {}
) => {
  sendUmamiEvent('design_generation', {
    design_type: designType,
    ...parameters,
  });
};

/**
 * Track user registration/signup
 * @param method - Registration method (google, email, etc.)
 */
export const trackUserRegistration = (method: string) => {
  sendUmamiEvent('user_registration', {
    registration_method: method,
  });
};

/**
 * Track project creation
 * @param projectType - Type of project
 * @param parameters - Project parameters
 */
export const trackProjectCreation = (
  projectType: string,
  parameters: Record<string, any> = {}
) => {
  sendUmamiEvent('project_creation', {
    project_type: projectType,
    ...parameters,
  });
};

/**
 * Track credit usage
 * @param feature - Feature that used credits
 * @param creditsUsed - Number of credits used
 */
export const trackCreditUsage = (feature: string, creditsUsed: number) => {
  sendUmamiEvent('credit_usage', {
    feature,
    credits_used: creditsUsed,
  });
};

// Predefined event types for Red.AI
export const UMAMI_EVENTS = {
  // Page interactions
  PAGE_VIEW: 'page_view',
  USER_INTERACTION: 'user_interaction',
  
  // AI Features
  AI_FEATURE_USAGE: 'ai_feature_usage',
  DESIGN_GENERATION: 'design_generation',
  FURNITURE_FINDER: 'furniture_finder',
  RENOVATION_ASSISTANT: 'renovation_assistant',
  
  // User actions
  USER_REGISTRATION: 'user_registration',
  USER_LOGIN: 'user_login',
  PROJECT_CREATION: 'project_creation',
  PROJECT_SAVE: 'project_save',
  
  // Business metrics
  CREDIT_USAGE: 'credit_usage',
  CREDIT_PURCHASE: 'credit_purchase',
  
  // Design studio
  DESIGN_STUDIO_START: 'design_studio_start',
  DESIGN_STUDIO_COMPLETE: 'design_studio_complete',
  IMAGE_UPLOAD: 'image_upload',
  IMAGE_GENERATION: 'image_generation',
} as const; 