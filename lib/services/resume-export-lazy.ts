/**
 * Lazy-loaded Resume Export Service
 * Dynamically imports heavy export libraries only when needed
 */

import { Resume, ExportFormat, ExportResult, ResumeError, ResumeErrorCode } from '@/types/resume';

export class LazyResumeExportService {
  /**
   * Lazy load and export to PDF
   */
  static async exportToPDF(resume: Resume, elementId: string = 'resume-preview'): Promise<ExportResult> {
    try {
      // Dynamically import the export service only when needed
      const { ResumeExportService } = await import('./resume-export');
      return await ResumeExportService.exportToPDF(resume, elementId);
    } catch (error) {
      console.error('Failed to load PDF export module:', error);
      return {
        success: false,
        error: 'Failed to load PDF export functionality',
        filename: '',
      };
    }
  }

  /**
   * Lazy load and export to DOCX
   */
  static async exportToDOCX(resume: Resume): Promise<ExportResult> {
    try {
      // Dynamically import the export service only when needed
      const { ResumeExportService } = await import('./resume-export');
      return await ResumeExportService.exportToDOCX(resume);
    } catch (error) {
      console.error('Failed to load DOCX export module:', error);
      return {
        success: false,
        error: 'Failed to load DOCX export functionality',
        filename: '',
      };
    }
  }

  /**
   * Export to JSON (no lazy loading needed - lightweight)
   */
  static async exportToJSON(resume: Resume): Promise<ExportResult> {
    try {
      // Dynamically import the export service
      const { ResumeExportService } = await import('./resume-export');
      return await ResumeExportService.exportToJSON(resume);
    } catch (error) {
      console.error('Failed to load JSON export module:', error);
      return {
        success: false,
        error: 'Failed to load JSON export functionality',
        filename: '',
      };
    }
  }

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
}
