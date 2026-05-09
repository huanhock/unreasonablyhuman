'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Todo } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getTodos, toggleTodo, updateTodoTask } from '@/lib/db';

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const supabase = createClient();
    getTodos(supabase).then((data) => {
      setAllTasks(data);
      setLoading(false);
    });
  }, []);

  async function handleToggle(task: Todo) {
    if (!task.id) return;
    const newDone = !task.done;
    setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDone } : t));
    const supabase = createClient();
    await toggleTodo(supabase, task.id, newDone);
  }

  function startEditing(task: Todo) {
    if (!task.id) return;
    setEditingId(task.id);
    setEditText(task.task);
  }

  async function saveEdit(task: Todo) {
    if (!task.id || editText.trim() === task.task) {
      setEditingId(null);
      return;
    }
    const newText = editText.trim();
    setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, task: newText } : t));
    setEditingId(null);
    const supabase = createClient();
    await updateTodoTask(supabase, task.id, newText);
  }

  const filtered = allTasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  const pendingCount = allTasks.filter(t => !t.done).length;
  const completedCount = allTasks.filter(t => t.done).length;

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

      {loading ? (
        <div className="glass p-5 text-center text-sm text-slate-600 animate-pulse">
          Loading tasks...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => (
            <div
              key={t.id || `${t.task}-${i}`}
              className="glass animate-fade-in-up p-4"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => handleToggle(t)}
                  className="mt-1 size-4 rounded border-orange-200 accent-orange-500"
                />
                <div className="flex-1 min-w-0">
                  {editingId === t.id ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={() => saveEdit(t)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(t);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full font-semibold text-[#1a1a2e] bg-orange-50 border border-orange-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  ) : (
                    <p
                      onClick={() => startEditing(t)}
                      className={`font-semibold text-[#1a1a2e] cursor-pointer hover:text-orange-600 transition ${t.done ? 'line-through opacity-50' : ''}`}
                    >
                      {t.task}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Link
                      href={`/clients/${t.clientId}`}
                      className="text-sm text-orange-600 font-medium hover:underline"
                    >
                      {t.clientName}
                    </Link>
                    {t.suggestedTime && (
                      <>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">
                          Suggested: {t.suggestedTime}
                        </span>
                      </>
                    )}
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
      )}
    </div>
  );
}
