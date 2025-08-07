'use client';

import { useEffect, useState } from 'react';
import { useAuthCookies } from '@/lib/auth-cookies';
import { analyticsCookies, activityCookies, useCookieConsent } from '@/lib/analytics-cookies';
import { performanceCookies, themeCookies } from '@/lib/cookies';
import CookieConsentBanner from './CookieConsentBanner';

interface AnalyticsSummary {
  totalPageViews: number;
  uniquePages: number;
  sessionDuration: number;
  sessionId: string;
  consent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
}

interface AnalyticsSummaryWithError {
  error: string;
}

type ActivitySummary = Record<string, number>;

export default function CodeuniaCookieSystem() {
  const { isAuthenticated, isLoading, login, logout } = useAuthCookies();
  const { consent } = useCookieConsent();
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | AnalyticsSummaryWithError | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({});

  useEffect(() => {
    // Track page view if consent given
    if (consent.analytics) {
      analyticsCookies.trackPageView('cookie-system-demo');
    }

    // Track anonymous activity (no consent required)
    activityCookies.trackActivity('page_visit', { page: 'cookie-system-demo' });

    // Get analytics summary
    const summary = analyticsCookies.getAnalyticsSummary();
    setAnalyticsSummary(summary);

    // Get activity summary
    const activitySummary = activityCookies.getActivitySummary();
    setActivitySummary(activitySummary);
  }, [consent.analytics]);

  const handleLogin = async () => {
    const result = await login('demo@codeunia.com', 'password123');
    if (result.success) {
      alert('Login successful! Check cookies for auth token.');
    } else {
      alert('Login failed. This is a demo.');
    }
  };

  const handleLogout = async () => {
    await logout();
    alert('Logged out! Auth cookies cleared.');
  };

  const trackDemoActivity = () => {
    activityCookies.trackActivity('demo_action', { action: 'button_click' });
    setActivitySummary(activityCookies.getActivitySummary());
    alert('Activity tracked! Check activity summary.');
  };

  const clearAllData = () => {
    analyticsCookies.clearAnalyticsData();
    activityCookies.clearActivities();
    setAnalyticsSummary(null);
    setActivitySummary({});
    alert('All data cleared!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍪 Codeunia Cookie System
          </h1>
          <p className="text-gray-600">
            Complete cookie management system following security best practices and GDPR compliance
          </p>
        </div>

        {/* Authentication Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🔐 Authentication Cookies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Session Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Authenticated:</span>
                  <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                    {isLoading ? 'Loading...' : (isAuthenticated ? 'Yes' : 'No')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auth Token:</span>
                  <span className="text-sm text-gray-500">
                    {isAuthenticated ? 'Present' : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleLogin}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Demo Login
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Consent Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📋 Cookie Consent Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Current Consent</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Necessary:</span>
                  <span className="text-green-600 font-medium">✓ Always</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analytics:</span>
                  <span className={`font-medium ${consent.analytics ? 'text-green-600' : 'text-red-600'}`}>
                    {consent.analytics ? '✓ Enabled' : '✗ Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Marketing:</span>
                  <span className={`font-medium ${consent.marketing ? 'text-green-600' : 'text-red-600'}`}>
                    {consent.marketing ? '✓ Enabled' : '✗ Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preferences:</span>
                  <span className={`font-medium ${consent.preferences ? 'text-green-600' : 'text-red-600'}`}>
                    {consent.preferences ? '✓ Enabled' : '✗ Disabled'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Manage Settings</h3>
              <button
                onClick={() => setShowCookieSettings(true)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📊 Analytics & Activity Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Analytics Data</h3>
              {analyticsSummary && 'error' in analyticsSummary ? (
                <p className="text-red-600">No consent given for analytics</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Page Views:</span>
                    <span className="font-medium">{analyticsSummary && 'totalPageViews' in analyticsSummary ? analyticsSummary.totalPageViews : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique Pages:</span>
                    <span className="font-medium">{analyticsSummary && 'uniquePages' in analyticsSummary ? analyticsSummary.uniquePages : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session Duration:</span>
                    <span className="font-medium">
                      {analyticsSummary && 'sessionDuration' in analyticsSummary && analyticsSummary.sessionDuration ? 
                        `${Math.round(analyticsSummary.sessionDuration / 1000)}s` : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Tracking</h3>
              <div className="space-y-2">
                {Object.entries(activitySummary).map(([activity, count]) => (
                  <div key={activity} className="flex justify-between">
                    <span className="text-gray-600">{activity}:</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
                {Object.keys(activitySummary).length === 0 && (
                  <p className="text-gray-500">No activities tracked yet</p>
                )}
              </div>
              <button
                onClick={trackDemoActivity}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Track Demo Activity
              </button>
            </div>
          </div>
        </div>

        {/* Performance Cookies */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            ⚡ Performance Cookies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">User Preferences</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <select
                    onChange={(e) => themeCookies.setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                    defaultValue={themeCookies.getTheme()}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    onChange={(e) => themeCookies.setLanguage(e.target.value)}
                    defaultValue={themeCookies.getLanguage()}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Cache Management</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    performanceCookies.cacheAPIResponse('demo', { message: 'Cached data' }, 300);
                    alert('API response cached for 5 minutes!');
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Cache Demo Data
                </button>
                <button
                  onClick={() => {
                    const cached = performanceCookies.getCachedAPIResponse('demo');
                    alert(cached ? 'Found cached data!' : 'No cached data found');
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Check Cache
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🗂️ Data Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                analyticsCookies.clearAnalyticsData();
                setAnalyticsSummary(null);
                alert('Analytics data cleared!');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Analytics
            </button>
            <button
              onClick={() => {
                activityCookies.clearActivities();
                setActivitySummary({});
                alert('Activity data cleared!');
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Clear Activities
            </button>
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🔒 Security Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Cookie Security</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Secure cookies in production</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>SameSite=Strict for auth cookies</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>CSRF protection enabled</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Automatic token expiration</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy Compliance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>GDPR compliant consent</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Granular consent options</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Easy data deletion</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Transparent data usage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Consent Banner */}
        <CookieConsentBanner />

        {/* Cookie Settings Modal */}
        {showCookieSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Cookie Settings</h2>
                  <button
                    onClick={() => setShowCookieSettings(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Manage your cookie preferences. You can change these settings at any time.
                </p>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Necessary Cookies</h3>
                        <p className="text-sm text-gray-600">Essential for website functionality</p>
                      </div>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Always Active</span>
                    </div>
                  </div>
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Analytics Cookies</h3>
                        <p className="text-sm text-gray-600">Help us improve our website</p>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${consent.analytics ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {consent.analytics ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCookieSettings(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 