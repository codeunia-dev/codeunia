import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Action button types
type ActionType =
  | 'event_register'
  | 'event_view'
  | 'hackathon_view'
  | 'hackathon_register'
  | 'internship_apply'
  | 'blog_read'
  | 'learn_more';

interface ActionButton {
  type: ActionType;
  label: string;
  url: string;
  metadata?: Record<string, unknown>;
  variant?: 'primary' | 'secondary';
}


// Rate limiting map (in production, use Redis or database)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

// Input validation
const MAX_MESSAGE_LENGTH = 1000;
const FORBIDDEN_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /system\s*:/i,
  /you\s+are\s+now/i,
  /<script/i,
  /javascript:/i,
  /delete\s+(the\s+)?(database|db|table|data)/i,
  /drop\s+(table|database|db)/i,
  /truncate\s+(table|database)/i,
  /destroy\s+(the\s+)?(database|system|server)/i,
  /hack\s+(the\s+)?(system|database|server)/i,
  /sql\s+injection/i,
  /malicious\s+code/i,
  /execute\s+(command|script)/i,
  /run\s+(malicious|dangerous)/i
];

function validateInput(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message must be a non-empty string' };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` };
  }

  // Check for potential prompt injection
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(message)) {
      return { valid: false, error: 'Invalid input detected' };
    }
  }

  return { valid: true };
}

function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, error: 'Rate limit exceeded. Please try again later.' };
  }

  // Add current request
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);

  return { allowed: true };
}

// Filter function to determine if conversation should be saved
async function shouldSaveConversation(message: string, userId: string): Promise<boolean> {
  const trimmedMessage = message.trim().toLowerCase();

  // Filter 1: Simple greetings
  const simpleGreetings = [
    /^hi!*$/,
    /^hello!*$/,
    /^hey!*$/,
    /^hii+!*$/,
    /^sup!*$/,
    /^yo!*$/,
    /^hai!*$/,
    /^helo!*$/,
    /^hllo!*$/,
  ];

  for (const pattern of simpleGreetings) {
    if (pattern.test(trimmedMessage)) {
      console.log(`Filtering out simple greeting: "${message}"`);
      return false;
    }
  }

  // Filter 2: Casual chit-chat (very short messages or common casual phrases)
  const casualPhrases = [
    /^thanks?!*$/,
    /^thank you!*$/,
    /^ok!*$/,
    /^okay!*$/,
    /^cool!*$/,
    /^nice!*$/,
    /^lol!*$/,
    /^haha+!*$/,
    /^yeah!*$/,
    /^yep!*$/,
    /^nope?!*$/,
    /^sure!*$/,
    /^k!*$/,
  ];

  for (const pattern of casualPhrases) {
    if (pattern.test(trimmedMessage)) {
      console.log(`Filtering out casual chit-chat: "${message}"`);
      return false;
    }
  }

  // Filter out very short messages (less than 10 characters)
  if (trimmedMessage.length < 10) {
    console.log(`Filtering out short message: "${message}" (${trimmedMessage.length} chars)`);
    return false;
  }

  // Filter 3: Repeated questions (check if same user asked exact same question in last 24 hours)
  try {
    const supabase = getSupabaseClient();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('ai_training_data')
      .select('query_text')
      .eq('user_id', userId)
      .eq('query_text', message)
      .gte('created_at', twentyFourHoursAgo)
      .limit(1);

    if (error) {
      console.error('Error checking for duplicate questions:', error);
      // If there's an error, allow saving to be safe
      return true;
    }

    if (data && data.length > 0) {
      console.log(`Filtering out repeated question: "${message}"`);
      return false;
    }
  } catch (error) {
    console.error('Error in duplicate check:', error);
    // If there's an error, allow saving to be safe
    return true;
  }

  // If none of the filters matched, save the conversation
  return true;
}

// Configure the runtime for this API route
export const runtime = 'nodejs';

// Initialize OpenRouter AI
// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Function to call OpenRouter API with DeepSeek V3.1 and free fallbacks
async function callOpenRouterAPI(prompt: string): Promise<string> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required');
  }

  const models = [
    "deepseek/deepseek-chat-v3-0324:free",     // Primary - CONFIRMED WORKING DeepSeek V3 chat
    "meta-llama/llama-3.3-70b-instruct:free",  // Meta Llama 3.3 70B (likely available)
    "mistralai/mistral-7b-instruct:free",      // Mistral 7B (lightweight, commonly available)
    "nvidia/llama-3.1-nemotron-nano-8b-v1:free", // NVIDIA Nemotron
    "xai/grok-4.1-fast:free",                  // xAI Grok 4.1 Fast
    "meta-llama/llama-4-maverick:free",        // Meta Llama 4 (might not be available yet)
    "google/gemini-2.5-pro-exp-03-25:free",    // Google Gemini 2.5 (experimental, might be limited)
    "deepseek/deepseek-v3-base:free"           // DeepSeek V3 base (fallback)
  ];

  for (const model of models) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://codeunia.com',
          'X-Title': 'Codeunia AI Assistant'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        const isRateLimit = response.status === 429 || errorData.includes('rate-limited');

        if (isRateLimit) {
          console.warn(`Rate limit hit for model ${model}, trying next model...`);
        } else {
          console.error(`OpenRouter API Error for model ${model}:`, response.status, errorData);
        }
        continue; // Try next model
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error(`Invalid response format from model ${model}`);
        continue; // Try next model
      }

      console.log(`Successfully used model: ${model}`);
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      continue; // Try next model
    }
  }

  throw new Error('AI service is temporarily experiencing high demand. Please try again in a few moments.');
}

// Streaming version of OpenRouter API call
async function callOpenRouterAPIStream(prompt: string): Promise<ReadableStream> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required');
  }

  const models = [
    "deepseek/deepseek-chat-v3-0324:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "nvidia/llama-3.1-nemotron-nano-8b-v1:free",
    "xai/grok-4.1-fast:free",
    "meta-llama/llama-4-maverick:free",
    "google/gemini-2.5-pro-exp-03-25:free",
    "deepseek/deepseek-v3-base:free"
  ];

  for (const model of models) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://codeunia.com',
          'X-Title': 'Codeunia AI Assistant'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        const isRateLimit = response.status === 429 || errorData.includes('rate-limited');

        if (isRateLimit) {
          console.warn(`Rate limit hit for model ${model}, trying next model...`);
        } else {
          console.error(`OpenRouter API Error for model ${model}:`, response.status, errorData);
        }
        continue;
      }

      console.log(`Successfully using streaming model: ${model}`);

      // Return the stream directly
      if (!response.body) {
        throw new Error('No response body');
      }

      return response.body;
    } catch (error) {
      console.error(`Error with streaming model ${model}:`, error);
      continue;
    }
  }

  throw new Error('AI service is temporarily experiencing high demand. Please try again in a few moments.');
}

interface ChatRequest {
  message: string;
  context?: string;
}

interface PlatformStats {
  activeEvents: number;
  activeHackathons: number;
  totalBlogs: number;
  completedInterns: number;
  lastUpdated: string;
}

interface Event {
  id: string;
  slug?: string;  // Optional for backwards compatibility
  title: string;
  description: string;
  excerpt?: string;
  date: string;
  time: string;
  duration?: string;
  location: string;
  locations?: string[];
  status: string;
  event_type: string | string[];
  registration_deadline?: string;
  capacity?: number;
  registered?: number;
  category?: string;
  categories?: string[];
  tags?: string | string[];
  price?: string;
  organizer?: string;
}

interface Hackathon {
  id: string;
  slug?: string;  // Optional for backwards compatibility
  title: string;
  description: string;
  excerpt?: string;
  date: string;
  time?: string;
  duration?: string;
  registration_deadline?: string;
  status: string;
  location: string;
  locations?: string[];
  capacity?: number;
  registered?: number;
  category?: string;
  categories?: string[];
  tags?: string | string[];
  price?: string;
  organizer?: string;
  prize?: string;
  prize_details?: string;
  team_size?: number;
}

interface InternshipOffering {
  id: string;
  title: string;
  description: string;
  type: string;
  domains: string[];
  levels: string[];
  priceInr?: number;
  benefits?: string[];
}

interface InternshipData {
  completedCount: number;
  offerings: InternshipOffering[];
}

interface Blog {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  author: string;
  category: string;
  tags?: string | string[];
  created_at: string;
  reading_time?: number;
  featured: boolean;
}

interface ContextData {
  stats?: PlatformStats;
  events?: Event[];
  hackathons?: Hackathon[];
  internships?: InternshipData;
  blogs?: Blog[];
  userProfile?: {
    first_name: string;
    last_name: string;
  };
}

// Helper function to extract search terms from user message
function extractSearchTerms(message: string): string[] {
  const stopWords = ['a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'with', 'by', 'about', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'show', 'me', 'tell', 'list', 'find', 'search', 'looking', 'any', 'some', 'all', 'what', 'where', 'when', 'who', 'why', 'how', 'event', 'events', 'hackathon', 'hackathons'];

  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/);

  return words.filter(word => !stopWords.includes(word) && word.length > 2);
}

// Database service functions
async function getEvents(limit = 10, searchTerms: string[] = []) {
  try {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString();

    let query = supabase
      .from('events')
      .select(`
        id, slug, title, description, excerpt, date, time, duration,
        location, locations, status, event_type, registration_deadline,
        capacity, registered, category, categories, tags, price, organizer
      `)
      .eq('status', 'live')
      .gte('date', today); // Only future events

    // Apply search filters if terms exist
    if (searchTerms.length > 0) {
      const orConditions = searchTerms.map(term =>
        `title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`
      ).join(',');

      // Note: This is a simple OR search. For more complex search, we might need textSearch or RPC
      query = query.or(orConditions);
    }

    const { data, error } = await query
      .order('date', { ascending: true }) // Show nearest upcoming events first
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

async function getHackathons(limit = 10, searchTerms: string[] = []) {
  try {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString();

    let query = supabase
      .from('hackathons')
      .select(`
        id, slug, title, description, excerpt, date, time, duration,
        registration_deadline, status, location, locations,
        capacity, registered, category, categories, tags,
        price, organizer, prize, prize_details, team_size
      `)
      .eq('status', 'live')
      .gte('date', today); // Only future hackathons

    // Apply search filters if terms exist
    if (searchTerms.length > 0) {
      const orConditions = searchTerms.map(term =>
        `title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`
      ).join(',');

      query = query.or(orConditions);
    }

    const { data, error } = await query
      .order('date', { ascending: true }) // Show nearest upcoming hackathons first
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    return [];
  }
}

async function getPlatformStats() {
  try {
    const supabase = getSupabaseClient();
    const [eventsCount, hackathonsCount, blogsCount, internsCount] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('hackathons').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('blogs').select('*', { count: 'exact', head: true }),
      supabase.from('interns').select('*', { count: 'exact', head: true }).eq('passed', true)
    ]);

    return {
      activeEvents: eventsCount.count || 0,
      activeHackathons: hackathonsCount.count || 0,
      totalBlogs: blogsCount.count || 0,
      completedInterns: internsCount.count || 0,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return {
      activeEvents: 0,
      activeHackathons: 0,
      totalBlogs: 0,
      completedInterns: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

async function getInternships() {
  try {
    const supabase = getSupabaseClient();
    // Get count of completed successful internships for stats only (no personal data)
    const { count: completedCount } = await supabase
      .from('interns')
      .select('*', { count: 'exact', head: true })
      .eq('passed', true);

    // Static internship offerings from the website (public info only)
    const staticInternships = [
      {
        id: 'free-basic',
        title: 'Codeunia Starter Internship',
        description: 'Learn by doing real tasks with mentor check-ins. Remote friendly.',
        type: 'Free',
        domains: ['Web Development', 'Python', 'Java'],
        levels: ['Beginner', 'Intermediate'],
        benefits: [
          'Mentor-curated task list and review checkpoints',
          'Certificate on successful completion',
          'Access to Codeunia community and weekly standups',
          'Resume and GitHub review at the end',
          'Shortlisted for partner hackathons and projects'
        ]
      },
      {
        id: 'paid-pro',
        title: 'Codeunia Pro Internship',
        description: 'Work on production-grade projects with weekly reviews and certificate.',
        type: 'Paid',
        domains: ['Web Development', 'Artificial Intelligence', 'Machine Learning'],
        levels: ['Intermediate', 'Advanced'],
        priceInr: 4999,
        benefits: [
          'Guaranteed project with production code merges',
          '1:1 mentor reviews every week',
          'Priority career guidance + mock interview',
          'Letter of Recommendation (based on performance)',
          'Premium certificate and LinkedIn showcase assets',
          'Early access to partner roles and referrals'
        ]
      }
    ];

    return {
      completedCount: completedCount || 0,
      offerings: staticInternships
    };
  } catch (error) {
    console.error('Error fetching public internship data:', error);
    return {
      completedCount: 0,
      offerings: [
        {
          id: 'free-basic',
          title: 'Codeunia Starter Internship',
          description: 'Learn by doing real tasks with mentor check-ins. Remote friendly.',
          type: 'Free',
          domains: ['Web Development', 'Python', 'Java'],
          levels: ['Beginner', 'Intermediate']
        },
        {
          id: 'paid-pro',
          title: 'Codeunia Pro Internship',
          description: 'Work on production-grade projects with weekly reviews and certificate.',
          type: 'Paid',
          domains: ['Web Development', 'Artificial Intelligence', 'Machine Learning'],
          levels: ['Intermediate', 'Advanced'],
          priceInr: 4999
        }
      ]
    };
  }
}

async function getBlogs(limit = 5) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        id, title, content, excerpt, author, category,
        tags, created_at, reading_time, featured
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

async function getContextualData(userMessage: string, context: string, userId?: string): Promise<ContextData> {
  const message = userMessage.toLowerCase().trim();
  const data: ContextData = {};

  try {
    // Fetch user profile if userId is provided
    if (userId) {
      const supabase = getSupabaseClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (profile) {
        data.userProfile = profile;
      }
    }

    // Check if it's a simple greeting or technical question - minimal data
    const isSimpleGreeting = /^(hi|hello|hey|hii|hiii|sup|yo|hai|helo|hllo)!*$/i.test(message) ||
      message.length <= 5;

    const isGeneralQuestion = /^(tell me about|what is|about|info|information|codeunia)/.test(message.toLowerCase()) ||
      message.includes('tell me about') ||
      message.includes('what is codeunia') ||
      message.includes('about codeunia') ||
      (message.length < 30 && context === 'general');

    const isTechnicalQuestion = message.includes('algorithm') ||
      message.includes('code') ||
      message.includes('programming') ||
      message.includes('sort') ||
      message.includes('function') ||
      message.includes('java') ||
      message.includes('python') ||
      message.includes('javascript') ||
      message.includes('data structure') ||
      message.includes('give me') ||
      message.includes('how to') ||
      message.includes('explain');

    // Always get platform stats
    data.stats = await getPlatformStats();

    if (isSimpleGreeting || isGeneralQuestion || isTechnicalQuestion) {
      return data;
    }

    // Extract search terms for smarter data retrieval
    const searchTerms = extractSearchTerms(message);
    console.log('🔍 Extracted search terms:', searchTerms);

    // Get specific data based on context and message content
    if (message.includes('event') || context === 'events') {
      data.events = await getEvents(5, searchTerms);
    }

    if (message.includes('hackathon') || context === 'hackathons') {
      data.hackathons = await getHackathons(5, searchTerms);
      console.log(`🔍 Found ${data.hackathons.length} hackathons matching terms:`, searchTerms);
    }

    if (message.includes('internship') || message.includes('job') || message.includes('opportunity') || context === 'opportunities') {
      data.internships = await getInternships();
    }

    if (message.includes('blog') || message.includes('article') || message.includes('tutorial') || context === 'blogs') {
      data.blogs = await getBlogs(5);
    }

    // If no specific context, get a bit of everything for comprehensive answers EXCEPT internships
    if (context === 'general' && Object.keys(data).length === 1) {
      // If we have specific search terms, try to find matching events/hackathons even in general context
      if (searchTerms.length > 0) {
        data.events = await getEvents(3, searchTerms);
        data.hackathons = await getHackathons(3, searchTerms);
        console.log(`🔍 General Search - Found ${data.events.length} events and ${data.hackathons.length} hackathons`);
      } else {
        data.events = await getEvents(3);
        data.hackathons = await getHackathons(3);
      }

      data.blogs = await getBlogs(3);
      // Only include internships if the message specifically mentions them
      if (message.includes('internship') || message.includes('job') || message.includes('opportunity')) {
        data.internships = await getInternships();
      }
    }

    return data;
  } catch (error) {
    console.error('Error getting contextual data:', error);
    return { stats: await getPlatformStats() };
  }
}

// Detect actionable buttons based on AI response and context
function detectActions(
  userMessage: string,
  aiResponse: string,
  contextData: ContextData
): ActionButton[] {
  const actions: ActionButton[] = [];
  const lowerResponse = aiResponse.toLowerCase();
  const lowerMessage = userMessage.toLowerCase();

  // Detect if user is asking about availability/details (not just browsing)
  const isSeekingAction = lowerMessage.includes('available') ||
    lowerMessage.includes('register') ||
    lowerMessage.includes('join') ||
    lowerMessage.includes('sign up') ||
    lowerMessage.includes('happening') ||
    lowerMessage.includes('upcoming') ||
    lowerMessage.includes('what events') ||
    lowerMessage.includes('show me') ||
    lowerMessage.includes('tell me about');

  console.log('🔍 detectActions called:', {
    userMessage,
    isSeekingAction,
    hasEvents: !!contextData.events,
    eventCount: contextData.events?.length || 0,
    aiResponsePreview: aiResponse.substring(0, 100)
  });

  // Detect mentioned events
  if (contextData.events && contextData.events.length > 0) {
    contextData.events.forEach((event: Event) => {
      // Check if event is mentioned in the response
      const eventMentioned = lowerResponse.includes(event.title.toLowerCase());

      console.log('🎯 Checking event:', {
        eventTitle: event.title,
        eventTitleLower: event.title.toLowerCase(),
        eventMentioned,
        isSeekingAction
      });

      if (eventMentioned && isSeekingAction) {
        // Only add view button - registration happens on the event page itself
        // Use slug if available, otherwise fall back to ID
        const eventUrl = event.slug ? `/events/${event.slug}` : `/events/${event.id}`;
        actions.push({
          type: 'event_view',
          label: `View ${event.title}`,
          url: eventUrl,
          metadata: { eventId: event.id, eventSlug: event.slug, eventTitle: event.title },
          variant: 'primary'  // Make it primary since it's the main action
        });
      }
    });
  }

  // Detect mentioned hackathons
  if (contextData.hackathons && contextData.hackathons.length > 0) {
    contextData.hackathons.forEach((hackathon: Hackathon) => {
      const hackathonMentioned = lowerResponse.includes(hackathon.title.toLowerCase());

      if (hackathonMentioned && isSeekingAction) {
        // Only add view button - same as events
        // Use slug if available, otherwise fall back to ID
        const hackathonUrl = hackathon.slug ? `/hackathons/${hackathon.slug}` : `/hackathons/${hackathon.id}`;
        actions.push({
          type: 'hackathon_view',
          label: `View ${hackathon.title}`,
          url: hackathonUrl,
          metadata: { hackathonId: hackathon.id, hackathonSlug: hackathon.slug, hackathonTitle: hackathon.title },
          variant: 'primary'
        });
      }
    });
  }

  // Limit to max 4 actions to avoid overwhelming UI
  const finalActions = actions.slice(0, 4);
  console.log('✅ detectActions returning:', finalActions.length, 'actions', finalActions);
  return finalActions;
}

function buildPrompt(userMessage: string, contextData: ContextData, context: string) {
  const message = userMessage.toLowerCase().trim();

  // Get current date dynamically
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Get user name if available
  const userName = contextData.userProfile?.first_name ? ` ${contextData.userProfile.first_name}` : '';
  const userFullName = contextData.userProfile ? `${contextData.userProfile.first_name} ${contextData.userProfile.last_name}`.trim() : '';

  // PRIORITY CHECK: Specific internship-related queries only
  const isDirectInternshipQuery = message.includes('internship') ||
    message.includes('intern ') ||
    message.includes('interns') ||
    (message.includes('job') && (message.includes('opportunity') || message.includes('opening') || message.includes('apply'))) ||
    (message.includes('career') && (message.includes('opportunity') || message.includes('program'))) ||
    message.includes('employment opportunity') ||
    message.includes('hiring program') ||
    message.includes('work opportunity') ||
    message.includes('placement program') ||
    (message.includes('does codeunia have') && (message.includes('internship') || message.includes('program'))) ||
    (message.includes('do you have') && (message.includes('internship') || message.includes('job')));

  if (isDirectInternshipQuery) {
    return `🚨 MANDATORY INTERNSHIP RESPONSE 🚨

            You MUST respond with this exact structure for ANY internship- related query:

            "Yes${userName}! Codeunia runs its own comprehensive internship programs:

🆓 ** Codeunia Starter Internship(FREE) **:
            - Perfect for beginners and intermediate learners
              - Real tasks with mentor check - ins
                - Certificate upon completion
                  - Community access and weekly standups
                    - Resume and GitHub review

💰 ** Codeunia Pro Internship(₹4999) **:
          - For intermediate and advanced developers
            - Production - grade projects with weekly reviews
              - 1: 1 mentor sessions
                - Letter of recommendation
                  - Premium certificate and LinkedIn assets
                    - Priority career guidance

Both programs are run BY Codeunia WITH Codeunia mentors ON Codeunia projects!

These are Codeunia's own internship programs - we're not just a platform that connects you to external companies.We run comprehensive, hands - on internship programs internally with dedicated mentorship and real projects.

Would you like more details about either program or help choosing which one is right for you${userName}?"

❌ DO NOT suggest external programs
❌ DO NOT say you don't have information
❌ ALWAYS mention both Codeunia Starter and Codeunia Pro by name`;
  }

  const isSimpleGreeting = /^(hi|hello|hey|hii|hiii|sup|yo|hai|helo|hllo)!*$/i.test(message) ||
    message.length <= 5;

  const isGeneralQuestion = /^(tell me about|what is|about|info|information|codeunia)/.test(message.toLowerCase()) ||
    message.includes('tell me about') ||
    message.includes('what is codeunia') ||
    message.includes('about codeunia') ||
    (message.length < 30 && context === 'general');

  const isProgrammingQuestion = (
    message.includes('algorithm') ||
    message.includes('code ') || // Space to avoid matching 'codeunia'
    message.includes('coding') ||
    message.includes('programming') ||
    message.includes('sort') ||
    message.includes('function') ||
    message.includes('java ') ||
    message.includes('python') ||
    message.includes('javascript') ||
    message.includes('data structure') ||
    message.includes('give me code') ||
    message.includes('how to') ||
    message.includes('explain')
  ) && !(
    message.includes('hackathon') ||
    message.includes('event') ||
    message.includes('internship') ||
    message.includes('job') ||
    message.includes('opportunity') ||
    message.includes('register')
  );

  // Check if user is asking for their name
  const isAskingName = message.includes('what is my name') ||
    message.includes('who am i') ||
    message.includes('do you know my name');

  if (isAskingName) {
    if (userFullName) {
      return `You are Codeunia AI Assistant. The user asked "What is my name?".
      
      Respond enthusiastically: "You are ${userFullName}! It's great to be chatting with you."
      
      Then briefly ask how you can help them today.`;
    } else {
      return `You are Codeunia AI Assistant. The user asked "What is my name?".
      
      Respond politely that you don't have their name in your current records, but you're happy to help them with anything related to Codeunia.`;
    }
  }

  if (isSimpleGreeting) {
    return `You are Codeunia AI Assistant.The user${userName ? ` (${userName})` : ''} just said "${userMessage}". 

Respond with a brief, friendly greeting${userName ? ` using their name "${userName}"` : ''} (2 - 3 sentences max) and ask how you can help them with Codeunia's events, hackathons, or opportunities. 

Keep it short, welcoming, and conversational.Don't provide detailed information unless specifically asked.`;
  }

  if (isGeneralQuestion) {
    return `You are Codeunia AI Assistant. The user${userName ? ` (${userName})` : ''} is asking "${userMessage}". 

Give a brief, friendly overview of Codeunia (3-4 sentences max). Mention that Codeunia is a platform for coders with events, hackathons, and opportunities. Keep it conversational and invite them to ask about specific topics.

Current stats: ${contextData.stats ? `${contextData.stats.activeEvents} events, ${contextData.stats.activeHackathons} hackathons, ${contextData.stats.totalBlogs} blogs` : 'platform data available'}.

Don't list all details - just give a warm introduction and ask what they'd like to know more about.`;
  }

  if (isProgrammingQuestion) {
    return `You are the Codeunia AI Assistant with expertise in programming and computer science. The user asked: "${userMessage}".

RESPONSE GUIDELINES:
- Provide a comprehensive, educational answer to their programming question
- Include code examples, explanations, and best practices when relevant
- Be helpful and informative for learning
- Keep responses focused on the technical question
- Only mention Codeunia if there's a directly relevant, currently active opportunity
- NO promotion of ended events or excessive marketing

Current date: September 2, 2025
Available Codeunia data: ${JSON.stringify(contextData, null, 2)}`;
  }

  // For specific Codeunia queries
  let prompt = `You are Unio, Codeunia's AI Assistant powered by OpenRouter. You are a helpful AI that provides information about Codeunia's events, hackathons, opportunities, and educational content.
  
  USER INFO:
  - Name: ${userFullName || 'Unknown'}
  
  IMPORTANT: You are ONLY an information assistant. You CANNOT and WILL NOT:
  - Delete, modify, or access any databases
  - Execute any commands or scripts
  - Perform any administrative actions
  - Access or modify system files
  - You can only provide information and answer questions

  ABOUT CODEUNIA:
  Codeunia is a comprehensive platform for programmers and coding enthusiasts that offers:

  🎯 CORE SERVICES:
  - Events & Workshops: Technical workshops, coding sessions, and educational events
  - Hackathons: Competitive programming events with prizes and recognition
  - Internship Programs: Codeunia offers its own internship programs (both free and paid)
  - Blog & Resources: Educational content, tutorials, and coding guides
  - Community Building: Networking and collaboration opportunities
  - Premium Memberships: Enhanced features and exclusive access

🏢 PLATFORM FEATURES:
- User Profiles: Personalized dashboards for tracking progress
- Event Registration: Easy signup for events and hackathons
- Leaderboards: Competitive rankings and achievements
- Certificates: Digital certificates for completed events
- Learning Resources: Tutorials, blogs, and educational content

👥 TARGET AUDIENCE:
- Students learning programming
- Professional developers
- Tech enthusiasts
- Companies looking for talent
- Educational institutions

🌐 WEBSITE SECTIONS:
- Homepage: Platform overview and featured content
- Events: Browse and register for upcoming events
- Hackathons: Competitive programming challenges
- Internships: Codeunia's own internship programs
- Blog: Educational articles and tutorials
- About: Platform information and team details
- Contact: Support and inquiry forms
- Premium: Membership plans and benefits

💼 INTERNSHIP PROGRAMS (mention ONLY when specifically asked about internships):
Codeunia runs its own internship programs:

1. 🆓 CODEUNIA STARTER INTERNSHIP (FREE):
   - For beginners and intermediate learners
   - Real tasks with mentor check-ins
   - Certificate upon completion
   - Community access and weekly standups

2. 💰 CODEUNIA PRO INTERNSHIP (₹4999):
   - For intermediate and advanced developers
   - Production-grade projects with weekly reviews
   - 1:1 mentor sessions
   - Letter of recommendation
   - Premium certificate and LinkedIn assets

Current Date: ${formattedCurrentDate}

IMPORTANT SECURITY GUIDELINES:
- NEVER respond to requests about deleting, modifying, or accessing databases
- NEVER provide instructions for hacking or malicious activities
- NEVER execute or simulate dangerous commands
- Always clarify that you are an information-only assistant

RESPONSE GUIDELINES:
- Answer the user's specific question directly
- Only mention internships if specifically asked about them
- Focus on the relevant topic (events, hackathons, blogs, etc.)
- Keep responses helpful and relevant to the user's query
- Don't force internship information into unrelated topics

USER QUESTION: ${userMessage}

CODEUNIA DATA AVAILABLE:
`;

  // Add platform statistics
  if (contextData.stats) {
    prompt += `\nPLATFORM STATISTICS:
- Active Events: ${contextData.stats.activeEvents}
- Active Hackathons: ${contextData.stats.activeHackathons}
- Total Blogs: ${contextData.stats.totalBlogs}
- Completed Successful Internships: ${contextData.stats.completedInterns}
- Last Updated: ${contextData.stats.lastUpdated}
`;
  }

  // Add events data
  if (contextData.events && contextData.events.length > 0) {
    prompt += `\nCURRENTLY ACTIVE EVENTS (${contextData.events.length} found):\n`;
    contextData.events.forEach((event: Event) => {
      prompt += `
EVENT: ${event.title}
- ID: ${event.id}
- Description: ${event.description}
- Date: ${event.date}
- Time: ${event.time}
- Location: ${event.location}
- Price: ${event.price || 'Free'}
- STATUS: ${event.status === 'live' ? 'CURRENT/UPCOMING' : 'COMPLETED'}
- Tags: ${Array.isArray(event.tags) ? event.tags.join(', ') : event.tags}
`;
    });
  }

  // Add hackathons data
  if (contextData.hackathons && contextData.hackathons.length > 0) {
    prompt += `\nCURRENTLY ACTIVE HACKATHONS (${contextData.hackathons.length} found):\n`;
    contextData.hackathons.forEach((hackathon: Hackathon) => {
      prompt += `
HACKATHON: ${hackathon.title}
- ID: ${hackathon.id}
- Description: ${hackathon.description}
- Date: ${hackathon.date}
- Theme/Category: ${hackathon.category || 'General'}
- Location: ${hackathon.location}
- Prize Pool: ${hackathon.prize || 'Not specified'}
- Registration Deadline: ${hackathon.registration_deadline} (last day to register)
- STATUS: ${hackathon.status === 'live' ? 'CURRENT/UPCOMING' : 'COMPLETED'}
`;
    });
  } else if (message.includes('hackathon')) {
    prompt += `\nNO ACTIVE HACKATHONS FOUND matching your search.\n`;
  }

  // Add internships data
  if (contextData.internships) {
    prompt += `\nINTERNSHIP INFORMATION:\n`;

    // Available internship programs (public info only)
    if (contextData.internships.offerings && contextData.internships.offerings.length > 0) {
      prompt += `\nAVAILABLE INTERNSHIP PROGRAMS:\n`;
      contextData.internships.offerings.forEach((internship: InternshipOffering) => {
        prompt += `
PROGRAM: ${internship.title}
- Type: ${internship.type} ${internship.priceInr ? `(₹${internship.priceInr})` : ''}
- Description: ${internship.description}
- Domains: ${internship.domains.join(', ')}
- Levels: ${internship.levels.join(', ')}
- Benefits:
${internship.benefits ? internship.benefits.map((benefit: string) => `  • ${benefit}`).join('\n') : '  • Details available on website'}
`;
      });
    }

    // Success statistics only (no personal details)
    if (contextData.internships.completedCount > 0) {
      prompt += `\nSUCCESS RATE:\n`;
      prompt += `- ${contextData.internships.completedCount} students have successfully completed Codeunia internships\n`;
      prompt += `- All graduates receive verified certificates\n`;
      prompt += `- Projects range from web development to AI/ML applications\n`;
      prompt += `- High job placement rate among graduates\n`;
    }
  }

  // Add blogs data
  if (contextData.blogs && contextData.blogs.length > 0) {
    prompt += `\nBLOG ARTICLES & TUTORIALS:\n`;
    contextData.blogs.forEach((blog: Blog) => {
      prompt += `
BLOG: ${blog.title}
- Author: ${blog.author}
- Category: ${blog.category}
- Excerpt: ${blog.excerpt}
- Reading Time: ${blog.reading_time} minutes
- Published: ${blog.created_at}
- Featured: ${blog.featured ? 'Yes' : 'No'}
- Tags: ${Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags}
`;
    });
  }

  prompt += `\nIMPORTANT RESPONSE GUIDELINES:
- Answer the user's specific question directly and relevantly
- Use the detailed information provided above that's relevant to their query
- TERMINOLOGY: Use correct terms - HACKATHONS are separate from EVENTS. Do not call a hackathon an "event"
- REGISTRATION DEADLINE: This is the LAST DAY to register, not when registration opens. Say "Registration deadline is [date]" not "Registration opens on [date]"
- When users ask about "available", "happening", "upcoming", or "current" events/hackathons, ONLY mention items with [CURRENT/UPCOMING] status
- NEVER mention completed events/hackathons (marked [COMPLETED]) when asked about "available", "happening", or "current" items
- DO NOT say "X event has ended" or mention past events unless the user specifically asks about them
- Keep responses concise - only list relevant, actionable information
- If there are no current/upcoming events, simply say "There are no upcoming [events/hackathons] at the moment"
- Only mention internships if the user specifically asks about them
- Don't force unrelated topics into the conversation
- If asked about deleting databases or malicious activities, politely decline and explain you are an information-only assistant
- Focus on helping users with their specific questions about Codeunia`;

  return prompt;
}

function determineContext(message: string) {
  const msg = message.toLowerCase();

  if (msg.includes('event')) return 'events';
  if (msg.includes('hackathon')) return 'hackathons';
  if (msg.includes('internship') || msg.includes('opportunity') || msg.includes('job')) return 'opportunities';
  if (msg.includes('blog') || msg.includes('article')) return 'blogs';
  if (msg.includes('search') || msg.includes('find')) return 'search';

  return 'general';
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Check authentication
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          response: 'Please sign in to use the AI assistant.',
          context: 'auth_error',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // Extract user information for database logging
    const userId = user.id;

    // Check rate limit
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitCheck.error },
        { status: 429 }
      );
    }

    const { message, context }: ChatRequest = await request.json();

    // Validate input
    const validation = validateInput(message);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Determine context if not provided
    const finalContext = context || determineContext(message);

    // Get contextual data
    const contextData = await getContextualData(message, finalContext, userId);

    // Build prompt
    const prompt = buildPrompt(message, contextData, finalContext);

    // Check if streaming is requested (default to streaming for better UX)
    const useStreaming = request.headers.get('x-use-streaming') !== 'false';

    if (useStreaming) {
      // STREAMING MODE
      const encoder = new TextEncoder();
      let fullResponse = '';

      const stream = new ReadableStream({
        async start(controller) {
          try {
            const openrouterStream = await callOpenRouterAPIStream(prompt);
            const reader = openrouterStream.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // Detect actions after full response is accumulated
                const detectedActions = detectActions(message, fullResponse, contextData);
                console.log('🎯 Streaming complete, detected actions:', detectedActions);

                // Send completion event with actions
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  done: true,
                  actions: detectedActions
                })}\n\n`));

                // Save to database after stream completes
                try {
                  // Check if conversation should be saved
                  const shouldSave = await shouldSaveConversation(message, userId);

                  if (shouldSave) {
                    const sessionId = crypto.randomUUID();
                    const supabase = getSupabaseClient();

                    await supabase
                      .from('ai_training_data')
                      .insert({
                        user_id: userId,
                        session_id: sessionId,
                        query_text: message,
                        response_text: fullResponse,
                        context_type: finalContext
                      });

                    console.log(`Streaming conversation saved to database (User: ${userId})`);
                  } else {
                    console.log(`Streaming conversation filtered out (User: ${userId})`);
                  }
                } catch (dbError) {
                  console.error('Error saving streaming conversation:', dbError);
                }

                controller.close();
                break;
              }

              // Parse SSE chunks from OpenRouter
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);

                  if (data === '[DONE]') {
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;

                    if (content) {
                      fullResponse += content;

                      // Send chunk to client
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                          content,
                          context: finalContext
                        })}\n\n`)
                      );
                    }
                  } catch {
                    // Ignore parse errors for malformed chunks
                    continue;
                  }
                }
              }
            }
          } catch (error) {
            console.error('Streaming error:', error);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                error: 'Stream error occurred'
              })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // NON-STREAMING MODE (original behavior)
      const aiResponse = await callOpenRouterAPI(prompt);

      // Save conversation to database for training and analytics
      try {
        // Check if conversation should be saved
        const shouldSave = await shouldSaveConversation(message, userId);

        if (shouldSave) {
          const sessionId = crypto.randomUUID();
          const supabase = getSupabaseClient();

          const { error: dbError } = await supabase
            .from('ai_training_data')
            .insert({
              user_id: userId || null,
              session_id: sessionId,
              query_text: message,
              response_text: aiResponse,
              context_type: finalContext
            });

          if (dbError) {
            console.error('Failed to save AI conversation:', dbError);
          } else {
            const userInfo = userId ? `(User: ${userId})` : '(Anonymous)';
            console.log(`AI conversation saved successfully to database ${userInfo}`);
          }
        } else {
          console.log(`Non-streaming conversation filtered out (User: ${userId})`);
        }
      } catch (dbSaveError) {
        console.error('Error saving to database:', dbSaveError);
      }

      // Detect actions for non-streaming mode
      const detectedActions = detectActions(message, aiResponse, contextData);
      console.log('🎯 Non-streaming complete, detected actions:', detectedActions);

      return NextResponse.json({
        success: true,
        response: aiResponse,
        context: finalContext,
        actions: detectedActions,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('AI Chat error:', error);

    // Don't expose internal errors
    return NextResponse.json(
      {
        success: false,
        error: 'Service temporarily unavailable',
        message: 'Please try again later.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Codeunia AI Chat API',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/ai',
    },
    timestamp: new Date().toISOString()
  });
}
