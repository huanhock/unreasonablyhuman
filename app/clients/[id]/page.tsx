'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import type { Client, MeetingNote } from '@/data/mock';
import { clients } from '@/data/mock';

const statusStyles: Record<Client['status'], string> = {
  cold: 'bg-rose-100 text-rose-700 ring-rose-200',
  warm: 'bg-amber-100 text-amber-700 ring-amber-200',
  hot: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
};

const budgetTiers: Client['budget'][] = ['$', '$$', '$$$'];
const statusCycle: Client['status'][] = ['cold', 'warm', 'hot'];

const smallTalkLabels = [
  ['family', 'Family', '👨‍👩‍👧‍👦'],
  ['holidays', 'Holidays', '✈️'],
  ['food', 'Food', '🍽️'],
  ['hobbies', 'Hobbies', '🎨'],
] as const;

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass p-4">
      <h2 className="text-lg font-bold text-[#1a1a2e]">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}

function EditableTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      className="min-h-24 w-full resize-none rounded-2xl border border-white/70 bg-white/45 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white/65 focus:ring-4 focus:ring-orange-100"
    />
  );
}

function EditablePreferenceList({
  icon,
  title,
  items,
  onChange,
}: {
  icon: string;
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function updateItem(index: number, value: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="rounded-2xl bg-white/45 p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-800">
          {icon} {title}
        </h3>
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700 ring-1 ring-orange-200 transition hover:bg-orange-200"
          aria-label={`Add ${title.toLowerCase()} item`}
        >
          +
        </button>
      </div>

      {items.length > 0 ? (
        <div className="mt-2 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(event) => updateItem(index, event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-white/70 bg-white/55 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/65 text-sm font-bold text-rose-500 ring-1 ring-rose-100 transition hover:bg-rose-50"
                aria-label={`Remove ${title.toLowerCase()} item`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-slate-500">Nothing saved yet.</p>
      )}
    </div>
  );
}

function EditableHolidays({
  holidays,
  onChange,
}: {
  holidays: Client['preferences']['holidays'];
  onChange: (holidays: Client['preferences']['holidays']) => void;
}) {
  function updateHoliday(
    index: number,
    field: 'date' | 'destination',
    value: string
  ) {
    onChange(
      holidays.map((holiday, holidayIndex) =>
        holidayIndex === index ? { ...holiday, [field]: value } : holiday
      )
    );
  }

  function removeHoliday(index: number) {
    onChange(holidays.filter((_, holidayIndex) => holidayIndex !== index));
  }

  return (
    <div className="rounded-2xl bg-white/45 p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-800">✈️ Holidays</h3>
        <button
          type="button"
          onClick={() => onChange([...holidays, { date: '', destination: '' }])}
          className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700 ring-1 ring-orange-200 transition hover:bg-orange-200"
          aria-label="Add holiday"
        >
          +
        </button>
      </div>

      {holidays.length > 0 ? (
        <div className="mt-2 space-y-2">
          {holidays.map((holiday, index) => (
            <div
              key={index}
              className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_auto] items-center gap-2"
            >
              <input
                type="date"
                value={holiday.date}
                onChange={(event) =>
                  updateHoliday(index, 'date', event.target.value)
                }
                className="min-w-0 rounded-xl border border-white/70 bg-white/55 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
              <input
                value={holiday.destination}
                onChange={(event) =>
                  updateHoliday(index, 'destination', event.target.value)
                }
                placeholder="Destination"
                className="min-w-0 rounded-xl border border-white/70 bg-white/55 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => removeHoliday(index)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/65 text-sm font-bold text-rose-500 ring-1 ring-rose-100 transition hover:bg-rose-50"
                aria-label="Remove holiday"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-slate-500">Nothing saved yet.</p>
      )}
    </div>
  );
}

function MeetingCard({
  meeting,
  meetingIndex,
  onToggleFollowUp,
}: {
  meeting: MeetingNote;
  meetingIndex: number;
  onToggleFollowUp: (
    meetingIndex: number,
    followUpIndex: number,
    done: boolean
  ) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const smallTalk = smallTalkLabels.filter(([key]) => meeting.smallTalk[key]);

  return (
    <article className="overflow-hidden rounded-2xl bg-white/45 ring-1 ring-white/60">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full p-3 text-left transition hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-300"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-[#1a1a2e]">
              {formatDate(meeting.date)}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{meeting.location}</p>
          </div>
          <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            {meeting.followUps.length} follow-up
            {meeting.followUps.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {meeting.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-white/65 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {topic}
            </span>
          ))}
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-white/70 p-3">
          <div className="space-y-2">
            {meeting.followUps.map((followUp, followUpIndex) => (
              <label
                key={followUp.task}
                className="flex items-start gap-3 rounded-xl bg-white/50 p-3"
              >
                <input
                  type="checkbox"
                  checked={followUp.done}
                  onChange={(event) =>
                    onToggleFollowUp(
                      meetingIndex,
                      followUpIndex,
                      event.target.checked
                    )
                  }
                  className="mt-0.5 size-4 rounded border-orange-200 accent-orange-500"
                />
                <span className="text-sm text-slate-700">{followUp.task}</span>
              </label>
            ))}
          </div>

          {smallTalk.length > 0 ? (
            <div className="mt-3 space-y-2">
              {smallTalk.map(([key, label, icon]) => (
                <p
                  key={key}
                  className="rounded-xl bg-white/50 p-3 text-sm text-slate-700"
                >
                  <span className="font-semibold text-slate-800">
                    {icon} {label}:{' '}
                  </span>
                  {meeting.smallTalk[key]}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function MeetingPrepButton({
  client,
  needs,
  howHelped,
  plans,
  preferences,
  meetingHistory,
}: {
  client: Client;
  needs: string;
  howHelped: string;
  plans: string;
  preferences: Client['preferences'];
  meetingHistory: MeetingNote[];
}) {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePrepare() {
    setLoading(true);
    try {
      const res = await fetch('/api/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          company: client.company,
          needs,
          howHelped,
          plans,
          preferences,
          meetingHistory: meetingHistory.slice(0, 3),
        }),
      });
      const data = await res.json();
      setBrief(data.brief);
    } catch {
      setBrief('Could not generate meeting prep. Please try again.');
    }
    setLoading(false);
  }

  return (
    <section className="glass p-4 bg-gradient-to-r from-orange-50 to-amber-50">
      {brief ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#1a1a2e]">✨ Meeting Prep</h2>
            <button
              onClick={() => setBrief(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Dismiss
            </button>
          </div>
          <p className="text-sm leading-6 text-slate-700 whitespace-pre-line">{brief}</p>
        </div>
      ) : (
        <button
          onClick={handlePrepare}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl font-semibold text-base hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? '✨ Preparing brief...' : '✨ Prepare for Meeting with AI'}
        </button>
      )}
    </section>
  );
}

export default function ClientWikiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const client = clients.find((candidate) => candidate.id === id);
  const [status, setStatus] = useState<Client['status']>(
    client?.status ?? 'warm'
  );
  const [howWeMet, setHowWeMet] = useState(client?.howWeMet ?? '');
  const [needs, setNeeds] = useState(client?.needs ?? '');
  const [howHelped, setHowHelped] = useState(client?.howHelped ?? '');
  const [plans, setPlans] = useState(client?.plans ?? '');
  const [preferences, setPreferences] = useState<Client['preferences']>(
    client?.preferences ?? { family: [], holidays: [], food: [], hobbies: [] }
  );
  const [budget, setBudget] = useState<Client['budget']>(
    client?.budget ?? '$$'
  );
  const [meetingHistory, setMeetingHistory] = useState<MeetingNote[]>(
    client?.meetingHistory.map((meeting) => ({
      ...meeting,
      followUps: meeting.followUps.map((followUp) => ({ ...followUp })),
      smallTalk: { ...meeting.smallTalk },
      topics: [...meeting.topics],
    })) ?? []
  );

  const pendingFollowUps = meetingHistory.flatMap((meeting, meetingIndex) =>
    meeting.followUps
      .map((followUp, followUpIndex) => ({
        ...followUp,
        followUpIndex,
        meetingIndex,
        meetingDate: meeting.date,
        meetingLocation: meeting.location,
      }))
      .filter((followUp) => !followUp.done)
  );

  function cycleStatus() {
    const currentIndex = statusCycle.indexOf(status);
    setStatus(statusCycle[(currentIndex + 1) % statusCycle.length]);
  }

  function updatePreferenceList(
    key: 'family' | 'food' | 'hobbies',
    items: string[]
  ) {
    setPreferences((current) => ({ ...current, [key]: items }));
  }

  function toggleFollowUp(
    meetingIndex: number,
    followUpIndex: number,
    done: boolean
  ) {
    setMeetingHistory((current) =>
      current.map((meeting, currentMeetingIndex) =>
        currentMeetingIndex === meetingIndex
          ? {
              ...meeting,
              followUps: meeting.followUps.map((followUp, currentFollowUpIndex) =>
                currentFollowUpIndex === followUpIndex
                  ? { ...followUp, done }
                  : followUp
              ),
            }
          : meeting
      )
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen px-4 py-6">
        <Link
          href="/clients"
          className="inline-flex rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-orange-700 ring-1 ring-orange-100"
        >
          Back to clients
        </Link>
        <div className="glass mt-6 p-6 text-center">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            Client not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This profile does not match any saved client.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <Link
        href="/clients"
        className="inline-flex rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-orange-700 ring-1 ring-orange-100 transition hover:bg-orange-50"
      >
        Back to clients
      </Link>

      <header className="glass mt-4 p-5">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 via-rose-300 to-amber-200 text-lg font-bold text-white shadow-sm">
            {getInitials(client.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold leading-tight text-[#1a1a2e]">
                  {client.name}
                </h1>
                <p className="mt-1 text-base text-slate-600">
                  {client.company}
                </p>
              </div>
              <button
                type="button"
                onClick={cycleStatus}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 transition hover:scale-105 ${statusStyles[status]}`}
              >
                {status}
              </button>
            </div>
            <input
              value={howWeMet}
              onChange={(event) => setHowWeMet(event.target.value)}
              className="mt-4 w-full rounded-xl border border-white/60 bg-white/40 px-3 py-2 text-sm italic leading-6 text-slate-600 outline-none transition focus:border-orange-300 focus:bg-white/65 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>
      </header>

      <div className="mt-4 space-y-4">
        <MeetingPrepButton
          client={client}
          needs={needs}
          howHelped={howHelped}
          plans={plans}
          preferences={preferences}
          meetingHistory={meetingHistory}
        />

        {pendingFollowUps.length > 0 ? (
          <section className="glass border-orange-200 bg-orange-50/70 p-4">
            <h2 className="text-lg font-bold text-[#1a1a2e]">
              Pending Follow-ups
            </h2>
            <div className="mt-3 space-y-2">
              {pendingFollowUps.map((followUp) => (
                <label
                  key={`${followUp.meetingIndex}-${followUp.followUpIndex}-${followUp.task}`}
                  className="flex items-start gap-3 rounded-2xl bg-white/65 p-3"
                >
                  <input
                    type="checkbox"
                    checked={followUp.done}
                    onChange={(event) =>
                      toggleFollowUp(
                        followUp.meetingIndex,
                        followUp.followUpIndex,
                        event.target.checked
                      )
                    }
                    className="mt-0.5 size-4 rounded border-orange-200 accent-orange-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-800">
                      {followUp.task}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {formatDate(followUp.meetingDate)} ·{' '}
                      {followUp.meetingLocation}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ) : null}

        <Section title="Needs">
          <EditableTextarea value={needs} onChange={setNeeds} />
        </Section>

        <Section title="How You've Helped">
          <EditableTextarea value={howHelped} onChange={setHowHelped} />
        </Section>

        <Section title="Plans">
          <EditableTextarea value={plans} onChange={setPlans} />
        </Section>

        <Section title="Preferences & Interests">
          <div className="space-y-3">
            <EditablePreferenceList
              icon="👨‍👩‍👧‍👦"
              title="Family"
              items={preferences.family}
              onChange={(items) => updatePreferenceList('family', items)}
            />

            <EditableHolidays
              holidays={preferences.holidays}
              onChange={(holidays) =>
                setPreferences((current) => ({ ...current, holidays }))
              }
            />

            <EditablePreferenceList
              icon="🍽️"
              title="Food"
              items={preferences.food}
              onChange={(items) => updatePreferenceList('food', items)}
            />
            <EditablePreferenceList
              icon="🎨"
              title="Hobbies"
              items={preferences.hobbies}
              onChange={(items) => updatePreferenceList('hobbies', items)}
            />
          </div>
        </Section>

        <Section title="Budget">
          <div className="flex gap-2">
            {budgetTiers.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setBudget(tier)}
                className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${
                  tier === budget
                    ? 'bg-orange-500 text-white ring-orange-500'
                    : 'bg-white/60 text-slate-600 ring-white/80'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Meeting History">
          <div className="space-y-3">
            {meetingHistory.map((meeting, meetingIndex) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                meetingIndex={meetingIndex}
                onToggleFollowUp={toggleFollowUp}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
