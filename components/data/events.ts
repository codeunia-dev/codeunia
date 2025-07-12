export interface Event {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  organizer: string;
  organizer_contact?: {
    phone?: string;
    email?: string;
  };
  date: string;
  time: string;
  duration: string;
  category: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  image: string;
  location: string;
  locations: string[];
  capacity: number;
  registered: number;
  price: string;
  payment: 'Paid' | 'Free';
  status: 'live' | 'expired' | 'closed' | 'recent';
  eventType: ('Online' | 'Offline' | 'Hybrid')[];
  teamSize: number | [number, number];
  userTypes: string[];
  registration_required: boolean;
  registration_deadline: string;
  rules?: string[];
  schedule?: { date: string; label: string }[];
  prize?: string;
  prize_details?: string;
  faq?: { question: string; answer: string }[];
  socials?: {
    whatsapp?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
  sponsors?: { name: string; logo: string; type: string }[];
  marking_scheme?: {
    total_marks: number;
    breakdown: { difficulty: string; count: number; marks_each: number }[];
    notes: string[];
  };
}

export const eventCategories = [
  "All",
  "Hackathons",
  "Workshops", 
  "Conferences",
  "Webinars",
  "Mentorship Programs",
  "Career Fairs",
  "Tech Talks",
  "Coding Competitions",
  "Project Showcases"
];

// Mock events data - in a real app, this would come from Supabase
export const mockEvents: Event[] = [
  {
    id: 1,
    slug: "realitycode-hackathon-2025",
    title: "RealityCode by Codeunia",
    excerpt: "India's Smartest Innovation Showdown - A reality-show-style hackathon where entertainment meets engineering",
    description: "India's first reality-show-style hackathon where entertainment meets engineering. Compete in live eliminations, technical battles, and collaborative problem-solving across 5 adrenaline-filled rounds. Join 5,000+ participants for a prize pool of ₹1,00,000+ and experience innovation, adaptability, and showmanship like never before.",
    organizer: "Codeunia",
    organizer_contact: {
      phone: "+91 86990 25107",
      email: "codeunia@gmail.com"
    },
    date: "2025-08-25",
    time: "12:00 AM",
    duration: "Multi-round",
    category: "Hackathons",
    categories: ["Hackathons", "Innovation", "Competition"],
    tags: ["Reality Show", "Innovation", "Live Coding", "Competition", "Engineering"],
    featured: true,
    image: "/images/events/hackathons/realitycode.jpeg",
    location: "Chandigarh University (Finale)",
    locations: ["Online", "Chandigarh"],
    capacity: 500,
    registered: 160,
    price: "199",
    payment: "Free",
    status: "live",
    eventType: ["Hybrid"],
    teamSize: [1, 5],
    userTypes: ["College Students", "Professionals", "Developers"],
    registration_required: true,
    registration_deadline: "2025-08-25",
    rules: [
      "All development must occur during the hackathon",
      "Plagiarism or pre-built project submissions will be disqualified",
      "Maintain professional behavior & code of conduct",
      "Public voting will partially influence the final scores",
      "Finalists must wear official RealityCode badges during the finale"
    ],
    schedule: [
      { date: "Aug 25", label: "Registration Deadline" },
      { date: "Sep 10", label: "Round 1: Online Qualifier Submission" },
      { date: "Sep 20", label: "Round 2: Jury Shortlisting" },
      { date: "Oct 15", label: "Round 3: Grand Finale Day 1" },
      { date: "Oct 16", label: "Round 3: Grand Finale Day 2" }
    ],
    prize: "₹22,000+",
    prize_details: "Winner: ₹10,000, First Runner Up: ₹7,000, Second Runner Up: ₹5,000. Plus swag kits, merchandise, API credits, premium tech memberships, mentorship sessions, and recognition across Codeunia platforms.",
    faq: [
      { question: "What is the team size limit?", answer: "Teams can have 1 to 5 members. Inter-college and interdisciplinary teams are welcome." },
      { question: "Is this a reality show format?", answer: "Yes, it's India's first reality-show-style hackathon with live eliminations and technical battles." },
      { question: "What are the special perks for first-year students?", answer: "Dedicated mentorship before Round 1, 10% bonus in preliminary evaluation, learning pathway access, and networking with senior teams." },
      { question: "What are the 5 rounds in the finale?", answer: "BootStart (rapid prototyping), Pitch Panic (live pitching), Feature Drop (surprise features), CodeSwap (debugging), and Final Build (rebuilding under constraints)." }
    ],
    socials: {
      whatsapp: "https://wa.me/918699655907",
      instagram: "https://instagram.com/codeunia",
      linkedin: "https://linkedin.com/company/codeunia",
      email: "codeunia@gmail.com"
    },
    sponsors: [
    
     
      { name: 'GeeksforGeeks', logo: '/images/sponsors/geekforgeeks.png', type: 'Knowledge & Learning Partner' },
      { name: 'Unstop', logo: '/images/sponsors/unstop.png', type: 'Technology Partner' },
      { name: 'Webytes', logo: '/images/sponsors/webytes.png', type: 'Community Engagement Partner' },
      { name: 'Codecrafter', logo: '/images/sponsors/codecrafter.png', type: 'Upskilling Partner' },
      { name: 'Alexa Dev Community', logo: '/images/sponsors/alexadevcommunity.png', type: 'Community Engagement Partner' },
      { name: 'GFG Student Chapter CU', logo: '/images/sponsors/studentchaptercu.png', type: 'Community Engagement Partner' },
      { name: 'Rotaract CU', logo: '/images/sponsors/rotaract.png', type: 'Community Engagement Partner' },
    ]
  },
  {
    id: 2,
    slug: "coderush-weekly-2025",
    title: "CodeRush Weekly",
    excerpt: "Your weekly coding showdown – Compete, Learn, and Win!",
    description: "Join CodeRush Weekly – a fair, proctored, and competitive coding challenge that tests your aptitude, DSA, and interview readiness in a real hiring simulation. Solve curated problems, compete with top coders, and climb the leaderboard with weekly challenges. Rankings, certificates, and exclusive rewards await the best minds.",
    organizer: "Codeunia & Devantra Community",
    organizer_contact: {
      phone: "+91 86990 25107",
      email: "codeunia@gmail.com"
    },
    date: "2025-07-13", // You can update this weekly
    time: "7:00 PM",
    duration: "2 hrs",
    category: "Coding Contest",
    categories: ["Contests", "Interview Prep", "Competitive Programming"],
    tags: ["Coding", "DSA", "Interview Prep", "Aptitude", "Leaderboard"],
    featured: true,
    image: "/images/events/hackathons/coderush.jpeg",
    location: "Online",
    locations: ["Online"],
    capacity: 1500,
    registered: 600,
    price: "Free",
    payment: "Free",
    status: "live",
    eventType: ["Online"],
    teamSize: [1, 1],
    userTypes: ["College Students", "Aspiring Developers", "Interview Seekers"],
    registration_required: true,
    registration_deadline: "2025-07-12",
    rules: [
      "The assessment opens in full-screen mode. Tab-switching or background activity will result in disqualification.",
      "Participants must complete the test in one sitting. No retakes or breaks are allowed.",
      "Only the first submission for each question will be evaluated. Edits or resubmissions are not permitted.",
      "Using AI tools, copied code, or external help is strictly prohibited. Plagiarism leads to immediate disqualification.",
      "Ensure a stable internet connection and avoid refreshing or closing the browser tab during the contest."
    ],
    schedule: [
      { date: "Jul 12", label: "Last Date to Register" },
      { date: "Jul 13", label: "Contest Day: 9:00 AM – 7:00 PM" },
      { date: "Jul 14", label: "Results and Leaderboard Release" }
    ],
    prize: "Certificates",
    prize_details: "Top scorers receive digital certificates and leaderboard badges. Recurring winners may receive internship interview calls and spotlight features.",
    faq: [
      { question: "Who can participate?", answer: "Anyone passionate about coding – college students, job seekers, and aspiring developers are welcome." },
      { question: "Is there any registration fee?", answer: "No, CodeRush Weekly is completely free to participate." },
      { question: "Can I participate in teams?", answer: "No, it is an individual contest to assess personal coding and logical abilities." },
      { question: "Will the test be proctored?", answer: "Yes, tab-switching and suspicious behavior will lead to automatic disqualification." }
    ],
    marking_scheme: {
      total_marks: 100,
      breakdown: [
        { difficulty: "Hard", count: 2, marks_each: 25 },
        { difficulty: "Intermediate", count: 2, marks_each: 15 },
        { difficulty: "Easy", count: 2, marks_each: 10 }
      ],
      notes: [
        "No negative marking",
        "Marks are awarded only for fully correct solutions",
        "No marks for partially correct or sample-test-only solutions"
      ]
    },
    socials: {
      whatsapp: "https://wa.me/918699025107",
      instagram: "https://instagram.com/codeunia",
      linkedin: "https://linkedin.com/company/codeunia",
      email: "codeunia@gmail.com"
    },
    sponsors: []
  }
]; 