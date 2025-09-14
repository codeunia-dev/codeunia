/**
 * API Validation Tests
 * Tests for Zod validation schemas and middleware
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { z } from 'zod';
import { eventSchemas } from '@/lib/validators/schemas';
import { withValidation } from '@/lib/validators/middleware';
import { NextRequest } from 'next/server';

// Mock NextRequest
const createMockRequest = (body?: any, query?: any) => {
  const url = new URL('http://localhost:3000/api/test');
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  return {
    url: url.toString(),
    json: async () => body || {},
    nextUrl: url,
  } as NextRequest;
};

describe('API Validation', () => {
  describe('Event Schemas', () => {
    test('should validate valid event creation data', () => {
      const validData = {
        title: 'Test Event',
        description: 'A test event description',
        start_date: '2024-12-01T10:00:00Z',
        end_date: '2024-12-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 100,
        registration_fee: 50.00,
        category: 'workshop'
      };

      const result = eventSchemas.create.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('should reject invalid event data', () => {
      const invalidData = {
        title: '', // Empty title
        description: 'A test event description',
        start_date: 'invalid-date',
        end_date: '2024-12-01T18:00:00Z',
        location: 'Test Location',
        max_participants: -1, // Negative participants
        registration_fee: -10.00, // Negative fee
        category: 'invalid-category'
      };

      const result = eventSchemas.create.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(5); // Multiple validation errors
      }
    });

    test('should validate event update data', () => {
      const validUpdateData = {
        title: 'Updated Event Title',
        description: 'Updated description',
        max_participants: 150
      };

      const result = eventSchemas.update.safeParse(validUpdateData);
      expect(result.success).toBe(true);
    });

    test('should validate event query parameters', () => {
      const validQuery = {
        page: '1',
        limit: '10',
        category: 'workshop',
        status: 'active'
      };

      const result = eventSchemas.query.safeParse(validQuery);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Middleware', () => {
    const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));

    beforeEach(() => {
      mockHandler.mockClear();
    });

    test('should validate request body successfully', async () => {
      const request = createMockRequest({
        title: 'Test Event',
        description: 'Test description',
        start_date: '2024-12-01T10:00:00Z',
        end_date: '2024-12-01T18:00:00Z',
        location: 'Test Location',
        max_participants: 100,
        registration_fee: 50.00,
        category: 'workshop'
      });

      const validatedHandler = withValidation({
        body: eventSchemas.create
      })(mockHandler);

      const response = await validatedHandler(request);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          validatedData: expect.objectContaining({
            body: expect.objectContaining({
              title: 'Test Event'
            })
          })
        })
      );
    });

    test('should validate query parameters successfully', async () => {
      const request = createMockRequest(undefined, {
        page: '1',
        limit: '10',
        category: 'workshop'
      });

      const validatedHandler = withValidation({
        query: eventSchemas.query
      })(mockHandler);

      const response = await validatedHandler(request);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          validatedData: expect.objectContaining({
            query: expect.objectContaining({
              page: 1,
              limit: 10,
              category: 'workshop'
            })
          })
        })
      );
    });

    test('should return validation error for invalid data', async () => {
      const request = createMockRequest({
        title: '', // Invalid empty title
        description: 'Test description'
      });

      const validatedHandler = withValidation({
        body: eventSchemas.create
      })(mockHandler);

      const response = await validatedHandler(request);
      expect(response.status).toBe(400);
      expect(mockHandler).not.toHaveBeenCalled();

      const responseBody = await response.json();
      expect(responseBody.error).toBe('Validation failed');
      expect(responseBody.details).toBeDefined();
    });

    test('should handle missing validation schema gracefully', async () => {
      const request = createMockRequest({ test: 'data' });

      const validatedHandler = withValidation({})(mockHandler);

      const response = await validatedHandler(request);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          validatedData: {}
        })
      );
    });
  });
});
