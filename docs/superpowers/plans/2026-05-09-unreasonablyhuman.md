# UnreasonablyHuman Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished mobile-first AI-augmented relationship management app for a 2-minute hackathon demo.

**Architecture:** Next.js 14 App Router with Tailwind CSS. All client data is mock (JSON). AI features use Claude API for text generation and OpenAI TTS for audio. No database — localStorage for persistence. Five API route handlers wrap the AI calls.

**Tech Stack:** Next.js 14, Tailwind CSS, Anthropic SDK, OpenAI API (TTS), TypeScript

**Parallelization:** Two coding agents (Claude Code + Codex). Phase 1 sequential setup, Phase 2 parallel on isolated files, Phase 3 sequential integration.

**TDD deviation:** Skipping tests entirely — this is a 4-hour hackathon demo, not production software. Speed over coverage.

---

## File Structure

```
unreasonablyhuman/
├── app/
│   ├── layout.tsx              # Root layout with bottom nav + audio bar
│   ├── page.tsx                # Daily Briefing — card scroll
│   ├── scan/
│   │   └── page.tsx            # Extract Notes page
│   ├── clients/
│   │   ├── page.tsx            # Clients list
│   │   └── [id]/
│   │       └── page.tsx        # Client wiki (P3 stretch)
│   ├── notes/
│   │   └── page.tsx            # Meeting Notes list
│   ├── api/
│   │   ├── summary/
│   │   │   └── route.ts        # AI day summary
│   │   ├── extract/
│   │   │   └── route.ts        # Meeting note extraction
│   │   ├── suggest/
│   │   │   └── route.ts        # Gift/message suggestions
│   │   ├── checkin/
│   │   │   └── route.ts        # Check-in message draft
│   │   └── audio/
│   │       └── route.ts        # TTS audio generation
│   └── globals.css             # Tailwind base + custom styles
├── components/
│   ├── BottomNav.tsx           # Fixed bottom navigation
│   ├── AudioPlayer.tsx         # Fixed audio bar with controls
│   ├── cards/
│   │   ├── GreetingCard.tsx    # Good morning card
│   │   ├── SummaryCard.tsx     # AI day summary card
│   │   ├── CalendarCard.tsx    # Calendar appointments
│   │   ├── TodosCard.tsx       # Follow-up todos
│   │   ├── BirthdaysCard.tsx   # Birthdays + AI suggestions
│   │   ├── CheckinsCard.tsx    # Check-ins + AI drafts
│   │   ├── NewsCard.tsx        # Industry news
│   │   └── ClosingCard.tsx     # Closing card
│   ├── scan/
│   │   ├── NoteInput.tsx       # Text area for raw notes
│   │   └── ExtractedForm.tsx   # Editable extracted data form
│   ├── clients/
│   │   └── ClientCard.tsx      # Client list item card
│   └── notes/
│       └── NoteEntry.tsx       # Meeting note list item
├── data/
│   └── mock.ts                 # All mock data + TypeScript interfaces
├── lib/
│   └── store.ts                # localStorage helpers for extracted notes
├── .env.local                  # API keys (not committed)
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Agent File Ownership (Phase 2)

**Claude Code (Agent A+C):** `app/page.tsx`, `components/cards/*`, `components/AudioPlayer.tsx`, `app/scan/page.tsx`, `components/scan/*`

**Codex (Agent B+D):** `app/api/*`, `app/clients/page.tsx`, `app/notes/page.tsx`, `components/clients/*`, `components/notes/*`

**Shared (from Phase 1):** `data/mock.ts`, `lib/store.ts`, `app/layout.tsx`, `components/BottomNav.tsx`, `app/globals.css`, all config files

---

## Phase 1: Project Setup (Sequential — Claude Code)

### Task 1: Scaffold Next.js project with Tailwind

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Create Next.js app**

```bash
cd /Users/daven/Code/unreasonablyhuman
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Accept overwriting existing files. This scaffolds the project with App Router and Tailwind.

- [ ] **Step 2: Install AI dependencies**

```bash
npm install @anthropic-ai/sdk openai
```

- [ ] **Step 3: Create .env.local**

Create `.env.local` with placeholder keys:

```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

User will fill in real keys.

- [ ] **Step 4: Configure Tailwind for warm theme**

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#f8f6f3',
          text: '#1a1a2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Set up globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  background-color: #f8f6f3;
  color: #1a1a2e;
}

/* Glassmorphism utility */
.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Dev server starts on localhost:3000 with no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind and AI deps"
```

---

### Task 2: Mock data and TypeScript types

**Files:**
- Create: `data/mock.ts`

- [ ] **Step 1: Create mock data file with types and data**

Create `data/mock.ts`:

```typescript
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
          { task: 'Send comparison of 83(b) election strategies', done: false },
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
  { task: 'Send comparison of 83(b) election strategies', clientId: 'priya-sharma', clientName: 'Priya Sharma', suggestedTime: '5:00 PM' },
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
```

- [ ] **Step 2: Commit**

```bash
git add data/mock.ts
git commit -m "feat: add mock data with 5 clients, calendar, todos, news"
```

---

### Task 3: localStorage helper

**Files:**
- Create: `lib/store.ts`

- [ ] **Step 1: Create localStorage store**

```typescript
import { MeetingNote } from '@/data/mock';

const STORAGE_KEY = 'unreasonablyhuman_notes';

export function getSavedNotes(): MeetingNote[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveNote(note: MeetingNote): void {
  const existing = getSavedNotes();
  existing.unshift(note);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getAllNotes(mockNotes: MeetingNote[]): MeetingNote[] {
  const saved = getSavedNotes();
  return [...saved, ...mockNotes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/store.ts
git commit -m "feat: add localStorage helper for extracted notes"
```

---

### Task 4: Root layout with bottom nav

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/BottomNav.tsx`

- [ ] **Step 1: Create BottomNav component**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Daily Brief', icon: '☀️' },
  { href: '/scan', label: 'Extract Notes', icon: '📝' },
  { href: '/clients', label: 'Clients', icon: '👥' },
  { href: '/notes', label: 'Meeting Notes', icon: '📒' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-warm-text/10">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-orange-500 font-semibold' : 'text-warm-text/50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Update root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UnreasonablyHuman',
  description: 'AI-Augmented Relationship Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-warm-bg text-warm-text`}>
        <main className="max-w-md mx-auto min-h-screen pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create placeholder pages so nav works**

Create `app/page.tsx`:
```tsx
export default function DailyBriefPage() {
  return <div className="p-4">Daily Brief — loading...</div>;
}
```

Create `app/scan/page.tsx`:
```tsx
export default function ScanPage() {
  return <div className="p-4">Extract Notes — loading...</div>;
}
```

Create `app/clients/page.tsx`:
```tsx
export default function ClientsPage() {
  return <div className="p-4">Clients — loading...</div>;
}
```

Create `app/notes/page.tsx`:
```tsx
export default function NotesPage() {
  return <div className="p-4">Meeting Notes — loading...</div>;
}
```

- [ ] **Step 4: Verify nav works in browser**

```bash
npm run dev
```

Open http://localhost:3000 — verify bottom nav shows 4 tabs and navigation between them works.

- [ ] **Step 5: Commit**

```bash
git add app/ components/BottomNav.tsx
git commit -m "feat: add root layout with bottom nav and placeholder pages"
```

---

## Phase 2A: Daily Briefing Cards + Audio (Claude Code)

### Task 5: Greeting and Closing cards

**Files:**
- Create: `components/cards/GreetingCard.tsx`, `components/cards/ClosingCard.tsx`

- [ ] **Step 1: Create GreetingCard**

```tsx
import { USER_NAME } from '@/data/mock';

export default function GreetingCard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-[70vh] rounded-2xl bg-gradient-to-br from-amber-200 via-rose-200 to-purple-200 flex flex-col items-center justify-center p-8 shadow-lg">
      <p className="text-5xl font-light leading-tight text-center text-warm-text">
        Good Morning,
      </p>
      <p className="text-5xl font-semibold mt-2 text-center text-warm-text">
        {USER_NAME}
      </p>
      <p className="mt-6 text-warm-text/60 flex items-center gap-2">
        📅 {today}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create ClosingCard**

```tsx
import { USER_NAME } from '@/data/mock';

export default function ClosingCard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-[70vh] rounded-2xl bg-gradient-to-br from-purple-200 via-rose-200 to-amber-200 flex flex-col items-center justify-center p-8 shadow-lg">
      <p className="text-4xl font-light leading-tight text-center text-warm-text">
        Have a great day,
      </p>
      <p className="text-4xl font-semibold mt-2 text-center text-warm-text">
        {USER_NAME}
      </p>
      <p className="mt-6 text-warm-text/60 flex items-center gap-2">
        📅 {today}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/cards/
git commit -m "feat: add greeting and closing cards"
```

---

### Task 6: Calendar, Todos, and News cards

**Files:**
- Create: `components/cards/CalendarCard.tsx`, `components/cards/TodosCard.tsx`, `components/cards/NewsCard.tsx`

- [ ] **Step 1: Create CalendarCard**

```tsx
import { todayCalendar } from '@/data/mock';

export default function CalendarCard() {
  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-teal-200 via-cyan-100 to-sky-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-teal-800 mb-4">📅 Calendar</h2>
      <div className="space-y-3">
        {todayCalendar.map((event, i) => (
          <div key={i} className="glass p-4">
            <p className="font-semibold text-warm-text">{event.title}</p>
            <p className="text-sm text-warm-text/70">{event.time} · {event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create TodosCard**

```tsx
import { todayTodos } from '@/data/mock';

export default function TodosCard() {
  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-indigo-800 mb-4">✅ Follow-up Todos</h2>
      <div className="space-y-3">
        {todayTodos.map((todo, i) => (
          <div key={i} className="glass p-4">
            <p className="font-semibold text-warm-text">{todo.task}</p>
            <p className="text-sm text-warm-text/70">
              {todo.clientName} {todo.suggestedTime && `· Suggested: ${todo.suggestedTime}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create NewsCard**

```tsx
import { todayNews } from '@/data/mock';

export default function NewsCard() {
  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-emerald-200 via-green-100 to-lime-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-emerald-800 mb-4">📰 Industry News</h2>
      <div className="space-y-3">
        {todayNews.map((item, i) => (
          <div key={i} className="glass p-4">
            <p className="font-semibold text-warm-text">{item.headline}</p>
            <p className="text-xs text-warm-text/50 mb-1">{item.source}</p>
            <p className="text-sm text-warm-text/70">{item.shareNote}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/cards/
git commit -m "feat: add calendar, todos, and news cards"
```

---

### Task 7: Summary, Birthdays, and Check-ins cards (AI-interactive)

**Files:**
- Create: `components/cards/SummaryCard.tsx`, `components/cards/BirthdaysCard.tsx`, `components/cards/CheckinsCard.tsx`

- [ ] **Step 1: Create SummaryCard**

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function SummaryCard() {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/summary', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setSummary(data.summary);
        setLoading(false);
      })
      .catch(() => {
        setSummary('A busy day of client meetings ahead. You have 4 appointments, a few follow-ups to knock out, and Sarah\'s birthday to celebrate!');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[50vh] rounded-2xl bg-gradient-to-br from-sky-200 via-blue-100 to-teal-200 flex flex-col items-center justify-center p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-sky-800 mb-6">🌤️ Your Day</h2>
      {loading ? (
        <div className="animate-pulse text-sky-600">Generating your summary...</div>
      ) : (
        <p className="text-lg text-center text-warm-text leading-relaxed">{summary}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create BirthdaysCard**

```tsx
'use client';

import { useState } from 'react';
import { birthdaysToday, birthdaysUpcoming, Client } from '@/data/mock';

export default function BirthdaysCard() {
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleSuggest(client: Client) {
    setLoadingId(client.id);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          preferences: client.preferences,
          budget: client.budget,
          occasion: birthdaysToday.includes(client) ? 'birthday today' : 'birthday upcoming',
        }),
      });
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [client.id]: data.suggestion }));
    } catch {
      setSuggestions(prev => ({ ...prev, [client.id]: 'Could not generate suggestion.' }));
    }
    setLoadingId(null);
  }

  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-rose-200 via-orange-100 to-amber-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-rose-800 mb-4">🎂 Birthdays</h2>
      {birthdaysToday.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-rose-700 mb-2">TODAY</p>
          {birthdaysToday.map(client => (
            <div key={client.id} className="glass p-4 mb-2">
              <p className="font-semibold text-warm-text">{client.name} 🎉</p>
              <p className="text-sm text-warm-text/70">{client.company}</p>
              {suggestions[client.id] ? (
                <p className="mt-2 text-sm text-warm-text/80 whitespace-pre-line">{suggestions[client.id]}</p>
              ) : (
                <button
                  onClick={() => handleSuggest(client)}
                  disabled={loadingId === client.id}
                  className="mt-2 px-4 py-1.5 bg-rose-500 text-white rounded-full text-sm hover:bg-rose-600 disabled:opacity-50"
                >
                  {loadingId === client.id ? 'Thinking...' : '✨ Suggest gift & message'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {birthdaysUpcoming.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-rose-700 mb-2">UPCOMING</p>
          {birthdaysUpcoming.map(client => (
            <div key={client.id} className="glass p-4 mb-2">
              <p className="font-semibold text-warm-text">{client.name}</p>
              <p className="text-sm text-warm-text/70">{client.company} · {client.birthday}</p>
              {suggestions[client.id] ? (
                <p className="mt-2 text-sm text-warm-text/80 whitespace-pre-line">{suggestions[client.id]}</p>
              ) : (
                <button
                  onClick={() => handleSuggest(client)}
                  disabled={loadingId === client.id}
                  className="mt-2 px-4 py-1.5 bg-orange-400 text-white rounded-full text-sm hover:bg-orange-500 disabled:opacity-50"
                >
                  {loadingId === client.id ? 'Thinking...' : '🎁 Plan ahead'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create CheckinsCard**

```tsx
'use client';

import { useState } from 'react';
import { staleClients, Client } from '@/data/mock';

export default function CheckinsCard() {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDraft(client: Client) {
    setLoadingId(client.id);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          company: client.company,
          lastContacted: client.lastContacted,
          preferences: client.preferences,
          meetingHistory: client.meetingHistory,
        }),
      });
      const data = await res.json();
      setDrafts(prev => ({ ...prev, [client.id]: data.message }));
    } catch {
      setDrafts(prev => ({ ...prev, [client.id]: 'Could not generate message.' }));
    }
    setLoadingId(null);
  }

  if (staleClients.length === 0) return null;

  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-amber-800 mb-4">👋 Check-ins</h2>
      <p className="text-sm text-amber-700/70 mb-4">Clients you haven&apos;t reached out to in a while</p>
      <div className="space-y-3">
        {staleClients.map(client => (
          <div key={client.id} className="glass p-4">
            <p className="font-semibold text-warm-text">{client.name}</p>
            <p className="text-sm text-warm-text/70">
              {client.company} · Last contact: {new Date(client.lastContacted).toLocaleDateString()}
            </p>
            {drafts[client.id] ? (
              <p className="mt-2 text-sm text-warm-text/80 whitespace-pre-line">{drafts[client.id]}</p>
            ) : (
              <button
                onClick={() => handleDraft(client)}
                disabled={loadingId === client.id}
                className="mt-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm hover:bg-amber-600 disabled:opacity-50"
              >
                {loadingId === client.id ? 'Drafting...' : '💬 Draft re-engagement message'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/cards/
git commit -m "feat: add summary, birthdays, and check-ins cards with AI interactions"
```

---

### Task 8: Assemble Daily Briefing page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Wire up all cards in the briefing page**

Replace `app/page.tsx`:

```tsx
import GreetingCard from '@/components/cards/GreetingCard';
import SummaryCard from '@/components/cards/SummaryCard';
import CalendarCard from '@/components/cards/CalendarCard';
import TodosCard from '@/components/cards/TodosCard';
import BirthdaysCard from '@/components/cards/BirthdaysCard';
import CheckinsCard from '@/components/cards/CheckinsCard';
import NewsCard from '@/components/cards/NewsCard';
import ClosingCard from '@/components/cards/ClosingCard';

export default function DailyBriefPage() {
  return (
    <div className="space-y-4 p-4">
      <GreetingCard />
      <SummaryCard />
      <CalendarCard />
      <TodosCard />
      <BirthdaysCard />
      <CheckinsCard />
      <NewsCard />
      <ClosingCard />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:3000 — all 8 cards should render in a scrollable stack with warm gradients. AI-powered cards (Summary, Birthdays, Check-ins) will show loading/fallback states until API routes exist.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble daily briefing page with all 8 cards"
```

---

### Task 9: Audio player with TTS

**Files:**
- Create: `components/AudioPlayer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create AudioPlayer component**

```tsx
'use client';

import { useState, useRef } from 'react';

export default function AudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  async function generateAudio() {
    setLoading(true);
    try {
      const res = await fetch('/api/audio', { method: 'POST' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = speed;

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });
      audio.addEventListener('ended', () => {
        setPlaying(false);
        setProgress(0);
      });

      await audio.play();
      setPlaying(true);
    } catch (err) {
      console.error('Audio generation failed:', err);
    }
    setLoading(false);
  }

  async function togglePlay() {
    if (!audioRef.current && !audioUrlRef.current) {
      await generateAudio();
      return;
    }

    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        await audioRef.current.play();
        setPlaying(true);
      }
    }
  }

  function cycleSpeed() {
    const speeds = [1, 1.25, 1.5];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40">
      <div className="max-w-md mx-auto">
        <div className="mx-4 bg-gradient-to-r from-amber-400 via-orange-300 to-rose-300 rounded-2xl p-3 shadow-lg">
          <div className="h-1 bg-white/30 rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={cycleSpeed}
              className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold text-white"
            >
              {speed}x
            </button>
            <button
              onClick={togglePlay}
              disabled={loading}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              {loading ? (
                <span className="animate-spin text-orange-500">⏳</span>
              ) : playing ? (
                <span className="text-orange-500 text-xl">⏸</span>
              ) : (
                <span className="text-orange-500 text-xl ml-0.5">▶️</span>
              )}
            </button>
            <div className="px-3 py-1 text-sm text-white/80">
              {loading ? 'Generating...' : playing ? '🔊 Playing' : '🎧 Listen'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add AudioPlayer to layout**

In `app/layout.tsx`, add the AudioPlayer above BottomNav:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import AudioPlayer from '@/components/AudioPlayer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UnreasonablyHuman',
  description: 'AI-Augmented Relationship Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-warm-bg text-warm-text`}>
        <main className="max-w-md mx-auto min-h-screen pb-36">
          {children}
        </main>
        <AudioPlayer />
        <BottomNav />
      </body>
    </html>
  );
}
```

Note: `pb-36` increased from `pb-20` to make room for both audio bar and bottom nav.

- [ ] **Step 3: Commit**

```bash
git add components/AudioPlayer.tsx app/layout.tsx
git commit -m "feat: add audio player with TTS playback controls"
```

---

### Task 10: Extract Notes page

**Files:**
- Modify: `app/scan/page.tsx`
- Create: `components/scan/NoteInput.tsx`, `components/scan/ExtractedForm.tsx`

- [ ] **Step 1: Create NoteInput component**

```tsx
'use client';

interface NoteInputProps {
  value: string;
  onChange: (v: string) => void;
  onExtract: () => void;
  loading: boolean;
}

export default function NoteInput({ value, onChange, onExtract, loading }: NoteInputProps) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste or type your meeting notes here...

Example:
Met with Sarah Chen at The Roastery for coffee. Discussed Q3 portfolio — she wants to increase allocation to AI stocks. Mentioned her daughter won a science fair. She's finalizing Osaka trip plans for July, asked about restaurant recs. Need to send her the updated fund prospectus by Friday. Also wants to schedule a call with the estate planner."
        className="w-full h-64 p-4 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none resize-none text-sm"
      />
      <button
        onClick={onExtract}
        disabled={loading || !value.trim()}
        className="mt-4 w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? '✨ Extracting with AI...' : '✨ Extract with AI'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create ExtractedForm component**

```tsx
'use client';

import { MeetingNote } from '@/data/mock';

interface ExtractedFormProps {
  data: MeetingNote;
  onChange: (data: MeetingNote) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function ExtractedForm({ data, onChange, onSave, onReset }: ExtractedFormProps) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
        ✅ Notes extracted! Review and edit below, then save.
      </div>

      <div>
        <label className="text-sm font-semibold text-warm-text/70">Client</label>
        <input
          value={data.clientName}
          onChange={(e) => onChange({ ...data, clientName: e.target.value })}
          className="w-full mt-1 p-3 rounded-lg border border-orange-200 bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-warm-text/70">Date</label>
          <input
            value={data.date}
            onChange={(e) => onChange({ ...data, date: e.target.value })}
            className="w-full mt-1 p-3 rounded-lg border border-orange-200 bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-warm-text/70">Location</label>
          <input
            value={data.location}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
            className="w-full mt-1 p-3 rounded-lg border border-orange-200 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-warm-text/70">Topics Discussed</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {data.topics.map((topic, i) => (
            <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-warm-text/70">Follow-ups</label>
        <div className="space-y-2 mt-1">
          {data.followUps.map((fu, i) => (
            <div key={i} className="flex items-center gap-2 glass p-3">
              <input type="checkbox" checked={fu.done} onChange={() => {
                const updated = [...data.followUps];
                updated[i] = { ...fu, done: !fu.done };
                onChange({ ...data, followUps: updated });
              }} />
              <span className="text-sm">{fu.task}</span>
            </div>
          ))}
        </div>
      </div>

      {data.smallTalk && (
        <div>
          <label className="text-sm font-semibold text-warm-text/70">Personal Notes</label>
          <div className="space-y-2 mt-1">
            {data.smallTalk.family && (
              <div className="glass p-3">
                <span className="text-xs font-semibold text-rose-600">FAMILY</span>
                <p className="text-sm">{data.smallTalk.family}</p>
              </div>
            )}
            {data.smallTalk.holidays && (
              <div className="glass p-3">
                <span className="text-xs font-semibold text-blue-600">HOLIDAYS</span>
                <p className="text-sm">{data.smallTalk.holidays}</p>
              </div>
            )}
            {data.smallTalk.food && (
              <div className="glass p-3">
                <span className="text-xs font-semibold text-amber-600">FOOD</span>
                <p className="text-sm">{data.smallTalk.food}</p>
              </div>
            )}
            {data.smallTalk.hobbies && (
              <div className="glass p-3">
                <span className="text-xs font-semibold text-green-600">HOBBIES</span>
                <p className="text-sm">{data.smallTalk.hobbies}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex-1 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-semibold hover:opacity-90"
        >
          💾 Save to Client
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-200 text-warm-text rounded-xl font-semibold hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire up the scan page**

Replace `app/scan/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { MeetingNote } from '@/data/mock';
import { saveNote } from '@/lib/store';
import NoteInput from '@/components/scan/NoteInput';
import ExtractedForm from '@/components/scan/ExtractedForm';

export default function ScanPage() {
  const [rawNotes, setRawNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<MeetingNote | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleExtract() {
    setLoading(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: rawNotes }),
      });
      const data = await res.json();
      setExtracted(data.extracted);
    } catch {
      alert('Extraction failed. Please try again.');
    }
    setLoading(false);
  }

  function handleSave() {
    if (extracted) {
      saveNote(extracted);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  function handleReset() {
    setRawNotes('');
    setExtracted(null);
    setSaved(false);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📝 Extract Meeting Notes</h1>
      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
          ✅ Saved! Note added to Meeting Notes.
        </div>
      )}
      {!extracted ? (
        <NoteInput
          value={rawNotes}
          onChange={setRawNotes}
          onExtract={handleExtract}
          loading={loading}
        />
      ) : (
        <ExtractedForm
          data={extracted}
          onChange={setExtracted}
          onSave={handleSave}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/scan/ components/scan/
git commit -m "feat: add extract notes page with AI extraction and editable form"
```

---

## Phase 2B: API Routes + Secondary Pages (Codex)

> **This entire phase is given to Codex as a self-contained prompt. See the Codex Handoff section at the end of this plan.**

### Task 11: API route — /api/summary

**Files:**
- Create: `app/api/summary/route.ts`

- [ ] **Step 1: Create summary route**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { todayCalendar, todayTodos, birthdaysToday, birthdaysUpcoming, staleClients } from '@/data/mock';

const client = new Anthropic();

export async function POST() {
  const todayData = {
    calendar: todayCalendar,
    todos: todayTodos,
    birthdaysToday: birthdaysToday.map(c => c.name),
    birthdaysUpcoming: birthdaysUpcoming.map(c => ({ name: c.name, date: c.birthday })),
    staleClients: staleClients.map(c => ({ name: c.name, lastContacted: c.lastContacted })),
  };

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: 'You are a warm, friendly AI assistant for a relationship manager. Generate a 2-3 sentence morning summary of their day. Be conversational, warm, and highlight the most important things. Do not use bullet points — write flowing prose.',
    messages: [
      {
        role: 'user',
        content: `Here's my day:\n${JSON.stringify(todayData, null, 2)}`,
      },
    ],
  });

  const summary = message.content[0].type === 'text' ? message.content[0].text : '';

  return Response.json({ summary });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/summary/
git commit -m "feat: add AI day summary API route"
```

---

### Task 12: API route — /api/extract

**Files:**
- Create: `app/api/extract/route.ts`

- [ ] **Step 1: Create extract route**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { clients } from '@/data/mock';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { notes } = await request.json();

  const knownClients = clients.map(c => c.name);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `You are an AI that extracts structured meeting note data from raw text. Known clients: ${knownClients.join(', ')}.

Return ONLY valid JSON matching this exact schema:
{
  "id": "mn-<random 4 chars>",
  "clientId": "<kebab-case client name or 'unknown'>",
  "clientName": "<detected client name>",
  "date": "<YYYY-MM-DD, today if not specified>",
  "location": "<meeting location or 'Not specified'>",
  "topics": ["<topic1>", "<topic2>"],
  "followUps": [{"task": "<action item>", "done": false}],
  "smallTalk": {
    "family": "<family details mentioned or null>",
    "holidays": "<holiday/travel plans mentioned or null>",
    "food": "<food preferences mentioned or null>",
    "hobbies": "<hobby details mentioned or null>"
  }
}`,
    messages: [
      {
        role: 'user',
        content: `Extract structured data from these meeting notes:\n\n${notes}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return Response.json({ extracted });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/extract/
git commit -m "feat: add meeting note extraction API route"
```

---

### Task 13: API route — /api/suggest

**Files:**
- Create: `app/api/suggest/route.ts`

- [ ] **Step 1: Create suggest route**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { clientName, preferences, budget, occasion } = await request.json();

  const budgetGuide: Record<string, string> = {
    '$': 'under $30',
    '$$': '$30-100',
    '$$$': '$100-300',
  };

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: 'You are a warm, thoughtful AI that suggests personalized gifts and birthday messages. Be specific based on the person\'s interests. Keep it concise: 2-3 gift ideas as a short list, then a brief personalized message draft.',
    messages: [
      {
        role: 'user',
        content: `Suggest gifts and a birthday message for ${clientName}.
Occasion: ${occasion}
Budget: ${budgetGuide[budget] || '$50-100'}
Their interests: ${JSON.stringify(preferences)}`,
      },
    ],
  });

  const suggestion = message.content[0].type === 'text' ? message.content[0].text : '';

  return Response.json({ suggestion });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/suggest/
git commit -m "feat: add gift/message suggestion API route"
```

---

### Task 14: API route — /api/checkin

**Files:**
- Create: `app/api/checkin/route.ts`

- [ ] **Step 1: Create checkin route**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { clientName, company, lastContacted, preferences, meetingHistory } = await request.json();

  const lastMeeting = meetingHistory?.[0];

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: 'You are a warm AI that drafts re-engagement messages for a relationship manager. The message should feel natural and personal — reference shared history or interests. Keep it to 3-4 sentences. Write the message ready to send (not a template).',
    messages: [
      {
        role: 'user',
        content: `Draft a check-in message for ${clientName} (${company}).
Last contact: ${lastContacted}
Their interests: ${JSON.stringify(preferences)}
Last meeting topics: ${lastMeeting ? lastMeeting.topics.join(', ') : 'unknown'}
Last meeting small talk: ${lastMeeting ? JSON.stringify(lastMeeting.smallTalk) : 'unknown'}`,
      },
    ],
  });

  const msg = message.content[0].type === 'text' ? message.content[0].text : '';

  return Response.json({ message: msg });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/checkin/
git commit -m "feat: add check-in message draft API route"
```

---

### Task 15: API route — /api/audio

**Files:**
- Create: `app/api/audio/route.ts`

- [ ] **Step 1: Create audio route**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { USER_NAME, todayCalendar, todayTodos, birthdaysToday, birthdaysUpcoming, staleClients, todayNews } from '@/data/mock';

const anthropic = new Anthropic();
const openai = new OpenAI();

export async function POST() {
  const briefData = {
    userName: USER_NAME,
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    calendar: todayCalendar.map(e => `${e.time}: ${e.title} at ${e.location}`),
    todos: todayTodos.map(t => `${t.task} (for ${t.clientName})`),
    birthdaysToday: birthdaysToday.map(c => c.name),
    birthdaysUpcoming: birthdaysUpcoming.map(c => ({ name: c.name, date: c.birthday })),
    staleClients: staleClients.map(c => ({ name: c.name, company: c.company })),
    news: todayNews.map(n => `${n.headline} — ${n.shareNote}`),
  };

  const scriptMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: `You are a warm, friendly narrator for a daily briefing audio. Write a conversational script that covers: greeting, day summary, calendar, todos, birthdays, check-ins, and news. Speak naturally as if talking to a friend over coffee. Use the person's name. Keep it under 90 seconds of speech (~200 words). Do NOT include any stage directions, headers, or formatting — just the spoken words.`,
    messages: [
      {
        role: 'user',
        content: `Generate the daily brief narration script:\n${JSON.stringify(briefData, null, 2)}`,
      },
    ],
  });

  const script = scriptMessage.content[0].type === 'text' ? scriptMessage.content[0].text : '';

  const audioResponse = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: script,
  });

  const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/audio/
git commit -m "feat: add TTS audio generation API route"
```

---

### Task 16: Clients list page

**Files:**
- Modify: `app/clients/page.tsx`
- Create: `components/clients/ClientCard.tsx`

- [ ] **Step 1: Create ClientCard component**

```tsx
import Link from 'next/link';
import { Client } from '@/data/mock';

const statusColors = {
  cold: 'bg-red-100 text-red-700',
  warm: 'bg-yellow-100 text-yellow-700',
  hot: 'bg-green-100 text-green-700',
};

export default function ClientCard({ client }: { client: Client }) {
  return (
    <Link href={`/clients/${client.id}`}>
      <div className="glass p-4 hover:bg-white/30 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-rose-200 flex items-center justify-center text-lg font-semibold text-warm-text">
            {client.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-warm-text">{client.name}</p>
            <p className="text-sm text-warm-text/60">{client.company}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[client.status]}`}>
            {client.status}
          </span>
        </div>
        <p className="text-xs text-warm-text/50 mt-2">
          Last contact: {new Date(client.lastContacted).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create Clients list page**

Replace `app/clients/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { clients } from '@/data/mock';
import ClientCard from '@/components/clients/ClientCard';

export default function ClientsPage() {
  const [search, setSearch] = useState('');

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">👥 Clients</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search clients..."
        className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none mb-4"
      />
      <div className="space-y-3">
        {filtered.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/clients/page.tsx components/clients/
git commit -m "feat: add clients list page with search"
```

---

### Task 17: Meeting Notes page

**Files:**
- Modify: `app/notes/page.tsx`
- Create: `components/notes/NoteEntry.tsx`

- [ ] **Step 1: Create NoteEntry component**

```tsx
'use client';

import { useState } from 'react';
import { MeetingNote } from '@/data/mock';

export default function NoteEntry({ note }: { note: MeetingNote }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass p-4 cursor-pointer hover:bg-white/30 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-warm-text">{note.clientName}</p>
          <p className="text-sm text-warm-text/60">
            {new Date(note.date).toLocaleDateString()} · {note.location}
          </p>
        </div>
        <span className="text-xs text-warm-text/50">
          {note.followUps.length} action items
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {note.topics.map((topic, i) => (
          <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
            {topic}
          </span>
        ))}
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-warm-text/10 space-y-2">
          <div>
            <p className="text-xs font-semibold text-warm-text/70">FOLLOW-UPS</p>
            {note.followUps.map((fu, i) => (
              <p key={i} className="text-sm flex items-center gap-1">
                <span>{fu.done ? '✅' : '⬜'}</span> {fu.task}
              </p>
            ))}
          </div>
          {note.smallTalk && Object.values(note.smallTalk).some(Boolean) && (
            <div>
              <p className="text-xs font-semibold text-warm-text/70">PERSONAL NOTES</p>
              {note.smallTalk.family && <p className="text-sm">👨‍👩‍👧‍👦 {note.smallTalk.family}</p>}
              {note.smallTalk.holidays && <p className="text-sm">✈️ {note.smallTalk.holidays}</p>}
              {note.smallTalk.food && <p className="text-sm">🍽️ {note.smallTalk.food}</p>}
              {note.smallTalk.hobbies && <p className="text-sm">🎯 {note.smallTalk.hobbies}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Meeting Notes page**

Replace `app/notes/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { clients } from '@/data/mock';
import { getAllNotes } from '@/lib/store';
import NoteEntry from '@/components/notes/NoteEntry';

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [allNotes, setAllNotes] = useState(getAllNotes(clients.flatMap(c => c.meetingHistory)));

  useEffect(() => {
    setAllNotes(getAllNotes(clients.flatMap(c => c.meetingHistory)));
  }, []);

  const filtered = allNotes.filter(note =>
    note.clientName.toLowerCase().includes(search.toLowerCase()) ||
    note.topics.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    note.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📒 Meeting Notes</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by client, topic, or location..."
        className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none mb-4"
      />
      <div className="space-y-3">
        {filtered.map(note => (
          <NoteEntry key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/notes/ components/notes/
git commit -m "feat: add meeting notes page with search and expand"
```

---

## Phase 3: Integration & Polish (Claude Code)

### Task 18: Verify all AI features end-to-end

- [ ] **Step 1: Set API keys in .env.local**

Verify `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` are set in `.env.local`.

- [ ] **Step 2: Test day summary**

Open http://localhost:3000 — the Summary card should show an AI-generated summary after a few seconds.

- [ ] **Step 3: Test audio playback**

Tap the play button on the audio bar. It should generate audio and play a narration of the daily brief.

- [ ] **Step 4: Test note extraction**

Go to Extract Notes tab, paste sample meeting notes, click Extract. Verify structured form appears. Click Save.

- [ ] **Step 5: Test birthday suggestions**

On Daily Brief, scroll to Birthdays card, tap "Suggest gift & message" for Sarah Chen. Verify personalized suggestions appear.

- [ ] **Step 6: Test check-in drafts**

On Daily Brief, scroll to Check-ins card, tap "Draft re-engagement message" for James O'Brien. Verify a personalized message appears.

- [ ] **Step 7: Test saved notes appear**

Go to Meeting Notes tab. Verify the note saved in Step 4 appears alongside mock notes.

---

### Task 19: Visual polish pass

- [ ] **Step 1: Review all cards in mobile viewport**

Open Chrome DevTools, set to iPhone 14 Pro (390px). Scroll through all cards and verify:
- Gradients look warm and distinct
- Glass effects render properly
- Text is readable
- No horizontal overflow
- Bottom nav + audio bar don't overlap content

- [ ] **Step 2: Fix any visual issues found**

Address layout problems, spacing, or color adjustments.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: visual polish and integration verification"
```

---

## Codex Handoff Prompt

Copy-paste this entire block into Codex when Phase 1 is complete:

---

```
You are building part of a hackathon project called "UnreasonablyHuman" — an AI-augmented relationship management app. The project is a Next.js 14 App Router app with Tailwind CSS, already scaffolded.

Your job is to create the 5 API route handlers and 2 secondary pages. Another agent is handling the card UI and extract notes page — DO NOT touch any files outside your scope.

## YOUR FILES ONLY — do not create or modify anything else:

### API Routes:
- app/api/summary/route.ts
- app/api/extract/route.ts
- app/api/suggest/route.ts
- app/api/checkin/route.ts
- app/api/audio/route.ts

### Secondary Pages:
- app/clients/page.tsx (replace the placeholder)
- app/notes/page.tsx (replace the placeholder)
- components/clients/ClientCard.tsx
- components/notes/NoteEntry.tsx

## Dependencies already installed:
- @anthropic-ai/sdk
- openai

## Shared types and data — import from these (DO NOT modify):
- `@/data/mock` — exports: Client, MeetingNote, CalendarEvent, Todo, NewsItem, USER_NAME, clients, todayCalendar, todayTodos, todayNews, birthdaysToday, birthdaysUpcoming, staleClients
- `@/lib/store` — exports: getSavedNotes(), saveNote(note), getAllNotes(mockNotes)

## API keys are in .env.local:
- ANTHROPIC_API_KEY
- OPENAI_API_KEY

## Visual Design:
- Warm, bright, optimistic theme. Light background (#f8f6f3).
- Cards use class "glass" for frosted effect (already defined in globals.css).
- Orange/rose/amber accent colors. Dark text (#1a1a2e).
- CSS class for glassmorphism: "glass"

## Task Details:

### 1. app/api/summary/route.ts
POST handler. Uses Anthropic SDK. Imports todayCalendar, todayTodos, birthdaysToday, birthdaysUpcoming, staleClients from @/data/mock. Sends the data to Claude (claude-sonnet-4-20250514) with a system prompt asking for a 2-3 sentence warm morning summary. Returns { summary: string }.

### 2. app/api/extract/route.ts
POST handler. Receives { notes: string } in body. Uses Anthropic SDK. Sends raw notes to Claude with a system prompt that lists known client names (from clients array) and defines the MeetingNote JSON schema. Claude returns structured JSON. Parse the JSON from Claude's response. Returns { extracted: MeetingNote }.

### 3. app/api/suggest/route.ts
POST handler. Receives { clientName, preferences, budget, occasion } in body. Uses Anthropic SDK. Budget mapping: '$' = 'under $30', '$$' = '$30-100', '$$$' = '$100-300'. Asks Claude for 2-3 personalized gift ideas + a birthday message draft. Returns { suggestion: string }.

### 4. app/api/checkin/route.ts
POST handler. Receives { clientName, company, lastContacted, preferences, meetingHistory } in body. Uses Anthropic SDK. Asks Claude to draft a warm 3-4 sentence re-engagement message referencing shared history. Returns { message: string }.

### 5. app/api/audio/route.ts
POST handler. Two-step:
1. Uses Anthropic SDK to generate a narration script (~200 words) from all daily brief data (USER_NAME, todayCalendar, todayTodos, birthdaysToday, birthdaysUpcoming, staleClients, todayNews). System prompt: "warm friendly narrator, conversational, like talking to a friend over coffee, no headers or formatting, just spoken words."
2. Sends the script to OpenAI TTS: openai.audio.speech.create({ model: 'tts-1', voice: 'nova', input: script }). Returns the MP3 audio as a Response with Content-Type: audio/mpeg.

### 6. app/clients/page.tsx + components/clients/ClientCard.tsx
Client list page. Search bar at top. Lists all clients from mock data. Each ClientCard shows: initials avatar (gradient circle), name, company, status badge (cold=red, warm=yellow, hot=green), last contacted date. Links to /clients/[id] (page doesn't exist yet, that's fine). Use 'use client' directive.

### 7. app/notes/page.tsx + components/notes/NoteEntry.tsx
Meeting notes page. Search bar. Shows all notes (from getAllNotes(clients.flatMap(c => c.meetingHistory))). Each NoteEntry: client name, date, location, topic tags, follow-up count. Click to expand: shows follow-ups with checkboxes, personal notes (family/holidays/food/hobbies with emoji prefixes). Use 'use client' directive.

## Commit after each file group:
1. All 5 API routes together
2. Clients page + ClientCard
3. Notes page + NoteEntry
```

---
