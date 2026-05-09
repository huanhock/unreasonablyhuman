import { todayCalendar } from '@/data/mock';

export default function CalendarCard() {
  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-teal-200 via-cyan-100 to-sky-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-teal-800 mb-4">📅 Calendar</h2>
      <div className="space-y-3">
        {todayCalendar.map((event, i) => (
          <div key={i} className="glass p-4">
            <p className="font-semibold text-[var(--color-warm-text)]">{event.title}</p>
            <p className="text-sm text-[var(--color-warm-text)]/70">{event.time} · {event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
