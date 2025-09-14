/**
 * Cache System Tests
 * Tests for unified cache system functionality
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { UnifiedCache } from '@/lib/unified-cache-system';

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    quit: jest.fn(),
    isOpen: true
  }))
}));

describe('Unified Cache System', () => {
  beforeEach(() => {
    // Clear cache before each test
    UnifiedCache.clear();
  });

  afterEach(() => {
    // Clean up after each test
    UnifiedCache.clear();
  });

  describe('Basic Cache Operations', () => {
    test('should set and get cache values', async () => {
      const key = 'test-key';
      const value = { data: 'test-value', timestamp: Date.now() };

      await UnifiedCache.set(key, value, 60);
      const result = await UnifiedCache.get(key);

      expect(result).toEqual(value);
    });

    test('should return null for non-existent keys', async () => {
      const result = await UnifiedCache.get('non-existent-key');
      expect(result).toBeNull();
    });

    test('should handle cache expiration', async () => {
      const key = 'expiring-key';
      const value = { data: 'expiring-value' };

      // Set with 1ms TTL
      await UnifiedCache.set(key, value, 0.001);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result = await UnifiedCache.get(key);
      expect(result).toBeNull();
    });

    test('should invalidate cache entries', async () => {
      const key = 'invalidation-test';
      const value = { data: 'test-value' };

      await UnifiedCache.set(key, value, 60);
      await UnifiedCache.invalidate(key);
      
      const result = await UnifiedCache.get(key);
      expect(result).toBeNull();
    });
  });

  describe('Tag-based Operations', () => {
    test('should set cache with tags', async () => {
      const key = 'tagged-key';
      const value = { data: 'tagged-value' };
      const tags = ['events', 'content'];

      await UnifiedCache.set(key, value, 60, tags);
      const result = await UnifiedCache.get(key);

      expect(result).toEqual(value);
    });

    test('should invalidate by tags', async () => {
      const key1 = 'tagged-key-1';
      const key2 = 'tagged-key-2';
      const key3 = 'untagged-key';
      const value = { data: 'test-value' };

      await UnifiedCache.set(key1, value, 60, ['events']);
      await UnifiedCache.set(key2, value, 60, ['events', 'content']);
      await UnifiedCache.set(key3, value, 60, ['other']);

      await UnifiedCache.invalidateByTags(['events']);

      expect(await UnifiedCache.get(key1)).toBeNull();
      expect(await UnifiedCache.get(key2)).toBeNull();
      expect(await UnifiedCache.get(key3)).toEqual(value);
    });

    test('should handle multiple tags per entry', async () => {
      const key = 'multi-tagged-key';
      const value = { data: 'multi-tagged-value' };
      const tags = ['events', 'content', 'featured'];

      await UnifiedCache.set(key, value, 60, tags);

      // Invalidate by any of the tags
      await UnifiedCache.invalidateByTags(['content']);
      
      const result = await UnifiedCache.get(key);
      expect(result).toBeNull();
    });
  });

  describe('Pattern-based Operations', () => {
    test('should invalidate by pattern', async () => {
      const keys = [
        'events:1',
        'events:2',
        'users:1',
        'events:featured:1'
      ];
      const value = { data: 'test-value' };

      // Set multiple keys
      for (const key of keys) {
        await UnifiedCache.set(key, value, 60);
      }

      // Invalidate all events keys
      await UnifiedCache.invalidatePattern('events:*');

      expect(await UnifiedCache.get('events:1')).toBeNull();
      expect(await UnifiedCache.get('events:2')).toBeNull();
      expect(await UnifiedCache.get('events:featured:1')).toBeNull();
      expect(await UnifiedCache.get('users:1')).toEqual(value);
    });
  });

  describe('Cache Statistics', () => {
    test('should provide cache statistics', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const value = { data: 'test-value' };

      // Set multiple keys
      for (const key of keys) {
        await UnifiedCache.set(key, value, 60);
      }

      const stats = await UnifiedCache.getStats();
      
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('size');
      expect(stats.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid keys gracefully', async () => {
      const result = await UnifiedCache.get('');
      expect(result).toBeNull();
    });

    test('should handle null values', async () => {
      const key = 'null-value-test';
      
      await UnifiedCache.set(key, null, 60);
      const result = await UnifiedCache.get(key);
      
      expect(result).toBeNull();
    });

    test('should handle undefined values', async () => {
      const key = 'undefined-value-test';
      
      await UnifiedCache.set(key, undefined, 60);
      const result = await UnifiedCache.get(key);
      
      expect(result).toBeUndefined();
    });
  });

  describe('Performance', () => {
    test('should handle concurrent operations', async () => {
      const promises = [];
      const keyPrefix = 'concurrent-test';
      
      // Set multiple keys concurrently
      for (let i = 0; i < 100; i++) {
        promises.push(
          UnifiedCache.set(`${keyPrefix}:${i}`, { data: `value-${i}` }, 60)
        );
      }

      await Promise.all(promises);

      // Verify all keys were set
      for (let i = 0; i < 100; i++) {
        const result = await UnifiedCache.get(`${keyPrefix}:${i}`);
        expect(result).toEqual({ data: `value-${i}` });
      }
    });

    test('should handle large values', async () => {
      const key = 'large-value-test';
      const largeValue = {
        data: 'x'.repeat(10000), // 10KB string
        array: Array(1000).fill('test'),
        nested: {
          deep: {
            value: 'nested-value'
          }
        }
      };

      await UnifiedCache.set(key, largeValue, 60);
      const result = await UnifiedCache.get(key);

      expect(result).toEqual(largeValue);
    });
  });
});
