/**
 * Resume Export Service
 * Handles exporting resumes to various formats (PDF, DOCX, JSON)
 */

import { Resume, ExportFormat, ExportResult, ResumeError, ResumeErrorCode, PersonalInfo, Education, Experience, Project, Skill, Certification, Award, CustomContent } from '@/types/resume';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';

export class ResumeExportService {
  /**
   * Validate export format
   */
  static validateFormat(format: string): format is ExportFormat {
    return ['pdf', 'docx', 'json'].includes(format);
  }

  /**
   * Generate filename for export
   */
  static generateFilename(resume: Resume, format: ExportFormat): string {
    const sanitizedTitle = resume.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50);
    
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitizedTitle}_${timestamp}.${format}`;
  }

  /**
   * Trigger browser download
   */
  static triggerDownload(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      throw new ResumeError(
        'Failed to trigger download',
        ResumeErrorCode.EXPORT_FAILED,
        error
      );
    }
  }

  /**
   * Handle export errors gracefully
   */
  static handleExportError(error: unknown, format: ExportFormat): ExportResult {
    console.error(`Export to ${format.toUpperCase()} failed:`, error);

    let errorMessage = `Failed to export resume as ${format.toUpperCase()}`;
    
    if (error instanceof ResumeError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      filename: '',
    };
  }

  /**
   * Validate resume data before export
   */
  static validateResumeData(resume: Resume | null): void {
    if (!resume) {
      throw new ResumeError(
        'No resume data available for export',
        ResumeErrorCode.VALIDATION_FAILED
      );
    }

    if (!resume.sections || resume.sections.length === 0) {
      throw new ResumeError(
        'Resume must have at least one section',
        ResumeErrorCode.VALIDATION_FAILED
      );
    }
  }

  /**
   * Check if export format is supported
   */
  static isFormatSupported(format: string): boolean {
    return this.validateFormat(format);
  }

  /**
   * Get MIME type for export format
   */
  static getMimeType(format: ExportFormat): string {
    const mimeTypes: Record<ExportFormat, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      json: 'application/json',
    };

    return mimeTypes[format];
  }

  /**
   * Estimate export time (for progress indicators)
   */
  static estimateExportTime(resume: Resume, format: ExportFormat): number {
    // Base time in milliseconds
    const baseTimes: Record<ExportFormat, number> = {
      pdf: 2000,
      docx: 2500,
      json: 100,
    };

    // Add time based on content size
    const sectionCount = resume.sections.length;
    const additionalTime = sectionCount * 100;

    return baseTimes[format] + additionalTime;
  }

  /**
   * Export resume to PDF format
   */
  static async exportToPDF(resume: Resume, elementId: string = 'resume-preview'): Promise<ExportResult> {
    try {
      this.validateResumeData(resume);

      // Get the resume preview element
      const element = document.getElementById(elementId);
      if (!element) {
        throw new ResumeError(
          'Resume preview element not found',
          ResumeErrorCode.EXPORT_FAILED
        );
      }

      // Capture the element as canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate dimensions for PDF (8.5" x 11" letter size)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Handle multi-page resumes
      let heightLeft = imgHeight - 297; // A4 height in mm
      let position = 0;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Generate blob
      const blob = pdf.output('blob');
      
      // Generate filename
      const filename = this.generateFilename(resume, 'pdf');

      return {
        success: true,
        blob,
        filename,
      };
    } catch (error) {
      return this.handleExportError(error, 'pdf');
    }
  }

  /**
   * Export resume to DOCX format
   */
  static async exportToDOCX(resume: Resume): Promise<ExportResult> {
    try {
      this.validateResumeData(resume);

      const sections: Paragraph[] = [];

      // Process each section
      for (const section of resume.sections.filter(s => s.visible)) {
        switch (section.type) {
          case 'personal_info':
            sections.push(...this.createPersonalInfoSection(section.content as PersonalInfo));
            break;
          case 'education':
            sections.push(...this.createEducationSection(section.content as Education[]));
            break;
          case 'experience':
            sections.push(...this.createExperienceSection(section.content as Experience[]));
            break;
          case 'projects':
            sections.push(...this.createProjectsSection(section.content as Project[]));
            break;
          case 'skills':
            sections.push(...this.createSkillsSection(section.content as Skill[]));
            break;
          case 'certifications':
            sections.push(...this.createCertificationsSection(section.content as Certification[]));
            break;
          case 'awards':
            sections.push(...this.createAwardsSection(section.content as Award[]));
            break;
          case 'custom':
            sections.push(...this.createCustomSection(section.content as CustomContent, section.title));
            break;
        }
      }

      // Create document
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(resume.styling.margin_top),
                bottom: convertInchesToTwip(resume.styling.margin_bottom),
                left: convertInchesToTwip(resume.styling.margin_left),
                right: convertInchesToTwip(resume.styling.margin_right),
              },
            },
          },
          children: sections,
        }],
      });

      // Generate blob
      const blob = await Packer.toBlob(doc);
      
      // Generate filename
      const filename = this.generateFilename(resume, 'docx');

      return {
        success: true,
        blob,
        filename,
      };
    } catch (error) {
      return this.handleExportError(error, 'docx');
    }
  }

  // Helper methods for DOCX sections
  private static createPersonalInfoSection(content: PersonalInfo): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Name
    if (content.full_name) {
      paragraphs.push(
        new Paragraph({
          text: content.full_name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );
    }

    // Contact info
    const contactInfo: string[] = [];
    if (content.email) contactInfo.push(content.email);
    if (content.phone) contactInfo.push(content.phone);
    if (content.location) contactInfo.push(content.location);

    if (contactInfo.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: contactInfo.join(' | '),
          alignment: AlignmentType.CENTER,
        })
      );
    }

    // Links
    const links: string[] = [];
    if (content.website) links.push(content.website);
    if (content.linkedin) links.push(content.linkedin);
    if (content.github) links.push(content.github);

    if (links.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: links.join(' | '),
          alignment: AlignmentType.CENTER,
        })
      );
    }

    // Summary
    if (content.summary) {
      paragraphs.push(new Paragraph({ text: '' })); // Spacing
      paragraphs.push(
        new Paragraph({
          text: content.summary,
        })
      );
    }

    paragraphs.push(new Paragraph({ text: '' })); // Spacing
    return paragraphs;
  }

  private static createEducationSection(content: Education[]): Paragraph[] {
    if (!content || content.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: 'Education',
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    content.forEach((edu) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.institution, bold: true }),
            new TextRun({ text: ` - ${edu.degree} in ${edu.field}` }),
          ],
        })
      );

      const dates = edu.current ? `${edu.start_date} - Present` : `${edu.start_date} - ${edu.end_date || ''}`;
      paragraphs.push(new Paragraph({ text: dates }));

      if (edu.gpa) {
        paragraphs.push(new Paragraph({ text: `GPA: ${edu.gpa}` }));
      }

      if (edu.achievements && edu.achievements.length > 0) {
        edu.achievements.forEach((achievement) => {
          paragraphs.push(new Paragraph({ text: `• ${achievement}` }));
        });
      }

      paragraphs.push(new Paragraph({ text: '' })); // Spacing
    });

    return paragraphs;
  }

  private static createExperienceSection(content: Experience[]): Paragraph[] {
    if (!content || content.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: 'Work Experience',
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    content.forEach((exp) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true }),
            new TextRun({ text: ` - ${exp.company}` }),
          ],
        })
      );

      const dates = exp.current ? `${exp.start_date} - Present` : `${exp.start_date} - ${exp.end_date || ''}`;
      paragraphs.push(new Paragraph({ text: `${dates} | ${exp.location}` }));

      if (exp.description) {
        paragraphs.push(new Paragraph({ text: exp.description }));
      }

      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement) => {
          paragraphs.push(new Paragraph({ text: `• ${achievement}` }));
        });
      }

      paragraphs.push(new Paragraph({ text: '' })); // Spacing
    });

    return paragraphs;
  }

  private static createProjectsSection(content: Project[]): Paragraph[] {
    if (!content || content.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: 'Projects',
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    content.forEach((project) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: project.name, bold: true }),
          ],
        })
      );

      if (project.description) {
        paragraphs.push(new Paragraph({ text: project.description }));
      }

      if (project.technologies && project.technologies.length > 0) {
        paragraphs.push(
          new Paragraph({ text: `Technologies: ${project.technologies.join(', ')}` })
        );
      }

      if (project.url || project.github) {
        const links: string[] = [];
        if (project.url) links.push(project.url);
        if (project.github) links.push(project.github);
        paragraphs.push(new Paragraph({ text: links.join(' | ') }));
      }

      paragraphs.push(new Paragraph({ text: '' })); // Spacing
    });

    return paragraphs;
  }

  private static createSkillsSection(content: Skill[]): Paragraph[] {
    if (!content || content.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: 'Skills',
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    content.forEach((skill) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${skill.category}: `, bold: true }),
            new TextRun({ text: skill.items.join(', ') }),
          ],
        })
      );
    });

    paragraphs.push(new Paragraph({ text: '' })); // Spacing
    return paragraphs;
  }

  private static createCertificationsSection(content: Certification[]): Paragraph[] {
    if (!content || content.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: 'Certifications',
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    content.forEach((cert) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true }),
            new TextRun({ text: ` - ${cert.issuer}` }),
          ],
        })
      );

      paragraphs.push(new Paragraph({ text: cert.date }));

      if (cert.credential_id) {
        paragraphs.push(new Paragraph({ text: `Credential ID: ${cert.credential_id}` }));
      }

      paragraphs.push(new Paragraph({ text: '' })); // Spacing
    });

    return paragraphs;
  }

  private static createAwardsSection(content: Award[]): Paragraph[] {
    if (!content || content.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: 'Awards & Honors',
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    content.forEach((award) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: award.title, bold: true }),
            new TextRun({ text: ` - ${award.issuer}` }),
          ],
        })
      );

      paragraphs.push(new Paragraph({ text: award.date }));

      if (award.description) {
        paragraphs.push(new Paragraph({ text: award.description }));
      }

      paragraphs.push(new Paragraph({ text: '' })); // Spacing
    });

    return paragraphs;
  }

  private static createCustomSection(content: CustomContent, title: string): Paragraph[] {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    if (content.content) {
      paragraphs.push(new Paragraph({ text: content.content }));
    }

    paragraphs.push(new Paragraph({ text: '' })); // Spacing
    return paragraphs;
  }

  /**
   * Export resume to JSON format
   */
  static async exportToJSON(resume: Resume): Promise<ExportResult> {
    try {
      this.validateResumeData(resume);

      // Serialize resume data to JSON with proper indentation
      const jsonString = JSON.stringify(resume, null, 2);
      
      // Create blob
      const blob = new Blob([jsonString], { type: this.getMimeType('json') });
      
      // Generate filename
      const filename = this.generateFilename(resume, 'json');

      return {
        success: true,
        blob,
        filename,
      };
    } catch (error) {
      return this.handleExportError(error, 'json');
    }
  }
}
