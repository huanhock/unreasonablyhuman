export interface Client {
  id: string;
  name: string;
  company: string;
  avatar: string;
  status: 'cold' | 'warm' | 'hot';
  howWeMet: string;
  lastContacted: string;
  birthday: string;
  needs: string;
  howHelped: string;
  plans: string;
  preferences: {
    family: string[];
    holidays: { date: string; destination: string }[];
    food: string[];
    hobbies: string[];
  };
  budget: '$' | '$$' | '$$$';
  meetingHistory: MeetingNote[];
}

export interface MeetingNote {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  location: string;
  topics: string[];
  followUps: { task: string; done: boolean }[];
  smallTalk: {
    family?: string;
    holidays?: string;
    food?: string;
    hobbies?: string;
  };
}

export interface CalendarEvent {
  time: string;
  title: string;
  location: string;
  clientId?: string;
}

export interface Todo {
  task: string;
  clientId: string;
  clientName: string;
  suggestedTime?: string;
}

export interface NewsItem {
  headline: string;
  source: string;
  relevantClients: string[];
  shareNote: string;
}

export const USER_NAME = 'Daven';

export const clients: Client[] = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    company: 'TechVentures',
    avatar: '/avatars/sarah.png',
    status: 'hot',
    howWeMet: 'Introduced at FinTech Summit 2024',
    lastContacted: '2026-05-07',
    birthday: '05-09',
    needs: 'Portfolio diversification into AI-driven funds, estate planning for growing family',
    howHelped: 'Structured her Series B proceeds into a balanced portfolio, introduced her to tax advisor',
    plans: 'Review Q3 performance, explore new ESG fund options',
    preferences: {
      family: ['2 daughters (ages 8, 12)', 'Husband is a software engineer at Google'],
      holidays: [{ date: '2026-07-15', destination: 'Osaka, Japan' }],
      food: ['Loves tiramisu', 'Matcha everything', 'Allergic to shellfish'],
      hobbies: ['Pilates (Mon/Wed/Fri mornings)', 'Photography — landscape'],
    },
    budget: '$$$',
    meetingHistory: [
      {
        id: 'mn-1',
        clientId: 'sarah-chen',
        clientName: 'Sarah Chen',
        date: '2026-05-07',
        location: 'Coffee at The Roastery, Orchard Rd',
        topics: ['Q2 portfolio review', 'Estate planning update'],
        followUps: [
          { task: 'Send updated fund prospectus for AI Growth Fund', done: false },
          { task: 'Schedule meeting with estate planning attorney', done: false },
        ],
        smallTalk: {
          family: 'Older daughter just won a school science competition',
          holidays: 'Finalizing Osaka itinerary — wants restaurant recommendations',
          food: 'Tried a new matcha place in Tiong Bahru, loved it',
        },
      },
      {
        id: 'mn-2',
        clientId: 'sarah-chen',
        clientName: 'Sarah Chen',
        date: '2026-04-15',
        location: 'Zoom call',
        topics: ['Tax optimization strategy', 'ESG fund interest'],
        followUps: [
          { task: 'Send ESG fund comparison report', done: true },
          { task: 'Introduce to tax advisor', done: true },
        ],
        smallTalk: {
          hobbies: 'Just got a new Sony camera for landscape photography',
        },
      },
    ],
  },
  {
    id: 'marcus-rivera',
    name: 'Marcus Rivera',
    company: 'GreenBuild Co.',
    avatar: '/avatars/marcus.png',
    status: 'warm',
    howWeMet: 'Introduced by mutual friend David at a golf outing',
    lastContacted: '2026-04-28',
    birthday: '05-15',
    needs: 'Business expansion financing, personal wealth management',
    howHelped: 'Structured bridge loan for warehouse expansion, set up retirement account',
    plans: 'Discuss Series A fundraising strategy, review insurance coverage',
    preferences: {
      family: ['Wife Elena (architect)', 'Son Lucas (age 3)'],
      holidays: [{ date: '2026-12-20', destination: 'Aspen, Colorado' }],
      food: ['Steak enthusiast', 'Red wine — prefers Malbec', 'No dietary restrictions'],
      hobbies: ['Golf (15 handicap)', 'Hiking — did Kilimanjaro in 2024'],
    },
    budget: '$$',
    meetingHistory: [
      {
        id: 'mn-3',
        clientId: 'marcus-rivera',
        clientName: 'Marcus Rivera',
        date: '2026-04-28',
        location: 'Lunch at CUT by Wolfgang Puck',
        topics: ['Warehouse expansion update', 'Series A timeline'],
        followUps: [
          { task: 'Connect with VC contact at Sequoia', done: false },
          { task: 'Send term sheet template', done: false },
        ],
        smallTalk: {
          family: 'Lucas starting preschool in September',
          hobbies: 'Training for a half marathon in August',
        },
      },
    ],
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    company: 'DataFlow',
    avatar: '/avatars/priya.png',
    status: 'warm',
    howWeMet: 'Met at AI & Data Conference 2025, bonded over sci-fi books',
    lastContacted: '2026-04-20',
    birthday: '09-22',
    needs: 'Pre-IPO financial planning, stock option strategy',
    howHelped: 'Structured stock option exercise plan to minimize tax burden',
    plans: 'Review updated IPO timeline impact on exercise strategy',
    preferences: {
      family: ['Single', 'Parents in Mumbai — visits twice a year'],
      holidays: [{ date: '2026-08-10', destination: 'Bali, Indonesia' }],
      food: ['Vegetarian', 'Loves Thai food', 'Favorite: pad see ew'],
      hobbies: ['Yoga (daily)', 'Reads sci-fi — currently reading Project Hail Mary'],
    },
    budget: '$$',
    meetingHistory: [
      {
        id: 'mn-4',
        clientId: 'priya-sharma',
        clientName: 'Priya Sharma',
        date: '2026-04-20',
        location: 'Video call',
        topics: ['IPO timeline update', 'Stock option exercise window'],
        followUps: [
          { task: 'Model tax scenarios for early exercise', done: true },
          { task: 'Send comparison of pre-IPO secondary fund options', done: false },
        ],
        smallTalk: {
          holidays: 'Excited about Bali trip — first time visiting',
          hobbies: 'Recommended "Children of Time" — said I\'d love it',
        },
      },
    ],
  },
  {
    id: 'james-obrien',
    name: "James O'Brien",
    company: 'Meridian Capital',
    avatar: '/avatars/james.png',
    status: 'cold',
    howWeMet: 'Connected via LinkedIn — he reached out after reading my article on alternative investments',
    lastContacted: '2025-11-15',
    birthday: '02-14',
    needs: 'Alternative investment allocation, hedge fund access',
    howHelped: 'Provided analysis of three hedge fund options, helped with due diligence',
    plans: 'Re-engage — check if still interested in alternative allocation',
    preferences: {
      family: ['Married to Catherine (corporate lawyer)', 'No kids'],
      holidays: [],
      food: ['Seafood', 'Single malt whisky — Lagavulin fan'],
      hobbies: ['Sailing — races on weekends', 'Chess — plays in tournaments'],
    },
    budget: '$$$',
    meetingHistory: [
      {
        id: 'mn-5',
        clientId: 'james-obrien',
        clientName: "James O'Brien",
        date: '2025-11-15',
        location: 'Dinner at Jaan, Swissôtel',
        topics: ['Hedge fund performance review', 'Market outlook 2026'],
        followUps: [
          { task: 'Send updated hedge fund performance data', done: true },
          { task: 'Follow up in January about allocation decision', done: false },
        ],
        smallTalk: {
          hobbies: 'Won a regional sailing regatta — very proud',
          food: 'Recommended a whisky bar in Tokyo',
        },
      },
    ],
  },
  {
    id: 'lisa-wong',
    name: 'Lisa Wong',
    company: 'BrightPath Education',
    avatar: '/avatars/lisa.png',
    status: 'hot',
    howWeMet: 'Met at charity gala for children\'s literacy, 2025',
    lastContacted: '2026-05-05',
    birthday: '11-30',
    needs: 'Scaling education startup, managing founder equity, personal savings plan',
    howHelped: 'Set up founder-friendly cap table structure, started a personal savings plan',
    plans: 'Review seed round terms, discuss grant funding options',
    preferences: {
      family: ['Daughter Mei (age 15) — aspiring artist'],
      holidays: [],
      food: ['Sushi', 'Allergic to nuts', 'Loves trying new restaurants'],
      hobbies: ['Running — training for a marathon', 'Painting — watercolors'],
    },
    budget: '$',
    meetingHistory: [
      {
        id: 'mn-6',
        clientId: 'lisa-wong',
        clientName: 'Lisa Wong',
        date: '2026-05-05',
        location: 'Walking meeting at Botanic Gardens',
        topics: ['Seed round term sheet review', 'Grant application strategy'],
        followUps: [
          { task: 'Review term sheet redlines from lawyer', done: false },
          { task: 'Send list of education-focused grant opportunities', done: false },
        ],
        smallTalk: {
          family: 'Mei got accepted into art summer program at MICA',
          hobbies: 'Running the Singapore Marathon in December',
        },
      },
    ],
  },
];

export const todayCalendar: CalendarEvent[] = [
  { time: '9:00 AM', title: 'Pilates', location: 'ActiveSG Gym' },
  { time: '10:30 AM', title: 'Breakfast meeting — Sarah Chen', location: 'The Roastery, Orchard Rd', clientId: 'sarah-chen' },
  { time: '1:00 PM', title: 'Lunch meeting — Lisa Wong', location: 'Sushi Kou, Tanjong Pagar', clientId: 'lisa-wong' },
  { time: '3:30 PM', title: 'Coffee catch-up — Marcus Rivera', location: 'Common Man Coffee, Martin Rd', clientId: 'marcus-rivera' },
  { time: '6:00 PM', title: 'Zoom — Priya Sharma', location: 'Video call', clientId: 'priya-sharma' },
];

export const todayTodos: Todo[] = [
  { task: 'Send updated fund prospectus for AI Growth Fund', clientId: 'sarah-chen', clientName: 'Sarah Chen', suggestedTime: '8:00 AM' },
  { task: 'Connect Marcus with VC contact at Sequoia', clientId: 'marcus-rivera', clientName: 'Marcus Rivera', suggestedTime: '2:30 PM' },
  { task: 'Send comparison of pre-IPO secondary fund options', clientId: 'priya-sharma', clientName: 'Priya Sharma', suggestedTime: '5:00 PM' },
  { task: 'Review term sheet redlines for Lisa', clientId: 'lisa-wong', clientName: 'Lisa Wong', suggestedTime: '11:30 AM' },
];

export const todayNews: NewsItem[] = [
  {
    headline: 'Fed signals potential rate cut in Q3 2026',
    source: 'Reuters',
    relevantClients: ['Sarah Chen', 'Marcus Rivera'],
    shareNote: 'Sarah — impacts her bond allocation. Marcus — good news for his expansion financing.',
  },
  {
    headline: 'Singapore announces new startup grant program for EdTech',
    source: 'The Straits Times',
    relevantClients: ['Lisa Wong'],
    shareNote: 'Lisa should apply — directly relevant to BrightPath.',
  },
  {
    headline: 'AI-driven ESG scoring tools gaining institutional adoption',
    source: 'Bloomberg',
    relevantClients: ['Sarah Chen', 'Priya Sharma'],
    shareNote: 'Sarah expressed ESG interest. Priya\'s company DataFlow could build this.',
  },
  {
    headline: 'Alternative investment allocations hit record high among HNW individuals',
    source: 'Financial Times',
    relevantClients: ["James O'Brien"],
    shareNote: 'Good conversation starter to re-engage James.',
  },
];

export const birthdaysToday = clients.filter(c => c.birthday === '05-09');
export const birthdaysUpcoming = clients.filter(c => {
  const [month, day] = c.birthday.split('-').map(Number);
  const today = new Date();
  const bday = new Date(today.getFullYear(), month - 1, day);
  const diffDays = Math.ceil((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 14;
});

export const staleClients = clients.filter(c => {
  const last = new Date(c.lastContacted);
  const diffMonths = (new Date().getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return diffMonths >= 3;
});
