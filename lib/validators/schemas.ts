import { z } from 'zod'

// Common validation schemas
export const commonSchemas = {
  // Email validation
  email: z.string().email('Invalid email format').max(254, 'Email too long'),

  // Password validation
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),

  // Username validation
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .refine(
      (username) => !['admin', 'administrator', 'root', 'api', 'www', 'mail', 'ftp', 'blog', 'support', 'help', 'about', 'contact', 'terms', 'privacy', 'login', 'signup', 'register', 'dashboard', 'profile', 'settings', 'account', 'user', 'users', 'test', 'testing', 'dev', 'development', 'staging', 'production', 'prod', 'live', 'demo', 'sample', 'example', 'codeunia'].includes(username.toLowerCase()),
      'This username is reserved'
    ),

  // Phone number validation
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long'),

  // URL validation
  url: z
    .string()
    .url('Invalid URL format')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url)
          return ['http:', 'https:'].includes(parsed.protocol)
        } catch {
          return false
        }
      },
      'Only HTTP and HTTPS URLs are allowed'
    ),

  // Date validation
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'Invalid date'
    ),

  // Time validation
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),

  // Slug validation
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),

  // ID validation
  id: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val.length > 0, 'ID is required'),
}

// Event validation schemas
export const eventSchemas = {
  create: z.object({
    slug: commonSchemas.slug,
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt too long'),
    description: z.string().min(1, 'Description is required').max(10000, 'Description too long'),
    organizer: z.string().min(1, 'Organizer is required').max(100, 'Organizer name too long'),
    organizer_contact: z.object({
      email: commonSchemas.email.optional(),
      phone: commonSchemas.phone.optional(),
    }).optional(),
    date: commonSchemas.date,
    time: commonSchemas.time,
    duration: z.string().min(1, 'Duration is required').max(50, 'Duration too long'),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    image: z.string().url().optional(),
    location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
    locations: z.array(z.string()).optional(),
    capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10000, 'Capacity too large'),
    price: z.string().min(1, 'Price is required').max(20, 'Price too long'),
    payment: z.enum(['Free', 'Required', 'Paid'], {
      errorMap: () => ({ message: 'Payment must be Free, Required, or Paid' })
    }),
    status: z.enum(['draft', 'published', 'live', 'completed', 'cancelled']).optional(),
    eventType: z.array(z.string()).optional(),
    teamSize: z.object({
      min: z.number().int().min(1).max(100),
      max: z.number().int().min(1).max(100),
    }).optional(),
    userTypes: z.array(z.string()).optional(),
    registration_required: z.boolean().optional(),
    registration_deadline: commonSchemas.date.optional(),
    rules: z.array(z.string()).optional(),
    schedule: z.record(z.unknown()).optional(),
    prize: z.string().optional(),
    prize_details: z.string().optional(),
    faq: z.record(z.unknown()).optional(),
    socials: z.record(z.string()).optional(),
    sponsors: z.array(z.record(z.unknown())).optional(),
    marking_scheme: z.record(z.unknown()).optional(),
  }),

  update: eventSchemas.create.partial(),

  filters: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    featured: z.boolean().optional(),
    dateFilter: z.enum(['upcoming', 'past', 'all']).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  }),
}

// Hackathon validation schemas
export const hackathonSchemas = {
  create: eventSchemas.create.extend({
    // Hackathons can have additional fields
    teamSize: z.object({
      min: z.number().int().min(1).max(100),
      max: z.number().int().min(1).max(100),
    }).optional(),
  }),

  update: hackathonSchemas.create.partial(),

  filters: eventSchemas.filters,
}

// User/Profile validation schemas
export const userSchemas = {
  profile: z.object({
    first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional(),
    company: z.string().max(100, 'Company name too long').optional(),
    current_position: z.string().max(100, 'Position too long').optional(),
    location: z.string().max(100, 'Location too long').optional(),
    bio: z.string().max(1000, 'Bio too long').optional(),
    website: commonSchemas.url.optional(),
    github: z.string().max(100, 'GitHub username too long').optional(),
    linkedin: z.string().max(100, 'LinkedIn username too long').optional(),
    twitter: z.string().max(100, 'Twitter username too long').optional(),
  }),

  registration: z.object({
    event_id: commonSchemas.id,
    user_id: commonSchemas.id,
    payment_status: z.enum(['pending', 'paid', 'failed']).optional(),
    team_members: z.array(z.string()).optional(),
    additional_info: z.string().max(1000, 'Additional info too long').optional(),
  }),
}

// Authentication validation schemas
export const authSchemas = {
  signup: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    username: commonSchemas.username,
  }),

  signin: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  resetPassword: z.object({
    email: commonSchemas.email,
  }),

  updatePassword: z.object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: commonSchemas.password,
  }),
}

// Admin validation schemas
export const adminSchemas = {
  createUser: z.object({
    email: commonSchemas.email,
    first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    username: commonSchemas.username,
    is_admin: z.boolean().optional(),
  }),

  updateUser: z.object({
    first_name: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
    email: commonSchemas.email.optional(),
    is_admin: z.boolean().optional(),
  }),
}

// Export all schemas
export const schemas = {
  common: commonSchemas,
  event: eventSchemas,
  hackathon: hackathonSchemas,
  user: userSchemas,
  auth: authSchemas,
  admin: adminSchemas,
}
