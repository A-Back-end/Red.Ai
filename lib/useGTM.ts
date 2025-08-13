import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  sendGAEvent,
  trackPageView,
  trackUserInteraction,
  trackAIFeature,
  trackDesignGeneration,
  trackUserRegistration,
  trackProjectCreation,
  trackCreditUsage,
  GA_EVENTS,
} from './gtm';

/**
 * React hook for Google Analytics GA4 integration
 * Automatically tracks page views and provides methods for custom events
 */
export const useGTM = () => {
  const pathname = usePathname();

  // Auto-track page views
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  // Wrapper functions for tracking
  const trackInteraction = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    trackUserInteraction(action, category, label, value);
  }, []);

  const trackAI = useCallback((
    feature: string,
    action: string,
    parameters: Record<string, any> = {}
  ) => {
    trackAIFeature(feature, action, parameters);
  }, []);

  const trackDesign = useCallback((
    designType: string,
    parameters: Record<string, any> = {}
  ) => {
    trackDesignGeneration(designType, parameters);
  }, []);

  const trackRegistration = useCallback((method: string) => {
    trackUserRegistration(method);
  }, []);

  const trackProject = useCallback((
    projectType: string,
    parameters: Record<string, any> = {}
  ) => {
    trackProjectCreation(projectType, parameters);
  }, []);

  const trackCredits = useCallback((feature: string, creditsUsed: number) => {
    trackCreditUsage(feature, creditsUsed);
  }, []);

  const trackCustom = useCallback((
    eventName: string,
    parameters: Record<string, any> = {}
  ) => {
    sendGAEvent(eventName, parameters);
  }, []);

  return {
    // Tracking methods
    trackInteraction,
    trackAI,
    trackDesign,
    trackRegistration,
    trackProject,
    trackCredits,
    trackCustom,
    
    // Event constants
    EVENTS: GA_EVENTS,
    
    // Current pathname
    currentPath: pathname,
  };
};

/**
 * Hook for tracking button clicks
 */
export const useGTMButton = (category: string) => {
  const { trackInteraction } = useGTM();

  const trackClick = useCallback((
    action: string,
    label?: string,
    value?: number
  ) => {
    trackInteraction('click', category, label, value);
  }, [trackInteraction, category]);

  return { trackClick };
};

/**
 * Hook for tracking form submissions
 */
export const useGTMForm = (formName: string) => {
  const { trackInteraction } = useGTM();

  const trackSubmit = useCallback((
    action: string = 'submit',
    label?: string,
    value?: number
  ) => {
    trackInteraction(action, 'form', `${formName}_${label || 'submission'}`, value);
  }, [trackInteraction, formName]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    trackInteraction('focus', 'form_field', `${formName}_${fieldName}`);
  }, [trackInteraction, formName]);

  return { trackSubmit, trackFieldFocus };
};

/**
 * Hook for tracking AI feature usage
 */
export const useGTMAI = (featureName: string) => {
  const { trackAI } = useGTM();

  const trackStart = useCallback((parameters: Record<string, any> = {}) => {
    trackAI(featureName, 'start', parameters);
  }, [trackAI, featureName]);

  const trackComplete = useCallback((parameters: Record<string, any> = {}) => {
    trackAI(featureName, 'complete', parameters);
  }, [trackAI, featureName]);

  const trackError = useCallback((error: string, parameters: Record<string, any> = {}) => {
    trackAI(featureName, 'error', { error, ...parameters });
  }, [trackAI, featureName]);

  return { trackStart, trackComplete, trackError };
}; 