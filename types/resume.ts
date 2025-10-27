// Resume Builder Type Definitions

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  sections: ResumeSection[];
  styling: ResumeStyling;
  metadata: ResumeMetadata;
  created_at: string;
  updated_at: string;
}

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  visible: boolean;
  content: SectionContent;
}

export type SectionType =
  | 'personal_info'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'awards'
  | 'custom';

// Section Content Types

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  gpa?: string;
  achievements?: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  start_date?: string;
  end_date?: string;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry_date?: string;
  credential_id?: string;
  url?: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface CustomContent {
  title: string;
  content: string;
}

export type SectionContent =
  | PersonalInfo
  | Education[]
  | Experience[]
  | Project[]
  | Skill[]
  | Certification[]
  | Award[]
  | CustomContent;

// Styling Configuration

export interface ResumeStyling {
  font_family: string;
  font_size_body: number;
  font_size_heading: number;
  color_primary: string;
  color_text: string;
  color_accent: string;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  line_height: number;
  section_spacing: number;
}

// Resume Metadata

export interface ResumeMetadata {
  page_count: number;
  word_count: number;
  completeness_score: number;
  last_exported?: string;
  export_count: number;
}

// Database Types (for Supabase queries)

export interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  sections: unknown; // JSONB
  styling: unknown; // JSONB
  metadata: unknown; // JSONB
  created_at: string;
  updated_at: string;
}

export interface ResumeInsert {
  user_id: string;
  title?: string;
  template_id?: string;
  sections?: unknown;
  styling?: unknown;
  metadata?: unknown;
}

export interface ResumeUpdate {
  title?: string;
  template_id?: string;
  sections?: unknown;
  styling?: unknown;
  metadata?: unknown;
}

// Helper Types

export interface SectionTypeInfo {
  type: SectionType;
  label: string;
  icon: string;
  defaultTitle: string;
  description: string;
}

export const SECTION_TYPES: Record<SectionType, SectionTypeInfo> = {
  personal_info: {
    type: 'personal_info',
    label: 'Personal Information',
    icon: 'User',
    defaultTitle: 'Personal Information',
    description: 'Your contact details and summary',
  },
  education: {
    type: 'education',
    label: 'Education',
    icon: 'GraduationCap',
    defaultTitle: 'Education',
    description: 'Your academic background',
  },
  experience: {
    type: 'experience',
    label: 'Work Experience',
    icon: 'Briefcase',
    defaultTitle: 'Work Experience',
    description: 'Your professional experience',
  },
  projects: {
    type: 'projects',
    label: 'Projects',
    icon: 'Code',
    defaultTitle: 'Projects',
    description: 'Your personal or professional projects',
  },
  skills: {
    type: 'skills',
    label: 'Skills',
    icon: 'Wrench',
    defaultTitle: 'Skills',
    description: 'Your technical and soft skills',
  },
  certifications: {
    type: 'certifications',
    label: 'Certifications',
    icon: 'Award',
    defaultTitle: 'Certifications',
    description: 'Your professional certifications',
  },
  awards: {
    type: 'awards',
    label: 'Awards & Honors',
    icon: 'Trophy',
    defaultTitle: 'Awards & Honors',
    description: 'Your achievements and recognition',
  },
  custom: {
    type: 'custom',
    label: 'Custom Section',
    icon: 'Plus',
    defaultTitle: 'Custom Section',
    description: 'Add any custom content',
  },
};

// Template Types

export type TemplateId = 'modern' | 'classic' | 'minimal' | 'creative' | 'executive';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  thumbnail: string;
  category: 'professional' | 'creative' | 'minimal';
}

export const TEMPLATES: Record<TemplateId, TemplateInfo> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, modern layout with purple accents',
    thumbnail: '/templates/modern.png',
    category: 'professional',
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column layout',
    thumbnail: '/templates/classic.png',
    category: 'professional',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with maximum whitespace',
    thumbnail: '/templates/minimal.png',
    category: 'minimal',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Bold, colorful with unique structure',
    thumbnail: '/templates/creative.png',
    category: 'creative',
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    description: 'Professional layout for senior positions',
    thumbnail: '/templates/executive.png',
    category: 'professional',
  },
};

// Validation Types

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'custom';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Export Types

export type ExportFormat = 'pdf' | 'docx' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeMetadata?: boolean;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  filename: string;
}

// Import Types

export interface ImportOptions {
  source: 'json' | 'linkedin';
  data: string | object;
  mergeStrategy?: 'replace' | 'merge';
}

export interface ImportResult {
  success: boolean;
  resume?: Resume;
  fieldsPopulated?: number;
  errors?: string[];
}

// Error Types

export enum ResumeErrorCode {
  LOAD_FAILED = 'LOAD_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  IMPORT_FAILED = 'IMPORT_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
}

export class ResumeError extends Error {
  constructor(
    message: string,
    public code: ResumeErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ResumeError';
  }
}

// Utility Types

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Default Values

export const DEFAULT_STYLING: ResumeStyling = {
  font_family: 'Inter',
  font_size_body: 11,
  font_size_heading: 16,
  color_primary: '#8b5cf6',
  color_text: '#1f2937',
  color_accent: '#6366f1',
  margin_top: 0.75,
  margin_bottom: 0.75,
  margin_left: 0.75,
  margin_right: 0.75,
  line_height: 1.5,
  section_spacing: 1.25,
};

export const DEFAULT_METADATA: ResumeMetadata = {
  page_count: 1,
  word_count: 0,
  completeness_score: 0,
  export_count: 0,
};

export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  full_name: '',
  email: '',
  phone: '',
  location: '',
};
