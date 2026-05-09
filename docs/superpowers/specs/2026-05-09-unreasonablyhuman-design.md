# UnreasonablyHuman — AI-Augmented Relationship Management

**Date:** 2026-05-09
**Context:** Hackathon MVP — 4 hours build time, 2-minute demo
**Stack:** Next.js 14 (App Router) + Tailwind CSS + Claude API + OpenAI TTS

## Philosophy

AI handles the machine-optimal tasks (remembering, scheduling, extracting, researching) so humans can focus on being empathetic and having deep conversations.

## Demo Scope

A polished mobile-first web app demonstrating four AI-powered features against realistic mock data. No real calendar/email integrations — mock data simulates a fully integrated system.

### AI Features (Live in Demo)

1. **AI Day Summary** — Claude generates a conversational summary of the user's day from calendar + todos + client data
2. **AI Audio Daily Brief** — Claude generates a narration script from all card data → OpenAI TTS (`tts-1`, voice: "nova" or "shimmer") converts to audio → real playback with controls
3. **Meeting Note Extraction** — User pastes raw meeting notes → Claude extracts structured data (client, date, location, topics, follow-ups, small talk details) → editable form → save to client wiki
4. **AI Suggestions** — On-tap interactions:
   - Birthday card → Claude suggests personalized gift/message based on client preferences + budget tier
   - Check-in card → Claude drafts a re-engagement message based on client history

### What's Mocked

- Calendar appointments (hardcoded for today)
- Client database (5-6 rich client profiles in a JSON file)
- Follow-up todos
- Industry news headlines
- Gmail/calendar integration (not built)

---

## Pages & Navigation

### Bottom Nav (fixed, 4 tabs)

| Tab | Icon | Route |
|-----|------|-------|
| Daily Brief | sun/calendar | `/` |
| Extract Notes | document-scan | `/scan` |
| Clients | people | `/clients` |
| Meeting Notes | notebook | `/notes` |

### Page 1: Daily Briefing (`/`)

The landing page. A vertical scroll of full-viewport cards. Each card has a distinct warm gradient background.

**Cards in order:**

| # | Card | Content | AI? |
|---|------|---------|-----|
| 1 | Good Morning | "Good Morning, [Name]" + date | No |
| 2 | Day Summary | AI-generated 2-3 sentence overview | Yes — Claude |
| 3 | Calendar | Today's appointments: time, title, location | No — mock |
| 4 | Follow-up Todos | Action items from past meetings + suggested free time slots | No — mock |
| 5 | Birthdays | Today's + upcoming. Tap → AI gift/message suggestion | Yes — on tap |
| 6 | Check-ins | Stale clients. Tap → AI drafts re-engagement message | Yes — on tap |
| 7 | Industry News | Relevant headlines + which clients to share with | No — mock |
| 8 | Closing | "Have a great day, [Name]" | No |

**Audio bar (fixed, above bottom nav):**
- Play/pause button
- Speed toggle (1x / 1.25x / 1.5x)
- Progress indicator
- Real audio playback via OpenAI TTS-generated MP3
- Audio is generated on first play tap: Claude writes narration script → OpenAI TTS → audio blob → HTML5 audio player (cached after first generation)
- Animated waveform icon on the currently-narrated card

### Page 2: Extract Notes (`/scan`)

- Header: "Extract Meeting Notes"
- Large text area: "Paste or type your meeting notes here..."
- "Extract with AI" button
- On click: Claude API call with system prompt defining extraction schema
- Returns structured data displayed as an editable form:
  - Client (auto-detected, dropdown to correct)
  - Date (auto-detected)
  - Location
  - Topics Discussed (tags)
  - Follow-ups / Todos (checklist)
  - Client Small Talk:
    - Family details
    - Holiday plans
    - Food preferences
    - Hobbies
- "Save" button → stores in localStorage → appears in client wiki Meeting History + Meeting Notes page

### Page 3: Clients List (`/clients`)

- Search bar at top
- List of client cards, each showing:
  - Avatar, name, company
  - Status badge: Cold (red) / Warm (yellow) / Hot (green)
  - Last contacted date
- Tap → opens client wiki

### Page 4: Client Wiki (`/clients/[id]`)

**Header:**
- Client photo (placeholder avatar), name, company
- Status badge: Cold / Warm / Hot
- "How we met" text

**Sections (stacked):**

1. **Needs** — what the client needs from you
2. **How You've Helped** — past value delivered
3. **Plans** — how you're planning to help going forward
4. **Preferences & Interests**
   - Family (e.g. 2 daughters, husband an engineer)
   - Holidays (chronological: Jul 2026 — Osaka, Dec 2026 — Aspen)
   - Food (e.g. loves tiramisu, allergic to shellfish)
   - Hobbies (e.g. pilates, photography)
5. **Budget** — clickable tier: $ / $$ / $$$ (your default spend level for this client)
6. **Meeting History** — table: date, location, topic summary, follow-ups. Tap to expand full notes.

### Page 5: Meeting Notes (`/notes`)

- Search bar (filter by client, topic, keyword)
- Chronological list (newest first), each entry:
  - Date + client name (tappable → client wiki)
  - Location
  - Topics as tags
  - Follow-ups count
- Tap to expand full details

---

## Visual Design

**Overall feel:** Bright, warm, optimistic morning energy.

- **Background:** Light/white (#f8f6f3 or warm off-white)
- **Cards:** Full-width, rounded corners (16px), each with a distinct warm gradient:
  - Greeting/Closing: sunrise peach-pink-lavender
  - Day Summary: soft sky blue to light teal
  - Calendar: warm teal to cyan
  - Todos: soft blue to lavender
  - Birthdays: warm coral to peach
  - Check-ins: amber to warm gold
  - Industry News: sage green to soft olive
- **Card sub-items:** Light frosted glassmorphism (white/20% opacity backdrop blur)
- **Text:** Dark (#1a1a2e) on cards, large readable fonts
- **Fonts:** System font stack or Inter
- **Bottom nav:** White/light with warm accent color for active tab
- **Audio bar:** Warm gradient strip, white controls
- **Mobile-first:** Designed for 390px width, responsive up to desktop

---

## Data Architecture

### Mock Data File (`data/mock.ts`)

Single file exporting all mock data:

```typescript
interface Client {
  id: string;
  name: string;
  company: string;
  avatar: string;
  status: 'cold' | 'warm' | 'hot';
  howWeMet: string;
  lastContacted: string;
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

interface MeetingNote {
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

interface CalendarEvent {
  time: string;
  title: string;
  location: string;
  clientId?: string;
}

interface Todo {
  task: string;
  clientId: string;
  clientName: string;
  suggestedTime?: string;
}

interface NewsItem {
  headline: string;
  source: string;
  relevantClients: string[];
  shareNote: string;
}
```

### State Management

- Mock data loaded from `data/mock.ts`
- Extracted notes stored in React state + localStorage for persistence across page navigations
- No backend/database — all client-side

---

## AI Integration

### Claude API Calls

All calls use Anthropic SDK (`@anthropic-ai/sdk`), model: `claude-sonnet-4-20250514`.

**1. Day Summary Generation**
- Trigger: Page load of daily briefing
- Input: Today's calendar, todos, birthdays, check-ins
- Output: 2-3 sentence conversational summary
- Prompt: System prompt with user context + today's data as JSON

**2. Meeting Note Extraction**
- Trigger: User clicks "Extract with AI"
- Input: Raw meeting notes text
- Output: Structured JSON matching MeetingNote schema
- Prompt: System prompt defining the extraction schema + list of known client names for matching

**3. Gift/Message Suggestion**
- Trigger: User taps birthday card
- Input: Client preferences, budget tier, occasion
- Output: 2-3 gift ideas + a personalized message draft
- Prompt: System prompt with client data + budget constraint

**4. Check-in Message Draft**
- Trigger: User taps check-in card
- Input: Client history, last interaction, shared interests
- Output: Warm, personalized re-engagement message
- Prompt: System prompt with relationship context

### OpenAI TTS

- API: `POST https://api.openai.com/v1/audio/speech`
- Model: `tts-1`
- Voice: `nova` (warm, friendly)
- Flow:
  1. Claude generates a narration script from all daily brief card content (conversational, warm tone, ~90 seconds of speech)
  2. Script sent to OpenAI TTS → returns MP3 audio blob
  3. Audio blob played via HTML5 `<audio>` element with custom controls
- Speed adjustment via `playbackRate` on the audio element

---

## API Routes (Next.js Route Handlers)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/summary` | POST | Generate AI day summary |
| `/api/extract` | POST | Extract structured data from meeting notes |
| `/api/suggest` | POST | Generate gift/message suggestions |
| `/api/checkin` | POST | Draft check-in message |
| `/api/audio` | POST | Generate TTS audio (Claude script → OpenAI TTS) |

All routes are thin wrappers: receive input, call Claude/OpenAI, return response. API keys stored in `.env.local`.

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

---

## Time Budget

### Priority Order (build in this order, stop when time runs out)

| Priority | Component | Estimated Time |
|----------|-----------|---------------|
| P0 | Project setup (Next.js, Tailwind, mock data) | 20 min |
| P0 | Daily Briefing card UI (8 cards, warm design) | 60 min |
| P0 | AI Day Summary generation (Claude API) | 15 min |
| P0 | Audio Daily Brief (Claude script + OpenAI TTS + player) | 40 min |
| P1 | Extract Notes page (Claude API + form) | 30 min |
| P1 | AI gift/message suggestions (birthday card tap) | 15 min |
| P1 | AI check-in message drafts (check-in card tap) | 15 min |
| P2 | Clients list page | 15 min |
| P2 | Meeting Notes page | 15 min |
| P3 | Client wiki page | 30 min |
| P3 | Polish, testing, deploy to Vercel | 30 min |
| **Total** | | **~4.5 hours** |

### Parallelization Strategy

Phase 1 (sequential — one agent): Project setup, Tailwind config, mock data file, TypeScript types, layout with bottom nav. This creates the shared foundation.

Phase 2 (parallel — multiple agents on git worktrees):

| Agent | Scope | Files Touched |
|-------|-------|---------------|
| Agent A: Card UI | All 8 briefing cards + audio player bar | `app/page.tsx`, `components/cards/*`, `components/AudioPlayer.tsx` |
| Agent B: API Routes | All 5 API route handlers (summary, extract, suggest, checkin, audio) | `app/api/*` |
| Agent C: Extract Notes | The `/scan` page — form, AI call, editable result | `app/scan/page.tsx`, `components/scan/*` |
| Agent D: Secondary Pages | Clients list + Meeting Notes pages | `app/clients/page.tsx`, `app/notes/page.tsx`, `components/clients/*`, `components/notes/*` |

Phase 3 (sequential — one agent): Integration, wiring card taps to API routes, polish, deploy.

Each agent works on isolated files so there are no merge conflicts. All agents share the same mock data types from `data/mock.ts` established in Phase 1.

### Cut order (if running behind, drop from bottom up):
1. Client wiki page (P3 — stretch goal)
2. Meeting Notes page (P2)
3. Clients list page (P2 — keep just the bottom nav placeholder)
4. AI check-in drafts (P1 — keep gift suggestions)
5. Audio speed toggle (keep play/pause only)

---

## Mock Data: Sample Clients

**Client 1: Sarah Chen** — VP Finance at TechVentures. Hot. Met at FinTech Summit 2024. Family: 2 daughters (8, 12), husband is a software engineer. Holidays: Jul 2026 Osaka. Food: loves tiramisu, matcha. Hobbies: pilates, photography. Budget: $$$

**Client 2: Marcus Rivera** — CEO at GreenBuild Co. Warm. Met through mutual friend David. Family: wife, 1 son (3). Holidays: Dec 2026 Aspen. Food: steak, red wine. Hobbies: golf, hiking. Budget: $$

**Client 3: Priya Sharma** — CTO at DataFlow. Warm. Met at AI conference 2025. Family: single. Holidays: Aug 2026 Bali. Food: vegetarian, loves Thai. Hobbies: yoga, reading sci-fi. Budget: $$

**Client 4: James O'Brien** — Director at Meridian Capital. Cold (6 months no contact). Met via LinkedIn introduction. Family: married, no kids. Food: seafood, whisky. Hobbies: sailing, chess. Budget: $$$

**Client 5: Lisa Wong** — Founder at BrightPath Education. Hot. Met at a charity gala 2025. Family: 1 daughter (15). Holidays: None planned. Food: sushi, allergic to nuts. Hobbies: running, painting. Budget: $

**Birthday today:** Sarah Chen (May 9)
**Birthday upcoming:** Marcus Rivera (May 15)
