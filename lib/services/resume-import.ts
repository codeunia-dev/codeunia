/* eslint-disable @typescript-eslint/no-explicit-any */
import { Resume, ResumeSection, SectionType, SectionContent } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';

export interface ImportResult {
  success: boolean;
  resume?: Partial<Resume>;
  errors: string[];
  warnings: string[];
  fieldsPopulated: number;
}

export interface ImportValidationError {
  field: string;
  message: string;
}

export class ResumeImportService {
  /**
   * Import resume data from JSON string
   */
  static async importFromJSON(jsonString: string, userId: string): Promise<ImportResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let fieldsPopulated = 0;

    try {
      // Parse JSON
      const data = JSON.parse(jsonString);

      // Validate basic structure
      const validationErrors = this.validateStructure(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors.map(e => e.message),
          warnings,
          fieldsPopulated: 0,
        };
      }

      // Map imported data to resume schema
      const resume = this.mapToResumeSchema(data, userId);
      
      // Count populated fields
      fieldsPopulated = this.countPopulatedFields(resume);

      // Check for unrecognized fields
      const unrecognizedFields = this.findUnrecognizedFields(data);
      if (unrecognizedFields.length > 0) {
        warnings.push(
          `Unrecognized fields found and ignored: ${unrecognizedFields.join(', ')}`
        );
      }

      return {
        success: true,
        resume,
        errors,
        warnings,
        fieldsPopulated,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        errors.push('Invalid JSON format. Please check your file and try again.');
      } else {
        errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      return {
        success: false,
        errors,
        warnings,
        fieldsPopulated: 0,
      };
    }
  }

  /**
   * Validate the structure of imported data
   */
  private static validateStructure(data: any): ImportValidationError[] {
    const errors: ImportValidationError[] = [];

    if (!data || typeof data !== 'object') {
      errors.push({ field: 'root', message: 'Invalid data format. Expected an object.' });
      return errors;
    }

    // Check for required fields
    if (data.sections && !Array.isArray(data.sections)) {
      errors.push({ field: 'sections', message: 'Sections must be an array.' });
    }

    // Validate sections if present
    if (Array.isArray(data.sections)) {
      data.sections.forEach((section: any, index: number) => {
        if (!section.type) {
          errors.push({ 
            field: `sections[${index}]`, 
            message: 'Section must have a type.' 
          });
        }
        if (!section.content) {
          errors.push({ 
            field: `sections[${index}]`, 
            message: 'Section must have content.' 
          });
        }
      });
    }

    return errors;
  }

  /**
   * Map imported data to resume schema
   */
  private static mapToResumeSchema(data: any, userId: string): Partial<Resume> {
    const now = new Date().toISOString();
    
    const resume: Partial<Resume> = {
      id: data.id || uuidv4(),
      user_id: userId,
      title: data.title || 'Imported Resume',
      template_id: data.template_id || 'modern',
      sections: this.mapSections(data.sections || []),
      styling: this.mapStyling(data.styling || {}),
      metadata: this.mapMetadata(data.metadata || {}),
      created_at: data.created_at || now,
      updated_at: now,
    };

    return resume;
  }

  /**
   * Map sections from imported data
   */
  private static mapSections(sections: any[]): ResumeSection[] {
    return sections
      .filter(section => this.isValidSectionType(section.type))
      .map((section, index) => ({
        id: section.id || uuidv4(),
        type: section.type as SectionType,
        title: section.title || this.getDefaultSectionTitle(section.type),
        order: section.order ?? index,
        visible: section.visible ?? true,
        content: this.mapSectionContent(section.type, section.content),
      }));
  }

  /**
   * Map section content based on type
   */
  private static mapSectionContent(type: SectionType, content: any): SectionContent {
    switch (type) {
      case 'personal_info':
        return {
          full_name: content.full_name || '',
          email: content.email || '',
          phone: content.phone || '',
          location: content.location || '',
          website: content.website,
          linkedin: content.linkedin,
          github: content.github,
          summary: content.summary,
        };

      case 'education':
        return Array.isArray(content) 
          ? content.map(edu => ({
              id: edu.id || uuidv4(),
              institution: edu.institution || '',
              degree: edu.degree || '',
              field: edu.field || '',
              start_date: edu.start_date || '',
              end_date: edu.end_date,
              current: edu.current || false,
              gpa: edu.gpa,
              achievements: Array.isArray(edu.achievements) ? edu.achievements : [],
            }))
          : [];

      case 'experience':
        return Array.isArray(content)
          ? content.map(exp => ({
              id: exp.id || uuidv4(),
              company: exp.company || '',
              position: exp.position || '',
              location: exp.location || '',
              start_date: exp.start_date || '',
              end_date: exp.end_date,
              current: exp.current || false,
              description: exp.description || '',
              achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
            }))
          : [];

      case 'projects':
        return Array.isArray(content)
          ? content.map(proj => ({
              id: proj.id || uuidv4(),
              name: proj.name || '',
              description: proj.description || '',
              technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
              url: proj.url,
              github: proj.github,
              start_date: proj.start_date,
              end_date: proj.end_date,
            }))
          : [];

      case 'skills':
        return Array.isArray(content)
          ? content.map(skill => ({
              category: skill.category || 'General',
              items: Array.isArray(skill.items) ? skill.items : [],
            }))
          : [];

      case 'certifications':
        return Array.isArray(content)
          ? content.map(cert => ({
              id: cert.id || uuidv4(),
              name: cert.name || '',
              issuer: cert.issuer || '',
              date: cert.date || '',
              expiry_date: cert.expiry_date,
              credential_id: cert.credential_id,
              url: cert.url,
            }))
          : [];

      case 'awards':
        return Array.isArray(content)
          ? content.map(award => ({
              id: award.id || uuidv4(),
              title: award.title || '',
              issuer: award.issuer || '',
              date: award.date || '',
              description: award.description,
            }))
          : [];

      case 'custom':
        return {
          title: content.title || '',
          content: content.content || '',
        };

      default:
        return content;
    }
  }

  /**
   * Map styling from imported data
   */
  private static mapStyling(styling: any) {
    return {
      font_family: styling.font_family || 'Inter',
      font_size_body: styling.font_size_body || 11,
      font_size_heading: styling.font_size_heading || 16,
      color_primary: styling.color_primary || '#8b5cf6',
      color_text: styling.color_text || '#1f2937',
      color_accent: styling.color_accent || '#6366f1',
      margin_top: styling.margin_top || 0.5,
      margin_bottom: styling.margin_bottom || 0.5,
      margin_left: styling.margin_left || 0.75,
      margin_right: styling.margin_right || 0.75,
      line_height: styling.line_height || 1.5,
      section_spacing: styling.section_spacing || 1.5,
    };
  }

  /**
   * Map metadata from imported data
   */
  private static mapMetadata(metadata: any) {
    return {
      page_count: metadata.page_count || 1,
      word_count: metadata.word_count || 0,
      completeness_score: metadata.completeness_score || 0,
      last_exported: metadata.last_exported,
      export_count: metadata.export_count || 0,
    };
  }

  /**
   * Check if section type is valid
   */
  private static isValidSectionType(type: string): boolean {
    const validTypes: SectionType[] = [
      'personal_info',
      'education',
      'experience',
      'projects',
      'skills',
      'certifications',
      'awards',
      'custom',
    ];
    return validTypes.includes(type as SectionType);
  }

  /**
   * Get default title for section type
   */
  private static getDefaultSectionTitle(type: SectionType): string {
    const titles: Record<SectionType, string> = {
      personal_info: 'Personal Information',
      education: 'Education',
      experience: 'Work Experience',
      projects: 'Projects',
      skills: 'Skills',
      certifications: 'Certifications',
      awards: 'Awards & Honors',
      custom: 'Custom Section',
    };
    return titles[type] || 'Section';
  }

  /**
   * Count populated fields in resume
   */
  private static countPopulatedFields(resume: Partial<Resume>): number {
    let count = 0;

    // Count basic fields
    if (resume.title) count++;
    if (resume.template_id) count++;

    // Count section fields
    resume.sections?.forEach(section => {
      count++; // Section itself
      count += this.countSectionFields(section.content);
    });

    return count;
  }

  /**
   * Count fields in section content
   */
  private static countSectionFields(content: SectionContent): number {
    let count = 0;

    if (Array.isArray(content)) {
      content.forEach(item => {
        Object.values(item).forEach(value => {
          if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            count++;
          }
        });
      });
    } else if (typeof content === 'object') {
      Object.values(content).forEach(value => {
        if (value && value !== '' && (!Array.isArray(value) || value.length > 0)) {
          count++;
        }
      });
    }

    return count;
  }

  /**
   * Find unrecognized fields in imported data
   */
  private static findUnrecognizedFields(data: any): string[] {
    const recognizedFields = [
      'id',
      'user_id',
      'title',
      'template_id',
      'sections',
      'styling',
      'metadata',
      'created_at',
      'updated_at',
    ];

    return Object.keys(data).filter(key => !recognizedFields.includes(key));
  }

  /**
   * Validate file size
   */
  static validateFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Validate file type
   */
  static validateFileType(file: File): boolean {
    return file.type === 'application/json' || file.name.endsWith('.json');
  }
}
