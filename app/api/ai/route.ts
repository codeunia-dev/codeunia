import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

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

// Configure the runtime for this API route
export const runtime = 'nodejs';

// Initialize OpenRouter AI
// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is required');
}

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Function to call OpenRouter API with DeepSeek V3.1 and free fallbacks
async function callOpenRouterAPI(prompt: string): Promise<string> {
  const models = [
    "deepseek/deepseek-chat-v3.1:free", // Primary - DeepSeek V3.1 FREE
    "deepseek/deepseek-chat-v3.1:free", // Retry V3.1 if first fails
    "meta-llama/llama-3.2-11b-vision-instruct:free", // Free alternative
    "qwen/qwen-2.5-7b-instruct:free",   // Free alternative
    "google/gemma-2-9b-it:free",        // Google's free model
    "huggingfaceh4/zephyr-7b-beta:free", // Hugging Face free model
    "deepseek/deepseek-chat-v3.1:free"  // Final fallback to V3.1
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
}

// Database service functions
async function getEvents(limit = 10) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, title, description, excerpt, date, time, duration,
        location, locations, status, event_type, registration_deadline,
        capacity, registered, category, categories, tags, price, organizer
      `)
      .eq('status', 'live')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

async function getHackathons(limit = 10) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('hackathons')
      .select(`
        id, title, description, excerpt, date, time, duration,
        registration_deadline, status, location, locations,
        capacity, registered, category, categories, tags,
        price, organizer, prize, prize_details, team_size
      `)
      .eq('status', 'live')
      .order('date', { ascending: true })
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

async function getContextualData(userMessage: string, context: string): Promise<ContextData> {
  const message = userMessage.toLowerCase().trim();
  const data: ContextData = {};

  try {
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

    // Get specific data based on context and message content
    if (message.includes('event') || context === 'events') {
      data.events = await getEvents(5);
    }

    if (message.includes('hackathon') || context === 'hackathons') {
      data.hackathons = await getHackathons(5);
    }

    if (message.includes('internship') || message.includes('job') || message.includes('opportunity') || context === 'opportunities') {
      data.internships = await getInternships();
    }

    if (message.includes('blog') || message.includes('article') || message.includes('tutorial') || context === 'blogs') {
      data.blogs = await getBlogs(5);
    }

    // If no specific context, get a bit of everything for comprehensive answers EXCEPT internships
    if (context === 'general' && Object.keys(data).length === 1) {
      data.events = await getEvents(3);
      data.hackathons = await getHackathons(3);
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

function buildPrompt(userMessage: string, contextData: ContextData, context: string) {
  const message = userMessage.toLowerCase().trim();
  
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

You MUST respond with this exact structure for ANY internship-related query:

"Yes! Codeunia runs its own comprehensive internship programs:

🆓 **Codeunia Starter Internship (FREE)**:
- Perfect for beginners and intermediate learners
- Real tasks with mentor check-ins
- Certificate upon completion
- Community access and weekly standups
- Resume and GitHub review

💰 **Codeunia Pro Internship (₹4999)**:
- For intermediate and advanced developers
- Production-grade projects with weekly reviews
- 1:1 mentor sessions
- Letter of recommendation
- Premium certificate and LinkedIn assets
- Priority career guidance

Both programs are run BY Codeunia WITH Codeunia mentors ON Codeunia projects!

These are Codeunia's own internship programs - we're not just a platform that connects you to external companies. We run comprehensive, hands-on internship programs internally with dedicated mentorship and real projects.

Would you like more details about either program or help choosing which one is right for you?"

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

  const isProgrammingQuestion = message.includes('algorithm') ||
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
  
  if (isSimpleGreeting) {
    return `You are Codeunia AI Assistant. The user just said "${userMessage}". 

Respond with a brief, friendly greeting (2-3 sentences max) and ask how you can help them with Codeunia's events, hackathons, or opportunities. 

Keep it short, welcoming, and conversational. Don't provide detailed information unless specifically asked.`;
  }

  if (isGeneralQuestion) {
    return `You are Codeunia AI Assistant. The user is asking "${userMessage}". 

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

Current Date: September 3, 2025

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

  // Add events data with date analysis
  if (contextData.events && contextData.events.length > 0) {
    prompt += `\nEVENT DETAILS (analyze dates carefully - current date is September 2, 2025):\n`;
    contextData.events.forEach((event: Event) => {
      const eventDate = new Date(event.date);
      const currentDate = new Date('2025-09-02');
      const status = eventDate >= currentDate ? 'CURRENT/UPCOMING' : 'COMPLETED';
      
      prompt += `
EVENT: ${event.title} [${status}]
- Description: ${event.description}
- Date: ${event.date} at ${event.time}
- Duration: ${event.duration}
- Location: ${event.location}
- Status: ${event.status}
- Type: ${Array.isArray(event.event_type) ? event.event_type.join(', ') : event.event_type}
- Registration Deadline: ${event.registration_deadline}
- Capacity: ${event.capacity} (${event.registered} registered)
- Category: ${event.category}
- Price: ${event.price}
- Organizer: ${event.organizer}
- Tags: ${Array.isArray(event.tags) ? event.tags.join(', ') : event.tags}
`;
    });
  }

  // Add hackathons data
  if (contextData.hackathons && contextData.hackathons.length > 0) {
    prompt += `\nHACKATHON DETAILS:\n`;
    contextData.hackathons.forEach((hackathon: Hackathon) => {
      prompt += `
HACKATHON: ${hackathon.title}
- Description: ${hackathon.description}
- Start Date: ${hackathon.date}
- End Date: ${hackathon.duration || 'Not specified'}
- Theme: ${hackathon.category || 'General'}
- Location: ${hackathon.location}
- Prize Pool: ${hackathon.prize || 'Not specified'}
- Registration: ${hackathon.registration_deadline}
`;
    });
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
- Clearly distinguish between current/upcoming vs completed events
- If asking about "current" or "happening now" events, focus on those with dates on/after September 2, 2025
- For completed events, mention they have ended but provide the details for reference
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
    const contextData = await getContextualData(message, finalContext);
    
    // Build prompt
    const prompt = buildPrompt(message, contextData, finalContext);
    
    // Generate AI response using DeepSeek
    const aiResponse = await callOpenRouterAPI(prompt);

    // Save conversation to database for training and analytics
    try {
      // Generate a proper UUID for session_id
      const sessionId = crypto.randomUUID();
      const supabase = getSupabaseClient();
      
      const { error: dbError } = await supabase
        .from('ai_training_data')
        .insert({
          user_id: userId || null, // Use actual user ID when available
          session_id: sessionId,
          query_text: message,
          response_text: aiResponse,
          context_type: finalContext
        });
      
      if (dbError) {
        console.error('Failed to save AI conversation:', dbError);
        // Don't fail the request if DB save fails
      } else {
        const userInfo = userId ? `(User: ${userId})` : '(Anonymous)';
        console.log(`AI conversation saved successfully to database ${userInfo}`);
      }
    } catch (dbSaveError) {
      console.error('Error saving to database:', dbSaveError);
      // Continue with response even if DB save fails
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      context: finalContext,
      timestamp: new Date().toISOString()
    });

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
