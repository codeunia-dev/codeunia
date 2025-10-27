import { Resume, PersonalInfo, Education, Experience, Project, Certification, Award, CustomContent } from '@/types/resume';

/**
 * Calculate the word count for a resume
 */
export function calculateWordCount(resume: Resume): number {
  let wordCount = 0;

  // Helper to count words in a string
  const countWords = (text: string): number => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Count words in each section
  resume.sections.forEach((section) => {
    if (!section.visible) return;

    switch (section.type) {
      case 'personal_info': {
        const content = section.content as PersonalInfo;
        wordCount += countWords(content.full_name || '');
        wordCount += countWords(content.email || '');
        wordCount += countWords(content.phone || '');
        wordCount += countWords(content.location || '');
        wordCount += countWords(content.website || '');
        wordCount += countWords(content.linkedin || '');
        wordCount += countWords(content.github || '');
        wordCount += countWords(content.summary || '');
        break;
      }

      case 'education': {
        const content = section.content as Education[];
        content.forEach((edu) => {
          wordCount += countWords(edu.institution);
          wordCount += countWords(edu.degree);
          wordCount += countWords(edu.field);
          wordCount += countWords(edu.gpa || '');
          if (edu.achievements) {
            edu.achievements.forEach((achievement) => {
              wordCount += countWords(achievement);
            });
          }
        });
        break;
      }

      case 'experience': {
        const content = section.content as Experience[];
        content.forEach((exp) => {
          wordCount += countWords(exp.company);
          wordCount += countWords(exp.position);
          wordCount += countWords(exp.location);
          wordCount += countWords(exp.description);
          exp.achievements.forEach((achievement) => {
            wordCount += countWords(achievement);
          });
        });
        break;
      }

      case 'projects': {
        const content = section.content as Project[];
        content.forEach((project) => {
          wordCount += countWords(project.name);
          wordCount += countWords(project.description);
          project.technologies.forEach((tech) => {
            wordCount += countWords(tech);
          });
          wordCount += countWords(project.url || '');
          wordCount += countWords(project.github || '');
        });
        break;
      }

      case 'skills': {
        const content = section.content as Array<{ category: string; items: string[] }>;
        content.forEach((skillGroup) => {
          wordCount += countWords(skillGroup.category);
          skillGroup.items.forEach((item) => {
            wordCount += countWords(item);
          });
        });
        break;
      }

      case 'certifications': {
        const content = section.content as Certification[];
        content.forEach((cert) => {
          wordCount += countWords(cert.name);
          wordCount += countWords(cert.issuer);
          wordCount += countWords(cert.credential_id || '');
          wordCount += countWords(cert.url || '');
        });
        break;
      }

      case 'awards': {
        const content = section.content as Award[];
        content.forEach((award) => {
          wordCount += countWords(award.title);
          wordCount += countWords(award.issuer);
          wordCount += countWords(award.description || '');
        });
        break;
      }

      case 'custom': {
        const content = section.content as CustomContent;
        wordCount += countWords(content.title);
        wordCount += countWords(content.content);
        break;
      }
    }
  });

  return wordCount;
}

/**
 * Calculate the page count based on content length
 * This is an approximation - actual page count depends on template and styling
 */
export function calculatePageCount(resume: Resume): number {
  const wordCount = calculateWordCount(resume);
  
  // Average words per page for a resume (considering formatting, spacing, etc.)
  const WORDS_PER_PAGE = 400;
  
  // Calculate pages, minimum 1
  const pages = Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE));
  
  return pages;
}

/**
 * Update resume metadata with calculated values
 */
export function updateResumeMetadata(resume: Resume): Resume {
  const wordCount = calculateWordCount(resume);
  const pageCount = calculatePageCount(resume);

  return {
    ...resume,
    metadata: {
      ...resume.metadata,
      word_count: wordCount,
      page_count: pageCount,
    },
  };
}

/**
 * Record an export event in metadata
 */
export function recordExport(resume: Resume): Resume {
  return {
    ...resume,
    metadata: {
      ...resume.metadata,
      last_exported: new Date().toISOString(),
      export_count: (resume.metadata.export_count || 0) + 1,
    },
  };
}

/**
 * Format metadata for display
 */
export function formatMetadata(resume: Resume) {
  const { word_count, page_count, last_exported, export_count } = resume.metadata;

  return {
    wordCount: word_count || 0,
    pageCount: page_count || 1,
    lastExported: last_exported ? new Date(last_exported) : null,
    exportCount: export_count || 0,
  };
}
