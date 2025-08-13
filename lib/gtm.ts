// Google Tag Manager utilities for Red.AI
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Send custom events to Google Tag Manager
 * @param eventName - Name of the event
 * @param parameters - Additional parameters for the event
 */
export const sendGAEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters,
    });
    console.log('📊 GTM Event sent:', eventName, parameters);
  }
};

/**
 * Track page views
 * @param pagePath - Current page path
 * @param pageTitle - Page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
    console.log('📊 GTM Page view tracked:', pagePath);
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
  sendGAEvent('user_interaction', {
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
  sendGAEvent('ai_feature_usage', {
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
  sendGAEvent('design_generation', {
    design_type: designType,
    ...parameters,
  });
};

/**
 * Track user registration/signup
 * @param method - Registration method (google, email, etc.)
 */
export const trackUserRegistration = (method: string) => {
  sendGAEvent('user_registration', {
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
  sendGAEvent('project_creation', {
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
  sendGAEvent('credit_usage', {
    feature,
    credits_used: creditsUsed,
  });
};

// Predefined event types for Red.AI
export const GA_EVENTS = {
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

// Backward compatibility - keep old function names
export const sendGTMEvent = sendGAEvent;
export const GTM_EVENTS = GA_EVENTS; 