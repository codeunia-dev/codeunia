'use client';

import { useEffect } from 'react';
import { useLeaderboard, useTestData, useCertificate, useBlogPost } from '@/hooks/useProductionCache';
import { useUserPreferences, useSearchHistory, usePageViews, useCacheMetrics } from '@/hooks/useProductionCache';

export default function ProductionCacheExample() {
  // Cache-based hooks (for data that doesn't change often)
  const { data: leaderboard, loading: leaderboardLoading, error: leaderboardError, refresh: refreshLeaderboard } = useLeaderboard('global');
  const { data: testData, loading: testLoading, error: testError } = useTestData('test-123');
  const { data: certificate, loading: certLoading, error: certError } = useCertificate('cert-456');
  const { data: blogPost, loading: blogLoading, error: blogError } = useBlogPost('getting-started-with-codeunia');

  // Cookie-based hooks (for user-specific, small, secure data)
  const { theme, language, fontSize, updateTheme, updateLanguage, updateFontSize } = useUserPreferences();
  const { searchHistory, addSearchQuery, clearSearchHistory } = useSearchHistory();
  const { pageViews, trackPageView } = usePageViews();
  const { stats, refreshStats, resetStats } = useCacheMetrics();

  // Track page view on mount
  useEffect(() => {
    trackPageView('production-cache-example');
  }, [trackPageView]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Production Cache vs Cookies
          </h1>
          <p className="text-gray-600">
            Demonstrating proper usage of cookies vs cache for different Codeunia features
          </p>
        </div>

        {/* Cache Performance Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📊 Cache Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.hitRate.toFixed(1)}%</div>
              <div className="text-sm text-blue-700">Cache Hit Rate</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.hits}</div>
              <div className="text-sm text-green-700">Cache Hits</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.misses}</div>
              <div className="text-sm text-red-700">Cache Misses</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.sets}</div>
              <div className="text-sm text-purple-700">Cache Sets</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={refreshStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh Stats
            </button>
            <button
              onClick={resetStats}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reset Stats
            </button>
          </div>
        </div>

        {/* Cache Examples (Data that doesn't change often) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Leaderboard (High-priority cache) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🏆 Leaderboard (Cache - High Priority)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Frequently accessed data, cached for 5 minutes
            </p>
            {leaderboardLoading ? (
              <div className="text-gray-500">Loading leaderboard...</div>
            ) : leaderboardError ? (
              <div className="text-red-500">Error: {leaderboardError.message}</div>
            ) : (
              <div>
                <div className="space-y-2">
                  {leaderboard?.slice(0, 5).map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">#{index + 1} {entry.name}</span>
                      <span className="text-blue-600 font-bold">{entry.score}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={refreshLeaderboard}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Refresh Leaderboard
                </button>
              </div>
            )}
          </div>

          {/* Test Data (Medium-priority cache) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📝 Test Data (Cache - Medium Priority)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Test definitions, cached for 30 minutes
            </p>
            {testLoading ? (
              <div className="text-gray-500">Loading test data...</div>
            ) : testError ? (
              <div className="text-red-500">Error: {testError.message}</div>
            ) : (
              <div>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{testData?.name}</div>
                    <div className="text-sm text-gray-600">{testData?.description}</div>
                    <div className="text-xs text-gray-500">Duration: {testData?.duration_minutes} min</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Certificate (Medium-priority cache) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🏅 Certificate (Cache - Medium Priority)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Read-only certificates, cached for 1 hour
            </p>
            {certLoading ? (
              <div className="text-gray-500">Loading certificate...</div>
            ) : certError ? (
              <div className="text-red-500">Error: {certError.message}</div>
            ) : (
              <div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{certificate?.title}</div>
                  <div className="text-sm text-gray-600">{certificate?.issued_to}</div>
                  <div className="text-xs text-gray-500">Issued: {certificate?.issued_date}</div>
                </div>
              </div>
            )}
          </div>

          {/* Blog Post (Low-priority cache) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📰 Blog Post (Cache - Low Priority)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Static content, cached for 2 hours
            </p>
            {blogLoading ? (
              <div className="text-gray-500">Loading blog post...</div>
            ) : blogError ? (
              <div className="text-red-500">Error: {blogError.message}</div>
            ) : (
              <div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{blogPost?.title}</div>
                  <div className="text-sm text-gray-600">{blogPost?.excerpt}</div>
                  <div className="text-xs text-gray-500">Published: {blogPost?.published_date}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cookie Examples (User-specific, small, secure data) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Preferences (Cookies) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ⚙️ User Preferences (Cookies)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              User-specific settings, stored in cookies
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => updateTheme(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => updateLanguage(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => updateFontSize(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search History (Cookies) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🔍 Search History (Cookies)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Lightweight tracking, stored in cookies
            </p>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search something..."
                  className="flex-1 p-2 border rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSearchQuery(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => clearSearchHistory()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Clear
                </button>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recent Searches:</h4>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((query, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {query}
                    </div>
                  ))}
                  {searchHistory.length === 0 && (
                    <div className="text-sm text-gray-500">No search history</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Views (Cookies) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Page Views (Cookies)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Lightweight engagement tracking, stored in cookies
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(pageViews).map(([page, count]) => (
              <div key={page} className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium text-gray-900">{page}</div>
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600">views</div>
              </div>
            ))}
            {Object.keys(pageViews).length === 0 && (
              <div className="text-gray-500">No page views tracked yet</div>
            )}
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📋 Production Usage Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">🍪 Use Cookies For:</h3>
              <ul className="space-y-2 text-sm">
                <li>• User login session tokens (HTTP-only)</li>
                <li>• Remembering preferences (theme, language)</li>
                <li>• CSRF token handling</li>
                <li>• Lightweight tracking (engagement)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">🧠 Use Cache For:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Leaderboard data (high priority)</li>
                <li>• Test definitions (medium priority)</li>
                <li>• Certificates (medium priority)</li>
                <li>• Blog posts (low priority)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 