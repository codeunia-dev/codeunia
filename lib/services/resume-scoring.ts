// Resume Scoring Service
// Calculates completeness score and provides improvement suggestions

import {
  Resume,
  ResumeSection,
  PersonalInfo,
  Education,
  Experience,
  Project,
  Skill,
  Certification,
  Award,
  CustomContent,
} from '@/types/resume';

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  issues: string[];
}

export interface ResumeSuggestion {
  id: string;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  sectionId?: string;
}

export interface ScoringResult {
  totalScore: number;
  breakdown: ScoreBreakdown[];
  suggestions: ResumeSuggestion[];
  completedCategories: number;
  totalCategories: number;
}

export class ResumeScoringService {
  private static readonly WEIGHTS = {
    personal_info: 20,
    education: 15,
    experience: 25,
    projects: 15,
    skills: 15,
    certifications: 5,
    awards: 5,
  };

  private static readonly MIN_CONTENT_LENGTH = 50;
  private static readonly MIN_SUMMARY_LENGTH = 100;
  private static readonly MIN_DESCRIPTION_LENGTH = 50;

  /**
   * Calculate comprehensive resume score with breakdown
   */
  static calculateScore(resume: Resume | null): ScoringResult {
    if (!resume) {
      return {
        totalScore: 0,
        breakdown: [],
        suggestions: [],
        completedCategories: 0,
        totalCategories: 0,
      };
    }

    const breakdown: ScoreBreakdown[] = [];
    const suggestions: ResumeSuggestion[] = [];
    let totalScore = 0;
    let completedCategories = 0;

    // Score each section type
    const sectionsByType = this.groupSectionsByType(resume.sections);

    // Personal Info
    const personalInfoResult = this.scorePersonalInfo(sectionsByType.personal_info);
    breakdown.push(personalInfoResult.breakdown);
    suggestions.push(...personalInfoResult.suggestions);
    totalScore += personalInfoResult.breakdown.score;
    if (personalInfoResult.breakdown.percentage >= 80) completedCategories++;

    // Education
    const educationResult = this.scoreEducation(sectionsByType.education);
    breakdown.push(educationResult.breakdown);
    suggestions.push(...educationResult.suggestions);
    totalScore += educationResult.breakdown.score;
    if (educationResult.breakdown.percentage >= 80) completedCategories++;

    // Experience
    const experienceResult = this.scoreExperience(sectionsByType.experience);
    breakdown.push(experienceResult.breakdown);
    suggestions.push(...experienceResult.suggestions);
    totalScore += experienceResult.breakdown.score;
    if (experienceResult.breakdown.percentage >= 80) completedCategories++;

    // Projects
    const projectsResult = this.scoreProjects(sectionsByType.projects);
    breakdown.push(projectsResult.breakdown);
    suggestions.push(...projectsResult.suggestions);
    totalScore += projectsResult.breakdown.score;
    if (projectsResult.breakdown.percentage >= 80) completedCategories++;

    // Skills
    const skillsResult = this.scoreSkills(sectionsByType.skills);
    breakdown.push(skillsResult.breakdown);
    suggestions.push(...skillsResult.suggestions);
    totalScore += skillsResult.breakdown.score;
    if (skillsResult.breakdown.percentage >= 80) completedCategories++;

    // Certifications
    const certificationsResult = this.scoreCertifications(sectionsByType.certifications);
    breakdown.push(certificationsResult.breakdown);
    suggestions.push(...certificationsResult.suggestions);
    totalScore += certificationsResult.breakdown.score;
    if (certificationsResult.breakdown.percentage >= 80) completedCategories++;

    // Awards
    const awardsResult = this.scoreAwards(sectionsByType.awards);
    breakdown.push(awardsResult.breakdown);
    suggestions.push(...awardsResult.suggestions);
    totalScore += awardsResult.breakdown.score;
    if (awardsResult.breakdown.percentage >= 80) completedCategories++;

    // Add general best practices suggestions
    suggestions.push(...this.checkBestPractices(resume));

    return {
      totalScore: Math.round(totalScore),
      breakdown,
      suggestions: this.prioritizeSuggestions(suggestions),
      completedCategories,
      totalCategories: 7,
    };
  }

  /**
   * Group sections by type
   */
  private static groupSectionsByType(sections: ResumeSection[]): Record<string, ResumeSection[]> {
    const grouped: Record<string, ResumeSection[]> = {};
    sections.forEach((section) => {
      if (!grouped[section.type]) {
        grouped[section.type] = [];
      }
      grouped[section.type].push(section);
    });
    return grouped;
  }

  /**
   * Score Personal Info section
   */
  private static scorePersonalInfo(sections: ResumeSection[] = []): {
    breakdown: ScoreBreakdown;
    suggestions: ResumeSuggestion[];
  } {
    const maxScore = this.WEIGHTS.personal_info;
    const issues: string[] = [];
    const suggestions: ResumeSuggestion[] = [];

    if (sections.length === 0 || !sections[0].visible) {
      return {
        breakdown: {
          category: 'Personal Information',
          score: 0,
          maxScore,
          percentage: 0,
          issues: ['Section is missing or hidden'],
        },
        suggestions: [
          {
            id: 'personal-info-missing',
            category: 'Personal Information',
            severity: 'critical',
            message: 'Add your personal information including name, email, and contact details',
          },
        ],
      };
    }

    const section = sections[0];
    const content = section.content as PersonalInfo;
    const requiredFields = ['full_name', 'email', 'phone'];
    const optionalFields = ['location', 'linkedin', 'github', 'website', 'summary'];

    let filledRequired = 0;
    let filledOptional = 0;

    // Check required fields
    requiredFields.forEach((field) => {
      const value = content[field as keyof PersonalInfo];
      if (value && String(value).trim().length > 0) {
        filledRequired++;
      } else {
        issues.push(`Missing ${field.replace('_', ' ')}`);
        suggestions.push({
          id: `personal-info-${field}`,
          category: 'Personal Information',
          severity: 'critical',
          message: `Add your ${field.replace('_', ' ')}`,
          sectionId: section.id,
        });
      }
    });

    // Check optional fields
    optionalFields.forEach((field) => {
      const value = content[field as keyof PersonalInfo];
      if (value && String(value).trim().length > 0) {
        filledOptional++;
      }
    });

    // Check summary length
    if (content.summary && content.summary.length < this.MIN_SUMMARY_LENGTH) {
      issues.push('Summary is too short');
      suggestions.push({
        id: 'personal-info-summary-short',
        category: 'Personal Information',
        severity: 'warning',
        message: `Expand your summary to at least ${this.MIN_SUMMARY_LENGTH} characters for better impact`,
        sectionId: section.id,
      });
    } else if (!content.summary || content.summary.trim().length === 0) {
      suggestions.push({
        id: 'personal-info-summary-missing',
        category: 'Personal Information',
        severity: 'warning',
        message: 'Add a professional summary to introduce yourself',
        sectionId: section.id,
      });
    }

    // Calculate score: 60% for required fields, 40% for optional fields
    const requiredScore = (filledRequired / requiredFields.length) * 0.6;
    const optionalScore = (filledOptional / optionalFields.length) * 0.4;
    const score = (requiredScore + optionalScore) * maxScore;

    return {
      breakdown: {
        category: 'Personal Information',
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        issues,
      },
      suggestions,
    };
  }

  /**
   * Score Education section
   */
  private static scoreEducation(sections: ResumeSection[] = []): {
    breakdown: ScoreBreakdown;
    suggestions: ResumeSuggestion[];
  } {
    const maxScore = this.WEIGHTS.education;
    const issues: string[] = [];
    const suggestions: ResumeSuggestion[] = [];

    const visibleSections = sections.filter((s) => s.visible);

    if (visibleSections.length === 0) {
      return {
        breakdown: {
          category: 'Education',
          score: 0,
          maxScore,
          percentage: 0,
          issues: ['No education entries'],
        },
        suggestions: [
          {
            id: 'education-missing',
            category: 'Education',
            severity: 'critical',
            message: 'Add at least one education entry',
          },
        ],
      };
    }

    let totalEntries = 0;
    let completeEntries = 0;

    visibleSections.forEach((section) => {
      const entries = section.content as Education[];
      totalEntries += entries.length;

      entries.forEach((entry, index) => {
        const requiredFields = ['institution', 'degree', 'field', 'start_date'];
        const missingFields = requiredFields.filter(
          (field) => !entry[field as keyof Education] || String(entry[field as keyof Education]).trim().length === 0
        );

        if (missingFields.length === 0) {
          completeEntries++;
        } else {
          issues.push(`Entry ${index + 1}: Missing ${missingFields.join(', ')}`);
          suggestions.push({
            id: `education-incomplete-${section.id}-${index}`,
            category: 'Education',
            severity: 'warning',
            message: `Complete education entry ${index + 1}: Add ${missingFields.join(', ')}`,
            sectionId: section.id,
          });
        }
      });
    });

    if (totalEntries === 0) {
      issues.push('No education entries added');
      suggestions.push({
        id: 'education-empty',
        category: 'Education',
        severity: 'critical',
        message: 'Add your educational background',
      });
    }

    const score = totalEntries > 0 ? (completeEntries / totalEntries) * maxScore : 0;

    return {
      breakdown: {
        category: 'Education',
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        issues,
      },
      suggestions,
    };
  }

  /**
   * Score Experience section
   */
  private static scoreExperience(sections: ResumeSection[] = []): {
    breakdown: ScoreBreakdown;
    suggestions: ResumeSuggestion[];
  } {
    const maxScore = this.WEIGHTS.experience;
    const issues: string[] = [];
    const suggestions: ResumeSuggestion[] = [];

    const visibleSections = sections.filter((s) => s.visible);

    if (visibleSections.length === 0) {
      return {
        breakdown: {
          category: 'Work Experience',
          score: 0,
          maxScore,
          percentage: 0,
          issues: ['No experience entries'],
        },
        suggestions: [
          {
            id: 'experience-missing',
            category: 'Work Experience',
            severity: 'critical',
            message: 'Add your work experience to showcase your professional background',
          },
        ],
      };
    }

    let totalEntries = 0;
    let completeEntries = 0;

    visibleSections.forEach((section) => {
      const entries = section.content as Experience[];
      totalEntries += entries.length;

      entries.forEach((entry, index) => {
        let entryScore = 0;
        const entryIssues: string[] = [];

        // Check required fields
        const requiredFields = ['company', 'position', 'start_date', 'description'];
        const missingFields = requiredFields.filter(
          (field) => !entry[field as keyof Experience] || String(entry[field as keyof Experience]).trim().length === 0
        );

        if (missingFields.length > 0) {
          entryIssues.push(`Missing ${missingFields.join(', ')}`);
        } else {
          entryScore += 0.5;
        }

        // Check description length
        if (entry.description && entry.description.length >= this.MIN_DESCRIPTION_LENGTH) {
          entryScore += 0.25;
        } else {
          entryIssues.push('Description too short');
          suggestions.push({
            id: `experience-description-short-${section.id}-${index}`,
            category: 'Work Experience',
            severity: 'warning',
            message: `Expand description for ${entry.position || 'position'} (at least ${this.MIN_DESCRIPTION_LENGTH} characters)`,
            sectionId: section.id,
          });
        }

        // Check achievements
        if (entry.achievements && entry.achievements.length > 0) {
          entryScore += 0.25;
        } else {
          entryIssues.push('No achievements listed');
          suggestions.push({
            id: `experience-achievements-missing-${section.id}-${index}`,
            category: 'Work Experience',
            severity: 'info',
            message: `Add achievements for ${entry.position || 'position'} to highlight your impact`,
            sectionId: section.id,
          });
        }

        if (entryScore >= 0.8) {
          completeEntries++;
        }

        if (entryIssues.length > 0) {
          issues.push(`Entry ${index + 1}: ${entryIssues.join(', ')}`);
        }
      });
    });

    if (totalEntries === 0) {
      issues.push('No experience entries added');
      suggestions.push({
        id: 'experience-empty',
        category: 'Work Experience',
        severity: 'critical',
        message: 'Add your work experience',
      });
    }

    const score = totalEntries > 0 ? (completeEntries / totalEntries) * maxScore : 0;

    return {
      breakdown: {
        category: 'Work Experience',
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        issues,
      },
      suggestions,
    };
  }

  /**
   * Score Projects section
   */
  private static scoreProjects(sections: ResumeSection[] = []): {
    breakdown: ScoreBreakdown;
    suggestions: ResumeSuggestion[];
  } {
    const maxScore = this.WEIGHTS.projects;
    const issues: string[] = [];
    const suggestions: ResumeSuggestion[] = [];

    const visibleSections = sections.filter((s) => s.visible);

    if (visibleSections.length === 0) {
      return {
        breakdown: {
          category: 'Projects',
          score: maxScore * 0.5, // 50% for not having projects (optional)
          maxScore,
          percentage: 50,
          issues: ['No projects section'],
        },
        suggestions: [
          {
            id: 'projects-missing',
            category: 'Projects',
            severity: 'info',
            message: 'Consider adding projects to showcase your practical skills',
          },
        ],
      };
    }

    let totalEntries = 0;
    let completeEntries = 0;

    visibleSections.forEach((section) => {
      const entries = section.content as Project[];
      totalEntries += entries.length;

      entries.forEach((entry, index) => {
        const missingFields: string[] = [];

        if (!entry.name || entry.name.trim().length === 0) missingFields.push('name');
        if (!entry.description || entry.description.trim().length === 0) missingFields.push('description');
        if (!entry.technologies || entry.technologies.length === 0) missingFields.push('technologies');

        if (missingFields.length === 0 && entry.description.length >= this.MIN_CONTENT_LENGTH) {
          completeEntries++;
        } else {
          if (missingFields.length > 0) {
            issues.push(`Entry ${index + 1}: Missing ${missingFields.join(', ')}`);
          }
          if (entry.description && entry.description.length < this.MIN_CONTENT_LENGTH) {
            issues.push(`Entry ${index + 1}: Description too short`);
          }
        }
      });
    });

    if (totalEntries === 0) {
      issues.push('No projects added');
      suggestions.push({
        id: 'projects-empty',
        category: 'Projects',
        severity: 'info',
        message: 'Add projects to demonstrate your skills',
      });
      return {
        breakdown: {
          category: 'Projects',
          score: maxScore * 0.5,
          maxScore,
          percentage: 50,
          issues,
        },
        suggestions,
      };
    }

    const score = (completeEntries / totalEntries) * maxScore;

    return {
      breakdown: {
        category: 'Projects',
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        issues,
      },
      suggestions,
    };
  }

  /**
   * Score Skills section
   */
  private static scoreSkills(sections: ResumeSection[] = []): {
    breakdown: ScoreBreakdown;
    suggestions: ResumeSuggestion[];
  } {
    const maxScore = this.WEIGHTS.skills;
    const issues: string[] = [];
    const suggestions: ResumeSuggestion[] = [];

    const visibleSections = sections.filter((s) => s.visible);

    if (visibleSections.length === 0) {
      return {
        breakdown: {
          category: 'Skills',
          score: 0,
          maxScore,
          percentage: 0,
          issues: ['No skills section'],
        },
        suggestions: [
          {
            id: 'skills-missing',
            category: 'Skills',
            severity: 'critical',
            message: 'Add your skills to highlight your capabilities',
          },
        ],
      };
    }

    let totalSkills = 0;

    visibleSections.forEach((section) => {
      const skills = section.content as Skill[];

      skills.forEach((skill) => {
        if (skill.items && skill.items.length > 0) {
          totalSkills += skill.items.length;
        }
      });
    });

    if (totalSkills === 0) {
      issues.push('No skills added');
      suggestions.push({
        id: 'skills-empty',
        category: 'Skills',
        severity: 'critical',
        message: 'Add your technical and professional skills',
      });
    } else if (totalSkills < 5) {
      issues.push('Too few skills listed');
      suggestions.push({
        id: 'skills-few',
        category: 'Skills',
        severity: 'warning',
        message: 'Add more skills to better showcase your capabilities (aim for at least 5-10)',
      });
    }

    // Score based on number of skills (5+ skills = full score)
    const score = Math.min(totalSkills / 5, 1) * maxScore;

    return {
      breakdown: {
        category: 'Skills',
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        issues,
      },
      suggestions,
    };
  }

  /**
   * Score Certifications section
   */
  private static scoreCertifications(sections: ResumeSection[] = []): {
    breakdown: ScoreBreakdown;
    suggestions: ResumeSuggestion[];
  } {
    const maxScore = this.WEIGHTS.certifications;

    const visibleSections = sections.filter((s) => s.visible);

    if (visibleSections.length === 0) {
      return {
        breakdown: {
          category: 'Certifications',
          score: maxScore, // Full score if not present (optional)
          maxScore,
          percentage: 100,
          issues: [],
        },
        suggestions: [],
      };
    }

    let totalEntries = 0;

    visibleSections.forEach((section) => {
      const entries = section.content as Certification[];
      totalEntries += entries.length;
    });

    if (totalEntries === 0) {
      return {
        breakdown: {
          category: 'Certifications',
          score: maxScore,
          maxScore,
          percentage: 100,
          issues: [],
        },
        suggestions: [],
      };
    }

    // If certifications are present, give full score
    return {
      breakdown: {
        category: 'Certifications',
        score: maxScore,
        maxScore,
        percentage: 100,
        issues: [],
      },
      suggestions: [],
    };
  }

  /**
   * Score Awards section
   */
  private static scoreAwards(sections: ResumeSection[] = []): {
    breakdown: ScoreBreakdown;
    suggestions: ResumeSuggestion[];
  } {
    const maxScore = this.WEIGHTS.awards;

    const visibleSections = sections.filter((s) => s.visible);

    if (visibleSections.length === 0) {
      return {
        breakdown: {
          category: 'Awards',
          score: maxScore, // Full score if not present (optional)
          maxScore,
          percentage: 100,
          issues: [],
        },
        suggestions: [],
      };
    }

    let totalEntries = 0;

    visibleSections.forEach((section) => {
      const entries = section.content as Award[];
      totalEntries += entries.length;
    });

    if (totalEntries === 0) {
      return {
        breakdown: {
          category: 'Awards',
          score: maxScore,
          maxScore,
          percentage: 100,
          issues: [],
        },
        suggestions: [],
      };
    }

    // If awards are present, give full score
    return {
      breakdown: {
        category: 'Awards',
        score: maxScore,
        maxScore,
        percentage: 100,
        issues: [],
      },
      suggestions: [],
    };
  }

  /**
   * Check best practices
   */
  private static checkBestPractices(resume: Resume): ResumeSuggestion[] {
    const suggestions: ResumeSuggestion[] = [];

    // Check resume length
    if (resume.metadata.page_count > 2) {
      suggestions.push({
        id: 'best-practice-length',
        category: 'Best Practices',
        severity: 'warning',
        message: 'Consider keeping your resume to 1-2 pages for better readability',
      });
    }

    // Check word count
    if (resume.metadata.word_count < 200) {
      suggestions.push({
        id: 'best-practice-word-count-low',
        category: 'Best Practices',
        severity: 'warning',
        message: 'Your resume seems sparse. Add more details to showcase your experience',
      });
    } else if (resume.metadata.word_count > 800) {
      suggestions.push({
        id: 'best-practice-word-count-high',
        category: 'Best Practices',
        severity: 'info',
        message: 'Your resume is quite detailed. Consider being more concise',
      });
    }

    // Check section order
    const sectionOrder = resume.sections.map((s) => s.type);
    if (sectionOrder[0] !== 'personal_info') {
      suggestions.push({
        id: 'best-practice-section-order',
        category: 'Best Practices',
        severity: 'info',
        message: 'Consider placing Personal Information at the top of your resume',
      });
    }

    return suggestions;
  }

  /**
   * Prioritize suggestions by severity
   */
  private static prioritizeSuggestions(suggestions: ResumeSuggestion[]): ResumeSuggestion[] {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return suggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }

  /**
   * Get section content length
   */
  static getSectionContentLength(section: ResumeSection): number {
    if (section.type === 'personal_info') {
      const content = section.content as PersonalInfo;
      return Object.values(content).join(' ').length;
    } else if (Array.isArray(section.content)) {
      return JSON.stringify(section.content).length;
    } else if (typeof section.content === 'object') {
      const content = section.content as CustomContent;
      return content.content?.length || 0;
    }
    return 0;
  }

  /**
   * Check if section is empty
   */
  static isSectionEmpty(section: ResumeSection): boolean {
    if (section.type === 'personal_info') {
      const content = section.content as PersonalInfo;
      return !content.full_name && !content.email && !content.phone;
    } else if (Array.isArray(section.content)) {
      return section.content.length === 0;
    } else if (typeof section.content === 'object') {
      const content = section.content as CustomContent;
      return !content.content || content.content.trim().length === 0;
    }
    return true;
  }

  /**
   * Check if section has minimal content
   */
  static hasMinimalContent(section: ResumeSection): boolean {
    const length = this.getSectionContentLength(section);
    return length > 0 && length < this.MIN_CONTENT_LENGTH;
  }
}
