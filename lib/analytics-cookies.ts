// GDPR-compliant analytics cookie management for Codeunia
import { useState, useEffect } from 'react';
export interface AnalyticsConsent {
  necessary: boolean; // Always true
  analytics: boolean; // User consent required
  marketing: boolean; // User consent required
  preferences: boolean; // User consent required
}

export interface AnalyticsData {
  pageViews: Record<string, number>;
  sessionId: string;
  userId?: string;
  firstVisit: number;
  lastVisit: number;
  consent: AnalyticsConsent;
  engagement?: Record<string, Array<{ timestamp: number; data?: any }>>;
}

// Default consent (only necessary cookies allowed)
const defaultConsent: AnalyticsConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false
};

// Analytics cookie management
export const analyticsCookies = {
  // Check if user has given consent
  hasConsent: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const consent = analyticsCookies.getConsent();
    return consent.analytics || consent.marketing || consent.preferences;
  },

  // Get user consent
  getConsent: (): AnalyticsConsent => {
    if (typeof window === 'undefined') return defaultConsent;

    try {
      const consentData = localStorage.getItem('codeunia_consent');
      if (consentData) {
        return JSON.parse(consentData);
      }
    } catch (error) {
      console.warn('Failed to parse consent data:', error);
    }

    return defaultConsent;
  },

  // Set user consent
  setConsent: (consent: AnalyticsConsent) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('codeunia_consent', JSON.stringify(consent));
      
      // If analytics consent is given, initialize analytics
      if (consent.analytics) {
        analyticsCookies.initializeAnalytics();
      }
    } catch (error) {
      console.warn('Failed to save consent:', error);
    }
  },

  // Initialize analytics (only if consent given)
  initializeAnalytics: () => {
    if (!analyticsCookies.hasConsent()) return;

    const analyticsData = analyticsCookies.getAnalyticsData();
    
    // Set session ID if not exists
    if (!analyticsData.sessionId) {
      analyticsData.sessionId = Math.random().toString(36).substring(2);
      analyticsData.firstVisit = Date.now();
    }
    
    analyticsData.lastVisit = Date.now();
    
    analyticsCookies.saveAnalyticsData(analyticsData);
  },

  // Get analytics data
  getAnalyticsData: (): AnalyticsData => {
    if (typeof window === 'undefined') {
      return {
        pageViews: {},
        sessionId: '',
        firstVisit: Date.now(),
        lastVisit: Date.now(),
        consent: defaultConsent
      };
    }

    try {
      const data = localStorage.getItem('codeunia_analytics');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to parse analytics data:', error);
    }

    return {
      pageViews: {},
      sessionId: '',
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      consent: defaultConsent
    };
  },

  // Save analytics data
  saveAnalyticsData: (data: AnalyticsData) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('codeunia_analytics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  },

  // Track page view (only if consent given)
  trackPageView: (page: string) => {
    if (!analyticsCookies.hasConsent()) return;

    const data = analyticsCookies.getAnalyticsData();
    data.pageViews[page] = (data.pageViews[page] || 0) + 1;
    data.lastVisit = Date.now();
    
    analyticsCookies.saveAnalyticsData(data);
  },

  // Track user engagement (only if consent given)
  trackEngagement: (action: string, data?: any) => {
    if (!analyticsCookies.hasConsent()) return;

    const analyticsData = analyticsCookies.getAnalyticsData();
    
    if (!analyticsData.engagement) {
      analyticsData.engagement = {};
    }
    
    if (!analyticsData.engagement[action]) {
      analyticsData.engagement[action] = [];
    }
    
    analyticsData.engagement[action].push({
      timestamp: Date.now(),
      data
    });
    
    // Keep only last 50 actions per type
    analyticsData.engagement[action] = analyticsData.engagement[action].slice(-50);
    
    analyticsCookies.saveAnalyticsData(analyticsData);
  },

  // Get analytics summary
  getAnalyticsSummary: () => {
    if (!analyticsCookies.hasConsent()) {
      return { error: 'No consent given' };
    }

    const data = analyticsCookies.getAnalyticsData();
    
    return {
      totalPageViews: Object.values(data.pageViews).reduce((sum, count) => sum + count, 0),
      uniquePages: Object.keys(data.pageViews).length,
      sessionDuration: data.lastVisit - data.firstVisit,
      sessionId: data.sessionId,
      consent: data.consent
    };
  },

  // Clear analytics data
  clearAnalyticsData: () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('codeunia_analytics');
    localStorage.removeItem('codeunia_consent');
  }
};

// Leaderboard and activity tracking (anonymous, before login)
export const activityCookies = {
  // Track anonymous activity (no consent required)
  trackActivity: (activity: string, data?: any) => {
    if (typeof window === 'undefined') return;

    try {
      const activities = JSON.parse(localStorage.getItem('codeunia_activities') || '[]');
      
      activities.push({
        activity,
        data,
        timestamp: Date.now(),
        sessionId: Math.random().toString(36).substring(2)
      });
      
      // Keep only last 100 activities
      activities.splice(0, activities.length - 100);
      
      localStorage.setItem('codeunia_activities', JSON.stringify(activities));
    } catch (error) {
      console.warn('Failed to track activity:', error);
    }
  },

  // Get activity summary
  getActivitySummary: () => {
    if (typeof window === 'undefined') return {};

    try {
      const activities = JSON.parse(localStorage.getItem('codeunia_activities') || '[]');
      
      const summary = activities.reduce((acc: any, activity: any) => {
        if (!acc[activity.activity]) {
          acc[activity.activity] = 0;
        }
        acc[activity.activity]++;
        return acc;
      }, {});
      
      return summary;
    } catch (error) {
      console.warn('Failed to get activity summary:', error);
      return {};
    }
  },

  // Clear activities
  clearActivities: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('codeunia_activities');
  }
};

// Cookie consent banner component hook
export const useCookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<AnalyticsConsent>(defaultConsent);

  useEffect(() => {
    // Check if consent banner should be shown
    const savedConsent = analyticsCookies.getConsent();
    const hasShownBanner = localStorage.getItem('codeunia_consent_shown');
    
    if (!hasShownBanner) {
      setShowBanner(true);
    }
    
    setConsent(savedConsent);
  }, []);

  const acceptAll = () => {
    const newConsent: AnalyticsConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    analyticsCookies.setConsent(newConsent);
    setConsent(newConsent);
    setShowBanner(false);
    localStorage.setItem('codeunia_consent_shown', 'true');
  };

  const acceptNecessary = () => {
    analyticsCookies.setConsent(defaultConsent);
    setConsent(defaultConsent);
    setShowBanner(false);
    localStorage.setItem('codeunia_consent_shown', 'true');
  };

  const acceptCustom = (customConsent: Partial<AnalyticsConsent>) => {
    const newConsent: AnalyticsConsent = {
      ...defaultConsent,
      ...customConsent
    };
    
    analyticsCookies.setConsent(newConsent);
    setConsent(newConsent);
    setShowBanner(false);
    localStorage.setItem('codeunia_consent_shown', 'true');
  };

  const updateConsent = (newConsent: AnalyticsConsent) => {
    analyticsCookies.setConsent(newConsent);
    setConsent(newConsent);
  };

  return {
    showBanner,
    consent,
    acceptAll,
    acceptNecessary,
    acceptCustom,
    updateConsent
  };
}; 