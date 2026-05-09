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

function PreferenceList({
  icon,
  title,
  items,
}: {
  icon: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl bg-white/45 p-3">
      <h3 className="font-semibold text-slate-800">
        {icon} {title}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-slate-500">Nothing saved yet.</p>
      )}
    </div>
  );
}

function MeetingCard({ meeting }: { meeting: MeetingNote }) {
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
            {meeting.followUps.map((followUp) => (
              <label
                key={followUp.task}
                className="flex items-start gap-3 rounded-xl bg-white/50 p-3"
              >
                <input
                  type="checkbox"
                  defaultChecked={followUp.done}
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

export default function ClientWikiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const client = clients.find((candidate) => candidate.id === id);

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
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusStyles[client.status]}`}
              >
                {client.status}
              </span>
            </div>
            <p className="mt-4 text-sm italic leading-6 text-slate-600">
              {client.howWeMet}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-4 space-y-4">
        <Section title="Needs">
          <p>{client.needs}</p>
        </Section>

        <Section title="How You've Helped">
          <p>{client.howHelped}</p>
        </Section>

        <Section title="Plans">
          <p>{client.plans}</p>
        </Section>

        <Section title="Preferences & Interests">
          <div className="space-y-3">
            <PreferenceList
              icon="👨‍👩‍👧‍👦"
              title="Family"
              items={client.preferences.family}
            />

            <div className="rounded-2xl bg-white/45 p-3">
              <h3 className="font-semibold text-slate-800">✈️ Holidays</h3>
              {client.preferences.holidays.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {client.preferences.holidays.map((holiday) => (
                    <li
                      key={`${holiday.date}-${holiday.destination}`}
                      className="text-slate-700"
                    >
                      {formatDate(holiday.date)} to {holiday.destination}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-slate-500">Nothing saved yet.</p>
              )}
            </div>

            <PreferenceList
              icon="🍽️"
              title="Food"
              items={client.preferences.food}
            />
            <PreferenceList
              icon="🎨"
              title="Hobbies"
              items={client.preferences.hobbies}
            />
          </div>
        </Section>

        <Section title="Budget">
          <div className="flex gap-2">
            {budgetTiers.map((tier) => (
              <button
                key={tier}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${
                  tier === client.budget
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
            {client.meetingHistory.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
