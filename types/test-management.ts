// Enhanced Test Management Types

export interface Test {
  id: string;
  name: string;
  description?: string;
  category?: string;
  duration_minutes: number;
  
  // Event Timeline
  event_start?: string;           // When the event goes live
  event_end?: string;             // When the event ends
  registration_start?: string;    // Registration opens
  registration_end?: string;      // Registration closes
  certificate_start?: string;     // Certificate distribution begins
  certificate_end?: string;       // Certificate distribution ends
  
  // Dynamic Rounds System
  rounds: TestRound[];            // Array of rounds (1, 2, 3, 4, 5... n)
  
  // Payment Settings
  is_paid: boolean;               // Whether test requires payment
  price?: number;                 // Price in paise (₹1 = 100 paise)
  currency?: string;              // Currency (default: INR)
  
  // Test Configuration
  is_public: boolean;
  enable_leaderboard: boolean;
  certificate_template_id?: string;
  passing_score: number;
  max_attempts: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  test_registrations?: { count: number }[];
  test_attempts?: { count: number }[];
}

export interface TestRound {
  id: string;
  test_id: string;
  round_number: number;           // Round number (1, 2, 3, 4, 5...)
  name: string;                   // Round name (e.g., "Online Submission", "Jury Shortlisting")
  description: string;            // Detailed round description
  start_date: string;             // Round start date
  end_date: string;               // Round end date
  duration_minutes?: number;      // Duration for timed rounds
  max_attempts?: number;          // Max attempts for this round
  passing_score?: number;         // Passing score for this round
  requirements: string[];         // Array of requirements/deliverables
  assessment_criteria: string[];  // How this round will be evaluated
  round_type: 'submission' | 'evaluation' | 'live' | 'interview' | 'presentation' | 'coding' | 'custom';
  is_elimination_round: boolean;  // Whether this round eliminates participants
  weightage?: number;             // Weightage in final scoring (1-100)
  created_at: string;
  updated_at: string;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_options: string[]; // Array of correct options (A, B, C, D)
  explanation?: string;
  points: number;
  order_index?: number;
  created_at: string;
}

export interface TestRegistration {
  id: string;
  test_id: string;
  user_id: string;
  registration_date: string;
  status: 'registered' | 'attempted' | 'completed' | 'disqualified';
  attempt_count: number;
  best_score?: number;
  best_attempt_id?: string;
  
  // Payment Information
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_id?: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_date?: string;
  
  created_at: string;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  started_at: string;
  submitted_at?: string;
  score?: number;
  max_score?: number;
  passed?: boolean;
  time_taken_minutes?: number;
  violations_count: number;
  status: 'in_progress' | 'submitted' | 'timeout' | 'violation' | 'disqualified';
  admin_override_score?: number;
  admin_override_reason?: string;
  review_mode_enabled: boolean;
  created_at: string;
}

export interface TestAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_options: string[]; // Array of selected options (A, B, C, D)
  is_correct?: boolean;
  points_earned?: number;
  answered_at: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  template_url: string;
  placeholders: string[];
  created_by: string;
  is_active: boolean;
  created_at: string;
}

export interface Certificate {
  id: string;
  cert_id: string;
  test_id: string;
  user_id: string;
  attempt_id: string;
  template_id: string;
  certificate_url?: string;
  qr_code_url?: string;
  issued_at: string;
  expires_at?: string;
  is_valid: boolean;
  sent_via_email: boolean;
  sent_via_whatsapp: boolean;
  created_at: string;
}

export interface TestLeaderboard {
  id: string;
  test_id: string;
  user_id: string;
  score: number;
  time_taken_minutes?: number;
  rank: number;
  created_at: string;
}

// Form types
export interface CreateTestForm {
  name: string;
  description: string;
  category?: string;
  duration_minutes: number;
  
  // Event Timeline
  event_start?: string;
  event_end?: string;
  registration_start?: string;
  registration_end?: string;
  certificate_start?: string;
  certificate_end?: string;
  
  // Dynamic Rounds System
  rounds: CreateTestRoundForm[];
  
  // Payment Settings
  is_paid: boolean;
  price?: number;
  currency?: string;
  
  // Test Configuration
  is_public: boolean;
  enable_leaderboard: boolean;
  certificate_template_id?: string;
  passing_score: number;
  max_attempts: number;
  questions: CreateTestQuestionForm[];
}

export interface CreateTestRoundForm {
  round_number: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  duration_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  requirements: string[];
  assessment_criteria: string[];
  round_type: 'submission' | 'evaluation' | 'live' | 'interview' | 'presentation' | 'coding' | 'custom';
  is_elimination_round: boolean;
  weightage?: number;
}

export interface CreateTestQuestionForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_options: string[];
  explanation?: string;
  points: number;
}

// Test session types
export interface TestSession {
  attempt: TestAttempt;
  test: Test;
  questions: TestQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  timeRemaining: number;
  violations: number;
}

// Certificate generation types
export interface CertificateData {
  name: string;
  score: number;
  test_name: string;
  date: string;
  cert_id: string;
  qr_code: string;
}

// API Response types
export interface TestListResponse {
  tests: Test[];
  total: number;
}

export interface TestDetailResponse {
  test: Test;
  questions: TestQuestion[];
  registrations: TestRegistration[];
  attempts: TestAttempt[];
}

export interface TestResultsResponse {
  attempts: TestAttempt[];
  leaderboard: TestLeaderboard[];
  statistics: {
    totalRegistrations: number;
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    averageTime: number;
  };
}

export interface RegistrationListResponse {
  registrations: (TestRegistration & {
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    test: {
      name: string;
    };
  })[];
  total: number;
}

// Admin dashboard types
export interface TestDashboardStats {
  totalTests: number;
  activeTests: number;
  totalRegistrations: number;
  totalAttempts: number;
  certificatesGenerated: number;
  averagePassRate: number;
}

export interface TestAnalytics {
  testId: string;
  testName: string;
  registrations: number;
  attempts: number;
  passed: number;
  averageScore: number;
  averageTime: number;
  leaderboardEnabled: boolean;
} 