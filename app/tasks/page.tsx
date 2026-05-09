'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clients } from '@/data/mock';

interface TaskItem {
  task: string;
  done: boolean;
  clientId: string;
  clientName: string;
  fromMeetingDate: string;
  fromMeetingLocation: string;
}

function getAllTasks(): TaskItem[] {
  const tasks: TaskItem[] = [];
  for (const client of clients) {
    for (const meeting of client.meetingHistory) {
      for (const fu of meeting.followUps) {
        tasks.push({
          task: fu.task,
          done: fu.done,
          clientId: client.id,
          clientName: meeting.clientName,
          fromMeetingDate: meeting.date,
          fromMeetingLocation: meeting.location,
        });
      }
    }
  }
  return tasks;
}

export default function TasksPage() {
  const allTasks = getAllTasks();
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(allTasks.filter(t => t.done).map(t => t.task))
  );
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');

  function toggleTask(task: string) {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(task)) {
        next.delete(task);
      } else {
        next.add(task);
      }
      return next;
    });
  }

  const filtered = allTasks.filter(t => {
    if (filter === 'pending') return !completed.has(t.task);
    if (filter === 'completed') return completed.has(t.task);
    return true;
  });

  const pendingCount = allTasks.filter(t => !completed.has(t.task)).length;
  const completedCount = allTasks.filter(t => completed.has(t.task)).length;

  return (
    <div className="min-h-screen px-4 py-6">
      <header className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Action Items
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#1a1a2e]">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          {pendingCount} pending · {completedCount} completed
        </p>
      </header>

      <div className="flex gap-2 mb-5">
        {(['pending', 'completed', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-white/60 text-slate-600 ring-1 ring-white/80 hover:bg-white/80'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t, i) => (
          <div key={`${t.task}-${i}`} className="glass p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={completed.has(t.task)}
                onChange={() => toggleTask(t.task)}
                className="mt-1 size-4 rounded border-orange-200 accent-orange-500"
              />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-[#1a1a2e] ${completed.has(t.task) ? 'line-through opacity-50' : ''}`}>
                  {t.task}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Link
                    href={`/clients/${t.clientId}`}
                    className="text-sm text-orange-600 font-medium hover:underline"
                  >
                    {t.clientName}
                  </Link>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">
                    From {new Date(t.fromMeetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass p-5 text-center text-sm text-slate-600">
            {filter === 'pending' ? 'All caught up! No pending tasks.' : 'No completed tasks yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
