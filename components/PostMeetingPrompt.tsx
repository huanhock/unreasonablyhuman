'use client';

import { useState } from 'react';
import Link from 'next/link';
import { todayCalendar } from '@/data/mock';

function parseEventMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  const [, hourText, minuteText, periodText] = match;
  const period = periodText.toUpperCase();
  let hours = Number(hourText);
  const minutes = Number(minuteText);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }

  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function getClientNameFromTitle(title: string) {
  const parts = title.split('—');
  return parts[1]?.trim() || title;
}

export default function PostMeetingPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const recentEvent = todayCalendar
    .map((event) => ({
      ...event,
      eventMinutes: parseEventMinutes(event.time),
    }))
    .filter(
      (event) =>
        event.clientId &&
        event.eventMinutes !== null &&
        event.eventMinutes <= nowMinutes &&
        nowMinutes - event.eventMinutes <= 120
    )
    .sort((a, b) => (b.eventMinutes ?? 0) - (a.eventMinutes ?? 0))[0];

  if (dismissed || !recentEvent) {
    return null;
  }

  return (
    <div className="glass animate-fade-in-up bg-orange-50/80 p-4">
      <p className="text-base font-semibold text-[#1a1a2e]">
        Just finished meeting with {getClientNameFromTitle(recentEvent.title)}?
      </p>
      <div className="mt-3 flex gap-2">
        <Link
          href="/scan"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          📝 Capture Notes
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-white/80 transition hover:bg-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
