/**
 * Resume Form Validation Utilities
 * Provides validation functions for resume fields
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
}

/**
 * URL validation
 */
export function validateURL(url: string, fieldName = 'URL'): ValidationResult {
  if (!url) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  try {
    const urlObj = new URL(url);
    
    // Check if protocol is http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: `${fieldName} must start with http:// or https://`,
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: `Please enter a valid ${fieldName}`,
    };
  }
}

/**
 * LinkedIn URL validation
 */
export function validateLinkedInURL(url: string): ValidationResult {
  if (!url) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const basicValidation = validateURL(url, 'LinkedIn URL');
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Check if it's a LinkedIn URL
  if (!url.includes('linkedin.com/')) {
    return {
      isValid: false,
      error: 'Please enter a valid LinkedIn profile URL',
    };
  }

  return { isValid: true };
}

/**
 * GitHub URL validation
 */
export function validateGitHubURL(url: string): ValidationResult {
  if (!url) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const basicValidation = validateURL(url, 'GitHub URL');
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Check if it's a GitHub URL
  if (!url.includes('github.com/')) {
    return {
      isValid: false,
      error: 'Please enter a valid GitHub profile URL',
    };
  }

  return { isValid: true };
}

/**
 * Phone number validation (flexible format)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, '');

  // Check if it contains only digits after cleaning
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Phone number should contain only digits and formatting characters',
    };
  }

  // Check length (between 7 and 15 digits is reasonable for international numbers)
  if (cleaned.length < 7 || cleaned.length > 15) {
    return {
      isValid: false,
      error: 'Phone number should be between 7 and 15 digits',
    };
  }

  return { isValid: true };
}

/**
 * Date validation
 */
export function validateDate(date: string): ValidationResult {
  if (!date) {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      error: 'Please enter a valid date',
    };
  }

  return { isValid: true };
}

/**
 * Date range validation (start date must be before end date)
 */
export function validateDateRange(
  startDate: string,
  endDate: string | undefined,
  isCurrent: boolean
): ValidationResult {
  // If current position/education, end date is not required
  if (isCurrent) {
    return { isValid: true };
  }

  if (!startDate) {
    return {
      isValid: false,
      error: 'Start date is required',
    };
  }

  const startValidation = validateDate(startDate);
  if (!startValidation.isValid) {
    return startValidation;
  }

  if (!endDate) {
    return {
      isValid: false,
      error: 'End date is required (or mark as current)',
    };
  }

  const endValidation = validateDate(endDate);
  if (!endValidation.isValid) {
    return endValidation;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return {
      isValid: false,
      error: 'Start date must be before end date',
    };
  }

  // Check if dates are not too far in the future
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);

  if (start > oneYearFromNow) {
    return {
      isValid: false,
      error: 'Start date cannot be more than 1 year in the future',
    };
  }

  return { isValid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName = 'This field'): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
}

/**
 * Minimum length validation
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName = 'This field'
): ValidationResult {
  if (!value) {
    return { isValid: true }; // Empty is valid (use validateRequired separately)
  }

  if (value.trim().length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Maximum length validation
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName = 'This field'
): ValidationResult {
  if (!value) {
    return { isValid: true };
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${maxLength} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Validate all fields in personal info section
 */
export function validatePersonalInfo(data: {
  full_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate email
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid && emailValidation.error) {
      errors.email = emailValidation.error;
    }
  }

  // Validate phone
  if (data.phone) {
    const phoneValidation = validatePhoneNumber(data.phone);
    if (!phoneValidation.isValid && phoneValidation.error) {
      errors.phone = phoneValidation.error;
    }
  }

  // Validate website
  if (data.website) {
    const websiteValidation = validateURL(data.website, 'Website');
    if (!websiteValidation.isValid && websiteValidation.error) {
      errors.website = websiteValidation.error;
    }
  }

  // Validate LinkedIn
  if (data.linkedin) {
    const linkedinValidation = validateLinkedInURL(data.linkedin);
    if (!linkedinValidation.isValid && linkedinValidation.error) {
      errors.linkedin = linkedinValidation.error;
    }
  }

  // Validate GitHub
  if (data.github) {
    const githubValidation = validateGitHubURL(data.github);
    if (!githubValidation.isValid && githubValidation.error) {
      errors.github = githubValidation.error;
    }
  }

  return errors;
}

/**
 * Validate education entry
 */
export function validateEducation(data: {
  institution?: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate required fields
  if (!data.institution?.trim()) {
    errors.institution = 'Institution is required';
  }

  if (!data.degree?.trim()) {
    errors.degree = 'Degree is required';
  }

  // Validate date range
  if (data.start_date) {
    const dateRangeValidation = validateDateRange(
      data.start_date,
      data.end_date,
      data.current || false
    );
    if (!dateRangeValidation.isValid && dateRangeValidation.error) {
      errors.dates = dateRangeValidation.error;
    }
  }

  return errors;
}

/**
 * Validate experience entry
 */
export function validateExperience(data: {
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate required fields
  if (!data.company?.trim()) {
    errors.company = 'Company is required';
  }

  if (!data.position?.trim()) {
    errors.position = 'Position is required';
  }

  // Validate date range
  if (data.start_date) {
    const dateRangeValidation = validateDateRange(
      data.start_date,
      data.end_date,
      data.current || false
    );
    if (!dateRangeValidation.isValid && dateRangeValidation.error) {
      errors.dates = dateRangeValidation.error;
    }
  }

  return errors;
}

/**
 * Validate project entry
 */
export function validateProject(data: {
  name?: string;
  url?: string;
  github?: string;
  start_date?: string;
  end_date?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate required fields
  if (!data.name?.trim()) {
    errors.name = 'Project name is required';
  }

  // Validate URLs
  if (data.url) {
    const urlValidation = validateURL(data.url, 'Project URL');
    if (!urlValidation.isValid && urlValidation.error) {
      errors.url = urlValidation.error;
    }
  }

  if (data.github) {
    const githubValidation = validateGitHubURL(data.github);
    if (!githubValidation.isValid && githubValidation.error) {
      errors.github = githubValidation.error;
    }
  }

  // Validate date range (optional for projects)
  if (data.start_date && data.end_date) {
    const dateRangeValidation = validateDateRange(data.start_date, data.end_date, false);
    if (!dateRangeValidation.isValid && dateRangeValidation.error) {
      errors.dates = dateRangeValidation.error;
    }
  }

  return errors;
}

/**
 * Validate certification entry
 */
export function validateCertification(data: {
  name?: string;
  issuer?: string;
  date?: string;
  expiry_date?: string;
  url?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate required fields
  if (!data.name?.trim()) {
    errors.name = 'Certification name is required';
  }

  if (!data.issuer?.trim()) {
    errors.issuer = 'Issuer is required';
  }

  // Validate dates
  if (data.date) {
    const dateValidation = validateDate(data.date);
    if (!dateValidation.isValid && dateValidation.error) {
      errors.date = dateValidation.error;
    }
  }

  if (data.expiry_date) {
    const expiryValidation = validateDate(data.expiry_date);
    if (!expiryValidation.isValid && expiryValidation.error) {
      errors.expiry_date = expiryValidation.error;
    }

    // Check if expiry is after issue date
    if (data.date && expiryValidation.isValid) {
      const issueDate = new Date(data.date);
      const expiryDate = new Date(data.expiry_date);
      
      if (expiryDate < issueDate) {
        errors.expiry_date = 'Expiry date must be after issue date';
      }
    }
  }

  // Validate URL
  if (data.url) {
    const urlValidation = validateURL(data.url, 'Certification URL');
    if (!urlValidation.isValid && urlValidation.error) {
      errors.url = urlValidation.error;
    }
  }

  return errors;
}
