/**
 * Auth Store Tests
 * Tests for Zustand auth store functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { useAuthStore } from '@/lib/stores/auth-store';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
};

jest.mock('@/lib/supabase/client', () => ({
  supabaseClient: mockSupabase
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.isLoggedIn).toBe(false);
    });
  });

  describe('User Management', () => {
    test('should set user correctly', () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z'
      };

      useAuthStore.getState().setUser(mockUser as any);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoggedIn).toBe(true);
    });

    test('should clear user on logout', () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      };

      // Set user first
      useAuthStore.getState().setUser(mockUser as any);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);

      // Logout
      useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isLoggedIn).toBe(false);
    });
  });

  describe('Profile Management', () => {
    test('should set profile correctly', () => {
      const mockProfile = {
        id: 'test-profile-id',
        username: 'testuser',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      };

      useAuthStore.getState().setProfile(mockProfile as any);
      
      const state = useAuthStore.getState();
      expect(state.profile).toEqual(mockProfile);
    });

    test('should clear profile on logout', () => {
      const mockProfile = {
        id: 'test-profile-id',
        username: 'testuser'
      };

      // Set profile first
      useAuthStore.getState().setProfile(mockProfile as any);
      expect(useAuthStore.getState().profile).toEqual(mockProfile);

      // Logout
      useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      expect(state.profile).toBeNull();
    });
  });

  describe('Loading State', () => {
    test('should set loading state correctly', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().loading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('should handle session change with user', () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      };

      const mockSession = {
        user: mockUser,
        access_token: 'test-token'
      };

      useAuthStore.getState().handleSessionChange(mockSession as any);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoggedIn).toBe(true);
    });

    test('should handle session change without user', () => {
      useAuthStore.getState().handleSessionChange(null);
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoggedIn).toBe(false);
    });
  });

  describe('Profile Fetching', () => {
    test('should fetch profile successfully', async () => {
      const mockProfile = {
        id: 'test-profile-id',
        username: 'testuser',
        full_name: 'Test User'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockProfile,
              error: null
            }))
          }))
        }))
      });

      const result = await useAuthStore.getState().fetchProfile('test-user-id');
      
      expect(result).toEqual(mockProfile);
      expect(useAuthStore.getState().profile).toEqual(mockProfile);
    });

    test('should handle profile fetch error', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { message: 'Profile not found' }
            }))
          }))
        }))
      });

      const result = await useAuthStore.getState().fetchProfile('non-existent-user');
      
      expect(result).toBeNull();
      expect(useAuthStore.getState().profile).toBeNull();
    });
  });

  describe('Store Persistence', () => {
    test('should persist state changes', () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      };

      const mockProfile = {
        id: 'test-profile-id',
        username: 'testuser'
      };

      // Set user and profile
      useAuthStore.getState().setUser(mockUser as any);
      useAuthStore.getState().setProfile(mockProfile as any);

      // Get fresh state
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.profile).toEqual(mockProfile);
      expect(state.isLoggedIn).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle null user gracefully', () => {
      useAuthStore.getState().setUser(null);
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoggedIn).toBe(false);
    });

    test('should handle null profile gracefully', () => {
      useAuthStore.getState().setProfile(null);
      
      const state = useAuthStore.getState();
      expect(state.profile).toBeNull();
    });
  });
});
