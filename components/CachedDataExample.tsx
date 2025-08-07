'use client';

import { useCachedAPI, useLocalStorageCache } from '@/hooks/useCachedData';

interface TestData {
  id: string;
  name: string;
  description: string;
}

interface TestsResponse {
  tests: TestData[];
  total: number;
}

interface UserPreferences {
  theme: string;
  language: string;
}

// Example component showing how to use caching for better performance
export default function CachedDataExample() {
  // Cache API calls with 5-minute TTL
  const { 
    data: tests, 
    loading: testsLoading, 
    error: testsError,
    refetch: refetchTests,
    hitRate 
  } = useCachedAPI<TestsResponse>('/api/tests/public', {}, 300000);

  // Cache user preferences in localStorage for 1 hour
  const [userPreferences, setUserPreferences, clearPreferences] = useLocalStorageCache<UserPreferences>(
    'user-preferences',
    { theme: 'light', language: 'en' },
    3600000
  );

  if (testsLoading) {
    return <div>Loading tests...</div>;
  }

  if (testsError) {
    return <div>Error loading tests: {testsError.message}</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900">Cache Performance</h3>
        <p className="text-blue-700">Cache hit rate: {hitRate.toFixed(1)}%</p>
        <button 
          onClick={refetchTests}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900">User Preferences (Cached)</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-green-700">Theme:</label>
            <select 
              value={userPreferences.theme}
              onChange={(e) => setUserPreferences({ ...userPreferences, theme: e.target.value })}
              className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700">Language:</label>
            <select 
              value={userPreferences.language}
              onChange={(e) => setUserPreferences({ ...userPreferences, language: e.target.value })}
              className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <button 
            onClick={clearPreferences}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Preferences
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900">Cached Tests Data</h3>
        <p className="text-gray-600">Total tests: {tests?.total || 0}</p>
        <div className="mt-2 space-y-1">
          {tests?.tests?.map((test: TestData) => (
            <div key={test.id} className="p-2 bg-white rounded border">
              <h4 className="font-medium">{test.name}</h4>
              <p className="text-sm text-gray-600">{test.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 