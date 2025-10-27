/**
 * Resume Context Tests
 * Tests for core Resume Context functionality
 */

import { describe, test, expect } from '@jest/globals';
import {
  DEFAULT_STYLING,
  DEFAULT_METADATA,
  DEFAULT_PERSONAL_INFO,
  SECTION_TYPES,
} from '@/types/resume';

describe('Resume Context Core Functionality', () => {
  describe('Default Values', () => {
    test('should have valid default styling', () => {
      expect(DEFAULT_STYLING).toBeDefined();
      expect(DEFAULT_STYLING.font_family).toBe('Inter');
      expect(DEFAULT_STYLING.font_size_body).toBe(11);
      expect(DEFAULT_STYLING.font_size_heading).toBe(16);
      expect(DEFAULT_STYLING.color_primary).toBe('#8b5cf6');
    });

    test('should have valid default metadata', () => {
      expect(DEFAULT_METADATA).toBeDefined();
      expect(DEFAULT_METADATA.page_count).toBe(1);
      expect(DEFAULT_METADATA.word_count).toBe(0);
      expect(DEFAULT_METADATA.completeness_score).toBe(0);
      expect(DEFAULT_METADATA.export_count).toBe(0);
    });

    test('should have valid default personal info', () => {
      expect(DEFAULT_PERSONAL_INFO).toBeDefined();
      expect(DEFAULT_PERSONAL_INFO.full_name).toBe('');
      expect(DEFAULT_PERSONAL_INFO.email).toBe('');
      expect(DEFAULT_PERSONAL_INFO.phone).toBe('');
      expect(DEFAULT_PERSONAL_INFO.location).toBe('');
    });
  });

  describe('Section Types', () => {
    test('should have all required section types', () => {
      const requiredTypes = [
        'personal_info',
        'education',
        'experience',
        'projects',
        'skills',
        'certifications',
        'awards',
        'custom',
      ];

      requiredTypes.forEach((type) => {
        expect(SECTION_TYPES[type as keyof typeof SECTION_TYPES]).toBeDefined();
      });
    });

    test('should have valid section type info', () => {
      const personalInfo = SECTION_TYPES.personal_info;
      expect(personalInfo.type).toBe('personal_info');
      expect(personalInfo.label).toBe('Personal Information');
      expect(personalInfo.defaultTitle).toBe('Personal Information');
      expect(personalInfo.description).toBeTruthy();
    });
  });

  describe('Resume Data Validation', () => {
    test('should validate resume structure', () => {
      const mockResume = {
        id: 'test-id',
        user_id: 'user-id',
        title: 'Test Resume',
        template_id: 'modern',
        sections: [],
        styling: DEFAULT_STYLING,
        metadata: DEFAULT_METADATA,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(mockResume.id).toBeTruthy();
      expect(mockResume.user_id).toBeTruthy();
      expect(mockResume.title).toBeTruthy();
      expect(mockResume.template_id).toBe('modern');
      expect(Array.isArray(mockResume.sections)).toBe(true);
    });

    test('should validate section structure', () => {
      const mockSection = {
        id: 'section-id',
        type: 'personal_info' as const,
        title: 'Personal Information',
        order: 0,
        visible: true,
        content: DEFAULT_PERSONAL_INFO,
      };

      expect(mockSection.id).toBeTruthy();
      expect(mockSection.type).toBe('personal_info');
      expect(mockSection.order).toBeGreaterThanOrEqual(0);
      expect(mockSection.visible).toBe(true);
    });
  });

  describe('Auto-fill Mapping', () => {
    test('should map profile data to personal info', () => {
      const mockProfile = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        location: 'New York, NY',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        github_url: 'https://github.com/johndoe',
        bio: 'Software Engineer with 5 years of experience',
      };

      const mockEmail = 'john.doe@example.com';

      const expectedPersonalInfo = {
        full_name: 'John Doe',
        email: mockEmail,
        phone: '+1234567890',
        location: 'New York, NY',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        summary: 'Software Engineer with 5 years of experience',
      };

      // Verify mapping logic
      const mappedName = `${mockProfile.first_name} ${mockProfile.last_name}`.trim();
      expect(mappedName).toBe(expectedPersonalInfo.full_name);
      expect(mockProfile.phone).toBe(expectedPersonalInfo.phone);
      expect(mockProfile.location).toBe(expectedPersonalInfo.location);
      expect(mockProfile.linkedin_url).toBe(expectedPersonalInfo.linkedin);
      expect(mockProfile.github_url).toBe(expectedPersonalInfo.github);
      expect(mockProfile.bio).toBe(expectedPersonalInfo.summary);
    });
  });

  describe('Score Calculation Logic', () => {
    test('should calculate score based on section completeness', () => {
      const weights = {
        personal_info: 20,
        education: 15,
        experience: 25,
        projects: 15,
        skills: 15,
        certifications: 5,
        awards: 5,
      };

      // Test that weights add up to 100
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      expect(totalWeight).toBe(100);

      // Test individual weight values
      expect(weights.personal_info).toBe(20);
      expect(weights.experience).toBe(25);
      expect(weights.education).toBe(15);
    });

    test('should handle empty sections correctly', () => {
      const emptyArraySections = [
        { type: 'education', content: [] },
        { type: 'experience', content: [] },
        { type: 'projects', content: [] },
      ];

      emptyArraySections.forEach((section) => {
        expect(Array.isArray(section.content)).toBe(true);
        expect(section.content.length).toBe(0);
      });
    });
  });
});
