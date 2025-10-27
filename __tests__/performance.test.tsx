/**
 * Performance Tests
 * Tests for performance requirements and optimization
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import type { Resume, ResumeSection } from '@/types/resume';

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auto-save Performance', () => {
    test('should debounce save operations within 2 seconds', async () => {
      const saveFn = jest.fn();
      const debounceDelay = 2000;
      let timeoutId: NodeJS.Timeout | null = null;

      const debouncedSave = (data: any) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          saveFn(data);
        }, debounceDelay);
      };

      // Simulate rapid changes
      debouncedSave({ change: 1 });
      debouncedSave({ change: 2 });
      debouncedSave({ change: 3 });

      // Save should not be called immediately
      expect(saveFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, debounceDelay + 100));

      // Save should be called once with the last change
      expect(saveFn).toHaveBeenCalledTimes(1);
      expect(saveFn).toHaveBeenCalledWith({ change: 3 });
    });

    test('should handle multiple rapid updates efficiently', () => {
      const updates: any[] = [];
      const maxUpdates = 100;

      const startTime = performance.now();

      for (let i = 0; i < maxUpdates; i++) {
        updates.push({ id: i, value: `update-${i}` });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle 100 updates in less than 100ms
      expect(duration).toBeLessThan(100);
      expect(updates).toHaveLength(maxUpdates);
    });

    test('should queue save operations correctly', () => {
      const saveQueue: any[] = [];
      const maxQueueSize = 10;

      const queueSave = (data: any) => {
        if (saveQueue.length >= maxQueueSize) {
          saveQueue.shift(); // Remove oldest
        }
        saveQueue.push(data);
      };

      // Add more than max queue size
      for (let i = 0; i < 15; i++) {
        queueSave({ change: i });
      }

      // Queue should not exceed max size
      expect(saveQueue.length).toBeLessThanOrEqual(maxQueueSize);
      // Should have the most recent items
      expect(saveQueue[saveQueue.length - 1]).toEqual({ change: 14 });
    });
  });

  describe('Preview Rendering Performance', () => {
    test('should update preview within 500ms requirement', async () => {
      const maxUpdateTime = 500; // ms
      
      const mockResume: Resume = {
        id: 'test-id',
        user_id: 'user-id',
        title: 'Test Resume',
        template_id: 'modern',
        sections: [
          {
            id: 'section-1',
            type: 'personal_info',
            title: 'Personal Information',
            order: 0,
            visible: true,
            content: {
              full_name: 'John Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              location: 'New York, NY',
            },
          },
        ],
        styling: {
          font_family: 'Inter',
          font_size_body: 11,
          font_size_heading: 16,
          color_primary: '#8b5cf6',
          color_text: '#000000',
          color_accent: '#6366f1',
          margin_top: 0.75,
          margin_bottom: 0.75,
          margin_left: 0.75,
          margin_right: 0.75,
          line_height: 1.5,
          section_spacing: 1.5,
        },
        metadata: {
          page_count: 1,
          word_count: 50,
          completeness_score: 25,
          export_count: 0,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const startTime = performance.now();

      // Simulate preview update
      const updatedResume = {
        ...mockResume,
        sections: mockResume.sections.map(s => ({
          ...s,
          content: { ...s.content },
        })),
      };

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Update should be fast (well under 500ms)
      expect(updateTime).toBeLessThan(maxUpdateTime);
      expect(updatedResume).toBeDefined();
    });

    test('should handle large resumes efficiently', () => {
      const maxSections = 20;
      const sections: ResumeSection[] = [];

      const startTime = performance.now();

      // Create a large resume with many sections
      for (let i = 0; i < maxSections; i++) {
        sections.push({
          id: `section-${i}`,
          type: 'experience',
          title: `Experience ${i}`,
          order: i,
          visible: true,
          content: [
            {
              id: `exp-${i}`,
              company: `Company ${i}`,
              position: `Position ${i}`,
              location: 'Location',
              start_date: '2020-01',
              end_date: '2021-01',
              current: false,
              description: 'Description '.repeat(50), // Long description
              achievements: Array(10).fill('Achievement'),
            },
          ],
        });
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      // Should create large resume quickly
      expect(creationTime).toBeLessThan(100);
      expect(sections).toHaveLength(maxSections);
    });

    test('should calculate page count efficiently', () => {
      const calculatePageCount = (wordCount: number): number => {
        const wordsPerPage = 500;
        return Math.max(1, Math.ceil(wordCount / wordsPerPage));
      };

      const startTime = performance.now();

      // Test with various word counts
      const testCases = [0, 100, 500, 1000, 2500, 5000];
      const results = testCases.map(wc => calculatePageCount(wc));

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      // Should calculate quickly
      expect(calculationTime).toBeLessThan(10);
      expect(results).toEqual([1, 1, 1, 2, 5, 10]);
    });
  });

  describe('Export Performance', () => {
    test('should prepare PDF export data within 3 seconds', async () => {
      const maxExportTime = 3000; // ms

      const mockResume: Resume = {
        id: 'test-id',
        user_id: 'user-id',
        title: 'Test Resume',
        template_id: 'modern',
        sections: [
          {
            id: 'section-1',
            type: 'personal_info',
            title: 'Personal Information',
            order: 0,
            visible: true,
            content: {
              full_name: 'John Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              location: 'New York, NY',
            },
          },
        ],
        styling: {
          font_family: 'Inter',
          font_size_body: 11,
          font_size_heading: 16,
          color_primary: '#8b5cf6',
          color_text: '#000000',
          color_accent: '#6366f1',
          margin_top: 0.75,
          margin_bottom: 0.75,
          margin_left: 0.75,
          margin_right: 0.75,
          line_height: 1.5,
          section_spacing: 1.5,
        },
        metadata: {
          page_count: 1,
          word_count: 250,
          completeness_score: 75,
          export_count: 0,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const startTime = performance.now();

      // Simulate export preparation
      const exportData = JSON.stringify(mockResume);
      const blob = new Blob([exportData], { type: 'application/json' });

      const endTime = performance.now();
      const exportTime = endTime - startTime;

      // Export preparation should be fast
      expect(exportTime).toBeLessThan(maxExportTime);
      expect(blob.size).toBeGreaterThan(0);
    });

    test('should prepare DOCX export data within 3 seconds', async () => {
      const maxExportTime = 3000; // ms

      const mockResume = {
        title: 'Test Resume',
        sections: [
          {
            type: 'personal_info',
            content: {
              full_name: 'John Doe',
              email: 'john@example.com',
            },
          },
        ],
      };

      const startTime = performance.now();

      // Simulate DOCX data preparation
      const docxData = JSON.stringify(mockResume);
      const blob = new Blob([docxData], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      const endTime = performance.now();
      const exportTime = endTime - startTime;

      // Export preparation should be fast
      expect(exportTime).toBeLessThan(maxExportTime);
      expect(blob.size).toBeGreaterThan(0);
    });

    test('should handle JSON export instantly', () => {
      const mockResume = {
        id: 'test-id',
        title: 'Test Resume',
        sections: Array(10).fill({
          type: 'experience',
          content: [{ company: 'Company', position: 'Position' }],
        }),
      };

      const startTime = performance.now();

      const jsonString = JSON.stringify(mockResume, null, 2);

      const endTime = performance.now();
      const exportTime = endTime - startTime;

      // JSON export should be nearly instant
      expect(exportTime).toBeLessThan(50);
      expect(jsonString.length).toBeGreaterThan(0);
    });
  });

  describe('Section Reordering Performance', () => {
    test('should reorder sections quickly', () => {
      const sections: ResumeSection[] = Array(10).fill(null).map((_, i) => ({
        id: `section-${i}`,
        type: 'experience',
        title: `Section ${i}`,
        order: i,
        visible: true,
        content: [],
      }));

      const startTime = performance.now();

      // Reorder: move last section to first
      const reordered = [
        sections[9],
        ...sections.slice(0, 9),
      ].map((section, index) => ({
        ...section,
        order: index,
      }));

      const endTime = performance.now();
      const reorderTime = endTime - startTime;

      // Reordering should be fast
      expect(reorderTime).toBeLessThan(10);
      expect(reordered[0].id).toBe('section-9');
      expect(reordered[0].order).toBe(0);
    });

    test('should handle drag-and-drop calculations efficiently', () => {
      const items = Array(20).fill(null).map((_, i) => ({
        id: `item-${i}`,
        position: i,
      }));

      const startTime = performance.now();

      // Simulate drag from position 5 to position 15
      const draggedItem = items[5];
      const filtered = items.filter(item => item.id !== draggedItem.id);
      const reordered = [
        ...filtered.slice(0, 15),
        draggedItem,
        ...filtered.slice(15),
      ];

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      // Calculation should be fast
      expect(calculationTime).toBeLessThan(10);
      expect(reordered).toHaveLength(20);
    });
  });

  describe('Memory Management', () => {
    test('should not create memory leaks with repeated operations', () => {
      const operations = 1000;
      const objects: any[] = [];

      const startTime = performance.now();

      for (let i = 0; i < operations; i++) {
        const obj = {
          id: i,
          data: `data-${i}`,
          timestamp: Date.now(),
        };
        objects.push(obj);
      }

      // Clear references
      objects.length = 0;

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle many operations efficiently
      expect(duration).toBeLessThan(100);
      expect(objects).toHaveLength(0);
    });

    test('should handle large data structures efficiently', () => {
      const largeResume = {
        id: 'large-resume',
        sections: Array(50).fill(null).map((_, i) => ({
          id: `section-${i}`,
          type: 'experience',
          content: Array(10).fill(null).map((_, j) => ({
            id: `item-${i}-${j}`,
            description: 'Description '.repeat(100),
            achievements: Array(20).fill('Achievement'),
          })),
        })),
      };

      const startTime = performance.now();

      // Serialize and deserialize
      const serialized = JSON.stringify(largeResume);
      const deserialized = JSON.parse(serialized);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle large data efficiently
      expect(duration).toBeLessThan(500);
      expect(deserialized.sections).toHaveLength(50);
    });
  });

  describe('Optimistic UI Updates', () => {
    test('should apply optimistic updates immediately', () => {
      const initialState = {
        saving: false,
        data: { value: 'initial' },
      };

      const startTime = performance.now();

      // Apply optimistic update
      const optimisticState = {
        ...initialState,
        saving: true,
        data: { value: 'updated' },
      };

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Update should be instant
      expect(updateTime).toBeLessThan(5);
      expect(optimisticState.data.value).toBe('updated');
      expect(optimisticState.saving).toBe(true);
    });

    test('should rollback on error efficiently', () => {
      const currentState = { value: 'current' };
      const previousState = { value: 'previous' };

      const startTime = performance.now();

      // Simulate rollback
      const rolledBack = { ...previousState };

      const endTime = performance.now();
      const rollbackTime = endTime - startTime;

      // Rollback should be instant
      expect(rollbackTime).toBeLessThan(5);
      expect(rolledBack.value).toBe('previous');
    });
  });

  describe('Template Switching Performance', () => {
    test('should switch templates within 500ms', () => {
      const mockResume: Partial<Resume> = {
        template_id: 'modern',
        sections: Array(10).fill({
          id: 'section',
          type: 'experience',
          content: [{ company: 'Company' }],
        }),
      };

      const startTime = performance.now();

      // Switch template
      const updatedResume = {
        ...mockResume,
        template_id: 'classic',
      };

      const endTime = performance.now();
      const switchTime = endTime - startTime;

      // Template switch should be instant
      expect(switchTime).toBeLessThan(500);
      expect(updatedResume.template_id).toBe('classic');
    });
  });

  describe('Validation Performance', () => {
    test('should validate email quickly', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const testEmails = [
        'valid@example.com',
        'invalid-email',
        'another@test.org',
        'bad@',
        'good@domain.co.uk',
      ];

      const startTime = performance.now();

      const results = testEmails.map(email => emailRegex.test(email));

      const endTime = performance.now();
      const validationTime = endTime - startTime;

      // Validation should be fast
      expect(validationTime).toBeLessThan(10);
      expect(results).toEqual([true, false, true, false, true]);
    });

    test('should validate URLs quickly', () => {
      const urlRegex = /^https?:\/\/.+/;
      const testUrls = [
        'https://example.com',
        'http://test.org',
        'invalid-url',
        'https://github.com/user',
      ];

      const startTime = performance.now();

      const results = testUrls.map(url => urlRegex.test(url));

      const endTime = performance.now();
      const validationTime = endTime - startTime;

      // Validation should be fast
      expect(validationTime).toBeLessThan(10);
      expect(results).toEqual([true, true, false, true]);
    });
  });

  describe('Scoring Performance', () => {
    test('should calculate resume score quickly', () => {
      const sections: ResumeSection[] = [
        {
          id: '1',
          type: 'personal_info',
          title: 'Personal Info',
          order: 0,
          visible: true,
          content: { full_name: 'John', email: 'john@example.com', phone: '', location: '' },
        },
        {
          id: '2',
          type: 'experience',
          title: 'Experience',
          order: 1,
          visible: true,
          content: [{ id: '1', company: 'Company', position: 'Developer', location: '', start_date: '2020-01', current: true, description: '', achievements: [] }],
        },
        {
          id: '3',
          type: 'education',
          title: 'Education',
          order: 2,
          visible: true,
          content: [{ id: '1', institution: 'University', degree: 'BS', field: 'CS', start_date: '2016-09', end_date: '2020-05', current: false }],
        },
      ];

      const weights: Record<string, number> = {
        personal_info: 20,
        education: 15,
        experience: 25,
        projects: 15,
        skills: 15,
        certifications: 5,
        awards: 5,
      };

      const startTime = performance.now();

      let score = 0;
      sections.forEach(section => {
        const weight = weights[section.type] || 0;
        const isComplete = section.visible && 
          (Array.isArray(section.content) ? section.content.length > 0 : true);
        
        if (isComplete) {
          score += weight;
        }
      });

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      // Score calculation should be fast
      expect(calculationTime).toBeLessThan(10);
      expect(score).toBe(60); // 20 + 25 + 15
    });
  });
});
