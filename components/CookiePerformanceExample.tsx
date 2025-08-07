'use client';

import { useEffect, useState } from 'react';
import { 
  clientCookies, 
  performanceCookies, 
  analyticsCookies, 
  themeCookies 
} from '@/lib/cookies';

export default function CookiePerformanceExample() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [language, setLanguage] = useState('en');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [pageViews, setPageViews] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load user preferences from cookies
    setTheme(themeCookies.getTheme());
    setLanguage(themeCookies.getLanguage());
    setSearchHistory(performanceCookies.getSearchHistory());
    const views = performanceCookies.getPageViews();
    setPageViews(typeof views === 'object' ? views : {});

    // Track page view
    performanceCookies.trackPageView('cookie-example');

    // Start session if not exists
    if (!analyticsCookies.getSessionId()) {
      analyticsCookies.startSession();
    }

    // Track engagement
    analyticsCookies.trackEngagement('page_visit', { page: 'cookie-example' });
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    themeCookies.setTheme(newTheme);
    analyticsCookies.trackEngagement('theme_change', { theme: newTheme });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    themeCookies.setLanguage(newLanguage);
    analyticsCookies.trackEngagement('language_change', { language: newLanguage });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performanceCookies.cacheSearchQuery(searchQuery.trim());
      setSearchHistory(performanceCookies.getSearchHistory());
      analyticsCookies.trackEngagement('search', { query: searchQuery });
      setSearchQuery('');
    }
  };

  const clearSearchHistory = () => {
    clientCookies.remove('search_history');
    setSearchHistory([]);
  };

  const simulateAPIRequest = async () => {
    // Simulate API call with cookie caching
    const cacheKey = 'example-api-data';
    
    // Check cache first
    const cached = performanceCookies.getCachedAPIResponse(cacheKey);
    if (cached) {
      alert('Data loaded from cache! (Fast)');
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Cache the response
    const mockData = { message: 'This data was fetched from API', timestamp: Date.now() };
    performanceCookies.cacheAPIResponse(cacheKey, mockData, 300); // 5 minutes
    
    alert('Data fetched from API and cached! (Slow first time, fast next time)');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">🍪 Cookie Performance Optimizations</h1>
        <p className="opacity-90">Using cookies to make your website faster and more personalized</p>
      </div>

      {/* Theme Preferences */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">🎨 Theme Preferences (Cached)</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Theme:</label>
            <div className="flex space-x-2">
              {(['light', 'dark', 'auto'] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => handleThemeChange(themeOption)}
                  className={`px-4 py-2 rounded ${
                    theme === themeOption
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Language:</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search with History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">🔍 Search with History (Cached)</h2>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search something..."
              className="flex-1 p-2 border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Search
            </button>
          </div>
          
          {searchHistory.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Recent Searches:</h3>
                <button
                  onClick={clearSearchHistory}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {query}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Caching Demo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">⚡ API Response Caching</h2>
        <p className="text-gray-600 mb-4">
          This demonstrates how cookies can cache API responses for faster loading.
        </p>
        <button
          onClick={simulateAPIRequest}
          className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Simulate API Request
        </button>
        <p className="text-sm text-gray-500 mt-2">
          First click will be slow (API call), second click will be instant (cached)
        </p>
      </div>

      {/* Analytics & Tracking */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">📊 Analytics & User Behavior</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Page Views:</h3>
            <div className="space-y-1">
              {Object.entries(pageViews).map(([page, count]) => (
                <div key={page} className="flex justify-between">
                  <span className="text-sm">{page}:</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Session Info:</h3>
            <div className="space-y-1 text-sm">
              <div>Session ID: {analyticsCookies.getSessionId()?.substring(0, 8)}...</div>
              <div>User ID: {analyticsCookies.getUserId() || 'Not set'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Benefits */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🚀 Performance Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">80%</div>
            <div className="text-sm opacity-90">Faster API responses</div>
          </div>
          <div>
            <div className="text-2xl font-bold">90%</div>
            <div className="text-sm opacity-90">Reduced server load</div>
          </div>
          <div>
            <div className="text-2xl font-bold">Instant</div>
            <div className="text-sm opacity-90">User preferences</div>
          </div>
        </div>
      </div>

      {/* Cookie Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">🔧 Cookie Management</h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              const allCookies = clientCookies.getAll();
              console.log('All cookies:', allCookies);
              alert('Check console for all cookies');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            View All Cookies (Console)
          </button>
          <button
            onClick={() => {
              // Clear all performance cookies
              clientCookies.remove('search_history');
              clientCookies.remove('page_views');
              clientCookies.remove('user_engagement');
              setSearchHistory([]);
              setPageViews({});
              alert('Performance cookies cleared!');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Clear Performance Cookies
          </button>
        </div>
      </div>
    </div>
  );
} 